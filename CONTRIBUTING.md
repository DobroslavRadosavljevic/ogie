# Contributing

Thanks for your interest in contributing!

## Development

1. Fork and clone the repository.
2. Install dependencies: `bun install`.
3. Make your changes.
4. Run quality checks:
   - `bun run lint`
   - `bun run typecheck`
   - `bun run test`
   - `bun run test:coverage`
5. Build outputs: `bun run build`.
6. Submit a pull request.

## Guidelines

- Follow the existing code style (enforced by Ultracite)
- Write tests for new features
- Keep commits focused and descriptive
- Update documentation as needed
- If your change affects public behavior, update `MIGRATION-v2.md` when relevant.

## Release Notes and Breaking Changes

- Breaking changes are tracked in `MIGRATION-v2.md`.
- Public API changes should include:
  - Updated README examples
  - Updated tests
  - Clear migration instructions

## Reporting Issues

- Check existing issues before opening a new one
- Include reproduction steps when reporting bugs
- Be clear and concise
