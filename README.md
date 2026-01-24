# 📦 npm-ts-start

A minimal starter template for creating npm packages in pure TypeScript.

## ✨ Features

- 🔷 **TypeScript** - Write type-safe code with full TypeScript support
- ⚡ **tsdown** - Fast bundling powered by Rolldown
- 🧪 **Bun Test** - Fast built-in test runner
- 🎨 **Ultracite** - Zero-config linting and formatting with Oxlint + Oxfmt
- 📦 **ESM** - Ships as ES modules with TypeScript declarations
- 🚀 **GitHub Actions** - CI/CD pipeline with automated testing and npm publishing
- 🐶 **Husky** - Pre-commit hooks for code quality enforcement
- 📝 **Commitlint** - Conventional commit message validation

## 🚀 Getting Started

1. Clone or use this template:

```bash
git clone https://github.com/dobroslavradosavljevic/npm-ts-start.git my-package
cd my-package
```

2. Update `package.json` with your package name, description, and author info.

3. Install dependencies:

```bash
bun install
```

4. Start developing in `src/index.ts`.

## 📜 Scripts

| Command             | Description                         |
| ------------------- | ----------------------------------- |
| `bun run build`     | Build the package                   |
| `bun run dev`       | Build in watch mode                 |
| `bun run test`      | Run tests                           |
| `bun run lint`      | Check for linting issues            |
| `bun run format`    | Fix linting and formatting issues   |
| `bun run typecheck` | Run TypeScript type checking        |
| `bun run bump`      | Bump version and generate changelog |

## 📁 Project Structure

```txt
├── src/
│   └── index.ts          # Package entry point
├── tests/
│   └── index.test.ts     # Test files
├── dist/                 # Build output (generated)
├── .github/
│   └── workflows/
│       ├── ci.yml        # CI pipeline (lint, test, build)
│       └── release.yml   # Automated npm publishing
├── .husky/
│   ├── pre-commit        # Runs lint-staged before commits
│   └── commit-msg        # Validates commit messages
├── tsdown.config.ts      # Build configuration
├── tsconfig.json         # TypeScript configuration
├── commitlint.config.ts  # Commit message rules
└── package.json
```

## 🐶 Git Hooks

This template uses Husky for Git hooks:

- **pre-commit**: Runs `lint-staged` to lint and format staged files
- **commit-msg**: Validates commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)

### Commit Message Format

```
type(scope): description

# Examples:
feat: add new feature
fix: resolve bug in parser
docs: update README
chore: update dependencies
```

## 🔄 CI/CD

### Continuous Integration

On every push to `main` and pull request, the CI workflow runs:

- ✅ Lint check
- ✅ Type check
- ✅ Tests
- ✅ Build

### Automated Releases

When you push a version tag (`v*`), the release workflow:

1. Runs all CI checks
2. Publishes to npm with provenance
3. Creates a GitHub release with auto-generated notes

### Setup for Publishing

Add `NPM_TOKEN` to your repository secrets:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Add `NPM_TOKEN` with your npm automation token

## 🚢 Publishing

1. Bump the version (creates a tag):

```bash
bun run bump
```

2. Push the tag to trigger the release workflow:

```bash
git push --tags
```

Or publish manually:

```bash
bun publish
```

## 📄 License

MIT
