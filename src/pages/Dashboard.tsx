import { useEffect, useMemo, useState } from 'react';
import { fetchJobs, fetchSystemSummary } from '../api';
import type { Job, SystemSummary } from '../api';
import { Activity, BriefcaseBusiness, Cpu, Server } from 'lucide-react';

type PoolStats = {
  capacity?: number;
  available?: number;
  in_use?: number;
  queued?: number;
  active?: number;
};

const activeStatuses = new Set(['running', 'pending', 'paused']);

export default function Dashboard() {
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [summaryResult, jobsResult] = await Promise.allSettled([
        fetchSystemSummary(),
        fetchJobs(),
      ]);

      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value);
      } else {
        console.error('Failed to load system summary', summaryResult.reason);
        setSummary({ nodes: [], jobs: [] });
      }

      if (jobsResult.status === 'fulfilled') {
        setJobs(jobsResult.value);
      } else {
        console.error('Failed to load jobs', jobsResult.reason);
        setJobs([]);
      }

      setLoading(false);
    };
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const executorSlots = useMemo(() => {
    const pools = summary?.nodes.flatMap((node) => Object.values(node.executor_pools || {}) as PoolStats[]) || [];
    const reportedCapacity = pools.reduce((total, pool) => total + (pool.capacity ?? 0), 0);
    const reportedActive = pools.reduce((total, pool) => total + (pool.active ?? pool.in_use ?? 0), 0);
    const activeFromJobs = jobs.reduce((total, job) => total + (job.active_executors ?? 0), 0);
    const requestedFromJobs = jobs.reduce((total, job) => total + (job.executor_count ?? 0), 0);
    const active = Math.max(reportedActive, activeFromJobs);
    const capacity = reportedCapacity || Math.max(8, requestedFromJobs + 4, active + 4);

    return {
      active,
      capacity,
      available: Math.max(capacity - active, 0),
      queued: pools.reduce((total, pool) => total + (pool.queued ?? 0), 0),
    };
  }, [jobs, summary]);

  const totalJobs = jobs.length || summary?.jobs.length || 0;
  const activeJobs = jobs.filter((job) => activeStatuses.has(job.status)).length || summary?.jobs.filter((job) => activeStatuses.has(job.status)).length || 0;
  const clusterNodes = summary?.nodes.length || 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-lg border border-neutral-200 bg-white p-6">
              <div className="h-4 w-28 rounded bg-neutral-100" />
              <div className="mt-8 h-8 w-20 rounded bg-neutral-100" />
              <div className="mt-8 h-4 w-44 rounded bg-neutral-100" />
            </div>
          ))}
        </div>
        <div className="h-64 rounded-lg border border-neutral-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          icon={BriefcaseBusiness}
          label="Total Jobs"
          value={totalJobs.toLocaleString()}
          headline="All submitted workflow runs"
          detail={`${clusterNodes} cluster node${clusterNodes === 1 ? '' : 's'} connected`}
        />
        <MetricCard
          icon={Activity}
          label="Active Jobs"
          value={activeJobs.toLocaleString()}
          headline="Running, pending, or paused"
          detail={`${Math.max(totalJobs - activeJobs, 0)} terminal or idle jobs`}
        />
        <MetricCard
          icon={Cpu}
          label="Executor Slots"
          value={`${executorSlots.available}/${executorSlots.capacity}`}
          headline={`${executorSlots.active} in use right now`}
          detail={`Mock capacity from current usage${executorSlots.queued ? `, ${executorSlots.queued} queued` : ''}`}
        />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-6 py-5">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">Runtime Resources</h2>
          <p className="mt-1 text-sm text-neutral-500">Current cluster view with neutral shadcn-style blocks.</p>
        </div>
        <div className="divide-y divide-neutral-100">
          {(summary?.nodes || []).length === 0 ? (
            <div className="px-6 py-10 text-sm text-neutral-500">No cluster nodes reported yet.</div>
          ) : (
            summary?.nodes.map((node) => (
              <div key={node.name} className="px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Server className="h-4 w-4 text-neutral-500" />
                    <div>
                      <div className="font-medium text-neutral-950">{node.name}</div>
                      <div className="text-sm text-neutral-500">{node.self ? 'Local node' : 'Peer node'}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {Object.entries(node.executor_pools || {}).map(([poolName, stats]) => (
                    <div key={poolName} className="rounded-lg border border-neutral-200 p-4">
                      <div className="text-sm font-medium text-neutral-950">Pool: {poolName}</div>
                      <div className="mt-3 grid grid-cols-4 gap-3 text-sm">
                        <PoolMetric label="Capacity" value={stats.capacity} />
                        <PoolMetric label="Avail" value={stats.available} />
                        <PoolMetric label="Active" value={stats.active} />
                        <PoolMetric label="Queued" value={stats.queued} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  headline,
  detail,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
  headline: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 text-sm font-medium text-neutral-500">
        <span>{label}</span>
        <Icon className="h-4 w-4 text-neutral-500" />
      </div>
      <div className="mt-6 text-4xl font-semibold tracking-tight text-neutral-950">{value}</div>
      <div className="mt-8 text-sm font-medium text-neutral-950">{headline}</div>
      <div className="mt-2 text-sm text-neutral-500">{detail}</div>
    </div>
  );
}

function PoolMetric({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 font-medium text-neutral-950">{value ?? 0}</div>
    </div>
  );
}
