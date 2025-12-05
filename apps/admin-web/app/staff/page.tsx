'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Users, Shield, User, Search, Edit, Save, X, Check, AlertCircle } from 'lucide-react';

interface StaffMember {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'admin' | 'staff' | 'customer';
  can_manage_orders: boolean;
  can_manage_menu: boolean;
  can_view_reports: boolean;
  created_at: string;
  last_login_at?: string;
}

interface StaffStats {
  totalStaff: number;
  admins: number;
  staff: number;
  activeThisMonth: number;
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    admins: 0,
    staff: 0,
    activeThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'staff'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<StaffMember>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [filterRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats
      const statsRes = await fetch('/api/staff/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      // Load staff
      const params = new URLSearchParams();
      if (filterRole !== 'all') {
        params.set('role', filterRole);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const staffRes = await fetch(`/api/staff?${params}`);
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData.data);
      } else {
        setError('Failed to load staff');
      }
    } catch (err) {
      console.error('Error loading staff:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const startEditing = (member: StaffMember) => {
    setEditingId(member.id);
    setEditData({
      full_name: member.full_name,
      phone: member.phone,
      role: member.role,
      can_manage_orders: member.can_manage_orders,
      can_manage_menu: member.can_manage_menu,
      can_view_reports: member.can_view_reports,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveChanges = async (memberId: string) => {
    try {
      setSaving(true);
      setError(null);

      // Update role if changed
      const originalMember = staff.find(s => s.id === memberId);
      if (originalMember && editData.role && editData.role !== originalMember.role) {
        const roleRes = await fetch(`/api/staff/${memberId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: editData.role }),
        });

        if (!roleRes.ok) {
          const error = await roleRes.json();
          throw new Error(error.error || 'Failed to update role');
        }
      }

      // Update permissions
      const permissions = {
        can_manage_orders: editData.can_manage_orders,
        can_manage_menu: editData.can_manage_menu,
        can_view_reports: editData.can_view_reports,
      };

      const permRes = await fetch(`/api/staff/${memberId}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });

      if (!permRes.ok) {
        const error = await permRes.json();
        throw new Error(error.error || 'Failed to update permissions');
      }

      // Update profile
      if (editData.full_name !== undefined || editData.phone !== undefined) {
        const profile = {
          full_name: editData.full_name,
          phone: editData.phone,
        };

        const profileRes = await fetch(`/api/staff/${memberId}/profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile }),
        });

        if (!profileRes.ok) {
          const error = await profileRes.json();
          throw new Error(error.error || 'Failed to update profile');
        }
      }

      setSuccess('Staff member updated successfully');
      setEditingId(null);
      setEditData({});
      await loadData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving changes:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'staff':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
          <p className="text-gray-600">Manage team members, roles, and permissions</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <div className="font-semibold text-red-900">Error</div>
              <div className="text-red-700">{error}</div>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-green-700">{success}</div>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Staff"
            value={stats.totalStaff}
            color="blue"
          />
          <StatCard
            icon={Shield}
            label="Admins"
            value={stats.admins}
            color="purple"
          />
          <StatCard
            icon={User}
            label="Staff"
            value={stats.staff}
            color="green"
          />
          <StatCard
            icon={Check}
            label="Active This Month"
            value={stats.activeThisMonth}
            color="orange"
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="staff">Staff</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading staff...</div>
          ) : staff.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No staff members found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      {editingId === member.id ? (
                        <EditRow
                          member={member}
                          editData={editData}
                          setEditData={setEditData}
                          onSave={() => saveChanges(member.id)}
                          onCancel={cancelEditing}
                          saving={saving}
                        />
                      ) : (
                        <ViewRow
                          member={member}
                          onEdit={() => startEditing(member)}
                          getRoleBadgeColor={getRoleBadgeColor}
                          formatDate={formatDate}
                        />
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: number | string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  );
}

function ViewRow({ member, onEdit, getRoleBadgeColor, formatDate }: any) {
  return (
    <>
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">
          {member.full_name || 'Unnamed'}
        </div>
        {member.phone && (
          <div className="text-sm text-gray-500">{member.phone}</div>
        )}
      </td>
      <td className="px-6 py-4 text-gray-600">{member.email}</td>
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
            member.role
          )}`}
        >
          {member.role}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {member.can_manage_orders && (
            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
              Orders
            </span>
          )}
          {member.can_manage_menu && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
              Menu
            </span>
          )}
          {member.can_view_reports && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
              Reports
            </span>
          )}
          {!member.can_manage_orders &&
            !member.can_manage_menu &&
            !member.can_view_reports && (
              <span className="text-gray-400 text-xs">No permissions</span>
            )}
        </div>
      </td>
      <td className="px-6 py-4 text-gray-600 text-sm">
        {formatDate(member.last_login_at)}
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
        >
          <Edit className="w-4 h-4" />
        </button>
      </td>
    </>
  );
}

function EditRow({ member, editData, setEditData, onSave, onCancel, saving }: any) {
  return (
    <>
      <td className="px-6 py-4">
        <input
          type="text"
          value={editData.full_name || ''}
          onChange={(e) =>
            setEditData({ ...editData, full_name: e.target.value })
          }
          className="w-full px-2 py-1 border border-gray-300 rounded"
          placeholder="Full name"
        />
        <input
          type="text"
          value={editData.phone || ''}
          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
          className="w-full px-2 py-1 border border-gray-300 rounded mt-1 text-sm"
          placeholder="Phone"
        />
      </td>
      <td className="px-6 py-4 text-gray-600 text-sm">{member.email}</td>
      <td className="px-6 py-4">
        <select
          value={editData.role}
          onChange={(e) => setEditData({ ...editData, role: e.target.value as any })}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editData.can_manage_orders}
              onChange={(e) =>
                setEditData({ ...editData, can_manage_orders: e.target.checked })
              }
              className="rounded"
            />
            Orders
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editData.can_manage_menu}
              onChange={(e) =>
                setEditData({ ...editData, can_manage_menu: e.target.checked })
              }
              className="rounded"
            />
            Menu
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editData.can_view_reports}
              onChange={(e) =>
                setEditData({ ...editData, can_view_reports: e.target.checked })
              }
              className="rounded"
            />
            Reports
          </label>
        </div>
      </td>
      <td className="px-6 py-4"></td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </td>
    </>
  );
}
