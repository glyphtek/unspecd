/**
 * Live Orders Dashboard Tool - Streaming Table Concept for Unspec'd Framework
 * 
 * This is a CONCEPTUAL example demonstrating what a streaming table might look like.
 * The streamingTable content type does not exist yet - this serves as a design document
 * for future real-time streaming capabilities.
 * 
 * Key concepts demonstrated:
 * - Real-time data streaming with callbacks
 * - Event-driven updates (add, update, delete)
 * - Subscription-based data flow
 * - Cleanup and resource management
 */

import type { ToolSpec } from '../../src/lib/dsl-schema.js';

/**
 * Interface for streaming table configuration (conceptual).
 * This extends our existing table concepts to support real-time updates.
 */
interface StreamingTableContent {
  /** Discriminator for the conceptual streamingTable content type */
  type: 'streamingTable';
  
  /** Configuration for the streaming data source */
  dataSource: {
    /** Type of data source - 'stream' for real-time streaming */
    type: 'stream';
    /** Name of the function that manages the data stream */
    functionName: string;
  };
  
  /** Standard table configuration (reusing existing table config concepts) */
  tableConfig: {
    /** The property name that uniquely identifies each row item */
    rowIdentifier: string;
    /** Array of column configurations defining table structure */
    columns: Array<{
      /** The property name from the data object to display in this column */
      field: string;
      /** The display header text for this column */
      label: string;
      /** Optional formatter to apply to the displayed value */
      formatter?: string;
      /** Custom width for this column (CSS value) */
      width?: string;
    }>;
    /** Optional configuration for real-time visual effects */
    streamingOptions?: {
      /** Whether to highlight new rows as they arrive */
      highlightNewRows?: boolean;
      /** Whether to show update animations */
      showUpdateAnimations?: boolean;
      /** Maximum number of rows to keep in memory */
      maxRows?: number;
    };
  };
}

/**
 * Complete tool specification for the Live Orders Dashboard.
 * This demonstrates a conceptual streaming table for real-time e-commerce order monitoring.
 */
export const liveOrdersDashboardTool: ToolSpec = {
  id: 'live-orders-dashboard',
  title: 'Live Orders Feed',
  
  // No inputs needed - this streams live data automatically
  
  // StreamingTable content configuration (conceptual)
  content: {
    type: 'streamingTable',
    
    // Streaming data source configuration
    dataSource: {
      type: 'stream',
      functionName: 'streamLiveOrders'
    },
    
    // Table configuration for displaying orders
    tableConfig: {
      rowIdentifier: 'orderId',
      columns: [
        {
          field: 'orderId',
          label: 'Order ID',
          width: '120px'
        },
        {
          field: 'customerName',
          label: 'Customer',
          width: '200px'
        },
        {
          field: 'total',
          label: 'Total',
          formatter: 'currency',
          width: '100px'
        },
        {
          field: 'status',
          label: 'Status',
          width: '120px'
        },
        {
          field: 'timestamp',
          label: 'Time',
          formatter: 'datetime',
          width: '150px'
        }
      ],
      streamingOptions: {
        highlightNewRows: true,
        showUpdateAnimations: true,
        maxRows: 100 // Keep last 100 orders in view
      }
    }
  } as any, // Type assertion since streamingTable doesn't exist yet
  
  // Mock function implementations
  functions: {
    /**
     * Streaming function for live orders data.
     * 
     * This function demonstrates the conceptual API for streaming data sources.
     * Unlike traditional dataLoader functions that return a Promise with static data,
     * streaming functions receive callback functions and manage a continuous data flow.
     * 
     * @param params - Contains callback functions for stream events
     * @param params.onData - Callback to send new data events
     * @param params.onError - Callback to report errors
     * @param params.onConnect - Callback when stream connection is established
     * @param params.onDisconnect - Callback when stream is disconnected
     * @returns Cleanup function to stop the stream
     */
    streamLiveOrders: async (params: {
      onData: (event: StreamEvent) => void;
      onError: (error: Error) => void;
      onConnect?: () => void;
      onDisconnect?: () => void;
    }): Promise<() => void> => {
      console.log('🔴 Starting live orders stream...');
      
      // Simulate connection establishment
      if (params.onConnect) {
        setTimeout(params.onConnect, 500);
      }
      
      // Generate initial set of orders
      const initialOrders = [
        {
          orderId: 'ORD-001',
          customerName: 'Alice Johnson',
          total: 89.99,
          status: 'Processing',
          timestamp: new Date(Date.now() - 300000) // 5 minutes ago
        },
        {
          orderId: 'ORD-002',
          customerName: 'Bob Smith',
          total: 156.50,
          status: 'Shipped',
          timestamp: new Date(Date.now() - 180000) // 3 minutes ago
        },
        {
          orderId: 'ORD-003',
          customerName: 'Carol Davis',
          total: 45.25,
          status: 'Delivered',
          timestamp: new Date(Date.now() - 120000) // 2 minutes ago
        }
      ];
      
      // Send initial data
      setTimeout(() => {
        initialOrders.forEach(order => {
          params.onData({
            type: 'add',
            item: order
          });
        });
      }, 1000);
      
      // Set up intervals for simulating real-time updates
      let orderCounter = 4;
      const existingOrderIds = ['ORD-001', 'ORD-002', 'ORD-003'];
      
      // Add new orders every 8-15 seconds
      const newOrderInterval = setInterval(() => {
        const newOrderId = `ORD-${String(orderCounter).padStart(3, '0')}`;
        const customerNames = ['David Wilson', 'Eva Brown', 'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Iris Chen', 'Jack Rodriguez'];
        const statuses = ['Processing', 'Confirmed', 'Processing'];
        
        const newOrder = {
          orderId: newOrderId,
          customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
          total: Math.round((Math.random() * 200 + 20) * 100) / 100, // $20-$220
          status: statuses[Math.floor(Math.random() * statuses.length)],
          timestamp: new Date()
        };
        
        existingOrderIds.push(newOrderId);
        orderCounter++;
        
        console.log('📦 New order added:', newOrder.orderId);
        params.onData({
          type: 'add',
          item: newOrder
        });
      }, Math.random() * 7000 + 8000); // 8-15 seconds
      
      // Update existing orders every 10-20 seconds
      const updateOrderInterval = setInterval(() => {
        if (existingOrderIds.length === 0) return;
        
        const randomOrderId = existingOrderIds[Math.floor(Math.random() * existingOrderIds.length)];
        const statusProgression: Record<string, string> = {
          'Processing': 'Confirmed',
          'Confirmed': 'Shipped',
          'Shipped': 'Delivered'
        };
        
        const possibleStatuses = ['Processing', 'Confirmed'];
        const randomIndex = Math.floor(Math.random() * possibleStatuses.length);
        const randomStatus = possibleStatuses[randomIndex]!;
        const newStatus = statusProgression[randomStatus] || 'Shipped';
        
        console.log('📝 Order updated:', randomOrderId, '->', newStatus);
        params.onData({
          type: 'update',
          itemId: randomOrderId,
          changes: {
            status: newStatus,
            timestamp: new Date() // Update timestamp on status change
          }
        });
      }, Math.random() * 10000 + 10000); // 10-20 seconds
      
      // Occasionally simulate errors (very rarely)
      const errorInterval = setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance every minute
          console.warn('⚠️ Simulated stream error');
          params.onError(new Error('Temporary connection issue with orders service'));
        }
      }, 60000); // Check every minute
      
      // Return cleanup function
      return () => {
        console.log('🔴 Stopping live orders stream...');
        clearInterval(newOrderInterval);
        clearInterval(updateOrderInterval);
        clearInterval(errorInterval);
        
        if (params.onDisconnect) {
          params.onDisconnect();
        }
      };
    }
  }
};

/**
 * Type definitions for streaming events (conceptual).
 * These define the different types of real-time updates that can occur.
 */
type StreamEvent = 
  | { type: 'add'; item: any }
  | { type: 'update'; itemId: string; changes: any }
  | { type: 'delete'; itemId: string }
  | { type: 'replace'; items: any[] } // Full refresh
  | { type: 'clear' }; // Clear all data 