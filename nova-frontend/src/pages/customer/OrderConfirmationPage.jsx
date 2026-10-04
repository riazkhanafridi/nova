import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { getMediaUrl } from '../../lib/media';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Check, Truck, ShieldCheck, Download, ShoppingBag, Calendar, CreditCard, Clock, User, MapPin, Phone, Mail, Info } from 'lucide-react';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Retrieve order details passed via location state
  const stateData = location.state || {};
  const { data: myOrdersData } = useFetch(user && !stateData.items ? '/orders/my-orders' : null, { enabled: !!user && !stateData.items });
  
  const latestOrder = myOrdersData?.data?.[0] || null;
  const order = stateData.order || latestOrder;

  const shippingInfo = stateData.shippingInfo || (order?.shippingAddress ? {
    fullName: user?.fullName || 'Customer',
    email: user?.email || '',
    phone: user?.phone || '',
    address: `${order.shippingAddress.street}, ${order.shippingAddress.city}, Qatar`,
  } : {
    fullName: user?.fullName || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '+974 3333 4444',
    address: 'Villa 14, Al Waab Street, Near Villaggio Mall, Al Waab, Doha, Qatar',
  });

  const paymentMethodName = stateData.paymentMethodName || (order?.paymentMethod === 'card' ? 'Stripe Credit Card' : 'Cash on Delivery');

  const orderNumber = order?.orderNumber || (order?.orderId ? `NOVA-${order.orderId}` : 'NOVA-2026-8847');
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const rawItems = stateData.items || order?.OrderItems || order?.items || [];

  // Only show real order items — no fake demo data
  const items = rawItems;


  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * (item.quantity || 1)), 0);
  const vat = subtotal * 0.1;
  const total = Number(order?.totalAmount) || (subtotal + vat);

  const handleDownloadInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Breadcrumb navigation */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <span>›</span>
        <Link to="/cart" className="hover:text-slate-900 transition-colors">Shopping Cart</Link>
        <span>›</span>
        <Link to="/checkout" className="hover:text-slate-900 transition-colors">Checkout</Link>
        <span>›</span>
        <span className="font-bold text-slate-900">Order Confirmation</span>
      </div>

      {/* Top Order Confirmation Header Card */}
      <div className="bg-white rounded-[28px] p-8 text-center border border-slate-200/70 shadow-xs mb-8">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <Check className="h-7 w-7 stroke-[3]" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Confirmed!</h1>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Thank you for your purchase. We are processing your request.
        </p>
        <div className="mt-4">
          <span className="inline-block bg-[#FFF6F0] border border-orange-200/70 text-[#FF5500] text-xs font-bold px-4 py-2 rounded-full">
            Order Reference: #{orderNumber}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Summary */}
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Order Details Card */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200/70 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-5 font-normal">Key purchase & transaction records.</p>
            
            <div className="space-y-4 border-t border-b border-slate-100 py-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Calendar className="h-4 w-4 text-orange-500" /> Order Date
                </span>
                <span className="font-bold text-slate-900">{orderDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <CreditCard className="h-4 w-4 text-orange-500" /> Payment Method
                </span>
                <span className="font-bold text-slate-900">{paymentMethodName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock className="h-4 w-4 text-orange-500" /> Estimated Delivery
                </span>
                <span className="font-bold text-slate-900">2-3 Business Days</span>
              </div>
            </div>

            <div className="mt-4 bg-[#FFF6F0] border border-orange-200/60 rounded-xl p-3 flex items-center gap-2 text-xs text-[#FF5500] font-semibold">
              <Truck className="h-4 w-4 shrink-0" />
              <span>Eligible for FREE Qatar delivery</span>
            </div>
          </div>

          {/* Shipping Information Card */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200/70 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Shipping Information</h2>
            <div className="space-y-2.5 text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <span className="font-bold text-slate-900">{shippingInfo.fullName}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <span>{shippingInfo.address}</span>
              </div>
              {shippingInfo.phone && (
                <div className="flex items-center gap-6 pt-1">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{shippingInfo.phone}</span>
                  </div>
                  {shippingInfo.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{shippingInfo.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items Ordered Card */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200/70 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Items Ordered ({items.length})</h2>
            <div className="space-y-3">
              {items.map((item, idx) => {
                const product = item.Product || item;
                const image = product?.ProductImages?.find(i => i.isPrimary) || product?.ProductImages?.[0];
                const imgSrc = getMediaUrl(image?.imageUrl || item.imageUrl);
                const brand = item.brand || product?.Brand?.name || 'NOVA';
                const variant = item.variant || product?.variant || 'Default';
                const name = item.productName || product?.name || item.name;

                return (
                  <div key={item.orderItemId || idx} className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200/60 flex items-center justify-center">
                      {imgSrc ? (
                        <img src={imgSrc} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        <ShoppingBag className="h-7 w-7 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold text-[#FF5500] uppercase tracking-wider block">
                        {brand}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Qty: {item.quantity} | {variant}
                      </p>
                    </div>
                    <div className="text-right pl-2">
                      <span className="text-sm font-black text-slate-900 whitespace-nowrap">
                        QAR {(Number(item.price) * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          
          {/* Payment Summary Sidebar Card */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200/70 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Payment Summary</h2>
            
            <div className="space-y-3.5 text-sm border-b border-slate-100 pb-5">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">QAR {subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>VAT (10%)</span>
                <span className="font-bold text-slate-900">QAR {vat.toFixed(1)}</span>
              </div>
            </div>

            <div className="py-5 flex items-baseline justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 block">Total Paid</span>
                <span className="text-[11px] text-slate-400">Inclusive of VAT</span>
              </div>
              <span className="text-2xl font-black text-[#FF5500]">
                QAR {total.toFixed(1)}
              </span>
            </div>

            {/* Buttons */}
            <div className="space-y-2.5 pt-2">
              <Button
                onClick={() => navigate('/products')}
                className="w-full h-12 bg-black hover:bg-slate-800 text-white font-bold rounded-full text-sm shadow-md transition-all"
              >
                Continue Shopping
              </Button>
              
              <Button
                onClick={handleDownloadInvoice}
                variant="outline"
                className="w-full h-12 bg-white border border-slate-900 hover:bg-slate-50 text-slate-900 font-bold rounded-full text-sm transition-all flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" /> Download Invoice
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Info className="h-3 w-3 shrink-0" /> You will receive an email confirmation with tracking details shortly.
              </p>
            </div>
          </div>

          {/* Secure SSL Order Protection Badge Card */}
          <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>SECURE SSL ORDER PROTECTION</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Your order information is protected using modern end-to-end network encryption standards.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
