"""
Database Configuration and Connection Management
"""
import os
from typing import Optional
from contextlib import asynccontextmanager
from databases import Database
from drizzle import create_drizzle_client
from drizzle.pg import Dialect
import asyncio

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/pmarket"
)

# Connection pool settings
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
MIN_POOL_SIZE = int(os.getenv("DB_MIN_POOL_SIZE", "3"))


class DatabaseManager:
    """Manages database connections and transactions."""
    
    def __init__(self):
        self.database: Optional[Database] = None
        self._lock = asyncio.Lock()
    
    async def connect(self):
        """Establish database connection."""
        async with self._lock:
            if self.database is None:
                self.database = Database(
                    DATABASE_URL,
                    min_size=MIN_POOL_SIZE,
                    max_size=POOL_SIZE,
                )
                await self.database.connect()
                print(f"✅ Database connected: {DATABASE_URL.split('@')[-1]}")
    
    async def disconnect(self):
        """Close database connection."""
        async with self._lock:
            if self.database and self.database.is_connected:
                await self.database.disconnect()
                print("✅ Database disconnected")
    
    @property
    def connection(self) -> Database:
        """Get database connection."""
        if self.database is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self.database
    
    @asynccontextmanager
    async def transaction(self):
        """Context manager for database transactions."""
        async with self.connection.transaction():
            yield
    
    async def execute(self, query, values=None):
        """Execute a database query."""
        return await self.connection.execute(query, values or {})
    
    async def fetch_one(self, query, values=None):
        """Fetch a single row."""
        return await self.connection.fetch_one(query, values or {})
    
    async def fetch_all(self, query, values=None):
        """Fetch all rows."""
        return await self.connection.fetch_all(query, values or {})


# Global database manager instance
db_manager = DatabaseManager()


@asynccontextmanager
async def get_db():
    """Dependency for FastAPI to get database connection."""
    await db_manager.connect()
    try:
        yield db_manager
    finally:
        # Don't disconnect on every request, only on app shutdown
        pass


async def init_db():
    """Initialize database connection on app startup."""
    await db_manager.connect()


async def close_db():
    """Close database connection on app shutdown."""
    await db_manager.disconnect()


# Helper functions for common operations
async def get_user_by_email(email: str):
    """Get user by email address."""
    from db.schema import users
    query = users.select().where(users.email == email)
    return await db_manager.fetch_one(query)


async def get_portfolio_by_id(portfolio_id: int, user_id: str = None):
    """Get portfolio by ID with optional user ownership check."""
    from db.schema import portfolios
    query = portfolios.select().where(portfolios.id == portfolio_id)
    
    if user_id:
        query = query.where(portfolios.user_id == user_id)
    
    return await db_manager.fetch_one(query)


async def get_active_positions(portfolio_id: int):
    """Get all active positions for a portfolio."""
    from db.schema import positions
    query = positions.select().where(
        (positions.portfolio_id == portfolio_id) & 
        (positions.is_active == True)
    )
    return await db_manager.fetch_all(query)


async def create_transaction(transaction_data: dict):
    """Create a new transaction record."""
    from db.schema import transactions
    query = transactions.insert().values(**transaction_data)
    return await db_manager.execute(query)


async def update_position_prices(symbol: str, current_price: float):
    """Update current price for all positions with a symbol."""
    from db.schema import positions
    from sqlalchemy import update
    
    query = update(positions).where(
        positions.symbol == symbol
    ).values(
        current_price=current_price,
        market_value=positions.shares * current_price,
        unrealized_pnl=(current_price - positions.average_cost) * positions.shares,
        updated_at=asyncio.get_event_loop().time(),
    )
    return await db_manager.execute(query)
