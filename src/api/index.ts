import api from './client';

export interface SystemSummary {
  nodes: {
    name: string;
    connected_nodes: string[];
    self?: boolean;
    executor_pools: Record<string, {
      capacity: number;
      available: number;
      in_use: number;
      queued: number;
      active: number;
    }>;
  }[];
  jobs: {
    job_id: string;
    status: string;
  }[];
}

export interface Job {
  job_id: string;
  graph_id: string;
  status: string;
  submitted_at: string;
  updated_at: string;
  executor_count?: number;
  active_executors?: number;
  daemon?: boolean;
}

export interface JobDetails {
  job: Job;
  summary: any;
  agents: Agent[];
  sandboxes: any[];
  recent_events: JobEvent[];
}

export interface Agent {
  agent_id: string;
  agent_type: string;
  type: string;
  assigned_node: string;
  status: string;
  running?: boolean;
  processed_messages: number;
  mailbox_depth: number;
  paused?: boolean;
  metadata?: {
    outbound_edges?: string[];
  };
}

export interface JobEvent {
  timestamp: string;
  type: string;
  agent_id?: string;
  payload: any;
}

export const fetchSystemSummary = () => api.get<SystemSummary>('/system/summary').then(r => r.data);
export const fetchJobs = () => api.get<{ data: Job[] }>('/jobs').then(r => r.data.data);
export const fetchJobDetails = (id: string) => api.get<JobDetails>(`/jobs/${id}`).then(r => r.data);
export const fetchJobEvents = (id: string) => api.get<{ data: JobEvent[] }>(`/jobs/${id}/events`).then(r => r.data.data);
export const cancelJob = (id: string) => api.post(`/jobs/${id}/cancel`).then(r => r.data);
export const reloadBundle = (bundle_id: string) => api.post(`/bundles/${bundle_id}/reload`).then(r => r.data);

export const pauseJob = (id: string) => api.post(`/jobs/${id}/pause`).then(r => r.data);
export const resumeJob = (id: string) => api.post(`/jobs/${id}/resume`).then(r => r.data);
export const uploadBundle = (file: File) => {
  const formData = new FormData();
  formData.append('bundle', file);
  return api.post('/bundles/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};
export const createJob = (payload: any) => api.post('/jobs', payload).then(r => r.data);