"""
Database Schema - P Market PostgreSQL Database
Python Drizzle ORM schema definitions.

Note: This uses the Python Drizzle ORM (drizzle-orm package)
For Drizzle Studio, you would need the TypeScript version.
"""
from drizzle import (
    pg_table,
    integer,
    bigint,
    serial,
    bigserial,
    text,
    varchar,
    numeric,
    boolean,
    timestamp,
    date,
    jsonb,
    uuid,
)
from datetime import datetime
import uuid as uuid_lib


# ===== Users & Authentication =====
users = pg_table(
    'users',
    {
        'id': uuid(primary_key=True, default=uuid_lib.uuid4),
        'email': varchar(255, unique=True, nullable=False),
        'username': varchar(100, unique=True, nullable=False),
        'password_hash': varchar(255, nullable=False),
        'full_name': varchar(200),
        'avatar_url': text(),
        'is_active': boolean(default=True),
        'is_verified': boolean(default=False),
        'role': varchar(50, default='user'),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow),
        'last_login_at': timestamp(timezone=True),
    }
)

# ===== User Profiles =====
user_profiles = pg_table(
    'user_profiles',
    {
        'id': serial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False, unique=True),
        'bio': text(),
        'phone': varchar(20),
        'country': varchar(100),
        'timezone': varchar(50, default='UTC'),
        'currency': varchar(3, default='USD'),
        'risk_tolerance': varchar(20, default='medium'),
        'investment_experience': varchar(20, default='intermediate'),
        'preferred_sectors': jsonb(default=list),
        'notification_settings': jsonb(default=dict),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Portfolios =====
portfolios = pg_table(
    'portfolios',
    {
        'id': serial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False),
        'name': varchar(100, nullable=False),
        'description': text(),
        'initial_capital': numeric(15, 2, default=100000),
        'current_value': numeric(15, 2, default=0),
        'cash_balance': numeric(15, 2, default=0),
        'currency': varchar(3, default='USD'),
        'is_active': boolean(default=True),
        'is_public': boolean(default=False),
        'benchmark_symbol': varchar(20, default='VOO'),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Positions =====
positions = pg_table(
    'positions',
    {
        'id': serial(primary_key=True),
        'portfolio_id': integer(references=portfolios.id, nullable=False),
        'symbol': varchar(20, nullable=False),
        'name': varchar(200),
        'asset_type': varchar(20, default='stock'),
        'shares': numeric(18, 8, default=0),
        'average_cost': numeric(15, 4, nullable=False),
        'current_price': numeric(15, 4, default=0),
        'market_value': numeric(15, 2, default=0),
        'unrealized_pnl': numeric(15, 2, default=0),
        'unrealized_pnl_percent': numeric(8, 4, default=0),
        'realized_pnl': numeric(15, 2, default=0),
        'sector': varchar(100),
        'industry': varchar(100),
        'is_active': boolean(default=True),
        'opened_at': timestamp(timezone=True, default=datetime.utcnow),
        'closed_at': timestamp(timezone=True),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Transactions =====
transactions = pg_table(
    'transactions',
    {
        'id': bigserial(primary_key=True),
        'portfolio_id': integer(references=portfolios.id, nullable=False),
        'position_id': integer(references=positions.id),
        'transaction_type': varchar(20, nullable=False),
        'symbol': varchar(20, nullable=False),
        'shares': numeric(18, 8, nullable=False),
        'price': numeric(15, 4, nullable=False),
        'total_amount': numeric(15, 2, nullable=False),
        'commission': numeric(10, 2, default=0),
        'currency': varchar(3, default='USD'),
        'exchange': varchar(50),
        'notes': text(),
        'executed_at': timestamp(timezone=True, nullable=False),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Watchlists =====
watchlists = pg_table(
    'watchlists',
    {
        'id': serial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False),
        'name': varchar(100, nullable=False),
        'description': text(),
        'is_public': boolean(default=False),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

watchlist_items = pg_table(
    'watchlist_items',
    {
        'id': serial(primary_key=True),
        'watchlist_id': integer(references=watchlists.id, nullable=False),
        'symbol': varchar(20, nullable=False),
        'name': varchar(200),
        'asset_type': varchar(20, default='stock'),
        'notes': text(),
        'added_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Market Data =====
market_data = pg_table(
    'market_data',
    {
        'id': bigserial(primary_key=True),
        'symbol': varchar(20, nullable=False),
        'date': date(nullable=False),
        'open': numeric(15, 4),
        'high': numeric(15, 4),
        'low': numeric(15, 4),
        'close': numeric(15, 4),
        'volume': bigint(),
        'adjusted_close': numeric(15, 4),
        'dividend_amount': numeric(10, 4, default=0),
        'split_coefficient': numeric(10, 4, default=1),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Portfolio Performance History =====
portfolio_snapshots = pg_table(
    'portfolio_snapshots',
    {
        'id': bigserial(primary_key=True),
        'portfolio_id': integer(references=portfolios.id, nullable=False),
        'date': date(nullable=False),
        'total_value': numeric(15, 2, nullable=False),
        'cash_balance': numeric(15, 2, default=0),
        'positions_value': numeric(15, 2, default=0),
        'daily_pnl': numeric(15, 2, default=0),
        'daily_pnl_percent': numeric(8, 4, default=0),
        'total_return': numeric(15, 2, default=0),
        'total_return_percent': numeric(8, 4, default=0),
        'benchmark_value': numeric(15, 2),
        'benchmark_return': numeric(8, 4),
        'sharpe_ratio': numeric(8, 4),
        'sortino_ratio': numeric(8, 4),
        'max_drawdown': numeric(8, 4),
        'volatility': numeric(8, 4),
        'beta': numeric(8, 4),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Dividends =====
dividends = pg_table(
    'dividends',
    {
        'id': bigserial(primary_key=True),
        'portfolio_id': integer(references=portfolios.id, nullable=False),
        'position_id': integer(references=positions.id),
        'symbol': varchar(20, nullable=False),
        'dividend_amount': numeric(10, 4, nullable=False),
        'shares_held': numeric(18, 8, nullable=False),
        'total_received': numeric(15, 2, nullable=False),
        'currency': varchar(3, default='USD'),
        'ex_dividend_date': date(nullable=False),
        'payment_date': date(nullable=False),
        'record_date': date(),
        'declaration_date': date(),
        'dividend_type': varchar(20, default='regular'),
        'frequency': varchar(20),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Market Brief & Insights =====
market_briefs = pg_table(
    'market_briefs',
    {
        'id': serial(primary_key=True),
        'title': varchar(200, nullable=False),
        'summary': text(),
        'content': text(),
        'sentiment': varchar(20),
        'market_impact': varchar(20),
        'categories': jsonb(default=list),
        'tags': jsonb(default=list),
        'source': varchar(100),
        'author': varchar(100),
        'published_at': timestamp(timezone=True, nullable=False),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

ai_insights = pg_table(
    'ai_insights',
    {
        'id': bigserial(primary_key=True),
        'brief_id': integer(references=market_briefs.id),
        'insight_type': varchar(20, nullable=False),
        'title': varchar(200, nullable=False),
        'description': text(),
        'confidence_score': numeric(5, 4),
        'symbols': jsonb(default=list),
        'sectors': jsonb(default=list),
        'action_recommendation': varchar(50),
        'target_price': numeric(15, 4),
        'stop_loss': numeric(15, 4),
        'time_horizon': varchar(20),
        'is_active': boolean(default=True),
        'expires_at': timestamp(timezone=True),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Trading Journal =====
journal_entries = pg_table(
    'journal_entries',
    {
        'id': bigserial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False),
        'transaction_id': bigint(references=transactions.id),
        'title': varchar(200, nullable=False),
        'content': text(),
        'trade_type': varchar(20),
        'outcome': varchar(20),
        'lessons_learned': text(),
        'emotions': jsonb(default=list),
        'mistakes': jsonb(default=list),
        'what_went_well': jsonb(default=list),
        'screenshot_url': text(),
        'rating': integer(),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Alerts =====
alerts = pg_table(
    'alerts',
    {
        'id': bigserial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False),
        'alert_type': varchar(20, nullable=False),
        'symbol': varchar(20),
        'condition': varchar(50, nullable=False),
        'threshold_value': numeric(15, 4),
        'current_value': numeric(15, 4),
        'is_active': boolean(default=True),
        'is_triggered': boolean(default=False),
        'notification_methods': jsonb(default=['email']),
        'triggered_at': timestamp(timezone=True),
        'expires_at': timestamp(timezone=True),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== API Keys =====
api_keys = pg_table(
    'api_keys',
    {
        'id': serial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False),
        'name': varchar(100, nullable=False),
        'key_hash': varchar(255, nullable=False),
        'permissions': jsonb(default=list),
        'rate_limit': integer(default=1000),
        'is_active': boolean(default=True),
        'last_used_at': timestamp(timezone=True),
        'expires_at': timestamp(timezone=True),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== System Settings =====
system_settings = pg_table(
    'system_settings',
    {
        'id': serial(primary_key=True),
        'key': varchar(100, unique=True, nullable=False),
        'value': jsonb(nullable=False),
        'description': text(),
        'category': varchar(50),
        'is_public': boolean(default=False),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# Export all tables
__all__ = [
    'users',
    'user_profiles',
    'portfolios',
    'positions',
    'transactions',
    'watchlists',
    'watchlist_items',
    'market_data',
    'portfolio_snapshots',
    'dividends',
    'market_briefs',
    'ai_insights',
    'journal_entries',
    'alerts',
    'api_keys',
    'system_settings',
]
