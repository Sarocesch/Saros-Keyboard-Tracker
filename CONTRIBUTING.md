# Contributing to Saros Keyboard Tracker

Contributions are welcome! Whether it's a bug fix, a new feature, or a UI improvement — feel free to open a PR.

## Getting Started

```bash
git clone https://github.com/Sarocesch/saros-keyboard-tracker
cd saros-keyboard-tracker
npm install
npm run tauri dev
```

**Requirements:** Rust (stable), Node.js 18+, VS Build Tools (Windows)

## How to Contribute

1. **Fork** the repository
2. **Create a branch** — `git checkout -b feat/your-feature` or `fix/your-bug`
3. **Make your changes**
4. **Test** — run `npm run tauri dev` and verify the feature works
5. **Open a Pull Request** against `main`

## Branch Naming

| Type    | Pattern              |
|---------|----------------------|
| Feature | `feat/short-name`    |
| Bug fix | `fix/short-name`     |
| Docs    | `docs/short-name`    |
| Refactor| `refactor/short-name`|

## What's Welcome

- Bug fixes
- New keyboard layout support (AZERTY, QWERTZ, etc.)
- UI/UX improvements
- Performance improvements to the tracking layer
- Export features (CSV, JSON)
- Additional stats views

## Code Style

- **Rust:** `cargo fmt` before committing
- **TypeScript:** keep components small and focused
- **Tailwind:** use the existing color palette (`surface-*`, `brand-*`)

## Reporting Bugs

Open an issue using the **Bug Report** template. Include:
- Windows version
- Steps to reproduce
- What you expected vs what happened

## Feature Requests

Open an issue using the **Feature Request** template. Describe the use case clearly.
