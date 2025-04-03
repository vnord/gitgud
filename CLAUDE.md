# Claude Guidelines for gitgud Repository

## Build Commands
- Install dependencies: `npm install`
- Build application: `npm run build`
- Start application: `npm start` (if implemented)

## Lint Commands
- Run linting: `npm run lint`
- Run TypeScript type checking: `npx tsc --noEmit`

## ESLint Setup
If ESLint is not configured, run: `npm init @eslint/config`

## Test Commands
- Run all tests: `npm test` (if configured)
- Run a single test: `npm test -- -t "test name"` (if using Jest)

## Version Management
- Update package.json version number after significant changes
- Commit changes with updated version when implementing major features or fixes

## Code Style Guidelines
- **Naming**: Use camelCase for variables/functions, PascalCase for classes
- **Formatting**: Use 2-space indentation
- **Imports**: Group imports by type (external, internal, relative)
- **Error Handling**: Use try/catch for async operations
- **Types**: Add JSDoc comments for type documentation
- **Functions**: Keep functions small and focused on a single task
- **Documentation**: Document public APIs with clear examples
- **Comments**: Focus on why, not what the code does
- **Promises**: Prefer async/await over raw promises

Follow existing patterns in the codebase when making changes or adding new functionality.