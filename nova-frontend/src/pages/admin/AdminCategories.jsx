import { useMemo, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { Plus, Pencil, Trash2, Tag, Loader2, Search, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 12;

function unwrapCategories(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.categories)) return payload.categories;
  return [];
}

function unwrapProducts(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload)) return payload;
  return [];
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminCategories() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', parentId: '', sortOrder: '0', isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const { toast } = useToast();
  const { data, loading, refetch } = useFetch('/categories', { params: { includeInactive: true } });
  const { data: productResponse, loading: productsLoading } = useFetch('/products', { params: { limit: 100 } });
  const categories = unwrapCategories(data);
  const products = unwrapProducts(productResponse);
  const productsByCategory = useMemo(() => {
    const counts = new Map();
    products.forEach(product => {
      const id = String(product.categoryId ?? product.category?.categoryId ?? '');
      if (id) counts.set(id, (counts.get(id) || 0) + 1);
    });
    return counts;
  }, [products]);
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter(category => [category.name, category.slug, category.description, ...(category.subCategories || []).map(sub => sub.name)].some(value => String(value || '').toLowerCase().includes(query)));
  }, [categories, search]);
  const pageCount = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const pageCategories = filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const parentCategories = categories.filter(category => !category.parentId && category.categoryId !== editItem?.categoryId);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', description: '', parentId: '', sortOrder: '0', isActive: true });
    setImageFile(null);
    setOpen(true);
  };
  const openEdit = category => {
    setEditItem(category);
    setForm({ name: category.name, description: category.description || '', parentId: category.parentId ? String(category.parentId) : '', sortOrder: String(category.sortOrder ?? 0), isActive: Boolean(category.isActive) });
    setImageFile(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ variant: 'destructive', title: 'Category name is required' });
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description);
      fd.append('parentId', form.parentId);
      fd.append('sortOrder', form.sortOrder || '0');
      if (editItem) fd.append('isActive', String(form.isActive));
      if (imageFile) fd.append('image', imageFile);
      if (editItem) {
        await api.patch(`/categories/${editItem.categoryId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast({ title: 'Category updated' });
      } else {
        await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast({ title: 'Category created' });
      }
      setOpen(false);
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    } finally { setSaving(false); }
  };

  const handleDelete = async category => {
    if (!confirm(`Delete “${category.name}”?`)) return;
    try {
      await api.delete(`/categories/${category.categoryId}`);
      toast({ title: 'Category deleted' });
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    }
  };

  const inputClass = 'h-9 rounded-[7px] border-[#e3e5e8] bg-white text-[11px] text-[#303239] placeholder:text-[#a1a4aa] focus-visible:ring-1 focus-visible:ring-[#ff6a1a]';

  return <div className="mx-auto max-w-[1180px] space-y-3">
    <div className="flex items-end justify-between gap-3">
      <div><div className="flex items-center gap-1.5 text-[9px] text-[#7f838a]"><span>Dashboard</span><ChevronRight className="h-3 w-3" /><span className="text-[#ef5a18]">Categories</span></div><h1 className="mt-1 text-[18px] font-semibold text-[#24262b]">Category Management</h1></div>
      <Button type="button" onClick={openCreate} className="h-8 rounded-full bg-[#171819] px-3 text-[10px] text-white hover:bg-[#333]"><Plus className="mr-1.5 h-3.5 w-3.5" />Add New Category</Button>
    </div>

    <div className="relative max-w-[360px]"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999da4]" /><Input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search category portfolio..." className="h-9 rounded-[8px] border-[#e6e7ea] bg-white pl-9 text-[10px] placeholder:text-[#92959c]" /></div>

    <section className="overflow-hidden rounded-[11px] border border-[#e8e9ec] bg-white">
      <div className="border-b border-[#f0f1f3] px-4 py-3"><h2 className="text-[13px] font-semibold text-[#27292e]">Product Catalog Structures</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[810px] text-left">
          <thead><tr className="bg-[#f8f9fa] text-[8px] font-medium uppercase tracking-[.025em] text-[#777b83]"><th className="px-3 py-2.5">Category Name</th><th className="px-3 py-2.5">Slug</th><th className="px-3 py-2.5">Subcategories &amp; Clusters</th><th className="px-3 py-2.5">Product Count</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Actions</th></tr></thead>
          <tbody>
            {loading ? [...Array(8)].map((_, index) => <tr key={index}><td colSpan={6} className="px-3 py-3"><div className="h-3 animate-pulse rounded bg-slate-100" /></td></tr>) : pageCategories.length === 0 ? <tr><td colSpan={6} className="px-3 py-10 text-center text-xs text-[#858991]"><Tag className="mx-auto mb-2 h-7 w-7 opacity-40" />No categories found.</td></tr> : pageCategories.map(category => {
              const subcategories = category.subCategories || [];
              const productCount = productsLoading ? null : productsByCategory.get(String(category.categoryId)) || 0;
              return <tr key={category.categoryId} className="border-t border-[#f0f1f3] text-[9px] text-[#35373c] hover:bg-[#fcfcfd]">
                <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-[#202126]">{category.name}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-[#858991]">/{category.slug}</td>
                <td className="max-w-[230px] truncate px-3 py-2.5" title={subcategories.map(sub => sub.name).join(', ')}>{subcategories.length ? subcategories.map(sub => sub.name).join(', ') : '—'}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{productCount === null ? '…' : <>{productCount} <span className="font-normal text-[#777b83]">products</span></>}</td>
                <td className="px-3 py-2.5"><span className={`inline-flex rounded-full px-2 py-1 text-[8px] font-semibold ${category.isActive ? 'bg-[#fff0e7] text-[#aa4e1d]' : 'bg-[#f0f1f3] text-[#70747b]'}`}>{category.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-3 py-2.5"><div className="flex items-center gap-1"><Button type="button" variant="outline" onClick={() => openEdit(category)} className="h-7 rounded-full border-[#dfe1e4] px-2.5 text-[9px] text-[#303238]"><Pencil className="mr-1 h-3 w-3" />Edit</Button><Button type="button" variant="ghost" onClick={() => handleDelete(category)} className="h-7 px-1.5 text-[9px] text-[#35373c] hover:text-red-600"><Trash2 className="mr-1 h-3 w-3" />Delete</Button></div></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-between gap-2 border-t border-[#f0f1f3] px-4 py-2.5 sm:flex-row"><p className="text-[9px] text-[#858991]">Showing {filteredCategories.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredCategories.length)} of {filteredCategories.length.toLocaleString()} categories <span className="ml-1">· product counts reflect loaded catalog items</span></p><div className="flex items-center gap-1.5"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]">Previous</Button><span className="px-1 text-[10px] text-[#686c73]">{page} / {pageCount}</span><Button type="button" variant="outline" disabled={page >= pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))} className="h-7 rounded-full border-[#e1e2e5] px-2.5 text-[9px]">Next</Button></div></div>
    </section>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={`${editItem ? 'max-h-[88vh] max-w-md overflow-y-auto rounded-[16px]' : 'max-w-[360px] rounded-[16px] px-5 py-5 [&>button]:hidden'} border-[#e6e7ea]`}>
        <DialogHeader className={editItem ? '' : 'space-y-1 text-left'}><DialogTitle className={editItem ? 'text-lg font-semibold text-[#24262b]' : 'text-[16px] font-semibold text-[#202126]'}>{editItem ? 'Edit Category' : 'New Category'}</DialogTitle>{!editItem && <p className="text-[10px] text-[#858991]">Create a new group to organize your items.</p>}</DialogHeader>
        <div className={editItem ? 'space-y-3 py-1' : 'space-y-3 py-1'}>
          <div className="space-y-1"><Label>Category Name *</Label><Input className={inputClass} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="e.g. Phone Cases" /></div>
          {editItem && <><div className="space-y-1"><Label>Slug</Label><Input className={`${inputClass} bg-[#f8f9fa]`} value={slugify(form.name)} readOnly /></div>
          <div className="space-y-1"><Label>Description</Label><textarea className="min-h-[76px] w-full rounded-[7px] border border-[#e3e5e8] px-3 py-2 text-[11px] outline-none focus:border-[#ff9867]" value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><Label>Parent Category</Label><Select value={form.parentId || 'none'} onValueChange={value => setForm(current => ({ ...current, parentId: value === 'none' ? '' : value }))}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Top-level category</SelectItem>{parentCategories.map(category => <SelectItem key={category.categoryId} value={String(category.categoryId)}>{category.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1"><Label>Sort Order</Label><Input className={inputClass} type="number" min="0" value={form.sortOrder} onChange={event => setForm(current => ({ ...current, sortOrder: event.target.value }))} /></div></div>
          <div className="space-y-1"><Label>Status</Label><Select value={form.isActive ? 'active' : 'inactive'} onValueChange={value => setForm(current => ({ ...current, isActive: value === 'active' }))}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
          <div className="space-y-1"><Label>Category Image</Label><input type="file" accept="image/*" onChange={event => setImageFile(event.target.files?.[0] || null)} className="block w-full cursor-pointer rounded-lg border border-[#e3e5e8] bg-[#f8f9fa] px-3 py-2 text-[10px] text-[#656971] file:mr-3 file:rounded-md file:border-0 file:bg-[#eeeef0] file:px-3 file:py-1.5 file:text-[10px] file:font-medium" /></div></>}
        </div>
        <div className={`flex gap-2 ${editItem ? 'justify-end' : 'pt-0.5'}`}><Button type="button" variant="outline" onClick={() => setOpen(false)} className={editItem ? '' : 'h-8 flex-1 rounded-full border-[#e1e2e5] bg-white text-[10px] font-medium text-[#32343a]'}>Cancel</Button><Button type="button" onClick={handleSave} disabled={saving} className={editItem ? 'bg-[#171819] text-white hover:bg-[#333]' : 'h-8 flex-1 rounded-full bg-black text-[10px] font-medium text-white hover:bg-[#333]'}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editItem ? <Pencil className="mr-2 h-3.5 w-3.5" /> : null}{editItem ? 'Save Changes' : 'Add Category'}</Button></div>
      </DialogContent>
    </Dialog>
  </div>;
}
