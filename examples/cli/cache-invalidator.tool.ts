/**
 * Example CLI Tool: Cache Invalidator
 * 
 * This tool demonstrates the CLI discovery pattern with actionButton content type.
 * Provides a simple button to clear system caches.
 */

// When using the published package, you would import like this:
// import type { ToolSpec } from '@glyphtek/unspecd';

// For this example, we use relative paths since we're in the source:
import type { ToolSpec } from '../../src/lib/dsl-schema.js';

const cacheInvalidatorTool: ToolSpec = {
  id: 'cache-invalidator',
  title: 'Cache Invalidator',
  content: {
    type: 'actionButton',
    description: 'Clear all system caches to improve performance and resolve cache-related issues.',
    buttonConfig: {
      label: 'Clear All Caches',
      needsConfirmation: true
    },
    action: {
      functionName: 'clearCaches',
      onSuccess: {
        message: 'All caches have been cleared successfully!'
      }
    }
  },
  functions: {
    clearCaches: async (params: any) => {
      // Mock cache clearing operation
      console.log('Clearing caches...');
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Cache clearing completed',
        details: {
          redisCache: 'cleared',
          memoryCache: 'cleared',
          diskCache: 'cleared',
          dbQueryCache: 'cleared'
        }
      };
    }
  }
};

export default cacheInvalidatorTool; 