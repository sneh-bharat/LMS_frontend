'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Shield,
  Lock,
} from 'lucide-react';
import AddUser, { FormData } from './AddNewAccess';

interface User {
  id: number;
  userId: string;
  userName: string;
  email: string;
  role: string;
  branchId: string;
  branchName: string;
  status: 'active' | 'inactive';
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
  };
  lastLogin: string;
  createdAt: string;
}

const SAMPLE_USERS: User[] = [
  {
    id: 1,
    userId: 'USR001',
    userName: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@hospital.com',
    role: 'Doctor',
    branchId: 'BR001',
    branchName: 'Downtown Medical Center',
    status: 'active',
    permissions: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      approve: true,
    },
    lastLogin: '2024-02-25 10:30 AM',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    userId: 'USR002',
    userName: 'Priya Sharma',
    email: 'priya.sharma@hospital.com',
    role: 'Lab Technician',
    branchId: 'BR002',
    branchName: 'Suburban Clinic',
    status: 'active',
    permissions: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      approve: false,
    },
    lastLogin: '2024-02-25 09:15 AM',
    createdAt: '2024-01-10',
  },
  {
    id: 3,
    userId: 'USR003',
    userName: 'Amit Patel',
    email: 'amit.patel@hospital.com',
    role: 'Receptionist',
    branchId: 'BR001',
    branchName: 'Downtown Medical Center',
    status: 'active',
    permissions: {
      view: true,
      create: true,
      edit: false,
      delete: false,
      approve: false,
    },
    lastLogin: '2024-02-25 08:45 AM',
    createdAt: '2024-01-20',
  },
  {
    id: 4,
    userId: 'USR004',
    userName: 'Admin User',
    email: 'admin@hospital.com',
    role: 'Admin',
    branchId: 'BR003',
    branchName: 'North Campus Hospital',
    status: 'active',
    permissions: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
    },
    lastLogin: '2024-02-25 11:00 AM',
    createdAt: '2024-01-05',
  },
];

const ROLES = ['Admin', 'Doctor', 'Lab Technician', 'Receptionist', 'Lab Manager', 'Data Analyst'];

function UserActionsMenu({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-2">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Eye size={14} /> View
          </button>
          <div className="h-[1px] bg-slate-100 my-1"></div>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function PermissionBadges({ permissions }: { permissions: User['permissions'] }) {
  const activePermissions = Object.entries(permissions)
    .filter(([, value]) => value)
    .map(([key]) => key);

  const permissionIcons: Record<string, string> = {
    view: '👁',
    create: '➕',
    edit: '✏️',
    delete: '🗑',
    approve: '✅',
  };

  return (
    <div className="flex gap-1 flex-wrap">
      {activePermissions.length > 0 ? (
        activePermissions.map(perm => (
          <span
            key={perm}
            className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-semibold"
          >
            <span>{permissionIcons[perm]}</span>
            {perm.charAt(0).toUpperCase() + perm.slice(1)}
          </span>
        ))
      ) : (
        <span className="text-xs text-slate-500">No permissions</span>
      )}
    </div>
  );
}

export default function UserAccessControl() {
  const [users, setUsers] = useState<User[]>(SAMPLE_USERS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.userId.toLowerCase().includes(search.toLowerCase()) ||
      user.userName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = (formData: FormData) => {
    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                userId: formData.userId,
                userName: formData.userName,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                permissions: formData.permissions,
              }
            : u
        )
      );
      setEditingUser(null);
    } else {
      const newUser: User = {
        id: Math.max(...users.map((u) => u.id), 0) + 1,
        ...formData,
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalPermissions = users.reduce((sum, u) => 
    sum + Object.values(u.permissions).filter(Boolean).length, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                <span className="text-teal-600">🔐 User</span> Access Control
              </h1>
              <p className="text-slate-600 text-base max-w-2xl">
                Manage user accounts, roles, and permissions for system access.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all shadow-md"
            >
              <Plus size={20} /> ADD NEW USER
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200">
              <p className="text-sm text-slate-600 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-teal-600 mt-1">{users.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-slate-600 font-medium">Active Users</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{activeUsers}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-slate-600 font-medium">Total Permissions</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{totalPermissions}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by User ID, Name, or Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative w-40">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                          <Lock size={14} /> {user.userId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{user.userName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                          <Shield size={14} /> {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <PermissionBadges permissions={user.permissions} />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {user.status === 'active' ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <UserActionsMenu
                          user={user}
                          onEdit={() => handleEdit(user)}
                          onDelete={() => handleDelete(user.id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-600">
                      <Search className="mx-auto mb-4 text-slate-400" size={32} />
                      <p className="font-semibold text-slate-900 mb-1">No Users Found</p>
                      <p className="text-sm">Try adjusting your filters or create a new user</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredUsers.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold">{filteredUsers.length}</span> of{' '}
                <span className="font-bold">{users.length}</span> users
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100">Prev</button>
                <button className="px-3 py-1 text-sm bg-teal-600 text-white rounded">1</button>
                <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddUser
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddUser}
        editData={editingUser}
        roles={ROLES}
      />
    </div>
  );
}