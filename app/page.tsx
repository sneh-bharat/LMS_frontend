 'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Settings, DollarSign, Bell, User, Plus, Edit, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('branches');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const branches = [
    { id: 1, name: 'Customer Support & Quality Assurance', status: 'active', balance: '$0.00', operation: 'PostpaidCredit' },
    { id: 2, name: 'Credit Franchise', email: 'kolkata.9090909090@email.com', status: 'active', balance: '$10000.00', operation: 'PostpaidCredit' },
    { id: 3, name: 'Cash', contact: 'Mashila Panchanantaola', status: 'active', balance: '$0.00', operation: 'PostpaidCredit' },
    { id: 4, name: 'Credit', contact: 'Mashila Institute Club', status: 'active', balance: '$10000.00', operation: 'PostpaidCredit' },
    { id: 5, name: 'Wallet Flexibility', email: 'kolkata.9090909090@email.com', status: 'active', balance: '$18000.00', operation: 'PostpaidCredit' },
    { id: 6, name: 'Wallet', contact: 'Mashila Institute Club', status: 'active', balance: '$18000.00', operation: 'PostpaidCredit' },
  ];

  const navItems = [
    { id: 'quick', label: 'Quick Activity', icon: '⭐' },
    { id: 'diagnostic', label: 'Diagnostic', icon: '🔍' },
    { id: 'invoices', label: 'Invoices', icon: '📄' },
    { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { id: 'collectors', label: 'Collectors', icon: '👥' },
    { id: 'members', label: 'Members', icon: '👫' },
    { id: 'estimations', label: 'Estimations', icon: '📊' },
    { id: 'branches', label: 'Branch & B2B', icon: '🏢' },
    { id: 'referrers', label: 'Referrers', icon: '🔗' },
    { id: 'investigations', label: 'Investigations', icon: '🔎' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-['Inter',sans-serif]">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl flex flex-col">
        <div className="p-6 border-b border-blue-700">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">ThinkLAB</h1>
            <p className="text-xs text-blue-200 font-medium">Enterprise Cloud LIS</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 text-sm font-medium ${activeNav === item.id
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-blue-100 hover:bg-white/10'
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-blue-700 p-4 space-y-3">
          <button className="w-full bg-white text-blue-900 px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm">
            Support
          </button>
          <button className="w-full px-4 py-2.5 rounded-lg border border-blue-400 text-blue-100 hover:bg-white/10 transition-colors text-sm font-medium flex items-center justify-center gap-2">
            <span className="text-lg">N</span>
            Account Info
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">List of Branches & B2B</h2>
              <span className="text-gray-400 text-xl">📋</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <p className="text-sm font-semibold text-gray-900">Support Call: 08062179988</p>
                <p className="text-xs text-gray-500">Monday to Saturday 10 AM - 7 PM</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell size={20} className="text-gray-600" />
                </button>
                <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <User size={18} className="text-gray-600" />
                </button>
                <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-700">Administrator</span>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="px-8 py-4 bg-gray-50 flex items-center gap-4 border-t border-gray-100">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-semibold text-sm border border-green-200">
              <DollarSign size={16} />
              Price List
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-sm border border-blue-200">
              <Plus size={16} />
              Add New
            </button>
            <input
              type="text"
              placeholder="Name, Address, Contact"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 max-w-xs"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Show All</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </header>

        {/* Table */}
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Branches & B2B</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Operation</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Balance / Credit</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isMounted && branches.map((branch, idx) => (
                    <tr key={branch.id} className="hover:bg-blue-50/50 transition-colors" suppressHydrationWarning>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💼</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{branch.name}</p>
                            <p className="text-xs text-gray-500">{branch.email || branch.contact}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{branch.email || branch.contact}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          {branch.operation}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{branch.balance}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Configuration" suppressHydrationWarning>
                            <Settings size={16} />
                          </button>
                          <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Price" suppressHydrationWarning>
                            <DollarSign size={16} />
                          </button>
                          <button className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors" title="Booking" suppressHydrationWarning>
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination / Footer */}
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600" suppressHydrationWarning>
            <p>Showing 6 of 20 branches</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Previous</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}