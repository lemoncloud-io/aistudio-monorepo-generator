# 🚀 AIStudio Monorepo Generator

> Transform Google AIStudio React apps into production-ready monorepo in 5 minutes

[![npm version](https://img.shields.io/npm/v/@lemoncloud-io/aistudio-monorepo-generator.svg)](https://www.npmjs.com/package/@lemoncloud-io/aistudio-monorepo-generator)
[![Downloads](https://img.shields.io/npm/dm/@lemoncloud-io/aistudio-monorepo-generator.svg)](https://www.npmjs.com/package/@lemoncloud-io/aistudio-monorepo-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/lemoncloud-io/aistudio-monorepo-generator.svg?style=social&label=Star)](https://github.com/lemoncloud-io/aistudio-monorepo-generator)

**mono-gen** is an AI-powered CLI tool that automatically converts Google AIStudio React apps into production-ready monorepo architecture with secure backend API and optimized frontend.

**[📦 Install](#-installation)** • **[🚀 Quick Start](#-quick-start)** • **[📖 Docs](https://aistudio-monorepo-generator.dev)** • **[💬 Community](https://discord.gg/aistudio-mono-gen)**

---

## 🎯 Why?

### The Problem

Google AIStudio makes prototyping AI apps easy, but the generated code has issues:

- ❌ **API keys exposed** in client-side code (security risk)
- ❌ **Flat structure** - everything in one React app
- ❌ **Not production-ready** - no backend/API separation
- ❌ **Hard to scale** and deploy securely

### The Solution

```text
AIStudio App        mono-gen          Production Monorepo
┌──────────┐            →             ┌──────────────┐
│ Single   │                          │ apps/        │
│ React    │                          │ ├── backend/ │
│ + API    │                          │ └── frontend/│
│ (unsafe) │                          │ (serverless) │
└──────────┘                          └──────────────┘
  4-8 hours           5 minutes        Secure & Ready
```

**mono-gen** transforms your prototype into a professional monorepo:

✅ Automatic backend/frontend separation
✅ Secure API key management (server-side)
✅ Modern monorepo structure (npm workspace)
✅ AI-powered refactoring (Gemini 2.5-pro)
✅ Production-ready architecture

---

## ✨ Features

### 🤖 AI-Powered Refactoring

- Gemini 2.5-pro analyzes and transforms your TypeScript/React code
- Automatically converts client API calls to secure server endpoints
- Maintains your code style and logic

### 🔒 Security First

- Moves Gemini API keys from browser to secure backend
- Creates authenticated REST API endpoints
- Environment variable management included

### 📦 Monorepo Architecture

- npm workspace configuration
- Shared dependencies optimization
- Independent deployment (backend + frontend)

### ⚡ Fast & Easy

- One command transformation
- 5-10 minutes average (vs 4-8 hours manual)
- Dry-run mode available

---

## 📦 Installation

**Global (recommended):**

```bash
npm install -g @lemoncloud-io/aistudio-monorepo-generator
```

**Or use npx (no install):**

```bash
npx @lemoncloud-io/aistudio-monorepo-generator generate --input ./my-app.zip
```

---

## 🚀 Quick Start

### 1. Export from AIStudio

1. Open [Google AIStudio](https://aistudio.google.com/)
2. Export your React project as ZIP
3. Save locally (e.g., `my-app.zip`)

### 2. Set API Key

```bash
export GEMINI_API_KEY=your-api-key-here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 3. Transform

```bash
# Basic usage
mono-gen generate --input ./my-app.zip --output ./my-monorepo

# Interactive mode
mono-gen generate --interactive

# Preview changes (dry-run)
mono-gen generate --input ./my-app.zip --dry-run
```

### 4. Run

```bash
cd my-monorepo
npm install

# Terminal 1: Backend (port 8000)
npm run backend

# Terminal 2: Frontend (port 3000)
npm run frontend
```

**Done!** Your app now runs with secure backend API at `http://localhost:8000` and frontend at `http://localhost:3000`

---

## 📖 CLI Commands

### `generate` - Transform AIStudio app

```bash
mono-gen generate [options]

Options:
  -i, --input <path>      Input ZIP file
  -o, --output <path>     Output directory
  -t, --template <name>   Template (default|minimal|serverless)
  --dry-run               Preview without changes
  --interactive           Interactive mode
```

### `init` - Initialize config

```bash
mono-gen init [--interactive]
```

### `validate` - Validate environment

```bash
mono-gen validate [--check-api]
```

### `list` - List templates

```bash
mono-gen list templates
```

---

## 🏗️ Generated Structure

```text
my-monorepo/
├── apps/
│   ├── backend/              # Serverless API (port 8000)
│   │   ├── src/
│   │   │   ├── api/          # REST endpoints
│   │   │   └── services/     # Gemini logic
│   │   └── package.json
│   └── frontend/             # React SPA (port 3000)
│       ├── src/
│       │   ├── services/     # API wrappers
│       │   └── components/
│       └── package.json
├── package.json              # Workspace root
└── README.md
```

---

## 💡 Code Transformation

### Before (AIStudio - Insecure)

```typescript
// ❌ API key exposed in browser
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;  // Visible in browser!
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateTitle(topic: string) {
  const result = await model.generateContent(`Title about ${topic}`);
  return result.response.text();
}
```

### After (Backend - Secure)

```typescript
// ✅ API key safe on server
const API_KEY = process.env.GEMINI_API_KEY;  // Server-side only

export async function generateTitle($param: { topic: string }) {
  const result = await model.generateContent(`Title about ${$param.topic}`);
  return result.response.text();
}

// REST API endpoint: POST /hello/generate-title/generate
```

### After (Frontend - API Wrapper)

```typescript
// ✅ Clean API wrapper
import apiClient from '../api/axios';

export async function generateTitle(topic: string) {
  return apiClient.post('/hello/generate-title/generate', { topic })
    .then(r => r?.data);
}
```

---

## 🎯 Use Cases

### Rapid Prototyping → Production

> Built a chatbot prototype in AIStudio (2 hours), transformed to production monorepo (5 minutes), deployed to AWS Lambda + Vercel.

### Learning Full-Stack Development

> Students prototype in AIStudio, then learn monorepo architecture and secure API patterns through generated code.

### Enterprise Security Compliance

Company policy requires server-side API keys. Transform all AIStudio prototypes automatically before deployment.

### Startup MVP Development

Fast prototype + instant production structure = same-day deployment. Time to market: 1 day vs 1 week.

---

## 🤝 Contributing

We welcome contributions!

- 🐛 [Report bugs](https://github.com/lemoncloud-io/aistudio-monorepo-generator/issues)
- 💡 [Suggest features](https://github.com/lemoncloud-io/aistudio-monorepo-generator/discussions)
- 🔧 [Submit PRs](CONTRIBUTING.md)

**Development setup:**

```bash
git clone https://github.com/lemoncloud-io/aistudio-monorepo-generator.git
cd aistudio-monorepo-generator
npm install
npm run dev
npm test
```

---

## 📚 Developer Documentation

> **For contributors and code reviewers**

This project is open source, designed for easy understanding and contribution by third parties.

### Essential Reading

📖 **[ARCHITECTURE.md](ARCHITECTURE.md)** - Understand the codebase

- Architecture patterns (lemon-templates-api)
- Layer-by-layer explanation
- Data flow and component interaction
- How to add features (with examples)

📝 **[CODE_GUIDELINES.md](CODE_GUIDELINES.md)** - Write consistent code

- File naming conventions
- Code style guide
- TypeScript best practices
- Error handling patterns
- Logging guidelines

🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribute effectively

- Development workflow
- Pull request process
- Testing requirements
- Release process

### Quick Navigation

**Want to understand the code?** → Start with [ARCHITECTURE.md](ARCHITECTURE.md)

**Want to add a feature?** → Check [CODE_GUIDELINES.md](CODE_GUIDELINES.md) + [CONTRIBUTING.md](CONTRIBUTING.md)

**Want to review a PR?** → Use [CODE_GUIDELINES.md](CODE_GUIDELINES.md) as checklist

---

## 📋 Roadmap

### v0.0.1 - MVP ✅

- Core transformation engine
- Backend/frontend separation
- Gemini 2.5-pro refactoring
- Default template

---

## 🏆 Comparison

| Feature | Manual Refactoring | mono-gen |
|---------|-------------------|----------|
| Time | 4-8 hours | 5 minutes |
| Security | Manual setup | Automatic |
| Architecture | Varies | Best practices |
| API Generation | Manual coding | AI-generated |
| Cost | $$$ | $ |

**Why choose mono-gen?**

- Only tool specialized for AIStudio → Production
- AI-powered intelligent transformation
- Zero learning curve
- Open source (MIT)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

Copyright (c) 2025 [LemonCloud Co Ltd](https://lemoncloud.io)

---

## 🔗 Links

**Documentation:** [aistudio-monorepo-generator.dev](https://aistudio-monorepo-generator.dev)
**Issues:** [GitHub Issues](https://github.com/lemoncloud-io/aistudio-monorepo-generator/issues)
**Discord:** [Join Community](https://discord.gg/aistudio-mono-gen)
**Twitter:** [@lemoncloud_io](https://twitter.com/lemoncloud_io)

---

## ⭐ Star Us!

If you find mono-gen useful, please star the repo! It helps others discover this tool.

[![GitHub stars](https://img.shields.io/github/stars/lemoncloud-io/aistudio-monorepo-generator.svg?style=social&label=Star)](https://github.com/lemoncloud-io/aistudio-monorepo-generator)

---

**Made with ❤️ by [LemonCloud](https://lemoncloud.io)**

Transform your AIStudio prototypes into production today!

<sub>Keywords: aistudio monorepo generator | google aistudio converter | react monorepo cli | gemini api refactoring | typescript monorepo | secure api key management | ai powered code generator | production ready architecture</sub>
