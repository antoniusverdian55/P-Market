"""
Database module for P Market backend.
"""
from db.schema import *
from db.connection import db_manager, get_db, init_db, close_db
from db.migrations import migrate

__all__ = [
    # Schema tables
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
    # Connection management
    'db_manager',
    'get_db',
    'init_db',
    'close_db',
    # Migrations
    'migrate',
]
