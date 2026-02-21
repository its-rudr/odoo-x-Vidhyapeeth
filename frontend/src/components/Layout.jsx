import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '14px' } }} />
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
