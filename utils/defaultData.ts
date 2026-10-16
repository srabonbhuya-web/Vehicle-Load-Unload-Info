import { StaffMember, DailyReportRecord, ReportType } from '../types';

export const DEFAULT_STAFF_LIST: StaffMember[] = [
  { id: 'R000249325', name: 'Md. Toriqul Islam', title: 'Jex (Shipping)', phone: '01898775691' },
  { id: 'R000221173', name: 'Md. Sajib Hossain', title: 'Jex (Shipping)', phone: '01898775688' },
  { id: 'R000226740', name: 'F. M Asad', title: 'Shipping Assistant', phone: '01898775689' },
  { id: 'R000248716', name: 'Morol Tarikul Islam', title: 'Shipping Assistant', phone: '01898775690' },
  { id: 'S262591', name: 'Ripon Datta', title: 'Shipping Assistant', phone: '01844665855' },
  { id: '257004', name: 'Raju Bhattacharya', title: 'Shipping Assistant', phone: '01765984182' },
  { id: 'R000217176', name: 'Tarek', title: 'Shipping Assistant', phone: '01898775687' },
  { id: '190190', name: 'Md. Shourab Hossain', title: 'Jex (Store)', phone: '01898775926' },
  { id: 'S178390', name: 'Kamolesh Pal', title: 'Shipping Assistant', phone: '01844200189' },
];

export const INITIAL_SAMPLE_RECORDS: DailyReportRecord[] = [
  {
    id: 'rec_17290001',
    date: '2026-10-15',
    displayDate: '15/10/2026',
    time: '18:30:00',
    reportType: ReportType.Unload,
    vehicles: ['6115', '3925', '6128', '3167'],
    vehicleCount: 4,
    staffId: 'S262591',
    staffName: 'Ripon Datta | Shipping Assistant',
    staffPhone: '01844665855',
    reportText: `*RFL DISTRIBUTION*
KHULNA DEPOT - 16531
Damudor, Phultala, Khulna
-------------------------
*Vehicle Unload Report*
*Date:* 15/10/2026

*Vehicles (4 total):*
1) 6115
2) 3925
3) 6128
4) 3167

*Total:* 4 No's Vehicles Unload
-------------------------
*Staff Details:*
*Staff ID:* S262591
*Name:* Ripon Datta | Shipping Assistant
*Phone:* 01844665855
`,
    createdAt: Date.now() - 3600000 * 2,
    notes: 'Regular evening unload'
  },
  {
    id: 'rec_17290002',
    date: '2026-10-15',
    displayDate: '15/10/2026',
    time: '14:15:00',
    reportType: ReportType.Load,
    vehicles: ['5042', '4120', '8891'],
    vehicleCount: 3,
    staffId: '257004',
    staffName: 'Raju Bhattacharya | Shipping Assistant',
    staffPhone: '01765984182',
    reportText: `*RFL DISTRIBUTION*
KHULNA DEPOT - 16531
Damudor, Phultala, Khulna
-------------------------
*Vehicle Load Report*
*Date:* 15/10/2026

*Vehicles (3 total):*
1) 5042
2) 4120
3) 8891

*Total:* 3 No's Vehicles Load
-------------------------
*Staff Details:*
*Staff ID:* 257004
*Name:* Raju Bhattacharya | Shipping Assistant
*Phone:* 01765984182
`,
    createdAt: Date.now() - 3600000 * 6,
    notes: 'Midday dispatch load'
  },
  {
    id: 'rec_17290003',
    date: '2026-10-14',
    displayDate: '14/10/2026',
    time: '19:45:00',
    reportType: ReportType.Unload,
    vehicles: ['6115', '3925', '7144', '2019', '9402'],
    vehicleCount: 5,
    staffId: 'R000249325',
    staffName: 'Md. Toriqul Islam | Jex (Shipping)',
    staffPhone: '01898775691',
    reportText: `*RFL DISTRIBUTION*
KHULNA DEPOT - 16531
Damudor, Phultala, Khulna
-------------------------
*Vehicle Unload Report*
*Date:* 14/10/2026

*Vehicles (5 total):*
1) 6115
2) 3925
3) 7144
4) 2019
5) 9402

*Total:* 5 No's Vehicles Unload
-------------------------
*Staff Details:*
*Staff ID:* R000249325
*Name:* Md. Toriqul Islam | Jex (Shipping)
*Phone:* 01898775691
`,
    createdAt: Date.now() - 86400000,
    notes: 'Depot arrival batch'
  }
];
