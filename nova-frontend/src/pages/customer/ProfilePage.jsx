import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/media';
import { Camera, Loader2, User, Lock, MapPin, Plus, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const { data: addrData, refetch: refetchAddr } = useFetch('/addresses');
  const addresses = addrData?.data || [];
  const [newAddr, setNewAddr] = useState({ street: '', city: '', state: '', country: '', zipCode: '', isDefault: false });
  const [addingAddr, setAddingAddr] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);
    try {
      await api.patch('/auth/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast({ title: 'Avatar updated!' });
      window.location.reload();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed', description: err.response?.data?.message });
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/profile', profile);
      toast({ title: 'Profile updated!' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed', description: err.response?.data?.message });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast({ variant: 'destructive', title: 'Passwords do not match' });
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast({ title: 'Password changed!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed', description: err.response?.data?.message });
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    setAddingAddr(true);
    try {
      await api.post('/addresses', newAddr);
      toast({ title: 'Address saved!' });
      setNewAddr({ street: '', city: '', state: '', country: '', zipCode: '', isDefault: false });
      refetchAddr();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed', description: err.response?.data?.message });
    } finally {
      setAddingAddr(false);
    }
  };

  const deleteAddress = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      toast({ title: 'Address removed' });
      refetchAddr();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed', description: err.response?.data?.message });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">My Account</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-900">Account Settings</h1>
      </div>
      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="flex flex-col items-center p-6 rounded-[1.5rem] border border-neutral-200/70 bg-white text-center mb-4 shadow-xs">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <Avatar className="h-20 w-20">
                <AvatarImage src={getMediaUrl(user?.avatar)} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-2xl font-black">{user?.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <p className="font-bold mt-3 text-sm text-neutral-900">{user?.fullName}</p>
            <p className="text-xs text-neutral-500">{user?.email}</p>
          </div>
          <nav className="space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === t.id ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}>
                <t.icon className="h-4 w-4" />{t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="md:col-span-3 rounded-[1.5rem] border border-neutral-200/70 bg-white p-6 shadow-xs">
          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold mb-1 text-neutral-900">Personal Information</h2>
                <p className="text-sm text-neutral-500">Update your profile details</p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-neutral-700">Full Name</Label><Input value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} placeholder="Your name" className="h-11 rounded-xl border-neutral-200" /></div>
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-neutral-700">Email</Label><Input value={user?.email} disabled className="h-11 rounded-xl bg-neutral-50 cursor-not-allowed opacity-60" /></div>
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-neutral-700">Phone</Label><Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+974 5555 1234" className="h-11 rounded-xl border-neutral-200" /></div>
              </div>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-full px-6 font-bold shadow-md shadow-orange-500/20" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </form>
          )}

          {tab === 'security' && (
            <form onSubmit={changePassword} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold mb-1 text-neutral-900">Change Password</h2>
                <p className="text-sm text-neutral-500">Keep your account secure</p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-neutral-700">Current Password</Label><Input type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required className="h-11 rounded-xl border-neutral-200" /></div>
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-neutral-700">New Password</Label><Input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required className="h-11 rounded-xl border-neutral-200" /></div>
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-neutral-700">Confirm New Password</Label><Input type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} required className="h-11 rounded-xl border-neutral-200" /></div>
              </div>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-full px-6 font-bold shadow-md shadow-orange-500/20" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : 'Update Password'}
              </Button>
            </form>
          )}

          {tab === 'addresses' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold mb-1 text-neutral-900">Saved Addresses</h2>
                <p className="text-sm text-neutral-500">Manage your delivery addresses</p>
              </div>
              <Separator />
              <div className="space-y-3">
                {addresses.map(addr => (
                  <div key={addr.addressId} className="flex items-start justify-between p-4 rounded-2xl border border-neutral-200/70 bg-neutral-50">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{addr.street}</p>
                      <p className="text-xs text-neutral-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p className="text-xs text-neutral-500">{addr.country}</p>
                      {addr.isDefault && <span className="inline-block mt-1 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">Default</span>}
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 -mt-1" onClick={() => deleteAddress(addr.addressId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <form onSubmit={saveAddress} className="border border-neutral-200/70 rounded-2xl p-4 space-y-3 bg-neutral-50">
                <p className="font-bold text-sm flex items-center gap-2 text-neutral-900"><Plus className="h-4 w-4 text-orange-600" />Add New Address</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1"><Label>Street</Label><Input placeholder="123 Al Muntaaz St" value={newAddr.street} onChange={e => setNewAddr(p => ({ ...p, street: e.target.value }))} required /></div>
                  <div className="space-y-1"><Label>City</Label><Input placeholder="Doha" value={newAddr.city} onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>State</Label><Input placeholder="" value={newAddr.state} onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Country</Label><Input placeholder="Qatar" value={newAddr.country} onChange={e => setNewAddr(p => ({ ...p, country: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Zip Code</Label><Input placeholder="" value={newAddr.zipCode} onChange={e => setNewAddr(p => ({ ...p, zipCode: e.target.value }))} /></div>
                </div>
                <Button type="submit" size="sm" className="bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold" disabled={addingAddr}>
                  {addingAddr ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Saving...</> : 'Save Address'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
