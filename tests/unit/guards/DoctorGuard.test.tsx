import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DoctorGuard from '@/components/guards/DoctorGuard';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe('DoctorGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
  });

  it('redirects to /doctor-login when no doctor-token', async () => {
    render(<DoctorGuard><div>doctor panel</div></DoctorGuard>);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/doctor-login');
    });
  });

  it('redirects when role is not DOCTOR', async () => {
    localStorage.setItem('doctor-token', 'valid-token');
    localStorage.setItem('role', 'ADMIN');
    render(<DoctorGuard><div>doctor panel</div></DoctorGuard>);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/doctor-login');
    });
  });

  it('renders children when role is DOCTOR with valid token', async () => {
    localStorage.setItem('doctor-token', 'valid-token');
    localStorage.setItem('role', 'DOCTOR');
    const { getByText } = render(<DoctorGuard><div>doctor dashboard</div></DoctorGuard>);
    await waitFor(() => {
      expect(getByText('doctor dashboard')).toBeInTheDocument();
    });
  });

  it('does not redirect when authorized', async () => {
    localStorage.setItem('doctor-token', 'valid-token');
    localStorage.setItem('role', 'DOCTOR');
    render(<DoctorGuard><div>content</div></DoctorGuard>);
    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
