import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import type {
  ExecutionProvider,
  ExecutionRequest,
  ExecutionResponse,
  InternalLanguageKey,
} from "./types";

// ─── Local Provider ───────────────────────────────────────────────────────────
// Executes user code using locally installed runtimes (Python, Node, g++, Java).
// Provides ultra-fast execution (<50ms) and works offline with zero API limits.

// ─── Compilation cache ────────────────────────────────────────────────────────
// Compiles C++ and Java code once per code version, allowing multiple test cases
// to run against the pre-compiled binary in <20ms each rather than re-compiling.

const compilationCache = new Map<
  string,
  { binaryPath: string; dir: string; expiresAt: number }
>();

function cleanExpiredBinaries() {
  const now = Date.now();
  for (const [hash, entry] of compilationCache.entries()) {
    if (now > entry.expiresAt) {
      try {
        fs.rmSync(entry.dir, { recursive: true, force: true });
      } catch {
        // ignore
      }
      compilationCache.delete(hash);
    }
  }
}

export class LocalProvider implements ExecutionProvider {
  readonly name = "Local";

  private readonly defaultTimeoutMs: number;

  constructor(defaultTimeoutMs = 10000) {
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResponse> {
    const lang = request.language as InternalLanguageKey;
    const timeoutMs = request.timeoutMs ?? this.defaultTimeoutMs;
    cleanExpiredBinaries();

    const startTime = Date.now();

    // ── C++ (compiled with caching) ──────────────────────────────────────────
    if (lang === "cpp") {
      const { createHash } = await import("crypto");
      const hash = createHash("sha256").update(request.code).digest("hex");
      const cached = compilationCache.get(hash);

      if (cached && fs.existsSync(cached.binaryPath)) {
        return await this.runProcess(cached.binaryPath, [], request.stdin, cached.dir, timeoutMs);
      }

      const buildDir = path.join(os.tmpdir(), `playcode_cpp_${hash.slice(0, 12)}`);
      fs.mkdirSync(buildDir, { recursive: true });
      const srcPath = path.join(buildDir, "solution.cpp");
      const outPath = path.join(buildDir, "solution.exe");
      fs.writeFileSync(srcPath, request.code, "utf-8");

      const compileRes = await this.runProcess("g++", [srcPath, "-O2", "-o", outPath], "", buildDir, 10000);
      if (compileRes.exitCode !== 0) {
        return {
          stdout: "",
          stderr: compileRes.stderr || "C++ compilation failed",
          exitCode: compileRes.exitCode,
          timedOut: false,
          executionTime: Date.now() - startTime,
          memoryMb: 0,
        };
      }

      compilationCache.set(hash, {
        binaryPath: outPath,
        dir: buildDir,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      return await this.runProcess(outPath, [], request.stdin, buildDir, timeoutMs);
    }

    // ── Java (compiled with caching) ─────────────────────────────────────────
    if (lang === "java") {
      const { createHash } = await import("crypto");
      const hash = createHash("sha256").update(request.code).digest("hex");
      const cached = compilationCache.get(hash);

      if (cached && fs.existsSync(cached.binaryPath)) {
        return await this.runProcess("java", ["-cp", cached.dir, "Main"], request.stdin, cached.dir, timeoutMs);
      }

      const buildDir = path.join(os.tmpdir(), `playcode_java_${hash.slice(0, 12)}`);
      fs.mkdirSync(buildDir, { recursive: true });
      const srcPath = path.join(buildDir, "Main.java");
      fs.writeFileSync(srcPath, request.code, "utf-8");

      const compileRes = await this.runProcess("javac", [srcPath], "", buildDir, 10000);
      if (compileRes.exitCode !== 0) {
        return {
          stdout: "",
          stderr: compileRes.stderr || "Java compilation failed",
          exitCode: compileRes.exitCode,
          timedOut: false,
          executionTime: Date.now() - startTime,
          memoryMb: 0,
        };
      }

      compilationCache.set(hash, {
        binaryPath: path.join(buildDir, "Main.class"),
        dir: buildDir,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      return await this.runProcess("java", ["-cp", buildDir, "Main"], request.stdin, buildDir, timeoutMs);
    }

    // ── Scripting languages (temp file per run) ──────────────────────────────
    const id = randomUUID();
    const tempDir = path.join(os.tmpdir(), `playcode_${id}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      if (lang === "python") {
        const filePath = path.join(tempDir, "solution.py");
        fs.writeFileSync(filePath, request.code, "utf-8");
        return await this.runProcess("python", [filePath], request.stdin, tempDir, timeoutMs);
      }

      if (lang === "javascript") {
        const filePath = path.join(tempDir, "solution.js");
        fs.writeFileSync(filePath, request.code, "utf-8");
        return await this.runProcess("node", [filePath], request.stdin, tempDir, timeoutMs);
      }

      throw new Error(`Local execution is not supported for ${lang}. Please install runtime or configure an external provider.`);
    } finally {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  }

  private runProcess(
    cmd: string,
    args: string[],
    stdinInput: string,
    cwd: string,
    timeoutMs: number
  ): Promise<ExecutionResponse> {
    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let timedOut = false;
      const procStart = Date.now();

      // Build a minimal, sanitized environment for local execution.
      // NEVER leak API keys (GEMINI_API_KEY, OPENAI_API_KEY) or host secrets.
      const sanitizedEnv: NodeJS.ProcessEnv = {
        PATH: process.env.CXX_COMPILER_PATH
          ? `${process.env.CXX_COMPILER_PATH};${process.env.PATH ?? ""}`
          : process.env.PATH ?? "",
        SYSTEMROOT: process.env.SYSTEMROOT ?? "",
        WINDIR: process.env.WINDIR ?? "",
        TEMP: cwd,
        TMP: cwd,
        NODE_ENV: "development",
      };

      const child = spawn(cmd, args, {
        cwd,
        windowsHide: true,
        env: sanitizedEnv,
        stdio: "pipe",
      });

      const timer = setTimeout(() => {
        timedOut = true;
        try {
          if (process.platform === "win32" && child.pid) {
            spawn("taskkill", ["/pid", child.pid.toString(), "/T", "/F"], { windowsHide: true });
          } else {
            child.kill("SIGKILL");
          }
        } catch {
          // ignore
        }
      }, timeoutMs);

      if (stdinInput) {
        child.stdin.write(stdinInput);
      }
      child.stdin.end();

      child.stdout.on("data", (chunk: Buffer) => {
        if (stdout.length < 100000) {
          stdout += chunk.toString("utf-8");
        }
      });

      child.stderr.on("data", (chunk: Buffer) => {
        if (stderr.length < 100000) {
          stderr += chunk.toString("utf-8");
        }
      });

      child.on("error", (err: Error) => {
        clearTimeout(timer);
        resolve({
          stdout: "",
          stderr: err.message,
          exitCode: 1,
          timedOut: false,
          executionTime: Date.now() - procStart,
          memoryMb: 0,
        });
      });

      child.on("close", (code: number | null) => {
        clearTimeout(timer);
        resolve({
          stdout,
          stderr,
          exitCode: timedOut ? 1 : (code ?? 0),
          timedOut,
          executionTime: Date.now() - procStart,
          memoryMb: 0,
        });
      });
    });
  }
}

export const localProvider = new LocalProvider();
