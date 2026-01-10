/**
 * Yoom Session Types
 *
 * Type definitions for Yoom workflow session management.
 */

/**
 * Project type selection
 */
export type ProjectType = 'new' | 'existing';

/**
 * Yoom mode selection
 */
export type YoomMode = 'full' | 'custom';

/**
 * Feature workflow step
 */
export type FeatureStep =
  | 'DEVELOP'
  | 'REVIEW'
  | 'TEST'
  | 'REFACTOR'
  | 'DOCUMENT'
  | 'COMMIT';

/**
 * Feature status
 */
export type FeatureStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Discovery phase results
 */
export interface DiscoveryResult {
  /** Project purpose (production/portfolio/learning) */
  purpose: 'production' | 'portfolio' | 'learning';
  /** Tech stack (detected or specified) */
  techStack: string[];
  /** Known constraints */
  constraints: string[];
  /** Key requirements gathered */
  requirements: string[];
}

/**
 * Feature tracking
 */
export interface YoomFeature {
  /** Feature name */
  name: string;
  /** Feature description */
  description: string;
  /** Current status */
  status: FeatureStatus;
  /** Current step in workflow */
  currentStep?: FeatureStep;
  /** Step completion status */
  completedSteps: FeatureStep[];
  /** Notes/comments */
  notes: string[];
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Yoom session configuration
 */
export interface YoomSessionConfig {
  /** Project type */
  projectType: ProjectType;
  /** Framework name */
  framework: string;
  /** Yoom mode */
  mode: YoomMode;
  /** Active agents */
  agents: string[];
  /** Scope (all/backend/frontend/custom path) */
  scope: 'all' | 'backend' | 'frontend' | string;
}

/**
 * Full Yoom session state
 */
export interface YoomSession {
  /** Session version for compatibility */
  version: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last activity timestamp */
  lastActivityAt: string;
  /** Session configuration */
  config: YoomSessionConfig;
  /** Discovery phase results (if completed) */
  discovery?: DiscoveryResult;
  /** Features being worked on */
  features: YoomFeature[];
  /** Current feature index */
  currentFeatureIndex: number;
  /** Session notes */
  notes: string[];
}

/**
 * Session file format for .yoom-session.md
 */
export interface SessionFileContent {
  /** Parsed session data */
  session: YoomSession;
  /** Raw markdown content */
  rawContent: string;
}

/**
 * Options for creating a new session
 */
export interface CreateSessionOptions {
  projectType: ProjectType;
  framework: string;
  mode: YoomMode;
  agents?: string[];
  scope?: string;
}

/**
 * Options for updating a session
 */
export interface UpdateSessionOptions {
  /** Add a new feature */
  addFeature?: Omit<YoomFeature, 'createdAt' | 'updatedAt' | 'completedSteps'>;
  /** Update feature by index */
  updateFeatureIndex?: number;
  /** Feature update data */
  featureUpdate?: Partial<YoomFeature>;
  /** Set current feature index */
  setCurrentFeature?: number;
  /** Add a note */
  addNote?: string;
  /** Update discovery results */
  discovery?: DiscoveryResult;
}

/**
 * Framework agents mapping
 */
export const FRAMEWORK_AGENTS: Record<string, {
  default: string[];
  fullMode: string[];
}> = {
  nextjs: {
    default: ['yoom-bot', 'frontend-engineer'],
    fullMode: [
      'yoom-bot',
      'frontend-engineer',
      'code-reviewer',
      'tester',
      'refactorer',
      'document-writer',
      'git-committer',
    ],
  },
  rails: {
    default: ['yoom-bot', 'oracle'],
    fullMode: [
      'yoom-bot',
      'oracle',
      'code-reviewer',
      'tester',
      'refactorer',
      'document-writer',
      'git-committer',
    ],
  },
  laravel: {
    default: ['yoom-bot', 'oracle'],
    fullMode: [
      'yoom-bot',
      'oracle',
      'code-reviewer',
      'tester',
      'refactorer',
      'document-writer',
      'git-committer',
    ],
  },
  electron: {
    default: ['yoom-bot', 'frontend-engineer'],
    fullMode: [
      'yoom-bot',
      'frontend-engineer',
      'code-reviewer',
      'tester',
      'refactorer',
      'document-writer',
      'git-committer',
    ],
  },
  fastapi: {
    default: ['yoom-bot', 'oracle'],
    fullMode: [
      'yoom-bot',
      'oracle',
      'code-reviewer',
      'tester',
      'refactorer',
      'document-writer',
      'git-committer',
    ],
  },
  tauri: {
    default: ['yoom-bot', 'frontend-engineer', 'oracle'],
    fullMode: [
      'yoom-bot',
      'frontend-engineer',
      'oracle',
      'code-reviewer',
      'tester',
      'refactorer',
      'document-writer',
      'git-committer',
    ],
  },
  automation: {
    default: ['yoom-bot', 'explore'],
    fullMode: [
      'yoom-bot',
      'explore',
      'code-reviewer',
      'tester',
      'git-committer',
    ],
  },
};

/**
 * Get agents for a framework and mode
 */
export function getAgentsForFramework(
  framework: string,
  mode: YoomMode
): string[] {
  const config = FRAMEWORK_AGENTS[framework];
  if (!config) {
    // Default fallback
    return mode === 'full'
      ? ['yoom-bot', 'code-reviewer', 'tester', 'git-committer']
      : ['yoom-bot'];
  }
  return mode === 'full' ? config.fullMode : config.default;
}

/**
 * Feature step order
 */
export const FEATURE_STEP_ORDER: FeatureStep[] = [
  'DEVELOP',
  'REVIEW',
  'TEST',
  'REFACTOR',
  'DOCUMENT',
  'COMMIT',
];

/**
 * Get next step in workflow
 */
export function getNextStep(currentStep: FeatureStep): FeatureStep | null {
  const currentIndex = FEATURE_STEP_ORDER.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === FEATURE_STEP_ORDER.length - 1) {
    return null;
  }
  return FEATURE_STEP_ORDER[currentIndex + 1];
}

/**
 * Get step description for display
 */
export function getStepDescription(step: FeatureStep): string {
  const descriptions: Record<FeatureStep, string> = {
    DEVELOP: 'Implementing feature code',
    REVIEW: 'Code review and evaluation',
    TEST: 'Writing and running tests',
    REFACTOR: 'Converting to declarative patterns',
    DOCUMENT: 'Creating documentation',
    COMMIT: 'Creating git commit',
  };
  return descriptions[step];
}
