/**
 * Task Management Dashboard - Advanced SmartTable Example for Unspec'd Framework
 * 
 * This example demonstrates the editableTable content type with all advanced features:
 * - Global filtering with multiple input types
 * - Server-side pagination with proper data slicing
 * - Column sorting with multiple sort directions
 * - Inline editing with different field types (text, dropdown, number)
 * - Row actions (delete functionality)
 * - Table actions (global create button)
 * 
 * Key features demonstrated:
 * - Complex data loading with filtering, sorting, and pagination
 * - Real-time updates with itemUpdater
 * - Mixed column types (editable text, sortable fields, dropdown selects)
 * - Action handling with confirmation dialogs
 * - Comprehensive mock data with realistic task management scenarios
 */

import type { ToolSpec } from '../../src/lib/dsl-schema.js';

/**
 * Interface for task data structure
 */
interface Task {
  taskId: string;
  taskName: string;
  assignee: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: number; // 1-5 scale (1 = Low, 5 = Critical)
  createdAt: string;
  dueDate: string;
}

/**
 * Interface for data loading parameters
 */
interface TaskQueryParams {
  // Filtering
  statusFilter?: string;
  assigneeFilter?: string;
  
  // Pagination
  page?: number;
  pageSize?: number;
  
  // Sorting
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Mock task data - comprehensive dataset for testing all features
 */
const MOCK_TASKS: Task[] = [
  {
    taskId: 'TASK-001',
    taskName: 'Implement user authentication system',
    assignee: 'Sarah Chen',
    status: 'In Progress',
    priority: 4,
    createdAt: '2024-01-15T10:00:00Z',
    dueDate: '2024-02-15T17:00:00Z'
  },
  {
    taskId: 'TASK-002',
    taskName: 'Design new landing page layout',
    assignee: 'Marcus Rodriguez',
    status: 'To Do',
    priority: 3,
    createdAt: '2024-01-16T09:30:00Z',
    dueDate: '2024-02-01T17:00:00Z'
  },
  {
    taskId: 'TASK-003',
    taskName: 'Fix critical payment gateway bug',
    assignee: 'David Kim',
    status: 'Done',
    priority: 5,
    createdAt: '2024-01-10T14:15:00Z',
    dueDate: '2024-01-20T17:00:00Z'
  },
  {
    taskId: 'TASK-004',
    taskName: 'Update API documentation',
    assignee: 'Emily Watson',
    status: 'To Do',
    priority: 2,
    createdAt: '2024-01-18T11:00:00Z',
    dueDate: '2024-02-10T17:00:00Z'
  },
  {
    taskId: 'TASK-005',
    taskName: 'Implement real-time notifications',
    assignee: 'Sarah Chen',
    status: 'In Progress',
    priority: 3,
    createdAt: '2024-01-12T16:45:00Z',
    dueDate: '2024-02-05T17:00:00Z'
  },
  {
    taskId: 'TASK-006',
    taskName: 'Optimize database queries',
    assignee: 'James Miller',
    status: 'Done',
    priority: 4,
    createdAt: '2024-01-08T08:30:00Z',
    dueDate: '2024-01-25T17:00:00Z'
  },
  {
    taskId: 'TASK-007',
    taskName: 'Create mobile app wireframes',
    assignee: 'Marcus Rodriguez',
    status: 'In Progress',
    priority: 3,
    createdAt: '2024-01-20T13:20:00Z',
    dueDate: '2024-02-20T17:00:00Z'
  },
  {
    taskId: 'TASK-008',
    taskName: 'Setup CI/CD pipeline',
    assignee: 'David Kim',
    status: 'To Do',
    priority: 4,
    createdAt: '2024-01-22T10:10:00Z',
    dueDate: '2024-02-12T17:00:00Z'
  },
  {
    taskId: 'TASK-009',
    taskName: 'Write unit tests for auth module',
    assignee: 'Jennifer Lopez',
    status: 'Done',
    priority: 3,
    createdAt: '2024-01-05T15:00:00Z',
    dueDate: '2024-01-30T17:00:00Z'
  },
  {
    taskId: 'TASK-010',
    taskName: 'Conduct security audit',
    assignee: 'James Miller',
    status: 'To Do',
    priority: 5,
    createdAt: '2024-01-25T12:00:00Z',
    dueDate: '2024-02-25T17:00:00Z'
  },
  {
    taskId: 'TASK-011',
    taskName: 'Refactor legacy code modules',
    assignee: 'Emily Watson',
    status: 'In Progress',
    priority: 2,
    createdAt: '2024-01-14T09:45:00Z',
    dueDate: '2024-03-01T17:00:00Z'
  },
  {
    taskId: 'TASK-012',
    taskName: 'Implement dark mode theme',
    assignee: 'Marcus Rodriguez',
    status: 'Done',
    priority: 1,
    createdAt: '2024-01-03T14:30:00Z',
    dueDate: '2024-01-28T17:00:00Z'
  }
];

/**
 * Complete tool specification for the Task Management Dashboard.
 * This tool demonstrates all advanced features of the editableTable component.
 */
export const taskDashboardTool: ToolSpec = {
  id: 'task-dashboard',
  title: 'Task Management Dashboard',
  
  // Global filtering inputs
  inputs: {
    statusFilter: {
      label: 'Filter by Status',
      type: 'select',
      required: false,
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'To Do', label: 'To Do' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Done', label: 'Done' }
      ]
    },
    assigneeFilter: {
      label: 'Filter by Assignee',
      type: 'text',
      required: false,
      placeholder: 'Enter assignee name...'
    }
  },
  
  // Advanced editableTable configuration
  content: {
    type: 'editableTable',
    
    // Data loading with filtering, sorting, and pagination
    dataLoader: {
      functionName: 'getTasks'
    },
    
    // Comprehensive table configuration
    tableConfig: {
      // Item updating for inline edits
      itemUpdater: {
        functionName: 'updateTask'
      },
      // Unique identifier for each row
      rowIdentifier: 'taskId',
      
      // Advanced column definitions with mixed types
      columns: [
        {
          field: 'taskId',
          label: 'Task ID',
          isSortable: true,
          isEditable: false // Read-only identifier
        },
        {
          field: 'taskName',
          label: 'Task Name',
          isSortable: true,
          isEditable: true, // Inline text editing
          editorType: 'text'
        },
        {
          field: 'assignee',
          label: 'Assignee',
          isSortable: true,
          isEditable: false // Sortable but not editable
        },
        {
          field: 'status',
          label: 'Status',
          isSortable: true,
          isEditable: true, // Inline dropdown editing
          editorType: 'select',
          editorOptions: [
            { value: 'To Do', label: 'To Do' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Done', label: 'Done' }
          ]
        },
        {
          field: 'priority',
          label: 'Priority',
          isSortable: true,
          isEditable: true, // Inline number editing
          editorType: 'number'
        },
        {
          field: 'dueDate',
          label: 'Due Date',
          isSortable: true,
          isEditable: false,
          formatter: 'date'
        }
      ],
      
      // Row-level actions
      rowActions: [
        {
          id: 'delete',
          label: 'Delete',
          functionName: 'deleteTask',
          variant: 'danger',
          needsConfirmation: true,
          confirmationMessage: 'Are you sure you want to delete this task? This action cannot be undone.'
        }
      ],
      
      // Pagination configuration
      pagination: {
        defaultPageSize: 5,
        showPageSizeSelector: true,
        pageSizeOptions: [5, 10, 20, 50]
      }
    }
  },
  
  // Mock function implementations with full feature support
  functions: {
    /**
     * Advanced data loading function that handles filtering, sorting, and pagination.
     * This function demonstrates how to process all the parameters that the framework
     * passes to implement server-side data operations.
     * 
     * @param params - Complete query parameters including filters, sorting, and pagination
     * @returns Promise resolving to paginated and filtered task data
     */
    getTasks: async (params: TaskQueryParams): Promise<{ items: Task[]; totalItems: number }> => {
      console.log('🔍 Loading tasks with parameters:', params);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Start with full dataset
      let filteredTasks = [...MOCK_TASKS];
      
      // Apply status filtering
      if (params.statusFilter && params.statusFilter.trim() !== '') {
        filteredTasks = filteredTasks.filter(task => 
          task.status === params.statusFilter
        );
        console.log(`📊 Filtered by status "${params.statusFilter}": ${filteredTasks.length} tasks`);
      }
      
      // Apply assignee filtering (case-insensitive partial match)
      if (params.assigneeFilter && params.assigneeFilter.trim() !== '') {
        const assigneeQuery = params.assigneeFilter.toLowerCase().trim();
        filteredTasks = filteredTasks.filter(task => 
          task.assignee.toLowerCase().includes(assigneeQuery)
        );
        console.log(`👤 Filtered by assignee "${params.assigneeFilter}": ${filteredTasks.length} tasks`);
      }
      
      // Apply sorting
      if (params.sortField && params.sortDirection) {
        filteredTasks.sort((a, b) => {
          const aValue = a[params.sortField as keyof Task];
          const bValue = b[params.sortField as keyof Task];
          
          let comparison = 0;
          
          // Handle different data types
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else {
            // Fallback to string comparison
            comparison = String(aValue).localeCompare(String(bValue));
          }
          
          // Apply sort direction
          return params.sortDirection === 'desc' ? -comparison : comparison;
        });
        
        console.log(`🔄 Sorted by ${params.sortField} (${params.sortDirection})`);
      }
      
      // Calculate total before pagination
      const totalItems = filteredTasks.length;
      
      // Apply pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 5;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
      
      console.log(`📄 Page ${page} (${pageSize} per page): Showing ${paginatedTasks.length} of ${totalItems} tasks`);
      
      return {
        items: paginatedTasks,
        totalItems: totalItems
      };
    },
    
    /**
     * Updates an existing task with new values.
     * This function handles inline edits from the table interface.
     * 
     * @param params - Parameters containing itemId, changes, and currentItem
     * @returns Promise resolving to the updated task
     */
    updateTask: async (params: { itemId: any; changes: any; currentItem: any }): Promise<any> => {
      console.log(`📝 Updating task ${params.itemId} with:`, params.changes);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find and update the task in our mock data
      const taskIndex = MOCK_TASKS.findIndex(task => task.taskId === params.itemId);
      
      if (taskIndex === -1) {
        throw new Error(`Task ${params.itemId} not found`);
      }
      
      // Apply updates
      const updatedTask = { ...MOCK_TASKS[taskIndex], ...params.changes };
      MOCK_TASKS[taskIndex] = updatedTask;
      
      console.log(`✅ Successfully updated task ${params.itemId}`);
      
      return updatedTask;
    },
    
    /**
     * Deletes a task from the system.
     * This function handles the "Delete" row action.
     * 
     * @param params - Parameters containing itemId and item
     * @returns Promise resolving when deletion is complete
     */
    deleteTask: async (params: { itemId: any; item: any }): Promise<void> => {
      console.log(`🗑️ Deleting task ${params.itemId}...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Find and remove the task from our mock data
      const taskIndex = MOCK_TASKS.findIndex(task => task.taskId === params.itemId);
      
      if (taskIndex === -1) {
        throw new Error(`Task ${params.itemId} not found`);
      }
      
      const deletedTask = MOCK_TASKS.splice(taskIndex, 1)[0];
      
      if (deletedTask) {
        console.log(`✅ Successfully deleted task: ${deletedTask.taskName}`);
      }
    },
    
    /**
     * Placeholder function for creating new tasks.
     * This function handles the "Create New Task" table action.
     * 
     * @param taskData - Data for the new task
     * @returns Promise resolving to the created task
     */
    createNewTask: async (taskData?: Partial<Task>): Promise<void> => {
      console.log('➕ Create New Task action triggered');
      console.log('📋 This would typically open a modal or navigate to a creation form');
      console.log('💡 Task data received:', taskData);
      
      // In a real application, this might:
      // - Open a modal with a form
      // - Navigate to a dedicated task creation page
      // - Add a new row to the table for inline creation
      
      alert('Create New Task functionality would be implemented here!\n\nThis could open a modal form or navigate to a dedicated creation page.');
    }
  }
}; 