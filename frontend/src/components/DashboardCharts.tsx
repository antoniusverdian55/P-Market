/**
 * Dashboard Charts - Main dashboard visualization components
 */
'use client';

import PlotlyChart from './PlotlyChart';

interface DashboardChartsProps {
  className?: string;
}

export default function DashboardCharts({ className = '' }: DashboardChartsProps) {
  const API_BASE = '/api/charts';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {/* Equity Curve Chart - Full width on mobile, spans 2 columns on desktop */}
      <div className="md:col-span-2">
        <PlotlyChart
          dataUrl={`${API_BASE}/equity-curve`}
          title="Portfolio Performance vs Benchmark"
          height={450}
        />
      </div>

      {/* Drawdown Analysis */}
      <div>
        <PlotlyChart
          dataUrl={`${API_BASE}/drawdown`}
          title="Drawdown Analysis"
          height={400}
        />
      </div>

      {/* Sector Allocation */}
      <div>
        <PlotlyChart
          dataUrl={`${API_BASE}/sector-allocation`}
          title="Sector Allocation"
          height={400}
        />
      </div>

      {/* Returns Distribution */}
      <div>
        <PlotlyChart
          dataUrl={`${API_BASE}/returns-distribution`}
          title="Returns Distribution"
          height={400}
        />
      </div>

      {/* Volatility Chart */}
      <div>
        <PlotlyChart
          dataUrl={`${API_BASE}/volatility?window=20`}
          title="20-Day Rolling Volatility"
          height={400}
        />
      </div>

      {/* Correlation Heatmap - Full width */}
      <div className="md:col-span-2">
        <PlotlyChart
          dataUrl={`${API_BASE}/correlation`}
          title="Asset Correlation Matrix"
          height={450}
        />
      </div>
    </div>
  );
}
