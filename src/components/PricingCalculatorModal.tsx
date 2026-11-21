import React, { useState } from 'react';
import { X, Calculator, ShieldCheck, HelpCircle } from 'lucide-react';
import { settingsApi } from '../api/client.js';

interface PricingCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingCalculatorModal: React.FC<PricingCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [costPrice, setCostPrice] = useState<string>('45.00');
  const [itemType, setItemType] = useState<'part' | 'tire'>('part');
  const [calculated, setCalculated] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCalculate = async () => {
    const num = parseFloat(costPrice);
    if (isNaN(num) || num < 0) return;
    setLoading(true);
    try {
      const res = await settingsApi.calculatePrice({
        itemType,
        costPrice: num,
      });
      setCalculated(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-brand-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-800 rounded border border-brand-700">
              <Calculator className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide uppercase text-white">
                Company Pricing &amp; Markup Calculator
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                Mandatory SOP Compliance: SW-004 (Parts Matrix) &amp; SW-005 (Tires +$20)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Item Classification
              </label>
              <select
                value={itemType}
                onChange={(e) => {
                  setItemType(e.target.value as any);
                  setCalculated(null);
                }}
                className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
              >
                <option value="part">Automotive / Truck Part (SW-004 Matrix)</option>
                <option value="tire">Commercial / Passenger Tire (SW-005 Flat +$20)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Actual Acquisition Cost ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded pl-7 pr-3 py-2 font-mono text-slate-900 font-semibold focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded shadow-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Calculator className="w-4 h-4" />
            <span>{loading ? 'Calculating...' : 'Compute Approved Selling Price'}</span>
          </button>

          {/* Results Box */}
          {calculated && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs uppercase font-mono text-slate-500">Item Type:</span>
                <span className="text-xs font-bold text-slate-800 uppercase font-mono">
                  {calculated.itemType === 'tire' ? 'Commercial Tire (SW-005)' : 'Mechanical Part (SW-004)'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-1">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Wholesale Cost</div>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    ${calculated.costPrice.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Approved Markup</div>
                  <div className="text-base font-bold text-blue-700 font-mono">
                    {calculated.itemType === 'tire' ? '+$20.00 Flat' : `+${calculated.markupPercent}%`}
                  </div>
                </div>

                <div className="bg-blue-50 p-2.5 rounded border border-blue-200">
                  <div className="text-[10px] text-blue-700 uppercase font-mono font-bold">Selling Price</div>
                  <div className="text-base font-extrabold text-blue-900 font-mono">
                    ${calculated.sellingPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">SOP Rule Formula: </span>
                  <span className="font-mono text-slate-600">{calculated.formula}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reference Table */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Approved Parts Markup Matrix Tiers (SW-004)</span>
            </div>
            <div className="border border-slate-200 rounded overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[11px] font-mono uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-1.5">Acquisition Cost Range</th>
                    <th className="px-3 py-1.5">Markup %</th>
                    <th className="px-3 py-1.5">Multiplier</th>
                    <th className="px-3 py-1.5">Gross Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  <tr><td className="px-3 py-1">$0.00 – $25.00</td><td>100%</td><td>2.00x</td><td>50.0%</td></tr>
                  <tr><td className="px-3 py-1">$25.01 – $50.00</td><td>80%</td><td>1.80x</td><td>44.4%</td></tr>
                  <tr><td className="px-3 py-1">$50.01 – $100.00</td><td>60%</td><td>1.60x</td><td>37.5%</td></tr>
                  <tr><td className="px-3 py-1">$100.01 – $300.00</td><td>45%</td><td>1.45x</td><td>31.0%</td></tr>
                  <tr><td className="px-3 py-1">$300.01 – $1,000.00</td><td>35%</td><td>1.35x</td><td>25.9%</td></tr>
                  <tr><td className="px-3 py-1">$1,000.01+</td><td>25%</td><td>1.25x</td><td>20.0%</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
