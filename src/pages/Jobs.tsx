import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, PlayCircle, XCircle } from 'lucide-react';
import { fetchJobs, isJobDaemon } from '../api';
import type { Job } from '../api';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'running': return <PlayCircle className="h-4 w-4" />;
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'failed': return <XCircle className="h-4 w-4" />;
    case 'pending': return <Clock className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
};

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchJobs();
        setJobs(data);
      } catch (e) {
        console.error('Failed to load jobs', e);
      } finally {
        setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">Jobs</h2>
          <p className="mt-1 text-sm text-neutral-500">Active job runs. Select a row to open details.</p>
        </div>
        <Link
          to="/run"
          className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-950 px-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New job
        </Link>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Job ID</th>
              <th className="px-6 py-3 font-medium">Graph ID</th>
              <th className="px-6 py-3 font-medium">Submitted</th>
              <th className="px-6 py-3 font-medium">Executors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-5 w-24 rounded bg-neutral-100" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-36 rounded bg-neutral-100" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-28 rounded bg-neutral-100" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-32 rounded bg-neutral-100" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-16 rounded bg-neutral-100" /></td>
                </tr>
              ))
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-neutral-500">
                  No jobs found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr
                  key={job.job_id}
                  onClick={() => navigate(`/jobs/${job.job_id}`)}
                  className="cursor-pointer hover:bg-neutral-50"
                >
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium capitalize text-neutral-700">
                      <StatusIcon status={job.status} />
                      {job.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/jobs/${job.job_id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="font-mono text-sm font-medium text-neutral-950 hover:underline"
                    >
                      {job.job_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{job.graph_id}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {job.submitted_at ? format(new Date(job.submitted_at), 'MMM d, HH:mm:ss') : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {isJobDaemon(job) ? '∞' : `${job.active_executors ?? 0} / ${job.executor_count ?? 0}`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
