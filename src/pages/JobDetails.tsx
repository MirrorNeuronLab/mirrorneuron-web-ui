import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobDetails, fetchJobEvents, fetchJobAgentGraph, cancelJob, pauseJob, resumeJob } from '../api';
import type { AgentGraph, JobDetails as JobDetailsType, JobEvent } from '../api';
import { format } from 'date-fns';
import { PlayCircle, CheckCircle, XCircle, Clock, AlertCircle, Ban, PauseCircle, Play, Loader2, Network, RadioTower, MessageSquare } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { WorkflowAgentGraph } from '../components/WorkflowAgentGraph';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'running': return <PlayCircle className="w-5 h-5 text-neutral-700" />;
    case 'completed': return <CheckCircle className="w-5 h-5 text-neutral-700" />;
    case 'failed': return <XCircle className="w-5 h-5 text-neutral-700" />;
    case 'pending': return <Clock className="w-5 h-5 text-neutral-700" />;
    case 'paused': return <PauseCircle className="w-5 h-5 text-neutral-700" />;
    case 'cancelled': return <Ban className="w-5 h-5 text-neutral-500" />;
    default: return <AlertCircle className="w-5 h-5 text-neutral-400" />;
  }
};

const statusClass = (status: string) => {
  switch (status) {
    case 'running': return 'bg-neutral-100 text-neutral-950 border-neutral-300';
    case 'completed': return 'bg-neutral-100 text-neutral-950 border-neutral-300';
    case 'failed':
    case 'error': return 'bg-neutral-100 text-neutral-950 border-neutral-300';
    case 'paused': return 'bg-neutral-100 text-neutral-950 border-neutral-300';
    case 'pending': return 'bg-neutral-100 text-neutral-950 border-neutral-300';
    default: return 'bg-neutral-50 text-neutral-700 border-neutral-200';
  }
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<JobDetailsType | null>(null);
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [graph, setGraph] = useState<AgentGraph | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'agents' | 'logs'>('graph');
  
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isPausing, setIsPausing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [d, e, g] = await Promise.all([
        fetchJobDetails(id),
        fetchJobEvents(id).catch((err) => {
          console.error('Failed to load job events', err);
          return [] as JobEvent[];
        }),
        fetchJobAgentGraph(id).catch((err) => {
          console.error('Failed to load job agent graph', err);
          return {
            job_id: id,
            graph_id: null,
            status: 'unknown',
            nodes: [],
            edges: [],
            stats: { agent_count: 0, edge_count: 0, message_count: 0, event_count: 0 },
          } satisfies AgentGraph;
        }),
      ]);
      setDetails(d);
      setEvents(e);
      setGraph(g);

    } catch (err) {
      console.error('Failed to load job details', err);
    }
  }, [id]);

  useEffect(() => {
    const initialLoad = setTimeout(load, 0);
    const timer = setInterval(load, 3000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(timer);
    };
  }, [load]);

  if (!details || !details.job) return <div className="p-8">Loading or Invalid Job...</div>;

  const handleCancel = async () => {
    try {
      setCancelError(null);
      setIsCancelling(true);
      await cancelJob(id!);
      navigate('/jobs');
    } catch (err: unknown) {
      console.error('Failed to cancel job', err);
      const message = err instanceof Error ? err.message : 'Failed to cancel job';
      setCancelError(message);
      setIsCancelling(false);
    }
  };

  const handlePause = async () => {
    try {
      setIsPausing(true);
      await pauseJob(id!);
      await load();
    } catch (err) {
      console.error('Failed to pause job', err);
    } finally {
      setIsPausing(false);
    }
  };

  const handleResume = async () => {
    try {
      setIsResuming(true);
      await resumeJob(id!);
      await load();
    } catch (err) {
      console.error('Failed to resume job', err);
    } finally {
      setIsResuming(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 shrink-0">
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-xl font-bold font-mono text-neutral-950">{details.job.job_id}</h2>
            <div className={`flex items-center px-3 py-1 rounded-full border ${statusClass(details.job.status)}`}>
              <StatusIcon status={details.job.status} />
              <span className="ml-2 text-sm font-medium capitalize">{details.job.status}</span>
            </div>
          </div>
          <div className="text-neutral-500 text-sm flex flex-wrap gap-x-4 gap-y-2">
            <span>Graph: <strong className="text-neutral-700">{details.job.graph_id || 'unknown'}</strong></span>
            <span>Submitted: <strong className="text-neutral-700">{details.job.submitted_at ? format(new Date(details.job.submitted_at), 'PP p') : 'unknown'}</strong></span>
          </div>
        </div>
        <div className="flex gap-2">
          {details.job.status === 'running' ? (
            <button disabled={isPausing} onClick={handlePause} className="px-4 py-2 bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-md font-medium text-sm hover:bg-neutral-50 transition-colors flex items-center disabled:opacity-50">
              {isPausing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PauseCircle className="w-4 h-4 mr-2" />} Pause
            </button>
          ) : details.job.status === 'paused' ? (
            <button disabled={isResuming} onClick={handleResume} className="px-4 py-2 bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-md font-medium text-sm hover:bg-neutral-50 transition-colors flex items-center disabled:opacity-50">
              {isResuming ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />} Resume
            </button>
          ) : null}
          {(details.job.status === 'running' || details.job.status === 'pending' || details.job.status === 'paused') ? (
            <button disabled={isCancelling} onClick={() => setShowCancelConfirm(true)} className="px-4 py-2 bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-md font-medium text-sm hover:bg-neutral-50 transition-colors flex items-center disabled:opacity-50">
              {isCancelling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />} Cancel
            </button>
          ) : null}
        </div>
      </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
            <Network className="w-4 h-4 text-neutral-400 mb-3" />
            <div className="text-2xl font-semibold text-neutral-950">{graph?.stats.agent_count || details.agents.length}</div>
            <div className="text-xs font-medium text-neutral-500">Agents</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
            <RadioTower className="w-4 h-4 text-neutral-400 mb-3" />
            <div className="text-2xl font-semibold text-neutral-950">{graph?.stats.edge_count ?? 0}</div>
            <div className="text-xs font-medium text-neutral-500">Links</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
            <MessageSquare className="w-4 h-4 text-neutral-400 mb-3" />
            <div className="text-2xl font-semibold text-neutral-950">{graph?.stats.message_count ?? 0}</div>
            <div className="text-xs font-medium text-neutral-500">Messages</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm flex-1 flex flex-col min-h-[560px] overflow-hidden">
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-4">
          <button onClick={() => setActiveTab('graph')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'graph' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-600 hover:text-neutral-950'}`}>Graph View</button>
          <button onClick={() => setActiveTab('agents')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'agents' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-600 hover:text-neutral-950'}`}>Agents</button>
          <button onClick={() => setActiveTab('logs')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'logs' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-600 hover:text-neutral-950'}`}>Communication Logs</button>
        </div>

        <div className="flex-1 relative">
          {activeTab === 'graph' && (
            <WorkflowAgentGraph
              graph={graph}
              agents={details.agents || []}
              fallbackJobId={details.job.job_id}
              fallbackGraphId={details.job.graph_id}
              fallbackStatus={details.job.status}
            />
          )}

          {activeTab === 'agents' && (
            <div className="overflow-auto absolute inset-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-50 sticky top-0">
                  <tr className="text-sm text-neutral-500">
                    <th className="px-6 py-3 font-medium">Agent ID</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Messages</th>
                    <th className="px-6 py-3 font-medium">Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(details.agents || []).map((agent, i) => (
                    <tr key={agent.agent_id || i} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 font-mono text-sm text-neutral-950 font-medium">{agent.agent_id || 'unknown'}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{agent.agent_type || 'unknown'} / {agent.type || 'unknown'}</td>
                      <td className="px-6 py-4 text-sm capitalize">{agent.status || 'unknown'}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{agent.processed_messages ?? 0} processed, {agent.mailbox_depth ?? 0} in queue</td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{agent.assigned_node || 'unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="overflow-auto absolute inset-0 bg-neutral-950 text-neutral-300 font-mono text-sm p-4">
              {(events || []).slice().reverse().map((ev, i) => (
                <div key={i} className="mb-2">
                  <span className="text-neutral-500">{ev.timestamp ? format(new Date(ev.timestamp), 'HH:mm:ss.SSS') : 'unknown'}</span>{' '}
                  <span className="text-neutral-300">[{ev.type}]</span>{' '}
                  {ev.agent_id && <span className="text-neutral-300 font-bold">{ev.agent_id}</span>}{' '}
                  <span className="text-neutral-300">{ev.payload ? JSON.stringify(ev.payload) : ''}</span>
                </div>
              ))}
              {events.length === 0 && <div className="text-neutral-500 italic">No events recorded.</div>}
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={showCancelConfirm}
        title="Cancel Job"
        message="Are you sure you want to cancel this job? This action cannot be undone and will stop all running agents."
        confirmLabel="Cancel Job"
        onConfirm={handleCancel}
        onCancel={() => {
          setShowCancelConfirm(false);
          setCancelError(null);
        }}
        isProcessing={isCancelling}
        error={cancelError}
      />
    </div>
  );
}
