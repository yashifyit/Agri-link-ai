import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

interface ChartPoint {
  date: string;
  historicalPrice?: number;
  forecastPrice?: number;
  upperBand?: number;
  lowerBand?: number;
}

const data7D: ChartPoint[] = [
  { date: '17 Aug', historicalPrice: 27 },
  { date: '18 Aug', historicalPrice: 28 },
  { date: '19 Aug', historicalPrice: 27.5 },
  { date: '20 Aug', historicalPrice: 29 },
  { date: '21 Aug', historicalPrice: 30 },
  { date: '22 Aug', historicalPrice: 31 },
  { date: 'Today', historicalPrice: 33, forecastPrice: 33, lowerBand: 32, upperBand: 34 },
  { date: '+1 Day', forecastPrice: 33.5, lowerBand: 32.5, upperBand: 35 },
  { date: '+2 Days', forecastPrice: 34.2, lowerBand: 33.0, upperBand: 36 },
  { date: '+3 Days', forecastPrice: 35.0, lowerBand: 33.5, upperBand: 37 }
];

const data30D: ChartPoint[] = [
  { date: '25 Jul', historicalPrice: 22 },
  { date: '01 Aug', historicalPrice: 24 },
  { date: '08 Aug', historicalPrice: 26 },
  { date: '15 Aug', historicalPrice: 28 },
  { date: 'Today', historicalPrice: 33, forecastPrice: 33, lowerBand: 31, upperBand: 35 },
  { date: '+7 Days', forecastPrice: 36, lowerBand: 33, upperBand: 39 }
];

export const PriceTrendChart: React.FC<{ crop?: string }> = ({ crop = "Tomato" }) => {
  const [range, setRange] = useState<'7D' | '30D' | '90D' | '1Y'>('7D');

  const activeData = range === '7D' ? data7D : data30D;

  return (
    <div className="bg-white rounded-2xl p-5 border border-agriBorder shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-charcoal">{crop} — Price Trend & AI Forecast</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amberGold-light text-amber-700 border border-amber-200">
              Estimated AI Projection
            </span>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Historical mandi modal prices with 3-day projected price confidence band
          </p>
        </div>
        <div className="flex items-center bg-cream p-1 rounded-xl border border-agriBorder self-start sm:self-auto">
          {(['7D', '30D', '90D', '1Y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                range === r
                  ? 'bg-forest text-white shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#238B57" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#238B57" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E5A93D" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#E5A93D" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFECE3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#69756D' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#69756D' }} tickLine={false} domain={['auto', 'auto']} unit=" ₹" />
            <Tooltip
              formatter={(value: any, name: any) => [
                `₹${value}/kg`,
                name === 'historicalPrice' ? 'Historical Price' : 'Forecasted Price'
              ]}
              contentStyle={{ backgroundColor: '#18211C', borderRadius: '10px', color: '#fff', border: 'none', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Area
              type="monotone"
              dataKey="historicalPrice"
              name="Historical Modal Price (₹/kg)"
              stroke="#238B57"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorHist)"
            />
            <Area
              type="monotone"
              dataKey="forecastPrice"
              name="Projected Forecast Price (₹/kg)"
              stroke="#E5A93D"
              strokeWidth={3}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorForecast)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-cream flex items-center justify-between text-xs text-charcoal-muted">
        <span>Source: AGMARKNET Govt Market Intelligence & KisanLink Engine</span>
        <span className="font-semibold text-agriGreen">Confidence: 88%</span>
      </div>
    </div>
  );
};
