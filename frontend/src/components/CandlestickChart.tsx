/**
 * Candlestick Chart Component - Interactive stock price chart
 */
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface CandlestickChartProps {
  ticker: string;
  period?: string;
  height?: number;
  className?: string;
}

export default function CandlestickChart({
  ticker,
  period = '1y',
  height = 500,
  className = '',
}: CandlestickChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/charts/candlestick?ticker=${ticker}&period=${period}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setChartData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [ticker, period]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-blue-400">Loading {ticker} data...</div>
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-red-400">{error || 'No data available'}</div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <Plot
        data={chartData.data || chartData}
        layout={{
          ...chartData.layout,
          height: height - 60,
          autosize: true,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: {
            color: '#e5e7eb',
          },
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        className="w-full"
      />
    </div>
  );
}
