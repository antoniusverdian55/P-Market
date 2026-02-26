"""
Portfolio Router — Portfolio metrics and position management.
"""
from fastapi import APIRouter
from engines.quant_engine import calculate_portfolio_metrics
from models.schemas import PortfolioMetricsResponse

router = APIRouter()

# Mock portfolio equity curve for demo
_mock_equity = [194000 + i * 148 + (i % 7 - 3) * 520 for i in range(365)]
_mock_benchmark = [194000 + i * 90 + (i % 5 - 2) * 310 for i in range(365)]


@router.get("/metrics", response_model=PortfolioMetricsResponse)
async def get_portfolio_metrics():
    """Calculate portfolio performance metrics."""
    metrics = calculate_portfolio_metrics(_mock_equity, _mock_benchmark)

    net_liquidity = _mock_equity[-1]
    daily_pnl = _mock_equity[-1] - _mock_equity[-2]
    daily_pnl_pct = (daily_pnl / _mock_equity[-2]) * 100

    return PortfolioMetricsResponse(
        net_liquidity=round(net_liquidity, 2),
        daily_pnl=round(daily_pnl, 2),
        daily_pnl_percent=round(daily_pnl_pct, 2),
        sharpe_ratio=metrics["sharpe_ratio"],
        sortino_ratio=metrics["sortino_ratio"],
        max_drawdown=metrics["max_drawdown"],
        volatility=metrics["volatility"],
        beta=metrics["beta"],
        total_return=metrics["total_return"],
        total_return_percent=metrics["total_return_percent"],
    )


@router.get("/equity-curve")
async def get_equity_curve():
    """Get portfolio equity curve data for charting."""
    from datetime import datetime, timedelta

    start = datetime(2024, 1, 1)
    data = []
    for i, (port, bench) in enumerate(zip(_mock_equity, _mock_benchmark)):
        date = start + timedelta(days=i)
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "portfolio": round(port, 2),
            "benchmark": round(bench, 2),
        })

    return {"data": data, "count": len(data)}


@router.get("/positions")
async def get_positions():
    """Get current portfolio positions."""
    # Mock positions - in production, fetched from DB
    positions = [
        {"symbol": "AAPL", "name": "Apple Inc.", "shares": 150, "cost_basis": 142.5, "sector": "Technology"},
        {"symbol": "MSFT", "name": "Microsoft Corp.", "shares": 80, "cost_basis": 310.25, "sector": "Technology"},
        {"symbol": "NVDA", "name": "NVIDIA Corp.", "shares": 45, "cost_basis": 450.0, "sector": "Technology"},
        {"symbol": "VOO", "name": "Vanguard S&P 500 ETF", "shares": 60, "cost_basis": 380.0, "sector": "Index Fund"},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "shares": 100, "cost_basis": 105.0, "sector": "Technology"},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "shares": 55, "cost_basis": 127.5, "sector": "Consumer"},
    ]
    return {"positions": positions, "count": len(positions)}
