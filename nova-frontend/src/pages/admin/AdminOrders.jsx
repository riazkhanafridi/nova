import { useMemo, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { Eye, Loader2, Search, Truck, Clock3, CircleX, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
const normalizeStatus = value => String(value || '').toUpperCase();
const STATUS_COLOR = {
  PENDING: 'bg-[#fff0e7] text-[#bd4c13]', CONFIRMED: 'bg-[#edf3ff] text-[#365ed0]',
  PROCESSING: 'bg-[#fff5dc] text-[#a56b00]', SHIPPED: 'bg-[#f0edff] text-[#6849c8]',
  DELIVERED: 'bg-[#e9f8ef] text-[#27834d]', CANCELLED: 'bg-[#fff0e9] text-[#b64b19]',
  REFUNDED: 'bg-[#ffeaea] text-[#c83c3c]',
};
const PAYMENT_COLOR = { PAID: 'text-[#20a355]', PENDING: 'text-[#ef5b4c]', REFUNDED: 'text-[#ef5b4c]', FAILED: 'text-[#ef5b4c]' };

function orderList(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.orders)) return payload.data.orders;
  return [];
}

function customerOf(order) { return order.user || order.User || {}; }
function itemsOf(order) { return order.items || order.OrderItems || []; }
function formatMoney(value) { return `QAR ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function formatDate(value) { return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

function SummaryCard({ title, count, note, status, icon: Icon }) {
  return <article className="rounded-[11px] border border-[#e8e9ec] bg-white px-4 py-3.5">
    <div className="flex items-center justify-between gap-2"><p className="text-[11px] font-semibold text-[#303239]">{title}</p><span className={`rounded-full px-2 py-1 text-[8px] font-semibold ${STATUS_COLOR[status]}`}>{status.toLowerCase()}</span></div>
    <p className="mt-2 text-[25px] font-semibold leading-none tracking-[-.04em] text-[#191b20]">{count}</p>
      <p className="mt-2 flex items-center gap-1 text-[9px] text-[#878b92]"><Icon className="h-3 w-3" />{note}</p>
  </article>;
}

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);
  const [updating, setUpdating] = useState(null);
  const { toast } = useToast();
  const { data, loading, refetch } = useFetch('/orders', { params: { page: 1, limit: 100 } });

  const payload = data?.data ?? data;
  const allOrders = orderList(data);
  const summary = useMemo(() => ({
    delivered: allOrders.filter(order => normalizeStatus(order.orderStatus) === 'DELIVERED').length,
    pending: allOrders.filter(order => ['PENDING', 'CONFIRMED'].includes(normalizeStatus(order.orderStatus))).length,
    pendingPayments: allOrders.filter(order => normalizeStatus(order.paymentStatus) === 'PENDING').length,
    cancelled: allOrders.filter(order => ['CANCELLED', 'REFUNDED'].includes(normalizeStatus(order.orderStatus))).length,
  }), [allOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    const startDate = dateRange === '30' ? Date.now() - 30 * 24 * 60 * 60 * 1000 : dateRange === '7' ? Date.now() - 7 * 24 * 60 * 60 * 1000 : null;
    return allOrders.filter(order => {
      const status = normalizeStatus(order.orderStatus);
      const customer = customerOf(order);
      const productSearch = itemsOf(order).map(item => item.productName).join(' ');
      const matchesQuery = !query || [order.orderNumber, customer.fullName, customer.email, productSearch, order.orderId].some(value => String(value || '').toLowerCase().includes(query));
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      const matchesDate = !startDate || !order.createdAt || new Date(order.createdAt).getTime() >= startDate;
      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [allOrders, search, filterStatus, dateRange]);

  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pageOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const totalOrders = payload?.pagination?.total ?? filteredOrders.length;

  const changeSearch = value => { setSearch(value); setPage(1); };
  const changeStatusFilter = value => { setFilterStatus(value); setPage(1); };
  const changeDateFilter = value => { setDateRange(value); setPage(1); };

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { orderStatus: status });
      toast({ title: 'Order status updated' });
      setViewOrder(current => current ? { ...current, orderStatus: status } : current);
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    } finally { setUpdating(null); }
  };

  const updatePaymentStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { paymentStatus: status });
      toast({ title: 'Payment status updated' });
      setViewOrder(current => current ? { ...current, paymentStatus: status } : current);
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    } finally { setUpdating(null); }
  };

  return <div className="mx-auto max-w-[1180px] space-y-3">
    <div className="flex items-end justify-between gap-3">
      <div><div className="flex items-center gap-1.5 text-[9px] text-[#7f838a]"><span>Dashboard</span><ChevronRight className="h-3 w-3" /><span className="text-[#ef5a18]">Orders</span></div><h1 className="mt-1 text-[18px] font-semibold text-[#24262b]">Orders Directory</h1></div>
      <p className="hidden text-[10px] text-[#858991] sm:block">{Number(totalOrders).toLocaleString()} total orders</p>
    </div>

    <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard title="Delivered Orders" count={summary.delivered.toLocaleString()} note="Among the latest 100 orders" status="DELIVERED" icon={Truck} />
      <SummaryCard title="Pending Orders" count={summary.pending.toLocaleString()} note="Awaiting payment or confirmation" status="PENDING" icon={Clock3} />
      <SummaryCard title="Pending Payments" count={summary.pendingPayments.toLocaleString()} note="Orders awaiting payment" status="PENDING" icon={CreditCard} />
      <SummaryCard title="Canceled Orders" count={summary.cancelled.toLocaleString()} note="Canceled or refunded orders" status="CANCELLED" icon={CircleX} />
    </section>

    <section className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_150px]">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999da4]" /><Input value={search} onChange={event => changeSearch(event.target.value)} placeholder="Search by Order ID or Customer" className="h-9 rounded-[8px] border-[#e6e7ea] bg-white pl-9 text-[10px] placeholder:text-[#92959c]" /></div>
      <Select value={filterStatus} onValueChange={changeStatusFilter}><SelectTrigger className="h-9 rounded-[8px] border-[#e6e7ea] bg-white text-[10px] text-[#42454b]"><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem>{ORDER_STATUSES.map(status => <SelectItem key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</SelectItem>)}</SelectContent></Select>
      <Select value={dateRange} onValueChange={changeDateFilter}><SelectTrigger className="h-9 rounded-[8px] border-[#e6e7ea] bg-white text-[10px] text-[#42454b]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">Last 30 Days</SelectItem><SelectItem value="7">Last 7 Days</SelectItem><SelectItem value="all">All Time</SelectItem></SelectContent></Select>
    </section>

    <section className="overflow-hidden rounded-[11px] border border-[#e8e9ec] bg-white">
      <div className="flex items-center justify-between border-b border-[#f0f1f3] px-4 py-3"><h2 className="text-[13px] font-semibold text-[#27292e]">All Orders Management</h2><span className="text-[9px] text-[#858991]">Latest 100 · {filteredOrders.length.toLocaleString()} results</span></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left">
          <thead><tr className="bg-[#f8f9fa] text-[8px] font-medium uppercase tracking-[.025em] text-[#777b83]"><th className="px-3 py-2.5">Order ID</th><th className="px-3 py-2.5">Customer Name</th><th className="px-3 py-2.5">Products</th><th className="px-3 py-2.5">Total Amount</th><th className="px-3 py-2.5">Payment</th><th className="px-3 py-2.5">Order Status</th><th className="px-3 py-2.5">Date</th><th className="px-3 py-2.5">Actions</th></tr></thead>
          <tbody>
            {loading ? [...Array(7)].map((_, index) => <tr key={index}><td colSpan={8} className="px-3 py-3"><div className="h-3 animate-pulse rounded bg-slate-100" /></td></tr>) : pageOrders.length === 0 ? <tr><td colSpan={8} className="px-3 py-10 text-center text-xs text-[#858991]">No orders match these filters.</td></tr> : pageOrders.map(order => {
              const customer = customerOf(order);
              const items = itemsOf(order);
              const productText = items.length ? `${items.reduce((count, item) => count + Number(item.quantity || 0), 0)}x ${items[0].productName}${items.length > 1 ? `, +${items.length - 1} more` : ''}` : '—';
              const status = normalizeStatus(order.orderStatus);
              const payment = normalizeStatus(order.paymentStatus);
              return <tr key={order.orderId} className="border-t border-[#f0f1f3] text-[9px] text-[#35373c] hover:bg-[#fcfcfd]">
                <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-[#202126]">{order.orderNumber || `#${order.orderId}`}</td>
                <td className="max-w-[135px] truncate px-3 py-2.5">{customer.fullName || customer.email || '—'}</td>
                <td className="max-w-[150px] truncate px-3 py-2.5">{productText}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{formatMoney(order.totalAmount)}</td>
                <td className={`px-3 py-2.5 font-medium ${PAYMENT_COLOR[payment] || 'text-[#666a72]'}`}>{payment ? payment.charAt(0) + payment.slice(1).toLowerCase() : '—'}</td>
                <td className="px-3 py-2.5"><span className={`inline-flex rounded-full px-2 py-1 text-[8px] font-semibold ${STATUS_COLOR[status] || 'bg-slate-100 text-slate-600'}`}>{status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Unknown'}</span></td>
                <td className="whitespace-nowrap px-3 py-2.5 text-[#797d85]">{formatDate(order.createdAt)}</td>
                <td className="px-3 py-2.5"><Button type="button" variant="outline" onClick={() => setViewOrder(order)} className="h-7 rounded-full border-[#dfe1e4] px-2.5 text-[9px] text-[#303238]"><Eye className="mr-1 h-3 w-3" />View</Button></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-between gap-2 border-t border-[#f0f1f3] px-4 py-2.5 sm:flex-row">
        <p className="text-[9px] text-[#858991]">Showing {filteredOrders.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length.toLocaleString()} results</p>
        <div className="flex items-center gap-1.5"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]">Previous</Button><span className="px-1 text-[10px] text-[#686c73]">{page} / {pageCount}</span><Button type="button" variant="outline" disabled={page >= pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]">Next</Button></div>
      </div>
    </section>

    <Dialog open={!!viewOrder} onOpenChange={open => !open && setViewOrder(null)}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto rounded-[16px] border-[#e6e7ea]">
        <DialogHeader><DialogTitle className="text-lg font-semibold text-[#24262b]">Order {viewOrder?.orderNumber || ''}</DialogTitle></DialogHeader>
        {viewOrder && <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 rounded-[10px] bg-[#f8f9fa] p-3 text-xs"><div><p className="text-[10px] text-[#858991]">Customer</p><p className="mt-1 font-medium">{customerOf(viewOrder).fullName || '—'}</p><p className="text-[10px] text-[#858991]">{customerOf(viewOrder).email}</p></div><div><p className="text-[10px] text-[#858991]">Order date</p><p className="mt-1 font-medium">{formatDate(viewOrder.createdAt)}</p></div><div><p className="text-[10px] text-[#858991]">Update payment status</p><Select value={normalizeStatus(viewOrder.paymentStatus) || 'PENDING'} onValueChange={value => updatePaymentStatus(viewOrder.orderId, value)} disabled={updating === viewOrder.orderId}><SelectTrigger className="mt-1 h-8 bg-white text-xs capitalize"><SelectValue />{updating === viewOrder.orderId && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}</SelectTrigger><SelectContent>{PAYMENT_STATUSES.map(status => <SelectItem key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</SelectItem>)}</SelectContent></Select></div><div><p className="text-[10px] text-[#858991]">Update order status</p><Select value={normalizeStatus(viewOrder.orderStatus)} onValueChange={value => updateStatus(viewOrder.orderId, value)} disabled={updating === viewOrder.orderId}><SelectTrigger className="mt-1 h-8 bg-white text-xs capitalize"><SelectValue />{updating === viewOrder.orderId && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}</SelectTrigger><SelectContent>{ORDER_STATUSES.map(status => <SelectItem key={status} value={status}>{status.toLowerCase()}</SelectItem>)}</SelectContent></Select></div></div>
          {viewOrder.shippingAddress && <div className="rounded-[10px] border border-[#eceef0] p-3 text-xs"><p className="mb-1 text-[10px] text-[#858991]">Shipping address</p><p className="font-medium">{[viewOrder.shippingAddress.street, viewOrder.shippingAddress.city, viewOrder.shippingAddress.country].filter(Boolean).join(', ')}</p></div>}
          <div><h3 className="mb-2 text-xs font-semibold">Products</h3><div className="divide-y divide-[#eff0f2]">{itemsOf(viewOrder).map(item => <div key={item.orderItemId} className="flex items-center justify-between py-2 text-xs"><div><p className="font-medium">{item.productName}</p><p className="text-[10px] text-[#858991]">Quantity: {item.quantity}</p></div><p className="font-medium">{formatMoney(item.totalPrice ?? (Number(item.unitPrice || item.price) * Number(item.quantity || 0)))}</p></div>)}</div></div>
          <div className="border-t border-[#eceef0] pt-3 text-xs"><div className="flex justify-between text-[#858991]"><span>Subtotal</span><span>{formatMoney(viewOrder.subTotal)}</span></div><div className="mt-2 flex justify-between text-base font-semibold"><span>Total</span><span>{formatMoney(viewOrder.totalAmount)}</span></div></div>
        </div>}
      </DialogContent>
    </Dialog>
  </div>;
}
