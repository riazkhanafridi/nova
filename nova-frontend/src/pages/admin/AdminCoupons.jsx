import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { Plus, Pencil, Trash2, Percent, Loader2, Copy } from 'lucide-react';

const TYPE_COLOR = {
  percentage: 'bg-blue-100 text-blue-700',
  fixed_amount: 'bg-green-100 text-green-700',
};

export default function AdminCoupons() {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { data, loading, refetch } = useFetch('/coupons');
  const coupons = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : Array.isArray(data?.coupons)
        ? data.coupons
        : [];

  const [form, setForm] = useState({
    code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '',
    maxDiscountAmount: '', usageLimit: '', validFrom: '', validUntil: '', isActive: true,
  });

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm(p => ({ ...p, code }));
  };

  const openCreate = () => { setEditItem(null); setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', validFrom: '', validUntil: '', isActive: true }); setOpen(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minOrderAmount: c.minOrderAmount || '', maxDiscountAmount: c.maxDiscountAmount || '', usageLimit: c.usageLimit || '', validFrom: c.validFrom ? c.validFrom.slice(0, 10) : '', validUntil: c.validUntil ? c.validUntil.slice(0, 10) : '', isActive: c.isActive }); setOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach(k => payload[k] === '' && delete payload[k]);
      if (editItem) {
        await api.patch(`/coupons/${editItem.couponId}`, payload);
        toast({ title: 'Coupon updated!' });
      } else {
        await api.post('/coupons', payload);
        toast({ title: 'Coupon created!' });
      }
      setOpen(false); refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast({ title: 'Coupon deleted' }); refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message });
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Code copied!', description: code });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Promotions</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">Coupons</h1>
        </div>
        <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />Add Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-[24px] border border-slate-200 bg-slate-100" />) :
          coupons.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500">
              <Percent className="mx-auto mb-2 h-10 w-10 opacity-30" />No coupons yet
            </div>
          ) : coupons.map(c => (
            <div key={c.couponId} className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-lg font-bold tracking-wider text-slate-900">{c.code}</code>
                    <button onClick={() => copyCode(c.code)} className="text-slate-400 transition-colors hover:text-slate-700">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLOR[c.discountType] || 'bg-slate-100 text-slate-700'}`}>
                      {c.discountType === 'percentage' ? `${c.discountValue}% off` : `$${Number(c.discountValue).toFixed(2)} off`}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(c.couponId)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                {c.minOrderAmount && <div>Min order: <span className="font-medium text-slate-800">${Number(c.minOrderAmount).toFixed(2)}</span></div>}
                {c.usageLimit && <div>Limit: <span className="font-medium text-slate-800">{c.usageCount || 0}/{c.usageLimit}</span></div>}
                {c.validFrom && <div>From: <span className="font-medium text-slate-800">{new Date(c.validFrom).toLocaleDateString()}</span></div>}
                {c.validUntil && <div>Until: <span className="font-medium text-slate-800">{new Date(c.validUntil).toLocaleDateString()}</span></div>}
              </div>
            </div>
          ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-[24px] border-slate-200">
          <DialogHeader><DialogTitle className="text-xl font-bold text-slate-900">{editItem ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Coupon Code *</Label>
              <div className="flex gap-2">
                <Input className="border-slate-200 bg-white font-mono" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                <Button type="button" variant="outline" onClick={generateCode} className="shrink-0 border-slate-200 bg-white text-slate-700">Generate</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Discount Type</Label>
                <Select value={form.discountType} onValueChange={v => setForm(p => ({ ...p, discountType: v }))}>
                  <SelectTrigger className="border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed_amount">Fixed Amount</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Value *</Label><Input className="border-slate-200 bg-white" type="number" step="0.01" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Min Order ($)</Label><Input className="border-slate-200 bg-white" type="number" step="0.01" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Max Discount ($)</Label><Input className="border-slate-200 bg-white" type="number" step="0.01" value={form.maxDiscountAmount} onChange={e => setForm(p => ({ ...p, maxDiscountAmount: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Usage Limit</Label><Input className="border-slate-200 bg-white" type="number" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.isActive ? 'active' : 'inactive'} onValueChange={v => setForm(p => ({ ...p, isActive: v === 'active' }))}>
                  <SelectTrigger className="border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Valid From</Label><Input className="border-slate-200 bg-white" type="date" value={form.validFrom} onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Valid Until</Label><Input className="border-slate-200 bg-white" type="date" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} /></div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-200 bg-white text-slate-700">Cancel</Button>
            <Button className="border-0 bg-gradient-to-r from-blue-600 to-violet-600 text-white" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : (editItem ? 'Update' : 'Create')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
