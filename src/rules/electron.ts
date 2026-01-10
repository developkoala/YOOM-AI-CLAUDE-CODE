/**
 * Electron Framework Rules
 *
 * Security-focused with contextBridge, IPC patterns, and Bytenode protection
 */

import type { FrameworkConfig, ReviewDeduction } from './types.js';

const electronRules = `
## Electron Rules

### Directory Structure
\`\`\`
src/
├── main/                   # Main process
│   ├── index.ts           # Entry point
│   ├── ipc/               # IPC handlers
│   │   └── handlers.ts
│   ├── services/          # Main process services
│   └── windows/           # Window management
├── preload/               # Preload scripts (bridge)
│   └── index.ts           # contextBridge API
├── renderer/              # Renderer process (React/Vue)
│   ├── App.tsx
│   ├── features/
│   └── shared/
└── shared/                # Shared types between processes
    └── types.ts

electron-builder.json      # Build configuration
\`\`\`

### Security Architecture
\`\`\`
┌──────────────────────────────────────────────────────────────┐
│  RENDERER (Sandboxed)                                        │
│  - No Node.js access                                         │
│  - No direct IPC                                             │
│  - Uses window.electronAPI only                              │
└─────────────────────────────┬────────────────────────────────┘
                              │ contextBridge (LIMITED API)
┌─────────────────────────────▼────────────────────────────────┐
│  PRELOAD (Bridge)                                            │
│  - Exposes ONLY whitelisted functions                        │
│  - Validates all inputs                                      │
└─────────────────────────────┬────────────────────────────────┘
                              │ IPC (Type-safe channels)
┌─────────────────────────────▼────────────────────────────────┐
│  MAIN (Privileged)                                           │
│  - File system access                                        │
│  - Native APIs                                               │
│  - All sensitive operations                                  │
└──────────────────────────────────────────────────────────────┘
\`\`\`

### Preload Script (contextBridge)
\`\`\`typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

// Type-safe API
const electronAPI = {
  // File operations (whitelisted only)
  readFile: (path: string) =>
    ipcRenderer.invoke('file:read', path),

  writeFile: (path: string, content: string) =>
    ipcRenderer.invoke('file:write', path, content),

  // App info
  getVersion: () => ipcRenderer.invoke('app:version'),

  // Events (one-way)
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on('update:available', callback);
    return () => ipcRenderer.removeListener('update:available', callback);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for renderer
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
\`\`\`

### IPC Handlers (Main Process)
\`\`\`typescript
// main/ipc/handlers.ts
import { ipcMain, app } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Validate paths to prevent directory traversal
function validatePath(userPath: string): string {
  const safePath = join(app.getPath('userData'), userPath);
  if (!safePath.startsWith(app.getPath('userData'))) {
    throw new Error('Invalid path');
  }
  return safePath;
}

export function registerHandlers() {
  ipcMain.handle('file:read', async (_, path: string) => {
    const safePath = validatePath(path);
    return readFile(safePath, 'utf-8');
  });

  ipcMain.handle('file:write', async (_, path: string, content: string) => {
    const safePath = validatePath(path);
    await writeFile(safePath, content, 'utf-8');
    return true;
  });

  ipcMain.handle('app:version', () => app.getVersion());
}
\`\`\`

### Renderer Usage
\`\`\`typescript
// renderer/features/files/useFileOperations.ts
export function useFileOperations() {
  const readFile = async (path: string) => {
    // Uses exposed API only - NO direct Node.js access
    return window.electronAPI.readFile(path);
  };

  const writeFile = async (path: string, content: string) => {
    return window.electronAPI.writeFile(path, content);
  };

  return { readFile, writeFile };
}
\`\`\`

### Bytenode Protection (Production)
\`\`\`javascript
// For production: compile main process to bytecode
// package.json script
"build:protected": "bytenode --compile src/main/index.js"
\`\`\`

### Security Checklist
\`\`\`
✅ nodeIntegration: false
✅ contextIsolation: true
✅ sandbox: true
✅ webSecurity: true
✅ No remote module
✅ CSP headers configured
✅ Path validation for all file operations
✅ Input validation in IPC handlers
\`\`\`

### Forbidden Patterns
- ❌ nodeIntegration: true
- ❌ contextIsolation: false
- ❌ Direct require() in renderer
- ❌ Unvalidated paths in file operations
- ❌ Exposing ipcRenderer directly
- ❌ Using remote module
`;

const electronDeductions: ReviewDeduction[] = [
  {
    code: 'ELECTRON-1',
    description: 'nodeIntegration enabled (CRITICAL security issue)',
    points: 15,
    category: 'framework',
  },
  {
    code: 'ELECTRON-2',
    description: 'contextIsolation disabled',
    points: 15,
    category: 'framework',
  },
  {
    code: 'ELECTRON-3',
    description: 'Direct ipcRenderer exposure without contextBridge',
    points: 10,
    category: 'framework',
  },
  {
    code: 'ELECTRON-4',
    description: 'Missing path validation in file operations',
    points: 10,
    category: 'framework',
  },
  {
    code: 'ELECTRON-5',
    description: 'Using remote module',
    points: 8,
    category: 'framework',
  },
  {
    code: 'ELECTRON-6',
    description: 'Missing input validation in IPC handlers',
    points: 7,
    category: 'framework',
  },
];

export const electronConfig: FrameworkConfig = {
  name: 'electron',
  displayName: 'Electron',
  detection: [
    'electron-builder.json',
    'electron-builder.yml',
    'electron.vite.config.ts',
    'src/main/index.ts',
    'src/preload/index.ts',
  ],
  rules: electronRules,
  deductions: electronDeductions,
  agents: {
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
  testing: {
    framework: 'playwright',
    command: 'npx playwright test',
    directory: 'e2e',
  },
};
