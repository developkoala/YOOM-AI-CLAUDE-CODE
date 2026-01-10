/**
 * Features Module Exports
 */

export {
  createMagicKeywordProcessor,
  detectMagicKeywords,
  builtInMagicKeywords
} from './magic-keywords.js';

export {
  createContinuationHook,
  continuationSystemPromptAddition,
  detectCompletionSignals,
  generateVerificationPrompt
} from './continuation-enforcement.js';

export {
  // Types
  type VersionMetadata,
  type ReleaseInfo,
  type UpdateCheckResult,
  type UpdateResult,
  type SilentUpdateConfig,
  // Constants
  REPO_OWNER,
  REPO_NAME,
  GITHUB_API_URL,
  GITHUB_RAW_URL,
  CLAUDE_CONFIG_DIR,
  VERSION_FILE,
  // Functions
  getInstalledVersion,
  saveVersionMetadata,
  updateLastCheckTime,
  fetchLatestRelease,
  compareVersions,
  checkForUpdates,
  performUpdate,
  formatUpdateNotification,
  shouldCheckForUpdates,
  backgroundUpdateCheck,
  interactiveUpdate,
  // Silent auto-update
  silentAutoUpdate,
  hasPendingUpdateRestart,
  clearPendingUpdateRestart,
  getPendingUpdateVersion,
  initSilentAutoUpdate
} from './auto-update.js';

// Boulder State - session/plan tracking
export {
  // Types
  type BoulderState,
  type PlanProgress,
  type PlanSummary,
  // Constants
  BOULDER_DIR,
  BOULDER_FILE,
  BOULDER_STATE_PATH,
  NOTEPAD_DIR,
  NOTEPAD_BASE_PATH,
  PROMETHEUS_PLANS_DIR,
  PLAN_EXTENSION,
  // Functions
  getBoulderFilePath,
  readBoulderState,
  writeBoulderState,
  appendSessionId,
  clearBoulderState,
  findPrometheusPlans,
  getPlanProgress,
  getPlanName,
  createBoulderState,
  getPlanSummaries,
  hasBoulder,
  getActivePlanPath
} from './boulder-state/index.js';

// Context Injector - multi-source context collection and injection
export {
  // Classes
  ContextCollector,
  contextCollector,
  // Functions
  injectPendingContext,
  injectContextIntoText,
  createContextInjectorHook,
  // Types
  type ContextSourceType,
  type ContextPriority,
  type ContextEntry,
  type RegisterContextOptions,
  type PendingContext,
  type MessageContext,
  type OutputPart,
  type InjectionStrategy,
  type InjectionResult
} from './context-injector/index.js';

// Background Agent - background task management
export {
  // Classes
  BackgroundManager,
  ConcurrencyManager,
  // Functions
  getBackgroundManager,
  resetBackgroundManager,
  // Types
  type BackgroundTask,
  type BackgroundTaskStatus,
  type BackgroundTaskConfig,
  type LaunchInput,
  type ResumeInput,
  type TaskProgress
} from './background-agent/index.js';

// Builtin Skills - bundled skill definitions
export {
  // Functions
  createBuiltinSkills,
  getBuiltinSkill,
  listBuiltinSkillNames,
  // Types
  type BuiltinSkill,
  type SkillMcpConfig,
  type SkillRegistry
} from './builtin-skills/index.js';

// Yoom Session - workflow session management
export {
  // Types
  type ProjectType,
  type YoomMode,
  type FeatureStep,
  type FeatureStatus,
  type DiscoveryResult,
  type YoomFeature,
  type YoomSessionConfig,
  type YoomSession,
  type SessionFileContent,
  type CreateSessionOptions,
  type UpdateSessionOptions,
  // Constants
  SESSION_FILE,
  SESSION_VERSION,
  FRAMEWORK_AGENTS,
  FEATURE_STEP_ORDER,
  // Functions
  getAgentsForFramework,
  getNextStep,
  getStepDescription,
  hasExistingSession,
  getSessionFilePath,
  loadSession,
  saveSession,
  deleteSession,
  createSession,
  updateSession,
  completeCurrentStep,
  startNextFeature,
  getSessionSummary
} from './yoom-session/index.js';
