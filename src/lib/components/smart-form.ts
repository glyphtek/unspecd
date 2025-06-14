/**
 * Smart Form Component for Unspec'd Framework
 *
 * This component renders dynamic forms based on EditFormContent configuration.
 * It handles various input types, validation, and styling while providing a
 * clean, accessible user interface for data entry and editing.
 */

import { invokeDataSource } from '../data-handler.js';
import type { EditFormContent, FormFieldConfig } from '../dsl-schema.js';
import { theme } from '../theme.js';

/**
 * Renders a smart form component based on the provided configuration.
 * This initial version handles static form rendering with various input types
 * and proper styling. Data loading and submission will be added in future versions.
 *
 * @param content - The EditFormContent configuration specifying form structure and behavior
 * @param specFunctions - Record of functions available from the ToolSpec
 * @param targetElement - The HTML element where the form should be rendered
 *
 * @example
 * ```typescript
 * const content: EditFormContent = {
 *   type: 'editForm',
 *   formConfig: {
 *     fields: [
 *       { field: 'name', label: 'Full Name', editorType: 'text', required: true },
 *       { field: 'email', label: 'Email Address', editorType: 'email', required: true },
 *       { field: 'age', label: 'Age', editorType: 'number' }
 *     ]
 *   },
 *   onSubmit: { functionName: 'saveUserData' }
 * };
 *
 * renderSmartFormComponent(content, spec.functions, containerElement);
 * ```
 */
export async function renderSmartFormComponent(
  content: EditFormContent,
  specFunctions: Record<string, (params: any) => Promise<any>>,
  targetElement: HTMLElement
): Promise<void> {
  // Clear the target element
  targetElement.innerHTML = '';

  // Show initial loading state
  const loadingElement = document.createElement('div');
  loadingElement.className = theme.feedback.loading;
  loadingElement.textContent = 'Loading form configuration...';
  targetElement.appendChild(loadingElement);

  try {
    // Phase 1: Load form data and options in parallel
    const [initialData, fieldOptions] = await Promise.all([
      loadInitialFormData(content, specFunctions),
      loadDynamicFieldOptions(content, specFunctions),
    ]);

    // Clear loading state
    targetElement.innerHTML = '';

    // Phase 2: Render form with all loaded data
    renderFormWithData(content, initialData, targetElement, specFunctions, fieldOptions);

    console.log('Smart form rendered successfully with', content.formConfig.fields.length, 'fields');
    if (initialData) {
      console.log('Form pre-populated with initial data:', initialData);
    }
    if (Object.keys(fieldOptions).length > 0) {
      console.log('Dynamic options loaded for fields:', Object.keys(fieldOptions));
    }
  } catch (error) {
    // Clear loading state and show error
    targetElement.innerHTML = '';

    const errorContainer = document.createElement('div');
    errorContainer.className = theme.feedback.error;

    const errorTitle = document.createElement('strong');
    errorTitle.textContent = 'Failed to Load Form Configuration';
    errorTitle.className = 'block font-semibold mb-2';

    const errorMessage = document.createElement('p');
    errorMessage.textContent = error instanceof Error ? error.message : 'Unknown error occurred';
    errorMessage.className = 'text-sm';

    errorContainer.appendChild(errorTitle);
    errorContainer.appendChild(errorMessage);
    targetElement.appendChild(errorContainer);

    console.error('Form loading failed:', error);
  }
}

/**
 * Loads initial form data if a dataLoader is configured.
 * Returns null if no dataLoader is specified.
 *
 * @param content - The EditFormContent configuration
 * @param specFunctions - Record of functions available from the ToolSpec
 * @returns Promise resolving to initial data or null
 */
async function loadInitialFormData(
  content: EditFormContent,
  specFunctions: Record<string, (params: any) => Promise<any>>
): Promise<any | null> {
  if (!content.dataLoader) {
    return null;
  }

  return new Promise((resolve, reject) => {
    invokeDataSource({
      specFunctions,
      functionName: content.dataLoader!.functionName,
      params: {},

      onPending: () => {
        console.log(`Loading form data using function: ${content.dataLoader!.functionName}`);
      },

      onFulfilled: (data: any) => {
        resolve(data);
      },

      onRejected: (error: Error) => {
        reject(new Error(`Failed to load form data: ${error.message}`));
      },
    });
  });
}

/**
 * Loads dynamic options for all fields that have optionsLoader configured.
 * Returns a record mapping field names to their loaded options.
 *
 * @param content - The EditFormContent configuration
 * @param specFunctions - Record of functions available from the ToolSpec
 * @returns Promise resolving to field options record
 */
async function loadDynamicFieldOptions(
  content: EditFormContent,
  specFunctions: Record<string, (params: any) => Promise<any>>
): Promise<Record<string, Array<{ value: string | number | boolean; label: string }>>> {
  // Identify fields with dynamic options
  const fieldsWithDynamicOptions = content.formConfig.fields.filter((field) => field.editorOptions?.optionsLoader);

  if (fieldsWithDynamicOptions.length === 0) {
    return {};
  }

  console.log(`Loading dynamic options for ${fieldsWithDynamicOptions.length} fields`);

  // Load all options in parallel
  const optionsPromises = fieldsWithDynamicOptions.map((field) => {
    const optionsLoader = field.editorOptions!.optionsLoader!;

    return new Promise<{ fieldName: string; options: any[] }>((resolve, reject) => {
      invokeDataSource({
        specFunctions,
        functionName: optionsLoader.functionName,
        params: optionsLoader.params || {},

        onPending: () => {
          console.log(`Loading options for field '${field.field}' using function: ${optionsLoader.functionName}`);
        },

        onFulfilled: (options: any) => {
          // Ensure options is an array
          const optionsArray = Array.isArray(options) ? options : [];
          resolve({ fieldName: field.field, options: optionsArray });
        },

        onRejected: (error: Error) => {
          reject(new Error(`Failed to load options for field '${field.field}': ${error.message}`));
        },
      });
    });
  });

  // Wait for all options to load
  const loadedOptions = await Promise.all(optionsPromises);

  // Convert to field name -> options record
  const fieldOptions: Record<string, Array<{ value: string | number | boolean; label: string }>> = {};

  for (const { fieldName, options } of loadedOptions) {
    fieldOptions[fieldName] = options;
  }

  return fieldOptions;
}

/**
 * Gathers value from a checkbox field
 * @param fieldName - The field name
 * @returns The checkbox value (true/false)
 */
function gatherCheckboxValue(fieldName: string): boolean {
  const checkboxContainer = document.querySelector(`#field-${fieldName}`);
  if (checkboxContainer) {
    const checkbox = checkboxContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
    return checkbox ? checkbox.checked : false;
  }
  return false;
}

/**
 * Gathers value from a radio field
 * @param fieldName - The field name
 * @returns The selected radio value or null
 */
function gatherRadioValue(fieldName: string): string | null {
  const selectedRadio = document.querySelector(`input[name="${fieldName}"]:checked`) as HTMLInputElement;
  return selectedRadio ? selectedRadio.value : null;
}

/**
 * Gathers value from a number field
 * @param fieldName - The field name
 * @returns The numeric value or null
 */
function gatherNumberValue(fieldName: string): number | null {
  const numberElement = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
  if (!numberElement) {
    console.warn(`Could not find number field with name: ${fieldName}`);
    return null;
  }
  const numValue = numberElement.value;
  return numValue ? Number.parseFloat(numValue) : null;
}

/**
 * Gathers value from a select field
 * @param fieldName - The field name
 * @returns The selected value or null
 */
function gatherSelectValue(fieldName: string): string | null {
  const selectElement = document.querySelector(`[name="${fieldName}"]`) as HTMLSelectElement;
  if (!selectElement) {
    console.warn(`Could not find select field with name: ${fieldName}`);
    return null;
  }
  return selectElement.value || null;
}

/**
 * Gathers value from a text-based field (text, email, password, date, textarea, etc.)
 * @param fieldName - The field name
 * @returns The text value or null
 */
function gatherTextValue(fieldName: string): string | null {
  const textElement = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | HTMLTextAreaElement;
  if (!textElement) {
    console.warn(`Could not find text field with name: ${fieldName}`);
    return null;
  }
  const textValue = textElement.value.trim();
  return textValue || null;
}

/**
 * Gathers the current value from a specific form field by its field name.
 * This function reads the DOM to get the current value of each field type.
 *
 * @param fieldConfig - The configuration for the field to gather data from
 * @returns The current value of the field, or null if not found or empty
 */
function gatherFieldValue(fieldConfig: FormFieldConfig): any {
  const fieldName = fieldConfig.field;

  switch (fieldConfig.editorType) {
    case 'checkbox':
      return gatherCheckboxValue(fieldName);
    
    case 'radio':
      return gatherRadioValue(fieldName);
    
    case 'number':
      return gatherNumberValue(fieldName);
    
    case 'select':
      return gatherSelectValue(fieldName);
    
    default:
      return gatherTextValue(fieldName);
  }
}

/**
 * Renders the complete form with optional initial data.
 * This function handles both empty forms and forms pre-populated with data.
 *
 * @param content - The EditFormContent configuration
 * @param initialData - Optional data to pre-populate the form fields
 * @param targetElement - The HTML element where the form should be rendered
 * @param specFunctions - Record of functions available from the ToolSpec
 */
function renderFormWithData(
  content: EditFormContent,
  initialData: any | null,
  targetElement: HTMLElement,
  specFunctions: Record<string, (params: any) => Promise<any>>,
  fieldOptions: Record<string, Array<{ value: string | number | boolean; label: string }>> = {}
): void {
  // Create the main form element
  const form = document.createElement('form');
  form.className = `${theme.panel} max-w-2xl mx-auto`;
  form.setAttribute('novalidate', ''); // We'll handle validation ourselves

  // Create form container for fields
  const fieldsContainer = document.createElement('div');
  fieldsContainer.className = 'space-y-6';

  // Render each form field with initial data and dynamic options
  content.formConfig.fields.forEach((fieldConfig) => {
    const fieldValue = initialData ? initialData[fieldConfig.field] : undefined;
    const dynamicOptions = fieldOptions[fieldConfig.field];
    const fieldContainer = renderFormField(fieldConfig, fieldValue, dynamicOptions);
    fieldsContainer.appendChild(fieldContainer);
  });

  // Add fields container to form
  form.appendChild(fieldsContainer);

  // Create submit button
  const submitButtonContainer = document.createElement('div');
  submitButtonContainer.className = 'pt-6 border-t border-gray-200/60 mt-8';

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = content.formConfig.submitButton?.label || 'Submit';
  submitButton.className = theme.button.primary;

  submitButtonContainer.appendChild(submitButton);
  form.appendChild(submitButtonContainer);

  // Add submit event listener to form
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Gather current form data
    const formData: any = {};

    content.formConfig.fields.forEach((fieldConfig) => {
      const fieldValue = gatherFieldValue(fieldConfig);
      if (fieldValue !== null) {
        formData[fieldConfig.field] = fieldValue;
      }
    });

    console.log('Form data gathered:', formData);

    // Submit the form using invokeDataSource
    await invokeDataSource({
      specFunctions,
      functionName: content.onSubmit.functionName,
      params: {
        formData: formData,
        originalData: initialData,
      },

      onPending: () => {
        // Disable submit button and show submitting state
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        submitButton.className = submitButton.className.replace(
          'bg-blue-600 hover:bg-blue-700',
          'bg-gray-400 cursor-not-allowed'
        );

        console.log('Form submission started');
      },

      onFulfilled: (response: any) => {
        // Re-enable submit button
        resetSubmitButton(submitButton, content);

        // Show success message
        const successMessage = processSuccessMessage(response);
        window.alert(successMessage);

        // Handle potential redirect
        handleRedirect(content);

        console.log('Form submitted successfully:', response);
      },

      onRejected: (error: Error) => {
        // Re-enable submit button
        resetSubmitButton(submitButton, content);

        // Show error message
        window.alert(`Form submission failed: ${error.message}`);

        console.error('Form submission failed:', error);
      },
    });
  });

  // Add form to target element
  targetElement.appendChild(form);
}

/**
 * Creates a form field label with optional required indicator
 * @param fieldConfig - The field configuration
 * @returns The created label element
 */
function createFormFieldLabel(fieldConfig: FormFieldConfig): HTMLLabelElement {
  const label = document.createElement('label');
  label.textContent = fieldConfig.label;
  if (fieldConfig.required) {
    label.textContent += ' *';
  }
  label.className = `${theme.label} block`;
  return label;
}

/**
 * Configures a checkbox input element with attributes and initial value
 * @param inputElement - The checkbox container element
 * @param fieldConfig - The field configuration
 * @param initialValue - The initial value to set
 * @param label - The label element to associate
 */
function configureCheckboxInput(
  inputElement: HTMLElement,
  fieldConfig: FormFieldConfig,
  initialValue: any,
  label: HTMLLabelElement
): void {
  const checkbox = inputElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
  if (checkbox) {
    checkbox.setAttribute('name', fieldConfig.field);
    checkbox.id = `field-${fieldConfig.field}`;
    label.setAttribute('for', checkbox.id);

    if (fieldConfig.required) {
      checkbox.setAttribute('required', '');
    }
    if (fieldConfig.disabled) {
      checkbox.setAttribute('disabled', '');
    }

    // Set initial value
    const valueToSet = initialValue !== undefined ? initialValue : fieldConfig.defaultValue;
    if (valueToSet !== undefined && valueToSet) {
      checkbox.checked = true;
    }
  }
}

/**
 * Configures a radio input group with initial value
 * @param inputElement - The radio container element
 * @param fieldConfig - The field configuration
 * @param initialValue - The initial value to set
 */
function configureRadioInput(
  inputElement: HTMLElement,
  fieldConfig: FormFieldConfig,
  initialValue: any
): void {
  // Set initial value
  const valueToSet = initialValue !== undefined ? initialValue : fieldConfig.defaultValue;
  if (valueToSet !== undefined) {
    const radioToCheck = inputElement.querySelector(`input[value="${valueToSet}"]`) as HTMLInputElement;
    if (radioToCheck) {
      radioToCheck.checked = true;
    }
  }
}

/**
 * Configures a regular input element (text, select, textarea, etc.) with attributes and value
 * @param inputElement - The input element
 * @param fieldConfig - The field configuration
 * @param initialValue - The initial value to set
 * @param label - The label element to associate
 */
function configureRegularInput(
  inputElement: HTMLElement,
  fieldConfig: FormFieldConfig,
  initialValue: any,
  label: HTMLLabelElement
): void {
  inputElement.setAttribute('name', fieldConfig.field);
  label.setAttribute('for', inputElement.id);

  // Set required attribute
  if (fieldConfig.required) {
    inputElement.setAttribute('required', '');
  }

  // Set disabled state
  if (fieldConfig.disabled) {
    inputElement.setAttribute('disabled', '');
  }

  // Set readonly state
  if (fieldConfig.isReadOnly) {
    inputElement.setAttribute('readonly', '');
  }

  // Set initial value
  const valueToSet = initialValue !== undefined ? initialValue : fieldConfig.defaultValue;
  if (valueToSet !== undefined) {
    if (
      inputElement instanceof HTMLInputElement ||
      inputElement instanceof HTMLTextAreaElement ||
      inputElement instanceof HTMLSelectElement
    ) {
      inputElement.value = String(valueToSet);
    }
  }

  // Set placeholder
  if (fieldConfig.placeholder && 'placeholder' in inputElement) {
    (inputElement as HTMLInputElement | HTMLTextAreaElement).placeholder = fieldConfig.placeholder;
  }
}

/**
 * Creates help text for a form field if provided
 * @param fieldConfig - The field configuration
 * @returns The help text element or null if no help text
 */
function createHelpText(fieldConfig: FormFieldConfig): HTMLParagraphElement | null {
  if (fieldConfig.helpText) {
    const helpText = document.createElement('p');
    helpText.textContent = fieldConfig.helpText;
    helpText.className = `${theme.text.sm} text-gray-500`;
    return helpText;
  }
  return null;
}

/**
 * Renders a single form field based on its configuration.
 * Creates the appropriate input element based on the editorType.
 *
 * @param fieldConfig - Configuration for the individual form field
 * @param initialValue - Optional initial value to pre-populate the field
 * @param dynamicOptions - Optional dynamic options for select fields loaded via optionsLoader
 * @returns HTMLElement containing the complete field (label, input, help text)
 */
function renderFormField(
  fieldConfig: FormFieldConfig,
  initialValue?: any,
  dynamicOptions?: Array<{ value: string | number | boolean; label: string }>
): HTMLElement {
  // Create field container
  const fieldContainer = document.createElement('div');
  fieldContainer.className = 'space-y-2';

  // Create label
  const label = createFormFieldLabel(fieldConfig);

  // Create the appropriate input element based on editorType
  const inputElement = createInputElement(fieldConfig, dynamicOptions);

  // Configure input element based on type
  if (inputElement) {
    inputElement.id = `field-${fieldConfig.field}`;

    if (fieldConfig.editorType === 'checkbox') {
      configureCheckboxInput(inputElement, fieldConfig, initialValue, label);
    } else if (fieldConfig.editorType === 'radio') {
      configureRadioInput(inputElement, fieldConfig, initialValue);
    } else {
      configureRegularInput(inputElement, fieldConfig, initialValue, label);
    }
  }

  // Assemble the field
  fieldContainer.appendChild(label);
  if (inputElement) {
    fieldContainer.appendChild(inputElement);
  }

  // Add help text if provided
  const helpText = createHelpText(fieldConfig);
  if (helpText) {
    fieldContainer.appendChild(helpText);
  }

  return fieldContainer;
}

/**
 * Creates the appropriate input element based on the field's editorType.
 *
 * @param fieldConfig - Configuration for the form field
 * @param dynamicOptions - Optional dynamic options for select fields loaded via optionsLoader
 * @returns The created input element or null if editorType is not supported
 */
function createInputElement(
  fieldConfig: FormFieldConfig,
  dynamicOptions?: Array<{ value: string | number | boolean; label: string }>
): HTMLElement | null {
  const { editorType } = fieldConfig;

  switch (editorType) {
    case 'text':
    case 'email':
    case 'password':
    case 'url':
    case 'tel':
    case 'number':
    case 'date':
    case 'datetime-local': {
      const input = document.createElement('input');
      input.type = editorType;
      input.className = theme.textInput;
      return input;
    }

    case 'textarea': {
      const textarea = document.createElement('textarea');
      textarea.className = `${theme.textInput} min-h-[100px] resize-vertical`;
      textarea.rows = 4;
      return textarea;
    }

    case 'select': {
      const select = document.createElement('select');
      select.className = theme.textInput;

      // Add default empty option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select an option...';
      select.appendChild(defaultOption);

      // Prioritize dynamic options over static options
      const optionsToUse = dynamicOptions || fieldConfig.options;

      if (optionsToUse) {
        optionsToUse.forEach((option) => {
          const optionElement = document.createElement('option');
          optionElement.value = String(option.value);
          optionElement.textContent = option.label;
          select.appendChild(optionElement);
        });
      }

      return select;
    }

    case 'checkbox': {
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'flex items-center space-x-2';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded';

      const checkboxLabel = document.createElement('span');
      checkboxLabel.textContent = 'Enable';
      checkboxLabel.className = theme.text.base;

      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(checkboxLabel);

      return checkboxContainer;
    }

    case 'radio': {
      const radioContainer = document.createElement('div');
      radioContainer.className = 'space-y-2';

      // Prioritize dynamic options over static options
      const radioOptionsToUse = dynamicOptions || fieldConfig.options;

      if (radioOptionsToUse) {
        radioOptionsToUse.forEach((option, index) => {
          const radioOption = document.createElement('div');
          radioOption.className = 'flex items-center space-x-2';

          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = fieldConfig.field;
          radio.value = String(option.value);
          radio.id = `${fieldConfig.field}-${index}`;
          radio.className = 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300';

          const radioLabel = document.createElement('label');
          radioLabel.textContent = option.label;
          radioLabel.setAttribute('for', radio.id);
          radioLabel.className = `${theme.text.base} cursor-pointer`;

          radioOption.appendChild(radio);
          radioOption.appendChild(radioLabel);
          radioContainer.appendChild(radioOption);
        });
      }

      return radioContainer;
    }

    default:
      console.warn(`Unsupported editorType: ${editorType}`);
      return null;
  }
}

/**
 * Re-enables the submit button and restores its original state
 * @param submitButton - The submit button element
 * @param content - The form content configuration
 */
function resetSubmitButton(submitButton: HTMLButtonElement, content: EditFormContent): void {
  submitButton.disabled = false;
  submitButton.textContent = content.formConfig.submitButton?.label || 'Submit';
  submitButton.className = theme.button.primary;
}

/**
 * Extracts and processes the success message from the response
 * @param response - The response from the form submission
 * @returns The processed success message
 */
function processSuccessMessage(response: any): string {
  let successMessage = 'Form submitted successfully!';

  if (response && typeof response === 'object') {
    if (response.message) {
      successMessage = response.message;
    } else if (response.success && response.message) {
      successMessage = response.message;
    }
  }

  return successMessage;
}

/**
 * Handles post-submission redirect if configured
 * @param content - The form content configuration
 */
function handleRedirect(content: EditFormContent): void {
  if (content.onSubmit.onSuccess?.redirect && content.onSubmit.onSuccess?.redirectUrl) {
    window.location.href = content.onSubmit.onSuccess.redirectUrl;
  }
}
