// NanoID Generator Adapter - Task ID: TASK-1-001-04

import { nanoid } from 'nanoid';
import type { IdGenerator } from '../ports/id-generator.js';

/**
 * ID generator using nanoid
 * Generates URL-friendly unique IDs
 */
export class NanoIdGenerator implements IdGenerator {
  private readonly size: number;

  constructor(size: number = 12) {
    this.size = size;
  }

  generate(): string {
    return nanoid(this.size);
  }
}
