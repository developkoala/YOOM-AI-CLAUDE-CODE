/**
 * Rules Module - Framework Detection and Rule Loading
 *
 * Provides framework auto-detection and combined rules for Yoom workflow.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { readFileSync } from 'fs';

import type {
  FrameworkConfig,
  CombinedRules,
  DetectionResult,
  ReviewDeduction,
} from './types.js';
import { commonRules, commonDeductions } from './common.js';
import { nextjsConfig } from './nextjs.js';
import { railsConfig } from './rails.js';
import { laravelConfig } from './laravel.js';
import { electronConfig } from './electron.js';
import { fastapiConfig } from './fastapi.js';
import { tauriConfig } from './tauri.js';
import { automationConfig } from './automation.js';

// Re-export types
export * from './types.js';
export { commonRules, commonDeductions } from './common.js';

/**
 * All available framework configurations
 */
export const FRAMEWORK_CONFIGS: Record<string, FrameworkConfig> = {
  nextjs: nextjsConfig,
  rails: railsConfig,
  laravel: laravelConfig,
  electron: electronConfig,
  fastapi: fastapiConfig,
  tauri: tauriConfig,
  automation: automationConfig,
};

/**
 * Framework detection order (most specific first)
 */
const DETECTION_ORDER: string[] = [
  'tauri',     // Check Tauri before generic patterns
  'electron',  // Check Electron before generic patterns
  'nextjs',    // Check Next.js (has specific config files)
  'laravel',   // Check Laravel (has artisan file)
  'rails',     // Check Rails (has Gemfile)
  'fastapi',   // Check FastAPI (Python project)
  'automation', // Generic automation/CLI (fallback)
];

/**
 * Check if a file exists in the project
 */
function fileExists(projectRoot: string, relativePath: string): boolean {
  return existsSync(join(projectRoot, relativePath));
}

/**
 * Check if package.json contains a specific dependency
 */
function hasDependency(projectRoot: string, depName: string): boolean {
  const packageJsonPath = join(projectRoot, 'package.json');
  if (!existsSync(packageJsonPath)) return false;

  try {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    return !!(
      pkg.dependencies?.[depName] ||
      pkg.devDependencies?.[depName]
    );
  } catch {
    return false;
  }
}

/**
 * Check if composer.json contains a specific package
 */
function hasComposerPackage(projectRoot: string, packageName: string): boolean {
  const composerPath = join(projectRoot, 'composer.json');
  if (!existsSync(composerPath)) return false;

  try {
    const content = readFileSync(composerPath, 'utf-8');
    const composer = JSON.parse(content);
    return !!(
      composer.require?.[packageName] ||
      composer['require-dev']?.[packageName]
    );
  } catch {
    return false;
  }
}

/**
 * Check if requirements.txt contains a package
 */
function hasPythonPackage(projectRoot: string, packageName: string): boolean {
  const requirementsPath = join(projectRoot, 'requirements.txt');
  if (!existsSync(requirementsPath)) return false;

  try {
    const content = readFileSync(requirementsPath, 'utf-8');
    return content.toLowerCase().includes(packageName.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Framework-specific detection functions
 */
const FRAMEWORK_DETECTORS: Record<string, (projectRoot: string) => boolean> = {
  nextjs: (root) =>
    fileExists(root, 'next.config.js') ||
    fileExists(root, 'next.config.mjs') ||
    fileExists(root, 'next.config.ts') ||
    (fileExists(root, 'app/layout.tsx') && hasDependency(root, 'next')),

  electron: (root) =>
    fileExists(root, 'electron-builder.json') ||
    fileExists(root, 'electron-builder.yml') ||
    fileExists(root, 'electron.vite.config.ts') ||
    hasDependency(root, 'electron'),

  tauri: (root) =>
    fileExists(root, 'src-tauri/tauri.conf.json') ||
    fileExists(root, 'src-tauri/Cargo.toml'),

  rails: (root) =>
    fileExists(root, 'Gemfile') &&
    fileExists(root, 'config/routes.rb') &&
    fileExists(root, 'app/controllers/application_controller.rb'),

  laravel: (root) =>
    fileExists(root, 'artisan') &&
    fileExists(root, 'composer.json') &&
    hasComposerPackage(root, 'laravel/framework'),

  fastapi: (root) =>
    (fileExists(root, 'requirements.txt') || fileExists(root, 'pyproject.toml')) &&
    (hasPythonPackage(root, 'fastapi') || fileExists(root, 'app/main.py')),

  automation: (root) =>
    fileExists(root, 'bin/') ||
    fileExists(root, 'cli.ts') ||
    fileExists(root, 'cli.js') ||
    fileExists(root, 'scripts/'),
};

/**
 * Detect framework from project root
 *
 * @param projectRoot - Absolute path to project root
 * @returns Detection result with framework config and confidence
 */
export function detectFramework(projectRoot: string): DetectionResult {
  const matchedFiles: string[] = [];

  for (const frameworkName of DETECTION_ORDER) {
    const detector = FRAMEWORK_DETECTORS[frameworkName];
    if (!detector) continue;

    if (detector(projectRoot)) {
      const config = FRAMEWORK_CONFIGS[frameworkName];

      // Find matched detection files
      for (const pattern of config.detection) {
        if (fileExists(projectRoot, pattern)) {
          matchedFiles.push(pattern);
        }
      }

      return {
        framework: config,
        confidence: matchedFiles.length >= 2 ? 1.0 : 0.8,
        matchedFiles,
      };
    }
  }

  return {
    framework: null,
    confidence: 0,
    matchedFiles: [],
  };
}

/**
 * Get framework config by name
 *
 * @param name - Framework name
 * @returns Framework config or null
 */
export function getFrameworkConfig(name: string): FrameworkConfig | null {
  return FRAMEWORK_CONFIGS[name] ?? null;
}

/**
 * Combine common and framework-specific rules
 *
 * @param framework - Framework config (null for common rules only)
 * @param agents - Override agent list (null to use framework defaults)
 * @param fullMode - Whether to use full mode agents
 * @returns Combined rules for system prompt
 */
export function combineRules(
  framework: FrameworkConfig | null,
  agents: string[] | null = null,
  fullMode: boolean = true
): CombinedRules {
  const deductions: ReviewDeduction[] = [...commonDeductions];
  let activeAgents: string[];

  if (framework) {
    deductions.push(...framework.deductions);
    activeAgents = agents ??
      (fullMode ? framework.agents.fullMode : framework.agents.default);
  } else {
    activeAgents = agents ?? [
      'yoom-bot',
      'code-reviewer',
      'tester',
      'git-committer',
    ];
  }

  return {
    common: commonRules,
    framework: framework?.rules ?? '',
    deductions,
    agents: activeAgents,
  };
}

/**
 * Format rules for system prompt injection
 *
 * @param rules - Combined rules
 * @returns Formatted string for system prompt
 */
export function formatRulesForPrompt(rules: CombinedRules): string {
  const sections: string[] = [];

  sections.push('# Yoom AI Coding Rules\n');
  sections.push(rules.common);

  if (rules.framework) {
    sections.push('\n---\n');
    sections.push(rules.framework);
  }

  sections.push('\n---\n');
  sections.push('## Active Agents\n');
  sections.push(rules.agents.map(a => `- ${a}`).join('\n'));

  return sections.join('\n');
}

/**
 * Get all available framework options for UI
 */
export function getFrameworkOptions(): Array<{
  name: string;
  displayName: string;
  description: string;
}> {
  return Object.values(FRAMEWORK_CONFIGS).map(config => ({
    name: config.name,
    displayName: config.displayName,
    description: `${config.agents.default.length} default agents, ${config.deductions.length} review rules`,
  }));
}

/**
 * Calculate total available deduction points for a framework
 */
export function getTotalDeductionPoints(framework: FrameworkConfig | null): number {
  let total = commonDeductions.reduce((sum, d) => sum + d.points, 0);
  if (framework) {
    total += framework.deductions.reduce((sum, d) => sum + d.points, 0);
  }
  return total;
}
