import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Layers,
  CircleDollarSign,
  Users,
  Shield,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Calculator,
  UserPlus,
  Key,
  Database,
  Radio,
  X,
} from 'lucide-react';
import { settingsApi, authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'markup' | 'shop' | 'employees' | 'integrations'>('markup');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Shop Settings State
  const [shopSettings, setShopSettings] = useState<any>({
    companyName: 'Freedom Car & Truck',
    legalName: 'Freedom Automotive Services LLC',
    tagline: 'Heavy Duty Truck & Commercial Fleet Specialist',
    phone: '(214) 555-0199',
    email: 'service@freedomcartruck.com',
    address: '10420 Composite Dr, Dallas, TX 75220',
    laborRateDefault: 120,
    taxRateDefault: 8.25,
    tireMarkupFlat: 20,
    depositThreshold: 500,
    depositPercentage: 50,
    drawerClosingTarget: 100,
    mitchellManagerIntegrationEnabled: true,
  });

  // Markup Matrix State
  const [markupMatrix, setMarkupMatrix] = useState<any>({
    tiers: [
      { minCost: 0, maxCost: 25, markupPercent: 100, multiplier: 2.0, marginPercent: 50.0 },
      { minCost: 25.01, maxCost: 50, markupPercent: 80, multiplier: 1.8, marginPercent: 44.4 },
      { minCost: 50.01, maxCost: 100, markupPercent: 65, multiplier: 1.65, marginPercent: 39.4 },
      { minCost: 100.01, maxCost: 300, markupPercent: 50, multiplier: 1.5, marginPercent: 33.3 },
      { minCost: 300.01, maxCost: 1000, markupPercent: 40, multiplier: 1.4, marginPercent: 28.6 },
      { minCost: 1000.01, maxCost: 999999, markupPercent: 30, multiplier: 1.3, marginPercent: 23.1 },
    ],
    tireFlatMarkup: 20,
    laborRateDefault: 120,
  });

  // Calculator State
  const [testCost, setTestCost] = useState('75.00');
  const [testType, setTestType] = useState<'part' | 'tire'>('part');
  const [calcResult, setCalcResult] = useState<any>(null);

  // Employees State
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpData, setNewEmpData] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'technician',
    employeeId: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [settingsRes, usersRes] = await Promise.all([
        settingsApi.getSettings(),
        authApi.getUsers(),
      ]);

      if (settingsRes.data.settings) {
        setShopSettings(settingsRes.data.settings);
      }
      if (settingsRes.data.markupMatrix) {
        setMarkupMatrix(settingsRes.data.markupMatrix);
      }
      setEmployees(usersRes.data.users || []);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCalculate = async () => {
    try {
      const res = await settingsApi.calculatePrice({
        itemType: testType,
        costPrice: Number(testCost),
      });
      setCalcResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveShopSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);
      const res = await settingsApi.updateSettings(shopSettings);
      setShopSettings(res.data.settings);
      setSuccessMsg('Shop configuration saved successfully.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save shop settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMatrix = async () => {
    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);
      const res = await settingsApi.updateMarkupMatrix({
        tiers: markupMatrix.tiers,
        tireFlatMarkup: markupMatrix.tireFlatMarkup,
        laborRateDefault: markupMatrix.laborRateDefault,
      });
      setMarkupMatrix(res.data.markupMatrix);
      setSuccessMsg('Parts Markup Matrix updated successfully (SW-004).');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update matrix.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTier = () => {
    const lastTier = markupMatrix.tiers[markupMatrix.tiers.length - 1];
    const newMin = lastTier ? lastTier.maxCost + 0.01 : 0;
    const newTiers = [
      ...markupMatrix.tiers,
      { minCost: newMin, maxCost: newMin + 100, markupPercent: 35, multiplier: 1.35, marginPercent: 25.9 },
    ];
    setMarkupMatrix({ ...markupMatrix, tiers: newTiers });
  };

  const handleRemoveTier = (idx: number) => {
    const newTiers = markupMatrix.tiers.filter((_: any, i: number) => i !== idx);
    setMarkupMatrix({ ...markupMatrix, tiers: newTiers });
  };

  const handleTierChange = (idx: number, field: string, val: number) => {
    const newTiers = [...markupMatrix.tiers];
    newTiers[idx][field] = val;
    if (field === 'markupPercent') {
      newTiers[idx].multiplier = Math.round((1 + val / 100) * 100) / 100;
      newTiers[idx].marginPercent = Math.round((val / (100 + val)) * 1000) / 10;
    }
    setMarkupMatrix({ ...markupMatrix, tiers: newTiers });
  };

  const handleToggleUserStatus = async (userObj: any) => {
    try {
      const res = await authApi.updateUserStatus(userObj._id, {
        isActive: !userObj.isActive,
      });
      setEmployees(employees.map((u) => (u._id === userObj._id ? res.data.user : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change employee status.');
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authApi.register(newEmpData);
      setShowAddEmpModal(false);
      setNewEmpData({
        name: '',
        email: '',
        password: 'Password123!',
        role: 'technician',
        employeeId: '',
      });
      const usersRes = await authApi.getUsers();
      setEmployees(usersRes.data.users || []);
      setSuccessMsg('Employee created successfully.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to register employee.');
    } finally {
      setSaving(false);
    }
  };

  const isManagement = user?.role === 'manager' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-200 border border-slate-200 rounded-lg text-slate-700">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Workshop Configuration & Business Rules
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage parts markup tiers (SW-004), tire flat rules (SW-005), deposit thresholds, and user accounts.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 [&>button]:whitespace-nowrap">
          <button
            onClick={() => setActiveTab('markup')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'markup'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Parts Markup (SW-004)
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'shop'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <CircleDollarSign className="w-3.5 h-3.5" /> Rates & Policies
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'employees'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Staff Roster
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'integrations'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Integrations
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-md flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: PARTS MARKUP MATRIX (SW-004) & TIRE PRICING (SW-005) */}
      {activeTab === 'markup' && (
        <div className="space-y-6">
          {/* Strict SOP Notice */}
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold">
              <Shield className="w-4 h-4" />
              SOP Pricing Compliance Notice (SW-004 & SW-005)
            </div>
            <p className="text-slate-700 leading-relaxed">
              <strong>Parts Pricing (SW-004):</strong> Record actual part cost and apply the company-approved markup matrix below to calculate the selling price. Do not automatically use the electronic parts manager default selling price.
              <br />
              <strong>Tire Pricing (SW-005):</strong> Calculate tire selling price using <strong>actual acquisition cost plus $20 flat per tire</strong>. Tires are strictly exempt from percentage markup matrices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Markup Table */}
            <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Approved Parts Markup Matrix Tiers
                  </h3>
                  <span className="text-xs text-slate-500">
                    Tiered percentage calculation based on actual part acquisition cost
                  </span>
                </div>
                {isManagement && (
                  <button
                    onClick={handleAddTier}
                    className="px-2.5 py-1 rounded-md bg-slate-200 hover:bg-slate-600 text-slate-900 text-sm font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tier
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs">
                      <th className="py-2.5 px-3">Cost Tier Range</th>
                      <th className="py-2.5 px-3">Markup %</th>
                      <th className="py-2.5 px-3">Multiplier</th>
                      <th className="py-2.5 px-3">Gross Margin %</th>
                      {isManagement && <th className="py-2.5 px-3 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {markupMatrix.tiers.map((tier: any, idx: number) => (
                      <tr key={idx} className="hover:bg-indigo-50/50">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {isManagement ? (
                            <div className="flex items-center gap-1.5">
                              <span>$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={tier.minCost}
                                onChange={(e) => handleTierChange(idx, 'minCost', Number(e.target.value))}
                                className="w-20 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-sm text-slate-900"
                              />
                              <span>to $</span>
                              <input
                                type="number"
                                step="0.01"
                                value={tier.maxCost}
                                onChange={(e) => handleTierChange(idx, 'maxCost', Number(e.target.value))}
                                className="w-24 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-sm text-slate-900"
                              />
                            </div>
                          ) : (
                            `$${tier.minCost.toFixed(2)} – $${tier.maxCost.toFixed(2)}`
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {isManagement ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={tier.markupPercent}
                                onChange={(e) => handleTierChange(idx, 'markupPercent', Number(e.target.value))}
                                className="w-16 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-sm text-slate-900"
                              />
                              <span>%</span>
                            </div>
                          ) : (
                            `${tier.markupPercent}%`
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-indigo-600 font-bold">
                          {tier.multiplier?.toFixed(2)}x
                        </td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">
                          {tier.marginPercent?.toFixed(1)}%
                        </td>
                        {isManagement && (
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleRemoveTier(idx)}
                              className="p-1 text-slate-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isManagement && (
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <button
                    disabled={saving}
                    onClick={handleSaveMatrix}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50 whitespace-nowrap"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Markup Matrix
                  </button>
                </div>
              )}
            </div>

            {/* Live Pricing Calculator Tester */}
            <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Live Pricing Matrix Simulator
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 font-semibold mb-1">
                    Component Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTestType('part')}
                      className={`py-1.5 rounded-md text-sm font-semibold ${
                        testType === 'part'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    >
                      Automotive Part (SW-004)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestType('tire')}
                      className={`py-1.5 rounded-md text-sm font-semibold ${
                        testType === 'tire'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    >
                      Tire Unit (SW-005)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-semibold mb-1">
                    Acquisition Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={testCost}
                    onChange={(e) => setTestCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestCalculate}
                  className="w-full py-2 bg-slate-200 hover:bg-slate-600 text-slate-900 rounded-md text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5" /> Calculate Selling Price
                </button>

                {calcResult && (
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Calculated Selling Price:</span>
                      <span className="font-bold text-emerald-600 text-sm">
                        ${calcResult.sellingPrice?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Applied Formula:</span>
                      <span className="text-slate-700 text-right">{calcResult.formula}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RATES & POLICIES */}
      {activeTab === 'shop' && (
        <form onSubmit={handleSaveShopSettings} className="space-y-6 max-w-4xl">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-emerald-600" />
              Workshop Financial Parameters & Business Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Default Labor Rate ($ / hour)
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={!isManagement}
                  value={shopSettings.laborRateDefault}
                  onChange={(e) => setShopSettings({ ...shopSettings, laborRateDefault: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                />
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Standard mechanical & diagnostic hourly rate
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Default Sales Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={!isManagement}
                  value={shopSettings.taxRateDefault}
                  onChange={(e) => setShopSettings({ ...shopSettings, taxRateDefault: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                />
                <span className="text-xs text-slate-500 mt-0.5 block">
                  State & local municipal sales tax on parts and labor
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Flat Tire Markup ($ per tire) – SW-005
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={!isManagement}
                  value={shopSettings.tireMarkupFlat}
                  onChange={(e) => setShopSettings({ ...shopSettings, tireMarkupFlat: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-emerald-600 font-bold"
                />
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Mandatory flat markup per tire (strictly $20.00 standard)
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Deposit Threshold ($) – SW-008
                </label>
                <input
                  type="number"
                  step="1"
                  disabled={!isManagement}
                  value={shopSettings.depositThreshold}
                  onChange={(e) => setShopSettings({ ...shopSettings, depositThreshold: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                />
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Repair orders exceeding this amount require a 50% deposit before dispatch
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Mandatory Deposit Percentage (%)
                </label>
                <input
                  type="number"
                  disabled={!isManagement}
                  value={shopSettings.depositPercentage}
                  onChange={(e) => setShopSettings({ ...shopSettings, depositPercentage: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                />
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Strictly 50% of the total authorized estimate
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Daily Cash-Up Closing Float ($) – SW-015
                </label>
                <input
                  type="number"
                  disabled={!isManagement}
                  value={shopSettings.drawerClosingTarget}
                  onChange={(e) => setShopSettings({ ...shopSettings, drawerClosingTarget: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-emerald-600 font-bold"
                />
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Exact closing drawer cash float balance ($100.00 target)
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Shop Facility Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Company Trade Name</label>
                  <input
                    type="text"
                    disabled={!isManagement}
                    value={shopSettings.companyName}
                    onChange={(e) => setShopSettings({ ...shopSettings, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Phone Number</label>
                  <input
                    type="text"
                    disabled={!isManagement}
                    value={shopSettings.phone}
                    onChange={(e) => setShopSettings({ ...shopSettings, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Facility Address</label>
                  <input
                    type="text"
                    disabled={!isManagement}
                    value={shopSettings.address}
                    onChange={(e) => setShopSettings({ ...shopSettings, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                  />
                </div>
              </div>
            </div>

            {isManagement && (
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50 whitespace-nowrap"
                >
                  <Save className="w-4 h-4" /> Save Policy Parameters
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* TAB 3: STAFF ROSTER & ACCESS */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Workshop Employee Accounts</h3>
              <p className="text-sm text-slate-500">
                Manage roles, employee IDs, and access status across all 6 roles.
              </p>
            </div>
            {isManagement && (
              <button
                onClick={() => setShowAddEmpModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-semibold flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Employee
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs">
                    <th className="py-3 px-3">EMP ID</th>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">System Role</th>
                    <th className="py-3 px-3">Status</th>
                    {isManagement && <th className="py-3 px-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-indigo-50/50">
                      <td className="py-3 px-3 font-bold text-indigo-600 whitespace-nowrap">
                        {emp.employeeId || 'EMP-XXXX'}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-semibold whitespace-nowrap">
                        {emp.name}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {emp.email}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                            emp.isActive
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                              : 'bg-red-50 border border-red-200 text-red-700'
                          }`}
                        >
                          {emp.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      {isManagement && (
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleToggleUserStatus(emp)}
                            className="text-sm text-slate-500 hover:text-slate-900 underline"
                          >
                            {emp.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXTERNAL INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-indigo-600">
                Mitchell 1 Manager SE
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                Ready
              </span>
            </div>
            <p className="text-sm text-slate-700">
              API bridge for importing historical vehicle records, parts catalogs, and labor times.
            </p>
            <div className="text-xs text-slate-500">
              Endpoint: <span className="text-indigo-700">tcp://127.0.0.1:41100/mitchell</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-600">
                Electronic Parts Catalog
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                Connected
              </span>
            </div>
            <p className="text-sm text-slate-700">
              Real-time parts inventory query and supplier cost ingestion for matrix calculation.
            </p>
            <div className="text-xs text-slate-500">
              Acquisition matrix: <span className="text-emerald-700">Active (SW-004)</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-purple-600">
                Tire Wholesale Network
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                Connected
              </span>
            </div>
            <p className="text-sm text-slate-700">
              National tire distributor catalog feeds with automated Cost + $20 flat pricing.
            </p>
            <div className="text-xs text-slate-500">
              Pricing rule: <span className="text-purple-700">Cost + $20 Flat (SW-005)</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 w-full max-w-md shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                Register New Workshop Employee
              </h3>
              <button aria-label="Close"
                onClick={() => setShowAddEmpModal(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newEmpData.name}
                  onChange={(e) => setNewEmpData({ ...newEmpData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmpData.email}
                  onChange={(e) => setNewEmpData({ ...newEmpData, email: e.target.value })}
                  placeholder="e.g. jdoe@freedomcartruck.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  required
                  value={newEmpData.employeeId}
                  onChange={(e) => setNewEmpData({ ...newEmpData, employeeId: e.target.value })}
                  placeholder="e.g. EMP-1007"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={newEmpData.password}
                  onChange={(e) => setNewEmpData({ ...newEmpData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1">Workshop Role</label>
                <select
                  value={newEmpData.role}
                  onChange={(e) => setNewEmpData({ ...newEmpData, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900"
                >
                  <option value="service_writer">Service Writer</option>
                  <option value="technician">Technician</option>
                  <option value="qc_technician">Independent QC Technician</option>
                  <option value="office_assistant">Office Assistant</option>
                  <option value="manager">Manager / Approver</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-600 text-slate-700 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-semibold whitespace-nowrap"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { Settings };

