# Unspec'd 🚀

<p align="center">
  <a href="https://github.com/glyphtek/unspecd/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status"></a>
  <a href="https://github.com/glyphtek/unspecd/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License"></a>
  <a href="https://www.npmjs.com/package/@glyphtek/unspecd"><img src="https://img.shields.io/npm/v/@glyphtek/unspecd" alt="NPM Version"></a>
  <a href="https://github.com/glyphtek/unspecd/stargazers"><img src="https://img.shields.io/github/stars/glyphtek/unspecd?style=social" alt="GitHub Stars"></a>
</p>

<p align="center">
  <b>Define a spec, get a UI. The internal tooling framework that's faster and simpler than you'd expect.</b>
</p>

<p align="center">
  Transform TypeScript specifications into production-ready admin panels, dashboards, and internal tools. 
  <br>
  No frontend expertise required. Just pure TypeScript and clear conventions.
</p>

---

## 📋 Table of Contents

- [✨ What is Unspec'd?](#-what-is-unspecd)
- [🌟 Key Features](#-key-features)
- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [📖 Core Concepts](#-core-concepts)
- [📚 Examples](#-examples)
- [🛠️ Advanced Features](#️-advanced-features)
- [🔧 CLI Commands](#-cli-commands)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [🌐 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ What is Unspec'd?

Building internal tools often feels like choosing between two painful options: wrestling with complex frontend frameworks or waiting months for a dedicated frontend team. **Unspec'd** offers a third path.

Unspec'd is a **declarative UI framework** designed for backend and TypeScript developers who know exactly what data they need, but don't want to get bogged down in frontend complexity.

### 🎯 Core Philosophy

The idea is elegantly simple: **you define a clear, typed "spec" for your tool**—a table, form, dashboard, or workflow—and Unspec'd translates it into a dynamic, production-ready user interface. 

- **You focus on data and business logic** (what you're good at)
- **Unspec'd handles the UI complexity** (what it's good at)
- **Result**: Tools built in minutes, not weeks

## 🌟 Key Features

### 🎨 **Declarative, Spec-Based UI**
Define complex interfaces like editable tables, multi-step forms, and real-time dashboards using simple, readable TypeScript objects. You declare _what_ you want, and the framework handles the _how_.

### 🔧 **Backend-Developer-Focused**
Write your data fetching, updates, and business logic in plain, asynchronous TypeScript functions. If you can write a `Promise`, you can build a tool with Unspec'd.

### ⚡ **Powerful Smart Components**
Leverage a rich library of pre-built components that handle the hard parts of UI development:
- **SmartTable**: Sortable, filterable, editable tables with real-time updates
- **SmartForm**: Multi-step forms with validation and dynamic fields
- **ActionButton**: Server-side actions with loading states and feedback
- **DisplayRecord**: Beautiful data presentation with custom formatting
- **StreamingTable**: Real-time data streaming with automatic updates

### 🔒 **Type-Safe by Design**
The entire spec is strongly typed, giving you autocompletion in your editor and catching errors before you even run your code. Your IDE becomes your primary development partner.

### 🤖 **AI-Ready Architecture**
The structured, predictable nature of Unspec'd specs makes them perfect targets for AI-assisted code generation, enabling even faster development workflows.

### 🚀 **Multiple Usage Modes**
- **Library Mode**: Import as a dependency and integrate into existing projects
- **CLI Mode**: Auto-discovery of tools with zero configuration
- **Development Server**: Hot-reload development environment with instant preview

## 📦 Installation

```bash
# npm
npm install @glyphtek/unspecd

# yarn
yarn add @glyphtek/unspecd

# pnpm
pnpm add @glyphtek/unspecd

# bun
bun add @glyphtek/unspecd
```

## 🚀 Quick Start

### Option 1: Library Mode (Recommended)

Create a new file and start building:

```typescript
// my-dashboard.ts
import { UnspecdUI, startServer } from '@glyphtek/unspecd';

const userManagementTool = {
  id: 'user-management',
  title: 'User Management',
  content: {
    type: 'smartTable',
    description: 'Manage system users with inline editing capabilities.',
    tableConfig: {
      columns: [
        { label: 'Name', field: 'name', editable: true },
        { label: 'Email', field: 'email', editable: true },
        { label: 'Role', field: 'role', editable: true },
        { label: 'Status', field: 'status', type: 'badge' }
      ],
      enableInlineEdit: true,
      enableRefresh: true
    },
    dataSource: {
      functionName: 'fetchUsers'
    },
    updateSource: {
      functionName: 'updateUser'
    }
  },
  functions: {
    fetchUsers: async () => {
      // Your data fetching logic
      return {
        items: [
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' }
        ]
      };
    },
    updateUser: async (params: any) => {
      console.log('Updating user:', params);
      // Your update logic here
      return { success: true };
    }
  }
};

// Initialize and start server
const app = new UnspecdUI({ tools: [userManagementTool] });
await startServer(app);
```

Run your dashboard:
```bash
bun run my-dashboard.ts
# Server starts at http://localhost:3000
```

### Option 2: CLI Mode (Zero Configuration)

1. **Initialize a new project:**
```bash
npx @glyphtek/unspecd init
bun install
```

2. **Create tool files:**
```typescript
// analytics-dashboard.tool.ts
export default {
  id: 'analytics',
  title: 'Analytics Dashboard',
  content: {
    type: 'displayRecord',
    description: 'Real-time analytics overview',
    displayConfig: {
      fields: [
        { label: 'Active Users', field: 'activeUsers', type: 'number' },
        { label: 'Revenue', field: 'revenue', type: 'currency' },
        { label: 'Conversion Rate', field: 'conversionRate', type: 'percentage' }
      ]
    },
    dataSource: { functionName: 'getAnalytics' }
  },
  functions: {
    getAnalytics: async () => ({
      activeUsers: 1247,
      revenue: 48392.50,
      conversionRate: 3.24
    })
  }
};
```

3. **Start the development server:**
```bash
bunx unspecd dev
# Auto-discovers all *.tool.ts files
# Server starts at http://localhost:3000
```

## 📖 Core Concepts

### Tool Specification

Every tool in Unspec'd follows a simple structure:

```typescript
interface ToolSpec {
  id: string;           // Unique identifier
  title: string;        // Display name
  content: Content;     // UI specification
  functions?: Functions; // Server-side logic
}
```

### Content Types

Unspec'd provides several powerful content types:

#### SmartTable
Perfect for data management with CRUD operations:
```typescript
content: {
  type: 'smartTable',
  tableConfig: {
    columns: [
      { label: 'Name', field: 'name', editable: true },
      { label: 'Status', field: 'status', type: 'badge' }
    ],
    enableInlineEdit: true,
    enableRefresh: true
  },
  dataSource: { functionName: 'fetchData' },
  updateSource: { functionName: 'updateRecord' }
}
```

#### SmartForm
For data input and multi-step workflows:
```typescript
content: {
  type: 'smartForm',
  formConfig: {
    fields: [
      { label: 'Full Name', field: 'name', editorType: 'text', required: true },
      { label: 'Department', field: 'dept', editorType: 'select', 
        options: ['Engineering', 'Sales', 'Marketing'] }
    ]
  },
  submitAction: { functionName: 'createUser' }
}
```

#### ActionButton
For triggering server-side actions:
```typescript
content: {
  type: 'actionButton',
  description: 'Generate monthly reports',
  buttonConfig: { label: 'Generate Reports', variant: 'primary' },
  action: { 
    functionName: 'generateReports',
    onSuccess: { message: 'Reports generated successfully!' }
  }
}
```

#### StreamingTable
For real-time data updates:
```typescript
content: {
  type: 'streamingTable',
  tableConfig: {
    columns: [
      { label: 'Order ID', field: 'orderId' },
      { label: 'Status', field: 'status', type: 'badge' },
      { label: 'Amount', field: 'amount', type: 'currency' }
    ],
    maxRows: 100
  },
  streamingSource: { functionName: 'orderStream' }
}
```

## 📚 Examples

The framework includes comprehensive examples:

### Library Mode Examples
- **User Role Editor**: Complete user management with role assignment
- **Task Dashboard**: Project management with real-time updates  
- **Batch Order Updater**: Bulk operations with progress tracking
- **GitHub Firehose Viewer**: Real-time event streaming
- **Live Orders Dashboard**: E-commerce order monitoring

### CLI Mode Examples
- **System Monitor**: Server health and performance metrics
- **Cache Invalidator**: Redis cache management interface
- **User Management**: CRUD operations with validation

Run any example:
```bash
# Library mode
bun run examples/lib/user-role-editor.ts

# CLI mode  
bunx unspecd dev --cwd examples/cli
```

## 🛠️ Advanced Features

### Custom Styling
Unspec'd uses Tailwind CSS and provides customization options:
```typescript
content: {
  type: 'smartTable',
  tableConfig: {
    className: 'custom-table-styles',
    rowClassName: (item) => item.priority === 'high' ? 'bg-red-50' : ''
  }
}
```

### Data Transformation
Transform data before display:
```typescript
content: {
  dataSource: {
    functionName: 'fetchRawData',
    transform: (data) => data.map(item => ({
      ...item,
      displayName: `${item.firstName} ${item.lastName}`
    }))
  }
}
```

### Error Handling
Built-in error handling with custom messages:
```typescript
functions: {
  riskyOperation: async (params) => {
    try {
      return await performOperation(params);
    } catch (error) {
      return { 
        error: true, 
        message: 'Operation failed. Please try again.' 
      };
    }
  }
}
```

## 🔧 CLI Commands

```bash
# Initialize new project
unspecd init

# Start development server with auto-discovery
unspecd dev [directory]

# Run specific tool file
unspecd exec <tool-file>

# Development server with custom port
unspecd dev --port 8080

# Help
unspecd --help
```

## 📁 Project Structure

```
my-unspecd-project/
├── package.json
├── unspecd.config.ts          # Optional configuration
├── tools/                     # CLI mode tools
│   ├── users.tool.ts
│   ├── analytics.tool.ts
│   └── reports.tool.ts
└── src/                       # Library mode integration
    └── dashboard.ts
```

## 🔧 Configuration

### unspecd.config.ts
```typescript
export default {
  tools: [
    '**/*.tool.ts',           // Auto-discover pattern
    'custom/admin-*.ts',      // Custom patterns
    'src/tools/**/*.ts'
  ]
};
```

### TypeScript Configuration
Unspec'd works best with modern TypeScript:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 🌐 Deployment

### Production Build
```bash
# Build for production
bun run build

# Deploy built assets
npm publish
```

### Docker Deployment
```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the linter**: `bun run lint`
5. **Submit a pull request**

### Development Setup
```bash
git clone https://github.com/glyphtek/unspecd.git
cd unspecd
bun install
bun run dev
```

### Running Tests
```bash
bun test                    # Run test suite
bun run test:examples      # Test example projects
bun run lint               # Check code quality
```

## 📄 License

Unspec'd is open-source software licensed under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Ready to transform your internal tools?</strong>
  <br>
  <a href="https://github.com/glyphtek/unspecd/issues">Report Issues</a> •
  <a href="https://github.com/glyphtek/unspecd/discussions">Discussions</a> •
  <a href="https://glyphtek.github.io/unspecd/">Documentation</a>
</p>

<p align="center">
  Built with ❤️ by <a href="https://github.com/sergiohromano">Sergio Romano</a> and the <a href="https://github.com/glyphtek/unspecd/contributors">Unspec'd community</a>
</p>
