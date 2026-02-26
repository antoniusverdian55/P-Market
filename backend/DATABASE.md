# P Market Database Setup Guide

## Overview

P Market uses **PostgreSQL** with **Python Drizzle ORM** for data persistence.

> **Note:** This project uses the **Python Drizzle ORM** (`drizzle` package), which is different from the TypeScript Drizzle ORM. Therefore, **Drizzle Studio** (the web UI) is not available. For database visualization, use:
> - **DBeaver** (recommended): https://dbeaver.io/download/
> - **pgAdmin**: https://www.pgadmin.org/download/
> - **TablePlus**: https://tableplus.com/
> - Or use our built-in **CLI viewer**: `python db_viewer.py` The database schema includes tables for:

- 👥 Users & Authentication
- 💼 Portfolios & Positions
- 📊 Transactions & Market Data
- 📈 Portfolio Performance Tracking
- 💰 Dividends
- 📰 Market Briefs & AI Insights
- 📔 Trading Journal
- 🔔 Alerts & Notifications

## Prerequisites

1. **PostgreSQL 14+** installed and running
2. **Python 3.10+** with pip
3. Database superuser credentials

## Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Database Connection

Create a `.env` file in the `backend/` directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pmarket
DB_POOL_SIZE=10
DB_MIN_POOL_SIZE=3

# Other settings...
```

### 3. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pmarket;

# Create user (optional)
CREATE USER pmarket_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pmarket TO pmarket_user;

# Exit
\q
```

### 4. Run Migrations

```bash
cd backend
python db/init_db.py
```

This will:
- Connect to your PostgreSQL database
- Run all migrations to create tables
- Insert default system settings

### 5. Seed Sample Data (Optional)

```bash
python db/seed.py
```

This populates the database with:
- 365 days of historical market data for major stocks
- Sample portfolio with positions
- Sample market briefs and insights

## Database Schema

### Core Tables

```
users
├── id (UUID, PK)
├── email (unique)
├── username (unique)
├── password_hash
└── ... (auth & profile fields)

user_profiles
├── id (SERIAL, PK)
├── user_id (UUID, FK → users)
├── bio, phone, country
├── risk_tolerance
└── ... (preference settings)

portfolios
├── id (SERIAL, PK)
├── user_id (UUID, FK → users)
├── name, description
├── initial_capital, current_value
└── ... (portfolio settings)

positions
├── id (SERIAL, PK)
├── portfolio_id (INT, FK → portfolios)
├── symbol, name, asset_type
├── shares, average_cost, current_price
├── unrealized_pnl, realized_pnl
└── ... (position tracking)

transactions
├── id (BIGSERIAL, PK)
├── portfolio_id (INT, FK → portfolios)
├── position_id (INT, FK → positions)
├── transaction_type (buy/sell/dividend)
├── shares, price, total_amount
└── ... (transaction details)
```

### Analytics Tables

```
market_data
├── id (BIGSERIAL, PK)
├── symbol, date
├── open, high, low, close, volume
└── ... (OHLCV data)

portfolio_snapshots
├── id (BIGSERIAL, PK)
├── portfolio_id (INT, FK → portfolios)
├── date, total_value, cash_balance
├── sharpe_ratio, sortino_ratio, max_drawdown
└── ... (performance metrics)

dividends
├── id (BIGSERIAL, PK)
├── portfolio_id, position_id
├── symbol, dividend_amount, shares_held
├── ex_dividend_date, payment_date
└── ... (dividend tracking)
```

### Content Tables

```
market_briefs
├── id (SERIAL, PK)
├── title, summary, content
├── sentiment, market_impact
└── ... (market news)

ai_insights
├── id (BIGSERIAL, PK)
├── brief_id (INT, FK → market_briefs)
├── insight_type, title, description
├── confidence_score, action_recommendation
└── ... (AI analysis)
```

## Usage

### In FastAPI Routes

```python
from fastapi import APIRouter, Depends
from db.connection import get_db

router = APIRouter()

@router.get("/portfolios")
async def get_portfolios(db = Depends(get_db)):
    from db.schema import portfolios
    query = portfolios.select()
    results = await db.fetch_all(query)
    return {"portfolios": results}

@router.post("/portfolios")
async def create_portfolio(portfolio_data: PortfolioCreate, db = Depends(get_db)):
    from db.schema import portfolios
    result = await db.execute(
        portfolios.insert().values(**portfolio_data.dict())
    )
    return {"id": result, "status": "created"}
```

### Database Operations

```python
from db.connection import db_manager

# Execute query
await db_manager.execute(query, values)

# Fetch one row
row = await db_manager.fetch_one(query, values)

# Fetch all rows
rows = await db_manager.fetch_all(query, values)

# Transaction
async with db_manager.transaction():
    await db_manager.execute(query1)
    await db_manager.execute(query2)
```

## Maintenance

### Backup Database

```bash
pg_dump -U postgres pmarket > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql -U postgres pmarket < backup_20240101.sql
```

### Reset Database

```bash
# Drop and recreate
psql -U postgres
DROP DATABASE pmarket;
CREATE DATABASE pmarket;
\q

# Re-run migrations
python db/init_db.py
```

### View Migration Status

```python
# Check existing tables
python -c "
import asyncio
from db.connection import db_manager

async def check():
    await db_manager.connect()
    tables = await db_manager.fetch_all(
        \"SELECT tablename FROM pg_tables WHERE schemaname = 'public'\"
    )
    for t in tables:
        print(t['tablename'])
    await db_manager.disconnect()

asyncio.run(check())
```

## Troubleshooting

### Connection Issues

**Error:** `could not connect to server`
- Check PostgreSQL is running: `pg_ctl status`
- Verify DATABASE_URL in `.env`
- Check firewall settings

**Error:** `database "pmarket" does not exist`
- Create database: `CREATE DATABASE pmarket;`

### Migration Errors

**Error:** `relation already exists`
- Database already initialized
- Drop tables or use fresh database

**Error:** `permission denied`
- Check user has proper grants
- Use superuser for initial setup

## Performance Tips

1. **Indexes**: All tables have appropriate indexes on foreign keys and frequently queried columns
2. **Connection Pooling**: Configured via `DB_POOL_SIZE` and `DB_MIN_POOL_SIZE`
3. **Batch Inserts**: Use batch operations for market data
4. **Partitioning**: Consider partitioning `market_data` and `transactions` by date for large datasets

## Security

- ✅ Password hashing with bcrypt
- ✅ SQL injection protection via parameterized queries
- ✅ Connection pooling with limits
- ⚠️ Remember to change default credentials in production
- ⚠️ Use environment variables for sensitive data
- ⚠️ Enable SSL for production database connections

## Support

For issues or questions:
1. Check logs in backend console
2. Review PostgreSQL logs
3. Verify database connection settings
4. Test with `python db/init_db.py`

---

**Happy Trading! 📈**
