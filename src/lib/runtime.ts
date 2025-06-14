/**
 * Unspec'd Framework Runtime
 *
 * This file contains the core runtime logic for rendering tools based on their
 * ToolSpec definitions. It acts as the main entry point for the framework.
 */

import { renderSmartFormComponent } from './components/smart-form.js';
import { renderSmartTableComponent } from './components/smart-table.js';
import { renderStreamingTableComponent } from './components/streaming-table.js';
import type {
  ActionButtonContent,
  DisplayRecordContent,
  EditFormContent,
  EditableTableContent,
  ToolSpec,
} from './dsl-schema.js';

/**
 * Renderer for displayRecord content type.
 * Loads data using the configured dataLoader and displays fields according to displayConfig.
 *
 * @param content - The displayRecord content configuration
 * @param functions - The functions record from the ToolSpec
 * @param targetElement - The HTML element to render into
 */
async function renderDisplayRecordComponent(
  content: DisplayRecordContent,
  functions: Record<string, (params: any) => Promise<any>>,
  targetElement: HTMLElement
): Promise<void> {


  // Create a loading indicator
  const loadingElement = document.createElement('div');
  loadingElement.className = 'flex items-center justify-center p-8';
  loadingElement.innerHTML = `
    <div class="animate-pulse flex items-center space-x-2">
      <div class="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
      <div class="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
      <div class="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      <span class="ml-2 text-gray-600">Loading data...</span>
    </div>
  `;
  targetElement.appendChild(loadingElement);

  try {
    // Get the data loader function
    const dataLoaderFunction = functions[content.dataLoader.functionName];
    if (!dataLoaderFunction) {
      throw new Error(`Data loader function '${content.dataLoader.functionName}' not found`);
    }

    // Load the data
    const data = await dataLoaderFunction({});

    // Remove loading indicator
    targetElement.removeChild(loadingElement);

    if (!data) {
      // Handle no data case
      const noDataElement = document.createElement('div');
      noDataElement.className = 'text-center p-8 text-gray-500';
      noDataElement.textContent = 'No data available';
      targetElement.appendChild(noDataElement);
      return;
    }

    // Create the display record container
    const recordContainer = document.createElement('div');
    recordContainer.className = 'bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4';

    // Render each configured field
    content.displayConfig.fields.forEach((fieldConfig) => {
      const fieldValue = data[fieldConfig.field];

      // Create field container
      const fieldContainer = document.createElement('div');
      fieldContainer.className = 'border-b border-gray-100 pb-3 last:border-b-0 last:pb-0';

      // Create label
      const labelElement = document.createElement('dt');
      labelElement.textContent = fieldConfig.label;
      labelElement.className = 'text-sm font-medium text-gray-500 mb-1';

      // Create value with formatting
      const valueElement = document.createElement('dd');
      valueElement.className = 'text-lg font-semibold text-gray-900';

      // Apply formatter if specified
      let formattedValue = fieldValue;
      if (fieldConfig.formatter) {
        formattedValue = formatValue(fieldValue, fieldConfig.formatter);
      }

      // Handle different value types
      if (typeof formattedValue === 'number') {
        valueElement.textContent = formattedValue.toLocaleString();
      } else {
        valueElement.textContent = String(formattedValue || 'N/A');
      }

      // Add special styling for count/number fields
      if (fieldConfig.field === 'count' || typeof fieldValue === 'number') {
        valueElement.classList.add('text-2xl', 'text-blue-600');
      }

      fieldContainer.appendChild(labelElement);
      fieldContainer.appendChild(valueElement);
      recordContainer.appendChild(fieldContainer);
    });

    targetElement.appendChild(recordContainer);
  } catch (error) {
    // Remove loading indicator if still present
    if (loadingElement.parentNode) {
      targetElement.removeChild(loadingElement);
    }

    console.error('Error loading display record data:', error);

    // Show error message
    const errorElement = document.createElement('div');
    errorElement.className = 'bg-red-50 border border-red-200 rounded-lg p-4';
    errorElement.innerHTML = `
      <div class="flex items-center">
        <div class="text-red-600 font-medium">Failed to load data</div>
      </div>
      <div class="text-red-500 text-sm mt-1">${error instanceof Error ? error.message : 'Unknown error occurred'}</div>
    `;
    targetElement.appendChild(errorElement);
  }
}

/**
 * Formats a value according to the specified formatter type.
 *
 * @param value - The raw value to format
 * @param formatter - The formatter type
 * @returns The formatted value
 */
function formatValue(value: any, formatter: string): any {
  if (value == null) return 'N/A';

  switch (formatter.toLowerCase()) {
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      return new Date(value).toLocaleDateString();

    case 'datetime':
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      return new Date(value).toLocaleString();

    case 'time':
      if (value instanceof Date) {
        return value.toLocaleTimeString();
      }
      return new Date(value).toLocaleTimeString();

    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(Number(value));

    case 'percentage':
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(Number(value) / 100);

    case 'uppercase':
      return String(value).toUpperCase();

    case 'lowercase':
      return String(value).toLowerCase();

    case 'capitalize':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();

    default:
      console.warn(`Unknown formatter: ${formatter}`);
      return value;
  }
}

/**
 * Placeholder renderer for actionButton content type.
 * This will be replaced with the actual implementation later.
 *
 * @param content - The actionButton content configuration
 * @param functions - The functions record from the ToolSpec
 * @param targetElement - The HTML element to render into
 */
function renderActionButtonComponent(
  content: ActionButtonContent,
  _functions: Record<string, (params: any) => Promise<any>>,
  targetElement: HTMLElement
): void {


  const placeholder = document.createElement('p');
  placeholder.textContent = 'Action Button Component Placeholder';
  placeholder.className = 'text-gray-600 italic p-4 border border-dashed border-gray-300 rounded';

  targetElement.appendChild(placeholder);
}

/**
 * Creates a label element for an input field
 * @param fieldName - The field name
 * @param inputDef - The input definition
 * @returns The created label element
 */
function createInputLabel(fieldName: string, inputDef: any): HTMLLabelElement {
  const label = document.createElement('label');
  label.textContent = inputDef.label;
  label.className = 'block text-sm font-medium text-gray-700 mb-1';
  label.setAttribute('for', `input-${fieldName}`);
  return label;
}

/**
 * Creates a select element with options
 * @param fieldName - The field name
 * @param inputDef - The input definition
 * @returns Object with the select element and its initial value
 */
function createSelectElement(fieldName: string, inputDef: any): { element: HTMLSelectElement, initialValue: any } {
  const select = document.createElement('select');
  select.id = `input-${fieldName}`;
  select.className =
    'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';

  if (inputDef.options) {
    inputDef.options.forEach((option: any) => {
      const optionElement = document.createElement('option');
      optionElement.value = String(option.value);
      optionElement.textContent = option.label;
      select.appendChild(optionElement);
    });
  }

  const initialValue = inputDef.defaultValue !== undefined
    ? inputDef.defaultValue
    : (inputDef.options ? inputDef.options[0]?.value : '');

  return { element: select, initialValue };
}

/**
 * Creates a regular input element (text, number, etc.)
 * @param fieldName - The field name
 * @param inputDef - The input definition
 * @returns Object with the input element and its initial value
 */
function createRegularInputElement(fieldName: string, inputDef: any): { element: HTMLInputElement, initialValue: any } {
  const input = document.createElement('input');
  input.id = `input-${fieldName}`;
  input.type = inputDef.type === 'text' ? 'text' : inputDef.type === 'number' ? 'number' : 'text';
  input.className =
    'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';

  if (inputDef.placeholder) {
    input.placeholder = inputDef.placeholder;
  }
  if (inputDef.defaultValue !== undefined) {
    input.value = String(inputDef.defaultValue);
  }

  const initialValue = inputDef.defaultValue !== undefined ? inputDef.defaultValue : '';

  return { element: input, initialValue };
}

/**
 * Helper to create an input field for a given field definition.
 * Returns the input element and its initial value.
 */
function createInputField(fieldName: string, inputDef: any): { inputElement: HTMLInputElement | HTMLSelectElement, initialValue: any, fieldContainer: HTMLElement } {
  const fieldContainer = document.createElement('div');

  // Create label
  const label = createInputLabel(fieldName, inputDef);
  fieldContainer.appendChild(label);

  // Create the appropriate input element
  let inputElement: HTMLInputElement | HTMLSelectElement;
  let initialValue: any;

  if (inputDef.type === 'select') {
    const selectResult = createSelectElement(fieldName, inputDef);
    inputElement = selectResult.element;
    initialValue = selectResult.initialValue;
  } else {
    const inputResult = createRegularInputElement(fieldName, inputDef);
    inputElement = inputResult.element;
    initialValue = inputResult.initialValue;
  }

  fieldContainer.appendChild(inputElement);
  return { inputElement, initialValue, fieldContainer };
}

/**
 * Main function to render a tool based on its specification.
 * This is the primary entry point for the Unspec'd framework runtime.
 *
 * @param spec - The ToolSpec object defining the tool to render
 * @param targetElement - The HTML element where the tool should be rendered
 */
export async function renderTool(spec: ToolSpec, targetElement: HTMLElement): Promise<void> {
  // Clear any existing content from the target element
  targetElement.innerHTML = '';

  // Create a container for inputs (if any)
  let inputsContainer: HTMLElement | undefined;
  const inputValues: Record<string, any> = {};

  if (spec.inputs && Object.keys(spec.inputs).length > 0) {
    inputsContainer = document.createElement('div');
    inputsContainer.className = 'bg-white p-4 rounded-lg border border-gray-200 mb-6';

    const inputsTitle = document.createElement('h3');
    inputsTitle.textContent = 'Filters';
    inputsTitle.className = 'text-lg font-semibold text-gray-900 mb-4';
    inputsContainer.appendChild(inputsTitle);

    const inputsGrid = document.createElement('div');
    inputsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

    // Create input fields using the helper
    Object.entries(spec.inputs).forEach(([fieldName, inputDef]) => {
      const { initialValue, fieldContainer } = createInputField(fieldName, inputDef);
      inputValues[fieldName] = initialValue;
      inputsGrid.appendChild(fieldContainer);
    });

    inputsContainer.appendChild(inputsGrid);
    targetElement.appendChild(inputsContainer);
  }

  // Create a container for the content
  const contentContainer = document.createElement('div');
  contentContainer.className = 'space-y-4';
  targetElement.appendChild(contentContainer);

  // Route to the appropriate component renderer based on content type
  switch ((spec.content as any).type) {
    case 'displayRecord':
      await renderDisplayRecordComponent(spec.content as DisplayRecordContent, spec.functions, contentContainer);
      break;

    case 'actionButton':
      renderActionButtonComponent(spec.content as ActionButtonContent, spec.functions, contentContainer);
      break;

    case 'editForm':
      renderSmartFormComponent(spec.content as EditFormContent, spec.functions, contentContainer);
      break;

    case 'editableTable': {
      // Create input change handlers for editable table
      const getInputValues = () => {
        const currentValues: Record<string, any> = {};
        if (spec.inputs) {
          Object.keys(spec.inputs).forEach((fieldName) => {
            const inputElement = document.getElementById(`input-${fieldName}`) as HTMLInputElement | HTMLSelectElement;
            if (inputElement) {
              currentValues[fieldName] = inputElement.value;
            }
          });
        }
        return currentValues;
      };

      // Create the table component first
      const tableComponentRef = { refreshData: () => {} };

      renderSmartTableComponent(
        spec.content as EditableTableContent,
        spec.functions,
        contentContainer,
        getInputValues,
        (refresh) => {
          tableComponentRef.refreshData = refresh;
        }
      );

      // Add change event listeners to inputs to refresh the table
      if (spec.inputs) {
        Object.keys(spec.inputs).forEach((fieldName) => {
          const inputElement = document.getElementById(`input-${fieldName}`) as HTMLInputElement | HTMLSelectElement;
          if (inputElement) {
            inputElement.addEventListener('change', () => {
              console.log(`Filter changed: ${fieldName} = ${inputElement.value}`);
              tableComponentRef.refreshData();
            });

            // Also listen for input events on text fields for real-time filtering
            if (inputElement.tagName === 'INPUT') {
              inputElement.addEventListener('input', () => {
                // Debounce the input for text fields
                clearTimeout((inputElement as any).debounceTimer);
                (inputElement as any).debounceTimer = setTimeout(() => {
                  console.log(`Filter changed (debounced): ${fieldName} = ${inputElement.value}`);
                  tableComponentRef.refreshData();
                }, 300);
              });
            }
          }
        });
      }
      break;
    }

    case 'streamingTable':
      await renderStreamingTableComponent(
        spec.content as any, // Type assertion for new content type
        spec.functions,
        contentContainer
      );
      break;

    default: {
      // Handle unknown content types gracefully
      console.warn('Unknown content type:', (spec.content as any).type);
      const errorElement = document.createElement('p');
      errorElement.textContent = `Unknown content type: ${(spec.content as any).type}`;
      errorElement.className = 'text-red-600 font-medium p-4 bg-red-50 border border-red-200 rounded';
      contentContainer.appendChild(errorElement);
    }
  }
}
