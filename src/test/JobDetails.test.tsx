import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JobDetails from '../pages/JobDetails';
import { fetchJobDetails, fetchJobEvents, cancelJob, pauseJob, resumeJob } from '../api';

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api')>();
  return {
    ...actual,
    fetchJobDetails: vi.fn(),
    fetchJobEvents: vi.fn(),
    cancelJob: vi.fn(),
    pauseJob: vi.fn(),
    resumeJob: vi.fn(),
  };
});

// Mock ReactFlow because we can't test canvas elements easily in jsdom
vi.mock('@xyflow/react', () => ({
  ReactFlow: () => <div data-testid="react-flow-mock">Graph View</div>,
  MiniMap: () => null,
  Controls: () => null,
  Background: () => null,
  useNodesState: () => [[], vi.fn(), vi.fn()],
  useEdgesState: () => [[], vi.fn(), vi.fn()],
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/jobs/:id" element={ui} />
      </Routes>
    </BrowserRouter>
  );
};

describe('JobDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mock window.location to ensure useParams picks it up
    window.history.pushState({}, 'Test page', '/jobs/test-job-1');
  });

  it('renders loading state initially', () => {
    (fetchJobDetails as any).mockReturnValue(new Promise(() => {}));
    (fetchJobEvents as any).mockReturnValue(new Promise(() => {}));
    
    renderWithRouter(<JobDetails />);
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders job details and switches tabs', async () => {
    const mockDetails = {
      job: {
        job_id: 'test-job-1',
        graph_id: 'graph-1',
        status: 'running',
        submitted_at: '2026-04-16T12:00:00Z',
        active_executors: 1,
        executor_count: 1
      },
      agents: [
        {
          agent_id: 'agent-1',
          agent_type: 'executor',
          type: 'worker',
          status: 'running',
          processed_messages: 5,
          mailbox_depth: 0,
          assigned_node: 'node-1'
        }
      ]
    };

    const mockEvents = [
      { timestamp: '2026-04-16T12:00:01Z', type: 'agent_started', payload: {} }
    ];

    (fetchJobDetails as any).mockResolvedValue(mockDetails);
    (fetchJobEvents as any).mockResolvedValue(mockEvents);

    renderWithRouter(<JobDetails />);

    await waitFor(() => {
      expect(screen.getByText('test-job-1')).toBeInTheDocument();
    });

    // Default tab is graph
    expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();

    // Switch to Agents tab
    fireEvent.click(screen.getByText('Agents'));
    expect(screen.getByText('agent-1')).toBeInTheDocument();
    expect(screen.getByText('executor / worker')).toBeInTheDocument();

    // Switch to Logs tab
    fireEvent.click(screen.getByText('Communication Logs'));
    expect(screen.getByText('[agent_started]')).toBeInTheDocument();
  });

  it('pauses a running job', async () => {
    const mockDetails = {
      job: {
        job_id: 'test-job-1',
        graph_id: 'graph-1',
        status: 'running',
        submitted_at: '2026-04-16T12:00:00Z',
      },
      agents: []
    };

    (fetchJobDetails as any).mockResolvedValue(mockDetails);
    (fetchJobEvents as any).mockResolvedValue([]);
    (pauseJob as any).mockResolvedValue({ status: 'paused', job_id: 'test-job-1' });

    renderWithRouter(<JobDetails />);

    await waitFor(() => {
      expect(screen.getByText('test-job-1')).toBeInTheDocument();
    });

    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);

    expect(pauseJob).toHaveBeenCalledWith('test-job-1');
    await waitFor(() => {
      expect(fetchJobDetails).toHaveBeenCalled(); // Ensure it was called
    });
  });

  it('resumes a paused job', async () => {
    const mockDetails = {
      job: {
        job_id: 'test-job-1',
        graph_id: 'graph-1',
        status: 'paused',
        submitted_at: '2026-04-16T12:00:00Z',
      },
      agents: []
    };

    (fetchJobDetails as any).mockResolvedValue(mockDetails);
    (fetchJobEvents as any).mockResolvedValue([]);
    (resumeJob as any).mockResolvedValue({ status: 'resumed', job_id: 'test-job-1' });

    renderWithRouter(<JobDetails />);

    await waitFor(() => {
      expect(screen.getByText('test-job-1')).toBeInTheDocument();
    });

    const resumeButton = screen.getByText('Resume');
    fireEvent.click(resumeButton);

    expect(resumeJob).toHaveBeenCalledWith('test-job-1');
    await waitFor(() => {
      expect(fetchJobDetails).toHaveBeenCalled(); // Ensure it was called
    });
  });

  it('cancels a job', async () => {
    const mockDetails = {
      job: {
        job_id: 'test-job-1',
        graph_id: 'graph-1',
        status: 'running',
        submitted_at: '2026-04-16T12:00:00Z',
      },
      agents: []
    };

    (fetchJobDetails as any).mockResolvedValue(mockDetails);
    (fetchJobEvents as any).mockResolvedValue([]);
    (cancelJob as any).mockResolvedValue({ status: 'cancelled', job_id: 'test-job-1' });

    renderWithRouter(<JobDetails />);

    await waitFor(() => {
      expect(screen.getByText('test-job-1')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Should open confirm modal
    expect(screen.getByText('Are you sure you want to cancel this job? This action cannot be undone and will stop all running agents.')).toBeInTheDocument();

    const confirmButton = screen.getAllByText('Cancel Job')[1];
    fireEvent.click(confirmButton);

    expect(cancelJob).toHaveBeenCalledWith('test-job-1');
    await waitFor(() => {
      expect(fetchJobDetails).toHaveBeenCalled(); // Ensure it was called
    });
  });
});
