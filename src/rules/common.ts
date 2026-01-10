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
