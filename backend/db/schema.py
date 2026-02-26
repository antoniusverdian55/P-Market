"""
Database Schema - P Market PostgreSQL Database
Drizzle ORM schema definitions for all tables.
"""
from drizzle import (
    pg_table as table,
    pg_integer as integer,
    pg_bigint as bigint,
    pg_serial as serial,
    pg_bigserial as bigserial,
    pg_text as text,
    pg_varchar as varchar,
    pg_numeric as numeric,
    pg_boolean as boolean,
    pg_timestamp as timestamp,
    pg_date as date,
    pg_jsonb as jsonb,
    pg_uuid as uuid,
    pg_index as index,
    pg_foreign_key as foreign_key,
    pg_references as references,
)
from drizzle.pg import UUID
from datetime import datetime
import uuid as uuid_lib


# ===== Users & Authentication =====
users = table(
    'users',
    {
        'id': uuid(primary_key=True, default=uuid_lib.uuid4),
        'email': varchar(length=255, unique=True, nullable=False),
        'username': varchar(length=100, unique=True, nullable=False),
        'password_hash': varchar(length=255, nullable=False),
        'full_name': varchar(length=200),
        'avatar_url': text(),
        'is_active': boolean(default=True),
        'is_verified': boolean(default=False),
        'role': varchar(length=50, default='user'),  # user, admin, premium
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow, onupdate=datetime.utcnow),
        'last_login_at': timestamp(timezone=True),
    }
)

# ===== User Profiles =====
user_profiles = table(
    'user_profiles',
    {
        'id': serial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False, unique=True),
        'bio': text(),
        'phone': varchar(length=20),
        'country': varchar(length=100),
        'timezone': varchar(length=50, default='UTC'),
        'currency': varchar(length=3, default='USD'),
        'risk_tolerance': varchar(length=20, default='medium'),  # low, medium, high
        'investment_experience': varchar(length=20, default='intermediate'),
        'preferred_sectors': jsonb(default=list),
        'notification_settings': jsonb(default=dict),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow, onupdate=datetime.utcnow),
    }
)

# ===== Portfolios =====
portfolios = table(
    'portfolios',
    {
        'id': serial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False),
        'name': varchar(length=100, nullable=False),
        'description': text(),
        'initial_capital': numeric(precision=15, scale=2, default=100000),
        'current_value': numeric(precision=15, scale=2, default=0),
        'cash_balance': numeric(precision=15, scale=2, default=0),
        'currency': varchar(length=3, default='USD'),
        'is_active': boolean(default=True),
        'is_public': boolean(default=False),
        'benchmark_symbol': varchar(length=20, default='VOO'),  # S&P 500 ETF
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow, onupdate=datetime.utcnow),
    }
)

# ===== Positions =====
positions = table(
    'positions',
    {
        'id': serial(primary_key=True),
        'portfolio_id': integer(references=portfolios.id, nullable=False),
        'symbol': varchar(length=20, nullable=False),
        'name': varchar(length=200),
        'asset_type': varchar(length=20, default='stock'),  # stock, etf, crypto, forex
        'shares': numeric(precision=18, scale=8, default=0),
        'average_cost': numeric(precision=15, scale=4, nullable=False),
        'current_price': numeric(precision=15, scale=4, default=0),
        'market_value': numeric(precision=15, scale=2, default=0),
        'unrealized_pnl': numeric(precision=15, scale=2, default=0),
        'unrealized_pnl_percent': numeric(precision=8, scale=4, default=0),
        'realized_pnl': numeric(precision=15, scale=2, default=0),
        'sector': varchar(length=100),
        'industry': varchar(length=100),
        'is_active': boolean(default=True),
        'opened_at': timestamp(timezone=True, default=datetime.utcnow),
        'closed_at': timestamp(timezone=True),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow, onupdate=datetime.utcnow),
    }
)

# ===== Transactions =====
transactions = table(
    'transactions',
    {
        'id': bigserial(primary_key=True),
        'portfolio_id': integer(references=portfolios.id, nullable=False),
        'position_id': integer(references=positions.id),
        'transaction_type': varchar(length=20, nullable=False),  # buy, sell, dividend, transfer
        'symbol': varchar(length=20, nullable=False),
        'shares': numeric(precision=18, scale=8, nullable=False),
        'price': numeric(precision=15, scale=4, nullable=False),
        'total_amount': numeric(precision=15, scale=2, nullable=False),
        'commission': numeric(precision=10, scale=2, default=0),
        'currency': varchar(length=3, default='USD'),
        'exchange': varchar(length=50),
        'notes': text(),
        'executed_at': timestamp(timezone=True, nullable=False),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Watchlists =====
watchlists = table(
    'watchlists',
    {
        'id': serial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False),
        'name': varchar(length=100, nullable=False),
        'description': text(),
        'is_public': boolean(default=False),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow, onupdate=datetime.utcnow),
    }
)

watchlist_items = table(
    'watchlist_items',
    {
        'id': serial(primary_key=True),
        'watchlist_id': integer(references=watchlists.id, nullable=False),
        'symbol': varchar(length=20, nullable=False),
        'name': varchar(length=200),
        'asset_type': varchar(length=20, default='stock'),
        'notes': text(),
        'added_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Market Data =====
market_data = table(
    'market_data',
    {
        'id': bigserial(primary_key=True),
        'symbol': varchar(length=20, nullable=False),
        'date': date(nullable=False),
        'open': numeric(precision=15, scale=4),
        'high': numeric(precision=15, scale=4),
        'low': numeric(precision=15, scale=4),
        'close': numeric(precision=15, scale=4),
        'volume': bigint(),
        'adjusted_close': numeric(precision=15, scale=4),
        'dividend_amount': numeric(precision=10, scale=4, default=0),
        'split_coefficient': numeric(precision=10, scale=4, default=1),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Portfolio Performance History =====
portfolio_snapshots = table(
    'portfolio_snapshots',
    {
        'id': bigserial(primary_key=True),
        'portfolio_id': integer(references=portfolios.id, nullable=False),
        'date': date(nullable=False),
        'total_value': numeric(precision=15, scale=2, nullable=False),
        'cash_balance': numeric(precision=15, scale=2, default=0),
        'positions_value': numeric(precision=15, scale=2, default=0),
        'daily_pnl': numeric(precision=15, scale=2, default=0),
        'daily_pnl_percent': numeric(precision=8, scale=4, default=0),
        'total_return': numeric(precision=15, scale=2, default=0),
        'total_return_percent': numeric(precision=8, scale=4, default=0),
        'benchmark_value': numeric(precision=15, scale=2),
        'benchmark_return': numeric(precision=8, scale=4),
        'sharpe_ratio': numeric(precision=8, scale=4),
        'sortino_ratio': numeric(precision=8, scale=4),
        'max_drawdown': numeric(precision=8, scale=4),
        'volatility': numeric(precision=8, scale=4),
        'beta': numeric(precision=8, scale=4),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Dividends =====
dividends = table(
    'dividends',
    {
        'id': bigserial(primary_key=True),
        'portfolio_id': integer(references=portfolios.id, nullable=False),
        'position_id': integer(references=positions.id),
        'symbol': varchar(length=20, nullable=False),
        'dividend_amount': numeric(precision=10, scale=4, nullable=False),
        'shares_held': numeric(precision=18, scale=8, nullable=False),
        'total_received': numeric(precision=15, scale=2, nullable=False),
        'currency': varchar(length=3, default='USD'),
        'ex_dividend_date': date(nullable=False),
        'payment_date': date(nullable=False),
        'record_date': date(),
        'declaration_date': date(),
        'dividend_type': varchar(length=20, default='regular'),  # regular, special, stock
        'frequency': varchar(length=20),  # quarterly, monthly, annual
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Market Brief & Insights =====
market_briefs = table(
    'market_briefs',
    {
        'id': serial(primary_key=True),
        'title': varchar(length=200, nullable=False),
        'summary': text(),
        'content': text(),
        'sentiment': varchar(length=20),  # bullish, bearish, neutral
        'market_impact': varchar(length=20),  # low, medium, high
        'categories': jsonb(default=list),
        'tags': jsonb(default=list),
        'source': varchar(length=100),
        'author': varchar(length=100),
        'published_at': timestamp(timezone=True, nullable=False),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

ai_insights = table(
    'ai_insights',
    {
        'id': bigserial(primary_key=True),
        'brief_id': integer(references=market_briefs.id),
        'insight_type': varchar(length=20, nullable=False),  # pattern, alert, opportunity, risk
        'title': varchar(length=200, nullable=False),
        'description': text(),
        'confidence_score': numeric(precision=5, scale=4),
        'symbols': jsonb(default=list),
        'sectors': jsonb(default=list),
        'action_recommendation': varchar(length=50),  # buy, sell, hold, watch
        'target_price': numeric(precision=15, scale=4),
        'stop_loss': numeric(precision=15, scale=4),
        'time_horizon': varchar(length=20),  # short, medium, long
        'is_active': boolean(default=True),
        'expires_at': timestamp(timezone=True),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== Trading Journal =====
journal_entries = table(
    'journal_entries',
    {
        'id': bigserial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False),
        'transaction_id': bigint(references=transactions.id),
        'title': varchar(length=200, nullable=False),
        'content': text(),
        'trade_type': varchar(length=20),  # long, short
        'outcome': varchar(length=20),  # win, loss, breakeven
        'lessons_learned': text(),
        'emotions': jsonb(default=list),
        'mistakes': jsonb(default=list),
        'what_went_well': jsonb(default=list),
        'screenshot_url': text(),
        'rating': integer(),  # 1-5
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow, onupdate=datetime.utcnow),
    }
)

# ===== Alerts =====
alerts = table(
    'alerts',
    {
        'id': bigserial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False),
        'alert_type': varchar(length=20, nullable=False),  # price, percent, news, technical
        'symbol': varchar(length=20),
        'condition': varchar(length=50, nullable=False),  # above, below, crosses, equals
        'threshold_value': numeric(precision=15, scale=4),
        'current_value': numeric(precision=15, scale=4),
        'is_active': boolean(default=True),
        'is_triggered': boolean(default=False),
        'notification_methods': jsonb(default=['email']),  # email, push, sms
        'triggered_at': timestamp(timezone=True),
        'expires_at': timestamp(timezone=True),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== API Keys & Integration =====
api_keys = table(
    'api_keys',
    {
        'id': serial(primary_key=True),
        'user_id': uuid(references=users.id, nullable=False),
        'name': varchar(length=100, nullable=False),
        'key_hash': varchar(length=255, nullable=False),
        'permissions': jsonb(default=list),
        'rate_limit': integer(default=1000),
        'is_active': boolean(default=True),
        'last_used_at': timestamp(timezone=True),
        'expires_at': timestamp(timezone=True),
        'created_at': timestamp(timezone=True, default=datetime.utcnow),
    }
)

# ===== System Settings =====
system_settings = table(
    'system_settings',
    {
        'id': serial(primary_key=True),
        'key': varchar(length=100, unique=True, nullable=False),
        'value': jsonb(nullable=False),
        'description': text(),
        'category': varchar(length=50),
        'is_public': boolean(default=False),
        'updated_at': timestamp(timezone=True, default=datetime.utcnow, onupdate=datetime.utcnow),
    }
)

# ===== Indexes =====
# Performance indexes
indexes = [
    index('idx_users_email', users.email),
    index('idx_users_username', users.username),
    index('idx_portfolios_user_id', portfolios.user_id),
    index('idx_positions_portfolio_id', positions.portfolio_id),
    index('idx_positions_symbol', positions.symbol),
    index('idx_transactions_portfolio_id', transactions.portfolio_id),
    index('idx_transactions_symbol', transactions.symbol),
    index('idx_transactions_executed_at', transactions.executed_at),
    index('idx_watchlists_user_id', watchlists.user_id),
    index('idx_market_data_symbol_date', market_data.symbol, market_data.date),
    index('idx_portfolio_snapshots_portfolio_id_date', portfolio_snapshots.portfolio_id, portfolio_snapshots.date),
    index('idx_dividends_portfolio_id', dividends.portfolio_id),
    index('idx_dividends_symbol', dividends.symbol),
    index('idx_journal_entries_user_id', journal_entries.user_id),
    index('idx_alerts_user_id', alerts.user_id),
    index('idx_ai_insights_brief_id', ai_insights.brief_id),
]
