/**
 * Core TypeScript definitions for the Unspec'd DSL Schema (v1)
 *
 * This file contains the foundational type definitions that developers use
 * to define their tools in the Unspec'd declarative UI framework.
 */

/**
 * Definition for input fields that can be used to parameterize tool behavior.
 * These inputs will be rendered as form controls in the UI.
 */
export interface InputDefinition {
  /** The display label for this input field */
  label: string;

  /** The type of input control to render */
  type: 'text' | 'select' | 'number' | 'boolean' | 'textarea';

  /** Optional default value for the input field */
  defaultValue?: string | number | boolean;

  /** For 'select' type inputs, the available options */
  options?: Array<{ value: string | number; label: string }>;

  /** Optional placeholder text for text-based inputs */
  placeholder?: string;

  /** Whether this input is required */
  required?: boolean;
}

/**
 * Content type for displaying structured data records.
 * This pattern is ideal for "viewer" tools like user profiles, system status, etc.
 */
export interface DisplayRecordContent {
  /** Discriminator for the displayRecord content type */
  type: 'displayRecord';

  /**
   * Configuration for loading the data to display.
   * The referenced function should return Promise<object | null>.
   */
  dataLoader: {
    /** Name of the function in the ToolSpec.functions record to call for data loading */
    functionName: string;
  };

  /** Configuration for how to display the loaded data */
  displayConfig: {
    /**
     * Array of field configurations defining which properties to display
     * and how to format them.
     */
    fields: Array<{
      /** The property name from the loaded data object */
      field: string;

      /** The display label for this field */
      label: string;

      /**
       * Optional formatter string to apply to the field value.
       * Examples: 'date', 'currency', 'uppercase', etc.
       */
      formatter?: string;
    }>;
  };
}

/**
 * Content type for action buttons that perform operations.
 * This pattern is ideal for "action" tools like cache invalidation, data refresh, etc.
 */
export interface ActionButtonContent {
  /** Discriminator for the actionButton content type */
  type: 'actionButton';

  /** Optional description text to display above the button */
  description?: string;

  /** Configuration for the button appearance and behavior */
  buttonConfig: {
    /** The text label to display on the button */
    label: string;

    /** Whether to show a confirmation dialog before executing the action */
    needsConfirmation?: boolean;
  };

  /** Configuration for the action to perform when button is clicked */
  action: {
    /** Name of the function in the ToolSpec.functions record to call */
    functionName: string;

    /** Optional success message configuration */
    onSuccess?: {
      /** Message to display when the action completes successfully */
      message: string;
    };
  };
}

/**
 * Configuration for table column definitions.
 * Defines how each column should be displayed and what interactions are available.
 */
export interface TableColumnConfig {
  /** The property name from the data object to display in this column */
  field: string;

  /** The display header text for this column */
  label: string;

  /** Whether this column can be edited inline */
  isEditable?: boolean;

  /** The type of editor to use for inline editing */
  editorType?: 'text' | 'number' | 'boolean' | 'select' | 'textarea';

  /** For 'select' editor type, the available options */
  editorOptions?: Array<{ value: string | number; label: string }>;

  /** Whether this column can be sorted */
  isSortable?: boolean;

  /** Optional formatter to apply to the displayed value */
  formatter?: string;

  /** Whether this column should be hidden by default */
  hidden?: boolean;

  /** Custom width for this column (CSS value) */
  width?: string;
}

/**
 * Configuration for row-level actions in the table.
 * These actions appear in the actions column for each row.
 */
export interface TableRowAction {
  /** Unique identifier for this action */
  id: string;

  /** Display label for the action button */
  label: string;

  /** Icon to display (optional) */
  icon?: string;

  /** Style variant for the action button */
  variant?: 'primary' | 'secondary' | 'danger';

  /** Whether to show a confirmation dialog before executing */
  needsConfirmation?: boolean;

  /** The confirmation message to show (if needsConfirmation is true) */
  confirmationMessage?: string;

  /** Function to call when the action is triggered */
  functionName: string;
}

/**
 * Configuration for table pagination.
 */
export interface TablePaginationConfig {
  /** Default number of items per page */
  defaultPageSize?: number;

  /** Available page size options for user selection */
  pageSizeOptions?: number[];

  /** Whether to show page size selector */
  showPageSizeSelector?: boolean;

  /** Whether to show "Go to page" input */
  showPageJumper?: boolean;
}

/**
 * Configuration for default table sorting.
 */
export interface TableSortConfig {
  /** The field to sort by initially */
  field: string;

  /** The initial sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Configuration object for the editable table.
 * Contains all settings for columns, actions, pagination, and behavior.
 */
export interface TableConfig {
  /** The property name that uniquely identifies each row item */
  rowIdentifier: string;

  /**
   * Array of column configurations defining table structure.
   * Can be either:
   * - string[]: Simple array of field names (uses field name as both data key and capitalized header)
   * - TableColumnConfig[]: Detailed column configuration objects
   */
  columns: string[] | TableColumnConfig[];

  /** Optional configuration for inline editing functionality */
  itemUpdater?: {
    /** Function to call when saving inline edits */
    functionName: string;
  };

  /** Optional array of row-level actions */
  rowActions?: TableRowAction[];

  /** Optional pagination configuration */
  pagination?: TablePaginationConfig;

  /** Optional default sorting configuration */
  defaultSort?: TableSortConfig;

  /** Whether to show row selection checkboxes */
  enableRowSelection?: boolean;

  /** Whether to enable bulk actions */
  enableBulkActions?: boolean;

  /** Custom CSS classes to apply to the table */
  customClasses?: {
    table?: string;
    header?: string;
    body?: string;
    row?: string;
    cell?: string;
  };
}

/**
 * Content type for editable data tables with advanced features.
 * This pattern is ideal for data management tools, admin interfaces, and CRUD operations.
 */
export interface EditableTableContent {
  /** Discriminator for the editableTable content type */
  type: 'editableTable';

  /**
   * Configuration for loading the table data.
   * The referenced function should return Promise<{ items: any[], totalItems: number }>.
   */
  dataLoader: {
    /** Name of the function in the ToolSpec.functions record to call for data loading */
    functionName: string;
  };

  /** Comprehensive table configuration object */
  tableConfig: TableConfig;
}

/**
 * Configuration for form field definitions.
 * Defines how each form field should be rendered and validated.
 */
export interface FormFieldConfig {
  /** The property name from the data object that this field represents */
  field: string;

  /** The display label for this form field */
  label: string;

  /** The type of input editor to render */
  editorType:
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'datetime-local'
    | 'url'
    | 'tel';

  /** Whether this field can be edited (default: true) */
  isEditable?: boolean;

  /** Whether this field is read-only (overrides isEditable when true) */
  isReadOnly?: boolean;

  /** Whether this field is required for form submission */
  required?: boolean;

  /** Placeholder text for input fields */
  placeholder?: string;

  /** Help text to display below the field */
  helpText?: string;

  /** For 'select' and 'radio' editor types, the available options */
  options?: Array<{ value: string | number | boolean; label: string }>;

  /** Advanced editor configuration for complex field types */
  editorOptions?: {
    /** For 'select' editor type, dynamic options loader function */
    optionsLoader?: {
      /** Name of the function in the ToolSpec.functions record to call for loading options */
      functionName: string;
      /** Optional parameters to pass to the options loader function */
      params?: any;
    };
  };

  /** Default value for the field */
  defaultValue?: string | number | boolean;

  /** Validation rules for the field */
  validation?: {
    /** Minimum length for text inputs */
    minLength?: number;
    /** Maximum length for text inputs */
    maxLength?: number;
    /** Minimum value for number inputs */
    min?: number;
    /** Maximum value for number inputs */
    max?: number;
    /** Regular expression pattern for validation */
    pattern?: string;
    /** Custom validation error message */
    errorMessage?: string;
  };

  /** Custom CSS classes to apply to the field container */
  className?: string;

  /** Whether this field should be disabled */
  disabled?: boolean;

  /** Custom width for this field (CSS value) */
  width?: string;
}

/**
 * Configuration object for the edit form.
 * Contains all settings for form fields, layout, and behavior.
 */
export interface FormConfig {
  /** Array of field configurations defining form structure */
  fields: FormFieldConfig[];

  /** Optional form layout configuration */
  layout?: {
    /** Number of columns for form layout (default: 1) */
    columns?: number;
    /** Whether to group related fields in sections */
    useSections?: boolean;
    /** Custom CSS classes for the form container */
    formClassName?: string;
    /** Custom CSS classes for field containers */
    fieldClassName?: string;
  };

  /** Submit button configuration */
  submitButton?: {
    /** Text label for the submit button */
    label?: string;
    /** Whether to show a confirmation dialog before submission */
    needsConfirmation?: boolean;
    /** Confirmation message to show (if needsConfirmation is true) */
    confirmationMessage?: string;
  };

  /** Cancel button configuration */
  cancelButton?: {
    /** Text label for the cancel button */
    label?: string;
    /** Function to call when cancel is clicked */
    functionName?: string;
  };

  /** Form validation settings */
  validation?: {
    /** Whether to validate on blur (default: true) */
    validateOnBlur?: boolean;
    /** Whether to validate on change (default: false) */
    validateOnChange?: boolean;
    /** Whether to show validation errors inline (default: true) */
    showInlineErrors?: boolean;
  };
}

/**
 * Content type for editable forms with comprehensive field types and validation.
 * This pattern is ideal for data entry, user profiles, settings, and configuration forms.
 */
export interface EditFormContent {
  /** Discriminator for the editForm content type */
  type: 'editForm';

  /**
   * Optional configuration for loading initial form data.
   * The referenced function should return Promise<object | null>.
   */
  dataLoader?: {
    /** Name of the function in the ToolSpec.functions record to call for data loading */
    functionName: string;
  };

  /** Comprehensive form configuration object */
  formConfig: FormConfig;

  /** Configuration for handling form submission */
  onSubmit: {
    /** Name of the function in the ToolSpec.functions record to call for form submission */
    functionName: string;

    /** Optional success message configuration */
    onSuccess?: {
      /** Message to display when the form is submitted successfully */
      message: string;
      /** Whether to redirect after successful submission */
      redirect?: boolean;
      /** URL to redirect to (if redirect is true) */
      redirectUrl?: string;
    };
  };
}

/**
 * Union type of all available content types.
 * This will be expanded as new patterns are added to the framework.
 */
export type ToolContent = DisplayRecordContent | ActionButtonContent | EditableTableContent | EditFormContent;

/**
 * The main specification interface that developers implement to define their tools.
 * This is the core type that drives the entire Unspec'd framework.
 */
export interface ToolSpec {
  /** Unique identifier for this tool - must be unique across all tools */
  id: string;

  /** Display title for the tool, shown in the UI */
  title: string;

  /**
   * Optional input definitions for parameterizing tool behavior.
   * Keys become input names, values define the input configuration.
   */
  inputs?: Record<string, InputDefinition>;

  /**
   * The content configuration defining what this tool displays or does.
   * This is a discriminated union supporting different tool patterns.
   */
  content: ToolContent;

  /**
   * Record of functions that can be called by the tool's content configuration.
   * All functions must be async and return a Promise.
   *
   * Function signatures:
   * - For displayRecord dataLoader: (params: any) => Promise<object | null>
   * - For actionButton functions: (params: any) => Promise<any>
   * - For editableTable dataLoader: (params: { page: number, pageSize: number, sortBy?: string, sortDirection?: 'asc' | 'desc' }) => Promise<{ items: any[], totalItems: number }>
   * - For editableTable itemUpdater: (params: { itemId: any, changes: any, currentItem: any }) => Promise<any>
   * - For editableTable rowActions: (params: { itemId: any, item: any }) => Promise<any>
   * - For editForm dataLoader: (params: any) => Promise<object | null>
   * - For editForm onSubmit: (params: { formData: any, originalData?: any }) => Promise<any>
   * - For editForm cancelButton: (params: any) => Promise<any>
   *
   * The 'params' argument will contain the current input values and any
   * additional context provided by the framework.
   */
  functions: Record<string, (params: any) => Promise<any>>;
}
