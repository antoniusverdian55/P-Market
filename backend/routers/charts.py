"""
Charts Router — API endpoints for interactive Plotly charts.
"""
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from engines.viz_engine import (
    create_candlestick_chart,
    create_equity_curve_chart,
    create_drawdown_chart,
    create_returns_distribution_chart,
    create_sector_allocation_chart,
    create_volatility_chart,
    create_correlation_heatmap,
    figure_to_json,
)
from engines.data_engine import get_ohlcv
from engines.quant_engine import calculate_portfolio_metrics

router = APIRouter()

# Mock data for demo
_mock_equity = [194000 + i * 148 + (i % 7 - 3) * 520 for i in range(365)]
_mock_benchmark = [194000 + i * 90 + (i % 5 - 2) * 310 for i in range(365)]
_mock_returns = [0.001 * (i % 10 - 4.5) + 0.0005 * (i % 7) for i in range(365)]
_mock_positions = [
    {"symbol": "AAPL", "name": "Apple Inc.", "shares": 150, "cost_basis": 142.5, "sector": "Technology"},
    {"symbol": "MSFT", "name": "Microsoft Corp.", "shares": 80, "cost_basis": 310.25, "sector": "Technology"},
    {"symbol": "NVDA", "name": "NVIDIA Corp.", "shares": 45, "cost_basis": 450.0, "sector": "Technology"},
    {"symbol": "VOO", "name": "Vanguard S&P 500 ETF", "shares": 60, "cost_basis": 380.0, "sector": "Index Fund"},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "shares": 100, "cost_basis": 105.0, "sector": "Technology"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "shares": 55, "cost_basis": 127.5, "sector": "Consumer"},
]


@router.get("/candlestick")
async def get_candlestick_chart(
    ticker: str = Query("AAPL", description="Stock ticker symbol"),
    period: str = Query("1y", description="Time period"),
):
    """Get interactive candlestick chart for a stock."""
    ohlcv_data = get_ohlcv(ticker, period=period)
    
    if not ohlcv_data:
        return {"error": f"No data found for {ticker}"}
    
    fig = create_candlestick_chart(ohlcv_data, title=f"{ticker} Price Chart")
    return JSONResponse(content=figure_to_json(fig))


@router.get("/equity-curve")
async def get_equity_curve_chart():
    """Get interactive portfolio equity curve chart."""
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

    fig = create_equity_curve_chart(data, title="Portfolio vs Benchmark Performance")
    return JSONResponse(content=figure_to_json(fig))


@router.get("/drawdown")
async def get_drawdown_chart():
    """Get interactive drawdown analysis chart."""
    fig = create_drawdown_chart(_mock_equity, title="Portfolio Drawdown Analysis")
    return JSONResponse(content=figure_to_json(fig))


@router.get("/returns-distribution")
async def get_returns_distribution_chart():
    """Get returns distribution histogram."""
    fig = create_returns_distribution_chart(_mock_returns, title="Daily Returns Distribution")
    return JSONResponse(content=figure_to_json(fig))


@router.get("/sector-allocation")
async def get_sector_allocation_chart():
    """Get sector allocation pie chart."""
    fig = create_sector_allocation_chart(_mock_positions, title="Portfolio Sector Allocation")
    return JSONResponse(content=figure_to_json(fig))


@router.get("/volatility")
async def get_volatility_chart(
    window: int = Query(20, description="Rolling window in days"),
):
    """Get rolling volatility chart."""
    fig = create_volatility_chart(_mock_returns, window=window, title=f"{window}-Day Rolling Volatility")
    return JSONResponse(content=figure_to_json(fig))


@router.get("/correlation")
async def get_correlation_heatmap():
    """Get correlation heatmap for portfolio assets."""
    # Mock correlation data for demo
    returns_dict = {
        "AAPL": _mock_returns,
        "MSFT": [r * 0.9 for r in _mock_returns],
        "NVDA": [r * 1.3 for r in _mock_returns],
        "GOOGL": [r * 0.85 for r in _mock_returns],
        "AMZN": [r * 0.95 for r in _mock_returns],
    }
    fig = create_correlation_heatmap(returns_dict, title="Asset Correlation Matrix")
    return JSONResponse(content=figure_to_json(fig))


@router.get("/dashboard")
async def get_dashboard_charts():
    """Get all charts for the main dashboard."""
    charts = {
        "equity_curve": figure_to_json(create_equity_curve_chart(_mock_equity)),
        "drawdown": figure_to_json(create_drawdown_chart(_mock_equity)),
        "sector_allocation": figure_to_json(create_sector_allocation_chart(_mock_positions)),
        "returns_distribution": figure_to_json(create_returns_distribution_chart(_mock_returns)),
    }
    return JSONResponse(content=charts)
