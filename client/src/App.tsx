import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Server, Activity, ShieldAlert, Zap, 
  DollarSign, BarChart2 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function App() {
  const [metrics, setMetrics] = useState<any>(null);
  const [budgets, setBudgets] = useState<any>(null);
  const [budgetConfigs, setBudgetConfigs] = useState<any>(null);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get('http://localhost:4003/admin/metrics');
      setMetrics(res.data.metrics);
      setBudgets(res.data.budgets);
      setBudgetConfigs(res.data.budgetConfigs);
    } catch (e) {
      console.error("Failed to fetch metrics", e);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const simulateTraffic = async () => {
    try {
      await axios.post('http://localhost:4003/v1/chat/completions', {
        messages: [{ role: 'user', content: 'Synthetic traffic load test' }],
        simulateOutage: false
      }, {
        headers: { 'Authorization': `Bearer team-frontend-key` }
      });
      fetchMetrics();
    } catch (e) {
      // Ignored for simulator
    }
  };

  const simulateOutage = async () => {
    try {
      await axios.post('http://localhost:4003/v1/chat/completions', {
        messages: [{ role: 'user', content: 'Force an outage!' }],
        simulateOutage: true
      }, {
        headers: { 'Authorization': `Bearer team-backend-key` }
      });
      fetchMetrics();
    } catch (e) {
      // Ignored for simulator
    }
  };

  if (!metrics || !budgets) return <div className="p-8">Loading Gateway Metrics...</div>;

  const teamData = Object.keys(metrics.teamUsage || {}).map(teamId => {
    const config = budgetConfigs[teamId];
    const spend = budgets[teamId] || 0;
    const max = config?.maxSpendUSD || 1;
    const percent = Math.min((spend / max) * 100, 100);
    return {
      name: teamId,
      requests: metrics.teamUsage[teamId],
      spend: spend,
      maxSpend: max,
      percent: percent
    };
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <Server className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold tracking-tight">Enterprise <span className="text-slate-400 text-lg">LLM Gateway</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={simulateTraffic} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" /> Send Single Request
          </button>
          <button onClick={simulateOutage} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Trigger Outage (Fallback Test)
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Top-Level KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Total Requests
            </h3>
            <div className="text-4xl font-bold text-blue-400">{metrics.totalRequests}</div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Fallback Events
            </h3>
            <div className="text-4xl font-bold text-orange-400">{metrics.totalFallbacks}</div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">P50 Latency</h3>
            <div className="text-4xl font-bold text-emerald-400">{metrics.p50Latency} <span className="text-xl">ms</span></div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">P95 Latency</h3>
            <div className="text-4xl font-bold text-purple-400">{metrics.p95Latency} <span className="text-xl">ms</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Budget Utilization Table */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" /> 
              Team Budget Utilization
            </h3>
            
            <div className="space-y-6">
              {teamData.map((team, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-mono">{team.name}</span>
                    <span className="text-slate-400">${team.spend.toFixed(4)} / ${team.maxSpend.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${team.percent > 90 ? 'bg-red-500' : team.percent > 75 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${team.percent}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Requests: {team.requests}</div>
                </div>
              ))}
              {teamData.length === 0 && <div className="text-slate-500">No traffic recorded yet.</div>}
            </div>
          </div>

          {/* Provider Split Chart */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-400" />
              Provider Routing Distribution
            </h3>
            <div className="h-64">
              {Object.keys(metrics.providerUsage || {}).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'OpenAI (Primary)', count: metrics.providerUsage['openai'] || 0 },
                    { name: 'Anthropic (Fallback)', count: metrics.providerUsage['anthropic'] || 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Waiting for traffic...
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
