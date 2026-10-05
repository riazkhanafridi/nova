import { useMemo, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { Plus, Pencil, Trash2, Search, ChevronRight, Wrench, Loader2 } from 'lucide-react';

const EMPTY_FORM = { name: '', description: '', price: '', duration: '', status: 'Active' };
const PAGE_SIZE = 5;

function unwrapServices(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.services)) return payload.services;
  return [];
}

export default function AdminServices() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { data, loading, refetch } = useFetch('/services', { params: { includeInactive: true } });
  const services = unwrapServices(data);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return services;
    return services.filter(service => [service.name, service.description, service.duration].some(value => String(value || '').toLowerCase().includes(query)));
  }, [services, search]);
  const pageCount = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageServices = filteredServices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit = service => { setEditing(service); setForm({ name: service.name, description: service.description || '', price: String(service.price || ''), duration: service.duration || '', status: service.isActive ? 'Active' : 'Inactive' }); setOpen(true); };

  const saveService = async () => {
    if (!form.name.trim() || !form.price || !form.duration.trim()) {
      toast({ variant: 'destructive', title: 'Complete the required fields' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        duration: form.duration.trim(),
        turnaround: form.duration.trim(),
        isActive: form.status === 'Active',
      };

      if (editing) {
        await api.patch(`/services/${editing.serviceId}`, payload);
        toast({ title: 'Service updated' });
      } else {
        await api.post('/services', payload);
        toast({ title: 'Service created' });
      }

      setOpen(false);
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Could not save service' });
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (service) => {
    if (!confirm(`Delete “${service.name}”?`)) return;
    try {
      await api.delete(`/services/${service.serviceId}`);
      toast({ title: 'Service deleted' });
      setPage(Math.min(currentPage, Math.max(1, Math.ceil((filteredServices.length - 1) / PAGE_SIZE))));
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Could not delete service' });
    }
  };

  const inputClass = 'h-8 rounded-[9px] border-[#e3e5e8] bg-white text-[10px] text-[#303239] placeholder:text-[#a1a4aa] focus-visible:ring-1 focus-visible:ring-[#ff6a1a]';

  return <div className="mx-auto max-w-[1180px] space-y-3">
    <div className="flex items-end justify-between gap-3">
      <div><div className="flex items-center gap-1.5 text-[9px] text-[#7f838a]"><span>Dashboard</span><ChevronRight className="h-3 w-3" /><span className="text-[#ef5a18]">Services</span></div><h1 className="mt-1 text-[18px] font-semibold text-[#24262b]">Service Catalog</h1></div>
      <Button type="button" onClick={openCreate} className="h-8 rounded-full bg-[#171819] px-3 text-[10px] text-white hover:bg-[#333]"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Service</Button>
    </div>

    <div className="relative max-w-[300px]"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999da4]" /><Input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search services..." className="h-9 rounded-[8px] border-[#e6e7ea] bg-white pl-9 text-[10px] placeholder:text-[#92959c]" /></div>

    <section className="overflow-hidden rounded-[11px] border border-[#e8e9ec] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead><tr className="bg-[#f8f9fa] text-[8px] font-medium uppercase tracking-[.025em] text-[#777b83]"><th className="px-3 py-2.5">Service Name</th><th className="px-3 py-2.5">Price</th><th className="px-3 py-2.5">Duration</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Actions</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={5} className="px-3 py-10 text-center text-xs text-[#858991]"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading services...</td></tr> : filteredServices.length === 0 ? <tr><td colSpan={5} className="px-3 py-10 text-center text-xs text-[#858991]"><Wrench className="mx-auto mb-2 h-7 w-7 opacity-40" />No services match your search.</td></tr> : pageServices.map(service => <tr key={service.serviceId} className="border-t border-[#f0f1f3] text-[9px] text-[#35373c] hover:bg-[#fcfcfd]">
            <td className="max-w-[420px] px-3 py-2.5"><p className="font-semibold text-[#202126]">{service.name}</p><p className="mt-0.5 line-clamp-1 text-[8px] text-[#92959c]">{service.description}</p></td>
            <td className="whitespace-nowrap px-3 py-2.5 font-semibold">QAR {Number(service.price).toLocaleString()}</td>
            <td className="whitespace-nowrap px-3 py-2.5 text-[#555961]">{service.duration}</td>
            <td className="px-3 py-2.5"><span className={`inline-flex rounded-full px-2 py-1 text-[8px] font-semibold ${service.isActive ? 'bg-[#fff0e7] text-[#aa4e1d]' : 'bg-[#eef0f2] text-[#70747b]'}`}>{service.isActive ? 'Active' : 'Inactive'}</span></td>
            <td className="px-3 py-2.5"><div className="flex items-center gap-1"><Button type="button" variant="outline" onClick={() => openEdit(service)} className="h-7 rounded-full border-[#dfe1e4] px-2.5 text-[9px] text-[#303238]"><Pencil className="mr-1 h-3 w-3" />Edit</Button><Button type="button" variant="ghost" onClick={() => deleteService(service)} className="h-7 px-2 text-[9px] text-[#35373c] hover:text-red-600"><Trash2 className="mr-1 h-3 w-3" />Delete</Button></div></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-between gap-2 border-t border-[#f0f1f3] px-4 py-2.5 sm:flex-row"><p className="text-[9px] text-[#858991]">Showing {filteredServices.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filteredServices.length)} of {filteredServices.length.toLocaleString()} services</p><div className="flex items-center gap-1.5"><Button type="button" variant="outline" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]">Previous</Button><span className="px-1 text-[10px] text-[#686c73]">{currentPage} / {pageCount}</span><Button type="button" variant="outline" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]">Next</Button></div></div>
    </section>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[88vh] max-w-[420px] gap-0 overflow-y-auto rounded-[14px] border-[#e6e7ea] p-0">
        <DialogHeader className="flex-row items-center gap-2 border-b border-[#f0f1f3] px-4 py-3 text-left"><span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#fff0e8] text-[#f45100]"><Wrench className="h-3 w-3" /></span><DialogTitle className="text-[13px] font-semibold text-[#24262b]">{editing ? 'Edit Service' : 'Add New Service'}</DialogTitle></DialogHeader>
        <div className="space-y-3.5 px-4 py-4">
          <div className="space-y-1"><Label className="text-[9px] font-semibold text-[#34363b]">Service Name</Label><Input className={inputClass} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="e.g. Screen Protector Installation" /></div>
          <div className="space-y-1"><Label className="text-[9px] font-semibold text-[#34363b]">Description</Label><textarea className="min-h-[34px] w-full resize-y rounded-[9px] border border-[#e3e5e8] px-2 py-2 text-[10px] text-[#303239] outline-none placeholder:text-[#a1a4aa] focus:border-[#ff9867]" value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} placeholder="Describe the service" /></div>
          <div className="grid grid-cols-2 gap-2"><div className="space-y-1"><Label className="text-[9px] font-semibold text-[#34363b]">Pricing (QAR)</Label><Input className={inputClass} type="number" min="0" value={form.price} onChange={event => setForm(current => ({ ...current, price: event.target.value }))} placeholder="0 for free" /></div><div className="space-y-1"><Label className="text-[9px] font-semibold text-[#34363b]">Availability / Duration</Label><Input className={inputClass} value={form.duration} onChange={event => setForm(current => ({ ...current, duration: event.target.value }))} placeholder="e.g. 45 mins" /></div></div>
          <div className="space-y-1"><Label className="text-[9px] font-semibold text-[#34363b]">Service Status</Label><div className="flex h-10 items-center justify-between rounded-[9px] border border-[#e3e5e8] px-2.5"><span className="flex items-center gap-1.5 text-[9px] font-medium text-[#34363b]"><span className={`h-1.5 w-1.5 rounded-full ${form.status === 'Active' ? 'bg-[#20a65a]' : 'bg-[#a1a4aa]'}`} />{form.status === 'Active' ? 'Active on Storefront' : 'Inactive on Storefront'}</span><button type="button" role="switch" aria-checked={form.status === 'Active'} aria-label="Service active on storefront" onClick={() => setForm(current => ({ ...current, status: current.status === 'Active' ? 'Inactive' : 'Active' }))} className={`relative h-[18px] w-[36px] rounded-full transition-colors ${form.status === 'Active' ? 'bg-[#ff5a00]' : 'bg-[#dfe2e6]'}`}><span className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform ${form.status === 'Active' ? 'translate-x-[20px]' : 'translate-x-[2px]'}`} /></button></div></div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#f0f1f3] bg-[#fbfbfc] px-4 py-3"><Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-8 rounded-full border-[#dfe1e4] px-3 text-[9px]">Cancel</Button><Button type="button" onClick={saveService} disabled={saving} className="h-8 rounded-full bg-[#ff5a00] px-3 text-[9px] text-white hover:bg-[#e85100]">{saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}{editing ? 'Save Changes' : 'Add Service'}</Button></div>
      </DialogContent>
    </Dialog>
  </div>;
}
