import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { PeopleIcon, CurrencyIcon, ClockIcon, CheckCircleIcon } from '../../components/Icons';

const API = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '/api' : 'http://127.0.0.1:5000/api');
const headers = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export default function Reports() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [classDist, setClassDist] = useState([]);
  const [feeMonthly, setFeeMonthly] = useState([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [pendingFees, setPendingFees] = useState([]);

  useEffect(() => {
    axios.get(`${API}/dashboard/stats`, headers()).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/dashboard/class-distribution`, headers()).then(r => setClassDist(r.data)).catch(() => {});
    axios.get(`${API}/dashboard/fee-summary-by-month`, headers()).then(r => setFeeMonthly(r.data)).catch(() => {});
    axios.get(`${API}/attendance/monthly-report?month=${reportMonth}&year=${reportYear}`, headers())
      .then(r => setMonthlyAttendance(r.data)).catch(() => {});
    if (user?.role !== 'teacher') {
      axios.get(`${API}/fees/pending-reminders`, headers()).then(r => setPendingFees(r.data)).catch(() => {});
    }
  }, [reportMonth, reportYear]);

  const totalStudents = classDist.reduce((sum, c) => sum + parseInt(c.count), 0);
  const statCards = [
    { icon: PeopleIcon, label: 'Total Students', value: stats?.totalStudents || 0, color: 'text-school-primary' },
    { icon: CurrencyIcon, label: 'Total Collected', value: `₹${(stats?.feesCollected || 0).toLocaleString()}`, color: 'text-green-600' },
    { icon: ClockIcon, label: 'Pending Fees', value: `₹${(stats?.pendingFees || 0).toLocaleString()}`, color: 'text-red-500' },
    { icon: CheckCircleIcon, label: 'Attendance', value: `${stats?.attendancePercentage || 0}%`, color: 'text-blue-600' },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((item, i) => (
              <div key={i} className="stat-card">
                <div className={item.color}><item.icon /></div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-gray-500 text-sm">{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Class Distribution</h3>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={classDist} dataKey="count" nameKey="class" cx="50%" cy="50%" outerRadius={80} label>
                      {classDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4">Monthly Fee Collection</h3>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={feeMonthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="collected" fill="#1e40af" name="Collected" radius={[4,4,0,0]} />
                    <Bar dataKey="total" fill="#93c5fd" name="Total" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h3 className="font-semibold">Monthly Attendance Report</h3>
              <div className="flex space-x-3">
                <select className="input-field w-auto" value={reportMonth} onChange={e => setReportMonth(e.target.value)}>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <input className="input-field w-auto" type="number" value={reportYear} onChange={e => setReportYear(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-2 font-medium">Student</th>
                    <th className="text-left p-2 font-medium">Class</th>
                    <th className="text-center p-2 font-medium">Total Days</th>
                    <th className="text-center p-2 font-medium text-green-600">Present</th>
                    <th className="text-center p-2 font-medium text-red-600">Absent</th>
                    <th className="text-center p-2 font-medium text-yellow-600">Late</th>
                    <th className="text-center p-2 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyAttendance.map(a => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{a.name}</td>
                      <td className="p-2">{a.class} {a.section}</td>
                      <td className="p-2 text-center">{a.total_days}</td>
                      <td className="p-2 text-center text-green-600">{a.present_days}</td>
                      <td className="p-2 text-center text-red-600">{a.absent_days}</td>
                      <td className="p-2 text-center text-yellow-600">{a.late_days}</td>
                      <td className="p-2 text-center font-medium">
                        {a.total_days > 0 ? ((a.present_days / a.total_days) * 100).toFixed(1) : 'N/A'}%
                      </td>
                    </tr>
                  ))}
                  {monthlyAttendance.length === 0 && (
                    <tr><td colSpan={7} className="p-4 text-center text-gray-400">No data for selected month</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {user?.role !== 'teacher' && (
            <div className="card">
              <h3 className="font-semibold mb-4">Pending Fee Reminders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left p-2 font-medium">Student</th>
                      <th className="text-left p-2 font-medium">Class</th>
                      <th className="text-left p-2 font-medium">Parent Phone</th>
                      <th className="text-left p-2 font-medium">Pending Fee</th>
                      <th className="text-left p-2 font-medium">Due Date</th>
                      <th className="text-left p-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingFees.map(f => (
                      <tr key={f.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{f.student_name}</td>
                        <td className="p-2">{f.class}</td>
                        <td className="p-2">{f.parent_phone}</td>
                        <td className="p-2 text-red-600">₹{parseFloat(f.pending_fee).toLocaleString()}</td>
                        <td className="p-2">{new Date(f.due_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${f.status === 'pending' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {pendingFees.length === 0 && (
                      <tr><td colSpan={6} className="p-4 text-center text-gray-400">No pending fees</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
