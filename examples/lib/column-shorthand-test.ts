import { ToolSpec } from '../../src/lib/dsl-schema.js';

// Example data for testing
const sampleEmployees = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', salary: 95000, startDate: '2022-03-15' },
  { id: 2, name: 'Bob Smith', department: 'Marketing', salary: 72000, startDate: '2021-11-20' },
  { id: 3, name: 'Carol Davis', department: 'Sales', salary: 68000, startDate: '2023-01-10' },
  { id: 4, name: 'David Wilson', department: 'Engineering', salary: 102000, startDate: '2020-08-05' },
  { id: 5, name: 'Emma Brown', department: 'HR', salary: 78000, startDate: '2022-06-12' }
];

/**
 * Test spec demonstrating both traditional column config and new shorthand syntax
 */
export const spec: ToolSpec = {
  id: 'column-shorthand-test',
  title: 'Column Shorthand Syntax Test',

  content: {
    type: 'editableTable',
    dataLoader: {
      functionName: 'getEmployees'
    },
    tableConfig: {
      rowIdentifier: 'id',
      
      // NEW SHORTHAND SYNTAX: Simple array of strings
      // This will automatically create columns with capitalized labels
      columns: ['name', 'department', 'salary', 'startDate'],
      
      // TRADITIONAL SYNTAX (commented out):
      // columns: [
      //   { field: 'name', label: 'Name' },
      //   { field: 'department', label: 'Department' },
      //   { field: 'salary', label: 'Salary' },
      //   { field: 'startDate', label: 'Start Date' }
      // ],
      
      pagination: {
        defaultPageSize: 10
      }
    }
  },

  functions: {
    getEmployees: async (params: { page: number, pageSize: number }) => {
      console.log('📊 Loading employees page:', params.page);
      
      // Simulate pagination
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const pageItems = sampleEmployees.slice(startIndex, endIndex);
      
      return {
        items: pageItems,
        totalItems: sampleEmployees.length
      };
    }
  }
}; 