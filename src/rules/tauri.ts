/**
 * Tauri Framework Rules
 *
 * Rust backend + TypeScript frontend with command patterns
 */

import type { FrameworkConfig, ReviewDeduction } from './types.js';

const tauriRules = `
## Tauri Rules

### Directory Structure
\`\`\`
src/                        # Frontend (TypeScript/React)
├── App.tsx
├── features/
├── shared/
└── lib/
    └── tauri.ts           # Tauri command wrappers

src-tauri/                  # Backend (Rust)
├── src/
│   ├── main.rs            # Entry point
│   ├── lib.rs             # Library
│   ├── commands/          # Tauri commands
│   │   ├── mod.rs
│   │   └── file.rs
│   ├── state/             # App state
│   └── utils/
├── Cargo.toml
└── tauri.conf.json
\`\`\`

### Tauri Command Pattern (Rust)
\`\`\`rust
// src-tauri/src/commands/file.rs
use tauri::State;
use crate::state::AppState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub size: u64,
    pub modified: String,
}

#[derive(Debug, Serialize)]
pub struct CommandError {
    pub message: String,
    pub code: String,
}

// Result type for commands
type CommandResult<T> = Result<T, CommandError>;

#[tauri::command]
pub async fn read_file(
    path: String,
    state: State<'_, AppState>,
) -> CommandResult<String> {
    // Validate path
    let safe_path = state.validate_path(&path)
        .map_err(|e| CommandError {
            message: e.to_string(),
            code: "INVALID_PATH".to_string(),
        })?;

    // Read file
    std::fs::read_to_string(safe_path)
        .map_err(|e| CommandError {
            message: e.to_string(),
            code: "READ_ERROR".to_string(),
        })
}

#[tauri::command]
pub async fn write_file(
    path: String,
    content: String,
    state: State<'_, AppState>,
) -> CommandResult<bool> {
    let safe_path = state.validate_path(&path)?;
    std::fs::write(safe_path, content)
        .map_err(|e| CommandError {
            message: e.to_string(),
            code: "WRITE_ERROR".to_string(),
        })?;
    Ok(true)
}
\`\`\`

### Command Registration
\`\`\`rust
// src-tauri/src/main.rs
mod commands;
mod state;

use commands::file::{read_file, write_file};
use state::AppState;

fn main() {
    tauri::Builder::default()
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
        ])
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
\`\`\`

### Frontend Invocation (TypeScript)
\`\`\`typescript
// src/lib/tauri.ts
import { invoke } from '@tauri-apps/api/tauri';

interface FileInfo {
  name: string;
  size: number;
  modified: string;
}

interface CommandError {
  message: string;
  code: string;
}

// Type-safe command wrappers
export const tauriCommands = {
  async readFile(path: string): Promise<string> {
    return invoke<string>('read_file', { path });
  },

  async writeFile(path: string, content: string): Promise<boolean> {
    return invoke<boolean>('write_file', { path, content });
  },
};

// Error handling wrapper
export async function safeInvoke<T>(
  command: () => Promise<T>
): Promise<{ data?: T; error?: CommandError }> {
  try {
    const data = await command();
    return { data };
  } catch (error) {
    return { error: error as CommandError };
  }
}
\`\`\`

### React Hook Usage
\`\`\`typescript
// src/features/files/useFileOperations.ts
import { useState } from 'react';
import { tauriCommands, safeInvoke } from '../../lib/tauri';

export function useFileOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readFile = async (path: string) => {
    setLoading(true);
    setError(null);

    const { data, error } = await safeInvoke(() =>
      tauriCommands.readFile(path)
    );

    setLoading(false);

    if (error) {
      setError(error.message);
      return null;
    }

    return data;
  };

  return { readFile, loading, error };
}
\`\`\`

### Security Configuration
\`\`\`json
// tauri.conf.json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "scope": ["$APPDATA/*", "$DOCUMENT/*"]
      },
      "shell": {
        "all": false
      },
      "dialog": {
        "all": true
      }
    },
    "security": {
      "csp": "default-src 'self'"
    }
  }
}
\`\`\`

### Forbidden Patterns
- ❌ allowlist.all: true
- ❌ Unscoped filesystem access
- ❌ Missing path validation in commands
- ❌ Panics in commands (use Result)
- ❌ Blocking async runtime
`;

const tauriDeductions: ReviewDeduction[] = [
  {
    code: 'TAURI-1',
    description: 'allowlist.all enabled (security risk)',
    points: 15,
    category: 'framework',
  },
  {
    code: 'TAURI-2',
    description: 'Unscoped filesystem access',
    points: 10,
    category: 'framework',
  },
  {
    code: 'TAURI-3',
    description: 'Missing path validation in Rust command',
    points: 10,
    category: 'framework',
  },
  {
    code: 'TAURI-4',
    description: 'Using panic! instead of Result in command',
    points: 8,
    category: 'framework',
  },
  {
    code: 'TAURI-5',
    description: 'Blocking async runtime with sync operations',
    points: 7,
    category: 'framework',
  },
  {
    code: 'TAURI-6',
    description: 'Missing type-safe command wrapper in frontend',
    points: 5,
    category: 'framework',
  },
];

export const tauriConfig: FrameworkConfig = {
  name: 'tauri',
  displayName: 'Tauri',
  detection: [
    'src-tauri/tauri.conf.json',
    'src-tauri/Cargo.toml',
    'tauri.conf.json',
  ],
  rules: tauriRules,
  deductions: tauriDeductions,
  agents: {
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
  testing: {
    framework: 'playwright',
    command: 'npx playwright test',
    directory: 'e2e',
  },
};
