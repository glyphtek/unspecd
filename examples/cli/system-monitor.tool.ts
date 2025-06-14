/**
 * Example CLI Tool: System Monitor
 * 
 * This tool demonstrates the CLI discovery pattern with displayRecord content type.
 * Shows system statistics and health information.
 */

// When using the published package, you would import like this:
// import type { ToolSpec } from '@glyphtek/unspecd';

// For this example, we use relative paths since we're in the source:
import type { ToolSpec } from '../../src/lib/dsl-schema.js';

const systemMonitorTool: ToolSpec = {
  id: 'system-monitor',
  title: 'System Monitor',
  content: {
    type: 'displayRecord',
    dataLoader: {
      functionName: 'loadSystemStats'
    },
    displayConfig: {
      fields: [
        { field: 'uptime', label: 'System Uptime' },
        { field: 'cpu', label: 'CPU Usage', formatter: 'percentage' },
        { field: 'memory', label: 'Memory Usage', formatter: 'percentage' },
        { field: 'disk', label: 'Disk Usage', formatter: 'percentage' },
        { field: 'processes', label: 'Running Processes' },
        { field: 'loadAverage', label: 'Load Average' },
        { field: 'lastUpdate', label: 'Last Updated', formatter: 'date' }
      ]
    }
  },
  functions: {
    loadSystemStats: async (params: any) => {
      // Mock system statistics
      return {
        uptime: '15 days, 3 hours, 42 minutes',
        cpu: '23.5',
        memory: '67.2',
        disk: '78.9',
        processes: '156',
        loadAverage: '1.24, 1.18, 1.32',
        lastUpdate: new Date().toISOString()
      };
    }
  }
};

export default systemMonitorTool; 