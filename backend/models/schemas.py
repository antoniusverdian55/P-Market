"""
Pydantic schemas for Cube Trade API request/response models.
"""
from pydantic import BaseModel, Field
from typing import Optional


# ===== Data Engine Schemas =====
class OHLCVResponse(BaseModel):
    ticker: str
    data: list[dict]
    period: str
    count: int


# ===== Portfolio Schemas =====
class PositionInput(BaseModel):
    symbol: str
    shares: float
    cost_basis: float


class PortfolioMetricsResponse(BaseModel):
    net_liquidity: float
    daily_pnl: float
    daily_pnl_percent: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    volatility: float
    beta: float
    total_return: float
    total_return_percent: float


class PositionResponse(BaseModel):
    symbol: str
    name: str
    shares: float
    cost_basis: float
    current_price: float
    percent_change: float
    daily_pnl: float
    total_pnl: float
    sector: Optional[str] = None


# ===== Chat Schemas =====
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    mode: str = Field(default="simple", pattern="^(simple|advanced)$")


class ChatResponse(BaseModel):
    id: str
    role: str = "assistant"
    content: str
    timestamp: str
    has_chart: bool = False


# ===== Brief Schemas =====
class BriefSection(BaseModel):
    id: str
    title: str
    content: str


class BriefResponse(BaseModel):
    id: str
    title: str
    subtitle: str
    read_time: str
    time_of_day: str
    date: str
    sections: list[BriefSection]


# ===== Admin Schemas =====
class BulkSyncRequest(BaseModel):
    tickers: list[str] = Field(..., min_length=1, max_length=50)
