# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-06

### Added
- Global CLI installation detection and support
- Automatic import path resolution for global vs local installations
- Export of `ToolSpec` type from main entry point for library mode
- Cross-platform compatibility for Windows, macOS, and Linux global installations

### Changed
- **BREAKING**: Init command no longer creates `.gitignore` file
- Init command now creates minimal `package.json` (scripts only) when file doesn't exist
- Init command adds `unspecd:init` and `unspecd:dev` scripts to existing `package.json`
- Updated welcome tool example to use `@glyphtek/unspecd` import
- Fixed quote escaping issues in generated tool files (now uses backticks)

### Fixed
- CLI now works with global installation only (no local dependency required)
- Resolved import path issues in generated entry files
- Fixed template string escaping in init command generated files

### Technical
- Enhanced global installation detection with robust fallback mechanisms
- Improved error handling and logging for installation type detection
- Updated test suite to match new init command behavior
- Cleaned up linting warnings and code style issues

## [1.0.1] - 2025-01-03

### Fixed
- Move `vite` from devDependencies to dependencies to fix CLI installation issues
- Resolve "Cannot find package 'vite'" error when using `bunx unspecd` or `npx unspecd`

## [1.0.0] - 2025-01-03

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

---

## Version History

- 1.1.0: Global CLI support and init improvements (January 6, 2025)
- 1.0.1: Critical bug fix (January 3, 2025)
- 1.0.0: First stable release (January 3, 2025)

## Upcoming Features

### Planned for 1.1.0
- Advanced table features (filtering, row selection, bulk actions)
- Accessibility compliance improvements
- Performance optimizations
- Advanced deployment options

### Planned for 1.2.0
- Multi-step form support
- Custom CSS classes and theming
- Dark/light mode support
- Plugin system for extensibility 