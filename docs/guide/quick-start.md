# Quick Start

Get up and running with Unspec'd in under 5 minutes. Choose your preferred approach:

## CLI Mode (Recommended for Beginners)

Perfect for rapid prototyping and team collaboration.

### 1. Install Unspec'd

```bash
# Install globally
npm install -g @glyphtek/unspecd

# Or use npx (no installation required)
npx @glyphtek/unspecd --version
```

### 2. Initialize Your Project

```bash
# Create a new directory
mkdir my-tools && cd my-tools

# Initialize Unspec'd project
npx @glyphtek/unspecd init
```

This creates:
- `.unspecd/` - Configuration and build files
- `tools/` - Directory for your tool files (optional)

### 3. Create Your First Tool

Create `hello.tool.ts`:

```typescript
export default {
  id: 'hello-world',
  title: 'Hello World',
  content: {
    type: 'displayRecord' as const,
    dataLoader: {
      functionName: 'loadMessage'
    },
    displayConfig: {
      fields: [
        { field: 'message', label: 'Message' },
        { field: 'timestamp', label: 'Created At', formatter: 'datetime' }
      ]
    }
  },
  functions: {
    loadMessage: async () => ({
      message: 'Hello from Unspec\'d! 🚀',
      timestamp: new Date()
    })
  }
};
```

### 4. Start the Dashboard

```bash
# Start development server with auto-discovery
npx @glyphtek/unspecd dev

# Or run a specific tool in focus mode
npx @glyphtek/unspecd exec hello.tool.ts
```

Visit `http://localhost:3000` to see your tool!

## Library Mode (For Existing Applications)

Perfect for embedding tools in existing applications.

### 1. Install the Package

```bash
# Using bun (recommended)
bun add @glyphtek/unspecd

# Using npm
npm install @glyphtek/unspecd

# Using yarn
yarn add @glyphtek/unspecd
```

### 2. Create Your Tool File

Create `my-tool.ts`:

```typescript
import { UnspecdUI } from '@glyphtek/unspecd';
import { startServer } from '@glyphtek/unspecd/server';

const userManagement = {
  id: 'user-management',
  title: 'User Management',
  content: {
    type: 'editableTable' as const,
    columns: {
      name: { type: 'text', label: 'Full Name' },
      email: { type: 'text', label: 'Email Address' },
      role: { 
        type: 'select', 
        label: 'Role',
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' },
          { value: 'viewer', label: 'Viewer' }
        ]
      },
      active: { type: 'boolean', label: 'Active' }
    }
  },
  functions: {
    loadData: async () => [
      { id: 1, name: 'John Doe', email: 'john@company.com', role: 'admin', active: true },
      { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'user', active: true },
      { id: 3, name: 'Bob Wilson', email: 'bob@company.com', role: 'viewer', active: false }
    ],
    updateRow: async (data: any) => {
      console.log('Updating user:', data);
      // Your update logic here
      return { success: true };
    },
    deleteRow: async (id: number) => {
      console.log('Deleting user:', id);
      // Your delete logic here
      return { success: true };
    }
  }
};

// Create and start the application
const app = new UnspecdUI({ 
  tools: [userManagement],
  title: 'My Admin Dashboard'
});

await startServer(app);
console.log('🚀 Server running at http://localhost:3000');
```

### 3. Run Your Application

```bash
# Using bun
bun my-tool.ts

# Using Node.js
npx tsx my-tool.ts
```

## Next Steps

### Explore Components

Try different content types:

```typescript
// Display Record - Show single record
content: { type: 'displayRecord', /* ... */ }

// Editable Table - CRUD operations
content: { type: 'editableTable', /* ... */ }

// Edit Form - Single record editing
content: { type: 'editForm', /* ... */ }

// Action Button - Custom actions
content: { type: 'actionButton', /* ... */ }

// Streaming Table - Real-time data
content: { type: 'streamingTable', /* ... */ }
```

### Add Multiple Tools

```typescript
const app = new UnspecdUI({ 
  tools: [
    userManagement,
    orderDashboard,
    reportGenerator
  ]
});
```

### Configure Development

```typescript
// UnspecdUI constructor options
const app = new UnspecdUI({ 
  tools: [/* ... */],
  focusMode: true // Hide sidebar for single tool
});

// Server configuration (port, host, etc.)
await startServer(app, {
  port: 3000,
  host: true // Allow external access
});
```

## Common Patterns

### Data Loading with API

```typescript
functions: {
  loadData: async () => {
    const response = await fetch('https://api.example.com/users');
    return response.json();
  }
}
```

### Form Validation

```typescript
functions: {
  validateAndSave: async (data: any) => {
    if (!data.email?.includes('@')) {
      throw new Error('Invalid email address');
    }
    // Save logic here
    return { success: true };
  }
}
```

### Environment Configuration

```typescript
const isDev = process.env.NODE_ENV === 'development';

const app = new UnspecdUI({
  tools: [/* ... */],
  focusMode: !isDev // Focus mode in production
});

await startServer(app, {
  port: isDev ? 3000 : parseInt(process.env.PORT || '8080'),
  host: isDev // Only allow external access in dev
});
```

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Use a different port
npx @glyphtek/unspecd dev --port 3001
```

**TypeScript errors:**
```bash
# Install TypeScript if needed
npm install -g typescript tsx
```

**Module not found:**
```bash
# Make sure you're in the right directory
# Check your import paths
```

### Getting Help

- 📖 [Full Documentation](./getting-started.md)
- 💡 [Examples](../examples/)
- 🐛 [GitHub Issues](https://github.com/glyphtek/unspecd/issues)
- 💬 [Discussions](https://github.com/glyphtek/unspecd/discussions)

---

**Ready to build something amazing?** Check out our [comprehensive examples](../examples/) or dive into the [full guide](./getting-started.md)! 