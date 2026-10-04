import { useMemo, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { Search, Users, UserPlus, UserRoundCheck, Repeat2, Download, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 12;

function unwrapUsers(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload)) return payload;
  return [];
}

function unwrapOrders(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload)) return payload;
  return [];
}

function escapeCsv(value) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }
function formatMoney(value) { return `QAR ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }
function formatDate(value) { return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

function CustomerMetric({ label, value, note, icon: Icon }) {
  return <article className="rounded-[11px] border border-[#e8e9ec] bg-white px-4 py-3.5">
    <div className="flex items-center justify-between"><p className="text-[10px] font-medium uppercase tracking-[.035em] text-[#757982]">{label}</p><Icon className="h-4 w-4 text-[#989ba2]" strokeWidth={1.7} /></div>
    <p className="mt-2 text-[24px] font-semibold leading-none tracking-[-.04em] text-[#191b20]">{value}</p>
    <p className="mt-2 text-[9px] text-[#858991]">{note}</p>
  </article>;
}

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { data, loading, refetch } = useFetch('/auth/users', { params: { search, limit: 1000, role: 'customer' } });
  const { data: orderData } = useFetch('/orders', { params: { page: 1, limit: 100 } });
  const users = unwrapUsers(data);
  const recentOrders = unwrapOrders(orderData);
  const totalCustomers = data?.data?.pagination?.total ?? data?.pagination?.total ?? users.length;
  const orderStats = useMemo(() => {
    const result = new Map();
    recentOrders.forEach(order => {
      const id = String(order.userId ?? order.user?.userId ?? order.User?.userId ?? '');
      if (!id) return;
      const current = result.get(id) || { count: 0, spent: 0 };
      current.count += 1;
      current.spent += Number(order.totalAmount || 0);
      result.set(id, current);
    });
    return result;
  }, [recentOrders]);

  const newThisMonth = users.filter(user => {
    const created = new Date(user.createdAt);
    const now = new Date();
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  }).length;
  const activeCustomers = users.filter(user => String(user.status).toLowerCase() === 'active').length;
  const returningInRecentOrders = new Set(recentOrders.filter(order => {
    const id = String(order.userId ?? order.user?.userId ?? order.User?.userId ?? '');
    return id && (orderStats.get(id)?.count || 0) > 1;
  }).map(order => String(order.userId ?? order.user?.userId ?? order.User?.userId))).size;

  const customerRows = useMemo(() => users.map(user => {
    const activity = orderStats.get(String(user.userId)) || { count: 0, spent: 0 };
    const created = new Date(user.createdAt);
    const now = new Date();
    const isNew = created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
    const segment = activity.count > 1 ? 'Returning' : isNew ? 'New This Month' : activity.count ? 'Recent Buyer' : 'No Recent Orders';
    return { ...user, recentOrderCount: activity.count, recentSpend: activity.spent, segment };
  }), [users, orderStats]);

  const pageCount = Math.max(1, Math.ceil(customerRows.length / PAGE_SIZE));
  const pageUsers = customerRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'customer', status: 'active', password: '' });

  const openCreate = () => {
    setEditUser(null);
    setForm({ fullName: '', email: '', phone: '', role: 'customer', status: 'active', password: '' });
    setOpen(true);
  };
  const openEdit = user => {
    setEditUser(user);
    setForm({ fullName: user.fullName, email: user.email, phone: user.phone || '', role: user.role, status: user.status, password: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editUser) {
        await api.patch(`/auth/users/${editUser.userId}`, payload);
        toast({ title: 'Customer updated' });
      } else {
        await api.post('/auth/users', payload);
        toast({ title: 'Customer created' });
      }
      setOpen(false);
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    } finally { setSaving(false); }
  };

  const handleDelete = async userId => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      toast({ title: 'Customer deleted' });
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    }
  };

  const exportCustomers = () => {
    const headers = ['Customer ID', 'Name', 'Email', 'Phone', 'Recent Orders', 'Recent Spend', 'Status', 'Joined Date'];
    const lines = customerRows.map(user => [
      `CUST-${user.userId}`, user.fullName, user.email, user.phone,
      user.recentOrderCount, user.recentSpend, user.status, formatDate(user.createdAt),
    ].map(escapeCsv).join(','));
    const blob = new Blob([[headers.map(escapeCsv).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nova-customers.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return <div className="mx-auto max-w-[1180px] space-y-3">
    <div className="flex items-end justify-between gap-3">
      <div><div className="flex items-center gap-1.5 text-[9px] text-[#7f838a]"><span>Dashboard</span><ChevronRight className="h-3 w-3" /><span className="text-[#ef5a18]">Customers</span></div><h1 className="mt-1 text-[18px] font-semibold text-[#24262b]">Customers Registry</h1></div>
      <Button type="button" onClick={openCreate} className="h-8 rounded-full bg-[#171819] px-3 text-[10px] text-white hover:bg-[#333]"><UserPlus className="mr-1.5 h-3.5 w-3.5" />Add Customer</Button>
    </div>

    <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
      <CustomerMetric label="Total Customers" value={Number(totalCustomers).toLocaleString()} note="Registered customer accounts" icon={Users} />
      <CustomerMetric label="New This Month" value={newThisMonth.toLocaleString()} note="Joined in the current month" icon={UserPlus} />
      <CustomerMetric label="Active Accounts" value={activeCustomers.toLocaleString()} note="Currently active customers" icon={UserRoundCheck} />
      <CustomerMetric label="Returning Customers" value={returningInRecentOrders.toLocaleString()} note="From the latest 100 orders" icon={Repeat2} />
    </section>

    <section className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_auto]">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999da4]" /><Input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search by Name, Email, or Customer ID" className="h-9 rounded-[8px] border-[#e6e7ea] bg-white pl-9 text-[10px] placeholder:text-[#92959c]" /></div>
      <Button type="button" onClick={exportCustomers} className="h-9 rounded-[8px] bg-[#171819] px-3 text-[10px] text-white hover:bg-[#333]"><Download className="mr-1.5 h-3.5 w-3.5" />Export Customers</Button>
    </section>

    <section className="overflow-hidden rounded-[11px] border border-[#e8e9ec] bg-white">
      <div className="flex items-center justify-between border-b border-[#f0f1f3] px-4 py-3"><h2 className="text-[13px] font-semibold text-[#27292e]">Active Accounts</h2><span className="text-[9px] text-[#858991]">Order activity uses the latest 100 orders</span></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead><tr className="bg-[#f8f9fa] text-[8px] font-medium uppercase tracking-[.025em] text-[#777b83]"><th className="px-3 py-2.5">Customer ID</th><th className="px-3 py-2.5">Name</th><th className="px-3 py-2.5">Email</th><th className="px-3 py-2.5">Phone</th><th className="px-3 py-2.5">Recent Orders</th><th className="px-3 py-2.5">Recent Spend</th><th className="px-3 py-2.5">Segment</th><th className="px-3 py-2.5">Joined Date</th><th className="px-3 py-2.5">Actions</th></tr></thead>
          <tbody>
            {loading ? [...Array(8)].map((_, index) => <tr key={index}><td colSpan={9} className="px-3 py-3"><div className="h-3 animate-pulse rounded bg-slate-100" /></td></tr>) : pageUsers.length === 0 ? <tr><td colSpan={9} className="px-3 py-10 text-center text-xs text-[#858991]"><Users className="mx-auto mb-2 h-7 w-7 opacity-40" />No customers found.</td></tr> : pageUsers.map(user => (
              <tr key={user.userId} className="border-t border-[#f0f1f3] text-[9px] text-[#35373c] hover:bg-[#fcfcfd]">
                <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-[#202126]">CUST-{user.userId}</td>
                <td className="max-w-[140px] truncate px-3 py-2.5 font-medium text-[#303239]">{user.fullName}</td>
                <td className="max-w-[180px] truncate px-3 py-2.5">{user.email}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-[#797d85]">{user.phone || '—'}</td>
                <td className="px-3 py-2.5">{user.recentOrderCount}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{formatMoney(user.recentSpend)}</td>
                <td className="px-3 py-2.5"><span className="inline-flex whitespace-nowrap rounded-full bg-[#fff0e7] px-2 py-1 text-[8px] font-semibold text-[#aa4e1d]">{user.segment}</span></td>
                <td className="whitespace-nowrap px-3 py-2.5 text-[#797d85]">{formatDate(user.createdAt)}</td>
                <td className="px-3 py-2.5"><div className="flex gap-1"><Button type="button" variant="outline" onClick={() => openEdit(user)} className="h-7 w-7 rounded-full border-[#e1e2e5] p-0 text-[#656971]" aria-label={`Edit ${user.fullName}`}><Pencil className="h-3 w-3" /></Button><Button type="button" variant="outline" onClick={() => handleDelete(user.userId)} className="h-7 w-7 rounded-full border-[#f0dddd] p-0 text-[#c64b4b]" aria-label={`Delete ${user.fullName}`}><Trash2 className="h-3 w-3" /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-between gap-2 border-t border-[#f0f1f3] px-4 py-2.5 sm:flex-row"><p className="text-[9px] text-[#858991]">Showing {customerRows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, customerRows.length)} of {customerRows.length.toLocaleString()} customers</p><div className="flex items-center gap-1.5"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]"><ChevronLeft className="mr-1 h-3 w-3" />Previous</Button><span className="px-1 text-[10px] text-[#686c73]">{page} / {pageCount}</span><Button type="button" variant="outline" disabled={page >= pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]">Next<ChevronRight className="ml-1 h-3 w-3" /></Button></div></div>
    </section>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[88vh] max-w-md overflow-y-auto rounded-[16px] border-[#e6e7ea]">
        <DialogHeader><DialogTitle className="text-lg font-semibold text-[#24262b]">{editUser ? 'Edit Customer' : 'Add Customer'}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1"><Label>Full Name</Label><Input value={form.fullName} onChange={event => setForm(current => ({ ...current, fullName: event.target.value }))} /></div>
          <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} /></div>
          <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} /></div>
          <div className="space-y-1"><Label>{editUser ? 'New Password (leave blank to keep)' : 'Password'}</Label><Input type="password" value={form.password} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><Label>Role</Label><Select value={form.role} onValueChange={value => setForm(current => ({ ...current, role: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="customer">Customer</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></div><div className="space-y-1"><Label>Status</Label><Select value={form.status} onValueChange={value => setForm(current => ({ ...current, status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select></div></div>
        </div>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="button" onClick={handleSave} disabled={saving} className="bg-[#171819] text-white hover:bg-[#333]">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editUser ? 'Update' : 'Create'}</Button></div>
      </DialogContent>
    </Dialog>
  </div>;
}
