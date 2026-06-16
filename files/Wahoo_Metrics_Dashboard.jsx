import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';

// Sample Data - 30-day realistic Wahoo metrics
const SAMPLE_DATA = {
  user: {
    id: "user_wahoo_123",
    name: "Sample Athlete",
    device_id: "wahoo_strap_456",
    sync_timestamp: "2024-06-13T10:30:00Z"
  },
  heart_rate_series: [
    { date: '2024-05-15', resting_hr: 58, avg_hr: 70, max_hr: 158, hrv: 42 },
    { date: '2024-05-16', resting_hr: 57, avg_hr: 72, max_hr: 165, hrv: 40 },
    { date: '2024-05-17', resting_hr: 59, avg_hr: 78, max_hr: 172, hrv: 38 },
    { date: '2024-05-18', resting_hr: 56, avg_hr: 74, max_hr: 168, hrv: 35 },
    { date: '2024-05-19', resting_hr: 58, avg_hr: 68, max_hr: 152, hrv: 44 },
    { date: '2024-05-20', resting_hr: 57, avg_hr: 71, max_hr: 160, hrv: 45 },
    { date: '2024-05-21', resting_hr: 55, avg_hr: 69, max_hr: 158, hrv: 48 },
    { date: '2024-05-22', resting_hr: 58, avg_hr: 76, max_hr: 170, hrv: 39 },
    { date: '2024-05-23', resting_hr: 56, avg_hr: 73, max_hr: 165, hrv: 41 },
    { date: '2024-05-24', resting_hr: 59, avg_hr: 79, max_hr: 175, hrv: 36 },
    { date: '2024-05-25', resting_hr: 57, avg_hr: 68, max_hr: 150, hrv: 50 },
    { date: '2024-05-26', resting_hr: 58, avg_hr: 72, max_hr: 162, hrv: 43 },
    { date: '2024-05-27', resting_hr: 55, avg_hr: 70, max_hr: 158, hrv: 46 },
    { date: '2024-05-28', resting_hr: 57, avg_hr: 77, max_hr: 169, hrv: 37 },
    { date: '2024-05-29', resting_hr: 58, avg_hr: 75, max_hr: 167, hrv: 40 },
    { date: '2024-05-30', resting_hr: 56, avg_hr: 71, max_hr: 161, hrv: 44 },
    { date: '2024-05-31', resting_hr: 59, avg_hr: 68, max_hr: 155, hrv: 47 },
    { date: '2024-06-01', resting_hr: 57, avg_hr: 74, max_hr: 166, hrv: 41 },
    { date: '2024-06-02', resting_hr: 58, avg_hr: 79, max_hr: 173, hrv: 35 },
    { date: '2024-06-03', resting_hr: 55, avg_hr: 72, max_hr: 159, hrv: 45 },
    { date: '2024-06-04', resting_hr: 57, avg_hr: 70, max_hr: 154, hrv: 48 },
    { date: '2024-06-05', resting_hr: 56, avg_hr: 73, max_hr: 163, hrv: 42 },
    { date: '2024-06-06', resting_hr: 58, avg_hr: 77, max_hr: 170, hrv: 38 },
    { date: '2024-06-07', resting_hr: 59, avg_hr: 81, max_hr: 178, hrv: 33 },
    { date: '2024-06-08', resting_hr: 57, avg_hr: 68, max_hr: 148, hrv: 51 },
    { date: '2024-06-09', resting_hr: 56, avg_hr: 71, max_hr: 157, hrv: 46 },
    { date: '2024-06-10', resting_hr: 58, avg_hr: 75, max_hr: 164, hrv: 42 },
    { date: '2024-06-11', resting_hr: 57, avg_hr: 72, max_hr: 160, hrv: 44 },
    { date: '2024-06-12', resting_hr: 55, avg_hr: 74, max_hr: 165, hrv: 40 },
    { date: '2024-06-13', resting_hr: 56, avg_hr: 72, max_hr: 162, hrv: 42 }
  ],
  recovery_series: [
    { date: '2024-05-15', recovery_score: 58, status: 'Partial', sleep: 0.40, hrv: 0.30, rhr: 0.30 },
    { date: '2024-05-16', recovery_score: 62, status: 'Partial', sleep: 0.45, hrv: 0.28, rhr: 0.27 },
    { date: '2024-05-17', recovery_score: 55, status: 'Partial', sleep: 0.38, hrv: 0.25, rhr: 0.37 },
    { date: '2024-05-18', recovery_score: 68, status: 'Well', sleep: 0.50, hrv: 0.32, rhr: 0.18 },
    { date: '2024-05-19', recovery_score: 72, status: 'Well', sleep: 0.55, hrv: 0.35, rhr: 0.10 },
    { date: '2024-05-20', recovery_score: 65, status: 'Partial', sleep: 0.48, hrv: 0.30, rhr: 0.22 },
    { date: '2024-05-21', recovery_score: 59, status: 'Partial', sleep: 0.42, hrv: 0.28, rhr: 0.30 },
    { date: '2024-05-22', recovery_score: 63, status: 'Partial', sleep: 0.46, hrv: 0.29, rhr: 0.25 },
    { date: '2024-05-23', recovery_score: 67, status: 'Well', sleep: 0.50, hrv: 0.32, rhr: 0.18 },
    { date: '2024-05-24', recovery_score: 52, status: 'Limited', sleep: 0.35, hrv: 0.22, rhr: 0.43 },
    { date: '2024-05-25', recovery_score: 78, status: 'Well', sleep: 0.60, hrv: 0.38, rhr: 0.02 },
    { date: '2024-05-26', recovery_score: 71, status: 'Well', sleep: 0.54, hrv: 0.34, rhr: 0.12 },
    { date: '2024-05-27', recovery_score: 65, status: 'Partial', sleep: 0.48, hrv: 0.30, rhr: 0.22 },
    { date: '2024-05-28', recovery_score: 58, status: 'Partial', sleep: 0.40, hrv: 0.27, rhr: 0.33 },
    { date: '2024-05-29', recovery_score: 63, status: 'Partial', sleep: 0.45, hrv: 0.29, rhr: 0.26 },
    { date: '2024-05-30', recovery_score: 69, status: 'Well', sleep: 0.51, hrv: 0.33, rhr: 0.16 },
    { date: '2024-05-31', recovery_score: 75, status: 'Well', sleep: 0.57, hrv: 0.36, rhr: 0.07 },
    { date: '2024-06-01', recovery_score: 62, status: 'Partial', sleep: 0.44, hrv: 0.29, rhr: 0.27 },
    { date: '2024-06-02', recovery_score: 48, status: 'Limited', sleep: 0.32, hrv: 0.20, rhr: 0.48 },
    { date: '2024-06-03', recovery_score: 73, status: 'Well', sleep: 0.55, hrv: 0.35, rhr: 0.10 },
    { date: '2024-06-04', recovery_score: 76, status: 'Well', sleep: 0.58, hrv: 0.37, rhr: 0.05 },
    { date: '2024-06-05', recovery_score: 68, status: 'Well', sleep: 0.50, hrv: 0.32, rhr: 0.18 },
    { date: '2024-06-06', recovery_score: 55, status: 'Partial', sleep: 0.38, hrv: 0.25, rhr: 0.37 },
    { date: '2024-06-07', recovery_score: 45, status: 'Limited', sleep: 0.28, hrv: 0.18, rhr: 0.54 },
    { date: '2024-06-08', recovery_score: 82, status: 'Excellent', sleep: 0.65, hrv: 0.42, rhr: 0 },
    { date: '2024-06-09', recovery_score: 75, status: 'Well', sleep: 0.56, hrv: 0.36, rhr: 0.08 },
    { date: '2024-06-10', recovery_score: 65, status: 'Partial', sleep: 0.48, hrv: 0.30, rhr: 0.22 },
    { date: '2024-06-11', recovery_score: 70, status: 'Well', sleep: 0.52, hrv: 0.33, rhr: 0.15 },
    { date: '2024-06-12', recovery_score: 62, status: 'Partial', sleep: 0.44, hrv: 0.29, rhr: 0.27 },
    { date: '2024-06-13', recovery_score: 65, status: 'Partial', sleep: 0.47, hrv: 0.31, rhr: 0.22 }
  ],
  strain_series: [
    { date: '2024-05-15', strain: 52, zone: 'Moderate' },
    { date: '2024-05-16', strain: 68, zone: 'High' },
    { date: '2024-05-17', strain: 75, zone: 'High' },
    { date: '2024-05-18', strain: 62, zone: 'Moderate' },
    { date: '2024-05-19', strain: 35, zone: 'Low' },
    { date: '2024-05-20', strain: 48, zone: 'Moderate' },
    { date: '2024-05-21', strain: 56, zone: 'Moderate' },
    { date: '2024-05-22', strain: 71, zone: 'High' },
    { date: '2024-05-23', strain: 59, zone: 'Moderate' },
    { date: '2024-05-24', strain: 78, zone: 'High' },
    { date: '2024-05-25', strain: 28, zone: 'Low' },
    { date: '2024-05-26', strain: 45, zone: 'Moderate' },
    { date: '2024-05-27', strain: 52, zone: 'Moderate' },
    { date: '2024-05-28', strain: 69, zone: 'High' },
    { date: '2024-05-29', strain: 63, zone: 'Moderate' },
    { date: '2024-05-30', strain: 41, zone: 'Moderate' },
    { date: '2024-05-31', strain: 32, zone: 'Low' },
    { date: '2024-06-01', strain: 58, zone: 'Moderate' },
    { date: '2024-06-02', strain: 82, zone: 'High' },
    { date: '2024-06-03', strain: 39, zone: 'Moderate' },
    { date: '2024-06-04', strain: 28, zone: 'Low' },
    { date: '2024-06-05', strain: 54, zone: 'Moderate' },
    { date: '2024-06-06', strain: 72, zone: 'High' },
    { date: '2024-06-07', strain: 85, zone: 'Very High' },
    { date: '2024-06-08', strain: 22, zone: 'Low' },
    { date: '2024-06-09', strain: 48, zone: 'Moderate' },
    { date: '2024-06-10', strain: 61, zone: 'Moderate' },
    { date: '2024-06-11', strain: 55, zone: 'Moderate' },
    { date: '2024-06-12', strain: 65, zone: 'Moderate' },
    { date: '2024-06-13', strain: 68, zone: 'High' }
  ],
  activities: [
    { id: 1, date: '2024-06-13', type: 'Running', duration: 45, avg_hr: 155, max_hr: 165, calories: 580, distance: 7.2 },
    { id: 2, date: '2024-06-12', type: 'Cycling', duration: 60, avg_hr: 140, max_hr: 158, calories: 720, distance: 22.5 },
    { id: 3, date: '2024-06-11', type: 'Strength', duration: 50, avg_hr: 125, max_hr: 145, calories: 350, distance: 0 },
    { id: 4, date: '2024-06-10', type: 'Running', duration: 40, avg_hr: 160, max_hr: 168, calories: 520, distance: 6.5 },
    { id: 5, date: '2024-06-09', type: 'Recovery', duration: 30, avg_hr: 95, max_hr: 110, calories: 180, distance: 3.2 },
    { id: 6, date: '2024-06-08', type: 'Rest Day', duration: 0, avg_hr: 0, max_hr: 0, calories: 0, distance: 0 },
    { id: 7, date: '2024-06-07', type: 'Cycling', duration: 75, avg_hr: 145, max_hr: 165, calories: 810, distance: 28.0 },
    { id: 8, date: '2024-06-06', type: 'Running', duration: 50, avg_hr: 158, max_hr: 172, calories: 650, distance: 8.0 },
    { id: 9, date: '2024-06-05', type: 'Strength', duration: 55, avg_hr: 130, max_hr: 150, calories: 400, distance: 0 },
    { id: 10, date: '2024-06-04', type: 'Recovery', duration: 25, avg_hr: 98, max_hr: 108, calories: 150, distance: 2.8 }
  ]
};

// Helper function to get HR zone color
const getHRZoneColor = (bpm) => {
  if (bpm < 60) return '#10B981'; // Green - Resting
  if (bpm < 100) return '#3B82F6'; // Blue - Aerobic
  if (bpm < 140) return '#F59E0B'; // Yellow - Threshold
  if (bpm < 160) return '#F97316'; // Orange - Max Effort
  return '#DC2626'; // Red - Peak
};

// Heart Rate Widget
const HeartRateWidget = ({ latestData, weekData }) => {
  const currentHR = latestData.avg_hr;
  const hrZone = currentHR < 60 ? 'Resting' : currentHR < 100 ? 'Aerobic' : currentHR < 140 ? 'Threshold' : 'Max Effort';
  const zoneColor = getHRZoneColor(currentHR);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Heart Rate</h2>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-5xl font-bold mb-2" style={{ color: zoneColor }}>
            {currentHR}
          </div>
          <p className="text-gray-600">BPM</p>
          <p className="text-sm text-gray-500 mt-2">{hrZone} Zone</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-gray-600">Resting: <span className="font-bold">{latestData.resting_hr}</span></p>
          <p className="text-gray-600">Max: <span className="font-bold">{latestData.max_hr}</span></p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={weekData}>
          <defs>
            <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={zoneColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={zoneColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[50, 180]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey="avg_hr" stroke={zoneColor} fillOpacity={1} fill="url(#colorHR)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// HRV Widget
const HRVWidget = ({ weekData }) => {
  const avgHRV = (weekData.reduce((sum, d) => sum + d.hrv, 0) / weekData.length).toFixed(1);
  const latestHRV = weekData[weekData.length - 1].hrv;
  const hrvStatus = latestHRV > 45 ? 'Balanced' : latestHRV > 35 ? 'Normal' : 'Elevated Stress';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">HRV (Heart Rate Variability)</h2>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-4xl font-bold text-purple-600 mb-2">{latestHRV}</div>
          <p className="text-gray-600">RMSSD (ms)</p>
          <div className="mt-3 px-3 py-1 rounded-full bg-purple-100 w-fit">
            <p className="text-sm font-semibold text-purple-800">{hrvStatus}</p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="text-gray-600">30-day avg: <span className="font-bold">{avgHRV} ms</span></p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={weekData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[30, 60]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="hrv" stroke="#9333EA" name="Daily HRV" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Strain Widget with Gauge visualization
const StrainWidget = ({ latestStrain, weekData }) => {
  const strain = latestStrain.strain;
  const zoneColor = strain < 30 ? '#10B981' : strain < 70 ? '#F59E0B' : '#DC2626';
  const zoneLabel = strain < 30 ? 'Low' : strain < 70 ? 'Moderate' : 'High';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Strain Score</h2>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-5xl font-bold" style={{ color: zoneColor }}>
              {strain}
            </div>
            <span className="text-gray-600 text-lg">/100</span>
          </div>
          <div className="px-3 py-1 rounded-full w-fit" style={{ backgroundColor: zoneColor + '20', borderLeft: `4px solid ${zoneColor}` }}>
            <p className="text-sm font-semibold" style={{ color: zoneColor }}>{zoneLabel}</p>
          </div>
        </div>
        <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gray-100">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={zoneColor} strokeWidth="8"
              strokeDasharray={`${strain * 2.83} 283`}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          </svg>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={weekData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="strain" fill={zoneColor} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Recovery Widget with breakdown
const RecoveryWidget = ({ latestRecovery, weekData }) => {
  const recovery = latestRecovery.recovery_score;
  const statusColors = { 'Excellent': '#10B981', 'Well': '#3B82F6', 'Partial': '#F59E0B', 'Limited': '#DC2626' };
  const statusColor = statusColors[latestRecovery.status] || '#6B7280';
  
  const recoveryData = [
    { name: 'Sleep Quality', value: Math.round(latestRecovery.sleep * 100) },
    { name: 'HRV Trend', value: Math.round(latestRecovery.hrv * 100) },
    { name: 'Resting HR Trend', value: Math.round(latestRecovery.rhr * 100) }
  ];
  
  const COLORS = ['#3B82F6', '#9333EA', '#F59E0B'];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recovery Score</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-5xl font-bold mb-2" style={{ color: statusColor }}>
            {recovery}%
          </div>
          <div className="px-3 py-1 rounded-full w-fit" style={{ backgroundColor: statusColor + '20' }}>
            <p className="text-sm font-semibold" style={{ color: statusColor }}>{latestRecovery.status}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={recoveryData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
              {recoveryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 text-sm">
        {recoveryData.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-gray-600">{item.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full" style={{ width: `${item.value}%`, backgroundColor: COLORS[idx] }}></div>
              </div>
              <span className="font-bold w-8">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Activity History Table
const ActivityTable = ({ activities }) => {
  const [sortKey, setSortKey] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const sorted = [...activities].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });
  
  const paginatedActivities = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  
  const getActivityColor = (type) => {
    const colors = {
      'Running': '#EF4444',
      'Cycling': '#3B82F6',
      'Strength': '#8B5CF6',
      'Recovery': '#10B981',
      'Rest Day': '#9CA3AF'
    };
    return colors[type] || '#6B7280';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Activity History</h2>
        <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Activity</th>
              <th className="px-4 py-2 text-right cursor-pointer" onClick={() => { setSortKey('duration'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                Duration
              </th>
              <th className="px-4 py-2 text-right">Avg HR</th>
              <th className="px-4 py-2 text-right">Max HR</th>
              <th className="px-4 py-2 text-right">Calories</th>
              <th className="px-4 py-2 text-right">Distance</th>
            </tr>
          </thead>
          <tbody>
            {paginatedActivities.map((activity) => (
              <tr key={activity.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(activity.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: getActivityColor(activity.type) }}>
                    {activity.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{activity.duration}m</td>
                <td className="px-4 py-3 text-right">{activity.avg_hr || '—'}</td>
                <td className="px-4 py-3 text-right">{activity.max_hr || '—'}</td>
                <td className="px-4 py-3 text-right">{activity.calories || '—'}</td>
                <td className="px-4 py-3 text-right">{activity.distance > 0 ? `${activity.distance}km` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function WahooMetricsDashboard() {
  const [dateRange, setDateRange] = useState(30);
  const [darkMode, setDarkMode] = useState(false);
  
  const latestData = SAMPLE_DATA.heart_rate_series[SAMPLE_DATA.heart_rate_series.length - 1];
  const latestStrain = SAMPLE_DATA.strain_series[SAMPLE_DATA.strain_series.length - 1];
  const latestRecovery = SAMPLE_DATA.recovery_series[SAMPLE_DATA.recovery_series.length - 1];
  const weekData = SAMPLE_DATA.heart_rate_series.slice(-7);
  
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Wahoo Metrics Dashboard</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sample Athlete · Last updated: {latestData.date}</p>
            </div>
            <div className="flex gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(parseInt(e.target.value))}
                className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
              </select>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 rounded ${darkMode ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <HeartRateWidget latestData={latestData} weekData={weekData} />
            </div>
            <HRVWidget weekData={weekData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <StrainWidget latestStrain={latestStrain} weekData={SAMPLE_DATA.strain_series.slice(-7)} />
            <RecoveryWidget latestRecovery={latestRecovery} weekData={SAMPLE_DATA.recovery_series.slice(-7)} />
          </div>

          <ActivityTable activities={SAMPLE_DATA.activities} />

          {/* Footer Info */}
          <div className={`mt-8 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-900'}`}>
              <strong>Note:</strong> This dashboard displays <strong>sample data</strong> for demonstration purposes. All metrics are simulated based on realistic Wahoo Chest Strap data patterns. 
              In production, this would connect to real Wahoo API endpoints with authenticated user data.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
