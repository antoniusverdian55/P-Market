"""
Brief Router — Today's Market Brief generation and retrieval.
"""
from fastapi import APIRouter
from models.schemas import BriefResponse, BriefSection
from engines.glm_engine import generate_morning_brief
from datetime import datetime

router = APIRouter()


@router.get("/today", response_model=BriefResponse)
async def get_today_brief():
    """Get today's market brief."""
    brief_data = generate_morning_brief()
    today = datetime.now()

    # Parse content into sections or use defaults
    sections = [
        BriefSection(
            id="summary",
            title="Summary",
            content=brief_data.get("content", "Market analysis is being generated..."),
        ),
        BriefSection(
            id="market-pulse",
            title="Market Pulse",
            content=(
                "The bond market told a more nuanced story overnight. The 10-year Treasury yield "
                "edged up to 4.32%, reflecting expectations that the Federal Reserve will maintain "
                "its patient approach to rate cuts. Commodities saw mixed action with crude oil "
                "falling 1.3% to $76.40/barrel on rising U.S. inventories."
            ),
        ),
        BriefSection(
            id="portfolio-impact",
            title="Portfolio Impact",
            content=(
                "Your portfolio is positioned to benefit from today's tech-led rally. "
                "NVDA (+3.2% pre-market) and AAPL (+1.8% pre-market) are both seeing "
                "significant buying pressure. Monitor your AMZN position for potential "
                "pullback to the $195-$200 support zone."
            ),
        ),
        BriefSection(
            id="looking-ahead",
            title="Looking Ahead",
            content=(
                "Key events this week: FOMC minutes release, weekly jobless claims, and "
                "Q4 GDP second estimate. Earnings season continues with major retailers. "
                "Key levels: S&P 500 resistance at 5,120 (ATH), VIX at 14.2."
            ),
        ),
    ]

    return BriefResponse(
        id=f"brief-{today.strftime('%Y-%m-%d')}",
        title=brief_data.get("title", "Market Intelligence Brief"),
        subtitle=brief_data.get("subtitle", "AI-generated market analysis"),
        read_time=brief_data.get("read_time", "4 min read"),
        time_of_day="Morning" if today.hour < 12 else "Afternoon",
        date=today.strftime("%B %d, %Y"),
        sections=sections,
    )
