# Edit Form

The Edit Form component provides a comprehensive form interface for editing single records with validation, custom layouts, and user-friendly error handling. It's perfect for profile editing, settings pages, and detailed data entry.

## Basic Usage

```typescript
const userProfileEditor = {
  id: 'user-profile-editor',
  title: 'Edit User Profile',
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
          name: 'email',
          type: 'email',
          label: 'Email Address',
          required: true
        },
        {
          name: 'bio',
          type: 'textarea',
          label: 'Biography',
          rows: 4,
          placeholder: 'Tell us about yourself...'
        }
      ]
    },
    onSubmit: {
      functionName: 'saveProfile'
    }
  },
  functions: {
    loadData: async () => {
      const response = await fetch('/api/user/profile');
      return response.json();
    },
    saveProfile: async ({ data }) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      
      return response.json();
    }
  }
};
```

## Configuration

### `formConfig`
Defines the form structure and field configuration.

```typescript
formConfig: {
  fields: [
    {
      name: 'fieldName',        // Required: Field identifier
      type: 'text',            // Required: Field type
      label: 'Display Label',  // Required: Field label
      required: false,         // Optional: Required validation
      defaultValue: '',        // Optional: Default value
      placeholder: '',         // Optional: Placeholder text
      // ... type-specific properties
    }
  ],
  layout: 'vertical',          // Optional: Form layout
  submitLabel: 'Save Changes', // Optional: Submit button text
  cancelLabel: 'Cancel'        // Optional: Cancel button text
}
```

### `onSubmit`
Specifies the function to call when the form is submitted.

```typescript
onSubmit: {
  functionName: 'saveData'  // Function name in the functions object
}
```

## Field Types

### `text` - Text Input
```typescript
{
  name: 'firstName',
  type: 'text',
  label: 'First Name',
  required: true,
  maxLength: 50,
  minLength: 2,
  placeholder: 'Enter your first name'
}
```

**Properties:**
- `required` - Field is required
- `maxLength` - Maximum character length
- `minLength` - Minimum character length
- `placeholder` - Input placeholder
- `pattern` - Regex validation pattern

### `email` - Email Input
```typescript
{
  name: 'email',
  type: 'email',
  label: 'Email Address',
  required: true,
  placeholder: 'user@example.com'
}
```

**Properties:**
- Automatic email format validation
- Built-in email input type
- Required field support

### `number` - Numeric Input
```typescript
{
  name: 'age',
  type: 'number',
  label: 'Age',
  min: 18,
  max: 100,
  step: 1,
  defaultValue: 25
}
```

**Properties:**
- `min` - Minimum value
- `max` - Maximum value
- `step` - Increment step
- `integer` - Force integer values only

### `boolean` - Checkbox
```typescript
{
  name: 'newsletter',
  type: 'boolean',
  label: 'Subscribe to Newsletter',
  defaultValue: false
}
```

**Properties:**
- Renders as checkbox
- `defaultValue` - Initial checked state

### `select` - Dropdown
```typescript
{
  name: 'country',
  type: 'select',
  label: 'Country',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' }
  ],
  required: true,
  placeholder: 'Select a country'
}
```

**Properties:**
- `options` - Array of value/label pairs
- `required` - Require selection
- `placeholder` - Placeholder text

### `date` - Date Picker
```typescript
{
  name: 'birthDate',
  type: 'date',
  label: 'Date of Birth',
  min: '1900-01-01',
  max: '2010-12-31'
}
```

**Properties:**
- `min` - Minimum date (YYYY-MM-DD)
- `max` - Maximum date (YYYY-MM-DD)
- Native date picker interface

### `textarea` - Multi-line Text
```typescript
{
  name: 'description',
  type: 'textarea',
  label: 'Description',
  rows: 5,
  maxLength: 1000,
  placeholder: 'Enter a detailed description...'
}
```

**Properties:**
- `rows` - Number of visible rows
- `maxLength` - Character limit
- `placeholder` - Placeholder text

### `currency` - Money Input
```typescript
{
  name: 'budget',
  type: 'currency',
  label: 'Budget',
  min: 0,
  currency: 'USD',
  defaultValue: 1000
}
```

**Properties:**
- Automatic currency formatting
- `min`/`max` - Value limits
- `currency` - Currency code (default: USD)

### `url` - URL Input
```typescript
{
  name: 'website',
  type: 'url',
  label: 'Website',
  placeholder: 'https://example.com'
}
```

**Properties:**
- URL format validation
- Automatic protocol handling

### `tel` - Phone Input
```typescript
{
  name: 'phone',
  type: 'tel',
  label: 'Phone Number',
  pattern: '[0-9]{3}-[0-9]{3}-[0-9]{4}',
  placeholder: '123-456-7890'
}
```

**Properties:**
- Phone number input type
- `pattern` - Validation pattern

### `password` - Password Input
```typescript
{
  name: 'password',
  type: 'password',
  label: 'New Password',
  required: true,
  minLength: 8,
  placeholder: 'Enter a secure password'
}
```

**Properties:**
- Masked input
- `minLength` - Minimum password length
- Built-in security considerations

## Required Functions

### `loadData()` (Optional)
Loads initial form data. If not provided, form starts empty.

```typescript
functions: {
  loadData: async ({ inputs }) => {
    const userId = inputs?.userId || 'current';
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to load user data');
    }
    
    return response.json();
  }
}
```

**Parameters:**
- `inputs` - Tool inputs configuration

**Return Value:**
Object with field values matching form field names.

### `onSubmit({ data })`
Handles form submission.

```typescript
functions: {
  saveProfile: async ({ data, inputs }) => {
    // Validation
    if (!data.firstName?.trim()) {
      throw new Error('First name is required');
    }
    
    if (!data.email?.includes('@')) {
      throw new Error('Please provide a valid email address');
    }
    
    // Save data
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        updatedAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save profile');
    }
    
    return response.json();
  }
}
```

**Parameters:**
- `data` - Form data object
- `inputs` - Tool inputs configuration

**Return Value:**
Success confirmation or updated data object.

## Advanced Configuration

### Form Layout

```typescript
formConfig: {
  fields: [/* ... */],
  layout: 'vertical',     // 'vertical' | 'horizontal' | 'grid'
  columns: 2,             // For grid layout
  spacing: 'normal',      // 'compact' | 'normal' | 'relaxed'
  submitLabel: 'Save',
  cancelLabel: 'Cancel',
  showCancel: true
}
```

### Field Groups

```typescript
formConfig: {
  fields: [
    {
      type: 'group',
      label: 'Personal Information',
      fields: [
        { name: 'firstName', type: 'text', label: 'First Name' },
        { name: 'lastName', type: 'text', label: 'Last Name' }
      ]
    },
    {
      type: 'group',
      label: 'Contact Information',
      fields: [
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'phone', type: 'tel', label: 'Phone' }
      ]
    }
  ]
}
```

### Conditional Fields

```typescript
formConfig: {
  fields: [
    {
      name: 'hasAddress',
      type: 'boolean',
      label: 'Provide Address'
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Address',
      visible: (formData) => formData.hasAddress === true
    }
  ]
}
```

### Custom Validation

```typescript
formConfig: {
  fields: [
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      validate: (value) => {
        if (value.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        if (!/[A-Z]/.test(value)) {
          throw new Error('Password must contain an uppercase letter');
        }
        if (!/[0-9]/.test(value)) {
          throw new Error('Password must contain a number');
        }
      }
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirm Password',
      validate: (value, formData) => {
        if (value !== formData.password) {
          throw new Error('Passwords do not match');
        }
      }
    }
  ]
}
```

## Complete Examples

### User Registration Form

```typescript
const userRegistration = {
  id: 'user-registration',
  title: 'User Registration',
  content: {
    type: 'editForm',
    formConfig: {
      fields: [
        {
          type: 'group',
          label: 'Account Information',
          fields: [
            {
              name: 'username',
              type: 'text',
              label: 'Username',
              required: true,
              minLength: 3,
              maxLength: 20,
              pattern: '^[a-zA-Z0-9_]+$',
              placeholder: 'Choose a unique username'
            },
            {
              name: 'email',
              type: 'email',
              label: 'Email Address',
              required: true,
              placeholder: 'your@email.com'
            },
            {
              name: 'password',
              type: 'password',
              label: 'Password',
              required: true,
              minLength: 8,
              placeholder: 'Create a secure password'
            },
            {
              name: 'confirmPassword',
              type: 'password',
              label: 'Confirm Password',
              required: true,
              placeholder: 'Confirm your password'
            }
          ]
        },
        {
          type: 'group',
          label: 'Personal Information',
          fields: [
            {
              name: 'firstName',
              type: 'text',
              label: 'First Name',
              required: true,
              maxLength: 50
            },
            {
              name: 'lastName',
              type: 'text',
              label: 'Last Name',
              required: true,
              maxLength: 50
            },
            {
              name: 'birthDate',
              type: 'date',
              label: 'Date of Birth',
              max: new Date().toISOString().split('T')[0]
            },
            {
              name: 'country',
              type: 'select',
              label: 'Country',
              options: [
                { value: 'us', label: 'United States' },
                { value: 'ca', label: 'Canada' },
                { value: 'uk', label: 'United Kingdom' },
                { value: 'au', label: 'Australia' }
              ],
              required: true
            }
          ]
        },
        {
          type: 'group',
          label: 'Preferences',
          fields: [
            {
              name: 'newsletter',
              type: 'boolean',
              label: 'Subscribe to Newsletter',
              defaultValue: true
            },
            {
              name: 'notifications',
              type: 'boolean',
              label: 'Enable Email Notifications',
              defaultValue: false
            }
          ]
        }
      ],
      layout: 'vertical',
      submitLabel: 'Create Account',
      cancelLabel: 'Cancel'
    },
    onSubmit: {
      functionName: 'createUser'
    }
  },
  functions: {
    createUser: async ({ data }) => {
      // Validation
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      // Check username availability
      const usernameExists = await checkUsernameExists(data.username);
      if (usernameExists) {
        throw new Error('Username is already taken');
      }
      
      // Check email availability
      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        throw new Error('Email address is already registered');
      }
      
      // Create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate,
          country: data.country,
          preferences: {
            newsletter: data.newsletter,
            notifications: data.notifications
          },
          createdAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create account');
      }
      
      return response.json();
    }
  }
};
```

### Company Settings Form

```typescript
const companySettings = {
  id: 'company-settings',
  title: 'Company Settings',
  content: {
    type: 'editForm',
    formConfig: {
      fields: [
        {
          type: 'group',
          label: 'Company Information',
          fields: [
            {
              name: 'companyName',
              type: 'text',
              label: 'Company Name',
              required: true,
              maxLength: 100
            },
            {
              name: 'industry',
              type: 'select',
              label: 'Industry',
              options: [
                { value: 'technology', label: 'Technology' },
                { value: 'finance', label: 'Finance' },
                { value: 'healthcare', label: 'Healthcare' },
                { value: 'retail', label: 'Retail' },
                { value: 'manufacturing', label: 'Manufacturing' },
                { value: 'other', label: 'Other' }
              ]
            },
            {
              name: 'website',
              type: 'url',
              label: 'Website',
              placeholder: 'https://company.com'
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Company Description',
              rows: 4,
              maxLength: 500,
              placeholder: 'Brief description of your company...'
            }
          ]
        },
        {
          type: 'group',
          label: 'Contact Information',
          fields: [
            {
              name: 'email',
              type: 'email',
              label: 'Contact Email',
              required: true
            },
            {
              name: 'phone',
              type: 'tel',
              label: 'Phone Number',
              pattern: '[0-9]{3}-[0-9]{3}-[0-9]{4}'
            },
            {
              name: 'address',
              type: 'textarea',
              label: 'Address',
              rows: 3,
              placeholder: 'Company address...'
            }
          ]
        },
        {
          type: 'group',
          label: 'Billing Information',
          fields: [
            {
              name: 'billingEmail',
              type: 'email',
              label: 'Billing Email'
            },
            {
              name: 'taxId',
              type: 'text',
              label: 'Tax ID',
              placeholder: 'XX-XXXXXXX'
            },
            {
              name: 'currency',
              type: 'select',
              label: 'Default Currency',
              options: [
                { value: 'USD', label: 'US Dollar (USD)' },
                { value: 'EUR', label: 'Euro (EUR)' },
                { value: 'GBP', label: 'British Pound (GBP)' },
                { value: 'CAD', label: 'Canadian Dollar (CAD)' }
              ],
              defaultValue: 'USD'
            }
          ]
        }
      ],
      layout: 'vertical',
      submitLabel: 'Save Settings'
    },
    onSubmit: {
      functionName: 'saveSettings'
    }
  },
  functions: {
    loadData: async () => {
      const response = await fetch('/api/company/settings');
      return response.json();
    },
    
    saveSettings: async ({ data }) => {
      // Validation
      if (!data.companyName?.trim()) {
        throw new Error('Company name is required');
      }
      
      if (!data.email?.includes('@')) {
        throw new Error('Valid contact email is required');
      }
      
      const response = await fetch('/api/company/settings', {
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

## Features

### Real-time Validation
- Field-level validation on blur
- Form-level validation on submit
- Custom validation functions
- User-friendly error messages

### Auto-save (Optional)
```typescript
formConfig: {
  fields: [/* ... */],
  autoSave: true,
  autoSaveDelay: 2000  // Save after 2 seconds of inactivity
}
```

### Form State Management
- Dirty state tracking
- Unsaved changes warning
- Reset functionality
- Default value handling

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

## Styling and Customization

### CSS Classes
```css
/* Form container */
.unspecd-edit-form {
  /* Custom form styles */
}

/* Field groups */
.unspecd-field-group {
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

/* Form fields */
.unspecd-form-field {
  margin-bottom: 1rem;
}

/* Field labels */
.unspecd-field-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Input fields */
.unspecd-form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

/* Validation errors */
.unspecd-field-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Submit button */
.unspecd-submit-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
}
```

### Responsive Design
- Mobile-optimized layouts
- Touch-friendly form controls
- Adaptive field sizing
- Collapsible field groups

## Best Practices

### 1. **Logical Field Organization**
```typescript
// ✅ Good - Group related fields
fields: [
  {
    type: 'group',
    label: 'Personal Info',
    fields: [
      { name: 'firstName', type: 'text', label: 'First Name' },
      { name: 'lastName', type: 'text', label: 'Last Name' }
    ]
  }
]
```

### 2. **Clear Validation Messages**
```typescript
// ✅ Good - Specific, actionable messages
validate: (value) => {
  if (!value?.includes('@')) {
    throw new Error('Please enter a valid email address');
  }
}

// ❌ Bad - Generic messages
validate: (value) => {
  if (!value?.includes('@')) {
    throw new Error('Invalid input');
  }
}
```

### 3. **Appropriate Field Types**
```typescript
// ✅ Good - Use specific types
{ name: 'email', type: 'email', label: 'Email' },
{ name: 'phone', type: 'tel', label: 'Phone' },
{ name: 'website', type: 'url', label: 'Website' }

// ❌ Bad - Generic text for everything
{ name: 'email', type: 'text', label: 'Email' },
{ name: 'phone', type: 'text', label: 'Phone' }
```

### 4. **Progressive Enhancement**
```typescript
// ✅ Good - Optional fields with defaults
{
  name: 'newsletter',
  type: 'boolean',
  label: 'Subscribe to Newsletter',
  defaultValue: false  // Clear default
}
```

## Common Use Cases

- **User profile and account editing**
- **Settings and configuration forms**
- **Registration and onboarding**
- **Content creation and editing**
- **Survey and feedback forms**
- **Application and request forms**

## Related Components

- **[Editable Table](./editable-table.md)** - For editing multiple records
- **[Display Record](./display-record.md)** - For showing form data
- **[Action Button](./action-button.md)** - For form submission workflows

---

**Edit Form provides comprehensive single-record editing with professional validation and user experience!** Perfect for any scenario where users need to input or modify structured data. ✏️ 