/**
 * Example CLI Tool: User Management
 * 
 * This tool demonstrates the CLI discovery pattern where:
 * - File follows the *.tool.ts naming convention
 * - Exports a default ToolSpec for automatic discovery
 * - Can be discovered by `unspecd dev --cwd examples/cli`
 */

// When using the published package, you would import like this:
// import type { ToolSpec } from '@glyphtek/unspecd';

// For this example, we use relative paths since we're in the source:
import type { ToolSpec } from '../../src/lib/dsl-schema.js';

/**
 * User Management Tool Specification
 * 
 * This tool provides basic user management functionality with:
 * - User listing and search
 * - Role assignment
 * - Account status management
 */
const userManagementTool: ToolSpec = {
  id: 'user-management',
  title: 'User Management',
  content: {
    type: 'editableTable',
    dataLoader: {
      functionName: 'loadUsers'
    },
    tableConfig: {
      rowIdentifier: 'id',
      columns: [
        { field: 'name', label: 'Full Name', isSortable: true },
        { field: 'email', label: 'Email Address', isSortable: true },
        { field: 'role', label: 'Role', isSortable: true, isEditable: true, editorType: 'select', editorOptions: [
          { value: 'Admin', label: 'Administrator' },
          { value: 'Editor', label: 'Editor' },
          { value: 'Viewer', label: 'Viewer' }
        ]},
        { field: 'status', label: 'Status', isSortable: true },
        { field: 'lastLogin', label: 'Last Login', isSortable: true }
      ],
      itemUpdater: {
        functionName: 'updateUser'
      },
      rowActions: [
        {
          id: 'deactivate',
          label: 'Deactivate',
          variant: 'danger',
          needsConfirmation: true,
          confirmationMessage: 'Are you sure you want to deactivate this user?',
          functionName: 'deactivateUser'
        }
      ],
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [5, 10, 25, 50],
        showPageSizeSelector: true
      }
    }
  },
  functions: {
    loadUsers: async (params: any) => {
      // Mock user data
      const users = [
        { id: 1, name: 'Alice Johnson', email: 'alice@company.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-15' },
        { id: 2, name: 'Bob Smith', email: 'bob@company.com', role: 'Editor', status: 'Active', lastLogin: '2024-01-14' },
        { id: 3, name: 'Carol Wilson', email: 'carol@company.com', role: 'Viewer', status: 'Inactive', lastLogin: '2024-01-10' },
        { id: 4, name: 'David Brown', email: 'david@company.com', role: 'Editor', status: 'Active', lastLogin: '2024-01-13' },
        { id: 5, name: 'Eva Davis', email: 'eva@company.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-15' }
      ];
      
      return {
        items: users,
        totalItems: users.length
      };
    },
    
    updateUser: async (params: any) => {
      console.log('Updating user:', params.itemId, 'with changes:', params.changes);
      return { success: true, message: `User ${params.itemId} updated successfully` };
    },
    
    deactivateUser: async (params: any) => {
      console.log('Deactivating user:', params.itemId);
      return { success: true, message: `User ${params.item.name} has been deactivated` };
    }
  }
};

// Export as default for CLI discovery
export default userManagementTool; 