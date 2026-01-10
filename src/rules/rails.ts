/**
 * Ruby on Rails Framework Rules
 *
 * Rails conventions with Service Objects and Thin Controllers
 */

import type { FrameworkConfig, ReviewDeduction } from './types.js';

const railsRules = `
## Ruby on Rails Rules

### Directory Structure
\`\`\`
app/
├── controllers/           # Thin controllers (delegation only)
│   └── api/v1/           # API versioning
├── models/               # ActiveRecord models (validations, associations)
├── services/             # Business logic (Service Objects)
│   └── [feature]/        # Feature-grouped services
├── serializers/          # JSON serialization (ActiveModelSerializers/Blueprinter)
├── policies/             # Authorization (Pundit)
├── queries/              # Complex queries (Query Objects)
└── jobs/                 # Background jobs (Sidekiq)

lib/
└── [domain]/             # Domain logic outside Rails

spec/
├── requests/             # API integration tests
├── services/             # Service unit tests
└── models/               # Model unit tests
\`\`\`

### Controller Pattern (Thin Controller)
\`\`\`ruby
# ✅ GOOD: Thin controller delegates to service
class Api::V1::OrdersController < ApplicationController
  def create
    result = Orders::CreateService.call(order_params, current_user)

    if result.success?
      render json: OrderSerializer.new(result.order), status: :created
    else
      render json: { errors: result.errors }, status: :unprocessable_entity
    end
  end

  private

  def order_params
    params.require(:order).permit(:product_id, :quantity)
  end
end
\`\`\`

### Service Object Pattern
\`\`\`ruby
# app/services/orders/create_service.rb
module Orders
  class CreateService
    def self.call(params, user)
      new(params, user).call
    end

    def initialize(params, user)
      @params = params
      @user = user
    end

    def call
      validate_stock!
      order = create_order
      notify_user(order)
      Result.success(order: order)
    rescue ValidationError => e
      Result.failure(errors: [e.message])
    end

    private

    def validate_stock!
      # Pure validation logic
    end

    def create_order
      Order.create!(@params.merge(user: @user))
    end

    def notify_user(order)
      OrderMailer.confirmation(order).deliver_later
    end
  end
end
\`\`\`

### Model Rules
\`\`\`ruby
class Order < ApplicationRecord
  # Associations
  belongs_to :user
  has_many :line_items

  # Validations
  validates :status, inclusion: { in: %w[pending paid shipped] }

  # Scopes (declarative queries)
  scope :recent, -> { where('created_at > ?', 1.week.ago) }
  scope :by_status, ->(status) { where(status: status) }

  # NO business logic here - use Services
end
\`\`\`

### Query Object Pattern
\`\`\`ruby
# app/queries/orders/search_query.rb
module Orders
  class SearchQuery
    def initialize(relation = Order.all)
      @relation = relation
    end

    def call(filters)
      @relation
        .then { |r| filter_by_status(r, filters[:status]) }
        .then { |r| filter_by_date(r, filters[:from], filters[:to]) }
        .then { |r| paginate(r, filters[:page]) }
    end

    private

    def filter_by_status(relation, status)
      return relation unless status
      relation.by_status(status)
    end
    # ...
  end
end
\`\`\`

### Forbidden Patterns
- ❌ Fat controllers (business logic in controllers)
- ❌ Fat models (business logic in models)
- ❌ Callbacks for business logic (use Services)
- ❌ Direct SQL in controllers
- ❌ N+1 queries (use includes/preload)
`;

const railsDeductions: ReviewDeduction[] = [
  {
    code: 'RAILS-1',
    description: 'Business logic in controller (fat controller)',
    points: 10,
    category: 'framework',
  },
  {
    code: 'RAILS-2',
    description: 'Business logic in model callbacks',
    points: 8,
    category: 'framework',
  },
  {
    code: 'RAILS-3',
    description: 'N+1 query detected (missing includes/preload)',
    points: 7,
    category: 'framework',
  },
  {
    code: 'RAILS-4',
    description: 'Direct SQL in controller instead of Query Object',
    points: 5,
    category: 'framework',
  },
  {
    code: 'RAILS-5',
    description: 'Missing service object for complex operation',
    points: 6,
    category: 'framework',
  },
  {
    code: 'RAILS-6',
    description: 'Missing request specs for API endpoint',
    points: 5,
    category: 'framework',
  },
];

export const railsConfig: FrameworkConfig = {
  name: 'rails',
  displayName: 'Ruby on Rails',
  detection: [
    'Gemfile',
    'config/routes.rb',
    'app/controllers/application_controller.rb',
    'config/application.rb',
  ],
  rules: railsRules,
  deductions: railsDeductions,
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
    framework: 'rspec',
    command: 'bundle exec rspec',
    directory: 'spec',
  },
};
