# Library Mode Examples

This directory demonstrates how to use Unspec'd in **Library Mode**, where you directly create a `UnspecdUI` instance and pass it to `startServer()`.

## Usage

Run the library mode example:

```bash
# From the project root
bun run ./examples/lib/index.ts

# The server will start automatically on http://localhost:3000
```

## Key Concepts

Library Mode is the **simplest way** to use Unspec'd:

1. **Direct Control**: You explicitly create the `UnspecdUI` instance
2. **No Discovery**: No file system scanning or complex patterns
3. **Two Lines**: Just `new UnspecdUI()` and `startServer(app)`
4. **Full TypeScript**: Complete type safety and IntelliSense

## Basic Example

```typescript
// Install the package: npm install @glyphtek/unspecd
import { UnspecdUI, startServer } from '@glyphtek/unspecd';
import { myTool1, myTool2 } from './my-tools.js';

// Create the app instance
const app = new UnspecdUI({
  tools: [myTool1, myTool2]
});

// Start the server - that's it!
await startServer(app);
```

## Tool Creation

Tools in library mode are just TypeScript objects/constants:

```typescript
import type { ToolSpec } from '@glyphtek/unspecd';

export const myTool: ToolSpec = {
  id: 'my-tool',
  title: 'My Tool',
  content: {
    type: 'displayRecord',
    dataLoader: { functionName: 'loadData' },
    displayConfig: {
      fields: [
        { field: 'name', label: 'Name' },
        { field: 'value', label: 'Value' }
      ]
    }
  },
  functions: {
    loadData: async () => ({ name: 'Example', value: '42' })
  }
};
```

## File Structure

```
examples/lib/
├── README.md                      # This file
├── index.ts                       # Main library mode example
├── user-role-editor.ts           # Complex tool with forms and tables
├── live-signups-counter.ts       # Real-time data display
├── promo-code-generator.ts       # Action-based tool
├── live-orders-dashboard.ts      # Streaming table example
├── github-firehose-viewer.ts     # Live GitHub events
├── simple-department-list.ts     # Basic editable table
├── task-dashboard.ts             # Complex dashboard tool
├── column-shorthand-test.ts      # Column configuration testing
├── batch-order-updater.ts        # Bulk operations example
└── server-api-demo.ts            # Server API demonstration
```

## Main Example (`index.ts`)

The main example shows the cleanest possible library mode usage:

```typescript
// In real projects, you would install and import from the package:
import { UnspecdUI, startServer } from '@glyphtek/unspecd';

// Import your tools
import { userRoleEditorTool } from './user-role-editor.js';
import { liveSignupsCounterTool } from './live-signups-counter.js';
// ... more imports

// Create the app with your tools
const app = new UnspecdUI({
  tools: [
    userRoleEditorTool,
    liveSignupsCounterTool,
    // ... add all your tools
  ]
});

// Start the server
await startServer(app);
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
import { UnspecdUI, startServer } from '@glyphtek/unspecd';
import type { ToolSpec } from '@glyphtek/unspecd';

// 📁 Example usage (for these source examples only)
import { UnspecdUI } from '../../src/lib/index.js';
import { startServer } from '../../src/lib/server.js';
import type { ToolSpec } from '../../src/lib/dsl-schema.js';
```

## Included Tool Examples

Each tool file demonstrates different patterns and capabilities:

### Core Patterns
- **`user-role-editor.ts`**: Complex multi-section tool with forms and tables
- **`simple-department-list.ts`**: Basic editable table pattern
- **`promo-code-generator.ts`**: Action button with form inputs

### Real-time Features  
- **`live-signups-counter.ts`**: Live updating counters and stats
- **`live-orders-dashboard.ts`**: Streaming table with mock data
- **`github-firehose-viewer.ts`**: Real GitHub events via SSE

### Advanced Features
- **`task-dashboard.ts`**: Complex dashboard with multiple sections
- **`batch-order-updater.ts`**: Bulk operations and batch processing
- **`column-shorthand-test.ts`**: Testing simplified column definitions

### Development Tools
- **`server-api-demo.ts`**: Demonstrates programmatic server usage

## Benefits of Library Mode

- **Simplicity**: Just two lines to start a server
- **Control**: You decide exactly which tools to include
- **Performance**: No file system scanning or discovery overhead
- **Flexibility**: Easy to conditionally include tools or apply logic
- **Debugging**: Direct imports make debugging straightforward
- **IntelliSense**: Full TypeScript support with autocomplete

## vs CLI Mode

| Aspect | Library Mode | CLI Mode |
|--------|-------------|----------|
| **Setup** | 2 lines of code | File naming + CLI command |
| **Discovery** | Manual imports | Auto-discovery |
| **Configuration** | Direct in code | `unspecd.config.ts` |
| **TypeScript** | Full IntelliSense | Import-based |
| **Flexibility** | Complete control | Pattern-based |
| **Debugging** | Direct | Module loading |

## When to Use Library Mode

Choose Library Mode when you want:

- **Maximum simplicity** - just run one file
- **Direct control** over which tools are loaded
- **No configuration files** or discovery patterns
- **Easy integration** into existing projects
- **Full TypeScript support** with autocomplete
- **Quick prototyping** of tools and ideas

Library Mode is perfect for getting started, prototyping, or when you prefer explicit imports over file system conventions. 