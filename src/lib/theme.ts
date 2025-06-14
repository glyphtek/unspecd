/**
 * Unspec'd Framework Theme
 *
 * This file contains the centralized styling definitions for the Unspec'd UI framework.
 * All Tailwind CSS classes are organized by component type to ensure consistency
 * and maintainability across the entire framework.
 */

/**
 * The main theme object containing all styling definitions for the framework.
 * Each property contains Tailwind CSS class strings for specific UI elements.
 */
export const theme = {
  /**
   * Base styles for a tool's main container panel.
   * Provides a clean, elevated appearance with proper spacing and subtle shadows.
   */
  panel: 'bg-white border border-gray-200/60 rounded-xl shadow-lg shadow-gray-100/50 p-8 space-y-6 backdrop-blur-sm',

  /**
   * Styles for the main tool title (h1 elements).
   * Uses a large, bold font with proper spacing and professional color.
   */
  title:
    'text-3xl font-bold mb-6 text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent',

  /**
   * Styles for standard descriptive text paragraphs.
   * Provides good readability with appropriate line height and color.
   */
  description: 'text-gray-700 leading-relaxed',

  /**
   * Styles for form and input field labels.
   * Uses semibold weight with proper spacing and professional color.
   */
  label: 'font-semibold text-gray-800 min-w-0 sm:min-w-[120px] flex-shrink-0 text-sm tracking-wide',

  /**
   * Styles for standard text input fields.
   * Includes proper padding, borders, focus states, and accessibility features.
   */
  textInput:
    'w-full px-4 py-3 border border-gray-300/80 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:bg-gray-50/80 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400/80',

  /**
   * Button styling variants for different use cases.
   */
  button: {
    /**
     * Primary action button styles.
     * Features blue theme with proper hover, focus, and disabled states.
     */
    primary:
      'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-700/30 transform hover:-translate-y-0.5',

    /**
     * Additional styles specifically for disabled button state.
     * Can be combined with primary for comprehensive disabled styling.
     */
    disabled: 'bg-gray-400 cursor-not-allowed text-gray-600',

    /**
     * Secondary button variant for less prominent actions.
     */
    secondary:
      'bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',

    /**
     * Danger button variant for destructive actions.
     */
    danger:
      'bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  },

  /**
   * User feedback styling for different states and messages.
   */
  feedback: {
    /**
     * Loading state text styling.
     * Uses muted color with subtle animation for visual feedback.
     */
    loading: 'text-gray-500 animate-pulse',

    /**
     * Error message container styling.
     * Features red theme with proper contrast and rounded corners.
     */
    error: 'text-red-600 p-4 border border-red-300 rounded-lg bg-red-50',

    /**
     * Success message container styling.
     * Features green theme for positive feedback.
     */
    success: 'text-green-600 p-4 border border-green-300 rounded-lg bg-green-50',

    /**
     * Warning message container styling.
     * Features amber theme for cautionary feedback.
     */
    warning: 'text-amber-600 p-4 border border-amber-300 rounded-lg bg-amber-50',

    /**
     * Info message container styling.
     * Features blue theme for informational feedback.
     */
    info: 'text-blue-600 p-4 border border-blue-300 rounded-lg bg-blue-50',
  },

  /**
   * Data display styling for record components.
   */
  data: {
    /**
     * Container for data record displays.
     * Provides a clean card-like appearance with proper spacing.
     */
    container: 'space-y-3 bg-white border border-gray-200 rounded-lg p-4',

    /**
     * Individual field container styling.
     * Creates responsive layout with proper spacing and subtle dividers.
     */
    field: 'flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 py-2 border-b border-gray-100 last:border-b-0',

    /**
     * Field value styling for data display.
     * Ensures proper text wrapping and readability.
     */
    value: 'text-gray-900 flex-1 break-words',

    /**
     * Styling for null or undefined field values.
     * Uses muted styling to indicate missing data.
     */
    emptyValue: 'text-gray-400 italic flex-1',

    /**
     * No data found message styling.
     * Provides clear indication when no data is available.
     */
    noData: 'text-gray-500 italic p-4 bg-gray-50 border border-gray-200 rounded',
  },

  /**
   * Layout and spacing utilities.
   */
  layout: {
    /**
     * Standard vertical spacing between components.
     */
    spacing: 'space-y-4',

    /**
     * Container with maximum width and centered alignment.
     */
    container: 'max-w-4xl mx-auto',

    /**
     * Responsive grid layout for multiple items.
     */
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  },

  /**
   * Typography scale for consistent text sizing.
   */
  text: {
    /**
     * Extra large text for major headings.
     */
    xl: 'text-xl font-semibold text-gray-900',

    /**
     * Large text for section headings.
     */
    lg: 'text-lg font-medium text-gray-900',

    /**
     * Base text size for body content.
     */
    base: 'text-base text-gray-700',

    /**
     * Small text for secondary information.
     */
    sm: 'text-sm text-gray-600',

    /**
     * Extra small text for fine print and captions.
     */
    xs: 'text-xs text-gray-500',
  },
} as const;
