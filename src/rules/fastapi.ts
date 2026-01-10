/**
 * FastAPI Framework Rules
 *
 * Python async patterns with Pydantic and Dependency Injection
 */

import type { FrameworkConfig, ReviewDeduction } from './types.js';

const fastapiRules = `
## FastAPI Rules

### Directory Structure
\`\`\`
app/
├── main.py                 # FastAPI app entry
├── core/
│   ├── config.py          # Settings (pydantic-settings)
│   ├── security.py        # Auth utilities
│   └── database.py        # DB connection
├── api/
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── router.py      # API router
│   │   └── endpoints/     # Route handlers
│   └── deps.py            # Dependencies
├── models/                 # SQLAlchemy models
├── schemas/                # Pydantic schemas
├── services/               # Business logic
├── repositories/           # Data access
└── utils/                  # Utilities

tests/
├── conftest.py            # Fixtures
├── api/                   # API tests
└── services/              # Service tests
\`\`\`

### Router Pattern
\`\`\`python
# app/api/v1/endpoints/orders.py
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import OrderService
from app.api.deps import get_current_user, get_order_service

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service),
) -> OrderResponse:
    """Create a new order."""
    return await service.create(order_in, current_user)

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service),
) -> OrderResponse:
    """Get order by ID."""
    order = await service.get_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
\`\`\`

### Pydantic Schemas
\`\`\`python
# app/schemas/order.py
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List

class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., ge=1, le=100)

class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(..., min_items=1)
    notes: Optional[str] = Field(None, max_length=500)

    @validator("items")
    def validate_items(cls, v):
        if len(v) > 50:
            raise ValueError("Maximum 50 items per order")
        return v

class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: str
    items: List[OrderItemCreate]
    created_at: datetime

    class Config:
        from_attributes = True
\`\`\`

### Service Pattern
\`\`\`python
# app/services/order_service.py
from app.repositories.order_repository import OrderRepository
from app.schemas.order import OrderCreate, OrderResponse
from app.models.user import User

class OrderService:
    def __init__(self, repository: OrderRepository):
        self.repository = repository

    async def create(
        self,
        order_in: OrderCreate,
        user: User
    ) -> OrderResponse:
        # Business logic (pure, testable)
        validated_items = self._validate_stock(order_in.items)
        total = self._calculate_total(validated_items)

        # Data access via repository
        order = await self.repository.create(
            user_id=user.id,
            items=validated_items,
            total=total,
        )

        return order

    def _validate_stock(self, items):
        # Pure validation logic
        ...

    def _calculate_total(self, items) -> float:
        # Pure calculation
        return sum(item.price * item.quantity for item in items)
\`\`\`

### Dependency Injection
\`\`\`python
# app/api/deps.py
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.repositories.order_repository import OrderRepository
from app.services.order_service import OrderService

async def get_order_repository(
    session: AsyncSession = Depends(get_session)
) -> OrderRepository:
    return OrderRepository(session)

async def get_order_service(
    repository: OrderRepository = Depends(get_order_repository)
) -> OrderService:
    return OrderService(repository)
\`\`\`

### Repository Pattern
\`\`\`python
# app/repositories/order_repository.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order

class OrderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, **data) -> Order:
        order = Order(**data)
        self.session.add(order)
        await self.session.commit()
        await self.session.refresh(order)
        return order

    async def get_by_id(self, order_id: int) -> Order | None:
        result = await self.session.execute(
            select(Order).where(Order.id == order_id)
        )
        return result.scalar_one_or_none()
\`\`\`

### Forbidden Patterns
- ❌ Business logic in route handlers (fat routes)
- ❌ Direct ORM in routes (use repositories)
- ❌ Missing Pydantic validation
- ❌ Sync operations blocking async
- ❌ Hardcoded config values
`;

const fastapiDeductions: ReviewDeduction[] = [
  {
    code: 'FASTAPI-1',
    description: 'Business logic in route handler (fat route)',
    points: 10,
    category: 'framework',
  },
  {
    code: 'FASTAPI-2',
    description: 'Direct ORM query in route instead of repository',
    points: 6,
    category: 'framework',
  },
  {
    code: 'FASTAPI-3',
    description: 'Missing Pydantic schema for request/response',
    points: 7,
    category: 'framework',
  },
  {
    code: 'FASTAPI-4',
    description: 'Sync blocking call in async function',
    points: 8,
    category: 'framework',
  },
  {
    code: 'FASTAPI-5',
    description: 'Missing dependency injection',
    points: 5,
    category: 'framework',
  },
  {
    code: 'FASTAPI-6',
    description: 'Hardcoded configuration values',
    points: 5,
    category: 'framework',
  },
];

export const fastapiConfig: FrameworkConfig = {
  name: 'fastapi',
  displayName: 'FastAPI',
  detection: [
    'requirements.txt',
    'pyproject.toml',
    'app/main.py',
    'main.py',
  ],
  rules: fastapiRules,
  deductions: fastapiDeductions,
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
    framework: 'pytest',
    command: 'pytest',
    directory: 'tests',
  },
};
