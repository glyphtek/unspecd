/**
 * Data Handler Utilities for Unspec'd Framework
 *
 * This file contains utilities for safely invoking developer-provided functions
 * from ToolSpec objects, managing promise lifecycles, and handling errors gracefully.
 * This decouples data-calling logic from component rendering logic.
 */

/**
 * Parameters for the invokeDataSource function.
 */
export interface InvokeDataSourceParams {
  /** The functions object from the ToolSpec containing available functions */
  specFunctions: Record<string, (params: any) => Promise<any>>;

  /** The name of the function to execute from the specFunctions record */
  functionName: string;

  /** Parameters to pass to the target function */
  params: any;

  /** Callback function called immediately before the operation starts */
  onPending: () => void;

  /** Callback function called with the result upon successful resolution */
  onFulfilled: (result: any) => void;

  /** Callback function called with the error if the promise rejects or execution fails */
  onRejected: (error: Error) => void;
}

/**
 * Safely invokes a developer-provided function by name and manages the promise lifecycle
 * using callbacks. This function provides a consistent interface for executing async
 * operations defined in ToolSpec objects while handling errors gracefully.
 *
 * The function follows this execution flow:
 * 1. Calls onPending() to signal the start of the operation
 * 2. Validates that the requested function exists in specFunctions
 * 3. Executes the function with the provided parameters
 * 4. Calls onFulfilled() with the result on success
 * 5. Calls onRejected() with an error on any failure
 *
 * @param params - Configuration object containing function reference, parameters, and callbacks
 *
 * @example
 * ```typescript
 * await invokeDataSource({
 *   specFunctions: myToolSpec.functions,
 *   functionName: 'getUserProfile',
 *   params: { userId: '123' },
 *   onPending: () => console.log('Loading user profile...'),
 *   onFulfilled: (user) => console.log('User loaded:', user),
 *   onRejected: (error) => console.error('Failed to load user:', error)
 * });
 * ```
 */
export async function invokeDataSource({
  specFunctions,
  functionName,
  params,
  onPending,
  onFulfilled,
  onRejected,
}: InvokeDataSourceParams): Promise<void> {
  // Signal the start of the operation
  onPending();

  try {
    // Validate that the requested function exists in the spec
    if (!specFunctions || typeof specFunctions !== 'object') {
      throw new Error('Invalid specFunctions: expected an object containing function implementations');
    }

    if (!functionName || typeof functionName !== 'string') {
      throw new Error('Invalid functionName: expected a non-empty string');
    }

    const targetFunction = specFunctions[functionName];

    if (!targetFunction) {
      throw new Error(
        `Function '${functionName}' not found in spec. Available functions: ${Object.keys(specFunctions).join(', ')}`
      );
    }

    if (typeof targetFunction !== 'function') {
      throw new Error(`'${functionName}' exists in spec but is not a function. Got: ${typeof targetFunction}`);
    }

    // Execute the developer's function with provided parameters
    const result = await targetFunction(params);

    // Call the success callback with the result
    onFulfilled(result);
  } catch (error) {
    // Handle any errors that occurred during validation or execution
    let processedError: Error;

    if (error instanceof Error) {
      processedError = error;
    } else {
      // Convert non-Error objects to proper Error instances
      processedError = new Error(`Function '${functionName}' failed with: ${String(error)}`);
    }

    // Call the error callback with the processed error
    onRejected(processedError);
  }
}
