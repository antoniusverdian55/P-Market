"""
Admin Router — Admin-only endpoints for data management, sync, and monitoring.
"""
from fastapi import APIRouter, HTTPException, Query
from engines.admin_data_engine import (
    sync_ticker,
    bulk_sync,
    get_sync_status,
    get_synced_data,
    get_all_synced_tickers,
    delete_ticker,
    get_market_overview,
    search_yahoo_finance,
    get_logs,
    PRESET_TICKERS,
)
from models.schemas import BulkSyncRequest

router = APIRouter()


@router.post("/sync/{ticker}")
async def api_sync_ticker(ticker: str):
    """Sync data for a single ticker from Yahoo Finance."""
    result = sync_ticker(ticker)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Sync failed"))
    return result


@router.post("/sync/bulk")
async def api_bulk_sync(request: BulkSyncRequest):
    """Bulk sync multiple tickers from Yahoo Finance."""
    if not request.tickers:
        raise HTTPException(status_code=400, detail="No tickers provided")
    if len(request.tickers) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 tickers per bulk sync")

    result = bulk_sync(request.tickers)
    return result


@router.post("/sync/preset/{preset_name}")
async def api_sync_preset(preset_name: str):
    """Sync a preset list of tickers (us_tech, sp500_top10, idx_lq45, crypto, commodities)."""
    if preset_name not in PRESET_TICKERS:
        raise HTTPException(
            status_code=404,
            detail=f"Preset '{preset_name}' not found. Available: {list(PRESET_TICKERS.keys())}",
        )

    tickers = PRESET_TICKERS[preset_name]
    result = bulk_sync(tickers)
    result["preset"] = preset_name
    return result


@router.get("/status")
async def api_sync_status():
    """Get sync status for all tickers in the database."""
    statuses = get_sync_status()
    return {"tickers": statuses, "total": len(statuses)}


@router.get("/ticker/{ticker}")
async def api_get_ticker_data(ticker: str):
    """Get full synced data for a specific ticker."""
    data = get_synced_data(ticker)
    if not data:
        raise HTTPException(status_code=404, detail=f"No synced data found for {ticker}")
    return data


@router.delete("/ticker/{ticker}")
async def api_delete_ticker(ticker: str):
    """Delete a ticker's data from the database."""
    deleted = delete_ticker(ticker)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found in database")
    return {"message": f"Successfully deleted {ticker}", "ticker": ticker}


@router.get("/overview")
async def api_overview():
    """Get admin dashboard overview statistics."""
    return get_market_overview()


@router.get("/logs")
async def api_logs(
    limit: int = Query(default=50, ge=1, le=200),
    level: str = Query(default=None, description="Filter by level: info, warn, error"),
):
    """Get sync logs."""
    logs = get_logs(limit=limit, level=level)
    return {"logs": logs, "total": len(logs)}


@router.get("/search-yf/{query}")
async def api_search_yf(query: str):
    """Search for tickers on Yahoo Finance."""
    if len(query) < 1:
        raise HTTPException(status_code=400, detail="Query too short")
    results = search_yahoo_finance(query)
    return {"query": query, "results": results, "total": len(results)}


@router.get("/presets")
async def api_get_presets():
    """Get available preset ticker lists."""
    presets = {}
    for name, tickers in PRESET_TICKERS.items():
        presets[name] = {
            "name": name.replace("_", " ").title(),
            "tickers": tickers,
            "count": len(tickers),
        }
    return {"presets": presets}


@router.get("/tickers")
async def api_all_tickers():
    """Get list of all synced ticker symbols."""
    tickers = get_all_synced_tickers()
    return {"tickers": tickers, "total": len(tickers)}
