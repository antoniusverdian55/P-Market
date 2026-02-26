/**
 * Dashboard Page - Main dashboard with interactive Plotly charts
 */
'use client';

import DashboardCharts from '@/components/DashboardCharts';
import CandlestickChart from '@/components/CandlestickChart';
import { TrendingUp, Activity, PieChart, BarChart3 } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [selectedPeriod, setSelectedPeriod] = useState('1y');

  const quickStats = [
    { label: 'Net Liquidity', value: '$248,542.00', change: '+1.24%', positive: true },
    { label: 'Daily P/L', value: '+$3,042.50', change: '+1.24%', positive: true },
    { label: 'Sharpe Ratio', value: '1.82', change: 'Excellent', positive: true },
    { label: 'Max Drawdown', value: '-8.42%', change: '-0.3%', positive: true },
  ];

  const tickers = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA'];
  const periods = ['1mo', '3mo', '6mo', '1y', '2y', '5y'];

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Interactive portfolio analytics and market insights</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors"
          >
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <span
                className={`text-sm font-medium ${
                  stat.positive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <DashboardCharts className="mb-8" />

      {/* Candlestick Chart Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Price Analysis</h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              {tickers.map((ticker) => (
                <option key={ticker} value={ticker}>
                  {ticker}
                </option>
              ))}
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              {periods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
        </div>
        <CandlestickChart ticker={selectedTicker} period={selectedPeriod} height={550} />
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-green-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Performance</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Track your portfolio performance against benchmarks with interactive charts.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">YTD Return</span>
              <span className="text-green-400 font-medium">+28.4%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">vs S&P 500</span>
              <span className="text-green-400 font-medium">+12.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Win Rate</span>
              <span className="text-blue-400 font-medium">64%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="text-purple-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Allocation</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Monitor sector allocation and position sizing for optimal diversification.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Technology</span>
              <span className="text-white font-medium">65%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Index Funds</span>
              <span className="text-white font-medium">20%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Consumer</span>
              <span className="text-white font-medium">15%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-orange-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Risk Metrics</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Real-time risk analysis and volatility monitoring for informed decisions.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">VaR (95%)</span>
              <span className="text-orange-400 font-medium">$4,250</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Beta</span>
              <span className="text-white font-medium">1.12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Volatility</span>
              <span className="text-white font-medium">14.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
