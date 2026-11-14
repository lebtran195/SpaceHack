# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a minimal scaffold. Place application code in `src/`, grouped by feature or domain. Keep entry points near the top of `src/` and reusable components in named subdirectories. Add tests under `tests/`, mirroring the source layout (for example, `src/navigation/route.*` corresponds to `tests/navigation/route_test.*`). Store static assets in `assets/` and documentation in `docs/` when needed. Do not commit generated output, dependency caches, or editor metadata.

## Build, Test, and Development Commands

No build system, package manager, or test runner is configured yet. Before introducing one, document its setup and scripts in the root README and keep common tasks behind a small, predictable command set. At present, useful repository checks are:

- `git status --short` — review modified and untracked files.
- `git diff --check` — detect whitespace errors before committing.
- `git diff` — inspect the exact changes being proposed.

When tooling is added, prefer standard commands such as `npm run dev`, `npm test`, and `npm run lint`, or equivalent commands for the chosen ecosystem.

## Coding Style & Naming Conventions

Follow the formatter and linter selected for the language introduced; commit their configuration with the first related code. Use spaces rather than tabs unless the formatter requires otherwise. Choose descriptive names: `PascalCase` for types and components, `camelCase` for functions and variables, and `kebab-case` for asset filenames. Keep modules focused, avoid hidden global state, and comment intent rather than restating code.

## Testing Guidelines

Add tests with every behavior change or bug fix. Mirror production modules in `tests/` and use names that describe the expected behavior, such as `route_falls_back_when_destination_missing`. Tests must be deterministic and must not depend on developer-specific paths, credentials, or network access unless explicitly marked as integration tests.

## Commit & Pull Request Guidelines

Because the repository has no commit history yet, use concise, imperative commit subjects, optionally following Conventional Commits (for example, `feat: add orbital map` or `fix: reject invalid coordinates`). Keep commits narrowly scoped. Pull requests should explain the motivation, summarize implementation and verification, link relevant issues, and include screenshots or recordings for visible changes. Note any new configuration, migration steps, or known follow-up work.

## Security & Configuration

Never commit secrets. Use ignored local environment files and provide a sanitized `.env.example` when configuration is introduced. Validate external input and pin dependencies through the ecosystem's lockfile.
