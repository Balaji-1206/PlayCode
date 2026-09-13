# PlayCode — AI-Powered DSA Coding Playground

PlayCode is a modern, high-performance Data Structures & Algorithms (DSA) coding playground. It bridges the gap between studying algorithmic problems and practicing them inside a responsive, multi-language coding environment.

Paste any raw DSA problem statement, and PlayCode's AI engine instantly structures the problem, generates public and hidden test cases, produces starter code across 6 programming languages, and launches an isolated coding playground with delimited test grading and complexity analysis.

---

## 🌟 Key Features

- 🧠 **AI Problem Parser & Auto-Structuring**
  - Transforms unstructured, pasted problem descriptions into structured specifications with constraints, examples, function signatures, and edge-case test suites.
  - Powered by Google Gemini with catalog fallback for instant offline practice.

- 💻 **Multi-Language Monaco Playground**
  - Full-featured VS Code-style coding experience supporting **Python, C++, Java, JavaScript, Go, and Rust**.
  - Includes syntax highlighting, bracket matching, hotkeys (`Ctrl/Cmd + Enter` to run, `Ctrl/Cmd + S` to save, `Ctrl/Cmd + K` for problem directory), and integrated code formatting.

- 🛡️ **Hardened & Delimited Code Execution**
  - Separates user debug statements (`print()`, `console.log`) from official return outputs using deterministic output delimiters (`__PLAYCODE_RESULT_START__` / `__PLAYCODE_RESULT_END__`).
  - Isolated cloud execution via sandboxed execution engines (Piston / Judge0).
  - Sanitized process environment to guarantee zero host secret leakage.

- 🔗 **Built-in Standard DSA Definitions**
  - Seamless, out-of-the-box support for linked lists (`ListNode`) and binary trees (`TreeNode`) across all 6 supported languages, including serialization and deserialization helpers.

- 🧪 **Custom Test Inputs & Failure Transparency**
  - Dedicated **+ Custom** test tab allowing arbitrary stdin execution with real-time diffs.
  - Test failure transparency: inspect the exact input, expected output, and actual output for failed hidden test cases upon submission.

- 📊 **Streamlined AI Complexity Analysis**
  - One-click complexity inspection providing a direct comparison between your code's Time/Space Complexity and optimal expected Big-O metrics.

- 🎨 **Modern "Breeze" Light & Dark Theme**
  - Designed with an airy, distraction-free aesthetic inspired by developer tools like Linear and Vercel.
  - Smooth 1-click Light/Dark mode switcher with persistent preference.

- 💾 **Client & Server Persistence**
  - Non-destructive language switching preserves edits across all languages (`codeByLanguage`).
  - Debounced `localStorage` draft saving prevents accidental progress loss.
  - Upstash Redis session caching with HTTP 410 handling on session expiry.

- 🚦 **Production Rate Limiting**
  - Sliding-window rate limiters across `/api/code/execute`, `/api/problems/parse`, and `/api/code/analyze` to protect against abuse and API exhaustion.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & State**: React, [Zustand](https://github.com/pmndrs/zustand), [Tailwind CSS](https://tailwindcss.com/), Lucide Icons
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`) via `@google/generative-ai`
- **Execution Sandboxing**: [Piston](https://github.com/engineer-man/piston) / [Judge0](https://judge0.com/)
- **Session Cache**: [Upstash Redis](https://upstash.com/) (REST API) with in-memory fallback

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.17.0 or newer)
- npm, pnpm, or yarn
- A [Google Gemini API Key](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/playcode.git
   cd playcode/dsa-playground
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root of the project by copying `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your configuration:
   ```env
   # Required: Google Gemini API Key for problem parsing and complexity analysis
   GEMINI_API_KEY="your-gemini-api-key-here"

   # Optional: Execution Provider ("piston" [default], "judge0", or "local")
   EXECUTION_PROVIDER="piston"

   # Optional: Upstash Redis for distributed serverless session caching
   UPSTASH_REDIS_REST_URL=""
   UPSTASH_REDIS_REST_TOKEN=""
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite covering security boundaries, output delimiter parsing, DSA injection, session caching, and rate limiting:

```bash
# Run test suite
npm test

# Run linter
npm run lint

# Run production build
npm run build
```

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── code/
│   │   │   ├── analyze/     # AI Time & Space Complexity analysis endpoint
│   │   │   └── execute/     # Delimited code runner & test evaluation endpoint
│   │   └── problems/
│   │       └── parse/       # AI problem statement parser endpoint
│   ├── globals.css          # CSS variables & "Breeze" theme design system
│   ├── layout.tsx           # App root layout with theme provider
│   └── page.tsx             # Main entry point (Parser / Playground switcher)
├── components/
│   ├── modals/              # Problem Directory (Ctrl+K), Shortcuts modals
│   ├── navbar/              # Navigation bar, Theme switcher, Directory trigger
│   ├── parser/              # Problem input form, examples, and catalog loader
│   └── playground/          # Monaco editor, Terminal, Test cases, Complexity panel
├── lib/
│   ├── dsa/                 # ListNode & TreeNode definitions for all 6 languages
│   ├── execution/           # Execution providers (Piston, Judge0, Local sandbox)
│   ├── schemas/             # Zod validation schemas for problem structure
│   ├── problemCatalog.ts    # Built-in catalog problems (Two Sum, Parentheses, etc.)
│   ├── rateLimit.ts         # In-memory sliding window rate limiter
│   └── serverCache.ts       # Server-side hidden test case & driver code storage
└── stores/
    └── playgroundStore.ts   # Zustand store with language persistence & auto-save
```

---

## 🔒 Security & Sandboxing Architecture

- **Isolated Execution**: Untrusted code is evaluated in isolated cloud environments (Piston / Judge0). The host machine never executes user submissions by default.
- **Environment Scrubbing**: Secrets, API keys, and environment variables are scrubbed and never forwarded to compilation subshells.
- **Hidden Test Case Confidentiality**: Hidden test cases and driver harnesses are stored and evaluated server-side, never transmitted to client browsers.
- **Fail-Fast Safeguards**: Time limits and early termination protect system resources against infinite loops and heavy compile errors.

---

## 📄 License

This project is licensed under the MIT License.
