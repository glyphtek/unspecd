# Library Mode

Library Mode allows you to embed Unspec'd tools directly into your existing applications. Instead of using the CLI for standalone tools, you programmatically create and configure tools within your codebase.

## Overview

Library Mode is perfect when you want to:
- **Embed tools** in existing applications
- **Programmatically control** tool loading and configuration
- **Integrate** with existing authentication and data systems
- **Customize** the server setup and deployment
- **Build** production applications with internal tools

## Basic Setup

### Installation

```bash
# Using bun (recommended)
bun add @glyphtek/unspecd

# Using npm
npm install @glyphtek/unspecd

# Using yarn
yarn add @glyphtek/unspecd
```

### Simple Example

```typescript
import { UnspecdUI, startServer } from '@glyphtek/unspecd';

// Define your tool
const userTool = {
  id: 'user-management',
  title: 'User Management',
  content: {
    type: 'editableTable',
    columns: {
      name: { type: 'text', label: 'Name', required: true },
      email: { type: 'email', label: 'Email', required: true },
      role: { type: 'select', label: 'Role', options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' }
      ]}
    }
  },
  functions: {
    loadData: async () => {
      const response = await fetch('/api/users');
      return response.json();
    },
    updateRow: async ({ data }) => {
      const response = await fetch(`/api/users/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    }
  }
};

// Create and start the application
const app = new UnspecdUI({ tools: [userTool] });
await startServer(app);

console.log('🚀 Server running at http://localhost:3000');
```

## Core Concepts

### UnspecdUI Class

The `UnspecdUI` class is the main entry point for Library Mode:

```typescript
import { UnspecdUI } from '@glyphtek/unspecd';

const app = new UnspecdUI({
  tools: [tool1, tool2, tool3],  // Array of tools
  focusMode: false               // Optional: enable focus mode
});
```

**Constructor Options:**
- `tools` - Array of ToolSpec objects or ToolConfig objects
- `focusMode` - Boolean to enable single-tool focus mode

### Tool Registration

You can register tools in multiple ways:

#### Raw ToolSpec Objects
```typescript
const app = new UnspecdUI({
  tools: [
    {
      id: 'users',
      title: 'User Management',
      content: { /* ... */ },
      functions: { /* ... */ }
    },
    {
      id: 'orders',
      title: 'Order Management', 
      content: { /* ... */ },
      functions: { /* ... */ }
    }
  ]
});
```

#### ToolConfig Objects (with custom descriptions)
```typescript
const app = new UnspecdUI({
  tools: [
    {
      description: 'Manage System Users',
      spec: userToolSpec,
      filePath: '/path/to/user-tool.ts'  // Optional: for copy commands
    },
    {
      description: 'Process Customer Orders',
      spec: orderToolSpec,
      filePath: '/path/to/order-tool.ts'
    }
  ]
});
```

#### Mixed Approach
```typescript
const app = new UnspecdUI({
  tools: [
    rawToolSpec,  // Direct ToolSpec
    {
      description: 'Custom Name',
      spec: anotherToolSpec
    }
  ]
});
```

### Server Configuration

The `startServer` function starts the development server:

```typescript
import { startServer } from '@glyphtek/unspecd/server';

// Basic usage
await startServer(app);

// With custom configuration
await startServer(app, {
  port: 8080,
  host: true  // Allow external access
});
```

## Advanced Usage

### Environment-Based Configuration

```typescript
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const app = new UnspecdUI({
  tools: isDev ? devTools : prodTools,
  focusMode: isProd  // Focus mode in production
});

await startServer(app, {
  port: isDev ? 3000 : parseInt(process.env.PORT || '8080'),
  host: isDev  // Only allow external access in dev
});
```

### Dynamic Tool Loading

```typescript
async function createApp() {
  // Load tools dynamically
  const tools = await loadToolsFromDatabase();
  
  const app = new UnspecdUI({
    tools: tools.map(toolData => ({
      id: toolData.id,
      title: toolData.title,
      content: JSON.parse(toolData.content),
      functions: await loadToolFunctions(toolData.id)
    }))
  });
  
  return app;
}

const app = await createApp();
await startServer(app);
```

### Integration with Existing APIs

```typescript
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
const authToken = process.env.AUTH_TOKEN;

const userTool = {
  id: 'users',
  title: 'User Management',
  content: {
    type: 'editableTable',
    columns: {
      name: { type: 'text', label: 'Name' },
      email: { type: 'email', label: 'Email' }
    }
  },
  functions: {
    loadData: async () => {
      const response = await fetch(`${apiBaseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load users');
      }
      
      return response.json();
    },
    
    updateRow: async ({ data }) => {
      const response = await fetch(`${apiBaseUrl}/users/${data.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      return response.json();
    }
  }
};
```

### Custom Error Handling

```typescript
const toolWithErrorHandling = {
  id: 'safe-tool',
  title: 'Safe Tool',
  content: { /* ... */ },
  functions: {
    loadData: async () => {
      try {
        const response = await fetch('/api/data');
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('You are not authorized to view this data');
          } else if (response.status === 404) {
            throw new Error('Data not found');
          } else {
            throw new Error('Failed to load data. Please try again.');
          }
        }
        
        return response.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;  // Re-throw with original message
        } else {
          throw new Error('An unexpected error occurred');
        }
      }
    }
  }
};
```

## Production Deployment

### Docker Setup

```dockerfile
# Dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./

EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]
```

### Environment Variables

```typescript
// config.ts
export const config = {
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST === 'true',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
  authToken: process.env.AUTH_TOKEN,
  dbUrl: process.env.DATABASE_URL,
  logLevel: process.env.LOG_LEVEL || 'info'
};

// app.ts
import { config } from './config.js';

const app = new UnspecdUI({
  tools: await loadTools()
});

await startServer(app, {
  port: config.port,
  host: config.host
});
```

### Health Checks

```typescript
import { UnspecdUI, startServer } from '@glyphtek/unspecd';
import express from 'express';

// Create your Unspec'd app
const app = new UnspecdUI({ tools: myTools });

// Add health check endpoint
const healthApp = express();
healthApp.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start both servers
await Promise.all([
  startServer(app, { port: 3000 }),
  healthApp.listen(3001, () => {
    console.log('Health check server running on port 3001');
  })
]);
```

## Integration Patterns

### Express.js Integration

```typescript
import express from 'express';
import { UnspecdUI } from '@glyphtek/unspecd';

const expressApp = express();

// Your existing Express routes
expressApp.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount Unspec'd tools at /admin
const adminTools = new UnspecdUI({
  tools: [userTool, orderTool]
});

// Note: Unspec'd runs its own server, so you'd typically
// run them on different ports or use a reverse proxy
await startServer(adminTools, { port: 3001 });

expressApp.listen(3000, () => {
  console.log('Main app on port 3000, admin tools on port 3001');
});
```

### Next.js Integration

```typescript
// pages/api/admin/[...unspecd].ts
import { UnspecdUI, startServer } from '@glyphtek/unspecd';

const adminApp = new UnspecdUI({
  tools: [adminTools]
});

// In development, you might run Unspec'd separately
if (process.env.NODE_ENV === 'development') {
  startServer(adminApp, { port: 3001 });
}

export default function handler(req, res) {
  // Proxy to Unspec'd server or handle differently
  res.redirect('http://localhost:3001');
}
```

### Authentication Integration

```typescript
const authenticatedTool = {
  id: 'secure-tool',
  title: 'Secure Tool',
  content: { /* ... */ },
  functions: {
    loadData: async ({ inputs }) => {
      // Get user from context (you'd implement this)
      const user = await getCurrentUser(inputs.authToken);
      
      if (!user) {
        throw new Error('Authentication required');
      }
      
      if (!user.hasPermission('read:users')) {
        throw new Error('Insufficient permissions');
      }
      
      // Load data with user context
      return loadUserData(user);
    }
  }
};

// Pass auth context through inputs
const app = new UnspecdUI({
  tools: [
    {
      ...authenticatedTool,
      inputs: {
        authToken: getCurrentAuthToken()
      }
    }
  ]
});
```

## Best Practices

### 1. **Organize Tools by Domain**

```typescript
// tools/users.ts
export const userTools = [userManagement, userReports];

// tools/orders.ts  
export const orderTools = [orderManagement, orderAnalytics];

// app.ts
import { userTools } from './tools/users.js';
import { orderTools } from './tools/orders.js';

const app = new UnspecdUI({
  tools: [...userTools, ...orderTools]
});
```

### 2. **Use Environment-Specific Configuration**

```typescript
const tools = process.env.NODE_ENV === 'development' 
  ? [...devTools, ...debugTools]
  : prodTools;

const app = new UnspecdUI({ tools });
```

### 3. **Implement Proper Error Boundaries**

```typescript
functions: {
  loadData: async () => {
    try {
      return await fetchData();
    } catch (error) {
      console.error('Data loading error:', error);
      throw new Error('Unable to load data. Please contact support.');
    }
  }
}
```

### 4. **Use TypeScript for Type Safety**

```typescript
import type { ToolSpec } from '@glyphtek/unspecd';

const userTool: ToolSpec = {
  id: 'users',
  title: 'User Management',
  content: {
    type: 'editableTable',
    columns: {
      name: { type: 'text', label: 'Name' },
      email: { type: 'email', label: 'Email' }
    }
  },
  functions: {
    loadData: async (): Promise<User[]> => {
      // TypeScript ensures return type matches
      return await fetchUsers();
    }
  }
};
```

## Troubleshooting

### Common Issues

**Port Already in Use:**
```typescript
await startServer(app, { port: 3001 }); // Try different port
```

**Module Import Errors:**
```typescript
// Use correct import paths
import { UnspecdUI } from '@glyphtek/unspecd';
import { startServer } from '@glyphtek/unspecd/server';
```

**Function Execution Errors:**
- Check that function names match between content and functions
- Ensure functions return appropriate data types
- Add proper error handling with user-friendly messages

**TypeScript Errors:**
```bash
# Install TypeScript if needed
npm install -g typescript tsx

# Or use bun directly
bun your-app.ts
```

## Related Topics

- 🔧 [Tool Specifications](./tool-specifications.md) - How to define tools
- 🎯 [CLI Usage](./cli.md) - Alternative CLI approach
- 📖 [Getting Started](./getting-started.md) - Basic setup
- 💡 [Examples](../examples/) - Real-world implementations

---

**Library Mode gives you full control over your Unspec'd tools!** Perfect for production applications and custom integrations. 🚀 