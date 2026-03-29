import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { rolePermissionService } from '../../services/rolePermissionService/rolePermissionService';
import { userPermissionService } from '../../services/rolePermissionService/userPermissionService';

const ROLES = [
  { id: 'teacher',    label: 'Teacher',    icon: '🎓' },
  { id: 'student',    label: 'Student',    icon: '📚' },
  { id: 'accountant', label: 'Accountant', icon: '💼' },
];

// ─── Permission State ─────────────────────────────────────────────────────────
function computeState(permId, userAllowed, userDenied, userDefault) {
  if (userAllowed.has(permId))  return 'allowed';
  if (userDenied.has(permId))   return 'denied';
  if (userDefault.has(permId))  return 'default';
  return 'default'; // unset = default
}

// ─── Pill Toggle ──────────────────────────────────────────────────────────────
function PillToggle({ state, onChange }) {
  return (
    <div
      className="flex items-center rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      {[
        { val: 'allowed', label: 'Allowed', active: 'bg-green-500 text-white',   hover: 'hover:text-green-600 hover:bg-green-50'  },
        { val: 'denied',  label: 'Denied',  active: 'bg-red-500 text-white',     hover: 'hover:text-red-600 hover:bg-red-50'      },
        { val: 'default', label: 'Default', active: 'bg-gray-200 text-gray-700', hover: 'hover:text-gray-600 hover:bg-gray-100'   },
      ].map(({ val, label, active, hover }, i, arr) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={`px-3 py-1.5 text-xs font-semibold transition-all duration-150
            ${i < arr.length - 1 ? 'border-r border-gray-200' : ''}
            ${state === val ? active : `text-gray-400 ${hover}`}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Permission Row ───────────────────────────────────────────────────────────
function PermRow({ perm, state, onStateChange }) {
  const permId    = String(perm.permission_id);
  const hasChange = state === 'allowed' || state === 'denied';
  const label     = perm.key || perm.name || perm.label || permId;
  const desc      = perm.description || perm.desc || '';

  return (
    <div className={`flex items-center justify-between px-5 py-3.5 gap-4 transition-colors duration-100
      ${state === 'allowed' ? 'bg-green-50/40' : state === 'denied' ? 'bg-red-50/40' : 'bg-white'}
      hover:bg-gray-50/70`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5
          ${state === 'allowed' ? 'bg-green-500' : state === 'denied' ? 'bg-red-500' : 'bg-gray-300'}`}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800 leading-snug">{label}</p>
            {hasChange && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" title="Modified" />}
          </div>
          {desc && <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>}
        </div>
      </div>
      <PillToggle state={state} onChange={(s) => onStateChange(permId, s)} />
    </div>
  );
}

// ─── Module Card ──────────────────────────────────────────────────────────────
function ModuleCard({ module, userAllowed, userDenied, userDefault, onStateChange, collapsed, onToggle }) {
  const perms = module.permissions || [];

  const overrideCount = perms.filter((p) => {
    const id = String(p.permission_id);
    return userAllowed.has(id) || userDenied.has(id);
  }).length;

  const allAllowed = perms.length > 0 && perms.every((p) =>
    computeState(String(p.permission_id), userAllowed, userDenied, userDefault) === 'allowed'
  );

  const handleSelectAll = (e) => {
    e.stopPropagation();
    perms.forEach((p) =>
      onStateChange(String(p.permission_id), allAllowed ? 'default' : 'allowed')
    );
  };

  const sectionLabel = module.label || module.id || '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-gray-900 capitalize">
            {sectionLabel.replace(/_/g, ' ')}
          </h3>
          <span className="text-xs text-gray-400 font-normal">({perms.length})</span>
          {overrideCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {overrideCount} override{overrideCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={allAllowed}
              onChange={handleSelectAll}
              className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-medium">Select All</span>
          </label>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {!collapsed && (
        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {perms.length === 0
            ? <p className="px-5 py-4 text-xs text-gray-400">No permissions in this module.</p>
            : perms.map((perm) => (
                <PermRow
                  key={perm.permission_id}
                  perm={perm}
                  state={computeState(String(perm.permission_id), userAllowed, userDenied, userDefault)}
                  onStateChange={onStateChange}
                />
              ))
          }
        </div>
      )}
    </div>
  );
}

// ─── Summary Sidebar ──────────────────────────────────────────────────────────
function SummaryPanel({ modules, userAllowed, userDenied, userDefault, selectedUser, hasChanges, onSave, onReset, saving, lastSaved }) {
  const allPerms = modules.flatMap((m) => m.permissions || []);
  const total    = allPerms.length;
  const allowed  = allPerms.filter((p) => computeState(String(p.permission_id), userAllowed, userDenied, userDefault) === 'allowed').length;
  const denied   = allPerms.filter((p) => computeState(String(p.permission_id), userAllowed, userDenied, userDefault) === 'denied').length;
  const def      = total - allowed - denied;
  const unsaved  = userAllowed.size + userDenied.size + userDefault.size;

  const Bar = ({ color, pct }) => (
    <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
      <div className={`h-full ${color} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Permissions Summary</h3>

        {[
          { label: 'Total',          count: total,   color: 'bg-blue-500',  pct: 100 },
          { label: 'Allowed',        count: allowed, color: 'bg-green-500', pct: total ? (allowed / total) * 100 : 0 },
          { label: 'Denied',         count: denied,  color: 'bg-red-500',   pct: total ? (denied  / total) * 100 : 0 },
          { label: 'Default (Role)', count: def,     color: 'bg-gray-300',  pct: total ? (def     / total) * 100 : 0 },
        ].map(({ label, count, color, pct }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className={`w-2.5 h-2.5 rounded-full ${color} inline-block`} />
                {label}
              </div>
              <span className="text-sm font-bold text-gray-900">{count}</span>
            </div>
            <Bar color={color} pct={pct} />
          </div>
        ))}

        <button
          onClick={onReset}
          disabled={!selectedUser}
          className="w-full py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600
            hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-2 mt-2"
        >
          Reset to Role Default
        </button>

        <button
          onClick={onSave}
          disabled={saving || !selectedUser || !hasChanges}
          className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold
            hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving…
            </>
          ) : 'Save Changes'}
        </button>

        {lastSaved && (
          <p className="text-[10px] text-gray-400 text-center mt-2">Last saved {lastSaved}</p>
        )}
      </div>

      {hasChanges && selectedUser && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-700 font-medium leading-snug">
            Unsaved changes to <span className="font-bold">permissions</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserPermissions() {
  const navigate = useNavigate();

  const [selectedRole,   setSelectedRole]   = useState(ROLES[0].id);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users,          setUsers]          = useState([]);
  const [loadingUsers,   setLoadingUsers]   = useState(false);
  const [modules,        setModules]        = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);

  // ✅ Three separate sets for each state
  const [userAllowed,  setUserAllowed]  = useState(new Set());
  const [userDenied,   setUserDenied]   = useState(new Set());
  const [userDefault,  setUserDefault]  = useState(new Set());
  const [origAllowed,  setOrigAllowed]  = useState(new Set());
  const [origDenied,   setOrigDenied]   = useState(new Set());
  const [origDefault,  setOrigDefault]  = useState(new Set());

  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [lastSaved,  setLastSaved]  = useState(null);
  const [collapsed,  setCollapsed]  = useState({});

  const selectedUser = users.find((u) => u.id === selectedUserId) || null;

  // ── Load all modules once ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoadingModules(true);
        const res       = await rolePermissionService.getAllPermissions();
        const obj       = res?.data || {};
        const formatted = Object.entries(obj).map(([key, perms]) => ({
          id:          key,
          label:       key,
          permissions: Array.isArray(perms) ? perms : [],
        }));
        setModules(formatted);
      } catch {
        setError('Failed to load permission modules.');
      } finally {
        setLoadingModules(false);
      }
    })();
  }, []);

  // ── Load users when role changes ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingUsers(true);
      setError(null);
      setSelectedUserId('');
      setUsers([]);
      setUserAllowed(new Set());
      setUserDenied(new Set());
      setUserDefault(new Set());
      setOrigAllowed(new Set());
      setOrigDenied(new Set());
      setOrigDefault(new Set());
      try {
        const res    = await userPermissionService.getUsersByRole(selectedRole);
        const mapped = (res?.data || []).map((u) => ({
          id:   String(u.user_id),
          name: u.name,
        }));
        setUsers(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, [selectedRole]);

  // ── fetchAll: load saved state for selected user ──────────────────────────
  const fetchAll = useCallback(async (userId, roleId) => {
    setLoading(true);
    setError(null);
    try {
      const [, userData] = await Promise.all([
        rolePermissionService.getRolePermissions(roleId),
        userPermissionService.getUserPermissions(userId),
      ]);

      console.log('🔍 userData:', JSON.stringify(userData, null, 2));

      // ✅ API returns allowedPermissionIds / deniedPermissionIds at root level
      // based on userPermissionService comment shape
      const rawAllowed = (
        userData?.allowedPermissionIds ||
        userData?.data?.allowedPermissionIds ||
        []
      ).map(String);

      const rawDenied = (
        userData?.deniedPermissionIds ||
        userData?.data?.deniedPermissionIds ||
        []
      ).map(String);

      // ✅ Also handle nested { data: { permissions: { module: [{id, state}] } } } shape
      const permissionsObj = userData?.data?.permissions || null;
      if (permissionsObj && typeof permissionsObj === 'object') {
        Object.values(permissionsObj).forEach((modulePerms) => {
          if (!Array.isArray(modulePerms)) return;
          modulePerms.forEach((perm) => {
            const id = String(perm.permission_id);
            if (perm.state === 'allowed' && !rawAllowed.includes(id)) rawAllowed.push(id);
            else if (perm.state === 'denied' && !rawDenied.includes(id)) rawDenied.push(id);
          });
        });
      }

      console.log('✅ rawAllowed:', rawAllowed);
      console.log('✅ rawDenied:', rawDenied);

      const a = new Set(rawAllowed);
      const d = new Set(rawDenied);

      setUserAllowed(a);
      setUserDenied(d);
      setUserDefault(new Set()); // default = neither allowed nor denied
      setOrigAllowed(new Set(a));
      setOrigDenied(new Set(d));
      setOrigDefault(new Set());

      const savedAt = userData?.data?.lastSaved ?? userData?.lastSaved ?? null;
      if (savedAt) setLastSaved(savedAt);

    } catch (err) {
      console.error('fetchAll error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) fetchAll(selectedUserId, selectedRole);
  }, [selectedUserId, selectedRole, fetchAll]);

  // ── Handle toggle ─────────────────────────────────────────────────────────
  const handleStateChange = (permId, newState) => {
    const id = String(permId);

    setUserAllowed((prev) => {
      const next = new Set(prev);
      newState === 'allowed' ? next.add(id) : next.delete(id);
      return next;
    });
    setUserDenied((prev) => {
      const next = new Set(prev);
      newState === 'denied' ? next.add(id) : next.delete(id);
      return next;
    });
    setUserDefault((prev) => {
      const next = new Set(prev);
      newState === 'default' ? next.add(id) : next.delete(id);
      return next;
    });
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setError(null);
    try {
      await userPermissionService.saveUserPermissions({
        userId:               selectedUserId,
        allowedPermissionIds: [...userAllowed],
        deniedPermissionIds:  [...userDenied],
        defaultPermissionIds: [...userDefault], // ✅ send default too
      });
      setOrigAllowed(new Set(userAllowed));
      setOrigDenied(new Set(userDenied));
      setOrigDefault(new Set(userDefault));
      setLastSaved(new Date().toLocaleString());
      setSuccessMsg('Permissions saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset = clear all overrides
  const handleReset = () => {
    setUserAllowed(new Set());
    setUserDenied(new Set());
    setUserDefault(new Set());
  };

  const hasChanges = (() => {
    if (userAllowed.size !== origAllowed.size) return true;
    if (userDenied.size  !== origDenied.size)  return true;
    if (userDefault.size !== origDefault.size)  return true;
    for (const id of userAllowed) if (!origAllowed.has(id)) return true;
    for (const id of userDenied)  if (!origDenied.has(id))  return true;
    for (const id of userDefault) if (!origDefault.has(id)) return true;
    return false;
  })();

  const toggleModule = (id) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/70" style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}>

      {/* Sticky Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600 transition-colors">Admin</button>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <button onClick={() => navigate('/admin/settings/role-permissions')} className="text-gray-400 hover:text-gray-600 transition-colors">Permissions</button>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-semibold">User Permissions</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => selectedUserId && fetchAll(selectedUserId, selectedRole)}
            disabled={!selectedUserId || saving}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600
              hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedUserId || !hasChanges}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold
              hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Page Title */}
      <div className="px-6 pt-6 pb-2 max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">User Permissions</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage individual user permission overrides on top of their role</p>
      </div>

      {/* Alerts */}
      <div className="px-6 max-w-[1200px] mx-auto">
        {error && (
          <div className="mb-4 mt-2 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 mt-2 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMsg}
          </div>
        )}
      </div>

      {/* Role + User Selector */}
      <div className="px-6 pb-5 max-w-[1200px] mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5">
          <div className="flex items-end gap-6 flex-wrap">

            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select Role</label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5
                    text-sm text-gray-800 font-medium cursor-pointer focus:outline-none
                    focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>{r.icon} {r.label}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select User</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">
                  {selectedUser ? selectedUser.name.charAt(0).toUpperCase() : '?'}
                </span>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={loadingUsers}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-10 pr-9 py-2.5
                    text-sm text-gray-800 font-medium cursor-pointer focus:outline-none
                    focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingUsers
                    ? <option value="">Loading users…</option>
                    : <>
                        <option value="">— Select a user —</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </>
                  }
                </select>
                {loadingUsers
                  ? <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin pointer-events-none" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  : <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                }
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-16 max-w-[1200px] mx-auto">
        <div className="flex gap-5 items-start">

          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {loadingModules && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <svg className="animate-spin w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm">Loading modules…</span>
              </div>
            )}

            {!loadingModules && !selectedUserId && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">👤</div>
                <p className="text-sm font-medium">Select a role and user to manage permissions</p>
                {modules.length > 0 && (
                  <p className="text-xs text-gray-300">{modules.length} modules ready to configure</p>
                )}
              </div>
            )}

            {!loadingModules && selectedUserId && loading && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <svg className="animate-spin w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm">Loading permissions…</span>
              </div>
            )}

            {!loadingModules && selectedUserId && !loading && modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                userAllowed={userAllowed}
                userDenied={userDenied}
                userDefault={userDefault}
                onStateChange={handleStateChange}
                collapsed={!!collapsed[module.id]}
                onToggle={() => toggleModule(module.id)}
              />
            ))}
          </div>

          <div className="w-72 shrink-0 sticky top-[65px]">
            <SummaryPanel
              modules={modules}
              userAllowed={userAllowed}
              userDenied={userDenied}
              userDefault={userDefault}
              selectedUser={selectedUser}
              hasChanges={hasChanges}
              onSave={handleSave}
              onReset={handleReset}
              saving={saving}
              lastSaved={lastSaved}
            />
          </div>

        </div>
      </div>

    </div>
  );
}
