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

export class LocalProvider implements ExecutionProvider {
  readonly name = "Local";

  private readonly defaultTimeoutMs: number;

  constructor(defaultTimeoutMs = 10000) {
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResponse> {
    const lang = request.language as InternalLanguageKey;
    const timeoutMs = request.timeoutMs ?? this.defaultTimeoutMs;
    const id = randomUUID();
    const tempDir = path.join(os.tmpdir(), `playcode_${id}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const startTime = Date.now();

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

      if (lang === "cpp") {
        const srcPath = path.join(tempDir, "solution.cpp");
        const outPath = path.join(tempDir, "solution.exe");
        fs.writeFileSync(srcPath, request.code, "utf-8");

        // Compile
        const compileRes = await this.runProcess("g++", [srcPath, "-O2", "-o", outPath], "", tempDir, 10000);
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

        return await this.runProcess(outPath, [], request.stdin, tempDir, timeoutMs);
      }

      if (lang === "java") {
        const srcPath = path.join(tempDir, "Main.java");
        fs.writeFileSync(srcPath, request.code, "utf-8");

        // Compile
        const compileRes = await this.runProcess("javac", [srcPath], "", tempDir, 10000);
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

        return await this.runProcess("java", ["-cp", tempDir, "Main"], request.stdin, tempDir, timeoutMs);
      }

      throw new Error(`Local execution is not supported for ${lang}. Please install runtime or configure an external provider.`);
    } finally {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup failure
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

      const child = spawn(cmd, args, {
        cwd,
        windowsHide: true,
        stdio: ["pipe", "pipe", "pipe"],
      });

      const timer = setTimeout(() => {
        timedOut = true;
        try {
          child.kill();
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
