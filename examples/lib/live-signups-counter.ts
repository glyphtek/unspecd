/**
 * Live Sign-ups Counter Tool - Display Record Example for Unspec'd Framework
 * 
 * This example demonstrates the displayRecord content type with:
 * - Simple data loading via dataLoader
 * - Displaying multiple fields with different formatters
 * - Creating a KPI dashboard card for live statistics
 * - No input parameters needed
 */

import type { ToolSpec } from '../../src/lib/dsl-schema.js';

/**
 * Complete tool specification for the Live Sign-ups Counter.
 * This tool displays today's sign-up statistics as a simple KPI dashboard card.
 */
export const liveSignupsCounterTool: ToolSpec = {
  id: 'live-signups-counter',
  title: 'Live Sign-ups Today',
  
  // No inputs needed - this is a simple display tool
  
  // DisplayRecord content configuration
  content: {
    type: 'displayRecord',
    
    // Load today's sign-up data
    dataLoader: {
      functionName: 'getTodaysSignups'
    },
    
    // Configure how to display the loaded data
    displayConfig: {
      fields: [
        {
          field: 'count',
          label: 'New Sign-ups',
          // No formatter needed for plain numbers
        },
        {
          field: 'lastChecked',
          label: 'Last Checked',
          formatter: 'datetime'
        }
      ]
    }
  },
  
  // Mock function implementations
  functions: {
    /**
     * Loads today's sign-up statistics.
     * In a real application, this would fetch from an API, database, or analytics service.
     */
    getTodaysSignups: async (params: any): Promise<object | null> => {
      console.log('Loading today\'s sign-up statistics...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock data with some randomness to simulate live updates
      const baseCount = 89;
      const randomVariation = Math.floor(Math.random() * 20) - 10; // -10 to +10
      const currentCount = Math.max(0, baseCount + randomVariation);
      
      // Mock sign-up data
      return {
        count: currentCount,
        lastChecked: new Date()
      };
    }
  }
}; 