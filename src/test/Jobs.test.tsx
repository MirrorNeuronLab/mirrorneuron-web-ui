import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Jobs from '../pages/Jobs';
import { fetchJobs } from '../api';

vi.mock('../api', () => ({
  fetchJobs: vi.fn(),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Jobs Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeleton loading state initially', () => {
    (fetchJobs as any).mockReturnValue(new Promise(() => {}));
    
    const { container } = renderWithRouter(<Jobs />);
    
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders "No jobs found" when data is empty', async () => {
    (fetchJobs as any).mockResolvedValue([]);

    renderWithRouter(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('No jobs found.')).toBeInTheDocument();
    });
  });

  it('renders jobs list correctly', async () => {
    const mockJobs = [
      {
        job_id: 'test-job-123',
        graph_id: 'simple-graph',
        status: 'completed',
        submitted_at: '2026-04-16T12:00:00Z',
        active_executors: 0,
        executor_count: 2
      }
    ];

    (fetchJobs as any).mockResolvedValue(mockJobs);

    renderWithRouter(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('test-job-123')).toBeInTheDocument();
    });

    expect(screen.getByText('simple-graph')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('0 / 2')).toBeInTheDocument();
  });
});
