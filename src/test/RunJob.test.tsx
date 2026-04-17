import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RunJob from '../pages/RunJob';
import { uploadBundle, createJob } from '../api';

vi.mock('../api', () => ({
  uploadBundle: vi.fn(),
  createJob: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('RunJob Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area initially', () => {
    render(<BrowserRouter><RunJob /></BrowserRouter>);
    expect(screen.getByText('Submit New Job Bundle')).toBeInTheDocument();
    expect(screen.getByText(/upload a zipped job bundle/i)).toBeInTheDocument();
  });

  it('handles bundle upload and job submission', async () => {
    const mockBundleData = {
      bundle_path: '/tmp/test_bundle',
      manifest: { graph_id: 'test_graph' }
    };
    
    (uploadBundle as any).mockResolvedValue(mockBundleData);
    (createJob as any).mockResolvedValue({ id: 'new-job-123' });

    render(<BrowserRouter><RunJob /></BrowserRouter>);
    
    // Simulate file upload
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy content'], 'bundle.zip', { type: 'application/zip' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the mock api to return and the UI to show the manifest
    await waitFor(() => {
      expect(uploadBundle).toHaveBeenCalled();
      expect(screen.getByText('Bundle validated successfully')).toBeInTheDocument();
      expect(screen.getByText('test_graph')).toBeInTheDocument();
    });

    // Submit the job
    fireEvent.click(screen.getByText('Run Job Now'));

    await waitFor(() => {
      expect(createJob).toHaveBeenCalledWith({ _bundle_path: '/tmp/test_bundle' });
      expect(mockNavigate).toHaveBeenCalledWith('/jobs/new-job-123');
    });
  });

  it('shows error on upload failure', async () => {
    (uploadBundle as any).mockRejectedValue(new Error('Invalid bundle'));

    render(<BrowserRouter><RunJob /></BrowserRouter>);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['bad'], 'bad.zip', { type: 'application/zip' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/invalid bundle/i)).toBeInTheDocument();
    });
  });
});
