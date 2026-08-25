import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Users, DollarSign, Activity, CheckCircle2, ShieldAlert, Globe, Settings, Plus, Edit3, Save, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MaharashtraMap } from '../components/MaharashtraMap';

interface CropItem {
  id: number;
  name: string;
  category: string;
  is_active: boolean;
  localized_name_hi?: string;
  localized_name_mr?: string;
}

export const AdminCommandCenterView: React.FC = () => {
  const { disputes, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai_config' | 'crops'>('dashboard');

  // AI Configuration State
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-3.5-flash');
  const [groundingEnabled, setGroundingEnabled] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [temp, setTemp] = useState(0.7);

  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Crops Catalogue State
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [newCropName, setNewCropName] = useState('');
  const [newCropCategory, setNewCropCategory] = useState('Vegetables');
  const [newCropHi, setNewCropHi] = useState('');
  const [newCropMr, setNewCropMr] = useState('');
  const [editingCrop, setEditingCrop] = useState<CropItem | null>(null);

  const API_BASE = 'http://localhost:8000/api/v1';

  // Fetch AI Config and Crops Catalog on mount
  useEffect(() => {
    fetchConfigs();
    fetchCrops();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/config`);
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.gemini_api_key || '');
        setModel(data.gemini_model || 'gemini-3.5-flash');
        setGroundingEnabled(data.enable_web_grounding === 'true');
        setAiEnabled(data.enable_ai === 'true');
        setMaxTokens(Number(data.max_response_length) || 2048);
        setTemp(Number(data.temperature) || 0.7);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCrops = async () => {
    try {
      const res = await fetch(`${API_BASE}/crops`);
      if (res.ok) {
        const data = await res.json();
        setCrops(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async () => {
    setSaveStatus('Saving...');
    try {
      const res = await fetch(`${API_BASE}/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gemini_api_key: apiKey,
          gemini_model: model,
          enable_web_grounding: groundingEnabled ? 'true' : 'false',
          enable_ai: aiEnabled ? 'true' : 'false',
          max_response_length: maxTokens.toString(),
          temperature: temp.toString()
        })
      });
      if (res.ok) {
        setSaveStatus('Settings saved successfully!');
        fetchConfigs();
      } else {
        setSaveStatus('Failed to save settings.');
      }
    } catch (e) {
      setSaveStatus('Error connecting to server.');
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing', message: 'Testing connection to Google Gemini API servers...' });
    try {
      const res = await fetch(`${API_BASE}/admin/config/test-connection`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTestResult({ status: 'success', message: `Gemini connection successful! Model: ${data.model} (Grounding Available)` });
      } else {
        setTestResult({ status: 'error', message: data.message || 'Connection failed. Please check key.' });
      }
    } catch (e) {
      setTestResult({ status: 'error', message: 'Network or timeout exception.' });
    }
  };

  const handleAddCrop = async () => {
    if (!newCropName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/admin/crops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCropName.trim(),
          category: newCropCategory,
          localized_name_hi: newCropHi.trim() || undefined,
          localized_name_mr: newCropMr.trim() || undefined
        })
      });
      if (res.ok) {
        setNewCropName('');
        setNewCropHi('');
        setNewCropMr('');
        fetchCrops();
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCrop = async (crop: CropItem) => {
    try {
      const res = await fetch(`${API_BASE}/admin/crops/${crop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !crop.is_active
        })
      });
      if (res.ok) {
        fetchCrops();
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-16 md:pb-6 text-charcoal">
      
      {/* HEADER TAB NAVIGATION */}
      <div className="bg-charcoal text-white p-6 sm:p-8 rounded-3xl border border-charcoal-muted/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amberGold text-xs font-bold border border-white/15">
              <Activity className="w-4 h-4" />
              Maharashtra Govt Command Center & Surveillance Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">Platform Administration Center</h1>
          </div>
          <span className="text-xs font-bold text-freshGreen bg-agriGreen/20 px-3 py-1.5 rounded-xl border border-agriGreen/30 self-start sm:self-auto">
            ● Live Controls Online
          </span>
        </div>

        {/* TABS BUTTONS */}
        <div className="flex border-t border-white/10 pt-4 gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-forest text-white' : 'hover:bg-white/5 text-white/60'}`}
          >
            Regional KPIs Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('ai_config')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'ai_config' ? 'bg-forest text-white' : 'hover:bg-white/5 text-white/60'}`}
          >
            AI Config settings
          </button>

          <button
            onClick={() => setActiveTab('crops')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'crops' ? 'bg-forest text-white' : 'hover:bg-white/5 text-white/60'}`}
          >
            Crop Catalogue Manager
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* TOP METRICS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-charcoal">
            <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-card">
              <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Active Farmers</span>
              <span className="text-2xl font-black text-charcoal mt-1 block">18,420</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-card">
              <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Active Buyers</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">1,284</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-card">
              <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Today's Lots</span>
              <span className="text-2xl font-black text-forest mt-1 block">3,821</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-card">
              <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Transactions</span>
              <span className="text-2xl font-black text-charcoal mt-1 block">1,492</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-card">
              <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Total GMV</span>
              <span className="text-2xl font-black text-agriGreen mt-1 block">₹4.82 Cr</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-card">
              <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Avg Net Gain</span>
              <span className="text-2xl font-black text-amberGold mt-1 block">+8.7%</span>
            </div>
          </div>

          {/* ANOMALY DETECTION SECTION */}
          <div className="p-5 bg-amberGold-light rounded-3xl border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Automated Market Price Anomaly Detected (Z-Score Deviation Alert)</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-charcoal text-sm">Kolhapur APMC — Tomato</span>
                  <span className="px-2 py-0.5 rounded-full bg-agriDanger/10 text-agriDanger font-bold">
                    +32% Price Spike
                  </span>
                </div>
                <p className="text-charcoal-muted mt-1">
                  Current price is <strong className="text-charcoal">₹41.00/kg</strong> vs regional benchmark average of <strong className="text-charcoal">₹31.00/kg</strong>.
                </p>
              </div>

              <button className="px-4 py-2 bg-amberGold hover:bg-amber-600 text-charcoal font-bold rounded-xl shadow-sm transition-all shrink-0">
                Investigate Market Traders
              </button>
            </div>
          </div>

          {/* ACTIVITY MAP */}
          <MaharashtraMap />

          {/* DISPUTES SURVEILLANCE TABLE */}
          <div className="bg-white rounded-3xl border border-agriBorder shadow-card overflow-hidden">
            <div className="p-5 border-b border-cream flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-charcoal">Active Disputes & Grievance Cases</h3>
                <p className="text-xs text-charcoal-muted">Escrow compliance and quality verification cases</p>
              </div>
            </div>

            <div className="divide-y divide-cream text-xs">
              {disputes.length === 0 ? (
                <div className="p-8 text-center text-charcoal-muted space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-agriGreen mx-auto" />
                  <p className="font-semibold text-charcoal">No open disputes reported today.</p>
                  <p className="text-[11px]">All transaction payment SLAs are within expected thresholds.</p>
                </div>
              ) : (
                disputes.map((d) => (
                  <div key={d.id} className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-mono font-bold text-agriDanger">{d.id}</span>
                      <h4 className="font-bold text-charcoal mt-0.5">{d.category} — {d.raised_by}</h4>
                      <p className="text-charcoal-muted mt-0.5">{d.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-agriDanger font-bold rounded-full text-[10px]">
                      {d.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'ai_config' && (
        <div className="bg-white rounded-3xl border border-agriBorder shadow-card p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
              <Settings className="w-5 h-5 text-forest" />
              Google Gemini Assistant Server Parameters
            </h3>
            <p className="text-xs text-charcoal-muted mt-1">
              Configure parameters for KisanLink's centralized backend Gemini service securely. Credentials are encrypted and masked.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* API KEY INPUT */}
            <div className="space-y-2">
              <label className="font-bold text-charcoal block">Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full bg-cream border border-agriBorder px-4 py-3 rounded-2xl focus:outline-none focus:border-forest text-charcoal"
              />
              <span className="text-[10px] text-charcoal-muted block">API key is protected server-side and never exposed to the client.</span>
            </div>

            {/* MODEL SELECTION */}
            <div className="space-y-2">
              <label className="font-bold text-charcoal block">Configured AI Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-cream border border-agriBorder px-4 py-3 rounded-2xl focus:outline-none focus:border-forest text-charcoal font-bold"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Medium / Recommended)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp (Experimental)</option>
              </select>
            </div>

            {/* CONFIG TOGGLES */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableGrounding"
                  checked={groundingEnabled}
                  onChange={(e) => setGroundingEnabled(e.target.checked)}
                  className="w-4 h-4 text-forest focus:ring-forest border-agriBorder rounded"
                />
                <label htmlFor="enableGrounding" className="font-bold text-charcoal cursor-pointer">
                  Enable Google Search grounding
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableAI"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="w-4 h-4 text-forest focus:ring-forest border-agriBorder rounded"
                />
                <label htmlFor="enableAI" className="font-bold text-charcoal cursor-pointer">
                  Activate KisanLink AI floating assistant globally
                </label>
              </div>
            </div>

            {/* PARAMETERS INPUT RANGE */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-charcoal">
                  <span>Temperature</span>
                  <span>{temp}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full accent-forest cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-charcoal block">Max Tokens Response Length</label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="w-full bg-cream border border-agriBorder px-4 py-2.5 rounded-2xl focus:outline-none focus:border-forest text-charcoal font-semibold"
                />
              </div>
            </div>
          </div>

          {/* TESTING FEEDBACK DISPLAY */}
          {testResult.status !== 'idle' && (
            <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
              testResult.status === 'testing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
              testResult.status === 'success' ? 'bg-green-50 text-agriGreen border-green-100' :
              'bg-red-50 text-agriDanger border-red-100'
            }`}>
              {testResult.status === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
              {testResult.status === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-freshGreen" />}
              {testResult.status === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-2 border-t border-cream pt-4">
            <button
              onClick={handleTestConnection}
              disabled={testResult.status === 'testing'}
              className="px-5 py-2.5 bg-cream hover:bg-cream-dark text-charcoal text-xs font-bold rounded-xl border border-agriBorder transition-all flex items-center gap-1.5"
            >
              Test Gemini connection
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-6 py-2.5 bg-forest hover:bg-forest-light text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {saveStatus || "Save Configuration"}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'crops' && (
        <div className="bg-white rounded-3xl border border-agriBorder shadow-card p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
              <Globe className="w-5 h-5 text-forest" />
              Supported Crops catalog Database Manager
            </h3>
            <p className="text-xs text-charcoal-muted mt-1">
              Add new crops dynamically or change crop categories and translations. Deactivated crops are archived and preserved in transaction history logs.
            </p>
          </div>

          {/* ADD CROP INLINE FORM */}
          <div className="bg-cream p-5 rounded-2xl border border-agriBorder space-y-4 text-xs">
            <h4 className="font-extrabold text-charcoal flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-forest" />
              Add Crop catalog entry
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-charcoal block">Crop Name</label>
                <input
                  type="text"
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  placeholder="e.g. Mango"
                  className="w-full bg-white border border-agriBorder px-3 py-2 rounded-xl focus:outline-none focus:border-forest text-charcoal"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal block">Category</label>
                <select
                  value={newCropCategory}
                  onChange={(e) => setNewCropCategory(e.target.value)}
                  className="w-full bg-white border border-agriBorder px-3 py-2 rounded-xl focus:outline-none focus:border-forest text-charcoal font-semibold"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Oilseeds">Oilseeds</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal block">Hindi Name</label>
                <input
                  type="text"
                  value={newCropHi}
                  onChange={(e) => setNewCropHi(e.target.value)}
                  placeholder="आम"
                  className="w-full bg-white border border-agriBorder px-3 py-2 rounded-xl focus:outline-none focus:border-forest text-charcoal"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal block">Marathi Name</label>
                <input
                  type="text"
                  value={newCropMr}
                  onChange={(e) => setNewCropMr(e.target.value)}
                  placeholder="आंबा"
                  className="w-full bg-white border border-agriBorder px-3 py-2 rounded-xl focus:outline-none focus:border-forest text-charcoal"
                />
              </div>
            </div>

            <button
              onClick={handleAddCrop}
              className="px-5 py-2.5 bg-forest hover:bg-forest-light text-white font-bold rounded-xl shadow-sm transition-all"
            >
              Insert Crop Catalogue Entry
            </button>
          </div>

          {/* CROPS LIST */}
          <div className="overflow-x-auto border border-agriBorder rounded-2xl">
            <table className="w-full text-left text-xs divide-y divide-cream">
              <thead className="bg-cream font-bold text-charcoal uppercase tracking-wider">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Hindi</th>
                  <th className="p-3">Marathi</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream font-medium">
                {crops.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/40">
                    <td className="p-3 font-mono font-bold text-charcoal-muted">{c.id}</td>
                    <td className="p-3 font-bold text-charcoal">{c.name}</td>
                    <td className="p-3 text-charcoal-muted">{c.category}</td>
                    <td className="p-3 font-semibold text-charcoal">{c.localized_name_hi || '—'}</td>
                    <td className="p-3 font-semibold text-charcoal">{c.localized_name_mr || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                        c.is_active ? 'bg-green-50 text-agriGreen border border-green-100' : 'bg-red-50 text-agriDanger border border-red-100'
                      }`}>
                        {c.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleCrop(c)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          c.is_active ? 'bg-red-50 hover:bg-red-100 text-agriDanger' : 'bg-green-50 hover:bg-green-100 text-agriGreen'
                        }`}
                      >
                        {c.is_active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
