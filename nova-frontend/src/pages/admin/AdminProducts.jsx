import { useEffect, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/media';
import { Plus, Pencil, Trash2, Search, Package, Loader2, UploadCloud, X, ImagePlus, Check, ChevronRight, CircleHelp } from 'lucide-react';

const STATUS_COLOR = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ACTIVE: 'bg-green-100 text-green-700',
  inactive: 'bg-slate-100 text-slate-700',
  INACTIVE: 'bg-slate-100 text-slate-700',
  DRAFT: 'bg-amber-100 text-amber-700',
  out_of_stock: 'bg-red-100 text-red-700',
};
const PAGE_SIZE = 12;

function ProductSwitch({ label, hint, checked, onChange }) {
  return <div className="flex items-center justify-between gap-3">
    <div><p className="text-[12px] font-semibold text-[#2a2c30]">{label}</p>{hint && <p className="mt-0.5 text-[10px] text-[#858991]">{hint}</p>}</div>
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-[19px] w-[38px] shrink-0 rounded-full transition-colors ${checked ? 'bg-[#ff5a00]' : 'bg-[#dfe2e6]'}`}>
      <span className={`absolute top-[2px] h-[15px] w-[15px] rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[21px]' : 'translate-x-[2px]'}`} />
    </button>
  </div>;
}

function ProductEditor({ product, form, setForm, categories, brands, images, setImages, saving, onCancel, onSave }) {
  const [featureDraft, setFeatureDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [previews, setPreviews] = useState([]);
  const features = Object.entries(form.specifications || {}).filter(([key]) => key !== '_seo');
  const tags = Array.isArray(form.tags) ? form.tags : [];
  const savedImages = product?.images || product?.ProductImages || [];

  useEffect(() => () => previews.forEach(url => URL.revokeObjectURL(url)), [previews]);

  const addFeature = () => {
    const value = featureDraft.trim();
    if (!value) return;
    setForm(current => ({ ...current, specifications: { ...current.specifications, [`Feature ${features.length + 1}`]: value } }));
    setFeatureDraft('');
  };
  const removeFeature = key => setForm(current => {
    const next = { ...current.specifications };
    delete next[key];
    return { ...current, specifications: next };
  });
  const addTag = () => {
    const value = tagDraft.trim();
    if (value && !tags.some(tag => tag.toLowerCase() === value.toLowerCase())) setForm(current => ({ ...current, tags: [...(current.tags || []), value] }));
    setTagDraft('');
  };
  const applyImages = files => {
    const selected = Array.from(files || []);
    previews.forEach(url => URL.revokeObjectURL(url));
    setImages(selected.slice(0, 5));
    setPreviews(selected.slice(0, 5).map(file => URL.createObjectURL(file)));
  };

  const inputClass = 'h-9 rounded-[7px] border-[#e3e5e8] bg-white text-[11px] text-[#303239] placeholder:text-[#a1a4aa] focus-visible:ring-1 focus-visible:ring-[#ff6a1a]';
  const labelClass = 'text-[10px] font-medium text-[#666a72]';
  const cardClass = 'overflow-hidden rounded-[12px] border border-[#e8e9ec] bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)]';
  const cardTitle = 'border-b border-[#f0f1f3] bg-[#fafafb] px-4 py-3 text-[13px] font-semibold text-[#27292e]';
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));

  return <div className="min-h-screen bg-[#f3f4f6]">
    <header className="border-b border-[#e9eaed] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1260px] items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-[#7b8088]">
          <span>Dashboard</span>
          <ChevronRight className="h-3 w-3" />
          <button type="button" onClick={onCancel} className="transition-colors hover:text-[#ff5a00]">Products</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#ef5a18]">{product ? 'Edit Product' : 'Add New'}</span>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" aria-label="Product menu" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ebedf0] bg-[#f8f9fb] text-[#5d636b] transition-colors hover:text-[#ff5a00]">
            <Package className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-[#ebedf0] bg-[#f9fafb] px-2 py-1.5 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f1f3] text-[9px] font-bold text-[#4f545d]">JK</div>
            <div className="text-right">
              <div className="text-[10px] font-semibold text-[#2b2d31]">Jamal Khan</div>
              <div className="text-[7px] uppercase tracking-[0.14em] text-[#9197a1]">Super Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div className="mx-auto max-w-[1260px] px-4 pb-20 pt-5 md:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-[22px] font-bold tracking-[-0.04em] text-[#262a30]">{product ? 'Edit Product' : 'Add New Product'}</h1>
        <p className="text-[10px] text-[#868b94]">Fields marked * are required</p>
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(270px,0.95fr)]">
        <div className="space-y-3">
          <section className={cardClass}>
            <h2 className="bg-gradient-to-r from-[#7b3000] to-[#ff5a00] px-4 py-2.5 text-[13px] font-semibold text-white">Product Images</h2>
            <div className="p-3">
              <label htmlFor="product-image-upload" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); applyImages(event.dataTransfer.files); }} className="flex min-h-[118px] cursor-pointer flex-col items-center justify-center rounded-[9px] border border-dashed border-[#ff9867] bg-[#fff7f2] px-4 py-3 text-center transition-colors hover:bg-[#fff0e7]">
                <UploadCloud className="mb-1 h-5 w-5 text-[#ff5a00]" />
                <span className="text-[11px] font-semibold text-[#45474c]">Drag &amp; drop product images here or click to browse</span>
                <span className="mt-1 text-[9px] text-[#858991]">Supports JPEG, PNG, WebP · Up to 5 MB each · Maximum 5 images</span>
                <span className="mt-2 rounded-full bg-[#ff5a00] px-3 py-1 text-[9px] font-semibold text-white">Browse Files</span>
                <input id="product-image-upload" type="file" multiple accept="image/*" onChange={event => applyImages(event.target.files)} className="sr-only" />
              </label>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {savedImages.map((image, index) => <div key={image.imageId || image.imageUrl} className="relative h-[54px] w-[54px] overflow-hidden rounded-[7px] border border-[#e4e5e7] bg-[#f7f7f8]"><img src={getMediaUrl(image.imageUrl)} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />{image.isPrimary && <span className="absolute bottom-0 left-0 right-0 bg-black/55 py-0.5 text-center text-[7px] text-white">Primary</span>}</div>)}
                {previews.map((url, index) => <div key={url} className="relative h-[54px] w-[54px] overflow-hidden rounded-[7px] border border-[#e4e5e7]"><img src={url} alt={`Selected product ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => { setImages(current => current.filter((_, i) => i !== index)); URL.revokeObjectURL(url); setPreviews(current => current.filter((_, i) => i !== index)); }} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white" aria-label="Remove selected image"><X className="h-3 w-3" /></button></div>)}
                {!savedImages.length && !previews.length && <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[7px] border border-dashed border-[#e4e5e7] text-[#aaaeb4]"><ImagePlus className="h-4 w-4" /></div>}
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={cardTitle}>Product Information</h2>
            <div className="space-y-3 p-4">
              <div className="space-y-1"><Label className={labelClass}>Product Name *</Label><Input className={inputClass} placeholder="e.g. iPhone 15 Silicone Case" value={form.name} onChange={event => set('name', event.target.value)} /></div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div className="space-y-1"><Label className={labelClass}>Brand</Label><Select value={String(form.brandId || 'none')} onValueChange={value => set('brandId', value === 'none' ? '' : value)}><SelectTrigger className={inputClass}><SelectValue placeholder="Select brand" /></SelectTrigger><SelectContent><SelectItem value="none">No brand</SelectItem>{brands.map(brand => <SelectItem key={brand.brandId} value={String(brand.brandId)}>{brand.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1"><Label className={labelClass}>Category</Label><Select value={String(form.categoryId || 'none')} onValueChange={value => set('categoryId', value === 'none' ? '' : value)}><SelectTrigger className={inputClass}><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="none">No category</SelectItem>{categories.map(category => <SelectItem key={category.categoryId} value={String(category.categoryId)}>{category.name}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-1"><Label className={labelClass}>Short Description</Label><Input className={inputClass} placeholder="A short summary shown in product listings" value={form.shortDescription} onChange={event => set('shortDescription', event.target.value)} /></div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={cardTitle}>Pricing &amp; Stock</h2>
            <div className="space-y-3 p-4">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div className="space-y-1"><Label className={labelClass}>Price (QAR) *</Label><Input className={inputClass} type="number" min="0" step="0.01" placeholder="QAR 149.00" value={form.price} onChange={event => set('price', event.target.value)} /></div>
                <div className="space-y-1"><Label className={labelClass}>Compare at Price (QAR)</Label><Input className={inputClass} type="number" min="0" step="0.01" placeholder="QAR 199.00" value={form.comparePrice} onChange={event => set('comparePrice', event.target.value)} /></div>
                <div className="space-y-1"><Label className={labelClass}>SKU</Label><Input className={inputClass} placeholder="Product SKU" value={form.sku} onChange={event => set('sku', event.target.value)} /></div>
                <div className="space-y-1"><Label className={labelClass}>Stock Quantity</Label><Input className={inputClass} type="number" min="0" placeholder="0" value={form.quantity} onChange={event => set('quantity', event.target.value)} /></div>
                <div className="space-y-1"><Label className={labelClass}>Low Stock Alert At</Label><Input className={inputClass} type="number" min="0" value={form.lowStockThreshold} onChange={event => set('lowStockThreshold', event.target.value)} /></div>
                <div className="space-y-1"><Label className={labelClass}>Condition</Label><Select value={form.condition} onValueChange={value => set('condition', value)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NEW">New</SelectItem><SelectItem value="REFURBISHED">Refurbished</SelectItem><SelectItem value="USED">Used</SelectItem></SelectContent></Select></div>
              </div>
              <div className="border-t border-[#f0f1f3] pt-3"><ProductSwitch label="Stock Status" hint={Number(form.quantity) > 0 ? `${form.quantity} items available in stock.` : 'Item is currently out of stock.'} checked={Number(form.quantity) > 0} onChange={checked => set('quantity', checked ? (form.quantity || '1') : '0')} /></div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={cardTitle}>Product Description</h2>
            <div className="p-4"><textarea className="min-h-[126px] w-full resize-y rounded-[8px] border border-[#e3e5e8] px-3 py-2.5 text-[11px] leading-5 text-[#45474c] outline-none placeholder:text-[#a1a4aa] focus:border-[#ff9867]" placeholder="Describe the product, its materials, benefits, and other details..." value={form.description} onChange={event => set('description', event.target.value)} /></div>
          </section>
        </div>

        <div className="space-y-3">
          <section className={cardClass}>
            <h2 className={cardTitle}>Product Status</h2>
            <div className="space-y-3 p-4">
              <div className="space-y-1"><Label className={labelClass}>Publish Status</Label><Select value={form.status} onValueChange={value => set('status', value)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="ACTIVE">Published</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem></SelectContent></Select></div>
              <ProductSwitch label="Visible on store" hint="This product will be visible once published." checked={form.status === 'ACTIVE'} onChange={checked => set('status', checked ? 'ACTIVE' : 'INACTIVE')} />
              <ProductSwitch label="Featured product" hint="Highlight this item on the homepage showcase." checked={form.isFeatured} onChange={checked => set('isFeatured', checked)} />
              <ProductSwitch label="Best seller" checked={form.isBestSeller} onChange={checked => set('isBestSeller', checked)} />
              <ProductSwitch label="New arrival" checked={form.isNewArrival} onChange={checked => set('isNewArrival', checked)} />
            </div>
          </section>

          <section className={cardClass}>
            <div className={`${cardTitle} flex items-center justify-between`}><span>Key Features</span><CircleHelp className="h-3.5 w-3.5 text-[#a1a4aa]" /></div>
            <div className="p-4">
              <ul className="space-y-2">{features.map(([key, value]) => <li key={key} className="flex items-start gap-2 text-[10px] text-[#45474c]"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#ff5a00]" /><span className="min-w-0 flex-1">{String(value)}</span><button type="button" onClick={() => removeFeature(key)} className="text-[#999da4] hover:text-red-500" aria-label={`Remove ${key}`}><X className="h-3 w-3" /></button></li>)}</ul>
              <Label className={`${labelClass} mt-3 block`}>Add New Feature</Label>
              <div className="mt-1 flex gap-1.5"><Input className={inputClass} placeholder="e.g. Scratch resistant coating" value={featureDraft} onChange={event => setFeatureDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addFeature(); } }} /><Button type="button" variant="outline" onClick={addFeature} className="h-9 border-[#ff9867] px-2.5 text-[10px] text-[#ed560d] hover:bg-[#fff7f2]">Add</Button></div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={cardTitle}>Tags</h2>
            <div className="p-4"><Label className={labelClass}>Add Tag</Label><Input className={`${inputClass} mt-1`} placeholder="Press enter to add tag" value={tagDraft} onChange={event => setTagDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addTag(); } }} /><div className="mt-2 flex flex-wrap gap-1.5">{tags.map(tag => <button key={tag} type="button" onClick={() => setForm(current => ({ ...current, tags: current.tags.filter(value => value !== tag) }))} className="inline-flex items-center gap-1 rounded-full border border-[#ff8b54] px-2 py-1 text-[9px] font-medium text-[#e6530b] hover:bg-[#fff4ed]">{tag}<X className="h-2.5 w-2.5" /></button>)}</div></div>
          </section>

          <section className={cardClass}>
            <h2 className={cardTitle}>SEO Settings</h2>
            <div className="space-y-2.5 p-4">
              <div className="space-y-1"><Label className={labelClass}>Meta Title</Label><Input className={inputClass} value={form.name || ''} onChange={event => set('name', event.target.value)} placeholder="e.g. iPhone 15 Premium Silicone Case - NOVA" /></div>
              <div className="space-y-1"><Label className={labelClass}>Meta Description</Label><textarea className="min-h-[92px] w-full resize-y rounded-[8px] border border-[#e3e5e8] px-3 py-2.5 text-[11px] leading-5 text-[#45474c] outline-none placeholder:text-[#a1a4aa] focus:border-[#ff9867]" value={form.shortDescription || form.description || ''} onChange={event => set('shortDescription', event.target.value)} placeholder="Buy premium soft-touch silicone iPhone 15 protective covers..." /></div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e7e8eb] bg-white/95 px-4 py-2.5 backdrop-blur-md lg:left-[190px] sm:px-8">
      <div className="mx-auto flex max-w-[1260px] justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel} className="h-9 rounded-full border-[#dedfe2] bg-white px-4 text-[11px] text-[#34363b]">Cancel</Button><Button type="button" variant="outline" onClick={() => onSave('DRAFT')} disabled={saving} className="h-9 rounded-full border-[#dedfe2] bg-white px-4 text-[11px] text-[#34363b]">Save as Draft</Button><Button type="button" onClick={() => onSave('ACTIVE')} disabled={saving} className="h-9 rounded-full bg-[#ff5a00] px-4 text-[11px] font-semibold text-white hover:bg-[#e95100]">{saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}{product ? 'Update Product' : 'Publish Product'}</Button></div>
    </div>
  </div>;
}

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { data: categoriesData } = useFetch('/categories');
  const { data: brandsData } = useFetch('/brands');
  const { data, loading, refetch } = useFetch('/products', { params: { search, page, limit: PAGE_SIZE } });

  const products = Array.isArray(data?.data?.products)
    ? data.data.products
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : [];
  const pagination = data?.data?.pagination ?? data?.pagination;
  const totalProducts = Number(pagination?.total ?? products.length);
  const pageCount = Math.max(1, Number(pagination?.totalPages ?? Math.ceil(totalProducts / PAGE_SIZE)));
  const currentPage = Math.min(page, pageCount);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);
  const categories = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : Array.isArray(categoriesData)
      ? categoriesData
      : Array.isArray(categoriesData?.categories)
        ? categoriesData.categories
        : [];
  const brands = Array.isArray(brandsData?.data)
    ? brandsData.data
    : Array.isArray(brandsData)
      ? brandsData
      : Array.isArray(brandsData?.brands)
        ? brandsData.brands
        : [];

  const [form, setForm] = useState({
    name: '', price: '', comparePrice: '', description: '', shortDescription: '',
    sku: '', quantity: '', lowStockThreshold: '5', categoryId: '', brandId: '', status: 'ACTIVE', condition: 'NEW',
    specifications: {}, tags: [], isFeatured: false, isBestSeller: false, isNewArrival: false,
  });
  const [images, setImages] = useState([]);

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', price: '', comparePrice: '', description: '', shortDescription: '', sku: '', quantity: '', lowStockThreshold: '5', categoryId: '', brandId: '', status: 'ACTIVE', condition: 'NEW', specifications: {}, tags: [], isFeatured: false, isBestSeller: false, isNewArrival: false });
    setImages([]);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, price: p.price, comparePrice: p.comparePrice || '', description: p.description || '',
      shortDescription: p.shortDescription || '', sku: p.sku || '', quantity: p.quantity, lowStockThreshold: p.lowStockThreshold ?? 5,
      categoryId: p.categoryId || '', brandId: p.brandId || '', status: String(p.status || 'ACTIVE').toUpperCase(), condition: p.condition || 'NEW',
      specifications: p.specifications || {}, tags: Array.isArray(p.tags) ? p.tags : [],
      isFeatured: p.isFeatured, isBestSeller: p.isBestSeller, isNewArrival: p.isNewArrival,
    });
    setImages([]);
    setOpen(true);
  };

  const handleSave = async (statusOverride) => {
    setSaving(true);
    try {
      const fd = new FormData();
      const payload = { ...form, status: statusOverride || form.status };
      Object.entries(payload).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) return;
        if (key === 'specifications' || key === 'tags') fd.append(key, JSON.stringify(value));
        else fd.append(key, value);
      });
      images.forEach(img => fd.append('images', img));
      if (editProduct) {
        await api.patch(`/products/${editProduct.productId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast({ title: 'Product updated!' });
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast({ title: 'Product created!' });
      }
      setOpen(false);
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast({ title: 'Product deleted' });
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    }
  };

  if (open) return <ProductEditor key={editProduct?.productId || 'new-product'} product={editProduct} form={form} setForm={setForm} categories={categories} brands={brands} images={images} setImages={setImages} saving={saving} onCancel={() => setOpen(false)} onSave={handleSave} />;

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Catalog</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">Products</h1>
        </div>
        <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />Add Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Search products..." className="border-slate-200 bg-white pl-9 text-slate-700" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-5 py-3 text-left font-medium text-slate-500">Product</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Category</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Price</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Stock</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Tags</th>
                <th className="px-5 py-3 text-right font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-8 animate-pulse rounded bg-slate-100" /></td></tr>)
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                  <Package className="mx-auto mb-2 h-10 w-10 opacity-30" />No products found
                </td></tr>
              ) : products.map(p => {
                const productImages = p.images || p.ProductImages || [];
                const img = productImages.find(i => i.isPrimary) || productImages[0];
                const imgSrc = img ? getMediaUrl(img.imageUrl) : null;
                return (
                  <tr key={p.productId} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {imgSrc ? <img src={imgSrc} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-200" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.sku || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{p.category?.name || p.Category?.name || '—'}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      QAR {Number(p.price).toFixed(2)}
                      {p.comparePrice && <span className="ml-1 text-xs text-slate-400 line-through">QAR {Number(p.comparePrice).toFixed(2)}</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={p.quantity <= p.lowStockThreshold ? 'font-medium text-red-600' : 'text-slate-700'}>{p.quantity}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLOR[p.status] || STATUS_COLOR[String(p.status).toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
                        {String(p.status || '').toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.isFeatured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                        {p.isBestSeller && <Badge variant="secondary" className="text-[10px]">Best Seller</Badge>}
                        {p.isNewArrival && <Badge variant="secondary" className="text-[10px]">New</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(p.productId)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 sm:flex-row">
          <p className="text-xs text-slate-500">Showing {totalProducts ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, totalProducts)} of {totalProducts.toLocaleString()} products</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" disabled={currentPage <= 1 || loading} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</Button>
            <span className="min-w-12 text-center text-xs text-slate-600">{currentPage} / {pageCount}</span>
            <Button type="button" variant="outline" disabled={currentPage >= pageCount || loading} onClick={() => setPage(value => Math.min(pageCount, value + 1))}>Next</Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-[28px] border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">{editProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5"><Label>Product Name *</Label><Input className="border-slate-200 bg-white" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Price *</Label><Input className="border-slate-200 bg-white" type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Compare Price</Label><Input className="border-slate-200 bg-white" type="number" step="0.01" value={form.comparePrice} onChange={e => setForm(p => ({ ...p, comparePrice: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>SKU</Label><Input className="border-slate-200 bg-white" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Quantity</Label><Input className="border-slate-200 bg-white" type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Category</Label>
              <Select value={String(form.categoryId)} onValueChange={v => setForm(p => ({ ...p, categoryId: v }))}>
                <SelectTrigger className="border-slate-200 bg-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.categoryId} value={String(c.categoryId)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Brand</Label>
              <Select value={String(form.brandId)} onValueChange={v => setForm(p => ({ ...p, brandId: v }))}>
                <SelectTrigger className="border-slate-200 bg-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{brands.map(b => <SelectItem key={b.brandId} value={String(b.brandId)}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className="border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="out_of_stock">Out of Stock</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5"><Label>Short Description</Label><Input className="border-slate-200 bg-white" value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Full Description</Label><textarea className="flex h-24 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="col-span-2 flex gap-6">
              {[['isFeatured', 'Featured'], ['isBestSeller', 'Best Seller'], ['isNewArrival', 'New Arrival']].map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} className="h-4 w-4 accent-blue-600" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Images</Label>
              <input type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files))}
                className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-sm file:font-medium" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-200 bg-white text-slate-700">Cancel</Button>
            <Button className="border-0 bg-gradient-to-r from-blue-600 to-violet-600 text-white" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : (editProduct ? 'Update' : 'Create')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
