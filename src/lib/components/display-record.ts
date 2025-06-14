/**
 * Display Record Component for Unspec'd Framework
 *
 * This component renders structured data as key-value pairs based on the
 * DisplayRecordContent configuration. It handles data fetching, loading states,
 * and error scenarios while providing a clean, styled interface.
 */

import { invokeDataSource } from '../data-handler.js';
import type { DisplayRecordContent } from '../dsl-schema.js';

/**
 * Renders a display record component that fetches and displays structured data
 * as a formatted key-value list. This component handles the complete lifecycle
 * from loading to data display or error handling.
 *
 * @param content - The DisplayRecordContent configuration specifying data source and display fields
 * @param specFunctions - Record of functions available from the ToolSpec
 * @param targetElement - The HTML element where the component should be rendered
 *
 * @example
 * ```typescript
 * const content: DisplayRecordContent = {
 *   type: 'displayRecord',
 *   dataLoader: { functionName: 'getUserProfile' },
 *   displayConfig: {
 *     fields: [
 *       { field: 'name', label: 'Full Name' },
 *       { field: 'email', label: 'Email Address', formatter: 'lowercase' }
 *     ]
 *   }
 * };
 *
 * renderDisplayRecordComponent(content, spec.functions, containerElement);
 * ```
 */
export function renderDisplayRecordComponent(
  content: DisplayRecordContent,
  specFunctions: Record<string, (params: any) => Promise<any>>,
  targetElement: HTMLElement
): void {
  // Immediately render loading state
  targetElement.innerHTML = '<p class="text-gray-500 animate-pulse">Loading...</p>';

  // Fetch data using the invokeDataSource utility
  invokeDataSource({
    specFunctions,
    functionName: content.dataLoader.functionName,
    params: {}, // TODO: In future versions, this could include input parameters

    onPending: () => {
      // Loading state is already set above, but we could add additional loading UI here
      console.log(`Fetching data using function: ${content.dataLoader.functionName}`);
    },

    onFulfilled: (data: any) => {
      // Clear the target element
      targetElement.innerHTML = '';

      // Handle null or undefined data
      if (data == null) {
        const noDataElement = document.createElement('p');
        noDataElement.textContent = 'No data found.';
        noDataElement.className = 'text-gray-500 italic p-4 bg-gray-50 border border-gray-200 rounded';
        targetElement.appendChild(noDataElement);
        return;
      }

      // Create container for the data display
      const dataContainer = document.createElement('div');
      dataContainer.className = 'space-y-3 bg-white border border-gray-200 rounded-lg p-4';

      // Iterate through the configured fields and render each one
      content.displayConfig.fields.forEach((fieldConfig) => {
        const fieldContainer = document.createElement('div');
        fieldContainer.className =
          'flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 py-2 border-b border-gray-100 last:border-b-0';

        // Create label element
        const labelElement = document.createElement('strong');
        labelElement.textContent = `${fieldConfig.label}:`;
        labelElement.className = 'font-semibold text-gray-700 min-w-0 sm:min-w-[120px] flex-shrink-0';

        // Create value element
        const valueElement = document.createElement('span');
        let displayValue = data[fieldConfig.field];

        // Apply formatter if specified
        if (fieldConfig.formatter && displayValue != null) {
          displayValue = applyFormatter(displayValue, fieldConfig.formatter);
        }

        // Handle null/undefined values
        if (displayValue == null) {
          valueElement.textContent = '—';
          valueElement.className = 'text-gray-400 italic flex-1';
        } else {
          valueElement.textContent = String(displayValue);
          valueElement.className = 'text-gray-900 flex-1 break-words';
        }

        // Append label and value to field container
        fieldContainer.appendChild(labelElement);
        fieldContainer.appendChild(valueElement);

        // Add field container to data container
        dataContainer.appendChild(fieldContainer);
      });

      // Append the data container to target element
      targetElement.appendChild(dataContainer);
    },

    onRejected: (error: Error) => {
      // Clear the target element
      targetElement.innerHTML = '';

      // Create error container
      const errorContainer = document.createElement('div');
      errorContainer.className = 'text-red-600 p-4 border border-red-300 rounded-lg bg-red-50';

      // Create error title
      const errorTitle = document.createElement('strong');
      errorTitle.textContent = 'Error:';
      errorTitle.className = 'block font-semibold mb-2';

      // Create error message
      const errorMessage = document.createElement('p');
      errorMessage.textContent = error.message;
      errorMessage.className = 'text-sm';

      // Append elements to error container
      errorContainer.appendChild(errorTitle);
      errorContainer.appendChild(errorMessage);

      // Append error container to target element
      targetElement.appendChild(errorContainer);

      // Log error for debugging
      console.error('Display Record Component Error:', error);
    },
  });
}

/**
 * Applies basic formatting to field values based on the formatter string.
 * This is a simple implementation that can be extended with more formatters.
 *
 * @param value - The value to format
 * @param formatter - The formatter type to apply
 * @returns The formatted value
 */
function applyFormatter(value: any, formatter: string): any {
  if (value == null) return value;

  const stringValue = String(value);

  switch (formatter.toLowerCase()) {
    case 'uppercase':
      return stringValue.toUpperCase();

    case 'lowercase':
      return stringValue.toLowerCase();

    case 'capitalize':
      return stringValue.charAt(0).toUpperCase() + stringValue.slice(1).toLowerCase();

    case 'date':
      // Basic date formatting - in a real implementation, you might use a date library
      try {
        const date = new Date(value);
        return date.toLocaleDateString();
      } catch {
        return stringValue;
      }

    case 'currency':
      // Basic currency formatting
      try {
        const number = Number.parseFloat(value);
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(number);
      } catch {
        return stringValue;
      }

    default:
      // Unknown formatter - return original value
      console.warn(`Unknown formatter: ${formatter}`);
      return value;
  }
}
