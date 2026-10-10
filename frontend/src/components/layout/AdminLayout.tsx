import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  LogOut,
  ArrowLeft,
  Leaf,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Tổng quan', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Danh mục', path: '/admin/categories', icon: <Layers className="w-4 h-4" /> },
    { label: 'Sản phẩm', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { label: 'Đơn hàng', path: '/admin/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Khách hàng', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col lg:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-950 text-white shrink-0 flex flex-col border-r border-slate-900">
        {/* Header Logo */}
        <div className="p-5 border-b border-slate-900 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <Leaf className="w-4 h-4 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-wide text-white">
                Fresh<span className="text-purple-400">Admin</span>
              </span>
              <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                Quản trị hệ thống
              </span>
            </div>
          </Link>
        </div>

        {/* Admin User Profile Tag */}
        <div className="p-3.5 mx-3.5 my-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover border border-purple-400/40"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">{user?.name}</span>
            <span className="text-[10px] text-purple-400 font-extrabold uppercase">Administrator</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3.5 py-1.5 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Return to Main Store & Logout */}
        <div className="p-3.5 border-t border-slate-900 flex flex-col gap-1.5">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Về trang bán hàng</span>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-2xs">
          <h1 className="text-base sm:text-lg font-black text-slate-900">Bảng Quản Trị Hệ Thống</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Hệ thống ổn định
            </span>
          </div>
        </header>

        <div className="p-5 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};
