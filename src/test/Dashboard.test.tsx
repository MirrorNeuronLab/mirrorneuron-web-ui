import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import { fetchJobs, fetchSystemSummary } from '../api';

vi.mock('../api', () => ({
  fetchSystemSummary: vi.fn(),
  fetchJobs: vi.fn(),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeleton loading state initially', () => {
    // Return a promise that doesn't resolve immediately to keep it in loading state
    vi.mocked(fetchSystemSummary).mockReturnValue(new Promise(() => {}));
    vi.mocked(fetchJobs).mockReturnValue(new Promise(() => {}));
    
    const { container } = render(<Dashboard />);
    
    // Check if the skeleton pulse animation is present
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders data correctly when loaded', async () => {
    const mockData = {
      nodes: [
        {
          name: 'mn1@127.0.0.1',
          connected_nodes: ['mn1@127.0.0.1'],
          self: true,
          executor_pools: {
            default: { capacity: 2, available: 1, in_use: 1, queued: 0, active: 1 }
          }
        }
      ],
      jobs: [
        { job_id: 'job1', status: 'running' },
        { job_id: 'job2', status: 'pending' }
      ]
    };

    vi.mocked(fetchSystemSummary).mockResolvedValue(mockData);
    vi.mocked(fetchJobs).mockResolvedValue([
      { job_id: 'job1', graph_id: 'graph-1', status: 'running', active_executors: 1, executor_count: 2 },
      { job_id: 'job2', graph_id: 'graph-2', status: 'pending', active_executors: 0, executor_count: 1 },
    ]);

    render(<Dashboard />);

    // Wait for the data to load and skeleton to disappear
    await waitFor(() => {
      expect(screen.queryByText('Total Jobs')).toBeInTheDocument();
    });

    expect(screen.getByText('Active Jobs')).toBeInTheDocument();
    expect(screen.getByText('Executor Slots')).toBeInTheDocument();
    
    // Check if node details are rendered
    expect(screen.getByText('mn1@127.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('Pool: default')).toBeInTheDocument();
    expect(screen.getByText('Capacity')).toBeInTheDocument();
  });
});
