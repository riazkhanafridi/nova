import { Link } from 'react-router-dom';
import { ArrowUpRight, Bell, Box, ChartNoAxesColumn, CircleDollarSign, ClipboardList, PackagePlus, Tag, Users } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLES = {
  pending: 'bg-[#fff1e9] text-[#c64a12]',
  confirmed: 'bg-[#eaf1ff] text-[#315be8]',
  processing: 'bg-[#fff5d9] text-[#a36b00]',
  shipped: 'bg-[#eeeaff] text-[#6849c8]',
  delivered: 'bg-[#e7f8ee] text-[#21834b]',
  cancelled: 'bg-[#ffe8e8] text-[#c83c3c]',
};

const money = (value, currency = 'QAR') => `${currency} ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function unwrapList(response, keys = []) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function MetricCard({ label, value, note, icon: Icon }) {
  return (
    <article className="min-w-0 rounded-[11px] border border-[#e7e8eb] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(20,24,33,.025)]">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[10px] font-medium uppercase tracking-[.035em] text-[#737780]">{label}</p>
        <Icon className="h-4 w-4 shrink-0 text-[#9a9da4]" strokeWidth={1.7} />
      </div>
      <p className="mt-2 text-[24px] font-semibold leading-none tracking-[-.045em] text-[#17191d]">{value}</p>
      <p className="mt-2 text-[9px] text-[#8b8e95]">{note}</p>
    </article>
  );
}

function RevenueChart({ rows, loading }) {
  const points = rows.slice(-30);
  const max = Math.max(...points.map(row => Number(row.revenue) || 0), 1);
  return (
    <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white">
      <div className="flex items-center justify-between border-b border-[#f0f1f2] px-4 py-3">
        <h2 className="text-[13px] font-semibold text-[#22242a]">Revenue Chart <span className="font-normal text-[#747780]">(Last 30 Days)</span></h2>
        <span className="text-[10px] font-medium text-[#e65000]">Recent activity</span>
      </div>
      <div className="flex h-[153px] items-end gap-1 px-4 pb-3 pt-5 sm:gap-1.5">
        {loading ? [...Array(12)].map((_, index) => <div key={index} className="h-1/2 flex-1 animate-pulse rounded-t-[3px] bg-slate-100" />) : points.length ? points.map((point, index) => {
          const height = Math.max(8, (Number(point.revenue || 0) / max) * 100);
          const date = new Date(`${point.date}T00:00:00`);
          return (
            <div key={`${point.date}-${index}`} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end">
              <span className="mb-1 hidden whitespace-nowrap text-[8px] text-[#858991] group-hover:block">{money(point.revenue)}</span>
              <div title={`${date.toLocaleDateString()}: ${money(point.revenue)}`} className="w-full max-w-[30px] rounded-t-[3px] bg-[#ff5a00] transition-colors hover:bg-[#e64f00]" style={{ height: `${height}%` }} />
              <span className="mt-1.5 h-2.5 whitespace-nowrap text-[7px] text-[#858991]">{(index === 0 || index === points.length - 1 || index % 5 === 0) && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}</span>
            </div>
          );
        }) : <div className="flex h-full w-full items-center justify-center text-xs text-[#858991]">No paid sales in the last 30 days</div>}
      </div>
    </section>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: overviewResponse, loading: overviewLoading } = useFetch('/dashboard/overview');
  const { data: analyticsResponse, loading: analyticsLoading } = useFetch('/dashboard/analytics');
  const { data: orderResponse, loading: ordersLoading } = useFetch('/orders', { params: { limit: 6 } });

  const overview = overviewResponse?.data ?? overviewResponse ?? {};
  const analytics = unwrapList(analyticsResponse);
  const orders = unwrapList(orderResponse, ['orders']).slice(0, 6);
  const currency = orders[0]?.currency || 'QAR';
  const customerName = user?.fullName?.split(' ')[0] || 'Admin';

  return (
    <div className="mx-auto max-w-[1180px] space-y-[14px]">
      <div className="flex min-h-[35px] items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-medium text-[#ee5a16]">Dashboard</p>
          <h1 className="mt-0.5 text-[17px] font-semibold leading-tight tracking-[-.025em] text-[#202126]">Welcome back, {customerName}</h1>
        </div>
        <div className="hidden items-center gap-2 text-right sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ececef] bg-white"><Bell className="h-4 w-4 text-[#454850]" /></div>
          <div className="text-left"><p className="text-[10px] font-semibold text-[#25272c]">{user?.fullName || 'Administrator'}</p><p className="text-[8px] uppercase tracking-[.06em] text-[#888b92]">Super Admin</p></div>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <MetricCard label="Total Revenue" value={overviewLoading ? '—' : money(overview.totalRevenue, currency)} note="All paid orders" icon={CircleDollarSign} />
        <MetricCard label="Total Orders" value={overviewLoading ? '—' : Number(overview.totalOrders || 0).toLocaleString()} note="All order statuses" icon={ClipboardList} />
        <MetricCard label="Customers" value={overviewLoading ? '—' : Number(overview.totalCustomers || 0).toLocaleString()} note="Registered customers" icon={Users} />
        <MetricCard label="Products" value={overviewLoading ? '—' : Number(overview.totalProducts || 0).toLocaleString()} note="Products in catalog" icon={Box} />
      </section>

      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.8fr)_minmax(180px,.75fr)]">
        <RevenueChart rows={analytics} loading={analyticsLoading} />
        <section className="rounded-[11px] border border-[#e7e8eb] bg-white p-4">
          <h2 className="text-[13px] font-semibold text-[#22242a]">Quick Actions</h2>
          <div className="mt-3 flex flex-col items-start gap-2">
            <Link to="/admin/products" className="inline-flex h-[29px] items-center gap-1.5 rounded-[7px] bg-black px-3 text-[10px] font-medium text-white transition-colors hover:bg-[#333]"><PackagePlus className="h-3 w-3" />Add New Product</Link>
            <Link to="/admin/categories" className="inline-flex h-[29px] items-center gap-1.5 rounded-[7px] border border-[#dedfe2] bg-white px-3 text-[10px] font-medium text-[#292b30] hover:bg-[#f8f8f9]"><Tag className="h-3 w-3" />Manage Categories</Link>
            <Link to="/admin/orders" className="inline-flex h-[29px] items-center gap-1.5 rounded-[7px] bg-black px-3 text-[10px] font-medium text-white transition-colors hover:bg-[#333]"><ArrowUpRight className="h-3 w-3" />View Orders</Link>
            <Link to="/admin/analytics" className="inline-flex h-[29px] items-center gap-1.5 rounded-[7px] px-2 text-[10px] font-medium text-[#35373c] hover:bg-[#f5f5f6]"><ChartNoAxesColumn className="h-3 w-3" />Sales Analytics</Link>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white">
        <div className="flex items-center justify-between border-b border-[#f0f1f2] px-4 py-3">
          <h2 className="text-[13px] font-semibold text-[#22242a]">Recent Orders</h2>
          <Link to="/admin/orders" className="rounded-full border border-[#dedfe2] px-3 py-1 text-[9px] font-medium text-[#303238] hover:bg-[#f8f8f9]">View All Orders</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead><tr className="bg-[#f8f9fa] text-[8px] font-medium uppercase tracking-[.025em] text-[#767a82]">
              <th className="px-3 py-2.5">Order ID</th><th className="px-3 py-2.5">Customer</th><th className="px-3 py-2.5">Product</th><th className="px-3 py-2.5">Amount</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Date</th>
            </tr></thead>
            <tbody>
              {ordersLoading ? [...Array(5)].map((_, index) => <tr key={index}><td colSpan={6} className="px-3 py-3"><div className="h-3 animate-pulse rounded bg-slate-100" /></td></tr>) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-xs text-[#858991]">No orders yet</td></tr>
              ) : orders.map(order => {
                const customer = order.user || order.User || {};
                const items = order.items || order.OrderItems || [];
                const firstItem = items[0];
                const productLabel = firstItem ? `${firstItem.productName}${items.length > 1 ? ` +${items.length - 1} more` : ''}` : '—';
                return <tr key={order.orderId} className="border-t border-[#f0f1f2] text-[9px] text-[#35373c] hover:bg-[#fcfcfd]">
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-[#202126]">{order.orderNumber || `#${order.orderId}`}</td>
                  <td className="px-3 py-2.5">{customer.fullName || [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email || '—'}</td>
                  <td className="max-w-[190px] truncate px-3 py-2.5">{productLabel}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{money(order.totalAmount, order.currency || currency)}</td>
                  <td className="px-3 py-2.5"><span className={`inline-flex rounded-full px-2 py-1 text-[8px] font-semibold capitalize ${STATUS_STYLES[order.orderStatus] || 'bg-slate-100 text-slate-600'}`}>{order.orderStatus || 'Unknown'}</span></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#797d85]">{order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
