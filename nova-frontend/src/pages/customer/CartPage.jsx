import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/media';
import {
  clearGuestCart,
  getGuestCart,
  removeGuestCartItem,
  updateGuestCartItem,
  getCartItemPrice,
} from '../../lib/cart';
import { ShoppingCart, Trash2, Plus, Minus, ChevronLeft, Truck, MessageCircle, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data, loading, refetch } = useFetch(user ? '/cart' : null, { enabled: !!user });
  const [updating, setUpdating] = useState(null);
  const [guestCartItems, setGuestCartItems] = useState(() => getGuestCart());
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount, discountType, discountValue }

  useEffect(() => {
    if (!user) {
      const handleCartChange = () => setGuestCartItems(getGuestCart());
      handleCartChange();
      window.addEventListener('nova-cart-count-changed', handleCartChange);
      return () => window.removeEventListener('nova-cart-count-changed', handleCartChange);
    }

    setGuestCartItems([]);
  }, [user]);

  const cart = data?.data;
  const items = user ? (cart?.CartItems || []) : guestCartItems;

  // Real items only — no fake demo data
  const displayItems = items;

  const updateItemQty = async (item, newQty) => {
    if (newQty < 1) {
      return removeItem(item);
    }

    const id = item.cartItemId || item.productId;

    if (!user) {
      updateGuestCartItem(id, newQty);
      setGuestCartItems(getGuestCart());
      return;
    }

    setUpdating(id);
    try {
      await api.patch(`/cart/item/${id}`, { quantity: newQty });
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to update quantity.' });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (item) => {
    const id = item.cartItemId || item.productId;

    if (!user) {
      removeGuestCartItem(id);
      setGuestCartItems(getGuestCart());
      toast({ title: 'Item removed from cart' });
      return;
    }

    setUpdating(id);
    try {
      await api.delete(`/cart/item/${id}`);
      toast({ title: 'Item removed' });
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to remove item.' });
    } finally {
      setUpdating(null);
    }
  };

  const subtotal = displayItems.reduce((sum, item) => {
    return sum + getCartItemPrice(item) * (Number(item.quantity) || 1);
  }, 0);

  // Coupon discount calculation
  const couponDiscount = appliedCoupon
    ? (appliedCoupon.discountType === 'percentage'
        ? subtotal * (Number(appliedCoupon.discountValue) / 100)
        : Number(appliedCoupon.discountAmount || appliedCoupon.discountValue || 0))
    : 0;

  const vat = (subtotal - couponDiscount) * 0.1;
  const total = subtotal - couponDiscount + vat;

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const { data: res } = await api.post('/coupons/validate', {
        code,
        orderTotal: subtotal,
      });
      const coupon = res?.data || res;
      setAppliedCoupon({ ...coupon, code });
      toast({
        title: `Coupon "${code}" applied!`,
        description: coupon.discountType === 'percentage'
          ? `${coupon.discountValue}% discount applied`
          : `QAR ${Number(coupon.discountAmount || coupon.discountValue).toFixed(2)} off your order`,
      });
    } catch (err) {
      setAppliedCoupon(null);
      toast({ variant: 'destructive', title: 'Invalid coupon', description: err.response?.data?.message || 'This coupon code is not valid or has expired.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast({ title: 'Coupon removed' });
  };

  const waText = encodeURIComponent(
    `Hi! I would like to place an order for items in my cart:\n\nSubtotal: QAR ${subtotal.toFixed(0)}\nTotal: QAR ${total.toFixed(1)}\n\nPlease assist me.`
  );
  const waUrl = `https://wa.me/97412345678?text=${waText}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      
      {/* Empty Cart State */}
      {!loading && displayItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingCart className="h-20 w-20 text-slate-200 mb-5" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-sm text-slate-500 mb-6">Browse our products and add items to your cart.</p>
          <Button onClick={() => navigate('/products')} className="rounded-full bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold px-6">
            Explore Products
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 rounded-full border-b-2 border-[#FF5500] animate-spin" />
        </div>
      )}

      {!loading && displayItems.length > 0 && (
        <>
      {/* Breadcrumbs Navigation */}
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="h-auto p-0 text-slate-500 hover:text-slate-900 font-medium text-xs mr-1"
        >
          <ChevronLeft className="mr-0.5 h-3.5 w-3.5" /> Back
        </Button>
        <span>›</span>
        <Link to="/products" className="hover:text-slate-900 transition-colors">Products</Link>
        <span>›</span>
        <span className="font-bold text-slate-900">Shopping Cart</span>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-[28px] p-6 sm:p-9 border border-slate-200/70 shadow-xs mb-8">
        
        {/* Card Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Your Cart</h1>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              You have {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'} in your shopping cart
            </p>
          </div>
          <Link to="/products" className="text-[#FF5500] font-bold text-xs sm:text-sm hover:underline">
            Continue Shopping
          </Link>
        </div>

        {/* Main Grid: Left Items & Right Summary */}
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] pt-6">
          
          {/* Left Column: Cart Items List */}
          <div className="space-y-4">
            
            {displayItems.map((item, idx) => {
              const product = user ? item.Product : (item.Product || item);
              const image = product?.ProductImages?.find(i => i.isPrimary) || product?.ProductImages?.[0];
              const imgSrc = getMediaUrl(image?.imageUrl || item.imageUrl);
              const brand = product?.Brand?.name || 'NOVA';
              const name = product?.name || item.name;
              const price = getCartItemPrice(item);
              const comparePrice = item.comparePrice || product?.comparePrice;
              const variant = product?.variant || item.variant || 'Standard';

              return (
                <div
                  key={item.cartItemId || item.productId || idx}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300"
                >
                  {/* Left product info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
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
                      <p className="text-xs text-slate-400 mt-0.5 font-normal truncate">
                        {variant}
                      </p>
                    </div>
                  </div>

                  {/* Center Qty stepper */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">QTY</span>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-xl">
                      <button
                        onClick={() => updateItemQty(item, item.quantity - 1)}
                        className="h-6 w-6 rounded flex items-center justify-center text-slate-600 hover:bg-white transition-all"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-slate-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQty(item, item.quantity + 1)}
                        className="h-6 w-6 rounded flex items-center justify-center text-slate-600 hover:bg-white transition-all"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Right Price & Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[120px]">
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900 block whitespace-nowrap">
                        QAR {(price * item.quantity).toFixed(0)}
                      </span>
                      {comparePrice && (
                        <span className="text-xs text-slate-400 line-through block font-normal">
                          QAR {comparePrice}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => removeItem(item)}
                      className="h-8 w-8 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Delivery Banner */}
            <div className="bg-[#FFF6F0] border border-orange-200/60 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#FF5500] font-semibold mt-4">
              <Truck className="h-4 w-4 shrink-0" />
              <span>Congratulations! Your order qualifies for delivery across Qatar.</span>
            </div>

          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="space-y-4">
            
            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Order Summary</h2>

              {/* Cost breakdown */}
              <div className="space-y-3 text-xs border-b border-slate-200/60 pb-4">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">QAR {subtotal.toFixed(0)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-bold">-QAR {couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>VAT (10%)</span>
                  <span className="font-bold text-slate-900">QAR {vat.toFixed(1)}</span>
                </div>
              </div>

              {/* Coupon input */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">
                  Have a Coupon / Promo Code?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                    <span className="text-xs font-bold text-emerald-700 flex-1">✓ {appliedCoupon.code} applied</span>
                    <button onClick={handleRemoveCoupon} className="text-[10px] text-slate-500 hover:text-red-500 font-semibold transition-colors">Remove</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="h-10 bg-white rounded-xl border border-slate-200 text-xs px-3 text-slate-900 placeholder:text-slate-400 flex-1 focus-visible:ring-1 focus-visible:ring-orange-500"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="h-10 px-4 bg-black hover:bg-slate-800 text-white font-bold rounded-full text-xs transition-colors disabled:opacity-60"
                    >
                      {couponLoading ? <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Total row */}
              <div className="pt-3 border-t border-slate-200/60 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Total</span>
                  <span className="text-[11px] text-slate-400">Inclusive of VAT</span>
                </div>
                <span className="text-2xl font-black text-[#FF5500]">
                  QAR {total.toFixed(1)}
                </span>
              </div>

              {/* Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => navigate('/checkout', { state: { appliedCoupon, couponDiscount } })}
                  className="w-full h-12 bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold rounded-full text-sm shadow-md shadow-orange-500/20 transition-all active:scale-[0.99]"
                >
                  Proceed to Checkout
                </Button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 bg-white border border-slate-200 hover:bg-slate-50 text-emerald-600 font-bold rounded-full text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="h-4 w-4" /> Express Checkout with WhatsApp
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
      </> )} {/* end !loading && displayItems.length > 0 */}
    </div>
  );
}
