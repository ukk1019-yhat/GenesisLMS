import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { DashboardIcon, StudentsIcon, FeesIcon, MarksIcon, AttendanceIcon, ReportsIcon, LogoutIcon } from './Icons';

const navItems = {
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/dashboard/students', label: 'Students', icon: StudentsIcon },
    { href: '/dashboard/fees', label: 'Fees', icon: FeesIcon },
    { href: '/dashboard/marks', label: 'Marks', icon: MarksIcon },
    { href: '/dashboard/attendance', label: 'Attendance', icon: AttendanceIcon },
    { href: '/dashboard/reports', label: 'Reports', icon: ReportsIcon },
  ],
  teacher: [
    { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/dashboard/marks', label: 'Marks', icon: MarksIcon },
    { href: '/dashboard/attendance', label: 'Attendance', icon: AttendanceIcon },
  ],
  accountant: [
    { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/dashboard/fees', label: 'Fees', icon: FeesIcon },
    { href: '/dashboard/reports', label: 'Reports', icon: ReportsIcon },
  ],
};

export default function Sidebar({ open, onClose }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const items = navItems[user?.role] || navItems.admin;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={onClose}></div>
      )}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-school-dark text-white transform transition-transform duration-200 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        <div className="p-4 border-b border-gray-700">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Genesis Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold tracking-wide">Genesis International</span>
          </Link>
          <p className="text-xs text-school-accent mt-1 italic">Learn · Lead · Achieve</p>
          <p className="text-sm text-gray-400 mt-1 capitalize">{user?.role}</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {items.map(item => {
            const active = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition ${active ? 'bg-school-primary text-white' : 'text-gray-300 hover:bg-school-primary hover:text-white'}`}
                onClick={onClose}
              >
                <span className="mr-3">{item.icon()}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={logout} className="flex items-center text-gray-300 hover:text-white w-full">
            <span className="mr-3"><LogoutIcon /></span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
