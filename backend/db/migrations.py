"""
Database migrations management
"""
import os
import asyncio
from pathlib import Path
from datetime import datetime

# Migration directory
MIGRATIONS_DIR = Path(__file__).parent / "migrations"
MIGRATIONS_DIR.mkdir(exist_ok=True)


# ===== Migration Templates =====

CREATE_TABLE_USERS = """
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
"""

CREATE_TABLE_USER_PROFILES = """
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
    bio TEXT,
    phone VARCHAR(20),
    country VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    risk_tolerance VARCHAR(20) DEFAULT 'medium',
    investment_experience VARCHAR(20) DEFAULT 'intermediate',
    preferred_sectors JSONB DEFAULT '[]',
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
"""

CREATE_TABLE_PORTFOLIOS = """
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    initial_capital NUMERIC(15, 2) DEFAULT 100000,
    current_value NUMERIC(15, 2) DEFAULT 0,
    cash_balance NUMERIC(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    benchmark_symbol VARCHAR(20) DEFAULT 'VOO',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
"""

CREATE_TABLE_POSITIONS = """
CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(200),
    asset_type VARCHAR(20) DEFAULT 'stock',
    shares NUMERIC(18, 8) DEFAULT 0,
    average_cost NUMERIC(15, 4) NOT NULL,
    current_price NUMERIC(15, 4) DEFAULT 0,
    market_value NUMERIC(15, 2) DEFAULT 0,
    unrealized_pnl NUMERIC(15, 2) DEFAULT 0,
    unrealized_pnl_percent NUMERIC(8, 4) DEFAULT 0,
    realized_pnl NUMERIC(15, 2) DEFAULT 0,
    sector VARCHAR(100),
    industry VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    opened_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_positions_portfolio_id ON positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);
"""

CREATE_TABLE_TRANSACTIONS = """
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) NOT NULL,
    position_id INTEGER REFERENCES positions(id),
    transaction_type VARCHAR(20) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    shares NUMERIC(18, 8) NOT NULL,
    price NUMERIC(15, 4) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    commission NUMERIC(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange VARCHAR(50),
    notes TEXT,
    executed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_executed_at ON transactions(executed_at);
"""

CREATE_TABLE_WATCHLISTS = """
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlist_items (
    id SERIAL PRIMARY KEY,
    watchlist_id INTEGER REFERENCES watchlists(id) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(200),
    asset_type VARCHAR(20) DEFAULT 'stock',
    notes TEXT,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);
"""

CREATE_TABLE_MARKET_DATA = """
CREATE TABLE IF NOT EXISTS market_data (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    open NUMERIC(15, 4),
    high NUMERIC(15, 4),
    low NUMERIC(15, 4),
    close NUMERIC(15, 4),
    volume BIGINT,
    adjusted_close NUMERIC(15, 4),
    dividend_amount NUMERIC(10, 4) DEFAULT 0,
    split_coefficient NUMERIC(10, 4) DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, date)
);

CREATE INDEX IF NOT EXISTS idx_market_data_symbol_date ON market_data(symbol, date);
"""

CREATE_TABLE_PORTFOLIO_SNAPSHOTS = """
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) NOT NULL,
    date DATE NOT NULL,
    total_value NUMERIC(15, 2) NOT NULL,
    cash_balance NUMERIC(15, 2) DEFAULT 0,
    positions_value NUMERIC(15, 2) DEFAULT 0,
    daily_pnl NUMERIC(15, 2) DEFAULT 0,
    daily_pnl_percent NUMERIC(8, 4) DEFAULT 0,
    total_return NUMERIC(15, 2) DEFAULT 0,
    total_return_percent NUMERIC(8, 4) DEFAULT 0,
    benchmark_value NUMERIC(15, 2),
    benchmark_return NUMERIC(8, 4),
    sharpe_ratio NUMERIC(8, 4),
    sortino_ratio NUMERIC(8, 4),
    max_drawdown NUMERIC(8, 4),
    volatility NUMERIC(8, 4),
    beta NUMERIC(8, 4),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_portfolio_id_date ON portfolio_snapshots(portfolio_id, date);
"""

CREATE_TABLE_DIVIDENDS = """
CREATE TABLE IF NOT EXISTS dividends (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) NOT NULL,
    position_id INTEGER REFERENCES positions(id),
    symbol VARCHAR(20) NOT NULL,
    dividend_amount NUMERIC(10, 4) NOT NULL,
    shares_held NUMERIC(18, 8) NOT NULL,
    total_received NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    ex_dividend_date DATE NOT NULL,
    payment_date DATE NOT NULL,
    record_date DATE,
    declaration_date DATE,
    dividend_type VARCHAR(20) DEFAULT 'regular',
    frequency VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dividends_portfolio_id ON dividends(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_dividends_symbol ON dividends(symbol);
"""

CREATE_TABLE_MARKET_BRIEFS = """
CREATE TABLE IF NOT EXISTS market_briefs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    content TEXT,
    sentiment VARCHAR(20),
    market_impact VARCHAR(20),
    categories JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    source VARCHAR(100),
    author VARCHAR(100),
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
"""

CREATE_TABLE_AI_INSIGHTS = """
CREATE TABLE IF NOT EXISTS ai_insights (
    id BIGSERIAL PRIMARY KEY,
    brief_id INTEGER REFERENCES market_briefs(id),
    insight_type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    confidence_score NUMERIC(5, 4),
    symbols JSONB DEFAULT '[]',
    sectors JSONB DEFAULT '[]',
    action_recommendation VARCHAR(50),
    target_price NUMERIC(15, 4),
    stop_loss NUMERIC(15, 4),
    time_horizon VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_brief_id ON ai_insights(brief_id);
"""

CREATE_TABLE_JOURNAL_ENTRIES = """
CREATE TABLE IF NOT EXISTS journal_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    transaction_id BIGINT REFERENCES transactions(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    trade_type VARCHAR(20),
    outcome VARCHAR(20),
    lessons_learned TEXT,
    emotions JSONB DEFAULT '[]',
    mistakes JSONB DEFAULT '[]',
    what_went_well JSONB DEFAULT '[]',
    screenshot_url TEXT,
    rating INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
"""

CREATE_TABLE_ALERTS = """
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    alert_type VARCHAR(20) NOT NULL,
    symbol VARCHAR(20),
    condition VARCHAR(50) NOT NULL,
    threshold_value NUMERIC(15, 4),
    current_value NUMERIC(15, 4),
    is_active BOOLEAN DEFAULT TRUE,
    is_triggered BOOLEAN DEFAULT FALSE,
    notification_methods JSONB DEFAULT '["email"]',
    triggered_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
"""

CREATE_TABLE_API_KEYS = """
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
"""

CREATE_TABLE_SYSTEM_SETTINGS = """
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
"""


# ===== Migration Functions =====

async def run_migration(migration_name: str, sql: str, db):
    """Run a single migration."""
    print(f"Running migration: {migration_name}")
    try:
        await db.execute(sql)
        print(f"✅ Migration {migration_name} completed")
        return True
    except Exception as e:
        print(f"❌ Migration {migration_name} failed: {e}")
        return False


async def migrate(db):
    """Run all migrations."""
    migrations = [
        ("001_create_users", CREATE_TABLE_USERS),
        ("002_create_user_profiles", CREATE_TABLE_USER_PROFILES),
        ("003_create_portfolios", CREATE_TABLE_PORTFOLIOS),
        ("004_create_positions", CREATE_TABLE_POSITIONS),
        ("005_create_transactions", CREATE_TABLE_TRANSACTIONS),
        ("006_create_watchlists", CREATE_TABLE_WATCHLISTS),
        ("007_create_market_data", CREATE_TABLE_MARKET_DATA),
        ("008_create_portfolio_snapshots", CREATE_TABLE_PORTFOLIO_SNAPSHOTS),
        ("009_create_dividends", CREATE_TABLE_DIVIDENDS),
        ("010_create_market_briefs", CREATE_TABLE_MARKET_BRIEFS),
        ("011_create_ai_insights", CREATE_TABLE_AI_INSIGHTS),
        ("012_create_journal_entries", CREATE_TABLE_JOURNAL_ENTRIES),
        ("013_create_alerts", CREATE_TABLE_ALERTS),
        ("014_create_api_keys", CREATE_TABLE_API_KEYS),
        ("015_create_system_settings", CREATE_TABLE_SYSTEM_SETTINGS),
    ]
    
    print("\n🚀 Starting database migrations...\n")
    
    for migration_name, sql in migrations:
        await run_migration(migration_name, sql, db)
    
    print("\n✅ All migrations completed successfully!\n")


async def rollback(migration_name: str, db):
    """Rollback a specific migration."""
    # Implement rollback logic based on migration name
    print(f"Rolling back migration: {migration_name}")
    # Add DROP TABLE or ALTER TABLE statements as needed
