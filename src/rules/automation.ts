/**
 * Automation Script Rules
 *
 * Rules for CLI tools, scripts, and automation code
 */

import type { FrameworkConfig, ReviewDeduction } from './types.js';

const automationRules = `
## Automation & Script Rules

### Directory Structure
\`\`\`
src/
├── cli/                    # CLI entry points
│   ├── index.ts           # Main CLI
│   └── commands/          # Command implementations
├── core/                   # Core logic (pure functions)
│   ├── parsers/
│   ├── transformers/
│   └── validators/
├── adapters/               # External integrations
│   ├── fs.ts              # File system
│   ├── http.ts            # HTTP client
│   └── shell.ts           # Shell execution
├── utils/                  # Utilities
│   ├── logger.ts
│   └── config.ts
└── types/                  # Type definitions

scripts/                    # Standalone scripts
tests/
\`\`\`

### CLI Pattern (Commander.js)
\`\`\`typescript
// src/cli/index.ts
import { Command } from 'commander';
import { processCommand } from './commands/process';
import { validateCommand } from './commands/validate';

const program = new Command();

program
  .name('my-tool')
  .description('Tool description')
  .version('1.0.0');

program
  .command('process')
  .description('Process files')
  .argument('<input>', 'Input file or directory')
  .option('-o, --output <path>', 'Output path')
  .option('-f, --format <type>', 'Output format', 'json')
  .action(processCommand);

program
  .command('validate')
  .description('Validate configuration')
  .argument('<config>', 'Config file path')
  .action(validateCommand);

program.parse();
\`\`\`

### Command Implementation (Pure + Adapter)
\`\`\`typescript
// src/cli/commands/process.ts
import { readInputFile, writeOutputFile } from '../../adapters/fs';
import { processData } from '../../core/transformers/process';
import { validateInput } from '../../core/validators/input';
import { logger } from '../../utils/logger';

interface ProcessOptions {
  output?: string;
  format: 'json' | 'yaml';
}

export async function processCommand(
  input: string,
  options: ProcessOptions
): Promise<void> {
  try {
    // 1. Read input (adapter)
    const rawData = await readInputFile(input);

    // 2. Validate (pure)
    const validationResult = validateInput(rawData);
    if (!validationResult.valid) {
      logger.error('Validation failed:', validationResult.errors);
      process.exit(1);
    }

    // 3. Process (pure)
    const processed = processData(validationResult.data, options.format);

    // 4. Write output (adapter)
    const outputPath = options.output ?? \`\${input}.\${options.format}\`;
    await writeOutputFile(outputPath, processed);

    logger.success(\`Processed: \${outputPath}\`);
  } catch (error) {
    logger.error('Processing failed:', error);
    process.exit(1);
  }
}
\`\`\`

### Core Logic (Pure Functions)
\`\`\`typescript
// src/core/transformers/process.ts

// Pure transformer - no I/O, no side effects
export function processData(
  data: InputData,
  format: 'json' | 'yaml'
): string {
  const transformed = transformToOutput(data);
  return formatOutput(transformed, format);
}

// Pure validator
export function validateInput(raw: unknown): ValidationResult {
  if (!isValidStructure(raw)) {
    return { valid: false, errors: ['Invalid structure'] };
  }
  return { valid: true, data: raw as InputData };
}

// Helper predicates
const isValidStructure = (data: unknown): data is InputData =>
  typeof data === 'object' && data !== null && 'required' in data;
\`\`\`

### Adapters (I/O Isolation)
\`\`\`typescript
// src/adapters/fs.ts
import { readFile, writeFile } from 'fs/promises';
import { parse as parseYaml } from 'yaml';

export async function readInputFile(path: string): Promise<unknown> {
  const content = await readFile(path, 'utf-8');

  if (path.endsWith('.yaml') || path.endsWith('.yml')) {
    return parseYaml(content);
  }

  return JSON.parse(content);
}

export async function writeOutputFile(
  path: string,
  content: string
): Promise<void> {
  await writeFile(path, content, 'utf-8');
}
\`\`\`

### Shell Execution (Safe)
\`\`\`typescript
// src/adapters/shell.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Safe shell execution with validation
export async function runCommand(
  command: string,
  args: string[]
): Promise<{ stdout: string; stderr: string }> {
  // Validate command (whitelist)
  const ALLOWED_COMMANDS = ['git', 'npm', 'node'];
  if (!ALLOWED_COMMANDS.includes(command)) {
    throw new Error(\`Command not allowed: \${command}\`);
  }

  // Escape arguments
  const escapedArgs = args.map(arg =>
    arg.replace(/["\\\`$]/g, '\\\\$&')
  );

  const fullCommand = \`\${command} \${escapedArgs.join(' ')}\`;
  return execAsync(fullCommand);
}
\`\`\`

### Error Handling Pattern
\`\`\`typescript
// src/utils/errors.ts
export class ToolError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ToolError';
  }
}

// Usage in commands
try {
  await processCommand(input, options);
} catch (error) {
  if (error instanceof ToolError) {
    logger.error(\`[\${error.code}] \${error.message}\`);
    process.exit(1);
  }
  throw error; // Unexpected error
}
\`\`\`

### Forbidden Patterns
- ❌ Business logic in CLI commands (fat commands)
- ❌ Direct I/O in core logic
- ❌ Unvalidated shell execution
- ❌ process.exit in library code (only in CLI entry)
- ❌ Hardcoded paths
`;

const automationDeductions: ReviewDeduction[] = [
  {
    code: 'AUTO-1',
    description: 'Business logic in CLI command handler',
    points: 8,
    category: 'framework',
  },
  {
    code: 'AUTO-2',
    description: 'Direct I/O in core logic (not isolated in adapter)',
    points: 7,
    category: 'framework',
  },
  {
    code: 'AUTO-3',
    description: 'Unvalidated shell command execution',
    points: 10,
    category: 'framework',
  },
  {
    code: 'AUTO-4',
    description: 'process.exit in library code',
    points: 5,
    category: 'framework',
  },
  {
    code: 'AUTO-5',
    description: 'Hardcoded paths or configuration',
    points: 5,
    category: 'framework',
  },
  {
    code: 'AUTO-6',
    description: 'Missing error handling for shell operations',
    points: 6,
    category: 'framework',
  },
];

export const automationConfig: FrameworkConfig = {
  name: 'automation',
  displayName: 'Automation/CLI',
  detection: [
    'bin/',
    'cli.ts',
    'cli.js',
    'scripts/',
  ],
  rules: automationRules,
  deductions: automationDeductions,
  agents: {
    default: ['yoom-bot', 'explore'],
    fullMode: [
      'yoom-bot',
      'explore',
      'code-reviewer',
      'tester',
      'git-committer',
    ],
  },
  testing: {
    framework: 'vitest',
    command: 'npm test',
    directory: 'tests',
  },
};
