"""
GLM-4 Integration Engine — ZhipuAI prompt pipeline for AI analysis.
"""
import os
from datetime import datetime
from typing import Optional, AsyncGenerator

try:
    from zhipuai import ZhipuAI
except ImportError:
    ZhipuAI = None  # type: ignore


# System prompt for financial analysis
SYSTEM_PROMPT = """You are Cube Trade, an elite quantitative analyst and financial advisor AI. 
You analyze market data, portfolio performance, and provide institutional-grade insights.

Your communication style:
- Professional yet accessible
- Data-driven with specific numbers and metrics
- Use markdown formatting (headers, bold, lists, blockquotes)
- Provide actionable recommendations
- Always caveat that this is analysis, not financial advice

When analyzing portfolios:
- Reference specific positions and their performance
- Calculate risk metrics context
- Compare against benchmarks (S&P 500)
- Identify concentration risks and diversification opportunities

When discussing markets:
- Reference current macro conditions
- Identify key support/resistance levels
- Discuss sector rotation and institutional flows
- Provide both bull and bear scenarios
"""


def _get_client() -> Optional[object]:
    """Initialize ZhipuAI client if API key is available."""
    api_key = os.getenv("ZHIPUAI_API_KEY")
    if not api_key or ZhipuAI is None:
        return None
    return ZhipuAI(api_key=api_key)


def build_analysis_prompt(
    user_message: str,
    portfolio_context: Optional[dict] = None,
    market_data: Optional[dict] = None,
) -> list[dict]:
    """Build the prompt messages for GLM-4."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add context if available
    context_parts = []

    if portfolio_context:
        context_parts.append(
            f"User's Portfolio Context:\n"
            f"- Net Liquidity: ${portfolio_context.get('net_liquidity', 'N/A'):,.2f}\n"
            f"- Daily P/L: ${portfolio_context.get('daily_pnl', 'N/A'):,.2f}\n"
            f"- Positions: {portfolio_context.get('positions', 'N/A')}\n"
        )

    if market_data:
        context_parts.append(
            f"Market Data Context:\n"
            f"- Ticker: {market_data.get('ticker', 'N/A')}\n"
            f"- Current Price: ${market_data.get('price', 'N/A')}\n"
            f"- Data: {market_data.get('analysis', 'N/A')}\n"
        )

    if context_parts:
        context_msg = (
            "Here is the relevant context for this analysis:\n\n"
            + "\n".join(context_parts)
            + "\n\nNow answer the user's question based on this data."
        )
        messages.append({"role": "assistant", "content": context_msg})

    messages.append({"role": "user", "content": user_message})
    return messages


def chat_completion(
    user_message: str,
    portfolio_context: Optional[dict] = None,
    market_data: Optional[dict] = None,
) -> str:
    """Send a chat completion request to GLM-4."""
    client = _get_client()

    if client is None:
        # Fallback mock response when no API key
        return _generate_mock_response(user_message)

    try:
        messages = build_analysis_prompt(user_message, portfolio_context, market_data)
        response = client.chat.completions.create(
            model="glm-4",
            messages=messages,
            temperature=0.7,
            max_tokens=2048,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"⚠️ GLM-4 analysis temporarily unavailable: {str(e)}"


async def chat_completion_stream(
    user_message: str,
    portfolio_context: Optional[dict] = None,
    market_data: Optional[dict] = None,
) -> AsyncGenerator[str, None]:
    """Stream chat completion from GLM-4."""
    client = _get_client()

    if client is None:
        # Fallback mock streaming
        mock = _generate_mock_response(user_message)
        for word in mock.split(" "):
            yield word + " "
        return

    try:
        messages = build_analysis_prompt(user_message, portfolio_context, market_data)
        response = client.chat.completions.create(
            model="glm-4",
            messages=messages,
            temperature=0.7,
            max_tokens=2048,
            stream=True,
        )
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        yield f"⚠️ Streaming error: {str(e)}"


def generate_morning_brief(market_summary: Optional[str] = None) -> dict:
    """Generate today's market brief using GLM-4."""
    client = _get_client()

    prompt = (
        "Write a professional morning market briefing for today, "
        f"{datetime.now().strftime('%B %d, %Y')}. "
        "Structure it with these sections: Summary, Market Pulse, Portfolio Impact, Looking Ahead. "
        "Use a journalistic, Wall Street Journal editorial style. "
        "Include specific index levels, sector performance, and macro drivers. "
        "Keep each section 2-3 paragraphs."
    )

    if market_summary:
        prompt += f"\n\nAdditional market context: {market_summary}"

    if client is None:
        return _generate_mock_brief()

    try:
        response = client.chat.completions.create(
            model="glm-4",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            max_tokens=3000,
        )
        content = response.choices[0].message.content
        return {
            "title": "Markets Open Higher as Tech Earnings Season Delivers",
            "subtitle": "Wall Street rallies on strong semiconductor guidance",
            "content": content,
            "read_time": "4 min read",
        }
    except Exception:
        return _generate_mock_brief()


def _generate_mock_response(user_message: str) -> str:
    """Generate a mock AI response when no API key is configured."""
    return (
        f"Thank you for your question about *\"{user_message[:80]}\"*.\n\n"
        "### Analysis Summary\n\n"
        "Based on the current market conditions and your portfolio composition, "
        "here are the key observations:\n\n"
        "1. **Market Trend** — The broader market continues to show bullish momentum, "
        "with the S&P 500 trading above its 20-day and 50-day moving averages\n"
        "2. **Portfolio Assessment** — Your portfolio's beta of 1.12 suggests slightly "
        "higher volatility than the benchmark, primarily driven by tech concentration\n"
        "3. **Risk Metrics** — Sharpe ratio of 1.87 indicates strong risk-adjusted returns\n\n"
        "> 💡 *Note: This is a simulated response. Configure your ZhipuAI API key "
        "in the `.env` file to enable live GLM-4 analysis.*\n\n"
        "---\n"
        "*Cube Trade Intelligence — Powered by GLM-4*"
    )


def _generate_mock_brief() -> dict:
    """Generate a mock morning brief."""
    return {
        "title": "Markets Open Higher as Tech Earnings Season Delivers",
        "subtitle": "Wall Street rallies on strong semiconductor guidance and resilient consumer spending data",
        "content": "Mock brief content — configure ZhipuAI API key to enable live generation.",
        "read_time": "4 min read",
    }
