"""
Seed Database with Sample Data
Run this after migrations to populate test data.
"""
import asyncio
import os
from datetime import datetime, timedelta
from decimal import Decimal
from dotenv import load_dotenv

load_dotenv()

from db.connection import db_manager


async def seed_sample_data():
    """Seed database with sample market and portfolio data."""
    print("\n🌱 Seeding sample data...\n")
    
    try:
        await db_manager.connect()
        
        # Seed market data for popular stocks
        await seed_market_data()
        
        # Seed sample portfolio positions
        await seed_portfolio_data()
        
        # Seed market briefs
        await seed_market_briefs()
        
        print("\n✅ Sample data seeded successfully!\n")
        
    except Exception as e:
        print(f"\n❌ Seeding failed: {e}\n")
        raise
    finally:
        await db_manager.disconnect()


async def seed_market_data():
    """Seed historical market data for major stocks."""
    from db.schema import market_data
    
    stocks = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'VOO']
    
    # Base prices for each stock
    base_prices = {
        'AAPL': 175.0,
        'MSFT': 380.0,
        'NVDA': 480.0,
        'GOOGL': 140.0,
        'AMZN': 175.0,
        'VOO': 420.0,
    }
    
    print("\n📊 Seeding market data...")
    
    # Generate 365 days of data
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    
    for symbol in stocks:
        print(f"  Generating data for {symbol}...")
        base_price = base_prices[symbol]
        
        # Generate daily data
        current_price = base_price * 0.85  # Start 15% lower
        records = []
        
        for day in range(365):
            date = start_date + timedelta(days=day)
            
            # Skip weekends
            if date.weekday() >= 5:
                continue
            
            # Random daily movement (-2% to +2%)
            daily_change = 1 + (hash(str(date) + symbol) % 400 - 200) / 10000
            current_price *= daily_change
            
            # Generate OHLCV
            open_price = current_price
            close_price = current_price * (1 + (hash(date.strftime('%Y%m%d') + symbol) % 200 - 100) / 10000)
            high_price = max(open_price, close_price) * (1 + abs(hash(date.strftime('%Y%m%d') + symbol) % 100) / 10000)
            low_price = min(open_price, close_price) * (1 - abs(hash(date.strftime('%Y%m%d') + symbol + 'low') % 100) / 10000)
            volume = int(50000000 + hash(date.strftime('%Y%m%d') + symbol + 'vol') % 50000000)
            
            records.append({
                'symbol': symbol,
                'date': date.date(),
                'open': round(open_price, 4),
                'high': round(high_price, 4),
                'low': round(low_price, 4),
                'close': round(close_price, 4),
                'volume': volume,
                'adjusted_close': round(close_price, 4),
            })
        
        # Batch insert
        if records:
            await db_manager.execute(market_data.insert(), records)
            print(f"    ✅ {len(records)} records inserted")


async def seed_portfolio_data():
    """Seed sample portfolio with positions."""
    from db.schema import portfolios, positions, transactions
    
    print("\n💼 Seeding portfolio data...")
    
    # Use first user or create demo user
    from db.schema import users, user_profiles
    
    # Check for existing user
    existing_user = await db_manager.fetch_one(
        users.select().where(users.email == 'demo@pmarket.com')
    )
    
    if not existing_user:
        print("  ⏭️  No demo user found, skipping portfolio seeding")
        return
    
    user_id = existing_user['id']
    
    # Check for existing portfolio
    existing_portfolio = await db_manager.fetch_one(
        portfolios.select().where(portfolios.user_id == user_id)
    )
    
    if existing_portfolio:
        print("  ⏭️  Portfolio already exists, skipping")
        return
    
    # Create portfolio
    portfolio_data = {
        'user_id': user_id,
        'name': 'Growth Portfolio',
        'description': 'Long-term growth focused portfolio',
        'initial_capital': Decimal('100000.00'),
        'current_value': Decimal('100000.00'),
        'cash_balance': Decimal('15000.00'),
        'currency': 'USD',
        'is_active': True,
        'is_public': False,
        'benchmark_symbol': 'VOO',
    }
    
    result = await db_manager.execute(portfolios.insert().values(**portfolio_data))
    portfolio_id = result
    
    print(f"  ✅ Portfolio created (ID: {portfolio_id})")
    
    # Create sample positions
    sample_positions = [
        {'symbol': 'AAPL', 'name': 'Apple Inc.', 'shares': 150, 'avg_cost': 172.50, 'sector': 'Technology'},
        {'symbol': 'MSFT', 'name': 'Microsoft Corp.', 'shares': 80, 'avg_cost': 365.25, 'sector': 'Technology'},
        {'symbol': 'NVDA', 'name': 'NVIDIA Corp.', 'shares': 45, 'avg_cost': 450.00, 'sector': 'Technology'},
        {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'shares': 100, 'avg_cost': 138.50, 'sector': 'Technology'},
        {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'shares': 55, 'avg_cost': 170.25, 'sector': 'Consumer'},
        {'symbol': 'VOO', 'name': 'Vanguard S&P 500 ETF', 'shares': 60, 'avg_cost': 410.00, 'sector': 'Index Fund'},
    ]
    
    print("  Creating positions...")
    
    for pos_data in sample_positions:
        # Get current price from market data
        market_query = market_data.select().where(
            (market_data.symbol == pos_data['symbol'])
        ).order_by(market_data.date.desc()).limit(1)
        
        market_row = await db_manager.fetch_one(market_query)
        current_price = market_row['close'] if market_row else Decimal(str(pos_data['avg_cost']))
        
        market_value = Decimal(str(pos_data['shares'])) * current_price
        avg_cost = Decimal(str(pos_data['avg_cost']))
        unrealized_pnl = (current_price - avg_cost) * Decimal(str(pos_data['shares']))
        unrealized_pnl_pct = (unrealized_pnl / (avg_cost * Decimal(str(pos_data['shares'])))) * 100
        
        position = {
            'portfolio_id': portfolio_id,
            'symbol': pos_data['symbol'],
            'name': pos_data['name'],
            'asset_type': 'stock',
            'shares': Decimal(str(pos_data['shares'])),
            'average_cost': avg_cost,
            'current_price': current_price,
            'market_value': market_value,
            'unrealized_pnl': unrealized_pnl,
            'unrealized_pnl_percent': unrealized_pnl_pct,
            'sector': pos_data['sector'],
            'is_active': True,
        }
        
        await db_manager.execute(positions.insert().values(**position))
        print(f"    ✅ {pos_data['symbol']}: {pos_data['shares']} shares")
    
    # Create sample transactions
    print("  Creating sample transactions...")
    
    for pos_data in sample_positions:
        transaction = {
            'portfolio_id': portfolio_id,
            'position_id': None,  # Would need to fetch position ID
            'transaction_type': 'buy',
            'symbol': pos_data['symbol'],
            'shares': Decimal(str(pos_data['shares'])),
            'price': Decimal(str(pos_data['avg_cost'])),
            'total_amount': Decimal(str(pos_data['shares'])) * Decimal(str(pos_data['avg_cost'])),
            'commission': Decimal('0.00'),
            'currency': 'USD',
            'exchange': 'NASDAQ',
            'executed_at': datetime.now() - timedelta(days=90),
        }
        
        await db_manager.execute(transactions.insert().values(**transaction))


async def seed_market_briefs():
    """Seed sample market briefs and AI insights."""
    from db.schema import market_briefs, ai_insights
    
    print("\n📰 Seeding market briefs...")
    
    sample_briefs = [
        {
            'title': 'Tech Stocks Rally on Strong Earnings',
            'summary': 'Major technology companies exceeded Q4 expectations, driving market gains.',
            'content': 'Technology sector led the market higher today as major companies reported better-than-expected earnings. Apple, Microsoft, and NVIDIA all posted strong results...',
            'sentiment': 'bullish',
            'market_impact': 'high',
            'categories': ['earnings', 'technology'],
            'tags': ['AAPL', 'MSFT', 'NVDA', 'earnings'],
            'source': 'Market Analysis',
            'published_at': datetime.now() - timedelta(hours=2),
        },
        {
            'title': 'Fed Signals Potential Rate Cuts in 2024',
            'summary': 'Federal Reserve hints at possible interest rate reductions.',
            'content': 'In today\'s FOMC meeting minutes, the Federal Reserve indicated a potential shift in monetary policy...',
            'sentiment': 'bullish',
            'market_impact': 'high',
            'categories': ['monetary policy', 'economy'],
            'tags': ['Fed', 'interest rates', 'economy'],
            'source': 'Economic News',
            'published_at': datetime.now() - timedelta(hours=6),
        },
        {
            'title': 'Market Volatility Expected Ahead of Jobs Report',
            'summary': 'Investors brace for potential market moves.',
            'content': 'With the monthly jobs report scheduled for release this Friday, market participants are preparing for increased volatility...',
            'sentiment': 'neutral',
            'market_impact': 'medium',
            'categories': ['economic data', 'employment'],
            'tags': ['jobs', 'volatility', 'economic data'],
            'source': 'Market Analysis',
            'published_at': datetime.now() - timedelta(days=1),
        },
    ]
    
    for brief_data in sample_briefs:
        # Check if exists
        existing = await db_manager.fetch_one(
            market_briefs.select().where(market_briefs.title == brief_data['title'])
        )
        
        if not existing:
            result = await db_manager.execute(market_briefs.insert().values(**brief_data))
            print(f"  ✅ Added: {brief_data['title']}")
        else:
            print(f"  ⏭️  Skipped: {brief_data['title']}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print(" P MARKET - Database Seeding")
    print("="*60 + "\n")
    
    asyncio.run(seed_sample_data())
    
    print("\n" + "="*60)
    print(" Seeding Complete!")
    print("="*60 + "\n")
