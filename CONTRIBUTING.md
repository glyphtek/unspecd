# Contributing to Unspec'd

Thank you for your interest in contributing to Unspec'd! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- [Node.js](https://nodejs.org/) >= 18.0.0
- [TypeScript](https://www.typescriptlang.org/) >= 5.0.0

### Installation

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/unspecd.git
   cd unspecd
   ```
3. Install dependencies:
   ```bash
   bun install
   ```

### Development Workflow

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards:
   - Use TypeScript for all new code
   - Follow the existing code style
   - Write tests for new functionality
   - Update documentation as needed

3. Run tests:
   ```bash
   bun test
   ```

4. Build the project:
   ```bash
   bun run build
   ```

5. Submit a pull request

## Project Structure

```
unspecd/
├── src/
│   ├── lib/        # Core library code
│   ├── cli/        # CLI implementation
│   └── types/      # TypeScript definitions
├── examples/       # Example implementations
├── tests/          # Test files
└── docs/           # Documentation
```

## Testing

We use Bun's built-in test runner. Write tests for new features and ensure all tests pass before submitting a PR.

```bash
# Run all tests
bun test

# Run specific test file
bun test path/to/test.ts
```

## Documentation

- Update relevant documentation when adding new features
- Follow the existing documentation style
- Include code examples where appropriate
- Update the CHANGELOG.md for significant changes

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the CHANGELOG.md with your changes
3. Ensure all tests pass
4. Ensure the build succeeds
5. Submit your PR with a clear description of changes

## Version Management

We follow [Semantic Versioning](https://semver.org/):

- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality
- PATCH version for backwards-compatible bug fixes

## Feature Development Guidelines

### New Components
- Follow the existing component patterns
- Include TypeScript definitions
- Add comprehensive tests
- Document the component API
- Include example usage

### CLI Commands
- Follow the existing command structure
- Include help text and documentation
- Add appropriate error handling
- Include tests for the command

### Bug Fixes
- Include a test that reproduces the bug
- Document the fix in the PR description
- Update the CHANGELOG.md

## Code Style

- Use TypeScript for all new code
- Follow the existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Questions?

Feel free to open an issue for any questions about contributing to Unspec'd. 