# Components

Unspec'd provides five powerful content types that cover the most common patterns in internal tools and admin dashboards. Each component is production-ready with built-in styling, validation, and error handling.

## Overview

| Component | Purpose | Best For |
|-----------|---------|----------|
| [Display Record](#display-record) | Show single records | Dashboards, status displays, detail views |
| [Editable Table](#editable-table) | CRUD data tables | User management, inventory, data editing |
| [Edit Form](#edit-form) | Single record editing | Profile editing, settings, data entry |
| [Action Button](#action-button) | Custom actions | Reports, workflows, API calls |
| [Streaming Table](#streaming-table) | Real-time data | Live feeds, monitoring, events |

## Display Record

Perfect for showing formatted data from a single record. Ideal for dashboards, status displays, and detail views.

```typescript
content: {
  type: 'displayRecord',
  dataLoader: { functionName: 'loadUserProfile' },
  displayConfig: {
    fields: [
      { field: 'name', label: 'Full Name' },
      { field: 'email', label: 'Email' },
      { field: 'lastLogin', label: 'Last Login', formatter: 'datetime' },
      { field: 'status', label: 'Status', formatter: 'badge' }
    ]
  }
}
```

**Features:**
- ✅ Multiple field formatters (text, datetime, currency, badge, etc.)
- ✅ Responsive layout
- ✅ Loading states
- ✅ Error handling

[→ Full Display Record Documentation](./components/display-record.md)

## Editable Table

Full-featured CRUD data table with inline editing, sorting, and pagination. The workhorse component for data management.

```typescript
content: {
  type: 'editableTable',
  columns: {
    name: { type: 'text', label: 'Name', required: true },
    email: { type: 'email', label: 'Email', required: true },
    role: { 
      type: 'select', 
      label: 'Role',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' }
      ]
    },
    active: { type: 'boolean', label: 'Active' }
  }
}
```

**Features:**
- ✅ Inline editing with validation
- ✅ Add, update, delete operations
- ✅ Sorting and pagination
- ✅ Multiple column types
- ✅ Bulk operations

[→ Full Editable Table Documentation](./components/editable-table.md)

## Edit Form

Single record editing with custom layouts and comprehensive validation. Perfect for profile editing and data entry forms.

```typescript
content: {
  type: 'editForm',
  formConfig: {
    fields: [
      { name: 'firstName', type: 'text', label: 'First Name', required: true },
      { name: 'bio', type: 'textarea', label: 'Biography', rows: 4 },
      { name: 'birthDate', type: 'date', label: 'Birth Date' }
    ]
  },
  onSubmit: { functionName: 'saveProfile' }
}
```

**Features:**
- ✅ Multiple field types
- ✅ Client and server validation
- ✅ Custom layouts
- ✅ File uploads (coming soon)
- ✅ Conditional fields (coming soon)

[→ Full Edit Form Documentation](./components/edit-form.md)

## Action Button

Trigger custom workflows, generate reports, or execute any business logic with a simple button interface.

```typescript
content: {
  type: 'actionButton',
  buttonConfig: {
    label: 'Generate Monthly Report',
    variant: 'primary',
    icon: 'download'
  },
  action: { functionName: 'generateReport' }
}
```

**Features:**
- ✅ Multiple button variants
- ✅ Icons and loading states
- ✅ Confirmation dialogs
- ✅ Progress indicators
- ✅ Success/error feedback

[→ Full Action Button Documentation](./components/action-button.md)

## Streaming Table

Real-time data table with live updates, perfect for monitoring systems, live feeds, and event streams.

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

**Features:**
- ✅ WebSocket-based streaming
- ✅ Connection status indicators
- ✅ Auto-scroll and row limits
- ✅ Pause/resume functionality
- ✅ Error recovery

[→ Full Streaming Table Documentation](./components/streaming-table.md)

## Common Patterns

### Data Loading
All components that display data use a consistent data loading pattern:

```typescript
functions: {
  loadData: async () => {
    const response = await fetch('/api/data');
    return response.json();
  }
}
```

### Error Handling
Components automatically handle errors thrown by functions:

```typescript
functions: {
  saveData: async ({ data }) => {
    if (!data.email) {
      throw new Error('Email is required'); // Shown to user
    }
    // Save logic...
  }
}
```

### Validation
Built-in validation for common field types:

```typescript
columns: {
  email: { 
    type: 'email',     // Automatic email validation
    required: true     // Required field validation
  },
  age: { 
    type: 'number',
    min: 0,           // Minimum value validation
    max: 120          // Maximum value validation
  }
}
```

## Field Types Reference

All components that use fields (tables, forms) support these types:

| Type | Description | Validation | Example |
|------|-------------|------------|---------|
| `text` | Single-line text | Length, pattern | Names, titles |
| `email` | Email input | Email format | user@example.com |
| `number` | Numeric input | Min/max, integer | Ages, quantities |
| `boolean` | Checkbox | None | Active/inactive flags |
| `select` | Dropdown | Required options | Roles, categories |
| `date` | Date picker | Date format | Birth dates, deadlines |
| `textarea` | Multi-line text | Length | Descriptions, notes |
| `currency` | Money input | Positive values | Prices, salaries |
| `url` | URL input | URL format | Website links |
| `tel` | Phone input | Phone format | Contact numbers |

## Styling and Theming

All components use a consistent design system with:

- **Modern aesthetics** - Clean, professional appearance
- **Responsive design** - Works on desktop and mobile
- **Accessibility** - WCAG compliant with keyboard navigation
- **Dark mode ready** - Automatic theme switching
- **Customizable** - Override styles with CSS variables

## Performance Considerations

### Large Datasets
- **Editable Table**: Supports pagination and virtual scrolling
- **Streaming Table**: Automatic row limits and cleanup
- **Display Record**: Optimized for single record display

### Real-time Updates
- **Streaming Table**: Efficient WebSocket connections
- **All Components**: Debounced updates and error recovery

### Memory Management
- Automatic cleanup of event listeners
- Efficient re-rendering with minimal DOM updates
- Smart caching of function results

## Best Practices

### 1. **Choose the Right Component**
```typescript
// ✅ Good - Use displayRecord for single records
content: { type: 'displayRecord', /* ... */ }

// ❌ Bad - Don't use editableTable for single records
content: { type: 'editableTable', /* ... */ }
```

### 2. **Consistent Field Naming**
```typescript
// ✅ Good - Use camelCase
columns: {
  firstName: { type: 'text', label: 'First Name' },
  lastName: { type: 'text', label: 'Last Name' }
}

// ❌ Bad - Inconsistent naming
columns: {
  'first-name': { type: 'text', label: 'First Name' },
  LastName: { type: 'text', label: 'Last Name' }
}
```

### 3. **Meaningful Labels**
```typescript
// ✅ Good - Clear, descriptive labels
{ field: 'createdAt', label: 'Created Date' }

// ❌ Bad - Technical field names as labels
{ field: 'createdAt', label: 'createdAt' }
```

### 4. **Appropriate Validation**
```typescript
// ✅ Good - Validate important fields
email: { type: 'email', required: true },
age: { type: 'number', min: 0, max: 120 }

// ❌ Bad - Over-validation
name: { type: 'text', pattern: '^[A-Za-z ]+$' } // Too restrictive
```

## Component Comparison

| Feature | Display Record | Editable Table | Edit Form | Action Button | Streaming Table |
|---------|----------------|----------------|-----------|---------------|-----------------|
| **Data Display** | ✅ Single record | ✅ Multiple rows | ✅ Single record | ❌ No data | ✅ Multiple rows |
| **Data Editing** | ❌ Read-only | ✅ Inline editing | ✅ Form editing | ❌ No editing | ❌ Read-only |
| **Real-time** | ❌ Static | ❌ Static | ❌ Static | ❌ Static | ✅ Live updates |
| **Actions** | ❌ Display only | ✅ CRUD ops | ✅ Save/cancel | ✅ Custom actions | ❌ Display only |
| **Validation** | ❌ No input | ✅ Field validation | ✅ Form validation | ❌ No input | ❌ No input |
| **Best For** | Dashboards | Data management | Single records | Workflows | Monitoring |

## Next Steps

Dive deeper into specific components:

- 📊 [Display Record](./components/display-record.md) - Formatted data display
- 📝 [Editable Table](./components/editable-table.md) - CRUD data tables  
- ✏️ [Edit Form](./components/edit-form.md) - Single record editing
- 🔘 [Action Button](./components/action-button.md) - Custom workflows
- 📡 [Streaming Table](./components/streaming-table.md) - Real-time data

Or explore related topics:
- 🔧 [Tool Specifications](./tool-specifications.md) - Complete spec reference
- 🎯 [Focus Mode vs Normal Mode](./modes.md) - Display modes
- 💡 [Examples](../examples/) - Real-world implementations

---

**Master these five components and you can build any internal tool!** Each one is designed to handle common patterns with minimal configuration. 🚀 