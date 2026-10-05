import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Sheet, SheetContent } from '../ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Tag, Settings,
  Bell, Search, Menu, LogOut, Award, PanelLeftClose, PanelLeftOpen, ChartNoAxesColumn, Wrench
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getMediaUrl } from '../../lib/media';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', to: '/admin/users', icon: Users },
  { label: 'Categories', to: '/admin/categories', icon: Tag },
  { label: 'Brands', to: '/admin/brands', icon: Award },
  { label: 'Services', to: '/admin/services', icon: Wrench },
  { label: 'Analytics', to: '/admin/analytics', icon: ChartNoAxesColumn },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

function NavLink({ item, collapsed }) {
  const location = useLocation();
  const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
  return (
    <Link to={item.to}
      title={collapsed ? item.label : undefined}
      className={`admin-nav-link group relative flex h-[40px] items-center gap-[11px] rounded-[2px] px-[10px] text-[16px] font-normal transition-colors ${active ? 'is-active' : ''}`}>
      <item.icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: ordersData, refetch: refetchOrders } = useFetch('/orders', { params: { page: 1, limit: 20 } });
  const recentOrders = useMemo(() => {
    const payload = ordersData?.data ?? ordersData;
    const orders = Array.isArray(payload?.orders)
      ? payload.orders
      : Array.isArray(payload?.data?.orders)
        ? payload.data.orders
        : Array.isArray(payload)
          ? payload
          : [];
    return [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [ordersData]);
  const pendingOrdersCount = recentOrders.filter(order => String(order.orderStatus || '').toLowerCase() === 'pending').length;

  useEffect(() => {
    const intervalId = window.setInterval(() => refetchOrders(), 30000);
    return () => window.clearInterval(intervalId);
  }, [refetchOrders]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className={`admin-sidebar flex h-full flex-col text-white ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="admin-sidebar-brand relative flex h-[84px] shrink-0 items-center justify-center">
        <div className="flex items-center justify-between gap-3">
          <img className={`admin-wordmark ${collapsed ? 'hidden' : ''}`} src="/nova-admin-logo.png" alt="Nova — Mobile accessories and computer services" />
          <button className="admin-collapse hidden items-center justify-center p-1.5 lg:flex" onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <nav className="admin-nav flex-1 space-y-[1px] px-[10px] pb-3 pt-[9px]">
        {navItems.map(item => <NavLink key={item.to} item={item} collapsed={collapsed} />)}
      </nav>
      <button onClick={handleLogout} className="admin-sidebar-logout" aria-label="Log out"><LogOut className="h-4 w-4" /></button>
    </div>
  );

  return (
    <div className="admin-shell flex min-h-screen bg-[#f7f8fa] font-sans antialiased">
      <aside className={`hidden shrink-0 flex-col transition-all duration-300 lg:flex ${collapsed ? 'w-[76px]' : 'w-[190px]'}`}>
        <SidebarContent />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[190px] border-0 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[72px] items-center gap-4 border-b border-slate-200/80 bg-white px-4 sm:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative max-w-[360px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search anything..." className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-[13px] text-slate-700 ring-0 focus-visible:border-blue-300 focus-visible:bg-white" />
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Order notifications" className="relative rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                  <Bell className="h-[18px] w-[18px]" />
                  {pendingOrdersCount > 0 && <Badge className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center border-0 bg-red-500 px-1 text-[9px] text-white">{pendingOrdersCount}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Recent orders</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recentOrders.length ? recentOrders.slice(0, 5).map(order => (
                  <DropdownMenuItem key={order.orderId} asChild className="cursor-pointer items-start py-3">
                    <Link to="/admin/orders" className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900">{order.orderNumber || `Order #${order.orderId}`}</span>
                      <span className="text-xs text-slate-500">
                        {order.User?.fullName || order.user?.fullName || 'Customer'} · {String(order.orderStatus || 'pending').toLowerCase()} · {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just now'}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                )) : (
                  <div className="px-2 py-5 text-center text-sm text-slate-500">No orders yet</div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="justify-center font-semibold text-blue-600">
                  <Link to="/admin/orders">View all orders</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/" className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block">View store</Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-9 w-9 ring-2 ring-slate-100">
                    <AvatarImage src={getMediaUrl(user?.avatar)} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white">{user?.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
                  <p className="text-xs font-normal text-slate-500">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

          <main className="admin-content flex-1 overflow-auto bg-[#f7f8fa] p-4 sm:px-8 sm:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
