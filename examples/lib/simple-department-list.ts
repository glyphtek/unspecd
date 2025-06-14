/**
 * A simple example tool demonstrating an editable table for managing company departments.
 * 
 * This tool provides:
 * - A clean, editable table interface
 * - Inline editing capabilities
 * - Row-level actions (edit/delete)
 * - Pagination and sorting
 * 
 * This is a great starting point for understanding the basic editable table pattern.
 */

// When using the published package, you would import like this:
// import type { ToolSpec } from '@glyphtek/unspecd';

// For this example, we use relative paths since we're in the source:
import type { ToolSpec } from '../../src/lib/dsl-schema.js';

/**
 * Interface for department data structure
 */
interface Department {
  id: string;
  name: string;
  head: string;
  teamSize: number;
}

/**
 * Complete tool specification for the Company Departments list.
 * This tool displays a simple, read-only table of company departments.
 */
export const departmentListTool: ToolSpec = {
  id: 'department-list',
  title: 'Company Departments',
  
  // No inputs needed - this is a simple display tool
  
  // EditableTable content configuration (used in read-only mode)
  content: {
    type: 'editableTable',
    
    // Data loading configuration
    dataLoader: {
      functionName: 'getDepartments'
    },
    
    // Minimal table configuration
    tableConfig: {
      // Unique identifier for each row
      rowIdentifier: 'id',
      
      // Simple column definitions
      columns: [
        {
          field: 'name',
          label: 'Department Name',
          isSortable: true
        },
        {
          field: 'head',
          label: 'Department Head',
          isSortable: true
        },
        {
          field: 'teamSize',
          label: 'Team Size',
          isSortable: true
        }
      ]
      
      // Note: No editing features enabled (no itemUpdater, no rowActions)
      // This makes it a simple, read-only table
    }
  },
  
  // Mock function implementations
  functions: {
    /**
     * Loads the list of company departments.
     * In a real application, this would fetch from an API or database.
     * 
     * @param params - Query parameters (page, pageSize, sorting, etc.)
     * @returns Promise resolving to paginated department data
     */
    getDepartments: async (params: any): Promise<{ items: Department[]; totalItems: number }> => {
      console.log('Loading departments list...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Hardcoded department data
      const departments: Department[] = [
        {
          id: 'eng',
          name: 'Engineering',
          head: 'Sarah Chen',
          teamSize: 24
        },
        {
          id: 'design',
          name: 'Design',
          head: 'Marcus Rodriguez',
          teamSize: 8
        },
        {
          id: 'product',
          name: 'Product Management',
          head: 'Emily Watson',
          teamSize: 6
        },
        {
          id: 'marketing',
          name: 'Marketing',
          head: 'David Kim',
          teamSize: 12
        },
        {
          id: 'sales',
          name: 'Sales',
          head: 'Jennifer Lopez',
          teamSize: 15
        },
        {
          id: 'hr',
          name: 'Human Resources',
          head: 'Michael Brown',
          teamSize: 4
        },
        {
          id: 'finance',
          name: 'Finance',
          head: 'Lisa Anderson',
          teamSize: 7
        },
        {
          id: 'legal',
          name: 'Legal',
          head: 'Robert Taylor',
          teamSize: 3
        },
        {
          id: 'ops',
          name: 'Operations',
          head: 'Amanda Wilson',
          teamSize: 10
        },
        {
          id: 'security',
          name: 'Security',
          head: 'James Miller',
          teamSize: 5
        }
      ];
      
      console.log(`✅ Loaded ${departments.length} departments`);
      
      // Return data in the expected format for editableTable
      return {
        items: departments,
        totalItems: departments.length
      };
    }
  }
}; 