/**
 * Utility functions for formatting agent names
 */

/**
 * Truncates a long agent name to a maximum length
 * @param {string} name - The agent name
 * @param {number} maxLength - Maximum length (default: 20)
 * @returns {string} Truncated name with ellipsis if needed
 */
export function truncateName(name, maxLength = 20) {
  if (!name) return "Unnamed";
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + "...";
}

/**
 * Formats agent name for display (handles long auto-generated names)
 * @param {string} name - The agent name
 * @returns {string} Formatted name
 */
export function formatAgentName(name) {
  if (!name) return "Unnamed";
  
  // If name is very long (likely auto-generated), truncate it
  if (name.length > 25) {
    // Try to extract meaningful part (before first timestamp-like number)
    const match = name.match(/^([^_]+(?:_[^_]+)*?)_\d+$/);
    if (match && match[1].length > 0 && match[1].length < name.length) {
      return truncateName(match[1], 20);
    }
    return truncateName(name, 20);
  }
  
  return name;
}

/**
 * Gets a short display name for agent cards
 * @param {string} name - The agent name
 * @param {number} maxLength - Maximum length (default: 15)
 * @returns {string} Short display name
 */
export function getShortName(name, maxLength = 15) {
  return truncateName(name, maxLength);
}

