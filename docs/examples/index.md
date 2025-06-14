# Examples

Explore real-world examples of Unspec'd Framework in action. Each example demonstrates different features and use cases.

## Featured Examples

### 🔐 User Role Editor
A complete user management system with role-based permissions.

**Features:**
- Editable user table
- Role assignment
- Status management
- Real-time updates

```typescript
import { UnspecdUI, startServer } from '@glyphtek/unspecd'

const userRoleEditor = {
  id: 'user-role-editor',
  title: 'User Role Editor',
  content: {
    type: 'editableTable',
    columns: {
      name: { type: 'text', label: 'Full Name' },
      email: { type: 'email', label: 'Email' },
      role: {
        type: 'select',
        label: 'Role',
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'editor', label: 'Editor' },
          { value: 'viewer', label: 'Viewer' }
        ]
      }
    }
  },
  functions: {
    loadData: async () => [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'editor' }
    ],
    updateUser: async (userData) => ({ success: true })
  }
}

const app = new UnspecdUI({ tools: [userRoleEditor] })
await startServer(app)
```

**[📁 View source code](https://github.com/glyphtek/unspecd/blob/main/examples/lib/user-role-editor.ts)** | **[🚀 Try all examples](https://github.com/glyphtek/unspecd/tree/main/examples/lib)**

---

### 📊 Live Dashboard
Real-time analytics dashboard with multiple data views.

**Features:**
- Live data updates
- Key metrics display
- Multiple tool layout
- Performance indicators

```typescript
const liveDashboard = {
  id: 'analytics',
  title: 'Analytics Dashboard',
  content: {
    type: 'displayRecord',
    fields: {
      totalUsers: { 
        type: 'number', 
        label: 'Total Users',
        formatter: 'integer'
      },
      revenue: { 
        type: 'currency', 
        label: 'Monthly Revenue' 
      },
      conversionRate: { 
        type: 'percentage', 
        label: 'Conversion Rate' 
      }
    }
  },
  functions: {
    loadData: async () => ({
      totalUsers: 12450,
      revenue: 89750,
      conversionRate: 0.0823
    })
  }
}
```

---

### 📋 Data Tables
Advanced table with filtering, sorting, and pagination.

**Features:**
- Filter controls
- Column sorting
- Inline editing
- Bulk operations

```typescript
const dataTable = {
  id: 'orders',
  title: 'Order Management',
  inputs: {
    status: {
      type: 'select',
      label: 'Filter by Status',
      options: [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' }
      ],
      defaultValue: 'all'
    },
    dateRange: {
      type: 'date',
      label: 'Date Range'
    }
  },
  content: {
    type: 'editableTable',
    columns: {
      orderId: { type: 'text', label: 'Order ID' },
      customer: { type: 'text', label: 'Customer' },
      amount: { type: 'currency', label: 'Amount' },
      status: {
        type: 'select',
        label: 'Status',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'processing', label: 'Processing' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ]
      }
    }
  },
  functions: {
    loadData: async ({ status, dateRange }) => {
      // Filter logic based on inputs
      return [
        { 
          id: 1, 
          orderId: 'ORD-001', 
          customer: 'Alice Johnson',
          amount: 299.99,
          status: 'completed'
        }
        // ... more orders
      ]
    }
  }
}
```

---

### 🖥️ CLI Mode Examples

These examples demonstrate CLI mode with automatic tool discovery:

**Features:**
- File-based tool discovery
- Zero configuration setup
- Team collaboration patterns
- Multiple operational modes

```bash
# Initialize new CLI project
unspecd init

# Start dashboard with auto-discovery
unspecd dev --cwd examples/cli

# Run single tool in focus mode
unspecd exec user-management.tool.ts
```

**Available CLI examples:**
- **User Management** - Complete CRUD interface with roles
- **System Monitor** - Real-time system statistics dashboard  
- **Cache Invalidator** - One-click action with confirmations

**[📁 View CLI examples](https://github.com/glyphtek/unspecd/tree/main/examples/cli)** | **[📖 CLI Documentation](/guide/cli)**

---

### 📝 Forms
Complete form handling with validation.

**Features:**
- Field validation
- Custom form layouts
- Submit handling
- Error states

```typescript
const userForm = {
  id: 'user-form',
  title: 'Create User',
  content: {
    type: 'editForm',
    fields: {
      firstName: {
        type: 'text',
        label: 'First Name',
        required: true,
        validation: {
          minLength: 2,
          pattern: '^[A-Za-z]+$'
        }
      },
      email: {
        type: 'email',
        label: 'Email Address',
        required: true
      },
      department: {
        type: 'select',
        label: 'Department',
        options: [
          { value: 'engineering', label: 'Engineering' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'sales', label: 'Sales' }
        ]
      }
    }
  },
  functions: {
    submitForm: async (formData) => {
      // Process form submission
      return { 
        success: true,
        message: 'User created successfully!'
      }
    }
  }
}
```

## Example Repository

All examples are available in the GitHub repository with complete source code and instructions:

🔗 **[View Examples on GitHub](https://github.com/glyphtek/unspecd/tree/main/examples)**

Each example includes:
- ✅ Complete source code
- ✅ Setup instructions
- ✅ Feature explanations
- ✅ Customization tips

## Running Examples Locally

Clone the repository and run any example:

```bash
git clone https://github.com/glyphtek/unspecd.git
cd unspecd

# Install dependencies
bun install

# Run the library examples
bun run examples/lib/index.ts

# Or run CLI examples
bun run build
bun run dist/cli/index.js dev --cwd examples/cli
```

## Custom Examples

Want to contribute an example? We'd love to see what you build!

1. **Fork the repository**
2. **Create your example** in the `examples/` directory
3. **Add documentation** explaining the features
4. **Submit a pull request**

**[Contributing Guidelines →](https://github.com/glyphtek/unspecd/blob/main/CONTRIBUTING.md)** 