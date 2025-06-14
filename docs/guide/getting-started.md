# Getting Started

Welcome to Unspec'd! This guide will help you get up and running with the framework in just a few minutes.

## What You'll Build

In this guide, you'll create a simple user management tool with:
- A data table showing users
- Inline editing capabilities  
- Real-time updates
- Beautiful, responsive UI

## Prerequisites

- **Node.js 18+** or **Bun 1.0+**
- **TypeScript** knowledge (recommended)
- A code editor with TypeScript support

## Installation

::: code-group

```bash [bun (recommended)]
bun add @glyphtek/unspecd
```

```bash [npm]
npm install @glyphtek/unspecd
```

```bash [yarn]
yarn add @glyphtek/unspecd
```

:::

## Usage Modes

Unspec'd supports two main usage modes:

### 📚 **Library Mode** 
Programmatic API for embedding in existing applications

### 🖥️ **CLI Mode**
Command-line tool for rapid prototyping and standalone tools

---

## Library Mode

Perfect for embedding tools in existing applications or building custom dashboards.

### Your First Tool

Create a new file called `user-tool.ts`:

```typescript
import { UnspecdUI, startServer } from '@glyphtek/unspecd'

// Define your tool specification
const userTool = {
  id: 'user-management',
  title: 'User Management Dashboard',
  content: {
    type: 'editableTable',
    columns: {
      name: { 
        type: 'text', 
        label: 'Full Name',
        required: true 
      },
      email: { 
        type: 'text', 
        label: 'Email Address',
        required: true 
      },
      role: { 
        type: 'select', 
        label: 'Role',
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'editor', label: 'Editor' },
          { value: 'viewer', label: 'Viewer' }
        ]
      },
      status: {
        type: 'select',
        label: 'Status',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]
      }
    }
  },
  functions: {
    // Load user data
    loadData: async () => {
      return [
        { 
          id: 1, 
          name: 'John Doe', 
          email: 'john@example.com', 
          role: 'admin',
          status: 'active'
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          email: 'jane@example.com', 
          role: 'editor',
          status: 'active'
        },
        { 
          id: 3, 
          name: 'Bob Johnson', 
          email: 'bob@example.com', 
          role: 'viewer',
          status: 'inactive'
        }
      ]
    },
    
    // Update a user
    updateUser: async (userData) => {
      console.log('Updating user:', userData)
      // In a real app, you'd save to your database here
      return { success: true, message: 'User updated successfully!' }
    },
    
    // Create a new user
    createUser: async (userData) => {
      console.log('Creating user:', userData)
      // In a real app, you'd save to your database here
      return { 
        success: true, 
        data: { ...userData, id: Date.now() },
        message: 'User created successfully!' 
      }
    },
    
    // Delete a user
    deleteUser: async ({ id }) => {
      console.log('Deleting user:', id)
      // In a real app, you'd delete from your database here
      return { success: true, message: 'User deleted successfully!' }
    }
  }
}

// Start the development server
const app = new UnspecdUI({ tools: [userTool] })
await startServer(app)
```

### Run Your Tool

::: code-group

```bash [bun]
bun user-tool.ts
```

```bash [node]
npx tsx user-tool.ts
```

:::

Open your browser to `http://localhost:3000` and you'll see your user management tool running!

---

## CLI Mode

Perfect for rapid prototyping, team collaboration, and standalone tool development.

### Quick Start with CLI

1. **Initialize a new project**:
```bash
npx @glyphtek/unspecd init
```

2. **Create a tool file** (`user-management.tool.ts`):
```typescript
import type { ToolSpec } from '@glyphtek/unspecd'

const userManagement: ToolSpec = {
  id: 'user-management',
  title: 'User Management',
  content: {
    type: 'editableTable',
    columns: {
      name: { type: 'text', label: 'Name' },
      email: { type: 'text', label: 'Email' },
      role: { 
        type: 'select', 
        label: 'Role',
        options: [
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' }
        ]
      }
    }
  },
  functions: {
    loadData: async () => [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
    ],
    updateUser: async (userData) => ({ success: true })
  }
}

export default userManagement
```

3. **Start the development server**:
```bash
unspecd dev
```

### CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `unspecd init` | Initialize a new project | `unspecd init` |
| `unspecd dev` | Dashboard Mode - auto-discover tools | `unspecd dev --cwd ./my-tools` |
| `unspecd exec <file>` | Focus Mode - run single tool | `unspecd exec user-tool.ts` |

### File Discovery

The CLI automatically discovers files with these patterns:
- `*.tool.ts` - Tool files in current directory
- `tools/**/*.ts` - All TypeScript files in `tools/` folder

### Configuration

Create `unspecd.config.ts` for custom discovery patterns:

```typescript
import type { UnspecdConfig } from '@glyphtek/unspecd/cli'

const config: UnspecdConfig = {
  tools: [
    './admin-tools/*.tool.ts',
    './dashboard/*.ts',
    './monitoring/**/*.tool.js'
  ]
}

export default config
```

---

## What You Get

Your tool now includes:

✅ **Data Table**: Clean, sortable table showing all users  
✅ **Inline Editing**: Click any cell to edit user information  
✅ **Add New Users**: Create button for adding new entries  
✅ **Delete Users**: Remove users with confirmation  
✅ **Real-time Updates**: Changes appear instantly  
✅ **Responsive Design**: Works on desktop and mobile  
✅ **Error Handling**: Graceful error states and validation  

## Focus Mode

Want to embed just this tool in an existing app? Enable focus mode:

**Library Mode:**
```typescript
const app = new UnspecdUI({ 
  tools: [userTool],
  focusMode: true // Single tool, no sidebar
})
```

**CLI Mode:**
```bash
unspecd exec user-tool.ts
```

## Multiple Tools

Add more tools to create a dashboard:

**Library Mode:**
```typescript
const reportTool = {
  id: 'reports',
  title: 'Analytics Dashboard',
  content: {
    type: 'displayRecord',
    fields: {
      totalUsers: { label: 'Total Users', type: 'number' },
      activeUsers: { label: 'Active Users', type: 'number' },
      revenue: { label: 'Monthly Revenue', type: 'currency' }
    }
  },
  functions: {
    loadData: async () => ({
      totalUsers: 1250,
      activeUsers: 980,
      revenue: 45780
    })
  }
}

const app = new UnspecdUI({ tools: [userTool, reportTool] })
```

**CLI Mode:**
Just create multiple `.tool.ts` files - they're auto-discovered!

```
my-project/
├── user-management.tool.ts
├── analytics.tool.ts
├── system-monitor.tool.ts
└── cache-admin.tool.ts
```

## Next Steps

- **[Examples](/examples/)** - Explore real-world tool examples
- **[API Reference](/api/)** - Complete API documentation
- **[GitHub Repository](https://github.com/glyphtek/unspecd)** - Source code and examples 