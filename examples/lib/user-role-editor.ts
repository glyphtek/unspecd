/**
 * User Role Editor Tool - Complete Example for Unspec'd Framework
 * 
 * This example demonstrates the SmartForm component with:
 * - Initial data loading via dataLoader
 * - Dynamic options loading for select fields
 * - Various field types (text, email, select)
 * - Read-only and editable fields
 * - Form submission handling
 */

// When using the published package, you would import like this:
// import type { ToolSpec } from '@glyphtek/unspecd';

// For this example, we use relative paths since we're in the source:
import type { ToolSpec } from '../../src/lib/dsl-schema.js';

/**
 * Complete tool specification for the User Role Editor.
 * This tool allows editing user information and role assignments.
 */
export const userRoleEditorTool: ToolSpec = {
  id: 'user-role-editor',
  title: 'User Role Editor',
  
  // Input parameter to specify which user to edit
  inputs: {
    userId: {
      label: 'User ID',
      type: 'text',
      placeholder: 'Enter user ID to edit',
      required: true,
      defaultValue: 'user-123'
    }
  },
  
  // SmartForm content configuration
  content: {
    type: 'editForm',
    
    // Load initial user data
    dataLoader: {
      functionName: 'getUserData'
    },
    
    // Form field configuration
    formConfig: {
      fields: [
        {
          field: 'email',
          label: 'Email Address',
          editorType: 'email',
          isReadOnly: true,
          helpText: 'Email cannot be changed after account creation'
        },
        {
          field: 'fullName',
          label: 'Full Name',
          editorType: 'text',
          required: true,
          placeholder: 'Enter full name',
          helpText: 'First and last name of the user'
        },
        {
          field: 'department',
          label: 'Department',
          editorType: 'select',
          required: true,
          // Static options for department
          options: [
            { value: 'engineering', label: 'Engineering' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'sales', label: 'Sales' },
            { value: 'hr', label: 'Human Resources' },
            { value: 'finance', label: 'Finance' }
          ]
        },
        {
          field: 'primaryRole',
          label: 'Primary Role',
          editorType: 'select',
          required: true,
          // Dynamic options loaded from server
          editorOptions: {
            optionsLoader: {
              functionName: 'getAvailableRoles',
              params: { type: 'primary' }
            }
          },
          helpText: 'The main role that defines user permissions'
        },
        {
          field: 'secondaryRole',
          label: 'Secondary Role',
          editorType: 'select',
          required: false,
          // Dynamic options loaded from server
          editorOptions: {
            optionsLoader: {
              functionName: 'getAvailableRoles',
              params: { type: 'secondary' }
            }
          },
          helpText: 'Optional additional role for cross-functional access'
        },
        {
          field: 'isActive',
          label: 'Account Status',
          editorType: 'checkbox',
          helpText: 'Whether this user account is currently active'
        },
        {
          field: 'accessLevel',
          label: 'Access Level',
          editorType: 'radio',
          required: true,
          options: [
            { value: 'basic', label: 'Basic Access' },
            { value: 'standard', label: 'Standard Access' },
            { value: 'elevated', label: 'Elevated Access' },
            { value: 'admin', label: 'Administrator Access' }
          ],
          helpText: 'Level of system access for this user'
        },
        {
          field: 'notes',
          label: 'Administrative Notes',
          editorType: 'textarea',
          placeholder: 'Add any notes about this user account...',
          helpText: 'Internal notes visible only to administrators'
        }
      ],
      
      // Submit button configuration
      submitButton: {
        label: 'Update User',
        needsConfirmation: true,
        confirmationMessage: 'Are you sure you want to update this user\'s information and roles?'
      }
    },
    
    // Form submission handler
    onSubmit: {
      functionName: 'updateUser',
      onSuccess: {
        message: 'User information updated successfully!',
        redirect: false
      }
    }
  },
  
  // Mock function implementations
  functions: {
    /**
     * Loads user data for the specified user ID.
     * In a real application, this would fetch from an API or database.
     */
    getUserData: async (params: any): Promise<object | null> => {
      console.log('Loading user data for userId:', params.userId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      return {
        email: 'john.doe@company.com',
        fullName: 'John Doe',
        department: 'engineering',
        primaryRole: 'senior-developer',
        secondaryRole: 'team-lead',
        isActive: true,
        accessLevel: 'elevated',
        notes: 'Senior team member with expertise in TypeScript and React. Leads the frontend architecture initiatives.'
      };
    },
    
    /**
     * Loads available roles based on the role type.
     * Demonstrates dynamic options loading with parameters.
     */
    getAvailableRoles: async (params: any): Promise<Array<{ value: string; label: string }>> => {
      console.log('Loading available roles for type:', params.type);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return different role sets based on type parameter
      if (params.type === 'primary') {
        return [
          { value: 'junior-developer', label: 'Junior Developer' },
          { value: 'senior-developer', label: 'Senior Developer' },
          { value: 'team-lead', label: 'Team Lead' },
          { value: 'engineering-manager', label: 'Engineering Manager' },
          { value: 'product-manager', label: 'Product Manager' },
          { value: 'designer', label: 'UI/UX Designer' },
          { value: 'qa-engineer', label: 'QA Engineer' },
          { value: 'devops-engineer', label: 'DevOps Engineer' }
        ];
      } else if (params.type === 'secondary') {
        return [
          { value: 'mentor', label: 'Technical Mentor' },
          { value: 'interviewer', label: 'Technical Interviewer' },
          { value: 'security-champion', label: 'Security Champion' },
          { value: 'accessibility-expert', label: 'Accessibility Expert' },
          { value: 'code-reviewer', label: 'Senior Code Reviewer' },
          { value: 'architecture-committee', label: 'Architecture Committee Member' }
        ];
      }
      
      return [];
    },
    
    /**
     * Handles form submission and user updates.
     * In a real application, this would send data to an API or database.
     */
    updateUser: async (params: any): Promise<{ success: boolean; message: string }> => {
      console.log('Updating user with form data:', params.formData);
      console.log('Original user data:', params.originalData);
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate potential validation errors
      if (!params.formData.fullName || params.formData.fullName.trim().length < 2) {
        throw new Error('Full name must be at least 2 characters long');
      }
      
      if (!params.formData.primaryRole) {
        throw new Error('Primary role is required');
      }
      
      // Simulate successful update
      console.log('User updated successfully');
      
      return {
        success: true,
        message: `User ${params.formData.fullName} has been updated successfully. Role changes will take effect within 5 minutes.`
      };
    }
  }
}; 