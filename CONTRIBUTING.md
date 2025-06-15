# Contributing to Unspec'd

Thank you for your interest in contributing to Unspec'd! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- **Bun** (recommended) or **Node.js 18+**
- **Git**

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/unspecd.git
   cd unspecd
   ```

3. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

4. Run tests to ensure everything works:
   ```bash
   bun test
   # or
   npm test
   ```

5. Start development:
   ```bash
   bun run dev
   # or
   npm run dev
   ```

## Development Workflow

### Building the Project

The project supports both Bun and Node.js runtimes:

```bash
# Build for Bun (recommended for development)
bun run build

# Build for Node.js
npm run build:node

# Build both
bun run build && npm run build:node
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/core/discovery.test.ts

# Run tests with coverage
bun test --coverage
```

### CLI Testing

Test CLI commands during development:

```bash
# Test dev command
bun run dist/cli/index.js dev --port 8080 --title "Test App"

# Test exec command
bun run dist/cli/index.js exec examples/simple.ts --port 3001
```

## Contributing Guidelines

### Reporting Issues

- Use the issue templates provided
- Include clear reproduction steps
- Specify your environment (OS, runtime version, etc.)
- Add relevant labels

### Submitting Pull Requests

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards
3. Add tests for new functionality
4. Ensure all tests pass:
   ```bash
   bun test
   npm run build:node  # Test Node.js compatibility
   ```

5. Update documentation if needed
6. Commit with clear, descriptive messages
7. Push to your fork and create a pull request

### Coding Standards

- **TypeScript**: Use strict mode, proper typing
- **Formatting**: We use Prettier (run `bun run format`)
- **Linting**: Follow ESLint rules (run `bun run lint`)
- **Testing**: Write tests for new features and bug fixes
- **Documentation**: Update docs for API changes

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add support for custom themes in UI components
fix: resolve CLI port parsing issue
docs: update API documentation for ToolSpec
test: add integration tests for discovery system
```

## Project Structure

```
src/
├── lib/           # Core library code
├── cli/           # CLI implementation
└── types/         # TypeScript type definitions

tests/
├── core/          # Core functionality tests
├── cli/           # CLI tests
├── lib/           # Library tests
└── integration/   # Integration tests

docs/              # Documentation
examples/          # Example projects
```

## Areas for Contribution

We welcome contributions in these areas:

### High Priority
- **UI Components**: New component types, themes, styling
- **CLI Features**: Additional commands, configuration options
- **Documentation**: Tutorials, examples, API docs
- **Testing**: More test coverage, integration tests

### Medium Priority
- **Performance**: Optimization, caching, bundling
- **Developer Experience**: Better error messages, debugging tools
- **Integrations**: Database connectors, external APIs

### Ideas Welcome
- **Plugins**: Extension system for custom functionality
- **Templates**: Project scaffolding templates
- **Deployment**: Hosting and deployment guides

## Getting Help

- **Documentation**: Check the [docs](./docs/) directory
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Examples**: Look at the [examples](./examples/) directory

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributors page

## License

By contributing to Unspec'd, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Unspec'd! 🚀 