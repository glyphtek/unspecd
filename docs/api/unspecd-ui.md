# UnspecdUI Class

The `UnspecdUI` class is the main entry point for creating Unspec'd applications in Library Mode. It manages tools, handles routing, and provides the core application interface.

## Constructor

```typescript
import { UnspecdUI } from '@glyphtek/unspecd';

const app = new UnspecdUI(config: UnspecdUIConfig);
```

### UnspecdUIConfig

```typescript
interface UnspecdUIConfig {
  tools: Array<ToolSpec | ToolConfig>;  // Array of tool definitions (required)
  focusMode?: boolean;                  // Single-tool focus mode
  title?: string;                       // Application title
  port?: number;                        // Default server port (can be overridden in startServer)
}
```

### ToolConfig

```typescript
interface ToolConfig {
  description: string;    // The display description for navigation (overrides spec.title)
  spec: ToolSpec;        // The tool specification defining the behavior and content
  filePath?: string;     // Optional file path for copy command functionality
}
```

## Properties

### `tools: NormalizedTool[]`
Array of normalized tool definitions registered with the application.

```typescript
const app = new UnspecdUI({
  title: 'My App',
  tools: [userToolSpec, orderToolSpec, reportToolSpec]
});

console.log(app.tools.length); // 3
console.log(app.tools[0].id);   // Access tool ID
console.log(app.tools[0].title); // Access tool title
```

### `toolCount: number`
Number of tools registered with the application.

```typescript
console.log(app.toolCount); // 3
```

### `focusMode: boolean`
Whether the application is in focus mode (single tool, no sidebar).

```typescript
console.log(app.focusMode); // false
```

### `title: string | undefined`
The application title if set.

```typescript
console.log(app.title); // 'My App'
```

### `port: number | undefined`
The default server port if set.

```typescript
console.log(app.port); // 3000
```

## Methods

### `init(targetElement?: HTMLElement): void`
Initializes the UI in the specified element (or document body if not provided).

```typescript
// Initialize in document body
app.init();

// Initialize in specific element
const container = document.getElementById('app');
app.init(container);
```

### `toolSummary: Array<{ id: string; title: string }>`
Get a summary of all registered tools.

```typescript
console.log(app.toolSummary);
// [
//   { id: 'users', title: 'User Management' },
//   { id: 'orders', title: 'Order Management' }
// ]
```

## Configuration Options

### Basic Configuration

The UnspecdUI class currently supports these configuration options:

- **`tools`** (required) - Array of ToolSpec objects or ToolConfig objects
- **`focusMode`** (optional) - Hide sidebar and show single tool directly
- **`title`** (optional) - Application title displayed in the UI
- **`port`** (optional) - Default server port (can be overridden in startServer)

## Complete Examples

### Basic Application

```typescript
import { UnspecdUI, startServer } from '@glyphtek/unspecd';
import type { ToolSpec } from '@glyphtek/unspecd';

const userTool: ToolSpec = {
  id: 'users',
  title: 'User Management',
  content: {
    type: 'editableTable',
    dataLoader: { functionName: 'loadData' },
    tableConfig: {
      rowIdentifier: 'id',
      columns: [
        { field: 'name', label: 'Name', isEditable: true },
        { field: 'email', label: 'Email', isEditable: true },
        { field: 'role', label: 'Role', isEditable: true, editorType: 'select' }
      ],
      itemUpdater: { functionName: 'updateUser' }
    }
  },
  functions: {
    loadData: async () => {
      const response = await fetch('/api/users');
      return response.json();
    },
    updateUser: async ({ itemId, changes }) => {
      const response = await fetch(`/api/users/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
      });
      return response.json();
    }
  }
};

const app = new UnspecdUI({
  title: 'My Admin Panel',
  tools: [userTool]
});

// Start the server
await startServer(app);
```

### Advanced Application with Multiple Tools

```typescript
import { UnspecdUI, startServer } from '@glyphtek/unspecd';
import type { ToolSpec, ToolConfig } from '@glyphtek/unspecd';

// Dashboard tool
const dashboardTool: ToolSpec = {
  id: 'dashboard',
  title: 'Dashboard',
  content: {
    type: 'displayRecord',
    dataLoader: { functionName: 'loadStats' },
    displayConfig: {
      fields: [
        { field: 'totalUsers', label: 'Total Users', type: 'number' },
        { field: 'activeUsers', label: 'Active Users', type: 'number' },
        { field: 'revenue', label: 'Monthly Revenue', type: 'currency' },
        { field: 'lastUpdated', label: 'Last Updated', type: 'datetime' }
      ]
    }
  },
  functions: {
    loadStats: async () => {
      const response = await fetch('/api/dashboard/stats');
      return response.json();
    }
  }
};

// User management tool with custom description
const userToolConfig: ToolConfig = {
  description: 'User Administration',
  spec: {
    id: 'users',
    title: 'Users',
    content: {
      type: 'editableTable',
      dataLoader: { functionName: 'loadUsers' },
      tableConfig: {
        rowIdentifier: 'id',
        columns: [
          { field: 'name', label: 'Name', isEditable: true },
          { field: 'email', label: 'Email', isEditable: true },
          { field: 'role', label: 'Role', isEditable: true, editorType: 'select' },
          { field: 'active', label: 'Active', type: 'boolean' },
          { field: 'createdAt', label: 'Created', type: 'datetime' }
        ],
        itemUpdater: { functionName: 'updateUser' }
      }
    },
    functions: {
      loadUsers: async () => {
        const response = await fetch('/api/users');
        return response.json();
      },
      updateUser: async ({ itemId, changes }) => {
        const response = await fetch(`/api/users/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changes)
        });
        return response.json();
      }
    }
  }
};

// Settings tool
const settingsTool: ToolSpec = {
  id: 'settings',
  title: 'Settings',
  content: {
    type: 'editForm',
    dataLoader: { functionName: 'loadSettings' },
    formConfig: {
      fields: [
        { field: 'siteName', label: 'Site Name', type: 'text', required: true },
        { field: 'adminEmail', label: 'Admin Email', type: 'email', required: true },
        { field: 'maintenanceMode', label: 'Maintenance Mode', type: 'boolean' }
      ]
    },
    onSubmit: { functionName: 'saveSettings' }
  },
  functions: {
    loadSettings: async () => {
      const response = await fetch('/api/settings');
      return response.json();
    },
    saveSettings: async ({ formData }) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      return response.json();
    }
  }
};

// Create application with mixed tool types
const app = new UnspecdUI({
  title: 'Admin Dashboard',
  port: 8080,
  tools: [
    dashboardTool,        // Raw ToolSpec
    userToolConfig,       // ToolConfig with custom description
    settingsTool          // Raw ToolSpec
  ]
});

// Start the server with custom configuration
await startServer(app, { port: 8080 });
```

### Focus Mode Application

```typescript
import { UnspecdUI, startServer } from '@glyphtek/unspecd';

const singleTool: ToolSpec = {
  id: 'analytics',
  title: 'Analytics Dashboard',
  content: {
    type: 'displayRecord',
    dataLoader: { functionName: 'loadAnalytics' },
    displayConfig: {
      fields: [
        { field: 'pageViews', label: 'Page Views', type: 'number' },
        { field: 'uniqueVisitors', label: 'Unique Visitors', type: 'number' },
        { field: 'conversionRate', label: 'Conversion Rate', type: 'percentage' }
      ]
    }
  },
  functions: {
    loadAnalytics: async () => {
      const response = await fetch('/api/analytics');
      return response.json();
    }
  }
};

// Focus mode - no sidebar, just the tool
const app = new UnspecdUI({
  title: 'Analytics',
  tools: [singleTool],
  focusMode: true
});

await startServer(app);
```

## Best Practices

### 1. **Tool Organization**
```typescript
// ✅ Good - Organize tools by feature
const app = new UnspecdUI({
  title: 'Admin Panel',
  tools: [
    dashboardTool,    // Overview
    userTool,         // User management
    orderTool,        // Order management
    settingsTool      // Configuration
  ]
});
```

### 2. **Error Handling**
```typescript
// ✅ Good - Comprehensive error handling
const tool: ToolSpec = {
  id: 'users',
  title: 'Users',
  content: { /* ... */ },
  functions: {
    loadData: async () => {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        console.error('Failed to load data:', error);
        throw new Error('Unable to load data. Please try again.');
      }
    }
  }
};
```

### 3. **Configuration Management**
```typescript
// ✅ Good - Environment-based configuration
const config: UnspecdUIConfig = {
  title: process.env.APP_TITLE || 'My App',
  port: parseInt(process.env.PORT || '3000'),
  tools: [/* ... */]
};
```

## Related APIs

- **[Tool Specification](./tool-specification.md)** - Tool definition format
- **[Component Types](./component-types.md)** - Available component types
- **[Server Integration](../guide/library-mode.md)** - Server integration patterns

---

**The UnspecdUI class is your gateway to creating powerful admin interfaces and data management applications!** 🚀 