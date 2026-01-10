/**
 * Agents Module Exports
 *
 * New modular agent system with individual files and metadata.
 * Maintains backward compatibility with definitions.ts exports.
 */

// Types
export * from './types.js';

// Utilities
export {
  createAgentToolRestrictions,
  mergeAgentConfig,
  buildDelegationTable,
  buildUseAvoidSection,
  createEnvContext,
  getAvailableAgents,
  buildKeyTriggersSection,
  validateAgentConfig,
  deepMerge
} from './utils.js';

// Individual agent exports (new modular structure)
export { oracleAgent, ORACLE_PROMPT_METADATA } from './oracle.js';
export { exploreAgent, EXPLORE_PROMPT_METADATA } from './explore.js';
export { librarianAgent, LIBRARIAN_PROMPT_METADATA } from './librarian.js';
export { yoomAiJuniorAgent, YOOM_AI_JUNIOR_PROMPT_METADATA } from './yoom-ai-junior.js';
export { frontendEngineerAgent, FRONTEND_ENGINEER_PROMPT_METADATA } from './frontend-engineer.js';
export { documentWriterAgent, DOCUMENT_WRITER_PROMPT_METADATA } from './document-writer.js';
export { multimodalLookerAgent, MULTIMODAL_LOOKER_PROMPT_METADATA } from './multimodal-looker.js';
export { momusAgent, MOMUS_PROMPT_METADATA } from './momus.js';
export { metisAgent, METIS_PROMPT_METADATA } from './metis.js';
export { orchestratorYoomAiAgent, ORCHESTRATOR_YOOM_AI_PROMPT_METADATA } from './orchestrator-yoom-ai.js';
export { prometheusAgent, PROMETHEUS_PROMPT_METADATA } from './prometheus.js';

// Yoom workflow agents (new)
export {
  yoomBotAgent,
  YOOM_BOT_PROMPT_METADATA,
  FRAMEWORK_RULES,
  generateYoomBotPrompt,
  createYoomBotAgent
} from './yoom-bot.js';
export { codeReviewerAgent, CODE_REVIEWER_PROMPT_METADATA } from './code-reviewer.js';
export { testerAgent, TESTER_PROMPT_METADATA } from './tester.js';
export { gitCommitterAgent, GIT_COMMITTER_PROMPT_METADATA } from './git-committer.js';
export { refactorerAgent, REFACTORER_PROMPT_METADATA } from './refactorer.js';

// Legacy exports (backward compatibility - getAgentDefinitions and yoomAiSystemPrompt)
export {
  getAgentDefinitions,
  yoomAiSystemPrompt
} from './definitions.js';
