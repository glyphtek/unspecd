# Editable Table

The Editable Table component provides a full-featured CRUD data table with inline editing, sorting, pagination, and validation. It's the workhorse component for data management in Unspec'd applications.

## Basic Usage

```typescript
const userManagement = {
  id: 'user-management',
  title: 'User Management',
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
    },
    deleteRow: async ({ id }) => {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      return { success: true };
    },
    createRow: async ({ data }) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    }
  }
};
```

## Column Configuration

### Column Types

#### `text` - Text Input
```typescript
name: {
  type: 'text',
  label: 'Full Name',
  required: true,
  placeholder: 'Enter full name',
  maxLength: 100
}
```

**Properties:**
- `required` - Field is required
- `placeholder` - Input placeholder text
- `maxLength` - Maximum character length
- `minLength` - Minimum character length
- `pattern` - Regex validation pattern

#### `email` - Email Input
```typescript
email: {
  type: 'email',
  label: 'Email Address',
  required: true
}
```

**Properties:**
- Automatic email format validation
- Built-in email input type
- Required field support

#### `number` - Numeric Input
```typescript
age: {
  type: 'number',
  label: 'Age',
  min: 0,
  max: 120,
  step: 1
}
```

**Properties:**
- `min` - Minimum value
- `max` - Maximum value
- `step` - Increment step
- `integer` - Force integer values only

#### `boolean` - Checkbox
```typescript
active: {
  type: 'boolean',
  label: 'Active',
  defaultValue: true
}
```

**Properties:**
- Renders as checkbox
- `defaultValue` - Initial checked state

#### `select` - Dropdown
```typescript
role: {
  type: 'select',
  label: 'Role',
  options: [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'User' },
    { value: 'viewer', label: 'Viewer' }
  ],
  required: true
}
```

**Properties:**
- `options` - Array of value/label pairs
- `required` - Require selection
- `placeholder` - Placeholder text

#### `date` - Date Picker
```typescript
birthDate: {
  type: 'date',
  label: 'Birth Date',
  min: '1900-01-01',
  max: '2010-12-31'
}
```

**Properties:**
- `min` - Minimum date (YYYY-MM-DD)
- `max` - Maximum date (YYYY-MM-DD)
- Native date picker interface

#### `textarea` - Multi-line Text
```typescript
notes: {
  type: 'textarea',
  label: 'Notes',
  rows: 3,
  maxLength: 500
}
```

**Properties:**
- `rows` - Number of visible rows
- `maxLength` - Character limit
- `placeholder` - Placeholder text

#### `currency` - Money Input
```typescript
salary: {
  type: 'currency',
  label: 'Annual Salary',
  min: 0,
  currency: 'USD'
}
```

**Properties:**
- Automatic currency formatting
- `min`/`max` - Value limits
- `currency` - Currency code (default: USD)

#### `url` - URL Input
```typescript
website: {
  type: 'url',
  label: 'Website',
  placeholder: 'https://example.com'
}
```

**Properties:**
- URL format validation
- Clickable links in display mode

#### `tel` - Phone Input
```typescript
phone: {
  type: 'tel',
  label: 'Phone Number',
  pattern: '[0-9]{3}-[0-9]{3}-[0-9]{4}'
}
```

**Properties:**
- Phone number input type
- `pattern` - Validation pattern

## Required Functions

### `loadData()`
Fetches the initial table data.

```typescript
functions: {
  loadData: async ({ inputs }) => {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to load users');
    }
    return response.json();
  }
}
```

**Parameters:**
- `inputs` - Tool inputs configuration

**Return Value:**
Array of objects where each object represents a table row. Each object should have an `id` field for row identification.

### `updateRow({ data })`
Updates an existing row.

```typescript
functions: {
  updateRow: async ({ data, inputs }) => {
    // Validation
    if (!data.email?.includes('@')) {
      throw new Error('Please provide a valid email address');
    }
    
    const response = await fetch(`/api/users/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    
    return response.json();
  }
}
```

**Parameters:**
- `data` - Updated row data (includes `id`)
- `inputs` - Tool inputs configuration

**Return Value:**
Updated row object or success confirmation.

### `deleteRow({ id })`
Deletes a row.

```typescript
functions: {
  deleteRow: async ({ id, inputs }) => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    
    return { success: true };
  }
}
```

**Parameters:**
- `id` - Row ID to delete
- `inputs` - Tool inputs configuration

**Return Value:**
Success confirmation object.

### `createRow({ data })` (Optional)
Creates a new row. If not provided, the "Add Row" button is hidden.

```typescript
functions: {
  createRow: async ({ data, inputs }) => {
    // Validation
    if (!data.name?.trim()) {
      throw new Error('Name is required');
    }
    
    if (!data.email?.includes('@')) {
      throw new Error('Please provide a valid email address');
    }
    
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        createdAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    
    return response.json();
  }
}
```

**Parameters:**
- `data` - New row data (no `id` field)
- `inputs` - Tool inputs configuration

**Return Value:**
Created row object with assigned `id`.

## Advanced Configuration

### Table Options

```typescript
content: {
  type: 'editableTable',
  columns: { /* ... */ },
  tableConfig: {
    pageSize: 25,           // Rows per page (default: 20)
    sortable: true,         // Enable sorting (default: true)
    searchable: true,       // Enable search (default: true)
    exportable: true,       // Enable export (default: false)
    selectable: true,       // Enable row selection (default: false)
    addRowLabel: 'Add User' // Custom add button text
  }
}
```

### Conditional Columns

```typescript
columns: {
  name: { type: 'text', label: 'Name' },
  email: { type: 'email', label: 'Email' },
  adminNotes: {
    type: 'textarea',
    label: 'Admin Notes',
    visible: ({ userRole }) => userRole === 'admin' // Show only to admins
  }
}
```

### Custom Validation

```typescript
columns: {
  email: {
    type: 'email',
    label: 'Email',
    validate: async (value) => {
      if (!value?.includes('@')) {
        throw new Error('Invalid email format');
      }
      
      // Check if email already exists
      const exists = await checkEmailExists(value);
      if (exists) {
        throw new Error('Email address already in use');
      }
    }
  }
}
```

## Complete Examples

### Employee Management System

```typescript
const employeeManagement = {
  id: 'employee-management',
  title: 'Employee Management',
  content: {
    type: 'editableTable',
    columns: {
      firstName: {
        type: 'text',
        label: 'First Name',
        required: true,
        maxLength: 50
      },
      lastName: {
        type: 'text',
        label: 'Last Name',
        required: true,
        maxLength: 50
      },
      email: {
        type: 'email',
        label: 'Email',
        required: true
      },
      department: {
        type: 'select',
        label: 'Department',
        options: [
          { value: 'engineering', label: 'Engineering' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'sales', label: 'Sales' },
          { value: 'hr', label: 'Human Resources' }
        ],
        required: true
      },
      startDate: {
        type: 'date',
        label: 'Start Date',
        required: true
      },
      salary: {
        type: 'currency',
        label: 'Annual Salary',
        min: 30000,
        max: 300000
      },
      active: {
        type: 'boolean',
        label: 'Active Employee',
        defaultValue: true
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        rows: 2,
        maxLength: 500
      }
    },
    tableConfig: {
      pageSize: 15,
      sortable: true,
      searchable: true,
      exportable: true,
      addRowLabel: 'Add Employee'
    }
  },
  functions: {
    loadData: async () => {
      const response = await fetch('/api/employees');
      return response.json();
    },
    
    createRow: async ({ data }) => {
      // Validation
      if (!data.firstName?.trim() || !data.lastName?.trim()) {
        throw new Error('First and last name are required');
      }
      
      if (!data.email?.includes('@')) {
        throw new Error('Please provide a valid email address');
      }
      
      if (!data.department) {
        throw new Error('Please select a department');
      }
      
      // Check for duplicate email
      const existingEmployee = await checkEmployeeEmail(data.email);
      if (existingEmployee) {
        throw new Error('An employee with this email already exists');
      }
      
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdAt: new Date().toISOString(),
          employeeId: generateEmployeeId()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create employee record');
      }
      
      return response.json();
    },
    
    updateRow: async ({ data }) => {
      const response = await fetch(`/api/employees/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          updatedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update employee record');
      }
      
      return response.json();
    },
    
    deleteRow: async ({ id }) => {
      // Soft delete - mark as inactive instead of removing
      const response = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active: false,
          deletedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to deactivate employee');
      }
      
      return { success: true };
    }
  }
};
```

### Product Inventory

```typescript
const productInventory = {
  id: 'product-inventory',
  title: 'Product Inventory',
  content: {
    type: 'editableTable',
    columns: {
      sku: {
        type: 'text',
        label: 'SKU',
        required: true,
        pattern: '^[A-Z0-9-]+$',
        placeholder: 'PROD-001'
      },
      name: {
        type: 'text',
        label: 'Product Name',
        required: true,
        maxLength: 100
      },
      category: {
        type: 'select',
        label: 'Category',
        options: [
          { value: 'electronics', label: 'Electronics' },
          { value: 'clothing', label: 'Clothing' },
          { value: 'books', label: 'Books' },
          { value: 'home', label: 'Home & Garden' }
        ]
      },
      price: {
        type: 'currency',
        label: 'Price',
        required: true,
        min: 0.01
      },
      quantity: {
        type: 'number',
        label: 'Quantity',
        required: true,
        min: 0,
        integer: true
      },
      lowStockThreshold: {
        type: 'number',
        label: 'Low Stock Alert',
        min: 0,
        integer: true,
        defaultValue: 10
      },
      active: {
        type: 'boolean',
        label: 'Active',
        defaultValue: true
      },
      description: {
        type: 'textarea',
        label: 'Description',
        rows: 2,
        maxLength: 250
      }
    }
  },
  functions: {
    loadData: async () => {
      const response = await fetch('/api/products');
      const products = await response.json();
      
      // Add computed fields
      return products.map(product => ({
        ...product,
        lowStock: product.quantity <= product.lowStockThreshold
      }));
    },
    
    createRow: async ({ data }) => {
      // Validate SKU format
      if (!/^[A-Z0-9-]+$/.test(data.sku)) {
        throw new Error('SKU must contain only uppercase letters, numbers, and hyphens');
      }
      
      // Check for duplicate SKU
      const existingProduct = await checkProductSKU(data.sku);
      if (existingProduct) {
        throw new Error('A product with this SKU already exists');
      }
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      return response.json();
    },
    
    updateRow: async ({ data }) => {
      // Validate stock levels
      if (data.quantity < 0) {
        throw new Error('Quantity cannot be negative');
      }
      
      const response = await fetch(`/api/products/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      return response.json();
    },
    
    deleteRow: async ({ id }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      return { success: true };
    }
  }
};
```

## Features

### Inline Editing
- Click any cell to edit in place
- Tab navigation between fields
- Enter to save, Escape to cancel
- Real-time validation feedback

### Sorting and Filtering
- Click column headers to sort
- Global search across all columns
- Type-specific filtering (date ranges, number ranges)

### Pagination
- Configurable page sizes
- Navigation controls
- Total count display

### Row Selection
- Checkbox selection for bulk operations
- Select all/none functionality
- Bulk delete operations

### Export Functionality
- CSV export of current view
- Filtered data export
- Custom export formats

## Styling and Customization

### CSS Classes
```css
/* Table container */
.unspecd-editable-table {
  /* Custom table styles */
}

/* Table headers */
.unspecd-table-header {
  background-color: #f8f9fa;
  font-weight: 600;
}

/* Editable cells */
.unspecd-cell-editing {
  background-color: #fff3cd;
  border: 2px solid #ffc107;
}

/* Validation errors */
.unspecd-cell-error {
  border-color: #dc3545;
  background-color: #f8d7da;
}

/* Action buttons */
.unspecd-table-actions {
  /* Button styling */
}
```

### Responsive Design
- Mobile-optimized layouts
- Horizontal scrolling for wide tables
- Collapsible columns on small screens
- Touch-friendly editing controls

## Performance Considerations

### Large Datasets
- Server-side pagination recommended for >1000 rows
- Virtual scrolling for client-side performance
- Debounced search and filtering

### Memory Management
- Automatic cleanup of event listeners
- Efficient re-rendering with minimal DOM updates
- Smart caching of validation results

## Best Practices

### 1. **Proper Data Structure**
```typescript
// ✅ Good - Include ID field
return [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
];

// ❌ Bad - Missing ID field
return [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
];
```

### 2. **Validation Strategy**
```typescript
// ✅ Good - Client and server validation
columns: {
  email: {
    type: 'email',
    required: true,  // Client validation
    validate: async (value) => {  // Server validation
      const exists = await checkEmailExists(value);
      if (exists) throw new Error('Email already exists');
    }
  }
}
```

### 3. **Error Handling**
```typescript
// ✅ Good - User-friendly error messages
functions: {
  updateRow: async ({ data }) => {
    try {
      return await updateUser(data);
    } catch (error) {
      if (error.code === 'DUPLICATE_EMAIL') {
        throw new Error('This email address is already in use');
      }
      throw new Error('Failed to update user. Please try again.');
    }
  }
}
```

### 4. **Performance Optimization**
```typescript
// ✅ Good - Paginated loading
functions: {
  loadData: async ({ page = 1, pageSize = 20, search = '' }) => {
    const response = await fetch(
      `/api/users?page=${page}&size=${pageSize}&search=${search}`
    );
    return response.json();
  }
}
```

## Common Use Cases

- **User and role management**
- **Product and inventory management**
- **Order and transaction processing**
- **Content and media management**
- **Configuration and settings**
- **Data import and export workflows**

## Related Components

- **[Display Record](./display-record.md)** - For showing single records
- **[Edit Form](./edit-form.md)** - For detailed single-record editing
- **[Streaming Table](./streaming-table.md)** - For real-time data display

---

**Editable Table is the powerhouse component for data management!** Use it whenever you need full CRUD operations with a professional, user-friendly interface. 📝 