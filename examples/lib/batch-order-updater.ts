/**
 * Batch Order Status Updater - Advanced SmartTable Conceptual Example for Unspec'd Framework
 * 
 * This example demonstrates how the editableTable content type could be extended to support
 * advanced batch operations with multi-row selection. This is a conceptual design showing
 * how the framework could evolve to handle complex real-world use cases.
 * 
 * Key conceptual features demonstrated:
 * - Multi-row selection with checkboxes (`selectionMode: 'multiple'`)
 * - Batch table actions that operate on selected rows
 * - Actions with associated input controls (`withInput` configuration)
 * - Selection-aware action states (`requiresSelection: true`)
 * - Comprehensive batch operation handling
 * 
 * Real-world use case:
 * E-commerce operations team needs to update order statuses in bulk after shipping
 * events. Users can select multiple orders and change their status from "Processing"
 * to "Shipped" in a single operation.
 */

import type { ToolSpec } from '../../src/lib/dsl-schema.js';

/**
 * Interface for order data structure
 */
interface Order {
  orderId: string;
  customerName: string;
  orderDate: string;
  currentStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderValue: number;
  items: number; // Number of items in the order
  shippingAddress: string;
}

/**
 * Interface for batch update parameters
 */
interface BatchUpdateParams {
  selectedItems: Order[];
  inputs: {
    newStatus: string;
    updateReason?: string;
  };
}

/**
 * Mock order data - realistic e-commerce order dataset
 */
const MOCK_ORDERS: Order[] = [
  {
    orderId: 'ORD-2024-001',
    customerName: 'Alice Johnson',
    orderDate: '2024-01-15T10:30:00Z',
    currentStatus: 'Processing',
    orderValue: 129.99,
    items: 3,
    shippingAddress: '123 Main St, Springfield, IL'
  },
  {
    orderId: 'ORD-2024-002',
    customerName: 'Bob Smith',
    orderDate: '2024-01-15T14:22:00Z',
    currentStatus: 'Processing',
    orderValue: 79.50,
    items: 2,
    shippingAddress: '456 Oak Ave, Madison, WI'
  },
  {
    orderId: 'ORD-2024-003',
    customerName: 'Carol Davis',
    orderDate: '2024-01-16T09:15:00Z',
    currentStatus: 'Processing',
    orderValue: 245.00,
    items: 5,
    shippingAddress: '789 Pine Rd, Austin, TX'
  },
  {
    orderId: 'ORD-2024-004',
    customerName: 'David Wilson',
    orderDate: '2024-01-16T11:45:00Z',
    currentStatus: 'Pending',
    orderValue: 99.99,
    items: 1,
    shippingAddress: '321 Elm St, Seattle, WA'
  },
  {
    orderId: 'ORD-2024-005',
    customerName: 'Eva Martinez',
    orderDate: '2024-01-16T16:30:00Z',
    currentStatus: 'Processing',
    orderValue: 189.75,
    items: 4,
    shippingAddress: '654 Maple Dr, Denver, CO'
  },
  {
    orderId: 'ORD-2024-006',
    customerName: 'Frank Brown',
    orderDate: '2024-01-17T08:20:00Z',
    currentStatus: 'Processing',
    orderValue: 159.99,
    items: 2,
    shippingAddress: '987 Cedar Ln, Portland, OR'
  },
  {
    orderId: 'ORD-2024-007',
    customerName: 'Grace Lee',
    orderDate: '2024-01-17T13:10:00Z',
    currentStatus: 'Pending',
    orderValue: 299.99,
    items: 6,
    shippingAddress: '147 Birch Way, Nashville, TN'
  },
  {
    orderId: 'ORD-2024-008',
    customerName: 'Henry Taylor',
    orderDate: '2024-01-17T15:55:00Z',
    currentStatus: 'Processing',
    orderValue: 85.50,
    items: 3,
    shippingAddress: '258 Walnut St, Phoenix, AZ'
  },
  {
    orderId: 'ORD-2024-009',
    customerName: 'Ivy Chen',
    orderDate: '2024-01-18T10:05:00Z',
    currentStatus: 'Processing',
    orderValue: 199.99,
    items: 4,
    shippingAddress: '369 Spruce Ave, Boston, MA'
  },
  {
    orderId: 'ORD-2024-010',
    customerName: 'Jack Robinson',
    orderDate: '2024-01-18T12:40:00Z',
    currentStatus: 'Pending',
    orderValue: 119.99,
    items: 2,
    shippingAddress: '741 Poplar Rd, Miami, FL'
  }
];

/**
 * Complete tool specification for the Batch Order Status Updater.
 * This tool demonstrates advanced table features for batch operations.
 * 
 * NOTE: This is a conceptual example. The actual SmartTable component would need
 * to be extended to support these advanced features like multi-row selection
 * and batch actions with associated inputs.
 */
export const batchOrderUpdaterTool: ToolSpec = {
  id: 'batch-order-updater',
  title: 'Batch Order Status Updater',
  
  // No global inputs needed - this tool focuses on table-level batch operations
  
  // Advanced editableTable configuration with batch operation support
  content: {
    type: 'editableTable',
    
    // Data loading configuration
    dataLoader: {
      functionName: 'getProcessableOrders'
    },
    
         // Advanced table configuration with batch operation features
     tableConfig: {
       // Unique identifier for each row
       rowIdentifier: 'orderId',
       
       // CONCEPTUAL FEATURE: Multi-row selection mode
       // This would tell the SmartTable component to render checkboxes for each row
       // and manage selection state across the entire table
       // selectionMode: 'multiple', // Type assertion since this is conceptual
      
      // Table column definitions (read-only for batch operations)
      columns: [
        {
          field: 'orderId',
          label: 'Order ID',
          isSortable: true,
          isEditable: false,
          width: '120px'
        },
        {
          field: 'customerName',
          label: 'Customer',
          isSortable: true,
          isEditable: false,
          width: '160px'
        },
        {
          field: 'orderDate',
          label: 'Order Date',
          isSortable: true,
          isEditable: false,
          formatter: 'date',
          width: '120px'
        },
        {
          field: 'currentStatus',
          label: 'Current Status',
          isSortable: true,
          isEditable: false,
          width: '120px'
        },
        {
          field: 'orderValue',
          label: 'Value',
          isSortable: true,
          isEditable: false,
          formatter: 'currency',
          width: '100px'
        },
        {
          field: 'items',
          label: 'Items',
          isSortable: true,
          isEditable: false,
          width: '80px'
        }
      ],
      
                    /* CONCEPTUAL FEATURE: Advanced batch table actions
        * These actions would be aware of selected rows and could have associated inputs
        * 
        * batchActions: [
        *   {
        *     // Basic action configuration
        *     id: 'batchUpdateStatus',
        *     label: 'Set Status for Selected',
        *     variant: 'primary',
        *     
        *     // CONCEPTUAL FEATURE: Selection requirement
        *     // The action button would be disabled until at least one row is selected
        *     requiresSelection: true,
        *     
        *     // CONCEPTUAL FEATURE: Associated input controls
        *     // This allows the action to have input fields rendered alongside it
        *     withInput: {
        *       newStatus: {
        *         type: 'select',
        *         label: 'New Status',
        *         placeholder: 'Select new status...',
        *         options: [
        *           { value: 'Pending', label: 'Pending' },
        *           { value: 'Processing', label: 'Processing' },
        *           { value: 'Shipped', label: 'Shipped' },
        *           { value: 'Delivered', label: 'Delivered' },
        *           { value: 'Cancelled', label: 'Cancelled' }
        *         ],
        *         required: true
        *       },
        *       updateReason: {
        *         type: 'text',
        *         label: 'Reason (Optional)',
        *         placeholder: 'Enter reason for status change...',
        *         required: false
        *       }
        *     },
        *     
        *     // Function to call for the batch action
        *     functionName: 'batchUpdateOrderStatus',
        *     
        *     // CONCEPTUAL FEATURE: Confirmation for batch operations
        *     needsConfirmation: true,
        *     confirmationMessage: 'Are you sure you want to update the status of all selected orders? This action cannot be undone.'
        *   }
        * ]
        */
      
      // Standard pagination configuration
      pagination: {
        defaultPageSize: 10,
        showPageSizeSelector: true,
        pageSizeOptions: [5, 10, 20, 50]
      },
      
      // Default sorting by order date (newest first)
      defaultSort: {
        field: 'orderDate',
        direction: 'desc'
      }
    }
  },
  
  // Mock function implementations for batch operations
  functions: {
    /**
     * Loads orders that are available for status updates.
     * In a real application, this might filter to only show orders in certain statuses.
     * 
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise resolving to paginated order data
     */
    getProcessableOrders: async (params: any): Promise<{ items: Order[]; totalItems: number }> => {
      console.log('🔍 Loading processable orders with parameters:', params);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Filter to orders that can be updated (exclude already delivered/cancelled)
      let processableOrders = MOCK_ORDERS.filter(order => 
        !['Delivered', 'Cancelled'].includes(order.currentStatus)
      );
      
      // Apply sorting if specified
      if (params.sortBy && params.sortDirection) {
        processableOrders.sort((a, b) => {
          const aValue = a[params.sortBy as keyof Order];
          const bValue = b[params.sortBy as keyof Order];
          
          let comparison = 0;
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else {
            comparison = String(aValue).localeCompare(String(bValue));
          }
          
          return params.sortDirection === 'desc' ? -comparison : comparison;
        });
      }
      
      // Calculate pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      const paginatedOrders = processableOrders.slice(startIndex, endIndex);
      
      console.log(`✅ Loaded ${paginatedOrders.length} of ${processableOrders.length} processable orders`);
      
      return {
        items: paginatedOrders,
        totalItems: processableOrders.length
      };
    },
    
    /**
     * CONCEPTUAL FUNCTION: Performs batch status updates on selected orders.
     * This demonstrates how a batch action function would receive both the selected
     * items and the values from associated input controls.
     * 
     * @param params - Batch update parameters including selected items and inputs
     * @returns Promise resolving when batch update is complete
     */
    batchUpdateOrderStatus: async (params: BatchUpdateParams): Promise<{ updated: number; errors: string[] }> => {
      console.log('📦 Starting batch order status update:', params);
      
      // Validate that we have selected items
      if (!params.selectedItems || params.selectedItems.length === 0) {
        throw new Error('No orders selected for batch update');
      }
      
             // Validate that we have a new status
       if (!params.inputs || !params.inputs.newStatus) {
         throw new Error('New status is required for batch update');
       }
       
       console.log(`🔄 Updating ${params.selectedItems.length} orders to status: ${params.inputs.newStatus}`);
       if (params.inputs.updateReason) {
         console.log(`📝 Update reason: ${params.inputs.updateReason}`);
       }
      
      // Simulate batch processing with realistic timing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let updatedCount = 0;
      const errors: string[] = [];
      
      // Process each selected order
      for (const order of params.selectedItems) {
        try {
          // Simulate some orders failing validation
          if (order.currentStatus === 'Cancelled') {
            errors.push(`Order ${order.orderId}: Cannot update cancelled orders`);
            continue;
          }
          
          // Find and update the order in our mock data
          const orderIndex = MOCK_ORDERS.findIndex(o => o.orderId === order.orderId);
          if (orderIndex !== -1) {
            const oldStatus = MOCK_ORDERS[orderIndex].currentStatus;
            MOCK_ORDERS[orderIndex].currentStatus = params.inputs.newStatus as any;
            
            console.log(`  ✅ ${order.orderId}: ${oldStatus} → ${params.inputs.newStatus}`);
            updatedCount++;
          } else {
            errors.push(`Order ${order.orderId}: Order not found`);
          }
          
          // Simulate per-item processing time
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          errors.push(`Order ${order.orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      const result = { updated: updatedCount, errors };
      
      console.log('🎯 Batch update completed:', result);
      
      // Show user-friendly results
      if (result.updated > 0) {
        console.log(`✅ Successfully updated ${result.updated} order(s) to "${params.inputs.newStatus}"`);
      }
      
      if (result.errors.length > 0) {
        console.warn(`⚠️ ${result.errors.length} order(s) could not be updated:`);
        result.errors.forEach(error => console.warn(`  - ${error}`));
      }
      
      return result;
    },
    
    /**
     * Helper function to get statistics about orders by status.
     * This could be used for additional dashboard features.
     * 
     * @param params - Query parameters (unused in this mock)
     * @returns Promise resolving to status statistics
     */
    getOrderStatusStats: async (params: any): Promise<Record<string, number>> => {
      console.log('📊 Calculating order status statistics...');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stats: Record<string, number> = {};
      
      MOCK_ORDERS.forEach(order => {
        stats[order.currentStatus] = (stats[order.currentStatus] || 0) + 1;
      });
      
      console.log('📈 Order status statistics:', stats);
      
      return stats;
    }
  }
};

/**
 * CONCEPTUAL DESIGN NOTES:
 * 
 * This example demonstrates how the Unspec'd framework could be extended to support
 * advanced batch operations. The key conceptual features are:
 * 
 * 1. SELECTION MODE:
 *    - `selectionMode: 'multiple'` enables checkbox rendering for each row
 *    - The SmartTable component would track selected state internally
 *    - Selection state would persist across pagination and sorting
 * 
 * 2. BATCH ACTIONS:
 *    - `batchActions` array defines actions that operate on selected rows
 *    - `requiresSelection: true` disables the action until rows are selected
 *    - Actions can have associated input controls via `withInput`
 * 
 * 3. BATCH FUNCTION INTERFACE:
 *    - Functions receive `{ selectedItems: Item[], inputs: Record<string, any> }`
 *    - This provides both the selected data and values from action inputs
 *    - Functions can return detailed results including success/error counts
 * 
 * 4. USER EXPERIENCE:
 *    - Users see checkboxes next to each row for selection
 *    - Batch action buttons are disabled until selections are made
 *    - Input controls appear alongside action buttons
 *    - Confirmation dialogs prevent accidental batch operations
 *    - Progress indicators show batch operation status
 * 
 * This design would enable powerful batch operations while maintaining the
 * declarative simplicity that makes Unspec'd easy to use.
 */ 