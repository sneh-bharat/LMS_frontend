import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RoleGuard from '@/components/guards/RoleGuard';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe('RoleGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
  });

  it('redirects to /login when no token exists', async () => {
    render(<RoleGuard><div>protected</div></RoleGuard>);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects to /login when no role exists', async () => {
    localStorage.setItem('token', 'valid-token');
    render(<RoleGuard><div>protected</div></RoleGuard>);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects when role is not in AUTHORIZED_ROLES', async () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('role', 'UNKNOWN_ROLE');
    render(<RoleGuard><div>protected</div></RoleGuard>);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('renders children for SUPER_ADMIN role', async () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('role', 'SUPER_ADMIN');
    const { getByText } = render(<RoleGuard><div>admin panel</div></RoleGuard>);
    await waitFor(() => {
      expect(getByText('admin panel')).toBeInTheDocument();
    });
  });

  it('renders children for RECEPTIONIST role', async () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('role', 'RECEPTIONIST');
    const { getByText } = render(<RoleGuard><div>reception</div></RoleGuard>);
    await waitFor(() => {
      expect(getByText('reception')).toBeInTheDocument();
    });
  });

  it('shows loading spinner while checking auth', () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('role', 'ADMIN');
    const { container } = render(<RoleGuard><div>content</div></RoleGuard>);
    // Before useEffect runs, should show spinner
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('removes auth keys on unauthorized role', async () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('refreshToken', 'refresh');
    localStorage.setItem('role', 'HACKER');
    render(<RoleGuard><div>protected</div></RoleGuard>);
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
    });
  });
});
