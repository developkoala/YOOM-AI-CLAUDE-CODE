/**
 * Laravel Framework Rules
 *
 * Laravel conventions with Action Classes and Repository Pattern
 */

import type { FrameworkConfig, ReviewDeduction } from './types.js';

const laravelRules = `
## Laravel Rules

### Directory Structure
\`\`\`
app/
├── Http/
│   ├── Controllers/        # Thin controllers
│   ├── Requests/           # Form Request validation
│   ├── Resources/          # API Resources (JSON transformation)
│   └── Middleware/
├── Actions/                # Single-responsibility actions
│   └── [Feature]/
├── Models/                 # Eloquent models
├── Repositories/           # Data access layer
├── Services/               # Complex business logic
├── Policies/               # Authorization
├── Events/                 # Domain events
├── Listeners/              # Event handlers
└── Jobs/                   # Queue jobs

tests/
├── Feature/                # HTTP tests
└── Unit/                   # Unit tests
\`\`\`

### Controller Pattern (Thin Controller)
\`\`\`php
<?php

namespace App\\Http\\Controllers\\Api;

use App\\Actions\\Orders\\CreateOrderAction;
use App\\Http\\Requests\\CreateOrderRequest;
use App\\Http\\Resources\\OrderResource;

class OrderController extends Controller
{
    public function store(
        CreateOrderRequest $request,
        CreateOrderAction $action
    ): OrderResource {
        $order = $action->execute($request->validated());

        return new OrderResource($order);
    }
}
\`\`\`

### Action Class Pattern
\`\`\`php
<?php

namespace App\\Actions\\Orders;

use App\\Models\\Order;
use App\\Models\\User;
use App\\Events\\OrderCreated;

class CreateOrderAction
{
    public function __construct(
        private OrderRepository $repository,
        private InventoryService $inventory
    ) {}

    public function execute(array $data, User $user): Order
    {
        // Validate business rules
        $this->inventory->validateStock($data['items']);

        // Create order
        $order = $this->repository->create([
            'user_id' => $user->id,
            ...$data,
        ]);

        // Side effects
        event(new OrderCreated($order));

        return $order;
    }
}
\`\`\`

### Form Request Pattern
\`\`\`php
<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Order::class);
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
\`\`\`

### Repository Pattern
\`\`\`php
<?php

namespace App\\Repositories;

use App\\Models\\Order;
use Illuminate\\Contracts\\Pagination\\LengthAwarePaginator;

class OrderRepository
{
    public function __construct(private Order $model) {}

    public function create(array $data): Order
    {
        return $this->model->create($data);
    }

    public function findByUser(int $userId): LengthAwarePaginator
    {
        return $this->model
            ->where('user_id', $userId)
            ->with(['items', 'items.product'])
            ->latest()
            ->paginate();
    }
}
\`\`\`

### Model Rules
\`\`\`php
<?php

namespace App\\Models;

class Order extends Model
{
    protected $fillable = ['user_id', 'status', 'total'];

    protected $casts = [
        'total' => 'decimal:2',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes (declarative)
    public function scopeRecent(Builder $query): Builder
    {
        return $query->where('created_at', '>', now()->subWeek());
    }

    // NO business logic - use Actions
}
\`\`\`

### Forbidden Patterns
- ❌ Business logic in controllers (fat controllers)
- ❌ Validation in controllers (use Form Requests)
- ❌ Direct Eloquent in controllers (use Repositories)
- ❌ Business logic in model events
- ❌ Raw SQL without parameterization
`;

const laravelDeductions: ReviewDeduction[] = [
  {
    code: 'LARAVEL-1',
    description: 'Business logic in controller (fat controller)',
    points: 10,
    category: 'framework',
  },
  {
    code: 'LARAVEL-2',
    description: 'Validation in controller instead of Form Request',
    points: 7,
    category: 'framework',
  },
  {
    code: 'LARAVEL-3',
    description: 'Direct Eloquent in controller instead of Repository',
    points: 5,
    category: 'framework',
  },
  {
    code: 'LARAVEL-4',
    description: 'Missing Action class for complex operation',
    points: 6,
    category: 'framework',
  },
  {
    code: 'LARAVEL-5',
    description: 'N+1 query (missing eager loading)',
    points: 7,
    category: 'framework',
  },
  {
    code: 'LARAVEL-6',
    description: 'Raw SQL without parameter binding',
    points: 10,
    category: 'framework',
  },
];

export const laravelConfig: FrameworkConfig = {
  name: 'laravel',
  displayName: 'Laravel',
  detection: [
    'composer.json',
    'artisan',
    'app/Http/Kernel.php',
    'bootstrap/app.php',
  ],
  rules: laravelRules,
  deductions: laravelDeductions,
  agents: {
    default: ['yoom-bot', 'oracle'],
    fullMode: [
      'yoom-bot',
      'oracle',
      'code-reviewer',
      'tester',
      'refactorer',
      'document-writer',
      'git-committer',
    ],
  },
  testing: {
    framework: 'pest',
    command: 'php artisan test',
    directory: 'tests',
  },
};
