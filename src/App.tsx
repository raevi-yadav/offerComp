import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  Calendar, 
  Info, 
  Plus, 
  Trash2,
  ChevronRight,
  Calculator,
  ArrowUpRight,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { OfferData, CurrentSalaryData, CalculationResult } from './types';
import { calculateOffer } from './utils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

interface SmartNumericInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  helperText?: string;
  className?: string;
}

function SmartNumericInput({ label, value, onChange, prefix, suffix, helperText, className }: SmartNumericInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val === '') {
      onChange(0);
    } else {
      // Parse as integer to remove leading zeros automatically
      onChange(parseInt(val, 10));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.select();
  };

  return (
    <div className={cn("space-y-1", className)}>
      <label className="label-text">{label}</label>
      <div className={cn(
        "relative flex items-center transition-all duration-200",
        isFocused ? "ring-2 ring-indigo-500 ring-offset-1 rounded-lg" : ""
      )}>
        {prefix && (
          <span className="absolute left-3 text-slate-400 font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          className={cn(
            "input-field focus:ring-0 focus:border-slate-200",
            prefix ? "pl-8" : "pl-4",
            suffix ? "pr-12" : "pr-4"
          )}
          value={value === 0 && !isFocused ? '' : value}
          placeholder={isFocused ? '' : '0'}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-400 text-xs font-medium pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {helperText && (
        <div className="text-[10px] text-slate-400 mt-1 ml-1">{helperText}</div>
      )}
    </div>
  );
}

export default function App() {
  const [currentSalary, setCurrentSalary] = useState<CurrentSalaryData>({
    baseSalary: 1200000,
    variablePay: 300000,
  });

  const [offer, setOffer] = useState<OfferData>({
    baseSalary: 2500000,
    performanceBonusPercentage: 10,
    joiningBonus: 200000,
    relocationBonus: 50000,
    stocksTotalValueUSD: 50000,
    usdToInrRate: 83,
    stocksVestingYears: 4,
    vestingPattern: 'equal',
    customVestingPattern: [
      { year: 1, percentage: 25 },
      { year: 2, percentage: 25 },
      { year: 3, percentage: 25 },
      { year: 4, percentage: 25 },
    ],
    isEmployerPFIncludedInBase: true,
    employerPFPercentage: 12,
  });

  const results = useMemo(() => calculateOffer(offer, currentSalary), [offer, currentSalary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const pieData = [
    { name: 'Base Salary', value: results.firstYearBase },
    { name: 'Bonuses', value: results.firstYearBonus },
    { name: 'Stocks (Year 1)', value: results.firstYearStocks },
  ];

  const handleCustomVestingChange = (year: number, percentage: number) => {
    const newPattern = [...offer.customVestingPattern];
    const index = newPattern.findIndex(p => p.year === year);
    if (index !== -1) {
      newPattern[index].percentage = percentage;
    } else {
      newPattern.push({ year, percentage });
    }
    setOffer({ ...offer, customVestingPattern: newPattern, vestingPattern: 'custom' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-bottom border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Calculator size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">OfferComp</h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-500">
            <span>Compare</span>
            <span>Analyze</span>
            <span>Decide</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[35fr_65fr] gap-8">
          
          {/* Left Column: Inputs */}
          <div className="space-y-6">
            
            {/* Current Salary Section */}
            <section className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="text-indigo-600" size={20} />
                <h2 className="text-lg font-semibold">Current Package</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SmartNumericInput
                  label="Base Salary"
                  prefix="₹"
                  value={currentSalary.baseSalary}
                  onChange={(val) => setCurrentSalary({ ...currentSalary, baseSalary: val })}
                  helperText={formatCurrency(currentSalary.baseSalary)}
                />
                <SmartNumericInput
                  label="Variable Pay"
                  prefix="₹"
                  value={currentSalary.variablePay}
                  onChange={(val) => setCurrentSalary({ ...currentSalary, variablePay: val })}
                  helperText={formatCurrency(currentSalary.variablePay)}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm text-slate-500">Total Current CTC:</span>
                <span className="font-bold text-slate-900">{formatCurrency(currentSalary.baseSalary + currentSalary.variablePay)}</span>
              </div>
            </section>

            {/* New Offer Section */}
            <section className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-emerald-600" size={20} />
                <h2 className="text-lg font-semibold">New Offer Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SmartNumericInput
                  label="Base Salary (Annual)"
                  value={offer.baseSalary}
                  onChange={(val) => setOffer({ ...offer, baseSalary: val })}
                  helperText={formatCurrency(offer.baseSalary)}
                />
                <SmartNumericInput
                  label="Performance Bonus (%)"
                  value={offer.performanceBonusPercentage}
                  onChange={(val) => setOffer({ ...offer, performanceBonusPercentage: val })}
                  helperText={`${(offer.baseSalary * offer.performanceBonusPercentage / 100).toLocaleString('en-IN')} INR`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SmartNumericInput
                  label="Joining Bonus"
                  value={offer.joiningBonus}
                  onChange={(val) => setOffer({ ...offer, joiningBonus: val })}
                  helperText={formatCurrency(offer.joiningBonus)}
                />
                <SmartNumericInput
                  label="Relocation Bonus"
                  value={offer.relocationBonus}
                  onChange={(val) => setOffer({ ...offer, relocationBonus: val })}
                  helperText={formatCurrency(offer.relocationBonus)}
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700">Employer PF included in Base?</label>
                    <span className="text-[10px] text-slate-400">Default: 12% of Base</span>
                  </div>
                  <button 
                    onClick={() => setOffer({ ...offer, isEmployerPFIncludedInBase: !offer.isEmployerPFIncludedInBase })}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                      offer.isEmployerPFIncludedInBase ? "bg-indigo-600" : "bg-slate-200"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      offer.isEmployerPFIncludedInBase ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Stocks / ESOPs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SmartNumericInput
                    label="Total Stock Value (USD)"
                    prefix="$"
                    className="sm:col-span-2"
                    value={offer.stocksTotalValueUSD}
                    onChange={(val) => setOffer({ ...offer, stocksTotalValueUSD: val })}
                  />
                  <SmartNumericInput
                    label="Rate (₹/$)"
                    value={offer.usdToInrRate}
                    onChange={(val) => setOffer({ ...offer, usdToInrRate: val })}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Vesting Period (Years)</label>
                    <select 
                      className="input-field"
                      value={offer.stocksVestingYears}
                      onChange={(e) => {
                        const years = Number(e.target.value);
                        const newPattern = Array.from({ length: years }, (_, i) => ({
                          year: i + 1,
                          percentage: 100 / years
                        }));
                        setOffer({ ...offer, stocksVestingYears: years, customVestingPattern: newPattern });
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>{y} Years</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-[10px] text-slate-400 mb-1">Total INR Value:</span>
                    <span className="text-sm font-bold text-slate-700">{formatCurrency(offer.stocksTotalValueUSD * offer.usdToInrRate)}</span>
                  </div>
                </div>

                <div>
                  <label className="label-text">Vesting Pattern</label>
                  <div className="flex gap-2 mb-3">
                    <button 
                      onClick={() => setOffer({ ...offer, vestingPattern: 'equal' })}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                        offer.vestingPattern === 'equal' 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      Equal Split
                    </button>
                    <button 
                      onClick={() => setOffer({ ...offer, vestingPattern: 'custom' })}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                        offer.vestingPattern === 'custom' 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      Custom Pattern
                    </button>
                  </div>

                  {offer.vestingPattern === 'custom' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {offer.customVestingPattern.map((v, idx) => (
                          <div key={v.year} className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500 w-12">Yr {v.year}</span>
                            <div className="relative flex-1">
                              <input 
                                type="text" 
                                inputMode="numeric"
                                className={cn(
                                  "input-field py-1 px-2 text-sm text-right pr-6",
                                  !results.isVestingValid && "border-red-300 focus:ring-red-500"
                                )}
                                value={v.percentage === 0 ? '' : v.percentage}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9]/g, '');
                                  handleCustomVestingChange(v.year, val === '' ? 0 : parseInt(val, 10));
                                }}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={cn(
                        "text-xs font-semibold flex justify-between items-center p-2 rounded-lg",
                        results.isVestingValid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      )}>
                        <span>Total Vesting:</span>
                        <span>{results.vestingTotal.toFixed(1)}% / 100%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div 
                layout
                className="glass-card p-6 bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-700 text-sm font-medium uppercase tracking-wider">1st Year Compensation</span>
                  <DollarSign size={20} className="text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-emerald-900">{formatCurrency(results.firstYearTotal)}</div>
                <div className="mt-4 flex items-center gap-2 text-emerald-700 text-sm">
                  <Calendar size={14} />
                  <span>Includes all bonuses & Year 1 stocks</span>
                </div>
              </motion.div>

              <motion.div 
                layout
                className="glass-card p-6 bg-white border-slate-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Salary Hike</span>
                  <ArrowUpRight size={20} className="text-emerald-500" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{results.hikePercentage.toFixed(1)}%</div>
                <div className="mt-4 flex items-center gap-2 text-slate-500 text-sm">
                  <TrendingUp size={14} className="text-emerald-500" />
                  <span>Increase from current CTC</span>
                </div>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* Detailed Table */}
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold">Compensation Table</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                        <th className="px-6 py-3">Year</th>
                        <th className="px-6 py-3">Base</th>
                        <th className="px-6 py-3">Bonus</th>
                        <th className="px-6 py-3">Stocks</th>
                        <th className="px-6 py-3">One-time</th>
                        <th className="px-6 py-3">CTC (Excl. PF)</th>
                        <th className="px-6 py-3 text-right">CTC (Incl. PF)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.yearlyBreakdown.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{row.year}</td>
                          <td className="px-6 py-4 text-slate-600">{formatCurrency(row.base)}</td>
                          <td className="px-6 py-4 text-slate-600">{formatCurrency(row.bonus)}</td>
                          <td className="px-6 py-4 text-slate-600">{formatCurrency(row.stocks)}</td>
                          <td className="px-6 py-4 text-slate-600">{formatCurrency(row.oneTime)}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{formatCurrency(row.totalWithoutPF)}</td>
                          <td className="px-6 py-4 text-right font-bold text-indigo-600">{formatCurrency(row.totalWithPF)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Year 1 Breakdown */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <PieChartIcon className="text-indigo-600" size={20} />
                  <h2 className="text-lg font-semibold">Year 1 Breakdown</h2>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Multi-Year Projection */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="text-indigo-600" size={20} />
                  <h2 className="text-lg font-semibold">Multi-Year Projection</h2>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={results.yearlyBreakdown}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tickFormatter={(value) => `₹${value / 100000}L`}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" align="right" />
                      <Bar dataKey="base" name="Base" stackId="a" fill="#6366f1" />
                      <Bar dataKey="bonus" name="Bonus" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="stocks" name="Stocks" stackId="a" fill="#ec4899" />
                      <Bar dataKey="oneTime" name="One-time Bonus" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer / Disclaimer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-xs mt-8">
        <p>© 2026 OfferComp. All calculations are estimates based on provided inputs. Tax implications not included.</p>
      </footer>
    </div>
  );
}
