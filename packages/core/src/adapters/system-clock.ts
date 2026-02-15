// System Clock Adapter - Task ID: TASK-1-001-04

import type { Clock } from '../ports/clock.js';

/**
 * Clock implementation using system time
 */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

/**
 * Fixed clock for testing
 * Always returns the same time
 */
export class FixedClock implements Clock {
  private _fixedTime: Date;

  constructor(fixedTime: Date) {
    this._fixedTime = fixedTime;
  }

  now(): Date {
    return new Date(this._fixedTime);
  }

  /**
   * Set a new fixed time
   */
  setTime(time: Date): void {
    this._fixedTime = time;
  }
}
