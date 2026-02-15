// ID Generator Port - Task ID: TASK-1-001-03
// Constitution Reference: AP-02 (Dependency Inversion)

/**
 * Interface for generating unique identifiers
 */
export interface IdGenerator {
  /**
   * Generate a new unique identifier
   * @returns A unique string identifier
   */
  generate(): string;
}
