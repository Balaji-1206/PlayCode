import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { randomUUID, createHash } from "crypto";
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

function getLocalBuildDir(subPath: string): string {
  // Use .playcode_cache within project to prevent Windows Device Guard/AppLocker from blocking execution in os.tmpdir()
  const baseDir = path.join(process.cwd(), ".playcode_cache");
  const fullDir = path.join(baseDir, subPath);
  fs.mkdirSync(fullDir, { recursive: true });
  return fullDir;
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
      const hash = createHash("sha256").update(request.code).digest("hex");
      const cached = compilationCache.get(hash);

      if (cached && fs.existsSync(cached.binaryPath)) {
        return await this.runProcess(cached.binaryPath, [], request.stdin, cached.dir, timeoutMs);
      }

      const buildDir = getLocalBuildDir(`cpp_${hash.slice(0, 12)}`);
      const srcPath = path.join(buildDir, "solution.cpp");
      const outPath = path.join(buildDir, process.platform === "win32" ? "solution.exe" : "solution");
      fs.writeFileSync(srcPath, request.code, "utf-8");

      const compileRes = await this.runProcess(
        "g++",
        [srcPath, "-O2", "-static-libgcc", "-static-libstdc++", "-o", outPath],
        "",
        buildDir,
        10000
      );
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
      const hash = createHash("sha256").update(request.code).digest("hex");
      const cached = compilationCache.get(hash);

      // In Java, if a public class exists, the file MUST be named after it.
      // Otherwise, find the class that defines public static void main.
      let mainClassName = "Main";
      const publicClassMatch = request.code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      if (publicClassMatch) {
        mainClassName = publicClassMatch[1];
      } else {
        const classMatches = [...request.code.matchAll(/class\s+([A-Za-z0-9_]+)[^{]*\{([\s\S]*?)(?=\n\s*(?:public\s+)?class|\s*$)/g)];
        for (const cm of classMatches) {
          if (cm[2] && cm[2].includes("public static void main")) {
            mainClassName = cm[1];
            break;
          }
        }
      }

      if (cached && fs.existsSync(cached.binaryPath)) {
        return await this.runProcess("java", ["-cp", cached.dir, mainClassName], request.stdin, cached.dir, timeoutMs);
      }

      const buildDir = getLocalBuildDir(`java_${hash.slice(0, 12)}`);
      const srcPath = path.join(buildDir, `${mainClassName}.java`);
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
        binaryPath: path.join(buildDir, `${mainClassName}.class`),
        dir: buildDir,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      return await this.runProcess("java", ["-cp", buildDir, mainClassName], request.stdin, buildDir, timeoutMs);
    }

    // ── Scripting languages (temp file per run) ──────────────────────────────
    const id = randomUUID();
    const tempDir = getLocalBuildDir(`script_${id}`);

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

      return {
        stdout: "",
        stderr: `Local runtime for "${lang}" is not installed or configured on this machine. Please install ${lang} or set EXECUTION_PROVIDER=piston in .env.local.`,
        exitCode: 1,
        timedOut: false,
        executionTime: Date.now() - startTime,
        memoryMb: 0,
      };
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
      // Prepend compiler directories (e.g. MSYS2 MinGW) to PATH so subtools and DLLs resolve.
      const msysPaths = ["C:\\msys64\\ucrt64\\bin", "C:\\msys64\\mingw64\\bin"];
      const detectedExtra = msysPaths.filter((p) => {
        try {
          return fs.existsSync(/*turbopackIgnore: true*/ p);
        } catch {
          return false;
        }
      });
      const extraPathStr = [process.env.CXX_COMPILER_PATH, ...detectedExtra]
        .filter(Boolean)
        .join(process.platform === "win32" ? ";" : ":");

      const sanitizedEnv: NodeJS.ProcessEnv = {
        PATH: extraPathStr
          ? `${extraPathStr}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`
          : process.env.PATH ?? "",
        PATHEXT: process.env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD",
        SYSTEMROOT: process.env.SYSTEMROOT ?? "",
        WINDIR: process.env.WINDIR ?? "",
        TEMP: cwd,
        TMP: cwd,
        SystemDrive: process.env.SystemDrive ?? "C:",
        USERPROFILE: process.env.USERPROFILE ?? "",
        LOCALAPPDATA: process.env.LOCALAPPDATA ?? "",
        APPDATA: process.env.APPDATA ?? "",
        COMSPEC: process.env.COMSPEC ?? "cmd.exe",
        ALLUSERSPROFILE: process.env.ALLUSERSPROFILE ?? "",
        ProgramData: process.env.ProgramData ?? "",
        NODE_ENV: "development",
      };

      let child;
      try {
        child = spawn(cmd, args, {
          cwd,
          windowsHide: true,
          env: sanitizedEnv,
          stdio: "pipe",
        });
      } catch (spawnErr) {
        const msg = spawnErr instanceof Error ? spawnErr.message : String(spawnErr);
        return resolve({
          stdout: "",
          stderr: `Failed to spawn process "${cmd}": ${msg}`,
          exitCode: 1,
          timedOut: false,
          executionTime: Date.now() - procStart,
          memoryMb: 0,
        });
      }

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
