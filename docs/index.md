---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Unspec'd Framework"
  text: "Declarative UI for Internal Tools"
  tagline: Build interactive dashboards, tables, and forms with simple TypeScript specifications
  image:
    src: /logo.svg
    alt: Unspec'd Framework
  actions:
    - theme: brand
      text: Get Started
      link: ./guide/getting-started
    - theme: alt
      text: View Examples
      link: ./examples/
    - theme: alt
      text: View on GitHub
      link: https://github.com/glyphtek/unspecd

features:
  - icon: ⚡️
    title: Lightning Fast Development
    details: Build powerful internal tools in minutes, not hours. Define your UI with simple TypeScript specifications.
  - icon: 🎨
    title: Premium UI Components
    details: Beautiful, responsive components with focus mode, active states, and modern design patterns out of the box.
  - icon: 🔧
    title: Flexible & Extensible
    details: Works with both Bun and Node.js. Library mode for embedded usage or CLI for quick prototyping.
  - icon: 📊
    title: Data-Driven
    details: Built-in support for tables, forms, live updates, and streaming data with minimal configuration.
  - icon: 🚀
    title: TypeScript First
    details: Full TypeScript support with intelligent auto-completion and type safety throughout your entire application.
  - icon: 🎯
    title: Developer Experience
    details: Hot reload, copy commands, comprehensive error handling, and debugging tools for smooth development.
---

## Quick Start

::: code-group

```bash [CLI Mode (Rapid Prototyping)]
# Install and initialize
npx @glyphtek/unspecd init

# Create a tool file
echo 'export default { 
  id: "hello", 
  title: "Hello World", 
  content: { 
    type: "displayRecord", 
    dataLoader: { functionName: "loadData" },
    displayConfig: { fields: [{ field: "message", label: "Message" }] }
  }, 
  functions: { loadData: async () => ({ message: "Hello from Unspecd!" }) } 
}' > hello.tool.ts

# Start dashboard
unspecd dev
```

```bash [Library Mode (Embedded)]
# Install the package
bun add @glyphtek/unspecd

# Create hello-world.ts and run it
bun hello-world.ts
```

:::

## Minimal Example

Create `hello-world.ts`:

```typescript
import { UnspecdUI } from '@glyphtek/unspecd';
import { startServer } from '@glyphtek/unspecd/server';

// Minimal tool example - just displays a message
const helloTool = {
  id: 'hello-world',
  title: 'Hello World',
  content: {
    type: 'displayRecord' as const,
    dataLoader: {
      functionName: 'loadMessage'
    },
    displayConfig: {
      fields: [
        {
          field: 'message',
          label: 'Message'
        },
        {
          field: 'timestamp',
          label: 'Created At',
          formatter: 'datetime'
        }
      ]
    }
  },
  functions: {
    loadMessage: async () => {
      return {
        message: 'Hello from Unspec\'d! 🚀',
        timestamp: new Date()
      };
    }
  }
};

// Start the server
const app = new UnspecdUI({ tools: [helloTool] });
await startServer(app);
```

Run it: `bun hello-world.ts` → Opens at http://localhost:3000

### CLI Mode - Perfect for Teams

```bash
unspecd init                    # Initialize project
unspecd dev                     # Dashboard with auto-discovery  
unspecd exec my-tool.ts         # Focus mode for single tool
```

### Library Mode - Perfect for Apps

Create your first tool:

```typescript
import { UnspecdUI, startServer } from '@glyphtek/unspecd'

const userEditor = {
  id: 'user-editor',
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
    loadData: async () => {
      return [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
      ]
    },
    updateUser: async (userData) => {
      // Update user logic here
      return { success: true }
    }
  }
}

// Start the server
const app = new UnspecdUI({ tools: [userEditor] })
await startServer(app)
```

That's it! Your internal tool is now running with a beautiful, interactive interface.

## Why Unspec'd?

### 🎯 **Built for Internal Tools**
Stop building the same CRUD interfaces over and over. Unspec'd gives you powerful components specifically designed for internal dashboards, admin panels, and data management tools.

### ⚡ **Instant Productivity**
- **Zero Configuration**: Start building immediately with sensible defaults
- **Hot Reload**: See changes instantly during development  
- **Copy Commands**: Easily share and execute your tools via CLI
- **Focus Mode**: Single-tool interfaces for embedded usage

### 🏗️ **Production Ready**
- **TypeScript Native**: Full type safety and IntelliSense support
- **Responsive Design**: Works beautifully on desktop and mobile
- **Error Handling**: Comprehensive error states and debugging tools
- **Performance**: Optimized for large datasets and real-time updates

### 🔌 **Flexible Deployment**
- **Library Mode**: Embed in existing applications
- **CLI Mode**: Quick prototyping and standalone tools
- **Server Options**: Works with any Node.js or Bun environment
- **API Integration**: Easy connection to existing backends

---

<div class="text-center py-8">
  <p class="text-lg font-medium text-gray-600 dark:text-gray-400">
    Ready to build something amazing?
  </p>
  <div class="mt-4 space-x-4">
    <a href="./guide/getting-started" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
      Get Started →
    </a>
    <a href="./examples/" class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
      View Examples
    </a>
  </div>
</div> 