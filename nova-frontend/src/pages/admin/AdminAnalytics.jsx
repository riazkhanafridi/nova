import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, ClipboardList, Eye, FileDown, ShoppingBag, Users, X } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

function listFrom(response, key) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  return [];
}

const normalizeStatus = value => String(value || '').toUpperCase();
const PAGE_SIZE = 5;
const formatMoney = value => `QAR ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const formatDate = value => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
const toDateInput = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const fromDateInput = value => { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); };
const dateLabel = value => fromDateInput(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

function DateRangeDialog({ initialStart, initialEnd, onClose, onApply }) {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [choosingEnd, setChoosingEnd] = useState(false);
  const [month, setMonth] = useState(() => { const date = fromDateInput(initialStart); return new Date(date.getFullYear(), date.getMonth(), 1); });
  const [preset, setPreset] = useState('Custom Range');
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const presets = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'This Quarter', 'This Year', 'Custom Range'];
  const choosePreset = item => {
    setPreset(item);
    if (item === 'Custom Range') return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let from = new Date(today); let to = new Date(today);
    if (item === 'Last 7 Days') from.setDate(today.getDate() - 6);
    if (item === 'Last 30 Days') from.setDate(today.getDate() - 29);
    if (item === 'This Month') from = new Date(today.getFullYear(), today.getMonth(), 1);
    if (item === 'Last Month') { from = new Date(today.getFullYear(), today.getMonth() - 1, 1); to = new Date(today.getFullYear(), today.getMonth(), 0); }
    if (item === 'This Quarter') from = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
    if (item === 'This Year') from = new Date(today.getFullYear(), 0, 1);
    setStart(toDateInput(from)); setEnd(toDateInput(to)); setMonth(new Date(from.getFullYear(), from.getMonth(), 1));
  };
  const selectDay = day => {
    const value = toDateInput(new Date(month.getFullYear(), month.getMonth(), day));
    setPreset('Custom Range');
    if (!choosingEnd) { setStart(value); setEnd(value); setChoosingEnd(true); }
    else if (value < start) { setStart(value); setEnd(value); }
    else { setEnd(value); setChoosingEnd(false); }
  };
  const inRange = value => value >= start && value <= end;
  const daysSelected = Math.max(1, Math.round((fromDateInput(end) - fromDateInput(start)) / 86400000) + 1);

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-3" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="date-range-title" className="w-full max-w-[760px] rounded-[14px] border border-[#e8e8eb] bg-[#fafafa] p-4 shadow-2xl sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3"><div><div className="flex items-center gap-1.5 text-[9px] text-[#7f838a]"><span>Dashboard</span><span>›</span><span className="text-[#ef5a18]">Analytics</span></div><h2 id="date-range-title" className="mt-1 text-[16px] font-semibold text-[#24262b]">Date Selection Intelligence</h2></div><button type="button" onClick={onClose} aria-label="Close date range" className="rounded-full p-1.5 text-[#777b83] hover:bg-[#eee]"><X className="h-4 w-4" /></button></div>
      <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"><div className="space-y-1"><label className="text-[8px] font-semibold uppercase text-[#7c8087]">Start Date</label><input type="date" value={start} max={end} onChange={event => { setStart(event.target.value); setPreset('Custom Range'); }} className="h-8 w-full rounded-md border border-[#e2e3e6] bg-white px-2 text-[10px]" /></div><div className="space-y-1"><label className="text-[8px] font-semibold uppercase text-[#7c8087]">End Date</label><input type="date" value={end} min={start} onChange={event => { setEnd(event.target.value); setPreset('Custom Range'); }} className="h-8 w-full rounded-md border border-[#e2e3e6] bg-white px-2 text-[10px]" /></div><button type="button" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-[#dfe1e4] bg-white px-3 text-[9px] font-medium" onClick={() => {}}><CalendarDays className="h-3 w-3" />{dateLabel(start)} – {dateLabel(end)}</button><Button onClick={() => onApply(start, end)} className="h-8 rounded-full bg-black px-4 text-[9px] text-white hover:bg-[#333]">Apply Filters</Button></div>
      <div className="grid gap-3 sm:grid-cols-[115px_1fr]">
        <div className="flex gap-1 overflow-x-auto border-b border-[#ececef] pb-2 sm:block sm:overflow-visible sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">{presets.map(item => <button type="button" key={item} onClick={() => choosePreset(item)} className={`block shrink-0 rounded-md px-2 py-1.5 text-left text-[9px] ${preset === item ? 'bg-[#f1f1f3] font-semibold text-[#292b30]' : 'text-[#686c73] hover:bg-white'}`}>{item}</button>)}</div>
        <div><div className="mb-2 flex items-center justify-between"><button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-md p-1.5 hover:bg-white"><ChevronLeft className="h-3.5 w-3.5" /></button><h3 className="text-[10px] font-semibold text-[#303238]">{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3><button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-md p-1.5 hover:bg-white"><ChevronRight className="h-3.5 w-3.5" /></button></div>
          <div className="grid grid-cols-7 text-center">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day} className="py-1 text-[8px] text-[#858991]">{day}</span>)}{cells.map((day, index) => { if (!day) return <span key={`empty-${index}`} />; const value = toDateInput(new Date(month.getFullYear(), month.getMonth(), day)); const selected = value === start || value === end; return <button type="button" key={value} onClick={() => selectDay(day)} className={`mx-0.5 my-0.5 h-7 rounded-md text-[9px] ${selected ? 'rounded-full bg-black font-semibold text-white' : inRange(value) ? 'bg-[#f0f1f3] text-[#27292e]' : 'text-[#4d5057] hover:bg-white'}`}>{day}</button>; })}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[#e9eaed] pt-3"><p className="text-[9px] text-[#777b83]">Range: {daysSelected} {daysSelected === 1 ? 'day' : 'days'} selected</p><div className="flex gap-2"><Button variant="outline" onClick={onClose} className="h-7 rounded-full border-[#dfe1e4] bg-white px-3 text-[9px]">Cancel</Button><Button onClick={() => onApply(start, end)} className="h-7 rounded-full bg-black px-3 text-[9px] text-white hover:bg-[#333]">Apply Range</Button></div></div>
    </section>
  </div>;
}

function Metric({ label, value, note, icon: Icon }) {
  return <article className="rounded-[11px] border border-[#e6e7ea] bg-white px-4 py-3.5">
    <div className="flex items-center justify-between"><p className="text-[9px] font-medium uppercase tracking-[.04em] text-[#777b83]">{label}</p><Icon className="h-4 w-4 text-[#9a9da4]" strokeWidth={1.7} /></div>
    <p className="mt-2 text-[22px] font-semibold leading-none tracking-[-.04em] text-[#1d1f24]">{value}</p>
    <p className="mt-2 text-[9px] text-[#858991]">{note}</p>
  </article>;
}

function RevenueTrend({ rows, loading, range }) {
  const points = rows.slice(-range);
  const width = 600;
  const height = 150;
  const padX = 8;
  const padY = 18;
  const max = Math.max(...points.map(point => Number(point.revenue) || 0), 1);
  const coordinates = points.map((point, index) => ({
    ...point,
    x: points.length <= 1 ? width / 2 : padX + index * (width - 2 * padX) / (points.length - 1),
    y: height - padY - ((Number(point.revenue) || 0) / max) * (height - 2 * padY),
  }));
  const path = coordinates.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const labels = [0, .2, .4, .6, .8, 1].map(position => coordinates[Math.round(position * Math.max(coordinates.length - 1, 0))]).filter(Boolean);
  const totalRevenue = points.reduce((sum, point) => sum + Number(point.revenue || 0), 0);

  return <section className="overflow-hidden rounded-[11px] border border-[#e6e7ea] bg-white">
    <div className="flex items-start justify-between gap-2 border-b border-[#f0f1f3] px-4 py-3"><div><h2 className="text-[12px] font-semibold text-[#25272c]">Revenue Trend <span className="font-normal text-[#747780]">(Last {range} Days)</span></h2><p className="mt-1 text-[9px] font-semibold text-[#f45100]">{formatMoney(totalRevenue)} paid revenue</p></div><span className="rounded-full bg-[#fff1e9] px-2 py-1 text-[8px] font-semibold text-[#d94c0a]">Paid sales</span></div>
    <div className="px-3 pb-3 pt-2">
      {loading ? <div className="h-[175px] animate-pulse rounded bg-slate-50" /> : points.length ? <>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-[145px] w-full overflow-visible" role="img" aria-label={`Revenue trend over the last ${range} days`}>
          {[.15, .38, .61, .84].map(line => <line key={line} x1="0" x2={width} y1={height * line} y2={height * line} stroke="#eceef0" strokeWidth="1" />)}
          <path d={path} fill="none" stroke="#ff5a00" strokeWidth="2.3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          {coordinates.map((point, index) => <circle key={`${point.date}-${index}`} cx={point.x} cy={point.y} r="2.1" fill="#ff5a00" />)}
        </svg>
        <div className="mt-1 flex justify-between px-1 text-[8px] text-[#858991]">{labels.map((point, index) => <span key={`${point.date}-${index}`}>{formatDate(point.date)}</span>)}</div>
      </> : <div className="flex h-[175px] items-center justify-center text-[10px] text-[#858991]">No paid revenue recorded in this period.</div>}
    </div>
  </section>;
}

export default function AdminAnalytics() {
  const today = new Date();
  const defaultEnd = toDateInput(today);
  const defaultStartDate = new Date(today); defaultStartDate.setDate(today.getDate() - 13);
  const [dateRange, setDateRange] = useState({ start: toDateInput(defaultStartDate), end: defaultEnd });
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const range = Math.max(1, Math.round((fromDateInput(dateRange.end) - fromDateInput(dateRange.start)) / 86400000) + 1);
  const { data: overviewResponse, loading: overviewLoading } = useFetch('/dashboard/overview');
  const { data: analyticsResponse, loading: analyticsLoading } = useFetch('/dashboard/analytics');
  const { data: ordersResponse, loading: ordersLoading } = useFetch('/orders', { params: { page: 1, limit: 100 } });
  const { data: productsResponse } = useFetch('/products', { params: { limit: 100 } });

  const overview = overviewResponse?.data ?? overviewResponse ?? {};
  const analytics = listFrom(analyticsResponse, 'data').sort((a, b) => new Date(a.date) - new Date(b.date));
  const orders = listFrom(ordersResponse, 'orders');
  const products = listFrom(productsResponse, 'products');
  const selectedRows = analytics.filter(row => {
    const value = toDateInput(new Date(row.date));
    return value >= dateRange.start && value <= dateRange.end;
  });
  const categoryPerformance = useMemo(() => {
    const groups = new Map();
    products.forEach(product => {
      const category = product.category?.name || product.Category?.name || 'Uncategorized';
      const group = groups.get(category) || { name: category, units: 0 };
      group.units += Number(product.totalSold || 0);
      groups.set(category, group);
    });
    return [...groups.values()].sort((a, b) => b.units - a.units).slice(0, 6);
  }, [products]);
  const totalUnits = categoryPerformance.reduce((sum, category) => sum + category.units, 0) || 1;
  const paidOrders = orders.filter(order => normalizeStatus(order.paymentStatus) === 'PAID');
  const paidOrderRate = orders.length ? Math.round(paidOrders.length / orders.length * 100) : 0;
  const avgOrderValue = paidOrders.length ? paidOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0) / paidOrders.length : 0;
  const ordersPageCount = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const currentOrdersPage = Math.min(ordersPage, ordersPageCount);
  const recentOrders = orders.slice((currentOrdersPage - 1) * PAGE_SIZE, currentOrdersPage * PAGE_SIZE);

  return <div className="mx-auto max-w-[1180px] space-y-3">
    <div className="flex items-end justify-between gap-3">
      <div><div className="flex items-center gap-1.5 text-[9px] text-[#7f838a]"><span>Dashboard</span><span>›</span><span className="text-[#ef5a18]">Analytics</span></div><h1 className="mt-1 text-[18px] font-semibold text-[#24262b]">Performance Intelligence</h1></div>
      <div className="hidden items-center gap-2 text-right sm:flex"><div className="text-[9px] text-[#858991]">Admin report</div></div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] text-[#6f737b]">Reporting: {dateLabel(dateRange.start)} – {dateLabel(dateRange.end)}</p><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setDateDialogOpen(true)} className="h-8 rounded-full border-[#e1e2e5] bg-white px-3 text-[9px] text-[#303238]"><CalendarDays className="mr-1.5 h-3.5 w-3.5" />Select Date Range</Button><Button type="button" onClick={() => window.print()} className="h-8 rounded-full bg-[#171819] px-3 text-[9px] text-white hover:bg-[#333]"><FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF Report</Button></div></div>

    <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
      <Metric label="Total Revenue" value={overviewLoading ? '—' : formatMoney(overview.totalRevenue)} note="All-time paid orders" icon={CircleDollarSign} />
      <Metric label="Total Orders" value={overviewLoading ? '—' : Number(overview.totalOrders || 0).toLocaleString()} note="All recorded order statuses" icon={ClipboardList} />
      <Metric label="Paid Order Rate" value={ordersLoading ? '—' : `${paidOrderRate}%`} note="Among latest 100 orders" icon={ShoppingBag} />
      <Metric label="Avg. Paid Order" value={ordersLoading ? '—' : formatMoney(avgOrderValue)} note="Among latest 100 orders" icon={Users} />
    </section>

    <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.5fr)_minmax(250px,.9fr)]">
      <RevenueTrend rows={selectedRows} loading={analyticsLoading} range={range} />
      <section className="overflow-hidden rounded-[11px] border border-[#e6e7ea] bg-white">
        <div className="border-b border-[#f0f1f3] px-4 py-3"><h2 className="text-[12px] font-semibold text-[#25272c]">Top Selling Categories</h2><p className="mt-1 text-[8px] text-[#858991]">Units sold across loaded products</p></div>
        <div className="space-y-2.5 p-4">{categoryPerformance.length ? categoryPerformance.map((category, index) => {
          const percent = Math.round(category.units / totalUnits * 100);
          const colors = ['#ff5a00', '#df6b2f', '#28a468', '#7c8798', '#f28a2c', '#678cc5'];
          return <div key={category.name}><div className="flex items-center justify-between gap-2 text-[9px]"><span className="truncate font-medium text-[#33353a]">{category.name}</span><span className="shrink-0 text-[#8a8e95]">{category.units} units ({percent}%)</span></div><div className="mt-1 h-[4px] rounded-full bg-[#f0f1f2]"><div className="h-full rounded-full" style={{ width: `${percent}%`, background: colors[index % colors.length] }} /></div></div>;
        }) : <p className="py-8 text-center text-[10px] text-[#858991]">No category sales data available.</p>}</div>
      </section>
    </div>

    <section className="overflow-hidden rounded-[11px] border border-[#e6e7ea] bg-white">
      <div className="flex items-center justify-between border-b border-[#f0f1f3] px-4 py-3"><h2 className="text-[12px] font-semibold text-[#25272c]">Recent Orders</h2><Link to="/admin/orders" className="rounded-full border border-[#dedfe2] px-3 py-1 text-[8px] text-[#35373c] hover:bg-[#f8f8f9]">View All Orders</Link></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="bg-[#f8f9fa] text-[8px] uppercase tracking-[.025em] text-[#777b83]"><th className="px-3 py-2.5">Order ID</th><th className="px-3 py-2.5">Customer</th><th className="px-3 py-2.5">Product</th><th className="px-3 py-2.5">Amount</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Date</th><th className="px-3 py-2.5">Actions</th></tr></thead><tbody>
        {ordersLoading ? [...Array(4)].map((_, index) => <tr key={index}><td colSpan={7} className="px-3 py-3"><div className="h-3 animate-pulse rounded bg-slate-100" /></td></tr>) : recentOrders.length ? recentOrders.map(order => {
          const customer = order.user || order.User || {};
          const items = order.items || order.OrderItems || [];
          const status = normalizeStatus(order.orderStatus);
          const color = status === 'DELIVERED' ? 'bg-[#e9f8ef] text-[#27834d]' : status === 'CANCELLED' ? 'bg-[#fff0e9] text-[#b64b19]' : 'bg-[#fff0e7] text-[#bd4c13]';
          return <tr key={order.orderId} className="border-t border-[#f0f1f3] text-[9px] text-[#35373c]"><td className="whitespace-nowrap px-3 py-2.5 font-semibold">{order.orderNumber || `#${order.orderId}`}</td><td className="px-3 py-2.5">{customer.fullName || customer.email || '—'}</td><td className="max-w-[160px] truncate px-3 py-2.5">{items[0]?.productName || '—'}</td><td className="whitespace-nowrap px-3 py-2.5 font-semibold">{formatMoney(order.totalAmount)}</td><td className="px-3 py-2.5"><span className={`rounded-full px-2 py-1 text-[8px] font-semibold capitalize ${color}`}>{status.toLowerCase()}</span></td><td className="whitespace-nowrap px-3 py-2.5 text-[#858991]">{order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td><td className="px-3 py-2.5"><Link to="/admin/orders" aria-label={`View ${order.orderNumber}`} className="inline-flex h-6 w-7 items-center justify-center rounded-full border border-[#e1e2e5] text-[#686c73]"><Eye className="h-3 w-3" /></Link></td></tr>;
        }) : <tr><td colSpan={7} className="px-3 py-8 text-center text-[10px] text-[#858991]">No recent orders.</td></tr>}
      </tbody></table></div>
      <div className="flex flex-col items-center justify-between gap-2 border-t border-[#f0f1f3] px-4 py-2.5 sm:flex-row"><p className="text-[9px] text-[#858991]">Showing {orders.length ? (currentOrdersPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentOrdersPage * PAGE_SIZE, orders.length)} of {orders.length.toLocaleString()} loaded orders</p><div className="flex items-center gap-1.5"><Button type="button" variant="outline" disabled={currentOrdersPage <= 1 || ordersLoading} onClick={() => setOrdersPage(currentOrdersPage - 1)} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]">Previous</Button><span className="px-1 text-[10px] text-[#686c73]">{currentOrdersPage} / {ordersPageCount}</span><Button type="button" variant="outline" disabled={currentOrdersPage >= ordersPageCount || ordersLoading} onClick={() => setOrdersPage(currentOrdersPage + 1)} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]">Next</Button></div></div>
    </section>
    <p className="flex items-center gap-1 text-[8px] text-[#91949b]"><BarChart3 className="h-3 w-3" />Conversion rate and visit-based metrics aren’t available because the app does not collect site analytics.</p>
    {dateDialogOpen && <DateRangeDialog initialStart={dateRange.start} initialEnd={dateRange.end} onClose={() => setDateDialogOpen(false)} onApply={(start, end) => { setDateRange({ start, end }); setDateDialogOpen(false); }} />}
  </div>;
}
