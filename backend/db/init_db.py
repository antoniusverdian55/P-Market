"""
Database Initialization Script
Run this to set up your PostgreSQL database.
"""
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from db.connection import db_manager
from db.migrations import migrate


async def init_database():
    """Initialize database with all migrations."""
    print("🔧 Initializing database connection...")
    
    try:
        # Connect to database
        await db_manager.connect()
        
        # Run migrations
        await migrate(db_manager)
        
        # Insert default settings
        await insert_default_settings()
        
        print("\n✅ Database initialization completed successfully!\n")
        
    except Exception as e:
        print(f"\n❌ Database initialization failed: {e}\n")
        raise
    finally:
        await db_manager.disconnect()


async def insert_default_settings():
    """Insert default system settings."""
    from db.schema import system_settings
    from datetime import datetime
    
    default_settings = [
        {
            'key': 'app_config',
            'value': {
                'maintenance_mode': False,
                'registration_enabled': True,
                'min_deposit': 1000,
                'max_positions': 50,
            },
            'description': 'Application configuration settings',
            'category': 'system',
        },
        {
            'key': 'market_hours',
            'value': {
                'open': '09:30',
                'close': '16:00',
                'timezone': 'America/New_York',
            },
            'description': 'Stock market trading hours',
            'category': 'market',
        },
        {
            'key': 'risk_limits',
            'value': {
                'max_position_size': 0.10,  # 10% of portfolio
                'max_sector_exposure': 0.30,  # 30% of portfolio
                'max_drawdown_limit': 0.20,  # 20% max drawdown
            },
            'description': 'Risk management limits',
            'category': 'risk',
        },
        {
            'key': 'data_providers',
            'value': {
                'primary': 'yfinance',
                'fallback': 'alphavantage',
                'update_frequency': 'daily',
            },
            'description': 'Market data provider configuration',
            'category': 'data',
        },
    ]
    
    print("\n📝 Inserting default system settings...")
    
    for setting in default_settings:
        try:
            # Check if setting exists
            existing = await db_manager.fetch_one(
                system_settings.select().where(system_settings.key == setting['key'])
            )
            
            if not existing:
                await db_manager.execute(
                    system_settings.insert().values(**setting)
                )
                print(f"  ✅ Added: {setting['key']}")
            else:
                print(f"  ⏭️  Skipped (exists): {setting['key']}")
        except Exception as e:
            print(f"  ❌ Failed to add {setting['key']}: {e}")


async def create_sample_user():
    """Create a sample user for testing."""
    from db.schema import users, user_profiles, portfolios
    import uuid
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    sample_user = {
        'id': uuid.uuid4(),
        'email': 'demo@pmarket.com',
        'username': 'demo_trader',
        'password_hash': pwd_context.hash('demo123'),
        'full_name': 'Demo Trader',
        'is_active': True,
        'is_verified': True,
        'role': 'user',
    }
    
    try:
        # Check if user exists
        existing = await db_manager.fetch_one(
            users.select().where(users.email == sample_user['email'])
        )
        
        if existing:
            print("\n⏭️  Sample user already exists")
            return
        
        # Create user
        await db_manager.execute(users.insert().values(**sample_user))
        print("\n✅ Sample user created: demo@pmarket.com / demo123")
        
        # Create user profile
        profile = {
            'user_id': sample_user['id'],
            'bio': 'Sample demo account for testing',
            'country': 'United States',
            'timezone': 'America/New_York',
            'currency': 'USD',
            'risk_tolerance': 'medium',
        }
        await db_manager.execute(user_profiles.insert().values(**profile))
        
        # Create sample portfolio
        portfolio = {
            'user_id': sample_user['id'],
            'name': 'Demo Portfolio',
            'description': 'Sample portfolio for testing',
            'initial_capital': 100000,
            'current_value': 100000,
            'cash_balance': 100000,
            'is_active': True,
            'is_public': False,
        }
        await db_manager.execute(portfolios.insert().values(**portfolio))
        
        print("✅ Sample portfolio created")
        
    except Exception as e:
        print(f"❌ Failed to create sample user: {e}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print(" P MARKET - Database Initialization")
    print("="*60 + "\n")
    
    # Check if DATABASE_URL is set
    if not os.getenv("DATABASE_URL"):
        print("⚠️  Warning: DATABASE_URL not set in .env file")
        print("Using default: postgresql://postgres:postgres@localhost:5432/pmarket\n")
    
    # Run initialization
    asyncio.run(init_database())
    
    # Optionally create sample user
    create_sample = input("\nCreate sample demo user? (y/n): ").lower().strip()
    if create_sample == 'y':
        asyncio.run(create_sample_user())
    
    print("\n" + "="*60)
    print(" Done!")
    print("="*60 + "\n")
