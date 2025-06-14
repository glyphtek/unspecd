# Tool Specifications

Tool specifications are the heart of Unspec'd. They define **what** your interface should do using a declarative JSON-like structure, eliminating the need to write imperative UI code.

## Basic Structure

Every tool specification follows this structure:

```typescript
const myTool: ToolSpec = {
  id: 'unique-tool-id',           // Required: Unique identifier
  title: 'Display Name',         // Required: Human-readable title
  content: { /* ... */ },        // Required: UI content definition
  functions: { /* ... */ },      // Required: Backend logic
  inputs?: { /* ... */ }         // Optional: Configuration parameters
};
```

## Required Properties

### `id: string`
Unique identifier for the tool. Used for routing, API calls, and internal references.

**Rules:**
- Must be unique across all tools
- Use kebab-case (lowercase with hyphens)
- No spaces or special characters
- Should be descriptive but concise

```typescript
// ✅ Good IDs
id: 'user-management'
id: 'order-dashboard'
id: 'inventory-report'

// ❌ Bad IDs
id: 'UserManagement'  // PascalCase
id: 'user management' // Spaces
id: 'tool1'          // Not descriptive
```

### `title: string`
Human-readable display name shown in the UI navigation and headers.

```typescript
title: 'User Management'
title: 'Live Order Dashboard'
title: 'Inventory Report Generator'
```

### `content: ContentSpec`
Defines the type of interface to render and its configuration. This is where you specify whether you want a table, form, button, etc.

**Available Content Types:**
- [`displayRecord`](#displayrecord) - Show single records
- [`editableTable`](#editabletable) - CRUD data tables
- [`editForm`](#editform) - Single record editing
- [`actionButton`](#actionbutton) - Custom actions
- [`streamingTable`](#streamingtable) - Real-time data

### `functions: Record<string, Function>`
Backend logic functions that power your interface. Functions are called automatically by the UI based on user interactions.

```typescript
functions: {
  loadData: async () => { /* fetch data */ },
  saveRecord: async (data) => { /* save data */ },
  validateInput: async (input) => { /* validate */ }
}
```

## Optional Properties

### `inputs?: Record<string, any>`
Configuration parameters that can be passed to your tool. Useful for making tools reusable with different settings.

```typescript
inputs: {
  apiEndpoint: 'https://api.example.com',
  pageSize: 25,
  enableFiltering: true
}
```

Access inputs in your functions:
```typescript
functions: {
  loadData: async (params) => {
    const { apiEndpoint, pageSize } = params.inputs;
    // Use configuration values
  }
}
```

## Content Types Reference

### DisplayRecord

Shows a single record with formatted fields. Perfect for dashboards, detail views, and status displays.

```typescript
content: {
  type: 'displayRecord',
  dataLoader: {
    functionName: 'loadRecord'
  },
  displayConfig: {
    fields: [
      {
        field: 'name',
        label: 'Full Name'
      },
      {
        field: 'email',
        label: 'Email Address'
      },
      {
        field: 'createdAt',
        label: 'Created',
        formatter: 'datetime'
      },
      {
        field: 'status',
        label: 'Status',
        formatter: 'badge'
      }
    ]
  }
}
```

**Field Formatters:**
- `text` (default) - Plain text
- `datetime` - Formatted date/time
- `currency` - Money formatting
- `badge` - Colored status badges
- `email` - Clickable email links
- `url` - Clickable web links

### EditableTable

Full CRUD data table with inline editing, sorting, and pagination.

```typescript
content: {
  type: 'editableTable',
  columns: {
    name: {
      type: 'text',
      label: 'Full Name',
      required: true
    },
    email: {
      type: 'email',
      label: 'Email Address',
      required: true
    },
    role: {
      type: 'select',
      label: 'Role',
      options: [
        { value: 'admin', label: 'Administrator' },
        { value: 'user', label: 'User' },
        { value: 'viewer', label: 'Viewer' }
      ]
    },
    active: {
      type: 'boolean',
      label: 'Active'
    }
  }
}
```

**Column Types:**
- `text` - Text input
- `email` - Email input with validation
- `number` - Numeric input
- `boolean` - Checkbox
- `select` - Dropdown with options
- `date` - Date picker
- `textarea` - Multi-line text

**Required Functions:**
- `loadData()` - Fetch table data
- `updateRow(data)` - Update existing row
- `deleteRow(id)` - Delete row
- `createRow(data)` - Create new row (optional)

### EditForm

Single record editing form with validation and custom layouts.

```typescript
content: {
  type: 'editForm',
  formConfig: {
    fields: [
      {
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        required: true
      },
      {
        name: 'lastName',
        type: 'text',
        label: 'Last Name',
        required: true
      },
      {
        name: 'bio',
        type: 'textarea',
        label: 'Biography',
        rows: 4
      }
    ]
  },
  onSubmit: {
    functionName: 'saveUser'
  }
}
```

**Form Field Properties:**
- `name` - Field identifier
- `type` - Input type (same as table columns)
- `label` - Display label
- `required` - Validation requirement
- `placeholder` - Input placeholder
- `defaultValue` - Initial value
- `validation` - Custom validation rules

### ActionButton

Custom action triggers for workflows, reports, or any business logic.

```typescript
content: {
  type: 'actionButton',
  buttonConfig: {
    label: 'Generate Report',
    variant: 'primary',
    icon: 'download'
  },
  action: {
    functionName: 'generateReport'
  }
}
```

**Button Variants:**
- `primary` - Blue, prominent
- `secondary` - Gray, subtle
- `success` - Green, positive actions
- `warning` - Yellow, caution
- `danger` - Red, destructive actions

### StreamingTable

Real-time data table with live updates and connection status.

```typescript
content: {
  type: 'streamingTable',
  columns: {
    timestamp: { type: 'text', label: 'Time' },
    event: { type: 'text', label: 'Event' },
    status: { type: 'text', label: 'Status' }
  },
  streamingConfig: {
    functionName: 'streamEvents',
    maxRows: 100,
    autoScroll: true
  }
}
```

**Streaming Function Signature:**
```typescript
functions: {
  streamEvents: async ({ onData, onError, onConnect, onDisconnect }) => {
    // Set up streaming connection
    const connection = setupStream();
    
    connection.on('data', (event) => {
      onData(event); // Send data to UI
    });
    
    connection.on('error', (error) => {
      onError(error); // Handle errors
    });
    
    onConnect(); // Signal connection established
    
    // Return cleanup function
    return () => {
      connection.close();
      onDisconnect();
    };
  }
}
```

## Function System

Functions are the backend logic that powers your tools. They're called automatically by the UI based on user interactions.

### Function Parameters

All functions receive a parameters object:

```typescript
functions: {
  myFunction: async (params) => {
    const {
      inputs,    // Tool inputs configuration
      data,      // User-provided data (forms, etc.)
      id,        // Record ID (for updates/deletes)
      // ... other context
    } = params;
  }
}
```

### Common Function Patterns

**Data Loading:**
```typescript
loadData: async () => {
  const response = await fetch('/api/users');
  return response.json();
}
```

**Data Saving:**
```typescript
saveUser: async ({ data }) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to save user');
  }
  
  return { success: true };
}
```

**Validation:**
```typescript
validateEmail: async ({ data }) => {
  if (!data.email?.includes('@')) {
    throw new Error('Invalid email address');
  }
  return { valid: true };
}
```

### Error Handling

Functions can throw errors to display user-friendly messages:

```typescript
functions: {
  deleteUser: async ({ id }) => {
    try {
      await deleteUserFromDB(id);
      return { success: true };
    } catch (error) {
      // This message will be shown to the user
      throw new Error('Cannot delete user: they have active orders');
    }
  }
}
```

## Complete Example

Here's a comprehensive tool specification showcasing all features:

```typescript
const userManagementTool: ToolSpec = {
  id: 'user-management',
  title: 'User Management System',
  
  inputs: {
    apiBaseUrl: 'https://api.company.com',
    department: 'engineering',
    maxUsers: 1000
  },
  
  content: {
    type: 'editableTable',
    columns: {
      firstName: {
        type: 'text',
        label: 'First Name',
        required: true
      },
      lastName: {
        type: 'text',
        label: 'Last Name',
        required: true
      },
      email: {
        type: 'email',
        label: 'Email Address',
        required: true
      },
      role: {
        type: 'select',
        label: 'Role',
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'manager', label: 'Manager' },
          { value: 'developer', label: 'Developer' },
          { value: 'designer', label: 'Designer' }
        ]
      },
      startDate: {
        type: 'date',
        label: 'Start Date'
      },
      active: {
        type: 'boolean',
        label: 'Active'
      }
    }
  },
  
  functions: {
    loadData: async ({ inputs }) => {
      const response = await fetch(`${inputs.apiBaseUrl}/users?dept=${inputs.department}`);
      const users = await response.json();
      
      return users.slice(0, inputs.maxUsers);
    },
    
    createRow: async ({ data, inputs }) => {
      // Validation
      if (!data.email?.includes('@')) {
        throw new Error('Please provide a valid email address');
      }
      
      const response = await fetch(`${inputs.apiBaseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          department: inputs.department,
          createdAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      return response.json();
    },
    
    updateRow: async ({ data, inputs }) => {
      const response = await fetch(`${inputs.apiBaseUrl}/users/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      return response.json();
    },
    
    deleteRow: async ({ id, inputs }) => {
      const response = await fetch(`${inputs.apiBaseUrl}/users/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      return { success: true };
    }
  }
};
```

## Best Practices

### 1. **Descriptive IDs and Titles**
```typescript
// ✅ Good
id: 'customer-order-history'
title: 'Customer Order History'

// ❌ Bad
id: 'tool3'
title: 'Tool'
```

### 2. **Consistent Function Naming**
```typescript
// ✅ Good - follows conventions
functions: {
  loadData: async () => { /* ... */ },
  createRow: async ({ data }) => { /* ... */ },
  updateRow: async ({ data }) => { /* ... */ },
  deleteRow: async ({ id }) => { /* ... */ }
}
```

### 3. **Proper Error Messages**
```typescript
// ✅ Good - user-friendly
throw new Error('Email address is already in use');

// ❌ Bad - technical
throw new Error('UNIQUE constraint failed: users.email');
```

### 4. **Input Validation**
```typescript
functions: {
  saveUser: async ({ data }) => {
    // Validate required fields
    if (!data.name?.trim()) {
      throw new Error('Name is required');
    }
    
    if (!data.email?.includes('@')) {
      throw new Error('Please provide a valid email address');
    }
    
    // Proceed with save
    return await saveToDatabase(data);
  }
}
```

### 5. **Use Inputs for Configuration**
```typescript
// ✅ Good - configurable
inputs: {
  pageSize: 25,
  allowDelete: true,
  apiEndpoint: '/api/v1/users'
}

// ❌ Bad - hardcoded
functions: {
  loadData: async () => {
    return fetch('/api/v1/users?limit=25'); // Hardcoded values
  }
}
```

## Next Steps

- 📖 [Components Guide](./components.md) - Deep dive into each content type
- 🎯 [Focus Mode vs Normal Mode](./modes.md) - Understanding display modes
- 💡 [Examples](../examples/) - Real-world tool specifications
- 🔧 [CLI Usage](./cli.md) - Using tools with the command line

---

**Master tool specifications and you'll master Unspec'd!** These declarative definitions are the key to rapid, maintainable internal tool development. 🚀 