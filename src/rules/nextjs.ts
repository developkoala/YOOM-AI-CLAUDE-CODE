/**
 * Next.js Framework Rules
 *
 * App Router + Feature-Sliced Design (FSD) architecture
 */

import type { FrameworkConfig, ReviewDeduction } from './types.js';

const nextjsRules = `
## Next.js App Router Rules

### Directory Structure (FSD - Feature-Sliced Design)
\`\`\`
src/
├── app/                    # Next.js App Router (pages only)
│   ├── layout.tsx
│   ├── page.tsx
│   └── [feature]/
│       └── page.tsx
├── features/               # Feature modules (FSD)
│   └── [feature-name]/
│       ├── api/           # API calls (tanstack-query)
│       ├── ui/            # React components
│       ├── model/         # Types, stores, hooks
│       └── index.ts       # Public API
├── entities/               # Domain entities
│   └── [entity-name]/
│       ├── api/
│       ├── ui/
│       └── model/
├── shared/                 # Shared utilities
│   ├── ui/                # Base components
│   ├── lib/               # Utilities
│   └── api/               # API client
└── widgets/               # Composite components
\`\`\`

### Component Rules
\`\`\`typescript
// ✅ Server Component (default)
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchData();  // Direct async
  return <Dashboard data={data} />;
}

// ✅ Client Component (when needed)
// features/auth/ui/LoginForm.tsx
'use client';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  // interactive logic
}
\`\`\`

### Data Fetching
\`\`\`typescript
// ✅ Server: Direct fetch in Server Components
async function ServerComponent() {
  const data = await fetch('/api/data', { next: { revalidate: 60 } });
}

// ✅ Client: TanStack Query
'use client';
import { useQuery } from '@tanstack/react-query';

function ClientComponent() {
  const { data } = useQuery({ queryKey: ['data'], queryFn: fetchData });
}
\`\`\`

### API Routes
\`\`\`typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Validate, process, return
  return NextResponse.json({ users: [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Validate with Zod
  return NextResponse.json({ success: true }, { status: 201 });
}
\`\`\`

### Forbidden Patterns
- ❌ getServerSideProps/getStaticProps (use App Router patterns)
- ❌ pages/ directory mixing with app/
- ❌ Client components without 'use client'
- ❌ Fetching in useEffect without React Query
- ❌ Direct DOM manipulation
`;

const nextjsDeductions: ReviewDeduction[] = [
  {
    code: 'NEXT-1',
    description: 'Missing "use client" directive in interactive component',
    points: 8,
    category: 'framework',
  },
  {
    code: 'NEXT-2',
    description: 'Using pages/ directory patterns in App Router project',
    points: 10,
    category: 'framework',
  },
  {
    code: 'NEXT-3',
    description: 'Fetching in useEffect without React Query/SWR',
    points: 5,
    category: 'framework',
  },
  {
    code: 'NEXT-4',
    description: 'Not using Server Components where possible',
    points: 5,
    category: 'framework',
  },
  {
    code: 'NEXT-5',
    description: 'FSD layer violation (wrong import direction)',
    points: 7,
    category: 'framework',
  },
  {
    code: 'NEXT-6',
    description: 'Missing Zod validation in API routes',
    points: 5,
    category: 'framework',
  },
];

export const nextjsConfig: FrameworkConfig = {
  name: 'nextjs',
  displayName: 'Next.js (App Router)',
  detection: [
    'next.config.js',
    'next.config.mjs',
    'next.config.ts',
    'app/layout.tsx',
    'app/page.tsx',
  ],
  rules: nextjsRules,
  deductions: nextjsDeductions,
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
