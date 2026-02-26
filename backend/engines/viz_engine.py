"""
Visualization Engine — Interactive Plotly charts for financial data.
"""
import plotly.graph_objects as go
import plotly.io as pio
from typing import Optional
import pandas as pd
import numpy as np

# Set default template
pio.templates.default = "plotly_dark"


def create_candlestick_chart(
    ohlcv_data: list[dict],
    title: str = "Price Chart",
    height: int = 500,
) -> go.Figure:
    """Create an interactive candlestick chart."""
    if not ohlcv_data:
        return go.Figure()

    df = pd.DataFrame(ohlcv_data)
    df["date"] = pd.to_datetime(df["date"])

    fig = go.Figure(
        data=[
            go.Candlestick(
                x=df["date"],
                open=df["open"],
                high=df["high"],
                low=df["low"],
                close=df["close"],
                name="OHLC",
                increasing_line_color="#00E676",
                decreasing_line_color="#FF5252",
            )
        ]
    )

    fig.update_layout(
        title=title,
        height=height,
        xaxis_title="Date",
        yaxis_title="Price ($)",
        template="plotly_dark",
        xaxis_rangeslider_visible=False,
        showlegend=False,
        margin=dict(l=60, r=20, t=50, b=20),
    )

    return fig


def create_line_chart(
    data: list[dict],
    y_columns: list[str],
    title: str = "Trend Chart",
    x_column: str = "date",
    colors: Optional[list[str]] = None,
    height: int = 400,
) -> go.Figure:
    """Create a multi-line chart for time series data."""
    if not data:
        return go.Figure()

    df = pd.DataFrame(data)
    if x_column in df.columns:
        df[x_column] = pd.to_datetime(df[x_column])

    fig = go.Figure()

    default_colors = ["#2979FF", "#FF4081", "#00E676", "#FFD740", "#7C4DFF"]
    colors = colors or default_colors

    for i, col in enumerate(y_columns):
        if col in df.columns:
            fig.add_trace(
                go.Scatter(
                    x=df[x_column],
                    y=df[col],
                    name=col.replace("_", " ").title(),
                    line=dict(color=colors[i % len(colors)], width=2),
                    mode="lines",
                )
            )

    fig.update_layout(
        title=title,
        height=height,
        xaxis_title="Date",
        yaxis_title="Value",
        template="plotly_dark",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        margin=dict(l=60, r=20, t=50, b=20),
        hovermode="x unified",
    )

    return fig


def create_equity_curve_chart(
    equity_data: list[dict],
    title: str = "Portfolio Performance",
    height: int = 400,
) -> go.Figure:
    """Create an equity curve comparison chart."""
    return create_line_chart(
        data=equity_data,
        y_columns=["portfolio", "benchmark"],
        title=title,
        x_column="date",
        colors=["#2979FF", "#FF4081"],
        height=height,
    )


def create_drawdown_chart(
    equity_curve: list[float],
    title: str = "Drawdown Analysis",
    height: int = 350,
) -> go.Figure:
    """Create a drawdown chart showing underwater periods."""
    if not equity_curve or len(equity_curve) < 2:
        return go.Figure()

    arr = np.array(equity_curve)
    peak = np.maximum.accumulate(arr)
    drawdown = (arr - peak) / peak * 100
    dates = pd.date_range(start="2024-01-01", periods=len(equity_curve), freq="D")

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=dates,
            y=drawdown,
            name="Drawdown %",
            line=dict(color="#FF5252", width=1.5),
            fill="tozeroy",
            fillcolor="rgba(255, 82, 82, 0.3)",
        )
    )

    fig.update_layout(
        title=title,
        height=height,
        xaxis_title="Date",
        yaxis_title="Drawdown (%)",
        template="plotly_dark",
        margin=dict(l=60, r=20, t=50, b=20),
    )

    return fig


def create_returns_distribution_chart(
    returns: list[float],
    title: str = "Returns Distribution",
    height: int = 350,
) -> go.Figure:
    """Create a histogram of returns distribution."""
    if not returns or len(returns) < 2:
        return go.Figure()

    fig = go.Figure()

    fig.add_trace(
        go.Histogram(
            x=returns,
            name="Returns",
            marker_color="#2979FF",
            opacity=0.8,
            nbinsx=30,
        )
    )

    mean_return = np.mean(returns)
    fig.add_vline(
        x=mean_return,
        line_dash="dash",
        line_color="#FFD740",
        annotation_text=f"Mean: {mean_return:.2%}",
        annotation_position="top",
    )

    fig.update_layout(
        title=title,
        height=height,
        xaxis_title="Return",
        yaxis_title="Frequency",
        template="plotly_dark",
        margin=dict(l=60, r=20, t=50, b=20),
        showlegend=False,
    )

    return fig


def create_sector_allocation_chart(
    positions: list[dict],
    title: str = "Sector Allocation",
    height: int = 400,
) -> go.Figure:
    """Create a pie chart showing sector allocation."""
    if not positions:
        return go.Figure()

    # Calculate sector weights
    sector_values = {}
    for pos in positions:
        sector = pos.get("sector", "Other")
        value = pos.get("shares", 0) * pos.get("cost_basis", 0)
        sector_values[sector] = sector_values.get(sector, 0) + value

    labels = list(sector_values.keys())
    values = list(sector_values.values())

    colors = ["#2979FF", "#FF4081", "#00E676", "#FFD740", "#7C4DFF", "#FF6E40"]

    fig = go.Figure(
        data=[
            go.Pie(
                labels=labels,
                values=values,
                hole=0.4,
                marker_colors=colors[: len(labels)],
                textinfo="label+percent",
                insidetextorientation="radial",
            )
        ]
    )

    fig.update_layout(
        title=title,
        height=height,
        template="plotly_dark",
        margin=dict(l=20, r=20, t=50, b=20),
    )

    return fig


def create_volatility_chart(
    returns: list[float],
    window: int = 20,
    title: str = "Rolling Volatility",
    height: int = 350,
) -> go.Figure:
    """Create a rolling volatility chart."""
    if not returns or len(returns) < window:
        return go.Figure()

    arr = np.array(returns)
    dates = pd.date_range(start="2024-01-01", periods=len(returns), freq="D")
    rolling_vol = pd.Series(arr).rolling(window=window).std() * np.sqrt(252) * 100

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=dates,
            y=rolling_vol,
            name=f"{window}-Day Volatility",
            line=dict(color="#FF4081", width=2),
            fill="tozeroy",
            fillcolor="rgba(255, 64, 129, 0.2)",
        )
    )

    fig.update_layout(
        title=title,
        height=height,
        xaxis_title="Date",
        yaxis_title="Volatility (%)",
        template="plotly_dark",
        margin=dict(l=60, r=20, t=50, b=20),
    )

    return fig


def create_correlation_heatmap(
    returns_dict: dict[str, list[float]],
    title: str = "Correlation Matrix",
    height: int = 400,
) -> go.Figure:
    """Create a correlation heatmap for multiple assets."""
    if not returns_dict or len(returns_dict) < 2:
        return go.Figure()

    # Create DataFrame from returns
    df = pd.DataFrame(returns_dict)
    corr_matrix = df.corr()

    fig = go.Figure(
        data=go.Heatmap(
            z=corr_matrix.values,
            x=corr_matrix.columns,
            y=corr_matrix.index,
            colorscale="RdBu",
            zmid=0,
            text=corr_matrix.round(2),
            texttemplate="%{text}",
            textfont={"size": 10},
        )
    )

    fig.update_layout(
        title=title,
        height=height,
        xaxis_title="Asset",
        yaxis_title="Asset",
        template="plotly_dark",
        margin=dict(l=80, r=20, t=50, b=80),
    )

    return fig


def figure_to_json(fig: go.Figure) -> dict:
    """Convert Plotly figure to JSON for API response."""
    return pio.to_json(fig, validate=True)
