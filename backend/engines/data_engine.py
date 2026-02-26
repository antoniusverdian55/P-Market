"""
Data Engine — Fetches market data via yfinance with in-memory caching.
"""
import yfinance as yf
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Simple in-memory cache
_cache: dict[str, dict] = {}
_cache_ttl = timedelta(minutes=15)


def _cache_key(ticker: str, period: str, provider: str) -> str:
    return f"{provider}_{ticker}_{period}"


def get_ohlcv(ticker: str, period: str = "1y", interval: str = "1d", provider: str = "yfinance") -> list[dict]:
    """
    Fetch OHLCV data for a ticker using the specified provider.
    Supported providers: yfinance, alphavantage, quandl, openbb
    """
    provider = provider.lower()
    if provider in ["alphavantage", "quandl", "openbb"]:
        logger.warning(f"Provider '{provider}' requested but API keys not configured. Falling back to yfinance.")
        provider = "yfinance"

    if provider != "yfinance":
        logger.error(f"Unsupported provider: {provider}")
        return []

    key = _cache_key(ticker, period, provider)

    # Check cache
    if key in _cache:
        cached = _cache[key]
        if datetime.now() - cached["timestamp"] < _cache_ttl:
            return cached["data"]

    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period=period, interval=interval)

        if df.empty:
            return []

        data = []
        for idx, row in df.iterrows():
            data.append({
                "date": idx.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            })

        # Cache the result
        _cache[key] = {"data": data, "timestamp": datetime.now()}
        return data

    except Exception as e:
        logger.error(f"Error fetching data for {ticker} via {provider}: {e}")
        return []


def get_current_price(ticker: str, provider: str = "yfinance") -> Optional[float]:
    """Get the latest closing price for a ticker."""
    provider = provider.lower()
    if provider in ["alphavantage", "quandl", "openbb"]:
        logger.warning(f"Provider '{provider}' requested but API keys not configured. Falling back to yfinance.")
        provider = "yfinance"

    try:
        stock = yf.Ticker(ticker)
        info = stock.fast_info
        return round(float(info.get("lastPrice", 0)), 2)
    except Exception as e:
        logger.error(f"Error fetching current price for {ticker}: {e}")
        return None


def get_company_info(ticker: str, provider: str = "yfinance") -> dict:
    """Get basic company information."""
    provider = provider.lower()
    if provider in ["alphavantage", "quandl", "openbb"]:
        logger.warning(f"Provider '{provider}' requested but API keys not configured. Falling back to yfinance.")
        provider = "yfinance"

    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return {
            "name": info.get("longName", ticker),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "market_cap": info.get("marketCap", 0),
            "pe_ratio": info.get("trailingPE", None),
            "dividend_yield": info.get("dividendYield", None),
        }
    except Exception as e:
        logger.error(f"Error fetching company info for {ticker}: {e}")
        return {"name": ticker, "sector": "Unknown"}
