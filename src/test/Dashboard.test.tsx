import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import { fetchSystemSummary } from '../api';

vi.mock('../api', () => ({
  fetchSystemSummary: vi.fn(),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeleton loading state initially', () => {
    // Return a promise that doesn't resolve immediately to keep it in loading state
    (fetchSystemSummary as any).mockReturnValue(new Promise(() => {}));
    
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

    (fetchSystemSummary as any).mockResolvedValue(mockData);

    render(<Dashboard />);

    // Wait for the data to load and skeleton to disappear
    await waitFor(() => {
      expect(screen.queryByText('Active Nodes')).toBeInTheDocument();
    });

    // Check if the correct counts are displayed
    const counts = screen.getAllByText('1', { selector: '.text-2xl.font-bold' });
    expect(counts.length).toBeGreaterThan(0); // 1 Node, 1 Running Job, 1 Pending Job etc.
    
    // Check if node details are rendered
    expect(screen.getByText('mn1@127.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('Pool: default')).toBeInTheDocument();
    expect(screen.getByText('Capacity: 2')).toBeInTheDocument();
  });
});
