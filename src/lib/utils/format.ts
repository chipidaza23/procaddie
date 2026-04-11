/**
 * Format a distance in yards for display.
 */
export function formatDistance(yards: number): string {
  return `${yards.toLocaleString()} yds`;
}

/**
 * Format a par value for display.
 */
export function formatPar(par: number): string {
  return `Par ${par}`;
}
