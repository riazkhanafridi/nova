import { useMemo, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/media';
import { Plus, Pencil, Trash2, Award, Loader2, Search, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 5;

function unwrapBrands(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.brands)) return payload.brands;
  return [];
}

function unwrapProducts(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function AdminBrands() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const { toast } = useToast();
  const { data, loading, refetch } = useFetch('/brands', { params: { includeInactive: true } });
  const { data: productResponse, loading: productsLoading } = useFetch('/products', { params: { limit: 100 } });
  const brands = unwrapBrands(data);
  const products = unwrapProducts(productResponse);
  const productCounts = useMemo(() => {
    const counts = new Map();
    products.forEach(product => {
      const id = String(product.brandId ?? product.brand?.brandId ?? '');
      if (id) counts.set(id, (counts.get(id) || 0) + 1);
    });
    return counts;
  }, [products]);
  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return brands;
    return brands.filter(brand => [brand.name, brand.slug, brand.description].some(value => String(value || '').toLowerCase().includes(query)));
  }, [brands, search]);
  const pageCount = Math.max(1, Math.ceil(filteredBrands.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageBrands = filteredBrands.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCreate = () => { setEditItem(null); setForm({ name: '', description: '', isActive: true }); setImageFile(null); setCreateOpen(true); };
  const openEdit = brand => { setEditItem(brand); setForm({ name: brand.name, description: brand.description || '', isActive: Boolean(brand.isActive) }); setImageFile(null); setOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ variant: 'destructive', title: 'Brand name is required' }); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description);
      if (editItem) fd.append('isActive', String(form.isActive));
      if (imageFile) fd.append('logo', imageFile);
      if (editItem) {
        await api.patch(`/brands/${editItem.brandId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast({ title: 'Brand updated' });
      } else {
        await api.post('/brands', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast({ title: 'Brand created' });
      }
      setOpen(false);
      setCreateOpen(false);
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    } finally { setSaving(false); }
  };

  const handleDelete = async brand => {
    if (!confirm(`Delete “${brand.name}”?`)) return;
    try {
      await api.delete(`/brands/${brand.brandId}`);
      toast({ title: 'Brand deleted' });
      setPage(Math.min(currentPage, Math.max(1, Math.ceil((filteredBrands.length - 1) / PAGE_SIZE))));
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    }
  };

  const inputClass = 'h-9 rounded-[7px] border-[#e3e5e8] bg-white text-[11px] text-[#303239] placeholder:text-[#a1a4aa] focus-visible:ring-1 focus-visible:ring-[#ff6a1a]';

  return <div className="mx-auto max-w-[1180px] space-y-3">
    <div className="flex items-end justify-between gap-3">
      <div><p className="text-[9px] font-semibold uppercase tracking-[.08em] text-[#ef5a18]">Brand Management</p><h1 className="mt-1 text-[18px] font-semibold text-[#24262b]">Partner Brands Directory</h1></div>
      <Button type="button" onClick={openCreate} className="h-8 rounded-full bg-[#171819] px-3 text-[10px] text-white hover:bg-[#333]"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Brand</Button>
    </div>

    <div className="relative max-w-[300px]"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999da4]" /><Input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search brands..." className="h-9 rounded-[8px] border-[#e6e7ea] bg-white pl-9 text-[10px] placeholder:text-[#92959c]" /></div>

    {createOpen ? <section className="max-w-[760px] overflow-hidden rounded-[12px] border border-[#e2e3e6] bg-white px-4 py-3.5 sm:px-5">
      <div className="mb-3 border-b border-[#f0f1f3] pb-2"><h2 className="text-[13px] font-semibold text-[#25272c]">Add Brand</h2><p className="mt-0.5 text-[9px] text-[#858991]">Create a new partner brand directory entry.</p></div>
        <div className="space-y-2.5">
          <div className="space-y-1"><Label className="text-[9px] font-semibold uppercase text-[#555960]">Brand Name</Label><Input className={inputClass} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="e.g. Sony, Bose" /></div>
          <div className="space-y-1"><Label className="text-[9px] font-semibold uppercase text-[#555960]">Website or Description</Label><Input className={inputClass} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} placeholder="e.g. www.sony.com" /></div>
          <div className="space-y-1"><Label className="text-[9px] font-semibold uppercase text-[#555960]">Brand Image</Label><input type="file" accept="image/*" onChange={event => setImageFile(event.target.files?.[0] || null)} className="block w-full cursor-pointer rounded-lg border border-[#e3e5e8] bg-[#f8f9fa] px-3 py-2 text-[10px] text-[#656971] file:mr-3 file:rounded-md file:border-0 file:bg-[#eeeef0] file:px-3 file:py-1.5 file:text-[10px] file:font-medium" /></div>
      </div>
      <div className="mt-3 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="h-8 rounded-full border-[#dfe1e4] px-3 text-[9px] text-[#303238]">Cancel</Button><Button type="button" onClick={handleSave} disabled={saving} className="h-8 rounded-full bg-black px-3 text-[9px] text-white hover:bg-[#333]">{saving ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : null}Add Brand</Button></div>
    </section> : <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {loading ? [...Array(8)].map((_, index) => <div key={index} className="h-[150px] animate-pulse rounded-[11px] border border-[#e8e9ec] bg-white p-3"><div className="h-[70px] rounded bg-slate-100" /><div className="mt-3 h-3 w-1/2 rounded bg-slate-100" /></div>) : pageBrands.length === 0 ? <div className="col-span-full rounded-[11px] border border-[#e8e9ec] bg-white py-12 text-center text-xs text-[#858991]"><Award className="mx-auto mb-2 h-8 w-8 opacity-40" />No brands found.</div> : pageBrands.map(brand => {
        const logo = getMediaUrl(brand.logo);
        const productCount = productsLoading ? null : productCounts.get(String(brand.brandId)) || 0;
        return <article key={brand.brandId} className="overflow-hidden rounded-[11px] border border-[#e5e6e9] bg-white p-2.5 transition-shadow hover:shadow-[0_6px_18px_rgba(20,24,33,.07)]">
          <div className="relative flex h-[74px] items-center justify-center overflow-hidden bg-[#f5f6f7]">
            {logo ? <img src={logo} alt={`${brand.name} logo`} className="h-full w-full object-contain p-2" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#9da1a8]"><Award className="h-6 w-6" /></div>}
          </div>
          <div className="mt-2 flex items-center justify-between gap-1.5"><h2 className="truncate text-[10px] font-semibold text-[#25272c]">{brand.name}</h2><span className={`shrink-0 rounded-full px-2 py-0.5 text-[7px] font-semibold ${brand.isActive ? 'bg-[#fff0e7] text-[#a94b17]' : 'bg-[#eef0f2] text-[#747880]'}`}>{brand.isActive ? 'Active' : 'Inactive'}</span></div>
          <p className="mt-0.5 truncate text-[8px] text-[#858991]">Origin: {brand.origin || brand.country || '—'}</p>
          <p className="mt-0.5 border-b border-[#f0f1f3] pb-1.5 text-[8px] font-medium text-[#ef5a18]">{productCount === null ? 'Loading products…' : `${productCount} Products listed`}</p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5"><Button type="button" variant="outline" onClick={() => openEdit(brand)} className="h-6 rounded-full border-[#dfe1e4] px-2 text-[8px] text-[#303238]">Edit</Button><Button type="button" variant="outline" onClick={() => handleDelete(brand)} className="h-6 rounded-full border-[#f0dddd] px-2 text-[8px] text-[#d35353] hover:bg-[#fff6f6]">Delete</Button></div>
        </article>;
      })}
    </section>}

    {!createOpen && <div className="flex flex-col items-center justify-between gap-2 py-1 sm:flex-row"><p className="text-[9px] text-[#858991]">Showing {filteredBrands.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filteredBrands.length)} of {filteredBrands.length.toLocaleString()} brands <span className="ml-1">· product counts reflect loaded catalog items</span></p><div className="flex items-center gap-1.5"><Button type="button" variant="outline" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]">Previous</Button><span className="px-1 text-[10px] text-[#686c73]">{currentPage} / {pageCount}</span><Button type="button" variant="outline" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]">Next</Button></div></div>}

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[88vh] max-w-md overflow-y-auto rounded-[16px] border-[#e6e7ea]">
        <DialogHeader><DialogTitle className="text-lg font-semibold text-[#24262b]">{editItem ? 'Edit Brand' : 'Add New Brand'}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1"><Label>Brand Name *</Label><Input className={inputClass} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="e.g. Nova" /></div>
          <div className="space-y-1"><Label>Description</Label><textarea className="min-h-[76px] w-full rounded-[7px] border border-[#e3e5e8] px-3 py-2 text-[11px] outline-none focus:border-[#ff9867]" value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} /></div>
          {editItem && <div className="space-y-1"><Label>Status</Label><Select value={form.isActive ? 'active' : 'inactive'} onValueChange={value => setForm(current => ({ ...current, isActive: value === 'active' }))}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>}
          <div className="space-y-1"><Label>Brand Logo</Label><input type="file" accept="image/*" onChange={event => setImageFile(event.target.files?.[0] || null)} className="block w-full cursor-pointer rounded-lg border border-[#e3e5e8] bg-[#f8f9fa] px-3 py-2 text-[10px] text-[#656971] file:mr-3 file:rounded-md file:border-0 file:bg-[#eeeef0] file:px-3 file:py-1.5 file:text-[10px] file:font-medium" /></div>
        </div>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="button" onClick={handleSave} disabled={saving} className="bg-[#171819] text-white hover:bg-[#333]">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editItem ? <Pencil className="mr-2 h-3.5 w-3.5" /> : <Plus className="mr-2 h-3.5 w-3.5" />}{editItem ? 'Save Changes' : 'Create Brand'}</Button></div>
      </DialogContent>
    </Dialog>
  </div>;
}
