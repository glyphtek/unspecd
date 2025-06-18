/**
 * Action Button Component for Unspec'd Framework
 *
 * This component renders an interactive button that executes developer-defined
 * actions when clicked. It handles confirmation dialogs, loading states, and
 * provides user feedback for action results.
 */

import { invokeDataSource } from '../data-handler.js';
import type { ActionButtonContent } from '../dsl-schema.js';

/**
 * Renders an action button component that executes a specified function when clicked.
 * This component handles the complete user interaction flow from click to completion,
 * including optional confirmation dialogs and comprehensive state management.
 *
 * @param content - The ActionButtonContent configuration specifying button behavior
 * @param specFunctions - Record of functions available from the ToolSpec
 * @param targetElement - The HTML element where the component should be rendered
 *
 * @example
 * ```typescript
 * const content: ActionButtonContent = {
 *   type: 'actionButton',
 *   description: 'Clear all cached data from the system',
 *   buttonConfig: {
 *     label: 'Clear Cache',
 *     needsConfirmation: true
 *   },
 *   action: {
 *     functionName: 'clearCache',
 *     onSuccess: {
 *       message: 'Cache cleared successfully!'
 *     }
 *   }
 * };
 *
 * renderActionButtonComponent(content, spec.functions, containerElement);
 * ```
 */
export function renderActionButtonComponent(
  content: ActionButtonContent,
  specFunctions: Record<string, (params: any) => Promise<any>>,
  targetElement: HTMLElement
): void {
  // Clear the target element
  targetElement.innerHTML = '';

  // Create container for the component
  const container = document.createElement('div');
  container.className = 'space-y-4';

  // Render description if provided
  if (content.description) {
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = content.description;
    descriptionElement.className = 'text-gray-700 leading-relaxed';
    container.appendChild(descriptionElement);
  }

  // Create the action button
  const button = document.createElement('button');
  button.textContent = content.buttonConfig.label;
  button.className =
    'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  // Store original button label for state restoration
  const originalLabel = content.buttonConfig.label;

  // Add click event listener
  button.addEventListener('click', async () => {
    // Handle confirmation if required
    if (content.buttonConfig.needsConfirmation) {
      const confirmMessage = `Are you sure you want to ${originalLabel.toLowerCase()}?`;
      const confirmed = window.confirm(confirmMessage);

      if (!confirmed) {
        return; // User cancelled the action
      }
    }

    // Execute the action using invokeDataSource
    await invokeDataSource({
      specFunctions,
      functionName: content.action.functionName,
      params: {}, // TODO: In future versions, this could include input parameters

      onPending: () => {
        // Provide immediate feedback - disable button and change text
        button.disabled = true;
        button.textContent = 'Executing...';
      },

      onFulfilled: (_data: any) => {
        // Re-enable button and restore original label
        button.disabled = false;
        button.textContent = originalLabel;

        // Display success message if configured
        if (content.action.onSuccess?.message) {
          window.alert(content.action.onSuccess.message);
        } else {
          // Default success message
          window.alert('Action completed successfully!');
        }
      },

      onRejected: (error: Error) => {
        // Re-enable button and restore original label
        button.disabled = false;
        button.textContent = originalLabel;

        // Display error message to user
        window.alert(`Action failed: ${error.message}`);

        console.error('Action Button Component Error:', error);
      },
    });
  });

  // Add button to container
  container.appendChild(button);

  // Add container to target element
  targetElement.appendChild(container);
}
