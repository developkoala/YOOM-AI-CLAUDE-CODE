/**
 * Yoom Session State Management
 *
 * Handles session persistence to .yoom-session.md file.
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import type {
  YoomSession,
  YoomFeature,
  CreateSessionOptions,
  UpdateSessionOptions,
  FeatureStep,
} from './types.js';
import { getAgentsForFramework, FEATURE_STEP_ORDER } from './types.js';

/** Session file name */
export const SESSION_FILE = '.yoom-session.md';

/** Current session version */
export const SESSION_VERSION = '1.0.0';

/**
 * Check if a session exists
 */
export function hasExistingSession(cwd: string): boolean {
  return existsSync(join(cwd, SESSION_FILE));
}

/**
 * Get session file path
 */
export function getSessionFilePath(cwd: string): string {
  return join(cwd, SESSION_FILE);
}

/**
 * Parse session from markdown content
 */
function parseSessionMarkdown(content: string): YoomSession | null {
  try {
    // Extract JSON from markdown code block
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) return null;

    const data = JSON.parse(jsonMatch[1]);
    return data as YoomSession;
  } catch {
    return null;
  }
}

/**
 * Format session to markdown content
 */
function formatSessionMarkdown(session: YoomSession): string {
  const lines: string[] = [];

  lines.push('# Yoom Session');
  lines.push('');
  lines.push(`> Created: ${session.createdAt}`);
  lines.push(`> Last Activity: ${session.lastActivityAt}`);
  lines.push('');

  // Configuration summary
  lines.push('## Configuration');
  lines.push('');
  lines.push(`- **Project Type**: ${session.config.projectType}`);
  lines.push(`- **Framework**: ${session.config.framework}`);
  lines.push(`- **Mode**: ${session.config.mode}`);
  lines.push(`- **Scope**: ${session.config.scope}`);
  lines.push(`- **Agents**: ${session.config.agents.join(', ')}`);
  lines.push('');

  // Discovery results
  if (session.discovery) {
    lines.push('## Discovery Results');
    lines.push('');
    lines.push(`- **Purpose**: ${session.discovery.purpose}`);
    lines.push(`- **Tech Stack**: ${session.discovery.techStack.join(', ')}`);
    if (session.discovery.constraints.length > 0) {
      lines.push(`- **Constraints**: ${session.discovery.constraints.join(', ')}`);
    }
    if (session.discovery.requirements.length > 0) {
      lines.push('- **Requirements**:');
      session.discovery.requirements.forEach(req => {
        lines.push(`  - ${req}`);
      });
    }
    lines.push('');
  }

  // Features
  lines.push('## Features');
  lines.push('');
  if (session.features.length === 0) {
    lines.push('_No features defined yet._');
  } else {
    session.features.forEach((feature, index) => {
      const isCurrent = index === session.currentFeatureIndex;
      const statusIcon = feature.status === 'completed' ? '✅'
        : feature.status === 'in_progress' ? '🔄'
        : '⏳';
      const currentMarker = isCurrent ? ' 👈 CURRENT' : '';

      lines.push(`### ${index + 1}. ${feature.name}${currentMarker}`);
      lines.push('');
      lines.push(`${statusIcon} **Status**: ${feature.status}`);
      if (feature.currentStep) {
        lines.push(`📍 **Current Step**: ${feature.currentStep}`);
      }
      if (feature.description) {
        lines.push(`📝 ${feature.description}`);
      }
      lines.push('');

      // Step progress
      if (feature.completedSteps.length > 0 || feature.currentStep) {
        lines.push('**Progress**:');
        FEATURE_STEP_ORDER.forEach(step => {
          const isCompleted = feature.completedSteps.includes(step);
          const isCurrent = feature.currentStep === step;
          const icon = isCompleted ? '✅' : isCurrent ? '🔄' : '⬜';
          lines.push(`- ${icon} ${step}`);
        });
        lines.push('');
      }

      // Notes
      if (feature.notes.length > 0) {
        lines.push('**Notes**:');
        feature.notes.forEach(note => {
          lines.push(`- ${note}`);
        });
        lines.push('');
      }
    });
  }

  // Session notes
  if (session.notes.length > 0) {
    lines.push('## Session Notes');
    lines.push('');
    session.notes.forEach(note => {
      lines.push(`- ${note}`);
    });
    lines.push('');
  }

  // JSON data for parsing
  lines.push('---');
  lines.push('');
  lines.push('<!-- Session Data (DO NOT EDIT) -->');
  lines.push('```json');
  lines.push(JSON.stringify(session, null, 2));
  lines.push('```');

  return lines.join('\n');
}

/**
 * Load session from file
 */
export function loadSession(cwd: string): YoomSession | null {
  const filePath = getSessionFilePath(cwd);
  if (!existsSync(filePath)) return null;

  try {
    const content = readFileSync(filePath, 'utf-8');
    return parseSessionMarkdown(content);
  } catch {
    return null;
  }
}

/**
 * Save session to file
 */
export function saveSession(cwd: string, session: YoomSession): void {
  const content = formatSessionMarkdown(session);
  writeFileSync(getSessionFilePath(cwd), content, 'utf-8');
}

/**
 * Delete session file
 */
export function deleteSession(cwd: string): void {
  const filePath = getSessionFilePath(cwd);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

/**
 * Create a new session
 */
export function createSession(
  cwd: string,
  options: CreateSessionOptions
): YoomSession {
  const now = new Date().toISOString();
  const agents = options.agents ??
    getAgentsForFramework(options.framework, options.mode);

  const session: YoomSession = {
    version: SESSION_VERSION,
    createdAt: now,
    lastActivityAt: now,
    config: {
      projectType: options.projectType,
      framework: options.framework,
      mode: options.mode,
      agents,
      scope: options.scope ?? 'all',
    },
    features: [],
    currentFeatureIndex: -1,
    notes: [],
  };

  saveSession(cwd, session);
  return session;
}

/**
 * Update session
 */
export function updateSession(
  cwd: string,
  updates: UpdateSessionOptions
): YoomSession | null {
  const session = loadSession(cwd);
  if (!session) return null;

  const now = new Date().toISOString();
  session.lastActivityAt = now;

  // Add feature
  if (updates.addFeature) {
    const feature: YoomFeature = {
      ...updates.addFeature,
      completedSteps: [],
      createdAt: now,
      updatedAt: now,
    };
    session.features.push(feature);

    // Set as current if first feature
    if (session.features.length === 1) {
      session.currentFeatureIndex = 0;
    }
  }

  // Update feature
  if (
    updates.updateFeatureIndex !== undefined &&
    updates.featureUpdate &&
    session.features[updates.updateFeatureIndex]
  ) {
    const feature = session.features[updates.updateFeatureIndex];
    Object.assign(feature, updates.featureUpdate, { updatedAt: now });
  }

  // Set current feature
  if (updates.setCurrentFeature !== undefined) {
    session.currentFeatureIndex = updates.setCurrentFeature;
  }

  // Add note
  if (updates.addNote) {
    session.notes.push(`[${now}] ${updates.addNote}`);
  }

  // Update discovery
  if (updates.discovery) {
    session.discovery = updates.discovery;
  }

  saveSession(cwd, session);
  return session;
}

/**
 * Mark current step as complete and move to next
 */
export function completeCurrentStep(cwd: string): {
  session: YoomSession;
  nextStep: FeatureStep | null;
  featureCompleted: boolean;
} | null {
  const session = loadSession(cwd);
  if (!session) return null;

  const feature = session.features[session.currentFeatureIndex];
  if (!feature || !feature.currentStep) return null;

  const now = new Date().toISOString();
  session.lastActivityAt = now;

  // Mark current step as completed
  if (!feature.completedSteps.includes(feature.currentStep)) {
    feature.completedSteps.push(feature.currentStep);
  }
  feature.updatedAt = now;

  // Find next step
  const currentIndex = FEATURE_STEP_ORDER.indexOf(feature.currentStep);
  const nextStep = currentIndex < FEATURE_STEP_ORDER.length - 1
    ? FEATURE_STEP_ORDER[currentIndex + 1]
    : null;

  if (nextStep) {
    feature.currentStep = nextStep;
  } else {
    // Feature completed
    feature.status = 'completed';
    feature.currentStep = undefined;
  }

  saveSession(cwd, session);

  return {
    session,
    nextStep,
    featureCompleted: !nextStep,
  };
}

/**
 * Start working on next feature
 */
export function startNextFeature(cwd: string): YoomSession | null {
  const session = loadSession(cwd);
  if (!session) return null;

  // Find next pending feature
  const nextIndex = session.features.findIndex(
    (f, i) => i > session.currentFeatureIndex && f.status === 'pending'
  );

  if (nextIndex === -1) return null;

  const now = new Date().toISOString();
  session.lastActivityAt = now;
  session.currentFeatureIndex = nextIndex;

  const feature = session.features[nextIndex];
  feature.status = 'in_progress';
  feature.currentStep = 'DEVELOP';
  feature.updatedAt = now;

  saveSession(cwd, session);
  return session;
}

/**
 * Get session summary for display
 */
export function getSessionSummary(session: YoomSession): string {
  const lines: string[] = [];

  lines.push(`Framework: ${session.config.framework}`);
  lines.push(`Mode: ${session.config.mode}`);
  lines.push(`Agents: ${session.config.agents.length}`);

  const completed = session.features.filter(f => f.status === 'completed').length;
  const inProgress = session.features.filter(f => f.status === 'in_progress').length;
  const pending = session.features.filter(f => f.status === 'pending').length;

  lines.push(`Features: ${completed}/${session.features.length} completed`);

  if (inProgress > 0) {
    const current = session.features[session.currentFeatureIndex];
    if (current) {
      lines.push(`Current: ${current.name} (${current.currentStep ?? 'DEVELOP'})`);
    }
  }

  if (pending > 0) {
    lines.push(`Pending: ${pending} features`);
  }

  return lines.join('\n');
}
