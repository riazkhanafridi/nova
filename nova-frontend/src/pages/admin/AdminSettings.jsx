import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { Bell, CreditCard, Settings2, Store, Truck, Users } from 'lucide-react';

const STORAGE_KEY = 'nova-admin-settings-preview';
const DEFAULTS = {
  storeName: 'NOVA Qatar', storeEmail: 'hello@nova.qa', phone: '+974 5550 1234', currency: 'QAR',
  maintenanceMode: true, productReviews: true, wishlist: false,
  storeDescription: '', storeAddress: '', storeWebsite: '',
  legalBusinessName: 'Nova Qatar W.L.L.', crNumber: '102948-QA', taxRegistrationId: 'QTR-990-281', storeCategory: 'Electronics & Mobile Accessories',
  streetAddress: 'Building 45, Al Souq Street', cityArea: 'Doha', stateProvince: 'Ad-Dawhah', postalCode: '00000',
  paymentCash: false, paymentCard: true, paymentQPay: true, paymentBankTransfer: false,
  beneficiaryBank: 'Qatar National Bank (QNB)', ibanNumber: 'QA93 QNBA 0000 0000 1234 5678 90', settlementFrequency: 'Weekly (Every Thursday)', minimumPayoutThreshold: '1,000 QAR',
  shippingFee: '25 QAR', freeShippingThreshold: '250 QAR', deliveryZones: 'Qatar',
  localCourierDelivery: true, clickAndCollect: true, internationalLogistics: false,
  averageProcessingTime: '24 Hours', defaultShippingOriginHub: 'Doha Warehouse Zone 56',
  orderEmails: true, lowStockAlerts: true, customerEmails: true,
  emailOrderReceipts: true, smsStatusUpdates: true, abandonedCartRecovery: false,
  smtpHost: 'smtp.mailgun.org', smtpPort: '587 (TLS)', authorizedSender: 'no-reply@nova.qa', senderDisplayName: 'NOVA Customer Support',
  allowCustomerRegistration: true, requireEmailVerification: true, adminTwoFactor: false,
  inviteFullName: '', inviteEmail: '', inviteRole: 'Manager', inviteRegion: 'All Hubs (Default)',
};

const TABS = [
  { id: 'general', label: 'General', icon: Settings2 },
  { id: 'store', label: 'Store Info', icon: Store },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'users', label: 'Users', icon: Users },
];

function readSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return DEFAULTS; }
}

function SettingsSwitch({ title, description, checked, onChange }) {
  return <div className="flex items-center justify-between gap-4 py-1">
    <div><p className="text-[11px] font-medium text-[#292b30]">{title}</p><p className="mt-0.5 text-[9px] text-[#858991]">{description}</p></div>
    <button type="button" role="switch" aria-checked={checked} aria-label={title} onClick={() => onChange(!checked)} className={`relative h-[19px] w-[38px] shrink-0 rounded-full transition-colors ${checked ? 'bg-[#ff5a00]' : 'bg-[#dfe2e6]'}`}><span className={`absolute top-[2px] h-[15px] w-[15px] rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[21px]' : 'translate-x-[2px]'}`} /></button>
  </div>;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(readSettings);
  const [saved, setSaved] = useState(readSettings);
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();
  const set = (key, value) => setSettings(current => ({ ...current, [key]: value }));
  const discard = () => { setSettings(saved); toast({ title: 'Unsaved changes discarded' }); };
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(settings);
      toast({ title: 'Settings saved in this browser' });
    } catch {
      toast({ variant: 'destructive', title: 'Could not save settings in this browser' });
    }
  };

  const inputClass = 'h-9 rounded-[8px] border-[#e2e4e7] bg-white text-[10px] text-[#34363b] focus-visible:ring-1 focus-visible:ring-[#ff6a1a]';
  const field = (label, key, placeholder = '') => <div className="space-y-1.5"><Label className="text-[9px] font-medium text-[#777b83]">{label}</Label><Input className={inputClass} value={settings[key]} placeholder={placeholder} onChange={event => set(key, event.target.value)} /></div>;

  return <div className="mx-auto max-w-[1120px] space-y-3">
    <div><div className="flex items-center gap-1.5 text-[9px] text-[#7f838a]"><span>Dashboard</span><span>›</span><span className="text-[#ef5a18]">Settings</span></div><h1 className="mt-1 text-[18px] font-semibold text-[#24262b]">{activeTab === 'users' ? 'Team Directory' : 'System Settings'}</h1></div>

    <nav className="flex gap-1 overflow-x-auto pb-0.5" aria-label="Settings sections">{TABS.map(tab => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[9px] font-semibold transition-colors ${activeTab === tab.id ? 'bg-[#ff5a00] text-white' : 'text-[#41444a] hover:bg-[#e9eaed]'}`}><tab.icon className="h-3 w-3" />{tab.label}</button>)}</nav>

    <p className="rounded-[8px] border border-[#f1e2d8] bg-[#fff9f5] px-3 py-2 text-[9px] text-[#8a624c]">Settings preview: values are stored in this browser only. The backend does not currently provide a system settings API, so these controls do not change live store behavior.</p>

    {activeTab === 'general' && <div className="space-y-3">
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white"><h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">General Settings</h2><div className="grid gap-3 p-4 sm:grid-cols-2">{field('Store Name', 'storeName')}{field('Store Email Address', 'storeEmail', 'hello@example.com')}{field('Store Contact Phone', 'phone', '+974 ...')}<div className="space-y-1.5"><Label className="text-[9px] font-medium text-[#777b83]">Default Currency</Label><Select value={settings.currency} onValueChange={value => set('currency', value)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="QAR">QAR — Qatari Riyal</SelectItem><SelectItem value="USD">USD — US Dollar</SelectItem><SelectItem value="SAR">SAR — Saudi Riyal</SelectItem><SelectItem value="AED">AED — UAE Dirham</SelectItem></SelectContent></Select></div></div></section>
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white"><h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">Feature Configuration</h2><div className="space-y-3 px-4 py-3"><SettingsSwitch title="Maintenance Mode" description="Instantly lock access to the consumer storefront with a notice splash screen." checked={settings.maintenanceMode} onChange={value => set('maintenanceMode', value)} /><SettingsSwitch title="Enable Product Reviews" description="Allow verified buyers to leave star ratings and reviews on accessory detail pages." checked={settings.productReviews} onChange={value => set('productReviews', value)} /><SettingsSwitch title="Enable Wishlist Module" description="Provide store customers the ability to bookmark their favorite phone items." checked={settings.wishlist} onChange={value => set('wishlist', value)} /></div></section>
    </div>}

    {activeTab === 'store' && <div className="space-y-3">
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white"><h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">Store Profile</h2><div className="grid gap-x-3 gap-y-3 p-4 sm:grid-cols-2">{field('Legal Business Name', 'legalBusinessName')}{field('Commercial Registration (CR) Number', 'crNumber')}{field('Tax Registration ID', 'taxRegistrationId')}{field('Store Category', 'storeCategory')}</div></section>
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white"><h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">Business Address</h2><div className="grid gap-x-3 gap-y-3 p-4 sm:grid-cols-2">{field('Street Address', 'streetAddress')}{field('City / Area', 'cityArea')}{field('State / Province', 'stateProvince')}{field('Postal Code', 'postalCode')}</div></section>
    </div>}

    {activeTab === 'payment' && <div className="space-y-3">
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white"><h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">Active Payment Providers</h2><div className="space-y-3 px-4 py-3"><SettingsSwitch title="Enable Credit / Debit Card Processing" description="Accept global Visa, Mastercard, and local NAPS debit cards at checkout." checked={settings.paymentCard} onChange={value => set('paymentCard', value)} /><SettingsSwitch title="QPay Integration" description="Accept payments via the regional QPay Qatar network." checked={settings.paymentQPay} onChange={value => set('paymentQPay', value)} /><SettingsSwitch title="Cash on Delivery (COD)" description="Permit cash collection upon physical delivery at destination." checked={settings.paymentCash} onChange={value => set('paymentCash', value)} /></div></section>
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white"><h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">Settlement &amp; Bank Details</h2><div className="grid gap-x-3 gap-y-3 p-4 sm:grid-cols-2">{field('Beneficiary Bank', 'beneficiaryBank')}{field('IBAN Number', 'ibanNumber')}{field('Settlement Frequency', 'settlementFrequency')}{field('Minimum Payout Threshold', 'minimumPayoutThreshold')}</div></section>
    </div>}

    {activeTab === 'shipping' && <div className="space-y-3">
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white"><h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">Shipping &amp; Fulfillment Methods</h2><div className="space-y-3 px-4 py-3"><SettingsSwitch title="Local Doha Courier Delivery" description="Same day or next day package delivery within metropolitan Doha." checked={settings.localCourierDelivery} onChange={value => set('localCourierDelivery', value)} /><SettingsSwitch title="Click &amp; Collect (In-Store Pickup)" description="Allow shoppers to buy online and fetch items at regional warehouses." checked={settings.clickAndCollect} onChange={value => set('clickAndCollect', value)} /><SettingsSwitch title="International Logistics (DHL / Aramex)" description="Enable global shipping rates and automatic air waybill printing." checked={settings.internationalLogistics} onChange={value => set('internationalLogistics', value)} /></div></section>
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white"><h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">Shipping Fee Configuration</h2><div className="grid gap-x-3 gap-y-3 p-4 sm:grid-cols-2">{field('Default Flat Delivery Fee', 'shippingFee')}{field('Free Delivery Limit Threshold', 'freeShippingThreshold')}{field('Average Processing Lead Time', 'averageProcessingTime')}{field('Default Shipping Origin Hub', 'defaultShippingOriginHub')}</div></section>
    </div>}

    {activeTab === 'notifications' && <div className="space-y-3">
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white"><h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">Customer Triggers &amp; Alerts</h2><div className="space-y-3 px-4 py-3"><SettingsSwitch title="Email Order Confirmation Receipts" description="Dispatch automated rich emails immediately after successful checkout." checked={settings.emailOrderReceipts} onChange={value => set('emailOrderReceipts', value)} /><SettingsSwitch title="SMS Status Updates" description="Send cellular text message updates upon package pickup and dispatch." checked={settings.smsStatusUpdates} onChange={value => set('smsStatusUpdates', value)} /><SettingsSwitch title="Abandoned Cart Recovery Series" description="Email notifications to remind buyers about unattended cart contents." checked={settings.abandonedCartRecovery} onChange={value => set('abandonedCartRecovery', value)} /></div></section>
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white"><h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">Email Configuration (SMTP)</h2><div className="grid gap-x-3 gap-y-3 p-4 sm:grid-cols-2">{field('Outgoing Mail Server (SMTP)', 'smtpHost')}{field('Port Number', 'smtpPort')}{field('Authorized System Sender Address', 'authorizedSender')}{field('Sender Display Name', 'senderDisplayName')}</div></section>
    </div>}

    {activeTab === 'users' && <div className="space-y-3">
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white">
        <h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">Active Administrators</h2>
        <div className="divide-y divide-[#f0f1f3] px-4">
          {[
            { name: 'Khalid Al-Thani', email: 'khalid@nova.qa', role: 'Super Administrator', badge: 'SUPER ADMIN', initials: 'KT', tone: 'bg-[#d9e2e4] text-[#33434a]', badgeTone: 'bg-[#fff0e8] text-[#fa5a12]' },
            { name: 'Sara Al-Kuwari', email: 'sara@nova.qa', role: 'Head of Logistics', badge: 'MANAGER', initials: 'SK', tone: 'bg-[#e8ded1] text-[#59483d]', badgeTone: 'bg-[#f1f2f3] text-[#50535a]' },
            { name: 'Faisal Mahmood', email: 'f.mahmood@nova.qa', role: 'Customer Support Associate', badge: 'SUPPORT AGENT', initials: 'FM', tone: 'bg-[#dce2e8] text-[#3c4b59]', badgeTone: 'bg-[#f1f2f3] text-[#50535a]' },
          ].map(person => <div key={person.email} className="flex min-h-[49px] items-center gap-3">
            <div aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${person.tone}`}>{person.initials}</div>
            <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold leading-4 text-[#292b30]">{person.name}</p><p className="text-[9px] leading-3 text-[#858991]">{person.email} <span className="text-[#b0b3b8]">•</span> {person.role}</p></div>
            <span className={`rounded-full px-2 py-1 text-[8px] font-semibold ${person.badgeTone}`}>{person.badge}</span>
          </div>)}
        </div>
      </section>
      <section className="overflow-hidden rounded-[11px] border border-[#e7e8eb] bg-white">
        <h2 className="border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold text-[#282a2f]">Invite New Team Member</h2>
        <div className="grid gap-x-3 gap-y-3 p-4 sm:grid-cols-2">
          {field('Full Name', 'inviteFullName', 'e.g. Tariq Mansoor')}
          {field('Work Email Address', 'inviteEmail', 'tariq@nova.qa')}
          <div className="space-y-1.5"><Label className="text-[9px] font-medium text-[#777b83]">Security Group / Role Permissions</Label><Select value={settings.inviteRole} onValueChange={value => set('inviteRole', value)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Manager">Manager</SelectItem><SelectItem value="Support Agent">Support Agent</SelectItem><SelectItem value="Super Administrator">Super Administrator</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label className="text-[9px] font-medium text-[#777b83]">Assign Regional Hub Restrictions</Label><Select value={settings.inviteRegion} onValueChange={value => set('inviteRegion', value)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All Hubs (Default)">All Hubs (Default)</SelectItem><SelectItem value="Doha Warehouse Zone 56">Doha Warehouse Zone 56</SelectItem><SelectItem value="Al Wakrah Hub">Al Wakrah Hub</SelectItem></SelectContent></Select></div>
        </div>
      </section>
    </div>}

    <div className="flex justify-end gap-2 pb-4"><Button type="button" variant="outline" onClick={discard} className="h-8 rounded-full border-[#dfe1e4] px-4 text-[9px]">Discard</Button><Button type="button" onClick={save} className="h-8 rounded-full bg-[#171819] px-4 text-[9px] text-white hover:bg-[#333]">Save Changes</Button></div>
  </div>;
}
