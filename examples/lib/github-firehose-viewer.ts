/**
 * GitHub Firehose Viewer Tool - Real-world Streaming Table Example for Unspec'd Framework
 * 
 * This example demonstrates the streamingTable content type with a real SSE data source.
 * It connects to the public GitHub firehose at https://github-firehose.libraries.io/
 * and displays live GitHub events in a streaming table.
 * 
 * Key features demonstrated:
 * - Real Server-Sent Events (SSE) integration
 * - Live data transformation and formatting
 * - EventSource lifecycle management
 * - Real-time GitHub activity monitoring
 */

import type { ToolSpec } from '../../src/lib/dsl-schema.js';

/**
 * Interface for GitHub event data structure
 * Based on the GitHub Events API schema
 */
interface GitHubEvent {
  id: string;
  type: string;
  repo?: {
    id: number;
    name: string;
    url: string;
  };
  actor?: {
    id: number;
    login: string;
    display_login?: string;
    gravatar_id: string;
    url: string;
    avatar_url: string;
  };
  payload?: any;
  public?: boolean;
  created_at?: string;
}

/**
 * Transformed event data structure for display in our table
 */
interface DisplayEvent {
  id: string;
  type: string;
  repo: string;
  actor: string;
  summary: string;
  timestamp: string;
}

/**
 * Complete tool specification for the GitHub Firehose Viewer.
 * This tool displays live GitHub events from the public firehose stream.
 */
export const githubFirehoseViewerTool: ToolSpec = {
  id: 'github-firehose-viewer',
  title: 'Live GitHub Firehose',
  
  // No inputs needed - this streams live data automatically
  
  // StreamingTable content configuration
  content: {
    type: 'streamingTable',
    
    // Real-time data source configuration
    dataSource: {
      type: 'stream',
      functionName: 'streamGitHubEvents'
    },
    
    // Table configuration for displaying GitHub events
    tableConfig: {
      rowIdentifier: 'id',
      columns: [
        {
          field: 'type',
          label: 'Event Type',
          width: '140px'
        },
        {
          field: 'repo',
          label: 'Repository',
          width: '250px'
        },
        {
          field: 'actor',
          label: 'Actor',
          width: '150px'
        },
        {
          field: 'summary',
          label: 'Summary',
          width: 'auto'
        },
        {
          field: 'timestamp',
          label: 'Time',
          formatter: 'time',
          width: '100px'
        }
      ],
      streamingOptions: {
        highlightNewRows: true,
        showUpdateAnimations: false, // GitHub events don't update, only new ones arrive
        maxRows: 50 // Keep reasonable number for performance with high-volume stream
      }
    }
  } as any, // Type assertion since streamingTable is not in official schema yet
  
  // Real implementation functions
  functions: {
    /**
     * Streaming function for live GitHub events.
     * 
     * Connects to the GitHub firehose SSE stream and transforms incoming events
     * into display-friendly objects for the streaming table.
     * 
     * @param params - Contains callback functions for stream events
     * @param params.onData - Callback to send new data events to the table
     * @param params.onError - Callback to report connection errors
     * @param params.onConnect - Callback when SSE connection is established
     * @param params.onDisconnect - Callback when SSE connection is lost
     * @returns Cleanup function to close the EventSource connection
     */
    streamGitHubEvents: async (params: {
      onData: (event: any) => void;
      onError: (error: Error) => void;
      onConnect?: () => void;
      onDisconnect?: () => void;
    }): Promise<() => void> => {
            console.log('🔥 Connecting to GitHub firehose...');
      
      // Import EventSource for server-side SSE
      const { EventSource } = await import('eventsource');
      
      // Create EventSource connection to GitHub firehose
      const eventSource = new EventSource('http://github-firehose.libraries.io/events');
      
      // Handle successful connection
      eventSource.onopen = () => {
        console.log('✅ Connected to GitHub firehose');
        if (params.onConnect) {
          params.onConnect();
        }
      };
      
      // Handle incoming messages (using the specific 'event' listener as per docs)
      eventSource.addEventListener('event', (event: any) => {
        try {
          // Parse the incoming JSON data
          const githubEvent: GitHubEvent = JSON.parse(event.data);
         
         // Transform GitHub event into display-friendly format
         const displayEvent: DisplayEvent = {
           id: githubEvent.id,
           type: formatEventType(githubEvent.type),
           repo: githubEvent.repo?.name || 'Unknown Repository',
           actor: githubEvent.actor?.login || 'Unknown User',
           summary: generateEventSummary(githubEvent),
           timestamp: new Date().toISOString()
         };
         
         // Send the new event to the streaming table
         params.onData({
           type: 'add',
           item: displayEvent
         });
         
       } catch (error) {
         console.error('❌ Error parsing GitHub event:', error);
         // Don't propagate parse errors to avoid breaking the stream
        }
      });
     
     // Handle connection errors
     eventSource.onerror = (event: any) => {
       console.error('❌ GitHub firehose connection error:', event);
       
       // Determine error type and message
       let errorMessage = 'Connection error';
       if (eventSource.readyState === 1) { // CONNECTING
         errorMessage = 'Reconnecting to GitHub firehose...';
       } else if (eventSource.readyState === 2) { // CLOSED
         errorMessage = 'Connection to GitHub firehose closed';
         if (params.onDisconnect) {
           params.onDisconnect();
         }
       }
       
       params.onError(new Error(errorMessage));
     };
     
     // Return cleanup function to properly close the connection
     return () => {
       console.log('🔴 Closing GitHub firehose connection...');
       eventSource.close();
       
       if (params.onDisconnect) {
         params.onDisconnect();
       }
     };
    }
  }
};

/**
 * Formats GitHub event types into human-readable labels.
 * Converts PascalCase event types to readable format.
 * 
 * @param eventType - The raw GitHub event type (e.g., 'PushEvent')
 * @returns Formatted event type (e.g., 'Push')
 */
function formatEventType(eventType: string): string {
  // Remove 'Event' suffix and add spaces before capitals
  return eventType
    .replace(/Event$/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}

/**
 * Generates a human-readable summary for different GitHub event types.
 * Creates contextual descriptions based on the event payload.
 * 
 * @param event - The GitHub event object
 * @returns A descriptive summary string
 */
function generateEventSummary(event: GitHubEvent): string {
  const { type, payload, repo, actor } = event;
  
  try {
    switch (type) {
      case 'PushEvent':
        const commitCount = payload?.commits?.length || 0;
        const branch = payload?.ref?.replace('refs/heads/', '') || 'unknown';
        return `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${branch}`;
      
      case 'CreateEvent':
        const refType = payload?.ref_type || 'unknown';
        const refName = payload?.ref || '';
        return `Created ${refType}${refName ? ` "${refName}"` : ''}`;
      
      case 'DeleteEvent':
        const deletedRefType = payload?.ref_type || 'unknown';
        const deletedRefName = payload?.ref || '';
        return `Deleted ${deletedRefType}${deletedRefName ? ` "${deletedRefName}"` : ''}`;
      
      case 'IssuesEvent':
        const issueAction = payload?.action || 'unknown';
        const issueNumber = payload?.issue?.number || '';
        return `${capitalizeFirst(issueAction)} issue${issueNumber ? ` #${issueNumber}` : ''}`;
      
      case 'PullRequestEvent':
        const prAction = payload?.action || 'unknown';
        const prNumber = payload?.pull_request?.number || '';
        return `${capitalizeFirst(prAction)} pull request${prNumber ? ` #${prNumber}` : ''}`;
      
      case 'WatchEvent':
        return 'Starred the repository';
      
      case 'ForkEvent':
        const forkName = payload?.forkee?.full_name || '';
        return `Forked to ${forkName || 'unknown'}`;
      
      case 'ReleaseEvent':
        const releaseAction = payload?.action || 'unknown';
        const tagName = payload?.release?.tag_name || '';
        return `${capitalizeFirst(releaseAction)} release${tagName ? ` ${tagName}` : ''}`;
      
      case 'IssueCommentEvent':
        const commentAction = payload?.action || 'unknown';
        const issueNum = payload?.issue?.number || '';
        return `${capitalizeFirst(commentAction)} comment on issue${issueNum ? ` #${issueNum}` : ''}`;
      
      default:
        // Generic fallback for unknown event types
        const action = payload?.action;
        return action ? `${capitalizeFirst(action)} ${type.replace('Event', '').toLowerCase()}` : `${type.replace('Event', '')} activity`;
    }
  } catch (error) {
    // Fallback for any parsing errors
    return `${type.replace('Event', '')} activity`;
  }
}

/**
 * Capitalizes the first letter of a string.
 * 
 * @param str - The string to capitalize
 * @returns String with first letter capitalized
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

 