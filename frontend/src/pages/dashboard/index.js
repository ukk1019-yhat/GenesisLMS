import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PeopleIcon, CurrencyIcon, ClockIcon, CheckCircleIcon } from '../../components/Icons';

const API = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '/api' : 'http://127.0.0.1:5000/api');

const headers = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className={color || 'text-school-primary'}><Icon /></div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-gray-500 text-sm">{label}</p>
        {sub && <p className="text-gray-400 text-xs">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [classDist, setClassDist] = useState([]);
  const [feeMonthly, setFeeMonthly] = useState([]);

  useEffect(() => {
    axios.get(`${API}/dashboard/stats`, headers()).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/dashboard/recent-activities`, headers()).then(r => setActivities(r.data)).catch(() => {});
    axios.get(`${API}/dashboard/class-distribution`, headers()).then(r => setClassDist(r.data)).catch(() => {});
    axios.get(`${API}/dashboard/fee-summary-by-month`, headers()).then(r => setFeeMonthly(r.data)).catch(() => {});
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={PeopleIcon} label="Total Students" value={stats?.totalStudents || 0} color="text-school-primary" />
            <StatCard icon={CurrencyIcon} label="Fees Collected" value={`₹${(stats?.feesCollected || 0).toLocaleString()}`} color="text-green-600" />
            <StatCard icon={ClockIcon} label="Pending Fees" value={`₹${(stats?.pendingFees || 0).toLocaleString()}`} color="text-red-500" />
            <StatCard icon={CheckCircleIcon} label="Attendance Today" value={`${stats?.attendancePercentage || 0}%`} sub={`${stats?.todayPresent || 0}/${stats?.todayTotal || 0} present`} color="text-blue-600" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Students per Class</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classDist}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1e40af" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4">Monthly Fee Collection</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feeMonthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="collected" fill="#3b82f6" name="Collected" radius={[4,4,0,0]} />
                    <Bar dataKey="total" fill="#93c5fd" name="Total" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Recent Activities</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2 font-medium">User</th>
                    <th className="pb-2 font-medium">Action</th>
                    <th className="pb-2 font-medium">Details</th>
                    <th className="pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(a => (
                    <tr key={a.id} className="border-b border-gray-100">
                      <td className="py-2">{a.user_name || 'System'}</td>
                      <td className="py-2">{a.action}</td>
                      <td className="py-2 text-gray-500">{a.details}</td>
                      <td className="py-2 text-gray-400 text-xs">{new Date(a.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {activities.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-400">No recent activities</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
