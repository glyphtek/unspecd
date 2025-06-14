# CLI Mode Examples

This directory demonstrates how to use Unspec'd in **CLI Discovery Mode**, where the CLI automatically discovers and loads tool files based on naming patterns.

## Usage

Run the CLI development server from this directory:

```bash
# First install the package
npm install @glyphtek/unspecd

# From the project root
bun run dist/cli/index.js dev --cwd examples/cli

# Or from this directory
cd examples/cli
bun run ../../dist/cli/index.js dev
```

## File Structure

```
examples/cli/
├── README.md                    # This file
├── unspecd.config.ts           # Configuration file (optional)
├── user-management.tool.ts     # Editable table tool example
├── system-monitor.tool.ts      # Display record tool example  
└── cache-invalidator.tool.ts   # Action button tool example
```

## Tool Files

Each `.tool.ts` file follows this pattern:

1. **File Naming**: Must end with `.tool.ts` for automatic discovery
2. **Default Export**: Must export a `ToolSpec` object as default
3. **Type Safety**: Import `ToolSpec` from the schema for full typing

### Example Tool Structure

```typescript
import type { ToolSpec } from '@glyphtek/unspecd';

const myTool: ToolSpec = {
  id: 'unique-tool-id',
  title: 'Tool Display Name',
  content: {
    type: 'editableTable', // or 'displayRecord', 'actionButton', 'editForm'
    // ... content configuration
  },
  functions: {
    // Async functions used by the tool
    myFunction: async (params: any) => {
      return { success: true };
    }
  }
};

export default myTool;
```

## Configuration

The `unspecd.config.ts` file allows customizing discovery patterns:

```typescript
import type { UnspecdConfig } from '@glyphtek/unspecd/cli';

const config: UnspecdConfig = {
  tools: [
    './*.tool.ts',           // Current directory .tool.ts files
    './tools/**/*.ts',       // All .ts files in tools/ subdirectory
    './admin-tools/*.tool.js' // JavaScript files in admin-tools/
  ]
};

export default config;
```

## Package Installation

When using Unspec'd in your own projects:

```bash
# Install the package
npm install @glyphtek/unspecd

# Or with bun
bun add @glyphtek/unspecd
```

## Import Patterns

The examples show two import patterns:

```typescript
// ✅ Real-world usage (install the package first)
import type { ToolSpec } from '@glyphtek/unspecd';
import type { UnspecdConfig } from '@glyphtek/unspecd/cli';

// 📁 Example usage (for these source examples only)
import type { ToolSpec } from '../../src/lib/dsl-schema.js';
import type { UnspecdConfig } from '../../src/core/discovery.js';
```

## Included Examples

### 1. User Management (`user-management.tool.ts`)
- **Type**: Editable Table
- **Features**: User listing, inline role editing, row actions
- **Functions**: `loadUsers`, `updateUser`, `deactivateUser`

### 2. System Monitor (`system-monitor.tool.ts`)
- **Type**: Display Record
- **Features**: System statistics dashboard
- **Functions**: `loadSystemStats`

### 3. Cache Invalidator (`cache-invalidator.tool.ts`)
- **Type**: Action Button
- **Features**: One-click cache clearing with confirmation
- **Functions**: `clearCaches`

## Content Types

The CLI examples demonstrate all supported content types:

- **`editableTable`**: Interactive data tables with inline editing
- **`displayRecord`**: Read-only key-value displays
- **`actionButton`**: Single-action buttons with confirmations
- **`editForm`**: Form-based data editing (not shown in current examples)

## Discovery Process

When you run `unspecd dev --cwd examples/cli`, the CLI:

1. Searches for `unspecd.config.ts` in the directory
2. Uses tool patterns from config, or defaults to `['./tools/**/*.tool.ts', './*.tool.ts']`
3. Finds all matching files using glob patterns
4. Dynamically imports each file and extracts the default export
5. Validates each export as a valid `ToolSpec`
6. Starts the development server with all discovered tools

## Benefits of CLI Mode

- **Zero Configuration**: Just create `.tool.ts` files and run
- **Auto Discovery**: No manual tool registration needed
- **Flexible Patterns**: Customize discovery with `unspecd.config.ts`
- **File-Based**: Easy to organize tools across multiple files
- **Team Friendly**: Each team member can add tools independently 