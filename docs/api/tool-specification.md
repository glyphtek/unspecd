# Tool Specification

A Tool is the fundamental building block of Unspec'd applications. Each tool defines a complete interface with its content, functions, and input configuration.

## Tool Interface

```typescript
interface Tool {
  id: string;                           // Unique tool identifier
  title: string;                        // Display title
  content: ComponentContent;            // Component configuration
  functions?: Record<string, Function>; // Tool functions
  inputs?: Record<string, InputConfig>; // Input definitions
  description?: string;                 // Tool description
  icon?: string;                        // Tool icon
  category?: string;                    // Tool category
  tags?: string[];                      // Search tags
  permissions?: string[];               // Required permissions
}
```

## Required Properties

### `id: string`
Unique identifier for the tool. Used for routing and function calls.

```typescript
const tool = {
  id: 'user-management',  // Must be unique across all tools
  // ...
};
```

**Requirements:**
- Must be unique within the application
- Should use kebab-case (lowercase with hyphens)
- Cannot contain spaces or special characters
- Should be descriptive and meaningful

### `title: string`
Human-readable title displayed in the UI.

```typescript
const tool = {
  id: 'user-management',
  title: 'User Management',  // Displayed in navigation and headers
  // ...
};
```

### `content: ComponentContent`
Defines the component type and its configuration.

```typescript
const tool = {
  id: 'users',
  title: 'Users',
  content: {
    type: 'editableTable',  // Component type
    columns: {              // Component-specific configuration
      name: { type: 'text', label: 'Name' },
      email: { type: 'email', label: 'Email' }
    }
  }
};
```

**Available Component Types:**
- `displayRecord` - Display structured data
- `editableTable` - CRUD data tables
- `editForm` - Form interfaces
- `streamingTable` - Real-time data streams
- `actionButton` - Interactive buttons

## Optional Properties

### `functions?: Record<string, Function>`
Functions that can be called by the component or externally.

```typescript
const tool = {
  id: 'users',
  title: 'Users',
  content: { /* ... */ },
  functions: {
    loadData: async ({ inputs }) => {
      // Function implementation
      return data;
    },
    updateUser: async ({ data, inputs }) => {
      // Function implementation
      return result;
    }
  }
};
```

**Function Signature:**
```typescript
type ToolFunction = (params: {
  inputs?: Record<string, any>;
  data?: any;
  [key: string]: any;
}) => Promise<any> | any;
```

### `inputs?: Record<string, InputConfig>`
Input field definitions for the tool.

```typescript
const tool = {
  id: 'user-search',
  title: 'User Search',
  inputs: {
    searchTerm: {
      type: 'text',
      label: 'Search Term',
      placeholder: 'Enter name or email...',
      required: true
    },
    role: {
      type: 'select',
      label: 'Role Filter',
      options: [
        { value: 'all', label: 'All Roles' },
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' }
      ]
    }
  },
  content: { /* ... */ },
  functions: { /* ... */ }
};
```

### `description?: string`
Optional description for documentation and tooltips.

```typescript
const tool = {
  id: 'analytics',
  title: 'Analytics Dashboard',
  description: 'View comprehensive analytics and metrics for your application',
  content: { /* ... */ }
};
```

### `icon?: string`
Icon identifier for the tool (used in navigation).

```typescript
const tool = {
  id: 'users',
  title: 'Users',
  icon: 'users',  // Icon name or SVG
  content: { /* ... */ }
};
```

### `category?: string`
Category for organizing tools in navigation.

```typescript
const tool = {
  id: 'user-management',
  title: 'User Management',
  category: 'Administration',  // Groups tools together
  content: { /* ... */ }
};
```

### `tags?: string[]`
Tags for search and filtering.

```typescript
const tool = {
  id: 'user-analytics',
  title: 'User Analytics',
  tags: ['analytics', 'users', 'reports', 'dashboard'],
  content: { /* ... */ }
};
```

### `permissions?: string[]`
Required permissions to access the tool.

```typescript
const tool = {
  id: 'admin-settings',
  title: 'Admin Settings',
  permissions: ['admin', 'settings.write'],
  content: { /* ... */ }
};
```

## Input Configuration

### InputConfig Interface

```typescript
interface InputConfig {
  type: InputType;
  label: string;
  required?: boolean;
  defaultValue?: any;
  placeholder?: string;
  description?: string;
  validation?: ValidationRule[];
  visible?: (inputs: Record<string, any>) => boolean;
  disabled?: (inputs: Record<string, any>) => boolean;
  // Type-specific properties...
}
```

### Input Types

#### `text` - Text Input
```typescript
{
  type: 'text',
  label: 'Full Name',
  required: true,
  placeholder: 'Enter full name',
  maxLength: 100,
  minLength: 2,
  pattern: '^[a-zA-Z\\s]+$'
}
```

#### `number` - Numeric Input
```typescript
{
  type: 'number',
  label: 'Age',
  min: 0,
  max: 120,
  step: 1,
  defaultValue: 25
}
```

#### `select` - Dropdown Selection
```typescript
{
  type: 'select',
  label: 'Country',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' }
  ],
  required: true
}
```

#### `boolean` - Checkbox
```typescript
{
  type: 'boolean',
  label: 'Active User',
  defaultValue: true
}
```

#### `date` - Date Picker
```typescript
{
  type: 'date',
  label: 'Birth Date',
  min: '1900-01-01',
  max: '2010-12-31'
}
```

#### `file` - File Upload
```typescript
{
  type: 'file',
  label: 'Profile Picture',
  accept: '.jpg,.jpeg,.png',
  maxSize: 5242880  // 5MB in bytes
}
```

#### `array` - Multiple Values
```typescript
{
  type: 'array',
  label: 'Skills',
  itemType: 'text',
  minItems: 1,
  maxItems: 10
}
```

## Complete Tool Examples

### User Management Tool

```typescript
const userManagementTool = {
  id: 'user-management',
  title: 'User Management',
  description: 'Manage user accounts, roles, and permissions',
  icon: 'users',
  category: 'Administration',
  tags: ['users', 'admin', 'management'],
  permissions: ['admin', 'users.read'],
  
  inputs: {
    searchTerm: {
      type: 'text',
      label: 'Search Users',
      placeholder: 'Search by name or email...'
    },
    roleFilter: {
      type: 'select',
      label: 'Role Filter',
      options: [
        { value: 'all', label: 'All Roles' },
        { value: 'admin', label: 'Administrators' },
        { value: 'manager', label: 'Managers' },
        { value: 'user', label: 'Users' }
      ],
      defaultValue: 'all'
    },
    activeOnly: {
      type: 'boolean',
      label: 'Active Users Only',
      defaultValue: true
    }
  },
  
  content: {
    type: 'editableTable',
    columns: {
      name: {
        type: 'text',
        label: 'Full Name',
        required: true,
        maxLength: 100
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
          { value: 'user', label: 'User' }
        ],
        required: true
      },
      active: {
        type: 'boolean',
        label: 'Active'
      },
      lastLogin: {
        type: 'datetime',
        label: 'Last Login'
      },
      createdAt: {
        type: 'datetime',
        label: 'Created'
      }
    },
    tableConfig: {
      pageSize: 20,
      sortable: true,
      searchable: true,
      exportable: true
    }
  },
  
  functions: {
    loadData: async ({ inputs }) => {
      const params = new URLSearchParams();
      if (inputs.searchTerm) params.append('search', inputs.searchTerm);
      if (inputs.roleFilter !== 'all') params.append('role', inputs.roleFilter);
      if (inputs.activeOnly) params.append('active', 'true');
      
      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load users');
      }
      
      return response.json();
    },
    
    createRow: async ({ data }) => {
      // Validation
      if (!data.name?.trim()) {
        throw new Error('Name is required');
      }
      
      if (!data.email?.includes('@')) {
        throw new Error('Valid email is required');
      }
      
      // Check for duplicate email
      const existingUser = await checkUserExists(data.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
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
    },
    
    updateRow: async ({ data }) => {
      const response = await fetch(`/api/users/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          updatedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      return response.json();
    },
    
    deleteRow: async ({ id }) => {
      const response = await fetch(`/api/users/${id}`, {
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

### Analytics Dashboard Tool

```typescript
const analyticsDashboardTool = {
  id: 'analytics-dashboard',
  title: 'Analytics Dashboard',
  description: 'View comprehensive analytics and key performance indicators',
  icon: 'chart-bar',
  category: 'Analytics',
  tags: ['analytics', 'dashboard', 'metrics', 'kpi'],
  
  inputs: {
    dateRange: {
      type: 'dateRange',
      label: 'Date Range',
      defaultValue: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    },
    metric: {
      type: 'select',
      label: 'Primary Metric',
      options: [
        { value: 'users', label: 'User Growth' },
        { value: 'revenue', label: 'Revenue' },
        { value: 'engagement', label: 'User Engagement' },
        { value: 'conversion', label: 'Conversion Rate' }
      ],
      defaultValue: 'users'
    },
    refreshInterval: {
      type: 'select',
      label: 'Auto Refresh',
      options: [
        { value: 'off', label: 'Off' },
        { value: '30', label: 'Every 30 seconds' },
        { value: '60', label: 'Every minute' },
        { value: '300', label: 'Every 5 minutes' }
      ],
      defaultValue: 'off'
    }
  },
  
  content: {
    type: 'displayRecord',
    fields: {
      totalUsers: {
        type: 'number',
        label: 'Total Users',
        format: 'compact'
      },
      activeUsers: {
        type: 'number',
        label: 'Active Users (30d)',
        format: 'compact'
      },
      newUsers: {
        type: 'number',
        label: 'New Users',
        format: 'compact'
      },
      userGrowth: {
        type: 'percentage',
        label: 'User Growth',
        colorize: true
      },
      totalRevenue: {
        type: 'currency',
        label: 'Total Revenue',
        currency: 'USD'
      },
      monthlyRevenue: {
        type: 'currency',
        label: 'Monthly Revenue',
        currency: 'USD'
      },
      revenueGrowth: {
        type: 'percentage',
        label: 'Revenue Growth',
        colorize: true
      },
      conversionRate: {
        type: 'percentage',
        label: 'Conversion Rate'
      },
      avgSessionDuration: {
        type: 'duration',
        label: 'Avg Session Duration'
      },
      lastUpdated: {
        type: 'datetime',
        label: 'Last Updated',
        format: 'relative'
      }
    },
    layout: 'grid',
    columns: 3
  },
  
  functions: {
    loadData: async ({ inputs }) => {
      const params = new URLSearchParams({
        startDate: inputs.dateRange?.start || '',
        endDate: inputs.dateRange?.end || '',
        metric: inputs.metric || 'users'
      });
      
      const response = await fetch(`/api/analytics/dashboard?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load analytics data');
      }
      
      const data = await response.json();
      
      // Add computed fields
      return {
        ...data,
        lastUpdated: new Date().toISOString()
      };
    }
  }
};
```

### Settings Configuration Tool

```typescript
const settingsConfigTool = {
  id: 'settings-config',
  title: 'Application Settings',
  description: 'Configure application settings and preferences',
  icon: 'cog',
  category: 'Configuration',
  tags: ['settings', 'config', 'preferences'],
  permissions: ['admin', 'settings.write'],
  
  content: {
    type: 'editForm',
    formConfig: {
      fields: [
        {
          type: 'group',
          label: 'General Settings',
          fields: [
            {
              name: 'appName',
              type: 'text',
              label: 'Application Name',
              required: true,
              maxLength: 100
            },
            {
              name: 'appDescription',
              type: 'textarea',
              label: 'Description',
              rows: 3,
              maxLength: 500
            },
            {
              name: 'timezone',
              type: 'select',
              label: 'Default Timezone',
              options: [
                { value: 'UTC', label: 'UTC' },
                { value: 'America/New_York', label: 'Eastern Time' },
                { value: 'America/Chicago', label: 'Central Time' },
                { value: 'America/Denver', label: 'Mountain Time' },
                { value: 'America/Los_Angeles', label: 'Pacific Time' }
              ],
              defaultValue: 'UTC'
            }
          ]
        },
        {
          type: 'group',
          label: 'User Settings',
          fields: [
            {
              name: 'allowRegistration',
              type: 'boolean',
              label: 'Allow User Registration',
              defaultValue: true
            },
            {
              name: 'requireEmailVerification',
              type: 'boolean',
              label: 'Require Email Verification',
              defaultValue: true
            },
            {
              name: 'maxUsers',
              type: 'number',
              label: 'Maximum Users',
              min: 1,
              max: 10000,
              visible: (data) => data.allowRegistration
            }
          ]
        },
        {
          type: 'group',
          label: 'Security Settings',
          fields: [
            {
              name: 'sessionTimeout',
              type: 'number',
              label: 'Session Timeout (minutes)',
              min: 5,
              max: 1440,
              defaultValue: 60
            },
            {
              name: 'passwordMinLength',
              type: 'number',
              label: 'Minimum Password Length',
              min: 6,
              max: 50,
              defaultValue: 8
            },
            {
              name: 'enableTwoFactor',
              type: 'boolean',
              label: 'Enable Two-Factor Authentication',
              defaultValue: false
            }
          ]
        }
      ],
      submitLabel: 'Save Settings',
      layout: 'vertical'
    },
    onSubmit: {
      functionName: 'saveSettings'
    }
  },
  
  functions: {
    loadData: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      
      return response.json();
    },
    
    saveSettings: async ({ data }) => {
      // Validation
      if (!data.appName?.trim()) {
        throw new Error('Application name is required');
      }
      
      if (data.maxUsers && data.maxUsers < 1) {
        throw new Error('Maximum users must be at least 1');
      }
      
      if (data.passwordMinLength < 6) {
        throw new Error('Password minimum length must be at least 6');
      }
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          updatedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      return response.json();
    }
  }
};
```

## Validation and Best Practices

### Tool ID Validation
```typescript
// ✅ Good - Valid tool IDs
'user-management'
'analytics-dashboard'
'order-processing'
'file-upload'

// ❌ Bad - Invalid tool IDs
'User Management'  // Contains spaces
'analytics_dashboard'  // Use hyphens, not underscores
'order.processing'  // Contains dots
'fileUpload'  // Use kebab-case, not camelCase
```

### Function Naming
```typescript
// ✅ Good - Clear function names
functions: {
  loadData: async () => { /* ... */ },
  createUser: async () => { /* ... */ },
  updateUser: async () => { /* ... */ },
  deleteUser: async () => { /* ... */ },
  exportData: async () => { /* ... */ }
}

// ❌ Bad - Unclear function names
functions: {
  getData: async () => { /* ... */ },
  doAction: async () => { /* ... */ },
  process: async () => { /* ... */ },
  handle: async () => { /* ... */ }
}
```

### Error Handling
```typescript
// ✅ Good - Proper error handling
functions: {
  loadData: async ({ inputs }) => {
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
```

### Input Validation
```typescript
// ✅ Good - Comprehensive input validation
inputs: {
  email: {
    type: 'email',
    label: 'Email Address',
    required: true,
    validation: [
      {
        rule: 'email',
        message: 'Please enter a valid email address'
      }
    ]
  },
  age: {
    type: 'number',
    label: 'Age',
    min: 0,
    max: 120,
    validation: [
      {
        rule: 'range',
        min: 0,
        max: 120,
        message: 'Age must be between 0 and 120'
      }
    ]
  }
}
```

## Related APIs

- **[UnspecdUI Class](./unspecd-ui.md)** - Main application class
- **[Component Types](./component-types.md)** - Available component types
- **[Type Definitions](./type-definitions.md)** - Complete TypeScript types

---

**Tool Specification is the foundation of every Unspec'd application!** Define your tools clearly and consistently for the best user experience. 🛠️ 