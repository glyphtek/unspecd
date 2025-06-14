/**
 * Unit tests for data handler functionality
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { invokeDataSource } from '../../src/lib/data-handler.js';

describe('Data Handler Functionality', () => {
  let mockFunctions: Record<string, (params: any) => Promise<any>>;
  let callbackStates: {
    pending: boolean;
    fulfilled: boolean;
    rejected: boolean;
    data: any;
    error: Error | null;
  };

  beforeEach(() => {
    callbackStates = {
      pending: false,
      fulfilled: false,
      rejected: false,
      data: null,
      error: null
    };

    mockFunctions = {
      successFunction: async (params: any) => {
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
        return { success: true, params };
      },
      
      errorFunction: async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('Test error message');
      },
      
      immediateFunction: async () => {
        return { immediate: true };
      },
      
      withDataFunction: async (params: any) => {
        return {
          id: params?.id || 1,
          name: params?.name || 'Test',
          items: [1, 2, 3],
          metadata: { count: 3 }
        };
      }
    };
  });

  describe('Successful Data Invocation', () => {
    test('should call onPending then onFulfilled for successful function', async () => {
      await invokeDataSource({
        specFunctions: mockFunctions,
        functionName: 'successFunction',
        params: { test: 'value' },
        
        onPending: () => {
          callbackStates.pending = true;
        },
        
        onFulfilled: (data: any) => {
          callbackStates.fulfilled = true;
          callbackStates.data = data;
        },
        
        onRejected: (error: Error) => {
          callbackStates.rejected = true;
          callbackStates.error = error;
        }
      });

      expect(callbackStates.pending).toBe(true);
      expect(callbackStates.fulfilled).toBe(true);
      expect(callbackStates.rejected).toBe(false);
      expect(callbackStates.data).toEqual({
        success: true,
        params: { test: 'value' }
      });
    });

    test('should pass parameters correctly to the function', async () => {
      const testParams = { id: 42, name: 'Test User' };

      await invokeDataSource({
        specFunctions: mockFunctions,
        functionName: 'withDataFunction',
        params: testParams,
        
        onPending: () => {},
        
        onFulfilled: (data: any) => {
          callbackStates.data = data;
        },
        
        onRejected: () => {}
      });

      expect(callbackStates.data.id).toBe(42);
      expect(callbackStates.data.name).toBe('Test User');
    });

    test('should handle immediate resolution', async () => {
      await invokeDataSource({
        specFunctions: mockFunctions,
        functionName: 'immediateFunction',
        params: {},
        
        onPending: () => {
          callbackStates.pending = true;
        },
        
        onFulfilled: (data: any) => {
          callbackStates.fulfilled = true;
          callbackStates.data = data;
        },
        
        onRejected: () => {}
      });

      expect(callbackStates.pending).toBe(true);
      expect(callbackStates.fulfilled).toBe(true);
      expect(callbackStates.data).toEqual({ immediate: true });
    });
  });

  describe('Error Handling', () => {
    test('should call onPending then onRejected for failing function', async () => {
      await invokeDataSource({
        specFunctions: mockFunctions,
        functionName: 'errorFunction',
        params: {},
        
        onPending: () => {
          callbackStates.pending = true;
        },
        
        onFulfilled: (data: any) => {
          callbackStates.fulfilled = true;
          callbackStates.data = data;
        },
        
        onRejected: (error: Error) => {
          callbackStates.rejected = true;
          callbackStates.error = error;
        }
      });

      expect(callbackStates.pending).toBe(true);
      expect(callbackStates.fulfilled).toBe(false);
      expect(callbackStates.rejected).toBe(true);
      expect(callbackStates.error?.message).toBe('Test error message');
    });

    test('should handle missing function gracefully', async () => {
      await invokeDataSource({
        specFunctions: mockFunctions,
        functionName: 'nonExistentFunction',
        params: {},
        
        onPending: () => {
          callbackStates.pending = true;
        },
        
        onFulfilled: () => {
          callbackStates.fulfilled = true;
        },
        
        onRejected: (error: Error) => {
          callbackStates.rejected = true;
          callbackStates.error = error;
        }
      });

      expect(callbackStates.pending).toBe(true);
      expect(callbackStates.rejected).toBe(true);
      expect(callbackStates.error?.message).toContain('nonExistentFunction');
    });

    test('should handle non-function values gracefully', async () => {
      const invalidFunctions = {
        notAFunction: 'this is a string, not a function'
      };

      await invokeDataSource({
        specFunctions: invalidFunctions as any,
        functionName: 'notAFunction',
        params: {},
        
        onPending: () => {
          callbackStates.pending = true;
        },
        
        onFulfilled: () => {
          callbackStates.fulfilled = true;
        },
        
        onRejected: (error: Error) => {
          callbackStates.rejected = true;
          callbackStates.error = error;
        }
      });

      expect(callbackStates.rejected).toBe(true);
      expect(callbackStates.error?.message).toContain('notAFunction');
    });
  });

  describe('Parameter Handling', () => {
    test('should handle empty parameters', async () => {
      await invokeDataSource({
        specFunctions: mockFunctions,
        functionName: 'withDataFunction',
        params: {},
        
        onPending: () => {},
        onFulfilled: (data: any) => {
          callbackStates.data = data;
        },
        onRejected: () => {}
      });

      expect(callbackStates.data.id).toBe(1); // Default value
      expect(callbackStates.data.name).toBe('Test'); // Default value
    });

    test('should handle null parameters', async () => {
      await invokeDataSource({
        specFunctions: mockFunctions,
        functionName: 'withDataFunction',
        params: null,
        
        onPending: () => {},
        onFulfilled: (data: any) => {
          callbackStates.data = data;
        },
        onRejected: () => {}
      });

      expect(callbackStates.data).toBeTruthy();
      expect(callbackStates.data.id).toBe(1); // Default value
    });

    test('should handle complex parameter objects', async () => {
      const complexParams = {
        id: 100,
        name: 'Complex User',
        metadata: {
          role: 'admin',
          permissions: ['read', 'write'],
          settings: {
            theme: 'dark',
            notifications: true
          }
        },
        tags: ['important', 'priority']
      };

      await invokeDataSource({
        specFunctions: {
          complexFunction: async (params: any) => {
            return { received: params };
          }
        },
        functionName: 'complexFunction',
        params: complexParams,
        
        onPending: () => {},
        onFulfilled: (data: any) => {
          callbackStates.data = data;
        },
        onRejected: () => {}
      });

      expect(callbackStates.data.received).toEqual(complexParams);
    });
  });

  describe('Callback Execution Order', () => {
    test('should always call onPending first', async () => {
      const executionOrder: string[] = [];

      await invokeDataSource({
        specFunctions: mockFunctions,
        functionName: 'successFunction',
        params: {},
        
        onPending: () => {
          executionOrder.push('pending');
        },
        
        onFulfilled: () => {
          executionOrder.push('fulfilled');
        },
        
        onRejected: () => {
          executionOrder.push('rejected');
        }
      });

      expect(executionOrder).toEqual(['pending', 'fulfilled']);
    });

    test('should call onPending before onRejected for errors', async () => {
      const executionOrder: string[] = [];

      await invokeDataSource({
        specFunctions: mockFunctions,
        functionName: 'errorFunction',
        params: {},
        
        onPending: () => {
          executionOrder.push('pending');
        },
        
        onFulfilled: () => {
          executionOrder.push('fulfilled');
        },
        
        onRejected: () => {
          executionOrder.push('rejected');
        }
      });

      expect(executionOrder).toEqual(['pending', 'rejected']);
    });
  });

  describe('Async Function Support', () => {
    test('should handle async functions that return promises', async () => {
      const asyncFunctions = {
        asyncFunction: async (params: any) => {
          // Simulate async work
          await new Promise(resolve => setTimeout(resolve, 20));
          return { async: true, timestamp: Date.now() };
        }
      };

      const startTime = Date.now();

      await invokeDataSource({
        specFunctions: asyncFunctions,
        functionName: 'asyncFunction',
        params: {},
        
        onPending: () => {},
        onFulfilled: (data: any) => {
          callbackStates.data = data;
        },
        onRejected: () => {}
      });

      const endTime = Date.now();

      expect(callbackStates.data.async).toBe(true);
      expect(endTime - startTime).toBeGreaterThanOrEqual(15); // Should take at least 15ms
    });

    test('should handle functions that return non-promises', async () => {
      const syncFunctions = {
        syncFunction: async (params: any) => {
          return { sync: true, params };
        }
      };

      await invokeDataSource({
        specFunctions: syncFunctions,
        functionName: 'syncFunction',
        params: { test: 'sync' },
        
        onPending: () => {},
        onFulfilled: (data: any) => {
          callbackStates.data = data;
        },
        onRejected: () => {}
      });

      expect(callbackStates.data.sync).toBe(true);
      expect(callbackStates.data.params.test).toBe('sync');
    });
  });

  describe('Edge Cases', () => {
    test('should handle functions that return undefined', async () => {
      const undefinedFunctions = {
        undefinedFunction: async () => {
          return undefined;
        }
      };

      await invokeDataSource({
        specFunctions: undefinedFunctions,
        functionName: 'undefinedFunction',
        params: {},
        
        onPending: () => {},
        onFulfilled: (data: any) => {
          callbackStates.data = data;
        },
        onRejected: () => {}
      });

      expect(callbackStates.data).toBeUndefined();
    });

    test('should handle functions that return null', async () => {
      const nullFunctions = {
        nullFunction: async () => {
          return null;
        }
      };

      await invokeDataSource({
        specFunctions: nullFunctions,
        functionName: 'nullFunction',
        params: {},
        
        onPending: () => {},
        onFulfilled: (data: any) => {
          callbackStates.data = data;
        },
        onRejected: () => {}
      });

      expect(callbackStates.data).toBeNull();
    });

    test('should handle empty specFunctions object', async () => {
      await invokeDataSource({
        specFunctions: {},
        functionName: 'anyFunction',
        params: {},
        
        onPending: () => {},
        onFulfilled: () => {},
        onRejected: (error: Error) => {
          callbackStates.error = error;
        }
      });

      expect(callbackStates.error?.message).toContain('anyFunction');
    });
  });
}); 