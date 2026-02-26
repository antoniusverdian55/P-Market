"""
Quant Engine — Portfolio risk metrics and performance calculations.
"""
import numpy as np
from typing import Optional


def calculate_sharpe_ratio(
    returns: list[float],
    risk_free_rate: float = 0.05,
    periods_per_year: int = 252,
) -> float:
    """Calculate annualized Sharpe Ratio."""
    if not returns or len(returns) < 2:
        return 0.0

    arr = np.array(returns)
    excess_returns = arr - (risk_free_rate / periods_per_year)
    std = np.std(excess_returns, ddof=1)

    if std == 0:
        return 0.0

    return float(np.mean(excess_returns) / std * np.sqrt(periods_per_year))


def calculate_sortino_ratio(
    returns: list[float],
    risk_free_rate: float = 0.05,
    periods_per_year: int = 252,
) -> float:
    """Calculate annualized Sortino Ratio (only penalizes downside volatility)."""
    if not returns or len(returns) < 2:
        return 0.0

    arr = np.array(returns)
    excess_returns = arr - (risk_free_rate / periods_per_year)
    downside = arr[arr < 0]
    downside_std = np.std(downside, ddof=1) if len(downside) > 1 else 0.0

    if downside_std == 0:
        return 0.0

    return float(np.mean(excess_returns) / downside_std * np.sqrt(periods_per_year))


def calculate_max_drawdown(equity_curve: list[float]) -> float:
    """Calculate maximum drawdown as a percentage."""
    if not equity_curve or len(equity_curve) < 2:
        return 0.0

    arr = np.array(equity_curve)
    peak = np.maximum.accumulate(arr)
    drawdown = (arr - peak) / peak
    return float(np.min(drawdown) * 100)


def calculate_volatility(
    returns: list[float],
    periods_per_year: int = 252,
) -> float:
    """Calculate annualized volatility."""
    if not returns or len(returns) < 2:
        return 0.0

    return float(np.std(returns, ddof=1) * np.sqrt(periods_per_year) * 100)


def calculate_beta(
    portfolio_returns: list[float],
    benchmark_returns: list[float],
) -> float:
    """Calculate portfolio beta relative to a benchmark."""
    if (
        not portfolio_returns
        or not benchmark_returns
        or len(portfolio_returns) != len(benchmark_returns)
        or len(portfolio_returns) < 2
    ):
        return 1.0

    port = np.array(portfolio_returns)
    bench = np.array(benchmark_returns)

    covariance = np.cov(port, bench)[0][1]
    variance = np.var(bench, ddof=1)

    if variance == 0:
        return 1.0

    return float(covariance / variance)


def calculate_portfolio_metrics(
    equity_curve: list[float],
    benchmark_curve: Optional[list[float]] = None,
) -> dict:
    """Calculate all portfolio metrics from an equity curve."""
    if not equity_curve or len(equity_curve) < 2:
        return {
            "sharpe_ratio": 0,
            "sortino_ratio": 0,
            "max_drawdown": 0,
            "volatility": 0,
            "beta": 1.0,
            "total_return": 0,
            "total_return_percent": 0,
        }

    # Calculate daily returns
    arr = np.array(equity_curve)
    returns = list(np.diff(arr) / arr[:-1])

    metrics = {
        "sharpe_ratio": round(calculate_sharpe_ratio(returns), 2),
        "sortino_ratio": round(calculate_sortino_ratio(returns), 2),
        "max_drawdown": round(calculate_max_drawdown(equity_curve), 2),
        "volatility": round(calculate_volatility(returns), 2),
        "total_return": round(float(arr[-1] - arr[0]), 2),
        "total_return_percent": round(float((arr[-1] - arr[0]) / arr[0] * 100), 2),
    }

    if benchmark_curve and len(benchmark_curve) == len(equity_curve):
        bench_arr = np.array(benchmark_curve)
        bench_returns = list(np.diff(bench_arr) / bench_arr[:-1])
        metrics["beta"] = round(calculate_beta(returns, bench_returns), 2)
    else:
        metrics["beta"] = 1.0

    return metrics
