# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-13

### Added
- Initial release of Unspec'd framework
- Core library and CLI modes
- Five main component types:
  - DisplayRecord
  - ActionButton
  - SmartTable (EditableTable)
  - StreamingTable
  - SmartForm (EditForm)
- Complete TypeScript support and type definitions
- CLI commands:
  - `init`: Project scaffolding and setup
  - `dev`: Development server with hot reload and `--port`/`--title` flags
  - `exec`: Single tool execution with `--port`/`--title` flags
- UnspecdUI class with `title` and `port` configuration support
- Console logging for configured title and port values during startup
- Comprehensive documentation and examples
- Build system supporting both Bun and Node.js targets
- 70 unit tests covering core functionality

### Features
- Tool auto-discovery system
- Hot reload during development
- Responsive design and theming
- Data handling with async support
- Form validation and error handling
- Real-time data streaming capabilities
- Server-side rendering support

### Technical
- Built with Bun and TypeScript
- Uses Vite plugin for development server
- Supports both ESM and CommonJS
- Comprehensive error handling
- Development tools integration

## [0.9.0] - 2025-06-12

### Added
- Beta release with core functionality
- Initial CLI implementation
- Basic component system
- Development server
- TypeScript definitions

### Changed
- Improved error handling
- Enhanced documentation
- Better type safety

## [0.8.0] - 2025-06-11

### Added
- Alpha release
- Basic framework structure
- Initial component prototypes
- Development environment setup

### Changed
- Early API refinements
- Documentation improvements

## [0.7.0] - 2025-06-11

### Added
- Initial prototype
- Core architecture design
- Basic component implementation
- Development tooling setup

### Changed
- API design iterations
- Documentation structure

---

## Version History

- 1.0.0: First stable release (June 13, 2025)
- 0.9.0: Beta release (June 12, 2025)
- 0.8.0: Alpha release (June 11, 2025)
- 0.7.0: Initial prototype (June 11, 2025)

## Upcoming Features

### Planned for 1.1.0
- Advanced table features (filtering, row selection, bulk actions)
- Accessibility compliance improvements
- Performance optimizations
- Security features
- Advanced deployment options

### Planned for 1.2.0
- Multi-step form support
- Custom CSS classes
- Caching mechanisms
- Dark/light mode support
- Advanced theming customization 