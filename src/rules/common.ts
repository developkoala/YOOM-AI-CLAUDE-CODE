/**
 * Common Rules - Applied to All Frameworks
 *
 * Core principles extracted from yoom-bot.md:
 * - Function Purity
 * - Unidirectional Data Flow
 * - Declarative Programming
 */

import type { ReviewDeduction } from './types.js';

/**
 * Common rules text for system prompt injection
 */
export const commonRules = `
## [01] Function Purity (25 points)

### Principle
Side effects only at entry points; business logic as pure functions.

### Rules
✅ DO:
- Keep business logic pure (no I/O, no state mutation)
- Side effects ONLY at: API handlers, event handlers, main()
- Test with input/output only, no mocking

❌ DON'T:
- Direct DB calls inside business logic
- Parameter mutation
- Hidden state dependencies

### Example
\`\`\`typescript
// ❌ BAD: Side effect in business logic
function calculateDiscount(userId: string): number {
  const user = db.getUser(userId);  // Side effect!
  return user.isPremium ? 0.2 : 0;
}

// ✅ GOOD: Pure function, side effect at entry point
function calculateDiscount(user: User): number {
  return user.isPremium ? 0.2 : 0;
}

// Entry point handles I/O
async function handleDiscountRequest(userId: string) {
  const user = await db.getUser(userId);  // Side effect here only
  return calculateDiscount(user);
}
\`\`\`

---

## [02] Unidirectional Data Flow (25 points) [Frontend Only]

### Principle
State → View → Event → Update (reverse NEVER allowed)

### Rules
✅ DO:
- State flows DOWN (parent → child)
- Events flow UP (child → parent via callbacks)
- Single source of truth

❌ ZERO TOLERANCE:
- Props mutation
- Global state access bypassing props
- Ref bypass for data flow
- Two-way binding patterns

### Example
\`\`\`typescript
// ❌ BAD: Mutating props
function ChildComponent({ items }: Props) {
  items.push(newItem);  // NEVER!
}

// ✅ GOOD: Event flows up
function ChildComponent({ items, onAdd }: Props) {
  return <button onClick={() => onAdd(newItem)}>Add</button>;
}
\`\`\`

---

## [03] Declarative Programming (25 points) [Critical for AI!]

### Why This Matters
- Reduces tokens/context for AI comprehension
- Self-documenting code via function names
- Eliminates "how" code, keeps only "what"

### Transformations

#### if/else → Object Lookup
\`\`\`typescript
// ❌ Procedural
if (type === 'A') return 1;
else if (type === 'B') return 2;
else if (type === 'C') return 3;

// ✅ Declarative
const TYPE_VALUES = { A: 1, B: 2, C: 3 };
return TYPE_VALUES[type] ?? 0;
\`\`\`

#### Loops → Array Methods
\`\`\`typescript
// ❌ Procedural
const results = [];
for (let i = 0; i < items.length; i++) {
  if (items[i].active) results.push(items[i]);
}

// ✅ Declarative
const results = items.filter(item => item.isActive);
\`\`\`

#### Nested Conditions → Guard Clauses + Named Predicates
\`\`\`typescript
// ❌ Nested
if (a) {
  if (b) {
    if (c) {
      // logic
    }
  }
}

// ✅ Guard clauses
if (!a) return;
if (!b) return;
if (!c) return;
// logic (flat)
\`\`\`

#### Boolean Logic → Named Predicates
\`\`\`typescript
// ❌ Anonymous
if (user.role === 'admin' && user.verified && !user.banned) { }

// ✅ Named
const isActiveAdmin = (u: User) =>
  u.role === 'admin' && u.verified && !u.banned;
if (isActiveAdmin(user)) { }
\`\`\`

---

## [04] Senior Debugging Mindset (15 points)

### Rule
Root cause first, fix second. Never patch symptoms.

### Checklist
1. **Reproduce**: Can you trigger the bug consistently?
2. **Isolate**: Where exactly does it fail?
3. **Root Cause**: WHY does it fail? (not WHERE)
4. **Fix**: Address the root cause, not symptoms
5. **Verify**: Does the fix work? No regressions?

### Example
\`\`\`
Bug: "Button doesn't work sometimes"

❌ Junior: Add retry logic, increase timeout

✅ Senior:
1. When exactly? → On rapid clicks
2. Why? → Race condition in state update
3. Fix: Debounce or disable during async operation
\`\`\`

---

## [05] Code Structure (10 points)

### Rules
- Max function length: 20 lines
- Max nesting depth: 2 levels
- Single responsibility per function
- Named exports over default exports
- Consistent naming: camelCase functions, PascalCase components/classes

---

## [06] Testing Principles

### Test Types
| Type | Purpose | Coverage |
|------|---------|----------|
| Unit Test | Core business logic | Pure functions |
| Integration Test | Feature integration | Service + Repository |
| E2E Test | Critical user flows | Full stack |

### Test Structure
\`\`\`typescript
// tests/[feature]/[unit].test.ts

describe('OrderService', () => {
  describe('calculateTotal', () => {
    it('should return sum of item prices', () => {
      // Arrange
      const items = [{ price: 100 }, { price: 200 }];

      // Act
      const result = calculateTotal(items);

      // Assert
      expect(result).toBe(300);
    });

    it('should return 0 for empty items', () => {
      expect(calculateTotal([])).toBe(0);
    });

    it('should handle negative prices', () => {
      const items = [{ price: 100 }, { price: -50 }];
      expect(calculateTotal(items)).toBe(50);
    });
  });
});
\`\`\`

### Pure Function Testing (No Mocking Required)
\`\`\`typescript
// ✅ Pure function = Easy to test
const calculateDiscount = (user: User): number =>
  user.isPremium ? 0.2 : 0;

// Test without mocking
expect(calculateDiscount({ isPremium: true })).toBe(0.2);
expect(calculateDiscount({ isPremium: false })).toBe(0);

// ❌ Impure function = Requires mocking
const calculateDiscount = async (userId: string): Promise<number> => {
  const user = await db.getUser(userId);  // Needs mock!
  return user.isPremium ? 0.2 : 0;
};
\`\`\`

### Test Coverage Requirements
\`\`\`
✅ Normal case (happy path)
✅ Edge cases (empty, null, boundary values)
✅ Error cases (invalid input, exceptions)
✅ Each if/else branch
\`\`\`

---

## [07] Flow Documentation

### Per-Feature Documentation
\`\`\`markdown
# [feature]-flow.md

## Feature: [Feature Name]

### Data Flow Diagram
UI Event → Request → Router → Middleware → Service → Handler → Response → UI Update

### Function Chain
handleClick
  ├─ validateInput
  ├─ transformData
  │   ├─ normalizeField1
  │   └─ normalizeField2
  └─ submitRequest
      ├─ callAPI
      └─ handleResponse

### Data Transformation
// Step 1: UI Input
{ email: "user@example.com", password: "secret123" }

// Step 2: Validated
{ email: "user@example.com", password: "secret123", isValid: true }

// Step 3: API Response
{ token: "jwt_token", user: { id: 1, name: "User" } }

### Error Handling
ValidationError → showErrorToast() → resetForm()
NetworkError → showOfflineMessage() → retryLater()
\`\`\`

---

## [08] 1-Cycle Development Workflow

### The Cycle
\`\`\`
1 Cycle = Implementation → Debug → Refactor → Commit
\`\`\`

### Phase 1: Implementation
- Focus on making it work
- Procedural code is OK initially
- Don't optimize prematurely

### Phase 2: Debug
- Use breakpoints (not console.log)
- Test all cases (normal, edge, error)
- Verify expected behavior

### Phase 3: Refactor (CRITICAL)
\`\`\`
✅ Convert procedural → declarative
✅ Extract named predicates
✅ Replace if/else → object lookup
✅ Replace loops → array methods
✅ Split functions > 20 lines
✅ Flatten nesting > 2 levels
\`\`\`

### Phase 4: Commit
\`\`\`bash
git commit -m "feat: implement [feature] (declarative)"
\`\`\`

### Why This Matters for AI
\`\`\`
Procedural: AI reads 500 lines → ~2000 tokens
Declarative: AI reads 10 lines → ~50 tokens

Savings: 97.5% token reduction
\`\`\`
`;

/**
 * Common deductions for code review
 */
export const commonDeductions: ReviewDeduction[] = [
  // Function Purity (25 points)
  {
    code: 'PURE-1',
    description: 'Side effect in business logic (DB call, API call, file I/O)',
    points: 10,
    category: 'purity',
  },
  {
    code: 'PURE-2',
    description: 'Parameter mutation',
    points: 8,
    category: 'purity',
  },
  {
    code: 'PURE-3',
    description: 'Hidden state dependency (global variable access)',
    points: 7,
    category: 'purity',
  },

  // Unidirectional Data (25 points)
  {
    code: 'UNI-1',
    description: 'Props mutation (ZERO TOLERANCE)',
    points: 15,
    category: 'unidirectional',
  },
  {
    code: 'UNI-2',
    description: 'Global state bypass (accessing context/store incorrectly)',
    points: 10,
    category: 'unidirectional',
  },

  // Declarative Code (25 points)
  {
    code: 'DECL-1',
    description: 'if/else chain (3+ conditions) instead of object lookup',
    points: 8,
    category: 'declarative',
  },
  {
    code: 'DECL-2',
    description: 'Imperative loop instead of array method',
    points: 5,
    category: 'declarative',
  },
  {
    code: 'DECL-3',
    description: 'Nested conditions (3+ levels) without guard clauses',
    points: 7,
    category: 'declarative',
  },
  {
    code: 'DECL-4',
    description: 'Anonymous boolean logic instead of named predicate',
    points: 5,
    category: 'declarative',
  },

  // Debugging (15 points)
  {
    code: 'DEBUG-1',
    description: 'Symptom patch without root cause analysis',
    points: 10,
    category: 'debugging',
  },
  {
    code: 'DEBUG-2',
    description: 'Missing error boundary/handling',
    points: 5,
    category: 'debugging',
  },
  {
    code: 'DEBUG-3',
    description: 'console.log/dd()/println! spam (use breakpoints)',
    points: 5,
    category: 'debugging',
  },

  // Structure (10 points)
  {
    code: 'STRUCT-1',
    description: 'Function longer than 20 lines',
    points: 3,
    category: 'structure',
  },
  {
    code: 'STRUCT-2',
    description: 'Nesting deeper than 2 levels',
    points: 4,
    category: 'structure',
  },
  {
    code: 'STRUCT-3',
    description: 'Inconsistent naming convention',
    points: 3,
    category: 'structure',
  },
];

/**
 * TypeScript-specific deductions
 */
export const typescriptDeductions: ReviewDeduction[] = [
  {
    code: 'TS-1',
    description: 'Missing readonly on interface properties',
    points: 5,
    category: 'typescript',
  },
  {
    code: 'TS-2',
    description: 'Using any type instead of unknown with type guard',
    points: 8,
    category: 'typescript',
  },
  {
    code: 'TS-3',
    description: 'Type assertion without validation (as Type)',
    points: 6,
    category: 'typescript',
  },
  {
    code: 'TS-4',
    description: 'Missing exhaustive check with never in switch',
    points: 4,
    category: 'typescript',
  },
  {
    code: 'TS-5',
    description: 'Missing explicit return type on function',
    points: 3,
    category: 'typescript',
  },
];

/**
 * React/Next.js-specific deductions
 */
export const reactDeductions: ReviewDeduction[] = [
  {
    code: 'REACT-1',
    description: 'useEffect with 3+ dependencies',
    points: 8,
    category: 'react',
  },
  {
    code: 'REACT-2',
    description: 'Calculation in useEffect instead of useMemo',
    points: 6,
    category: 'react',
  },
  {
    code: 'REACT-3',
    description: 'Missing Presentational/Container separation',
    points: 5,
    category: 'react',
  },
  {
    code: 'REACT-4',
    description: 'Missing Suspense or ErrorBoundary',
    points: 4,
    category: 'react',
  },
  {
    code: 'REACT-5',
    description: 'Missing readonly on Props interface',
    points: 5,
    category: 'react',
  },
];

/**
 * Backend-specific deductions (Rails, Laravel, FastAPI)
 */
export const backendDeductions: ReviewDeduction[] = [
  {
    code: 'BE-1',
    description: 'Fat controller (business logic in controller)',
    points: 10,
    category: 'backend',
  },
  {
    code: 'BE-2',
    description: 'N+1 query (missing eager loading)',
    points: 8,
    category: 'backend',
  },
  {
    code: 'BE-3',
    description: 'Missing Service/Action layer for business logic',
    points: 6,
    category: 'backend',
  },
];

/**
 * Security-specific deductions (Electron, Tauri)
 */
export const securityDeductions: ReviewDeduction[] = [
  {
    code: 'SEC-1',
    description: 'nodeIntegration: true or contextIsolation: false',
    points: 15,
    category: 'security',
  },
  {
    code: 'SEC-2',
    description: 'Unvalidated path in file operations',
    points: 10,
    category: 'security',
  },
  {
    code: 'SEC-3',
    description: 'panic!/unwrap() in Rust command instead of Result',
    points: 8,
    category: 'security',
  },
];

/**
 * Testing-specific deductions
 */
export const testingDeductions: ReviewDeduction[] = [
  {
    code: 'TEST-1',
    description: 'Missing test for pure function',
    points: 5,
    category: 'testing',
  },
  {
    code: 'TEST-2',
    description: 'Mocking when pure function would eliminate need',
    points: 4,
    category: 'testing',
  },
  {
    code: 'TEST-3',
    description: 'Missing edge case coverage (empty, null, boundary)',
    points: 3,
    category: 'testing',
  },
  {
    code: 'TEST-4',
    description: 'Missing error case test',
    points: 3,
    category: 'testing',
  },
];

/**
 * Workflow-specific deductions
 */
export const workflowDeductions: ReviewDeduction[] = [
  {
    code: 'FLOW-1',
    description: 'Missing flow documentation for complex feature',
    points: 5,
    category: 'workflow',
  },
  {
    code: 'FLOW-2',
    description: 'Procedural code not refactored after implementation',
    points: 8,
    category: 'workflow',
  },
  {
    code: 'FLOW-3',
    description: 'Missing function chain documentation',
    points: 3,
    category: 'workflow',
  },
];

/**
 * Get all deductions by framework type
 */
export function getDeductionsForFramework(framework: string): ReviewDeduction[] {
  const allDeductions = [...commonDeductions];

  // Add TypeScript deductions for TS-based frameworks
  if (['typescript', 'nextjs', 'electron', 'tauri', 'automation'].includes(framework)) {
    allDeductions.push(...typescriptDeductions);
  }

  // Add React deductions for React-based frameworks
  if (['nextjs'].includes(framework)) {
    allDeductions.push(...reactDeductions);
  }

  // Add backend deductions
  if (['rails', 'laravel', 'fastapi'].includes(framework)) {
    allDeductions.push(...backendDeductions);
  }

  // Add security deductions
  if (['electron', 'tauri'].includes(framework)) {
    allDeductions.push(...securityDeductions);
  }

  // Always include testing and workflow deductions
  allDeductions.push(...testingDeductions);
  allDeductions.push(...workflowDeductions);

  return allDeductions;
}
