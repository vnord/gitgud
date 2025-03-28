# Claude Guidelines for gitgud Repository

## Build Commands
- Install dependencies: `npm install`
- Start application: `npm start` (if implemented)

## Lint Commands
- Run linting: `npm run lint` (if configured)

## Test Commands
- Run all tests: `npm test` (if configured)
- Run a single test: `npm test -- -t "test name"` (if using Jest)

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