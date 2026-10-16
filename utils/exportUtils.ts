import * as XLSX from 'xlsx';
import { DailyReportRecord } from '../types';

export const exportToExcel = (records: DailyReportRecord[], customFileName?: string) => {
  if (!records || records.length === 0) {
    alert('No records available to export.');
    return;
  }

  const exportData = records.map((rec, index) => ({
    'SL': index + 1,
    'Date': rec.displayDate || rec.date,
    'Time': rec.time,
    'Type': rec.reportType,
    'Total Vehicles': rec.vehicleCount,
    'Vehicle Numbers': rec.vehicles.join(', '),
    'Staff ID': rec.staffId,
    'Staff Name': rec.staffName,
    'Staff Phone': rec.staffPhone,
    'Recorded On': new Date(rec.createdAt).toLocaleString(),
    'Notes': rec.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // SL
    { wch: 14 }, // Date
    { wch: 10 }, // Time
    { wch: 12 }, // Type
    { wch: 15 }, // Total Vehicles
    { wch: 35 }, // Vehicle Numbers
    { wch: 16 }, // Staff ID
    { wch: 28 }, // Staff Name
    { wch: 18 }, // Staff Phone
    { wch: 22 }, // Recorded On
    { wch: 20 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Reports');

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = customFileName || `RFL_Khulna_Depot_Report_${todayStr}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

export const exportToCsv = (records: DailyReportRecord[], customFileName?: string) => {
  if (!records || records.length === 0) {
    alert('No records available to export.');
    return;
  }

  const headers = [
    'SL',
    'Date',
    'Time',
    'Type',
    'Total Vehicles',
    'Vehicle Numbers',
    'Staff ID',
    'Staff Name',
    'Staff Phone',
    'Recorded On',
    'Notes'
  ];

  const rows = records.map((rec, index) => [
    index + 1,
    `"${rec.displayDate || rec.date}"`,
    `"${rec.time}"`,
    `"${rec.reportType}"`,
    rec.vehicleCount,
    `"${rec.vehicles.join('; ')}"`,
    `"${rec.staffId}"`,
    `"${rec.staffName.replace(/"/g, '""')}"`,
    `"${rec.staffPhone}"`,
    `"${new Date(rec.createdAt).toLocaleString()}"`,
    `"${(rec.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', customFileName || `RFL_Khulna_Depot_Report_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
