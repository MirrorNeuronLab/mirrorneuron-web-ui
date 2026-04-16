import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RunJob from '../pages/RunJob';
import api from '../api/client';

vi.mock('../api/client', () => ({
  default: {
    post: vi.fn()
  }
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

  it('renders default manifest JSON', () => {
    render(<BrowserRouter><RunJob /></BrowserRouter>);
    expect(screen.getByDisplayValue(/manifest_version/i)).toBeInTheDocument();
  });

  it('submits valid JSON and navigates to details', async () => {
    (api.post as any).mockResolvedValue({ data: { id: 'new-job-123' } });

    render(<BrowserRouter><RunJob /></BrowserRouter>);
    
    fireEvent.click(screen.getByText('Submit Job'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/jobs', expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith('/jobs/new-job-123');
    });
  });

  it('shows error on invalid JSON submission', async () => {
    render(<BrowserRouter><RunJob /></BrowserRouter>);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'invalid json' } });
    
    fireEvent.click(screen.getByText('Submit Job'));

    await waitFor(() => {
      expect(screen.getByText(/is not valid JSON/i)).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });
  });
});
