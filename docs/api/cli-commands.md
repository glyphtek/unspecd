# CLI Commands

Complete reference for all Unspec'd CLI commands and their options.

## Installation

```bash
# Install globally
npm install -g @glyphtek/unspecd

# Or use with npx
npx @glyphtek/unspecd --help
```

## Global Options

All commands support these global options:

```bash
--help, -h      Show help information
--version, -v   Show version number
```

## Commands

### `unspecd init`

Initialize a new Unspec'd project with example files and configuration.

```bash
unspecd init
```

**What it creates:**
- `package.json` - Project configuration with dependencies
- `.gitignore` - Git ignore file with common patterns
- `tools/` - Directory for tool files
- `tools/welcome.tool.ts` - Example welcome tool
- `unspecd.config.ts` - Configuration file for tool discovery

**Example output:**
```
🚀 Initializing new Unspec'd project...
📦 Creating package.json...
📝 Creating .gitignore...
📁 Creating tools/ directory...
🛠️  Creating tools/welcome.tool.ts...
⚙️  Creating unspecd.config.ts...

✅ Success! Your Unspec'd project has been created.

Next steps:
1. Run 'bun install' to install dependencies.
2. Run 'bunx unspecd dev' to start the dashboard with all tools.
3. Open your browser to http://localhost:3000 to see your dashboard.
```

### `unspecd dev` - Dashboard Mode

Start the development server with automatic tool discovery. Perfect for managing multiple tools in a dashboard interface.

```bash
unspecd dev [options]
```

**Options:**
```bash
--cwd <dir>       Set working directory (default: current directory)
--port <number>   Server port (default: 3000)
--title <string>  Application title
```

**Examples:**
```bash
# Basic usage - discover tools in current directory
unspecd dev

# Specify custom working directory
unspecd dev --cwd ./my-tools

# Custom port and title
unspecd dev --port 8080 --title "My Admin Dashboard"

# All options together
unspecd dev --cwd ./admin-tools --port 8080 --title "Admin Panel"
```

**File Discovery:**
The CLI automatically discovers tool files using these patterns:
- `*.tool.ts` - Tool files in current directory
- `tools/**/*.ts` - All TypeScript files in `tools/` folder

**Example Project Structure:**
```
my-dashboard/
├── unspecd.config.ts          # Configuration (optional)
├── user-management.tool.ts    # Discovered ✅
├── analytics.tool.ts          # Discovered ✅
├── helpers.ts                 # Ignored ❌
└── tools/                     
    ├── system-monitor.ts      # Discovered ✅
    ├── cache-admin.ts         # Discovered ✅
    └── utils/
        └── common.ts          # Discovered ✅
```

### `unspecd exec <file>` - Focus Mode

Run a single tool file in focus mode (no sidebar, just the tool interface).

```bash
unspecd exec <file> [options]
```

**Arguments:**
- `file` - Path to the tool file to run

**Options:**
```bash
--port <number>   Server port (default: 3000)
--title <string>  Application title
```

**Examples:**
```bash
# Run specific tool file
unspecd exec user-management.tool.ts

# Run with custom port and title
unspecd exec analytics.tool.ts --port 8080 --title "Analytics Dashboard"

# Run with relative path
unspecd exec ./tools/system-monitor.ts --port 3001

# Run with absolute path
unspecd exec /path/to/my-tool.ts --title "Custom Tool"
```

**When to Use Focus Mode:**
- **Embedded Usage**: When integrating a single tool into existing workflows
- **Quick Testing**: Rapid iteration on a specific tool
- **Presentation**: Clean interface for demonstrations
- **Focused Work**: When you only need one tool at a time

## Configuration

### `unspecd.config.ts`

Customize tool discovery patterns and behavior:

```typescript
import type { UnspecdConfig } from '@glyphtek/unspecd/cli'

const config: UnspecdConfig = {
  tools: [
    // Custom patterns
    './admin-tools/*.tool.ts',
    './dashboard/**/*.ts',
    './monitoring/*.tool.js',
    
    // Exclude patterns with !
    '!./deprecated/**/*',
    '!**/node_modules/**/*'
  ]
}

export default config
```

### Discovery Patterns

Use glob patterns to control which files are discovered:

```typescript
const config: UnspecdConfig = {
  tools: [
    // Specific directory
    './admin/*.tool.ts',
    
    // Recursive search
    './dashboard/**/*.ts',
    
    // Multiple extensions
    './tools/**/*.{ts,js}',
    
    // Exclusions
    '!./tools/deprecated/**/*',
    '!**/test/**/*',
    '!**/*.test.ts'
  ]
}
```

## Command Examples

### Development Workflow

```bash
# 1. Initialize new project
mkdir my-admin-tools
cd my-admin-tools
unspecd init

# 2. Install dependencies
bun install

# 3. Start development server
unspecd dev --title "My Admin Panel"

# 4. Test specific tool
unspecd exec tools/user-management.tool.ts --port 8080
```

### Team Collaboration

```bash
# Team member 1: Working on user tools
unspecd dev --cwd ./user-tools --port 3001 --title "User Management"

# Team member 2: Working on analytics
unspecd exec analytics.tool.ts --port 3002 --title "Analytics Dashboard"

# Team member 3: Working on admin tools
unspecd dev --cwd ./admin --port 3003 --title "Admin Tools"
```

### Production Testing

```bash
# Test on production port
unspecd dev --port 80 --title "Production Dashboard"

# Test specific tool in isolation
unspecd exec critical-tool.ts --port 443 --title "Critical System Monitor"
```

## Environment Variables

Configure Unspec'd using environment variables:

```bash
# Set default port
export PORT=8080

# Set application title
export APP_TITLE="My Dashboard"

# Run with environment variables
unspecd dev --port $PORT --title "$APP_TITLE"
```

## Exit Codes

The CLI uses standard exit codes:

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - Configuration error
- `4` - File not found
- `5` - Tool discovery error

## Troubleshooting

### Common Issues

**No tools found:**
```bash
# Check your patterns in unspecd.config.ts
# Ensure files end with .tool.ts or are in tools/ directory
# Verify file paths are correct
```

**Port already in use:**
```bash
# Use a different port
unspecd dev --port 8080

# Or kill the process using the port
lsof -ti:3000 | xargs kill -9
```

**Tool file not found:**
```bash
# Check file path is correct
unspecd exec ./path/to/tool.ts

# Use absolute path if needed
unspecd exec /full/path/to/tool.ts
```

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Add DEBUG environment variable
DEBUG=unspecd:* unspecd dev

# Or check console output for discovery information
unspecd dev --cwd ./tools
```

## Related Documentation

- **[CLI Guide](../guide/cli.md)** - Comprehensive CLI usage guide
- **[Tool Specifications](./tool-specification.md)** - How to write tool files
- **[Configuration](../guide/configuration.md)** - Advanced configuration options

---

**The Unspec'd CLI makes tool development fast and efficient!** ⚡ 