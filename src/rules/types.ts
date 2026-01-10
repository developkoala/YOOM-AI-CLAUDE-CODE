/**
 * Framework Rules Type Definitions
 *
 * Defines types for framework configuration, detection, and code review deductions.
 */

/**
 * Code review deduction item
 */
export interface ReviewDeduction {
  /** Deduction code (e.g., 'TS-2', 'NEXT-1') */
  code: string;
  /** Description of the violation */
  description: string;
  /** Points to deduct */
  points: number;
  /** Category for grouping */
  category: 'purity' | 'unidirectional' | 'declarative' | 'debugging' | 'structure' | 'framework';
}

/**
 * Framework-specific configuration
 */
export interface FrameworkConfig {
  /** Framework identifier */
  name: string;
  /** Display name for UI */
  displayName: string;
  /** File patterns to detect this framework */
  detection: string[];
  /** Framework-specific rules text */
  rules: string;
  /** Code review deduction items */
  deductions: ReviewDeduction[];
  /** Agent configuration */
  agents: {
    /** Default agents for this framework */
    default: string[];
    /** Full mode agents */
    fullMode: string[];
  };
  /** Test configuration */
  testing?: {
    /** Test framework */
    framework: string;
    /** Test command */
    command: string;
    /** Test directory */
    directory: string;
  };
}

/**
 * Combined rules for a session
 */
export interface CombinedRules {
  /** Common rules applied to all frameworks */
  common: string;
  /** Framework-specific rules */
  framework: string;
  /** All deductions for code review */
  deductions: ReviewDeduction[];
  /** Active agents */
  agents: string[];
}

/**
 * Framework detection result
 */
export interface DetectionResult {
  /** Detected framework config */
  framework: FrameworkConfig | null;
  /** Detection confidence (0-1) */
  confidence: number;
  /** Files that triggered detection */
  matchedFiles: string[];
}
