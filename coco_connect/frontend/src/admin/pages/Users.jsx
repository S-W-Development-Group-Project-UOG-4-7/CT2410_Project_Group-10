import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";
import { 
  Search, 
  Download, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Users as UsersIcon,
  Shield, 
  BarChart3,
  PieChart,
  TrendingUp,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit3,
  Trash2,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
  Clock
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

/* -----------------------------
   Toast Notification Component
------------------------------ */
function ToastNotification({ message, type = 'success', onClose }) {
  const bgColor = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColor = {
    success: 'text-emerald-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600'
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      <div className={`pointer-events-auto max-w-md w-full rounded-xl border p-4 shadow-lg ${bgColor[type]}`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${iconColor[type]}`}>
            {icons[type]}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Toast Hook
------------------------------ */
function useToast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = (message, type = 'success', duration = 3000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({ message, type });
    
    timeoutRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  };

  const hideToast = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast(null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { toast, showToast, hideToast };
}

/* -----------------------------
   Auth helpers (unchanged keys)
------------------------------ */
function getAccessToken() {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    ""
  );
}

function authHeaders(extra = {}) {
  const token = getAccessToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* -----------------------------
   Small utils
------------------------------ */
function fmtDateTime(d = new Date()) {
  try {
    return new Intl.DateTimeFormat("en-LK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

function formatTime(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

// ✅ supports BOTH old single role and new multi-roles
function safeRole(u) {
  const rolesArr = Array.isArray(u?.roles) ? u.roles : null;

  if (rolesArr && rolesArr.length) {
    const names = rolesArr
      .map((r) => (typeof r === "string" ? r : r?.name || r?.slug || ""))
      .filter(Boolean)
      .map((x) => x.toString().trim())
      .filter(Boolean);

    if (names.length) {
      return names
        .map((x) => {
          const lower = x.toLowerCase();
          if (lower === "admin") return "Admin";
          if (lower === "user") return "User";
          return x;
        })
        .join(", ");
    }
  }

  const r = (u?.role || "").toString().trim();
  if (!r) return u?.is_staff ? "Admin" : "User";
  const lower = r.toLowerCase();
  if (lower === "admin") return "Admin";
  if (lower === "user") return "User";
  return r;
}

function statusLabel(u) {
  return u?.is_active ? "Active" : "Inactive";
}

/* -----------------------------
   Stat Card Component
------------------------------ */
function StatCard({ icon: Icon, label, value, color = "neutral", trend = null }) {
  const colorClasses = {
    primary: "bg-[#6b3f23]/10 border-[#6b3f23]/20 text-[#6b3f23]",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    danger: "bg-red-50 border-red-200 text-red-900",
    neutral: "bg-white border-[#ece7e1] text-[#6b3f23]",
  };

  return (
    <div className={`rounded-2xl border p-5 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/50">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 text-xs flex items-center">
          <span className={`${trend.value > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
}

/* -----------------------------
   User Table Component - UPDATED: Removed delete option
------------------------------ */
function UserTableRow({ user, onManageRoles, onToggleActive, showToast }) {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 pl-6">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center mr-3">
            <span className="font-bold text-emerald-700 text-sm">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name || 'No Name'}</div>
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <Mail className="h-3 w-3 mr-1" />
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="py-4">
        <div className="flex items-center">
          <Shield className="h-4 w-4 text-gray-400 mr-2" />
          <span className="font-medium text-gray-700">{safeRole(user)}</span>
        </div>
      </td>
      <td className="py-4">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(user.created_at)}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(user.created_at)}
          </div>
        </div>
      </td>
      <td className="py-4">
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full mr-2 ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className={`font-medium ${user.is_active ? 'text-emerald-700' : 'text-red-700'}`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </td>
      <td className="py-4 pr-6">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onManageRoles(user)}
            className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Manage Roles"
          >
            <Shield className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToggleActive(user.id, !user.is_active)}
            className={`p-2 rounded-lg transition-colors ${user.is_active 
              ? 'text-amber-600 hover:bg-amber-50' 
              : 'text-emerald-600 hover:bg-emerald-50'}`}
            title={user.is_active ? 'Deactivate' : 'Activate'}
          >
            {user.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="More actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
                  <button
                    onClick={() => {
                      onManageRoles(user);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center"
                  >
                    <Edit3 className="h-4 w-4 mr-2 text-gray-500" />
                    Manage Roles
                  </button>
                  <button
                    onClick={() => {
                      onToggleActive(user.id, !user.is_active);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center"
                  >
                    {user.is_active ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2 text-amber-500" />
                        Deactivate User
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                        Activate User
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

/* -----------------------------
   Filter Panel Component
------------------------------ */
function FilterPanel({ filters, setFilters, availableRoles }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="bg-white border border-[#ece7e1] rounded-2xl p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center">
          <Filter className="h-5 w-5 mr-2 text-gray-500" />
          <span className="font-medium text-[#6b3f23]">Filters</span>
          <span className="ml-2 text-sm text-gray-500">
            ({Object.values(filters).filter(v => v !== '' && v !== 'all').length} active)
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      
      {isOpen && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex space-x-2">
              {['all', 'active', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilters({ ...filters, status })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filters.status === status ? 'bg-[#6b3f23] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Inactive'}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full rounded-xl border border-[#ece7e1] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="all">All Roles</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setFilters({ status: 'all', role: 'all' })}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -----------------------------
   Roles Manager (updated to use groups endpoint)
------------------------------ */
function RolesManager({ onAnyRoleChange, showToast }) {
  const [groups, setGroups] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "" }); // Removed description
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupPermIds, setGroupPermIds] = useState([]);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) || null,
    [groups, selectedGroupId]
  );

  // Fetch groups from backend
  const fetchGroups = async () => {
    setLoading(true);
    try {
      // Use /groups/ endpoint instead of /roles/
      const res = await fetch(`${API_BASE}/groups/`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (e) {
      console.error("Error fetching roles:", e);
      const fallbackGroups = [
        { id: 1, name: "Admin", permission_ids: [] },
        { id: 2, name: "Investor", permission_ids: [] },
        { id: 3, name: "Idea-creator", permission_ids: [] },
        { id: 4, name: "Customer", permission_ids: [] },
        { id: 5, name: "Project-owner", permission_ids: [] },
        { id: 6, name: "Farmer", permission_ids: [] }
      ];
      setGroups(fallbackGroups);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await fetch(`${API_BASE}/permissions/`, {
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to fetch permissions");
      setPermissions(data.permissions || data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      setGroupPermIds([]);
      return;
    }
    setGroupPermIds(selectedGroup.permission_ids || []);
  }, [selectedGroup]);

  const onCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name.trim()) {
      showToast("Role name is required", "error");
      return;
    }

    setSaving(true);
    try {
      // Use /groups/ endpoint for creation
      const res = await fetch(`${API_BASE}/groups/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          name: newGroup.name,
          // Description removed as requested
        }),
      });

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "Failed to create role");
      }

      setNewGroup({ name: "" }); // Reset only name
      await fetchGroups();
      onAnyRoleChange?.();
      showToast(data.message || "Role created successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteGroup = async (group) => {
    const name = group?.name || "this role";
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setSaving(true);
    try {
      // Updated endpoint for deleting groups
      const res = await fetch(`${API_BASE}/groups/${group.id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "Failed to delete role");
      }

      setSelectedGroupId(null);
      await fetchGroups();
      onAnyRoleChange?.();
      showToast(data.message || "Role deleted successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const togglePerm = (permId) => {
    setGroupPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const onSaveGroupPermissions = async () => {
    if (!selectedGroup) return;

    setSaving(true);
    try {
      // Updated endpoint for updating groups
      const res = await fetch(`${API_BASE}/groups/${selectedGroup.id}/`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ 
          permission_ids: groupPermIds,
          name: selectedGroup.name
        }),
      });

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "Failed to update role permissions");
      }

      await fetchGroups();
      onAnyRoleChange?.();
      showToast(data.message || "Permissions updated successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#ece7e1] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#6b3f23]">Roles & Permissions</h3>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage user roles with specific permissions
            </p>
          </div>
          <button
            onClick={fetchGroups}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-white border border-[#ece7e1] rounded-xl hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Create role - UPDATED: Removed description field */}
        <div className="mb-8">
          <h4 className="font-semibold text-[#6b3f23] mb-4">Create New Role</h4>
          <form onSubmit={onCreateGroup} className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name *
                </label>
                <input
                  value={newGroup.name}
                  onChange={(e) => setNewGroup((s) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g., Distributor"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center px-4 py-2 bg-[#6b3f23] text-white rounded-xl hover:bg-[#5a3620] disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {saving ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Groups list + editor */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Groups list */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h4 className="font-semibold text-[#6b3f23] mb-4">All Roles ({groups.length})</h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {groups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No roles created yet
                  </div>
                ) : (
                  groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroupId(g.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${selectedGroupId === g.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-[#6b3f23]">{g.name}</div>
                        </div>
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {g.permission_ids?.length || 0} permissions
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Group editor */}
          <div className="lg:col-span-2">
            {!selectedGroup ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h4 className="font-semibold text-gray-700 mb-2">Select a Role</h4>
                <p className="text-gray-500 text-sm">
                  Choose a role from the list to view and edit its permissions
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-[#6b3f23]">
                      {selectedGroup.name}
                    </h4>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={onSaveGroupPermissions}
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => onDeleteGroup(selectedGroup)}
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-white border border-red-300 text-red-600 rounded-xl hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h5 className="font-semibold text-[#6b3f23] mb-4">
                    Permissions ({groupPermIds.length} selected)
                  </h5>
                  
                  {permissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No permissions found</p>
                      <p className="text-sm mt-2">Your backend needs to expose permissions</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map((p) => {
                        const checked = groupPermIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${checked
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:bg-white'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePerm(p.id)}
                              className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
                            />
                            <div className="ml-3">
                              <div className="font-medium text-gray-900">
                                {p.name || p.code}
                              </div>
                              <div className="text-xs text-gray-500">
                                {p.code}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   User Roles Modal (updated to use correct endpoints)
------------------------------ */
function UserRolesModal({ isOpen, onClose, user, onChanged, showToast }) {
  const modalRef = useRef(null);
  const [groups, setGroups] = useState([]);
  const [userGroupIds, setUserGroupIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const userId = user?.id;
  const userGroupSet = useMemo(() => new Set(userGroupIds), [userGroupIds]);

  const fetchGroupsAndUserGroups = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Fetch all groups
      const groupsRes = await fetch(`${API_BASE}/groups/`, { headers: authHeaders() });
      if (!groupsRes.ok) throw new Error("Failed to fetch groups");
      const groupsData = await groupsRes.json();
      
      // Fetch user's current groups - using correct endpoint
      const userGroupsRes = await fetch(`${API_BASE}/users/${userId}/roles/`, { 
        headers: authHeaders() 
      });
      
      let assignedGroupIds = [];
      if (userGroupsRes.ok) {
        const userGroupsData = await userGroupsRes.json();
        assignedGroupIds = userGroupsData.role_ids || userGroupsData.group_ids || [];
      }

      setGroups(groupsData.groups || []);
      setUserGroupIds(assignedGroupIds);
    } catch (e) {
      console.error(e);
      showToast("Failed to load roles. Please check your connection and permissions.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchGroupsAndUserGroups();
  }, [isOpen, userId]);

  const onBackdrop = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  const assignGroup = async (groupId) => {
    if (!userId) return;
    setSaving(true);
    try {
      // Updated endpoint for assigning roles
      const res = await fetch(`${API_BASE}/users/${userId}/roles/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ 
          role_ids: [groupId],
        }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to assign role");
      }
      
      setUserGroupIds((prev) => (prev.includes(groupId) ? prev : [...prev, groupId]));
      onChanged?.();
      showToast("Role assigned successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const removeGroup = async (groupId) => {
    if (!userId) return;
    setSaving(true);
    try {
      // Updated endpoint for removing roles
      const res = await fetch(`${API_BASE}/users/${userId}/roles/`, {
        method: "DELETE",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ 
          role_ids: [groupId],
        }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to remove role");
      }
      
      setUserGroupIds((prev) => prev.filter((id) => id !== groupId));
      onChanged?.();
      showToast("Role removed successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = async (groupId) => {
    if (saving) return;
    if (userGroupSet.has(groupId)) {
      await removeGroup(groupId);
    } else {
      await assignGroup(groupId);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onBackdrop}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#6b3f23]">Manage User Roles</h3>
              <p className="text-sm text-gray-600 mt-1">
                {user?.name || 'User'} • {user?.email || 'No email'}
              </p>
              <div className="mt-2 text-sm">
                <span className="font-medium">Current roles:</span>{" "}
                {user?.roles?.join(", ") || safeRole(user)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading roles...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-700 font-medium">No roles available</p>
              <p className="text-gray-500 text-sm mt-2">
                Create roles first in the Roles & Permissions section
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groups.map((g) => {
                  const active = userGroupSet.has(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGroup(g.id)}
                      disabled={saving}
                      className={`p-4 rounded-xl border text-left transition-all ${active
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:bg-gray-50'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{g.name}</div>
                        </div>
                        <div className={`h-4 w-4 rounded-full border ${active ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`} />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {active ? '✓ Currently assigned' : 'Click to assign'}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Changes are saved automatically when you click on roles.
                      Users can have multiple roles for flexible access control.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {userGroupIds.length} of {groups.length} roles assigned
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchGroupsAndUserGroups}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#6b3f23] text-white rounded-xl hover:bg-[#5a3620]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [tab, setTab] = useState("users");
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', role: 'all' });
  const [availableRoles, setAvailableRoles] = useState(["Admin", "User"]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  });

  const pieCanvasRef = useRef(null);
  const barCanvasRef = useRef(null);
  const lineCanvasRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);

  // Use the toast hook
  const { toast, showToast, hideToast } = useToast();

  const fetchUsers = async (query = "") => {
    setLoading(true);
    try {
      const url = `${API_BASE}/users/${
        query ? `?q=${encodeURIComponent(query)}` : ""
      }`;

      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          res.status === 401
            ? "Unauthorized (401). You are not sending a valid JWT token."
            : res.status === 403
            ? "Forbidden (403). You are authenticated but not an admin/staff user."
            : data?.error || "Failed to fetch users";
        throw new Error(msg);
      }

      setUsers(data.users || []);
      
      // Extract unique roles from users for filter dropdown
      const roles = new Set();
      (data.users || []).forEach(user => {
        if (user.roles && Array.isArray(user.roles)) {
          user.roles.forEach(role => roles.add(role));
        } else if (user.role) {
          roles.add(user.role);
        }
      });
      setAvailableRoles(Array.from(roles).sort());
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    fetchUsers(q);
  };

  const onAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to add user");

      setForm({ name: "", email: "", password: "", role: "User" });
      fetchUsers(q);
      showToast('User added successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  // REMOVED: onDeleteUser function

  const setActive = async (id, is_active) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}/update/`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ is_active }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      fetchUsers(q);
      showToast(
        `User ${is_active ? 'activated' : 'deactivated'} successfully!`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const analytics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active).length;
    const inactive = total - active;

    const roleCounts = users.reduce((acc, u) => {
      const rolesArr = Array.isArray(u?.roles) ? u.roles : null;

      if (rolesArr && rolesArr.length) {
        rolesArr.forEach((r) => {
          const name = (typeof r === "string" ? r : r?.name || r?.slug || "")
            .toString()
            .trim();
          if (!name) return;
          const label =
            name.toLowerCase() === "admin"
              ? "Admin"
              : name.toLowerCase() === "user"
              ? "User"
              : name;
          acc[label] = (acc[label] || 0) + 1;
        });
        return acc;
      }

      const r = safeRole(u);
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});

    const admins = roleCounts.Admin || 0;

    const byDay = users.reduce((acc, u) => {
      const raw = u?.date_joined || u?.created_at || u?.createdAt || "";
      const dt = raw ? new Date(raw) : null;
      if (!dt || Number.isNaN(dt.getTime())) return acc;
      const key = dt.toISOString().slice(0, 10);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const byDayEntries = Object.entries(byDay).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    const last7 = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      last7.push({ key, count: byDay[key] || 0 });
    }

    return {
      total,
      active,
      inactive,
      admins,
      roleCounts,
      activePct: total ? Math.round((active / total) * 100) : 0,
      inactivePct: total ? Math.round((inactive / total) * 100) : 0,
      byDayEntries,
      last7,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    let filtered = users.filter((u) => {
      const name = String(u?.name || "").toLowerCase();
      const email = String(u?.email || "").toLowerCase();
      const searchTerm = q.toLowerCase();
      return name.includes(searchTerm) || email.includes(searchTerm);
    });

    if (filters.status !== 'all') {
      filtered = filtered.filter(u => 
        filters.status === 'active' ? u.is_active : !u.is_active
      );
    }

    if (filters.role !== 'all') {
      filtered = filtered.filter(u => {
        if (u.roles && Array.isArray(u.roles)) {
          return u.roles.some(role => role === filters.role);
        }
        return safeRole(u).includes(filters.role);
      });
    }

    return filtered;
  }, [users, q, filters]);

  useEffect(() => {
    if (!showAnalytics) return;
    if (tab !== "users") return;

    if (pieCanvasRef.current) {
      if (pieChartRef.current) pieChartRef.current.destroy();

      const ctx = pieCanvasRef.current.getContext("2d");
      pieChartRef.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Active", "Inactive"],
          datasets: [{
            data: [analytics.active, analytics.inactive],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          plugins: { 
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const total = analytics.active + analytics.inactive;
                  const percentage = Math.round((context.parsed / total) * 100);
                  return `${context.label}: ${context.parsed} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '65%',
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }

    if (barCanvasRef.current) {
      if (barChartRef.current) barChartRef.current.destroy();

      const entries = Object.entries(analytics.roleCounts || {}).sort(
        (a, b) => b[1] - a[1]
      );
      const labels = entries.map(([k]) => k);
      const data = entries.map(([, v]) => v);

      const ctx = barCanvasRef.current.getContext("2d");
      barChartRef.current = new Chart(ctx, {
        type: "bar",
        data: { 
          labels, 
          datasets: [{ 
            label: "Users", 
            data,
            backgroundColor: '#6b3f23',
            borderRadius: 6
          }] 
        },
        options: {
          plugins: { legend: { display: false } },
          responsive: true,
          maintainAspectRatio: false,
          scales: { 
            y: { 
              beginAtZero: true, 
              ticks: { precision: 0 },
              grid: {
                color: 'rgba(0,0,0,0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
        },
      });
    }

    if (lineCanvasRef.current) {
      if (lineChartRef.current) lineChartRef.current.destroy();

      const labels = analytics.last7.map((x) => {
        const date = new Date(x.key);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
      const data = analytics.last7.map((x) => x.count);

      const ctx = lineCanvasRef.current.getContext("2d");
      lineChartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{ 
            label: "Registrations", 
            data, 
            tension: 0.3,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          }],
        },
        options: {
          plugins: { legend: { display: false } },
          responsive: true,
          maintainAspectRatio: false,
          scales: { 
            y: { 
              beginAtZero: true, 
              ticks: { precision: 0 },
              grid: {
                color: 'rgba(0,0,0,0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
        },
      });
    }

    return () => {
      if (pieChartRef.current) pieChartRef.current.destroy();
      if (barChartRef.current) barChartRef.current.destroy();
      if (lineChartRef.current) lineChartRef.current.destroy();
    };
  }, [analytics, showAnalytics, tab]);

  const createChartImage = async (chartConfig, w = 700, h = 380) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);

    const chart = new Chart(ctx, {
      ...chartConfig,
      options: {
        ...(chartConfig.options || {}),
        animation: false,
        responsive: false,
        maintainAspectRatio: false,
      },
    });

    const img = chart.toBase64Image("image/png", 1.0);
    chart.destroy();

    return img;
  };

  const exportUsersPDF = async () => {
    try {
      if (!users.length) {
        showToast("No users to export.", "warning");
        return;
      }

      setExporting(true);
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 36;

      const headerBarH = 56;

      const drawHeader = () => {
        doc.setFillColor(6, 78, 59);
        doc.rect(0, 0, pageW, headerBarH, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text("CocoConnect — Users Report", margin, 36);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(220, 252, 231);
        doc.text(`Generated: ${fmtDateTime(new Date())}`, pageW - margin, 36, {
          align: "right",
        });

        doc.setTextColor(0, 0, 0);
      };

      const drawFooter = (pageNum, totalPages) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Page ${pageNum} of ${totalPages}`,
          pageW - margin,
          pageH - 18,
          { align: "right" }
        );
        doc.setTextColor(0, 0, 0);
      };

      drawHeader();

      const y0 = headerBarH + 18;
      const cardH = 56;
      const gap = 10;
      const cardW = (pageW - margin * 2 - gap * 2) / 3;

      const card = (x, title, value, sub) => {
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(x, y0, cardW, cardH, 10, 10, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(title, x + 14, y0 + 20);

        doc.setFontSize(18);
        doc.text(String(value), x + 14, y0 + 42);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        if (sub) doc.text(sub, x + 14, y0 + 54);
      };

      card(margin, "Active Users", analytics.active, `${analytics.activePct}%`);
      card(
        margin + cardW + gap,
        "Inactive Users",
        analytics.inactive,
        `${analytics.inactivePct}%`
      );
      card(
        margin + (cardW + gap) * 2,
        "Admins",
        analytics.admins,
        `Total: ${analytics.total}`
      );

      const chartsY = y0 + cardH + 18;

      const pieImg = await createChartImage({
        type: "pie",
        data: {
          labels: ["Active", "Inactive"],
          datasets: [{ data: [analytics.active, analytics.inactive] }],
        },
        options: { plugins: { legend: { position: "bottom" } } },
      });

      const roleEntries = Object.entries(analytics.roleCounts || {}).sort(
        (a, b) => b[1] - a[1]
      );
      const roleLabels = roleEntries.map(([k]) => k);
      const roleData = roleEntries.map(([, v]) => v);

      const barImg = await createChartImage({
        type: "bar",
        data: { labels: roleLabels, datasets: [{ label: "Users", data: roleData }] },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });

      const lineImg = await createChartImage({
        type: "line",
        data: {
          labels: analytics.last7.map((x) => x.key.slice(5)),
          datasets: [
            {
              label: "Registrations",
              data: analytics.last7.map((x) => x.count),
              tension: 0.3,
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Analytics", margin, chartsY);

      const chartBoxY = chartsY + 10;
      const boxGap = 12;
      const boxW = (pageW - margin * 2 - boxGap * 2) / 3;
      const boxH = 170;

      const addChartBox = (x, title, img) => {
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, chartBoxY, boxW, boxH, 10, 10, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(title, x + 10, chartBoxY + 18);
        doc.addImage(img, "PNG", x + 10, chartBoxY + 26, boxW - 20, boxH - 36);
      };

      addChartBox(margin, "Active vs Inactive", pieImg);
      addChartBox(margin + boxW + boxGap, "Role Distribution", barImg);
      addChartBox(
        margin + (boxW + boxGap) * 2,
        "Registrations (7 days)",
        lineImg
      );

      const startTableY = chartBoxY + boxH + 18;

      const rows = users.map((u) => [
        u.name || "",
        u.email || "",
        statusLabel(u),
        safeRole(u),
      ]);

      autoTable(doc, {
        head: [["Name", "Email", "Status", "Role(s)"]],
        body: rows,
        startY: startTableY,
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [6, 78, 59] },
        alternateRowStyles: { fillColor: [249, 250, 247] },
        margin: { left: margin, right: margin, top: margin, bottom: 28 },
        didDrawPage: () => {
          drawHeader();
        },
      });

      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(i, totalPages);
      }

      doc.save("cococonnect-users-report.pdf");
      showToast("PDF exported successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const openManageRoles = (u) => {
    setSelectedUser(u);
    setIsRolesModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage users, roles, and permissions across your platform
          </p>
        </div>
        <button
          onClick={() => fetchUsers()}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={UsersIcon}
          label="Total Users" 
          value={analytics.total} 
          color="primary"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Active Users" 
          value={analytics.active} 
          color="success"
          trend={{ value: 12 }}
        />
        <StatCard 
          icon={XCircle} 
          label="Inactive Users" 
          value={analytics.inactive} 
          color="danger"
          trend={{ value: -5 }}
        />
        <StatCard 
          icon={Shield} 
          label="Administrators" 
          value={analytics.admins} 
          color="warning"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setTab("users")}
              className={`py-4 border-b-2 font-medium text-sm ${tab === "users"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                Users
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {users.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setTab("roles")}
              className={`py-4 border-b-2 font-medium text-sm ${tab === "roles"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Roles & Permissions
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {tab === "users" ? (
            <div className="space-y-6">
              {/* Search and Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <form onSubmit={onSearch} className="flex-1 max-w-xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search users by name or email..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                </form>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    {showAnalytics ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide Analytics
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show Analytics
                      </>
                    )}
                  </button>
                  <button
                    onClick={exportUsersPDF}
                    disabled={exporting}
                    className="flex items-center px-4 py-2 bg-[#6b3f23] text-white rounded-xl hover:bg-[#5a3620] disabled:opacity-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {exporting ? 'Exporting...' : 'Export PDF'}
                  </button>
                </div>
              </div>

              {/* Analytics Section */}
              {showAnalytics && (
                <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <PieChart className="h-5 w-5 mr-2 text-emerald-600" />
                        <h4 className="font-medium text-gray-900">Active vs Inactive</h4>
                      </div>
                      <div className="h-64">
                        <canvas ref={pieCanvasRef} />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                        <h4 className="font-medium text-gray-900">Role Distribution</h4>
                      </div>
                      <div className="h-64">
                        <canvas ref={barCanvasRef} />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                        <h4 className="font-medium text-gray-900">Weekly Registrations</h4>
                      </div>
                      <div className="h-64">
                        <canvas ref={lineCanvasRef} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters and Add User */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <FilterPanel filters={filters} setFilters={setFilters} availableRoles={availableRoles} />
                </div>
                
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Add New User</h4>
                    <form onSubmit={onAddUser} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            value={form.name}
                            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                            placeholder="John Doe"
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            value={form.email}
                            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                            placeholder="john@example.com"
                            type="email"
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                          </label>
                          <input
                            value={form.password}
                            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                            placeholder="••••••••"
                            type="password"
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default Role
                          </label>
                          <select
                            value={form.role}
                            onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
                          >
                            <option>User</option>
                            <option>Admin</option>
                            {availableRoles.filter(r => !['Admin', 'User'].includes(r)).map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
                      >
                        <UserPlus className="h-5 w-5 mr-2" />
                        Add New User
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Users ({filteredUsers.length} found)
                  </h3>
                  <div className="text-sm text-gray-500">
                    {loading ? 'Loading...' : `Showing ${filteredUsers.length} of ${users.length} users`}
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <UsersIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-700 font-medium">No users found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {q || Object.values(filters).some(v => v !== 'all') 
                        ? 'Try adjusting your search or filters' 
                        : 'Add your first user to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-4 pl-6 text-sm font-semibold text-gray-700">
                              User
                            </th>
                            <th className="text-left py-4 text-sm font-semibold text-gray-700">
                              Role(s)
                            </th>
                            <th className="text-left py-4 text-sm font-semibold text-gray-700">
                              Joined
                            </th>
                            <th className="text-left py-4 text-sm font-semibold text-gray-700">
                              Status
                            </th>
                            <th className="text-right py-4 pr-6 text-sm font-semibold text-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <UserTableRow
                              key={user.id}
                              user={user}
                              onManageRoles={openManageRoles}
                              onToggleActive={setActive}
                              showToast={showToast}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Roles Tab */
            <RolesManager onAnyRoleChange={() => fetchUsers(q)} showToast={showToast} />
          )}
        </div>
      </div>

      {/* User Roles Modal */}
      <UserRolesModal
        isOpen={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
        user={selectedUser}
        onChanged={() => fetchUsers(q)}
        showToast={showToast}
      />
    </div>
  );
}