import { NavLink, Outlet } from 'react-router-dom';
import { Activity, LayoutDashboard, List, Play } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Jobs', path: '/jobs', icon: List },
  { name: 'Run Job', path: '/run', icon: Play },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Activity className="text-purple-600 mr-3" />
          <span className="text-lg font-bold">MirrorNeuron</span>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-6 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-purple-700 bg-purple-50 border-r-2 border-purple-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
          <h1 className="text-xl font-semibold text-slate-800">Control Panel</h1>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
