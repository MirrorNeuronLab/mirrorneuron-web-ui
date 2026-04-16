import { useEffect, useState } from 'react';
import { fetchSystemSummary } from '../api';
import type { SystemSummary } from '../api';
import { Server, Activity, Users } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState<SystemSummary | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSystemSummary();
        setSummary(data);
      } catch (e) {
        console.error('Failed to load system summary', e);
      }
    };
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!summary) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center h-[104px]">
              <div className="bg-slate-100 w-14 h-14 rounded-lg mr-4"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-6 bg-slate-100 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[300px]">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="h-5 bg-slate-200 rounded w-32"></div>
          </div>
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-100 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 h-24 border border-slate-100"></div>
              <div className="bg-slate-50 rounded-lg p-4 h-24 border border-slate-100"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const runningJobs = summary.jobs.filter(j => j.status === 'running').length;
  const pendingJobs = summary.jobs.filter(j => j.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="bg-blue-50 p-4 rounded-lg mr-4">
            <Server className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-medium">Active Nodes</div>
            <div className="text-2xl font-bold">{summary.nodes.length}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="bg-green-50 p-4 rounded-lg mr-4">
            <Activity className="text-green-600 w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-medium">Running Jobs</div>
            <div className="text-2xl font-bold">{runningJobs}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="bg-purple-50 p-4 rounded-lg mr-4">
            <Users className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-medium">Pending Jobs</div>
            <div className="text-2xl font-bold">{pendingJobs}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">Cluster Nodes</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {summary.nodes.map((node, i) => (
            <div key={i} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-medium text-slate-900 flex items-center">
                  <Server className="w-4 h-4 mr-2 text-slate-400" />
                  {node.name}
                  {node.self && <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">Self</span>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(node.executor_pools || {}).map(([poolName, stats]) => (
                  <div key={poolName} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <div className="text-sm font-medium text-slate-700 mb-2">Pool: {poolName}</div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Capacity: {stats.capacity}</span>
                      <span className="text-green-600 font-medium">Avail: {stats.available}</span>
                      <span className="text-blue-600">Active: {stats.active}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}