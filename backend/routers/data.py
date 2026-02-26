"""
Data Router — Market data endpoints for OHLCV and company info.
"""
from fastapi import APIRouter, HTTPException, Query
from engines.data_engine import get_ohlcv, get_current_price, get_company_info

router = APIRouter()


@router.get("/ohlcv/{ticker}")
async def fetch_ohlcv(
    ticker: str,
    period: str = Query(default="1y", regex="^(1d|5d|1mo|3mo|6mo|1y|2y|5y|max)$"),
    interval: str = Query(default="1d", regex="^(1m|2m|5m|15m|30m|60m|90m|1h|1d|5d|1wk|1mo|3mo)$"),
    provider: str = Query(default="yfinance", description="Data provider (yfinance, alphavantage, quandl, openbb)"),
):
    """Fetch OHLCV data for a given ticker."""
    data = get_ohlcv(ticker, period=period, interval=interval, provider=provider)
    if not data:
        raise HTTPException(status_code=404, detail=f"No data found for ticker: {ticker}")

    return {"ticker": ticker, "data": data, "period": period, "count": len(data), "provider": provider}


@router.get("/price/{ticker}")
async def fetch_price(ticker: str, provider: str = Query(default="yfinance")):
    """Get current price for a ticker."""
    price = get_current_price(ticker, provider=provider)
    if price is None:
        raise HTTPException(status_code=404, detail=f"Cannot fetch price for: {ticker}")

    return {"ticker": ticker, "price": price, "provider": provider}


@router.get("/info/{ticker}")
async def fetch_company_info(ticker: str, provider: str = Query(default="yfinance")):
    """Get company information for a ticker."""
    info = get_company_info(ticker, provider=provider)
    return {"ticker": ticker, **info, "provider": provider}
