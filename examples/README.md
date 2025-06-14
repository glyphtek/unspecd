# Unspec'd Examples

This directory contains comprehensive examples demonstrating both ways to use the Unspec'd Framework:

- **Library Mode** (`lib/`): Direct programmatic usage with `UnspecdUI` instances
- **CLI Mode** (`cli/`): Automatic tool discovery using the CLI

## Quick Start

### Installation

First, install the Unspec'd package in your project:

```bash
npm install @glyphtek/unspecd
# or
bun add @glyphtek/unspecd
```

### Library Mode (Recommended for beginners)

The simplest way to get started - just two lines of code:

```bash
# Run the library mode example
bun run ./examples/lib/index.ts
```

Visit http://localhost:3000 to see 8 tools loaded directly via code.

### CLI Mode (Recommended for teams)

Automatic tool discovery from files:

```bash
# Run the CLI mode example  
bun run dist/cli/index.js dev --cwd examples/cli
```

Visit http://localhost:3000 to see 3 tools auto-discovered from `.tool.ts` files.

## Directory Structure

```
examples/
├── README.md                    # This file
├── lib/                         # Library Mode Examples
│   ├── README.md               # Library mode documentation
│   ├── index.ts                # Main library example (2 lines!)
│   └── *.ts                    # Individual tool examples
└── cli/                        # CLI Mode Examples
    ├── README.md              # CLI mode documentation
    ├── unspecd.config.ts      # Discovery configuration
    └── *.tool.ts              # Tool files for auto-discovery
```

## Library Mode (`lib/`)

**Perfect for**: Getting started, prototyping, simple projects

```typescript
import { UnspecdUI, startServer } from '@glyphtek/unspecd';
import { myTool } from './my-tool.js';

const app = new UnspecdUI({ tools: [myTool] });
await startServer(app);
```

**Key Benefits**:
- ✅ Zero configuration
- ✅ Two lines to start  
- ✅ Full TypeScript support
- ✅ Complete control over tools
- ✅ Easy debugging
- ✅ No file system scanning

**See**: `lib/README.md` for detailed documentation and `lib/index.ts` for the main example.

## CLI Mode (`cli/`)

**Perfect for**: Teams, large projects, file-based organization

```bash
# Just create *.tool.ts files and run:
npx unspecd dev --cwd examples/cli
```

**Key Benefits**:
- ✅ Auto-discovery of tools
- ✅ Team-friendly (add files independently)
- ✅ Configurable patterns
- ✅ No manual tool registration  
- ✅ File-based organization
- ✅ Convention over configuration

**See**: `cli/README.md` for detailed documentation and usage patterns.

## Package Usage

When using Unspec'd in your own projects, you'll import from the package:

### Core Imports
```typescript
// Main library classes and functions
import { UnspecdUI, startServer } from '@glyphtek/unspecd';

// Type definitions for tools
import type { ToolSpec } from '@glyphtek/unspecd';

// CLI configuration types
import type { UnspecdConfig } from '@glyphtek/unspecd/cli';
```

### Example Usage
```typescript
// Create a simple tool
const myTool: ToolSpec = {
  id: 'my-tool',
  title: 'My Tool',
  content: {
    type: 'displayRecord',
    dataLoader: { functionName: 'loadData' },
    displayConfig: {
      fields: [{ field: 'message', label: 'Message' }]
    }
  },
  functions: {
    loadData: async () => ({ message: 'Hello World!' })
  }
};

// Start the server
const app = new UnspecdUI({ tools: [myTool] });
await startServer(app);
```

## Choosing a Mode

| Feature | Library Mode | CLI Mode |
|---------|-------------|----------|
| **Setup Complexity** | 2 lines of code | File naming + config |
| **Getting Started** | ⭐⭐⭐⭐⭐ Immediate | ⭐⭐⭐ Need CLI setup |
| **TypeScript Support** | ⭐⭐⭐⭐⭐ Full IntelliSense | ⭐⭐⭐⭐ Import-based |
| **Team Collaboration** | ⭐⭐⭐ Manual coordination | ⭐⭐⭐⭐⭐ Auto-discovery |
| **File Organization** | ⭐⭐⭐ Manual imports | ⭐⭐⭐⭐⭐ Convention-based |
| **Configuration** | ⭐⭐⭐⭐⭐ No config needed | ⭐⭐⭐ Config files |
| **Control** | ⭐⭐⭐⭐⭐ Complete control | ⭐⭐⭐ Pattern-based |

## Tool Examples Included

### Library Mode Tools (`lib/`)
- **Complex Tools**: User management, task dashboards
- **Real-time Features**: Live data, GitHub events, streaming tables
- **Action Tools**: Promo code generation, batch operations
- **Basic Patterns**: Simple tables, forms, displays

### CLI Mode Tools (`cli/`)
- **User Management**: Editable table with inline editing
- **System Monitor**: Display record with system stats
- **Cache Invalidator**: Action button with confirmation

## Common Tool Patterns

Both modes support the same tool content types:

### `editableTable`
Interactive data tables with inline editing, row actions, and pagination.

### `displayRecord`  
Read-only key-value displays for dashboards and status pages.

### `actionButton`
Single-action buttons with confirmations and success messages.

### `editForm`
Form-based data editing with validation and field controls.

## Development Workflow

### For Library Mode:
1. Install: `npm install @glyphtek/unspecd`
2. Create tool files with exported `ToolSpec` objects
3. Import tools in your main file
4. Add to `UnspecdUI` tools array  
5. Run with `bun run ./your-file.ts`

### For CLI Mode:
1. Install: `npm install @glyphtek/unspecd`
2. Create `*.tool.ts` files with default exports
3. Optionally customize patterns in `unspecd.config.ts`
4. Run with `npx unspecd dev --cwd your-directory`
5. Tools are auto-discovered and loaded

## Next Steps

1. **Install the Package**: `npm install @glyphtek/unspecd`
2. **Try Library Mode**: Run `bun run ./examples/lib/index.ts`
3. **Try CLI Mode**: Run `bun run dist/cli/index.js dev --cwd examples/cli`
4. **Read Mode-Specific Docs**: Check `lib/README.md` and `cli/README.md`
5. **Create Your Own Tools**: Use the examples as templates
6. **Choose Your Pattern**: Pick the mode that fits your workflow

Both modes provide the same powerful declarative UI capabilities - choose based on your project structure and team preferences! 