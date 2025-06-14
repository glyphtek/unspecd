# CLI Guide

The Unspec'd CLI provides a powerful command-line interface for rapid tool development and prototyping. It automatically discovers tool files, handles configuration, and provides multiple operational modes.

## Installation

Install Unspec'd globally or use it with npx:

::: code-group

```bash [global install]
npm install -g @glyphtek/unspecd
unspecd --help
```

```bash [npx (recommended)]
npx @glyphtek/unspecd --help
```

```bash [bun]
bun add -g @glyphtek/unspecd
unspecd --help
```

:::

## Commands Overview

| Command | Purpose | Mode |
|---------|---------|-------|
| `unspecd init` | Initialize new project | Setup |
| `unspecd dev` | Multi-tool dashboard | Dashboard Mode |
| `unspecd exec <file>` | Single tool interface | Focus Mode |

---

## `unspecd init`

Initialize a new Unspec'd project with example files and configuration.

```bash
unspecd init
```

**What it creates:**
- `unspecd.config.ts` - Configuration file
- `examples/` - Sample tool files
- Basic project structure

**Example output:**
```
✅ Created unspecd.config.ts
📁 Created tools/ directory
📄 Created example tool files
🎉 Project initialized! Run 'unspecd dev' to start
```

---

## `unspecd dev` - Dashboard Mode

Start the development server with automatic tool discovery. Perfect for managing multiple tools in a dashboard interface.

### Basic Usage

```bash
# Discover tools in current directory
unspecd dev

# Specify custom working directory
unspecd dev --cwd ./my-tools

# Full command syntax
unspecd dev [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--cwd <dir>` | Set working directory | Current directory |

### File Discovery

The CLI automatically discovers tool files using these patterns:

**Default patterns:**
- `*.tool.ts` - Tool files in current directory
- `tools/**/*.ts` - All TypeScript files in `tools/` folder

**File naming conventions:**
```
✅ user-management.tool.ts
✅ analytics.tool.ts  
✅ tools/system-monitor.ts
✅ tools/admin/cache-tools.ts
❌ helper-functions.ts (not in tools/ and no .tool.ts suffix)
```

### Example Project Structure

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

Running `unspecd dev` in this directory will discover and load 4 tools.

---

## `unspecd exec` - Focus Mode

Run a single tool file in focus mode (no sidebar, just the tool interface).

### Usage

```bash
# Run specific tool file
unspecd exec user-management.tool.ts

# Run with relative path
unspecd exec ./tools/analytics.ts

# Run with absolute path
unspecd exec /path/to/my-tool.ts
```

### When to Use Focus Mode

- **Embedded Usage**: When integrating a single tool into existing workflows
- **Quick Testing**: Rapid iteration on a specific tool
- **Presentation**: Clean interface for demonstrations
- **Focused Work**: When you only need one tool at a time

---

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
  ],
  
  // Optional: Custom server configuration
  server: {
    port: 8080,
    host: '0.0.0.0'
  }
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

### Environment-Specific Configs

```typescript
// unspecd.config.ts
import type { UnspecdConfig } from '@glyphtek/unspecd/cli'

const isDev = process.env.NODE_ENV !== 'production'

const config: UnspecdConfig = {
  tools: isDev 
    ? [
        './tools/**/*.ts',
        './dev-tools/**/*.ts'  // Development tools
      ]
    : [
        './tools/**/*.ts'      // Production tools only
      ]
}

export default config
```

---

## Tool File Structure

Each discoverable tool file must export a `ToolSpec` as the default export:

### Basic Tool File

```typescript
// user-management.tool.ts
import type { ToolSpec } from '@glyphtek/unspecd'

const userManagement: ToolSpec = {
  id: 'user-management',
  title: 'User Management Dashboard',
  content: {
    type: 'editableTable',
    columns: {
      name: { type: 'text', label: 'Name' },
      email: { type: 'email', label: 'Email' },
      role: {
        type: 'select',
        label: 'Role',
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' }
        ]
      }
    }
  },
  functions: {
    loadData: async () => {
      // Load users from your API/database
      return [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
      ]
    },
    
    updateUser: async (userData) => {
      console.log('Updating user:', userData)
      // Implement update logic
      return { success: true, message: 'User updated!' }
    }
  }
}

// Must be default export for CLI discovery
export default userManagement
```

### Advanced Tool File

```typescript
// system-monitor.tool.ts
import type { ToolSpec } from '@glyphtek/unspecd'

// Tool can import other modules
import { getSystemStats, clearCache } from './utils/system.js'

const systemMonitor: ToolSpec = {
  id: 'system-monitor',
  title: 'System Monitor',
  
  // Input parameters
  inputs: {
    refreshInterval: {
      type: 'select',
      label: 'Refresh Interval',
      options: [
        { value: '5', label: '5 seconds' },
        { value: '30', label: '30 seconds' },
        { value: '60', label: '1 minute' }
      ],
      defaultValue: '30'
    }
  },
  
  content: {
    type: 'displayRecord',
    fields: {
      cpuUsage: { type: 'percentage', label: 'CPU Usage' },
      memoryUsage: { type: 'percentage', label: 'Memory Usage' },
      diskUsage: { type: 'percentage', label: 'Disk Usage' },
      uptime: { type: 'text', label: 'Uptime' }
    }
  },
  
  functions: {
    loadData: async (params) => {
      const stats = await getSystemStats()
      
      // Use refresh interval from input
      setTimeout(() => {
        // Refresh logic here
      }, parseInt(params.refreshInterval) * 1000)
      
      return stats
    }
  }
}

export default systemMonitor
```

---

## Development Workflow

### Typical Development Flow

1. **Initialize project**:
   ```bash
   mkdir my-admin-tools
   cd my-admin-tools
   unspecd init
   ```

2. **Create tool files**:
   ```bash
   # Create new tool files as needed
   touch user-management.tool.ts
   touch analytics.tool.ts
   ```

3. **Start development server**:
   ```bash
   unspecd dev
   ```

4. **Iterate and test**:
   - Tools are automatically discovered
   - Hot reload on file changes
   - Real-time development feedback

### Team Collaboration

CLI mode is perfect for team environments:

```
team-tools/
├── unspecd.config.ts
├── marketing/
│   ├── campaign-manager.tool.ts    # Marketing team
│   └── analytics.tool.ts
├── engineering/
│   ├── deployment.tool.ts          # Engineering team
│   └── monitoring.tool.ts
└── support/
    ├── user-support.tool.ts        # Support team
    └── ticket-manager.tool.ts
```

Each team member can:
- Add tools independently
- Test locally with `unspecd dev`
- Share tools via version control
- Deploy centrally for team access

---

## Deployment

### Development Deployment

```bash
# Start development server
unspecd dev --cwd ./production-tools

# Custom port
PORT=8080 unspecd dev
```

### Production Deployment

For production deployments, consider using the library mode for more control:

```typescript
// server.ts
import { UnspecdUI, startServer } from '@glyphtek/unspecd'
import { glob } from 'glob'

// Dynamically import all tool files
const toolFiles = await glob('./tools/**/*.tool.ts')
const tools = await Promise.all(
  toolFiles.map(async (file) => {
    const module = await import(file)
    return module.default
  })
)

const app = new UnspecdUI({ tools })
await startServer(app, { port: process.env.PORT || 3000 })
```

---

## Troubleshooting

### Common Issues

**Tool not discovered:**
- Check file naming (must end with `.tool.ts` or be in `tools/` folder)
- Verify default export exists
- Check `unspecd.config.ts` patterns

**Import errors:**
- Ensure relative imports use `.js` extension
- Check TypeScript configuration
- Verify all dependencies are installed

**Development server issues:**
- Check port availability (default: 3000)
- Verify file permissions
- Check console for detailed error messages

### Debug Mode

Enable verbose logging:

```bash
DEBUG=unspecd:* unspecd dev
```

This shows:
- File discovery process
- Tool loading details
- Server startup information
- Error stack traces

---

## Examples

See the [`examples/cli/`](https://github.com/glyphtek/unspecd/tree/main/examples/cli) directory for:

- **Basic tool files** - Simple examples to get started
- **Advanced patterns** - Complex tools with multiple features
- **Configuration examples** - Different `unspecd.config.ts` setups
- **Team structures** - Multi-team project organization

## Next Steps

- **[API Reference](/api/)** - Complete API documentation
- **[Examples](/examples/)** - Real-world tool implementations
- **[Library Mode](/guide/library)** - Programmatic usage patterns 