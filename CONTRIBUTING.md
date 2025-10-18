# Contributing to Launcher Plus

Thank you for your interest in contributing to Launcher Plus! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- VS Code version and OS
- Extension version
- Relevant configuration (sanitized)
- Screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- Clear and descriptive title
- Detailed description of the proposed functionality
- Use cases and examples
- Why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`, `npm run compile`)
5. Commit your changes with clear messages
6. Push to your fork
7. Open a Pull Request

#### Pull Request Guidelines

- Follow the existing code style
- Update documentation as needed
- Add tests for new features
- Ensure all tests pass
- Keep PRs focused on a single feature/fix
- Write clear commit messages

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- VS Code (latest version)

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/PutraAdiJaya/any-launcher-plus.git
cd any-launcher-plus

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch
```

### Testing

1. Press `F5` in VS Code to open Extension Development Host
2. Test your changes in the development instance
3. Check the Debug Console for errors

### Building

```bash
# Compile TypeScript
npm run compile

# Run linter
npm run lint

# Format code
npm run format

# Package extension
npm run package
```

## Code Style

- Use TypeScript for all code
- Follow existing formatting (Prettier configuration)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await over promises

### TypeScript Guidelines

- Avoid `any` types when possible
- Use proper type annotations
- Leverage type inference where appropriate
- Use interfaces for object shapes
- Export types that may be reused

### Naming Conventions

- `camelCase` for variables and functions
- `PascalCase` for classes and types
- `UPPER_CASE` for constants
- Descriptive names over abbreviations

## Project Structure

```
any-launcher-plus/
├── src/
│   └── extension.ts       # Main extension code
├── examples/              # Example configurations
├── media/                 # Icons and images
├── out/                   # Compiled JavaScript
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript configuration
├── eslint.config.js       # ESLint configuration
└── README.md              # Documentation
```

## Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(shortcuts): add support for environment variables
fix(tree-view): resolve icon path issue on Windows
docs(readme): update installation instructions
```

## Documentation

- Update README.md for user-facing changes
- Update CHANGELOG.md following Keep a Changelog format
- Add JSDoc comments for public APIs
- Include examples for new features

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes
4. Create git tag (`git tag v0.x.x`)
5. Push tag (`git push origin v0.x.x`)
6. GitHub Actions will handle publishing

## Questions?

Feel free to open an issue for questions or join discussions in existing issues.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
