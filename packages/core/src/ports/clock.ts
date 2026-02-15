// Clock Port - Task ID: TASK-1-001-03
// Constitution Reference: AP-02 (Dependency Inversion)

/**
 * Interface for getting current time
 * Allows for testable time-dependent code
 */
export interface Clock {
  /**
   * Get the current date and time
   * @returns Current Date object
   */
  now(): Date;
}
