"""
Admin Data Engine — Bulk Yahoo Finance data sync with JSON file database.
Fetches market data and stores it locally for user-facing APIs.
"""
import yfinance as yf
import json
import os
import logging
from datetime import datetime
from typing import Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# JSON database directory
DATA_DIR = Path(__file__).parent.parent / "data" / "stocks"
LOGS_FILE = Path(__file__).parent.parent / "data" / "sync_logs.json"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)

# In-memory sync logs
_sync_logs: list[dict] = []
MAX_LOGS = 200


def _log(level: str, message: str, ticker: str = ""):
    """Add a sync log entry."""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "level": level,
        "message": message,
        "ticker": ticker,
    }
    _sync_logs.insert(0, entry)
    if len(_sync_logs) > MAX_LOGS:
        _sync_logs.pop()

    # Persist logs
    try:
        with open(LOGS_FILE, "w") as f:
            json.dump(_sync_logs[:MAX_LOGS], f, indent=2)
    except Exception:
        pass


def _load_logs():
    """Load persisted logs on startup."""
    global _sync_logs
    try:
        if LOGS_FILE.exists():
            with open(LOGS_FILE, "r") as f:
                _sync_logs = json.load(f)
    except Exception:
        _sync_logs = []


# Load logs on import
_load_logs()


def sync_ticker(ticker: str) -> dict:
    """
    Fetch comprehensive data from Yahoo Finance and save to JSON database.
    Returns the synced data summary.
    """
    ticker = ticker.upper().strip()
    _log("info", f"Starting sync for {ticker}", ticker)

    try:
        stock = yf.Ticker(ticker)

        # 1. OHLCV History (1 year, daily)
        hist = stock.history(period="1y", interval="1d")
        ohlcv_data = []
        if not hist.empty:
            for idx, row in hist.iterrows():
                ohlcv_data.append({
                    "date": idx.strftime("%Y-%m-%d"),
                    "open": round(float(row["Open"]), 2),
                    "high": round(float(row["High"]), 2),
                    "low": round(float(row["Low"]), 2),
                    "close": round(float(row["Close"]), 2),
                    "volume": int(row["Volume"]),
                })

        # 2. Company Info
        info = stock.info
        company_info = {
            "name": info.get("longName", info.get("shortName", ticker)),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "country": info.get("country", "Unknown"),
            "website": info.get("website", ""),
            "description": info.get("longBusinessSummary", ""),
            "employees": info.get("fullTimeEmployees", 0),
            "exchange": info.get("exchange", "Unknown"),
            "currency": info.get("currency", "USD"),
        }

        # 3. Key Statistics
        key_stats = {
            "market_cap": info.get("marketCap", 0),
            "enterprise_value": info.get("enterpriseValue", 0),
            "pe_ratio": info.get("trailingPE", None),
            "forward_pe": info.get("forwardPE", None),
            "peg_ratio": info.get("pegRatio", None),
            "pb_ratio": info.get("priceToBook", None),
            "ps_ratio": info.get("priceToSalesTrailing12Months", None),
            "dividend_yield": info.get("dividendYield", None),
            "dividend_rate": info.get("dividendRate", None),
            "beta": info.get("beta", None),
            "fifty_two_week_high": info.get("fiftyTwoWeekHigh", None),
            "fifty_two_week_low": info.get("fiftyTwoWeekLow", None),
            "fifty_day_average": info.get("fiftyDayAverage", None),
            "two_hundred_day_average": info.get("twoHundredDayAverage", None),
            "avg_volume": info.get("averageVolume", 0),
            "avg_volume_10d": info.get("averageVolume10days", 0),
            "shares_outstanding": info.get("sharesOutstanding", 0),
            "float_shares": info.get("floatShares", 0),
            "roe": info.get("returnOnEquity", None),
            "roa": info.get("returnOnAssets", None),
            "revenue": info.get("totalRevenue", 0),
            "gross_profit": info.get("grossProfits", 0),
            "ebitda": info.get("ebitda", 0),
            "net_income": info.get("netIncomeToCommon", 0),
            "total_debt": info.get("totalDebt", 0),
            "total_cash": info.get("totalCash", 0),
            "operating_cashflow": info.get("operatingCashflow", 0),
            "free_cashflow": info.get("freeCashflow", 0),
            "profit_margin": info.get("profitMargins", None),
            "operating_margin": info.get("operatingMargins", None),
            "revenue_growth": info.get("revenueGrowth", None),
            "earnings_growth": info.get("earningsGrowth", None),
        }

        # 4. Current price
        current_price = None
        try:
            fast = stock.fast_info
            current_price = round(float(fast.get("lastPrice", 0)), 2)
        except Exception:
            if ohlcv_data:
                current_price = ohlcv_data[-1]["close"]

        # Build full record
        record = {
            "ticker": ticker,
            "company": company_info,
            "stats": key_stats,
            "current_price": current_price,
            "ohlcv": ohlcv_data,
            "data_points": len(ohlcv_data),
            "synced_at": datetime.now().isoformat(),
            "sync_version": 1,
        }

        # Save to JSON file
        filepath = DATA_DIR / f"{ticker}.json"
        with open(filepath, "w") as f:
            json.dump(record, f, indent=2)

        _log("info", f"Successfully synced {ticker}: {len(ohlcv_data)} data points, price=${current_price}", ticker)

        return {
            "ticker": ticker,
            "name": company_info["name"],
            "data_points": len(ohlcv_data),
            "current_price": current_price,
            "market_cap": key_stats["market_cap"],
            "sector": company_info["sector"],
            "synced_at": record["synced_at"],
            "status": "success",
        }

    except Exception as e:
        error_msg = f"Failed to sync {ticker}: {str(e)}"
        _log("error", error_msg, ticker)
        logger.error(error_msg)
        return {
            "ticker": ticker,
            "status": "error",
            "error": str(e),
            "synced_at": datetime.now().isoformat(),
        }


def bulk_sync(tickers: list[str]) -> dict:
    """Sync multiple tickers. Returns summary with results per ticker."""
    results = []
    success_count = 0
    error_count = 0

    _log("info", f"Starting bulk sync for {len(tickers)} tickers")

    for ticker in tickers:
        result = sync_ticker(ticker)
        results.append(result)
        if result.get("status") == "success":
            success_count += 1
        else:
            error_count += 1

    _log("info", f"Bulk sync complete: {success_count} success, {error_count} errors")

    return {
        "total": len(tickers),
        "success": success_count,
        "errors": error_count,
        "results": results,
    }


# Preset ticker lists
PRESET_TICKERS = {
    "us_tech": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "NFLX", "AMD", "INTC"],
    "sp500_top10": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK-B", "UNH", "JNJ"],
    "idx_lq45": [
        "BBCA.JK", "BBRI.JK", "BMRI.JK", "TLKM.JK", "ASII.JK",
        "UNVR.JK", "HMSP.JK", "BBNI.JK", "ICBP.JK", "KLBF.JK",
    ],
    "crypto": ["BTC-USD", "ETH-USD", "BNB-USD", "SOL-USD", "ADA-USD"],
    "commodities": ["GC=F", "SI=F", "CL=F", "NG=F", "HG=F"],
}


def get_sync_status() -> list[dict]:
    """Get sync status for all tickers in the database."""
    statuses = []
    if not DATA_DIR.exists():
        return statuses

    for file in sorted(DATA_DIR.glob("*.json")):
        try:
            with open(file, "r") as f:
                data = json.load(f)
            statuses.append({
                "ticker": data.get("ticker", file.stem),
                "name": data.get("company", {}).get("name", file.stem),
                "sector": data.get("company", {}).get("sector", "Unknown"),
                "data_points": data.get("data_points", 0),
                "current_price": data.get("current_price"),
                "market_cap": data.get("stats", {}).get("market_cap", 0),
                "synced_at": data.get("synced_at", ""),
                "file_size": file.stat().st_size,
            })
        except Exception as e:
            logger.error(f"Error reading {file}: {e}")
            statuses.append({
                "ticker": file.stem,
                "name": file.stem,
                "status": "corrupt",
                "error": str(e),
            })

    return statuses


def get_synced_data(ticker: str) -> Optional[dict]:
    """Get full synced data for a ticker from JSON database."""
    ticker = ticker.upper().strip()
    filepath = DATA_DIR / f"{ticker}.json"

    if not filepath.exists():
        return None

    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading synced data for {ticker}: {e}")
        return None


def get_all_synced_tickers() -> list[str]:
    """Get list of all synced ticker symbols."""
    if not DATA_DIR.exists():
        return []
    return sorted([f.stem for f in DATA_DIR.glob("*.json")])


def delete_ticker(ticker: str) -> bool:
    """Delete a ticker's data from the database."""
    ticker = ticker.upper().strip()
    filepath = DATA_DIR / f"{ticker}.json"

    if filepath.exists():
        filepath.unlink()
        _log("info", f"Deleted data for {ticker}", ticker)
        return True

    return False


def get_market_overview() -> dict:
    """Get aggregated market overview stats."""
    statuses = get_sync_status()

    total_tickers = len(statuses)
    total_data_points = sum(s.get("data_points", 0) for s in statuses)
    total_market_cap = sum(s.get("market_cap", 0) for s in statuses if s.get("market_cap"))
    total_db_size = sum(s.get("file_size", 0) for s in statuses)

    # Last sync time
    last_sync = ""
    if statuses:
        sync_times = [s.get("synced_at", "") for s in statuses if s.get("synced_at")]
        if sync_times:
            last_sync = max(sync_times)

    # Sectors breakdown
    sectors: dict[str, int] = {}
    for s in statuses:
        sector = s.get("sector", "Unknown")
        sectors[sector] = sectors.get(sector, 0) + 1

    return {
        "total_tickers": total_tickers,
        "total_data_points": total_data_points,
        "total_market_cap": total_market_cap,
        "total_db_size_bytes": total_db_size,
        "total_db_size_mb": round(total_db_size / (1024 * 1024), 2) if total_db_size else 0,
        "last_sync": last_sync,
        "sectors": sectors,
        "recent_logs": _sync_logs[:10],
    }


def search_yahoo_finance(query: str) -> list[dict]:
    """Search for tickers on Yahoo Finance."""
    try:
        import yfinance as yf
        # Use yfinance search
        results = []
        # Try direct ticker lookup
        try:
            stock = yf.Ticker(query.upper())
            info = stock.info
            if info and info.get("longName") or info.get("shortName"):
                results.append({
                    "symbol": query.upper(),
                    "name": info.get("longName", info.get("shortName", query.upper())),
                    "exchange": info.get("exchange", "Unknown"),
                    "type": info.get("quoteType", "Unknown"),
                    "sector": info.get("sector", ""),
                    "already_synced": (DATA_DIR / f"{query.upper()}.json").exists(),
                })
        except Exception:
            pass

        # Also try with common suffixes for Indonesian stocks
        if not results and not query.endswith(".JK"):
            try:
                jk_ticker = f"{query.upper()}.JK"
                stock = yf.Ticker(jk_ticker)
                info = stock.info
                if info and (info.get("longName") or info.get("shortName")):
                    results.append({
                        "symbol": jk_ticker,
                        "name": info.get("longName", info.get("shortName", jk_ticker)),
                        "exchange": info.get("exchange", "IDX"),
                        "type": info.get("quoteType", "EQUITY"),
                        "sector": info.get("sector", ""),
                        "already_synced": (DATA_DIR / f"{jk_ticker}.json").exists(),
                    })
            except Exception:
                pass

        return results

    except Exception as e:
        logger.error(f"Search error: {e}")
        return []


def get_logs(limit: int = 50, level: Optional[str] = None) -> list[dict]:
    """Get sync logs, optionally filtered by level."""
    logs = _sync_logs
    if level:
        logs = [l for l in logs if l.get("level") == level]
    return logs[:limit]
