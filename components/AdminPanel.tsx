import React, { useState, useMemo } from 'react';
import { DailyReportRecord, StaffMember, ReportType } from '../types';
import { exportToExcel, exportToCsv } from '../utils/exportUtils';

interface AdminPanelProps {
  onBackToApp: () => void;
  onLogout: () => void;
  records: DailyReportRecord[];
  onAddRecord: (record: DailyReportRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAllRecords: () => void;
  staffList: StaffMember[];
  onAddStaff: (staff: StaffMember) => void;
  onUpdateStaff: (staff: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
  onResetStaff: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToApp,
  onLogout,
  records,
  onAddRecord,
  onDeleteRecord,
  onClearAllRecords,
  staffList,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onResetStaff,
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'users'>('records');

  // Filter states for records
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | ReportType>('All');
  const [filterDate, setFilterDate] = useState('');

  // Selected record for full view
  const [viewingRecord, setViewingRecord] = useState<DailyReportRecord | null>(null);

  // New staff entry form state
  const [newStaffId, setNewStaffId] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffTitle, setNewStaffTitle] = useState('Shipping Assistant');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [staffFeedback, setStaffFeedback] = useState<string | null>(null);

  // Editing staff state
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Manual record modal state
  const [isManualRecordOpen, setIsManualRecordOpen] = useState(false);
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualType, setManualType] = useState<ReportType>(ReportType.Load);
  const [manualVehicles, setManualVehicles] = useState('');
  const [manualStaffId, setManualStaffId] = useState(staffList[0]?.id || '');
  const [manualNotes, setManualNotes] = useState('');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchType = filterType === 'All' || rec.reportType === filterType;
      const matchDate = !filterDate || rec.date === filterDate;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        rec.vehicles.some((v) => v.toLowerCase().includes(q)) ||
        rec.staffName.toLowerCase().includes(q) ||
        rec.staffId.toLowerCase().includes(q) ||
        (rec.notes && rec.notes.toLowerCase().includes(q));

      return matchType && matchDate && matchQuery;
    });
  }, [records, filterType, filterDate, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalRecords = records.length;
    const todayRecords = records.filter((r) => r.date === todayStr).length;
    const totalVehicles = records.reduce((sum, r) => sum + r.vehicleCount, 0);
    const loadCount = records.filter((r) => r.reportType === ReportType.Load).length;
    const unloadCount = records.filter((r) => r.reportType === ReportType.Unload).length;
    return { totalRecords, todayRecords, totalVehicles, loadCount, unloadCount };
  }, [records]);

  // Handle staff addition
  const handleAddNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffId.trim() || !newStaffName.trim() || !newStaffPhone.trim()) {
      setStaffFeedback('Please fill in all required fields.');
      return;
    }

    if (staffList.some((s) => s.id.toLowerCase() === newStaffId.trim().toLowerCase())) {
      setStaffFeedback('This Staff ID already exists in the system.');
      return;
    }

    const newMember: StaffMember = {
      id: newStaffId.trim(),
      name: newStaffName.trim(),
      title: newStaffTitle.trim() || 'Shipping Assistant',
      phone: newStaffPhone.trim(),
    };

    onAddStaff(newMember);
    setNewStaffId('');
    setNewStaffName('');
    setNewStaffPhone('');
    setStaffFeedback(null);
    showToast(`Staff member "${newMember.name}" added successfully!`);
  };

  // Handle staff update
  const handleSaveStaffEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    onUpdateStaff(editingStaff);
    showToast(`Staff member "${editingStaff.name}" updated successfully!`);
    setEditingStaff(null);
  };

  // Handle manual record submission
  const handleCreateManualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const vList = manualVehicles
      .split(/[\n,]+/)
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (vList.length === 0) {
      alert('Please enter at least one vehicle number.');
      return;
    }

    const matchedStaff = staffList.find((s) => s.id === manualStaffId) || staffList[0];
    const [year, month, day] = manualDate.split('-');
    const displayDate = `${day}/${month}/${year}`;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const recordText = `*RFL DISTRIBUTION*
KHULNA DEPOT - 16531
Damudor, Phultala, Khulna
-------------------------
*Vehicle ${manualType} Report*
*Date:* ${displayDate}

*Vehicles (${vList.length} total):*
${vList.map((v, i) => `${i + 1}) ${v}`).join('\n')}

*Total:* ${vList.length} No's Vehicles ${manualType}
-------------------------
*Staff Details:*
*Staff ID:* ${matchedStaff.id}
*Name:* ${matchedStaff.name} | ${matchedStaff.title}
*Phone:* ${matchedStaff.phone}
`;

    const newRec: DailyReportRecord = {
      id: `rec_${Date.now()}`,
      date: manualDate,
      displayDate,
      time: timeStr,
      reportType: manualType,
      vehicles: vList,
      vehicleCount: vList.length,
      staffId: matchedStaff.id,
      staffName: `${matchedStaff.name} | ${matchedStaff.title}`,
      staffPhone: matchedStaff.phone,
      reportText: recordText,
      createdAt: Date.now(),
      notes: manualNotes.trim() || undefined,
    };

    onAddRecord(newRec);
    setIsManualRecordOpen(false);
    setManualVehicles('');
    setManualNotes('');
    showToast('Report record successfully added to database!');
  };

  const handleCopyRecord = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Report text copied to clipboard!');
    } catch {
      alert('Failed to copy text.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-2 sm:p-4 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg border border-indigo-400 flex items-center gap-2 text-sm animate-bounce">
          <i className="fa-solid fa-circle-check"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-4">
        {/* Top Header */}
        <header className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/40 rounded-xl flex items-center justify-center text-indigo-400">
              <i className="fa-solid fa-user-shield text-2xl"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">Admin Management Portal</h1>
                <span className="px-2.5 py-0.5 bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                  Verified Administrator
                </span>
              </div>
              <p className="text-xs text-gray-400">
                RFL Distribution • Khulna Depot - 16531 (Damudor, Phultala)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToApp}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <i className="fa-solid fa-truck-ramp-box"></i>
              <span>Report Form</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3.5 py-2 bg-red-900/30 hover:bg-red-800/50 text-red-300 border border-red-700/50 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-900 border border-gray-800 p-3.5 rounded-2xl">
            <div className="text-[11px] text-gray-400 font-medium">Total Reports</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalRecords}</div>
            <div className="text-[10px] text-indigo-400 mt-0.5">Today: {stats.todayRecords}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-3.5 rounded-2xl">
            <div className="text-[11px] text-gray-400 font-medium">Total Vehicles</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{stats.totalVehicles}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Across all reports</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-3.5 rounded-2xl">
            <div className="text-[11px] text-gray-400 font-medium">Load Reports</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.loadCount}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Total Load operations</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-3.5 rounded-2xl">
            <div className="text-[11px] text-gray-400 font-medium">Unload Reports</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{stats.unloadCount}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Total Unload operations</div>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="flex border-b border-gray-800 bg-gray-900/60 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'records'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-file-excel text-emerald-400"></i>
            <span>Daily Records & Excel Export</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-users-gear text-indigo-300"></i>
            <span>Staff Management ({staffList.length})</span>
          </button>
        </div>

        {/* TAB 1: DAILY RECORDS & EXCEL */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            {/* Export & Action Bar */}
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => exportToExcel(filteredRecords)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-700/30 flex items-center gap-2 transition-all active:scale-[0.98]"
                  title="Download Microsoft Excel File"
                >
                  <i className="fa-solid fa-file-excel text-base"></i>
                  <span>Download Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => exportToCsv(filteredRecords)}
                  className="px-3.5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all"
                  title="Download CSV file"
                >
                  <i className="fa-solid fa-file-csv text-blue-400 text-base"></i>
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => setIsManualRecordOpen(true)}
                  className="px-3.5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all"
                >
                  <i className="fa-solid fa-plus-circle"></i>
                  <span>Add Manual Entry</span>
                </button>
              </div>

              {records.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all daily records? This action cannot be undone.')) {
                      onClearAllRecords();
                      showToast('All daily records have been cleared.');
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-800/50 hover:bg-red-950/40 transition-colors"
                >
                  <i className="fa-solid fa-trash-can mr-1"></i>
                  Clear All Data
                </button>
              )}
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-gray-900 border border-gray-800 p-3.5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Search Vehicle / Staff:
                </label>
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-xs text-gray-500"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Vehicle No, Staff Name, ID..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-white"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Filter by Specific Date:
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {filterDate && (
                    <button
                      onClick={() => setFilterDate('')}
                      className="absolute right-2.5 text-xs text-gray-400 hover:text-white"
                      title="Clear date"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Report Type:
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Operations (Load & Unload)</option>
                  <option value={ReportType.Load}>Load Only</option>
                  <option value={ReportType.Unload}>Unload Only</option>
                </select>
              </div>
            </div>

            {/* Records List / Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-3.5 bg-gray-850 border-b border-gray-800 flex items-center justify-between text-xs text-gray-300">
                <span className="font-semibold">
                  Displayed Records: {filteredRecords.length}
                </span>
                {(filterDate || filterType !== 'All' || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilterDate('');
                      setFilterType('All');
                      setSearchQuery('');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                  >
                    <i className="fa-solid fa-rotate-left"></i>
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>

              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-2">
                  <i className="fa-solid fa-clipboard-question text-3xl text-gray-600"></i>
                  <p className="text-sm font-semibold">No records found.</p>
                  <p className="text-xs text-gray-500">
                    Use "Save", "View", or "Share" on the main report page, or click "Add Manual Entry" above.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-200">
                    <thead className="bg-gray-800/80 text-gray-400 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-700">
                      <tr>
                        <th className="py-3 px-3">SL</th>
                        <th className="py-3 px-3">Date & Time</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3">Vehicles</th>
                        <th className="py-3 px-3">Vehicle Numbers</th>
                        <th className="py-3 px-3">Staff Details</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredRecords.map((rec, index) => (
                        <tr key={rec.id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="py-3 px-3 text-gray-400 font-mono">{index + 1}</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="font-semibold text-white">{rec.displayDate}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{rec.time}</div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                rec.reportType === ReportType.Load
                                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {rec.reportType}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap font-bold text-indigo-400">
                            {rec.vehicleCount} No's
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {rec.vehicles.map((v, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[11px] font-mono text-gray-200"
                                >
                                  {v}
                                </span>
                              ))}
                            </div>
                            {rec.notes && (
                              <p className="text-[10px] text-gray-400 italic mt-1 truncate">
                                Note: {rec.notes}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="font-medium text-white">{rec.staffName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              ID: {rec.staffId} • {rec.staffPhone}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                            <button
                              onClick={() => setViewingRecord(rec)}
                              className="px-2 py-1 bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 rounded border border-blue-700/50 text-[11px] transition-colors"
                              title="View formatted report"
                            >
                              <i className="fa-solid fa-eye mr-1"></i>
                              View
                            </button>
                            <button
                              onClick={() => handleCopyRecord(rec.reportText)}
                              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 text-[11px] transition-colors"
                              title="Copy text"
                            >
                              <i className="fa-solid fa-copy"></i>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this record?')) {
                                  onDeleteRecord(rec.id);
                                  showToast('Record deleted successfully.');
                                }
                              }}
                              className="px-2 py-1 bg-red-900/30 hover:bg-red-800/50 text-red-400 rounded border border-red-700/50 text-[11px] transition-colors"
                              title="Delete record"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USER ENTRY & STAFF MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Add New User Form */}
            <div className="lg:col-span-1 bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                <i className="fa-solid fa-user-plus text-indigo-400"></i>
                <h3 className="text-sm font-bold text-white">Add New Staff Member</h3>
              </div>

              {staffFeedback && (
                <div className="p-2.5 bg-amber-900/40 border border-amber-500/60 rounded-xl text-amber-200 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{staffFeedback}</span>
                </div>
              )}

              <form onSubmit={handleAddNewStaff} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Staff ID *
                  </label>
                  <input
                    type="text"
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    placeholder="e.g. S262591 or 257004"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Staff Full Name *
                  </label>
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Raju Bhattacharya"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Title / Designation
                  </label>
                  <input
                    type="text"
                    value={newStaffTitle}
                    onChange={(e) => setNewStaffTitle(e.target.value)}
                    placeholder="e.g. Shipping Assistant / Jex (Shipping)"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    placeholder="e.g. 01765984182"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98]"
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Save Staff Member</span>
                </button>
              </form>

              <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-[11px] text-gray-400">
                <span>Restore initial staff list:</span>
                <button
                  onClick={() => {
                    if (window.confirm('Restore predefined default staff list?')) {
                      onResetStaff();
                      showToast('Default staff list restored.');
                    }
                  }}
                  className="text-amber-400 hover:underline"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* Right: Existing Staff List Table */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-users text-indigo-400"></i>
                  <h3 className="text-sm font-bold text-white">
                    Active Staff Directory
                  </h3>
                </div>
                <span className="text-xs bg-indigo-900/60 text-indigo-300 px-2.5 py-1 rounded-full font-semibold border border-indigo-500/40">
                  {staffList.length} Members
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-200">
                  <thead className="bg-gray-800/80 text-gray-400 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-700">
                    <tr>
                      <th className="py-2.5 px-3">Staff ID</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {staffList.map((staff) => (
                      <tr key={staff.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-300">
                          {staff.id}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-white">{staff.name}</td>
                        <td className="py-2.5 px-3 text-gray-400">{staff.title}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-300">{staff.phone}</td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => setEditingStaff(staff)}
                            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-indigo-300 rounded border border-gray-700 text-[11px]"
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => {
                              if (staffList.length <= 1) {
                                alert('At least one staff member must remain in the directory.');
                                return;
                              }
                              if (window.confirm(`Are you sure you want to remove "${staff.name}"?`)) {
                                onDeleteStaff(staff.id);
                                showToast(`Staff member "${staff.name}" removed.`);
                              }
                            }}
                            className="px-2 py-1 bg-red-900/30 hover:bg-red-800/50 text-red-400 rounded border border-red-700/50 text-[11px]"
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/60 text-[11px] text-gray-400 flex items-center gap-2">
                <i className="fa-solid fa-info-circle text-indigo-400"></i>
                <span>
                  Any staff member added or modified here will immediately appear in the main report form dropdown.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: View Full Report */}
      {viewingRecord && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5 w-full max-w-md max-h-[85vh] flex flex-col text-gray-100">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="font-bold text-base text-white">Full Report Details</h3>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto bg-gray-950 p-3.5 rounded-xl border border-gray-800 mb-3">
              <pre className="text-gray-200 text-xs whitespace-pre-wrap font-mono leading-relaxed">
                {viewingRecord.reportText}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCopyRecord(viewingRecord.reportText)}
                className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <i className="fa-solid fa-copy"></i>
                <span>Copy Report</span>
              </button>
              <button
                onClick={() => setViewingRecord(null)}
                className="py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Staff */}
      {editingStaff && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5 w-full max-w-sm text-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-white">Edit Staff Details</h3>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSaveStaffEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Staff ID
                </label>
                <input
                  type="text"
                  value={editingStaff.id}
                  disabled
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-400 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Staff Full Name
                </label>
                <input
                  type="text"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Title / Designation
                </label>
                <input
                  type="text"
                  value={editingStaff.title}
                  onChange={(e) => setEditingStaff({ ...editingStaff, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editingStaff.phone}
                  onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manual Add Record */}
      {isManualRecordOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5 w-full max-w-md text-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-white">Add Daily Report Record</h3>
              <button
                onClick={() => setIsManualRecordOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateManualRecord} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Report Date
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Report Type
                </label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as ReportType)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={ReportType.Load}>Load</option>
                  <option value={ReportType.Unload}>Unload</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Vehicle Numbers (comma or newline separated) *
                </label>
                <textarea
                  value={manualVehicles}
                  onChange={(e) => setManualVehicles(e.target.value)}
                  placeholder="e.g. 6115, 3925, 6128, 3167"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Select Staff Member
                </label>
                <select
                  value={manualStaffId}
                  onChange={(e) => setManualStaffId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} - {s.name} ({s.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Notes / Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g. Evening depot batch"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Save Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualRecordOpen(false)}
                  className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
