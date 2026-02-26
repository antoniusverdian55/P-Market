/**
 * Plotly Chart Component - Reusable wrapper for Plotly charts
 */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import Plot to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PlotlyChartProps {
  dataUrl: string;
  title?: string;
  height?: number;
  className?: string;
}

export default function PlotlyChart({
  dataUrl,
  title,
  height = 400,
  className = '',
}: PlotlyChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch(dataUrl);
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
  }, [dataUrl]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-blue-400">Loading chart...</div>
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
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
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
          modeBarButtonsToAdd: [
            {
              name: 'Reset View',
              icon: {} as any,
              click: (gd: any) => {
                Plot.relayout(gd, {
                  'xaxis.autorange': true,
                  'yaxis.autorange': true,
                });
              },
            },
          ],
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        className="w-full"
      />
    </div>
  );
}
