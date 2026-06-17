/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
}

export interface ClassData {
  id: string;
  name: string; // e.g. "3학년 1반", "동아리 A"
  students: string[]; // List of student names
}

export interface GroupResult {
  groupIndex: number; // 0-based index (Modum 1, Modum 2...)
  name: string; // e.g., "1모둠"
  students: string[];
  leader?: string; // Optional leader name
}

export type AppView = 'Setup' | 'Countdown' | 'Result';
