import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchJobDetails, fetchJobEvents, cancelJob } from '../api';
import type { JobDetails as JobDetailsType, JobEvent } from '../api';
import { format } from 'date-fns';
import { PlayCircle, CheckCircle, XCircle, Clock, AlertCircle, Ban } from 'lucide-react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'running': return <PlayCircle className="w-5 h-5 text-blue-500" />;
    case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
    case 'pending': return <Clock className="w-5 h-5 text-purple-500" />;
    case 'cancelled': return <Ban className="w-5 h-5 text-slate-500" />;
    default: return <AlertCircle className="w-5 h-5 text-slate-400" />;
  }
};

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const nodeWidth = 200;
  const nodeHeight = 60;
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

export default function JobDetails() {
  const { id } = useParams();
  const [details, setDetails] = useState<JobDetailsType | null>(null);
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'graph' | 'agents' | 'logs'>('graph');
  
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [d, e] = await Promise.all([fetchJobDetails(id), fetchJobEvents(id)]);
        setDetails(d);
        setEvents(e);
        
        // build graph
        const rawNodes = d.agents.map(a => ({
          id: a.agent_id,
          data: { 
            label: (
              <div className="flex flex-col">
                <div className="font-bold text-sm truncate">{a.agent_id}</div>
                <div className="text-xs text-gray-500 flex justify-between mt-1">
                  <span>{a.agent_type}</span>
                  <span className={a.status === 'running' ? 'text-blue-500' : 'text-slate-500'}>{a.status}</span>
                </div>
              </div>
            )
          },
          style: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', background: 'white', width: 200 },
        }));
        
        const rawEdges: any[] = [];
        d.agents.forEach(a => {
          if (a.metadata?.outbound_edges) {
            a.metadata.outbound_edges.forEach((target: string) => {
              rawEdges.push({
                id: `${a.agent_id}-${target}`,
                source: a.agent_id,
                target: target,
                animated: d.job.status === 'running',
              });
            });
          }
        });

        const layouted = getLayoutedElements(rawNodes, rawEdges);
        setNodes(layouted.nodes);
        setEdges(layouted.edges);

      } catch (err) {
        console.error('Failed to load job details', err);
      }
    };
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [id, setNodes, setEdges]);

  if (!details) return <div className="p-8">Loading...</div>;

  const handleCancel = async () => {
    if (confirm('Cancel this job?')) {
      await cancelJob(id!);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 shrink-0 flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-xl font-bold font-mono text-slate-800">{details.job.job_id}</h2>
            <div className="flex items-center bg-slate-100 px-3 py-1 rounded-full">
              <StatusIcon status={details.job.status} />
              <span className="ml-2 text-sm font-medium capitalize text-slate-700">{details.job.status}</span>
            </div>
          </div>
          <div className="text-slate-500 text-sm space-x-4">
            <span>Graph: <strong className="text-slate-700">{details.job.graph_id}</strong></span>
            <span>Submitted: <strong className="text-slate-700">{format(new Date(details.job.submitted_at), 'PP p')}</strong></span>
            <span>Executors: <strong className="text-slate-700">{details.job.active_executors ?? 0} / {details.job.executor_count ?? 0}</strong></span>
          </div>
        </div>
        {details.job.status === 'running' || details.job.status === 'pending' ? (
          <button onClick={handleCancel} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md font-medium text-sm hover:bg-red-100 transition-colors">
            Cancel Job
          </button>
        ) : null}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[500px]">
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-4">
          <button onClick={() => setActiveTab('graph')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'graph' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Graph View</button>
          <button onClick={() => setActiveTab('agents')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'agents' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Agents</button>
          <button onClick={() => setActiveTab('logs')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'logs' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Communication Logs</button>
        </div>

        <div className="flex-1 relative">
          {activeTab === 'graph' && (
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
              <Background color="#ccc" gap={16} />
              <MiniMap />
              <Controls />
            </ReactFlow>
          )}

          {activeTab === 'agents' && (
            <div className="overflow-auto absolute inset-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="text-sm text-slate-500">
                    <th className="px-6 py-3 font-medium">Agent ID</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Messages</th>
                    <th className="px-6 py-3 font-medium">Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {details.agents.map((agent) => (
                    <tr key={agent.agent_id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-sm text-purple-700 font-medium">{agent.agent_id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{agent.agent_type} / {agent.type}</td>
                      <td className="px-6 py-4 text-sm capitalize">{agent.status}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{agent.processed_messages} processed, {agent.mailbox_depth} in queue</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{agent.assigned_node}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="overflow-auto absolute inset-0 bg-slate-900 text-slate-300 font-mono text-sm p-4">
              {events.map((ev, i) => (
                <div key={i} className="mb-2">
                  <span className="text-slate-500">{format(new Date(ev.timestamp), 'HH:mm:ss.SSS')}</span>{' '}
                  <span className="text-blue-400">[{ev.type}]</span>{' '}
                  {ev.agent_id && <span className="text-purple-400 font-bold">{ev.agent_id}</span>}{' '}
                  <span className="text-green-300">{JSON.stringify(ev.payload)}</span>
                </div>
              ))}
              {events.length === 0 && <div className="text-slate-500 italic">No events recorded.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}