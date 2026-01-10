/**
 * Yoom Session Module
 *
 * Session management for Yoom workflow orchestration.
 * Handles session persistence, feature tracking, and workflow state.
 */

// Export types
export type {
  ProjectType,
  YoomMode,
  FeatureStep,
  FeatureStatus,
  DiscoveryResult,
  YoomFeature,
  YoomSessionConfig,
  YoomSession,
  SessionFileContent,
  CreateSessionOptions,
  UpdateSessionOptions,
} from './types.js';

// Export constants and helpers
export {
  FRAMEWORK_AGENTS,
  FEATURE_STEP_ORDER,
  getAgentsForFramework,
  getNextStep,
  getStepDescription,
} from './types.js';

// Export state management
export {
  SESSION_FILE,
  SESSION_VERSION,
  hasExistingSession,
  getSessionFilePath,
  loadSession,
  saveSession,
  deleteSession,
  createSession,
  updateSession,
  completeCurrentStep,
  startNextFeature,
  getSessionSummary,
} from './state.js';
