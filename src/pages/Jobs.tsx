import { useEffect, useState } from 'react';
import { fetchJobs, isJobDaemon } from '../api';
import type { Job } from '../api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { PlayCircle, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'running': return <PlayCircle className="w-5 h-5 text-blue-500" />;
    case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
    case 'pending': return <Clock className="w-5 h-5 text-purple-500" />;
    default: return <AlertCircle className="w-5 h-5 text-slate-400" />;
  }
};

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

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

  const filteredJobs = showAll ? jobs : jobs.filter(j => ['running', 'pending', 'paused'].includes(j.status));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800">Jobs {showAll ? '(All)' : '(Active)'}</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center text-sm text-slate-600 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showAll} 
              onChange={(e) => setShowAll(e.target.checked)}
              className="mr-2 rounded text-purple-600 focus:ring-purple-500"
            />
            Show All
          </label>
          <Link to="/run" className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
            Submit New Job
          </Link>
        </div>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-500">
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Job ID</th>
            <th className="px-6 py-3 font-medium">Graph ID</th>
            <th className="px-6 py-3 font-medium">Submitted</th>
            <th className="px-6 py-3 font-medium">Executors (Active/Total)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-20"></div></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-32"></div></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-32"></div></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16"></div></td>
              </tr>
            ))
          ) : filteredJobs.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                No jobs found.
              </td>
            </tr>
          ) : (
            filteredJobs.map((job) => (
              <tr key={job.job_id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <StatusIcon status={job.status} />
                    <span className="ml-2 text-sm capitalize font-medium">{job.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Link to={`/jobs/${job.job_id}`} className="text-purple-600 hover:text-purple-800 font-mono text-sm">
                    {job.job_id}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{job.graph_id}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {job.submitted_at ? format(new Date(job.submitted_at), 'MMM d, HH:mm:ss') : 'Unknown'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {isJobDaemon(job) ? '∞' : `${job.active_executors ?? 0} / ${job.executor_count ?? 0}`}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}