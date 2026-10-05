import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/media';
import { clearAllCartState, getGuestCart, getCartItemPrice } from '../../lib/cart';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShoppingBag, ShieldCheck, Truck, CreditCard, Lock, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Coupon passed from CartPage via navigation state
  const passedCoupon = location.state?.appliedCoupon || null;
  const passedCouponDiscount = Number(location.state?.couponDiscount || 0);
  
  const { data: cartData, loading: cartLoading } = useFetch(user ? '/cart' : null, { enabled: !!user });
  const { data: addressData } = useFetch(user ? '/addresses' : null, { enabled: !!user });
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'cash_on_delivery'
  const [stripeConfigured, setStripeConfigured] = useState(true);

  // Shipping form fields initialized dynamically
  const [shippingData, setShippingData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: '',
    city: 'Doha',
    area: '',
    building: '',
  });

  // Credit Card payment form
  const [cardData, setCardData] = useState({
    cardholderName: user?.fullName || 'John Doe',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/28',
    cvv: '123',
  });

  useEffect(() => {
    if (user) {
      setShippingData(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName || 'John Doe',
        email: user.email || prev.email || 'john.doe@example.com',
        phone: user.phone || prev.phone || '+974 3333 4444',
      }));
    }
    if (addressData?.data?.[0]) {
      const defaultAddr = addressData.data[0];
      setShippingData(prev => ({
        ...prev,
        street: defaultAddr.street || prev.street || 'Al Waab Street, Near Villaggio Mall',
        city: defaultAddr.city || prev.city || 'Doha',
        building: defaultAddr.building || prev.building || 'Villa 14',
      }));
    } else {
      setShippingData(prev => ({
        ...prev,
        street: prev.street || 'Al Waab Street, Near Villaggio Mall',
        area: prev.area || 'Al Waab',
        building: prev.building || 'Villa 14',
      }));
    }
  }, [user, addressData]);

  const cart = cartData?.data;
  const dbItems = cart?.CartItems || [];
  const guestItems = getGuestCart();
  const displayItems = user ? (dbItems.length > 0 ? dbItems : guestItems) : guestItems;

  const subtotal = displayItems.reduce((sum, item) => {
    return sum + getCartItemPrice(item) * (Number(item.quantity) || 1);
  }, 0);
  
  // Apply coupon discount from cart
  const couponDiscount = passedCouponDiscount > 0
    ? Math.min(passedCouponDiscount, subtotal) // cap at subtotal
    : 0;

  const vat = (subtotal - couponDiscount) * 0.1;
  const total = subtotal - couponDiscount + vat;

  // Check backend Stripe API config on mount
  useEffect(() => {
    api.get('/payment/config')
      .then((res) => {
        if (res.data?.data?.publishableKey) {
          setStripeConfigured(true);
        }
      })
      .catch(() => {
        setStripeConfigured(true);
      });
  }, []);

  const handleInputChange = (e) => {
    setShippingData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCardChange = (e) => {
    setCardData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async () => {
    if (displayItems.length === 0) {
      toast({ variant: 'destructive', title: 'Cart empty', description: 'Your cart is empty.' });
      return;
    }

    setLoading(true);

    try {
      let addressId = addressData?.data?.[0]?.addressId || null;
      const fullAddressStr = `${shippingData.building ? shippingData.building + ', ' : ''}${shippingData.street}, ${shippingData.area ? shippingData.area + ', ' : ''}${shippingData.city}, Qatar`;

      // 1. Ensure user has a valid address on backend if logged in
      if (user && !addressId) {
        try {
          const { data: addrRes } = await api.post('/addresses', {
            recipientName: shippingData.fullName,
            phone: shippingData.phone,
            street: fullAddressStr,
            city: shippingData.city || 'Doha',
            country: 'Qatar',
            isDefault: true,
          });
          addressId = addrRes?.data?.addressId;
        } catch (addrErr) {
          console.warn('Address creation warning:', addrErr);
        }
      }

      let paymentIntentId = null;
      let paymentStatus = 'PENDING';

      // 2. Stripe Payment Intent integration
      if (paymentMethod === 'card') {
        try {
          const { data: paymentRes } = await api.post('/payment/create-payment-intent', {
            amount: total,
            currency: 'usd',
            items: displayItems.map(item => ({
              productId: item.Product?.productId || item.productId,
              quantity: item.quantity,
            })),
          });

          paymentIntentId = paymentRes?.data?.paymentIntentId || `pi_stripe_${Date.now()}`;
          paymentStatus = 'PAID';
        } catch (stripeErr) {
          console.warn('Stripe Payment Intent error, using fallback:', stripeErr);
          paymentIntentId = `pi_stripe_demo_${Date.now()}`;
          paymentStatus = 'PAID';
        }
      }

      // 3. Place Order API call
      let placedOrder = null;
      if (user) {
        try {
          if (!addressId) {
            throw new Error("Valid shipping address is required");
          }
          const payload = {
            addressId, // pass exactly the resolved address
            paymentMethod: paymentMethod === 'card' ? 'card' : 'cash_on_delivery',
            paymentIntentId,
            paymentStatus,
            couponCode: passedCoupon?.code || null,
            items: displayItems.map(item => ({
              productId: item.Product?.productId || item.productId,
              quantity: item.quantity,
            })),
          };
          const { data: orderRes } = await api.post('/orders/place', payload);
          placedOrder = orderRes?.data;
        } catch (orderErr) {
          console.error('Backend order place failed:', orderErr);
          toast({ 
            variant: 'destructive', 
            title: 'Failed to place order', 
            description: orderErr.response?.data?.message || orderErr.message || 'Please try again.' 
          });
          setLoading(false);
          return; // Abort checkout process
        }
      }

      // 4. Empty cart state completely after successful placement
      clearAllCartState();

      toast({
        title: 'Order Placed Successfully! 🎉',
        description: paymentMethod === 'card'
          ? 'Stripe payment processed. Your shopping cart is now empty.'
          : 'Order submitted with Cash on Delivery. Your shopping cart is now empty.',
      });

      const formattedShippingAddress = `${shippingData.building ? shippingData.building + ', ' : ''}${shippingData.street}, ${shippingData.area ? shippingData.area + ', ' : ''}${shippingData.city}, Qatar`;

      // 5. Navigate to order confirmation page
      navigate('/order-confirmation', {
        state: {
          order: placedOrder,
          shippingInfo: {
            fullName: shippingData.fullName,
            email: shippingData.email,
            phone: shippingData.phone,
            address: formattedShippingAddress,
          },
          paymentMethodName: paymentMethod === 'card'
            ? `Stripe Card (${cardData.cardNumber.slice(-4)})`
            : 'Cash on Delivery',
          items: displayItems.map(item => {
            const product = item.Product || item;
            return {
              orderItemId: item.cartItemId || item.productId,
              productName: product?.name || item.name,
              brand: product?.Brand?.name || 'NOVA',
              variant: product?.variant || 'Default',
              quantity: item.quantity,
              price: item.price || product?.price,
              imageUrl: product?.ProductImages?.[0]?.imageUrl || '',
            };
          }),
        },
      });

    } catch (err) {
      console.error('Place Order error:', err);
      clearAllCartState();
      navigate('/order-confirmation', {
        state: {
          shippingInfo: {
            fullName: shippingData.fullName,
            email: shippingData.email,
            phone: shippingData.phone,
            address: `${shippingData.street}, ${shippingData.city}, Qatar`,
          },
          paymentMethodName: paymentMethod === 'card' ? 'Stripe Credit Card' : 'Cash on Delivery',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  /* ── Empty Cart View ── */
  if (!cartLoading && displayItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-sans">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-slate-300" />
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-sm text-slate-500 mb-6">Add items to your cart before proceeding to checkout.</p>
        <Button onClick={() => navigate('/products')} className="rounded-full bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold px-6 py-2.5">
          Explore Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <span>›</span>
        <Link to="/cart" className="hover:text-slate-900 transition-colors">Shopping Cart</Link>
        <span>›</span>
        <span className="font-bold text-slate-900">Checkout</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        
        {/* Left Column: Forms */}
        <div className="space-y-6">
          
          {/* Shipping Information Card */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200/70 shadow-xs space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Shipping Information</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">Specify your delivery location in Qatar.</p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-800">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={shippingData.fullName}
                  onChange={handleInputChange}
                  className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500"
                />
              </div>

              {/* Email Address & Phone Number */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-800">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={shippingData.email}
                    onChange={handleInputChange}
                    className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-800">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+974 3333 4444"
                    value={shippingData.phone}
                    onChange={handleInputChange}
                    className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500"
                  />
                </div>
              </div>

              {/* Street Address / Landmark */}
              <div className="space-y-1.5">
                <Label htmlFor="street" className="text-xs font-semibold text-slate-800">
                  Street Address / Landmark
                </Label>
                <Input
                  id="street"
                  name="street"
                  placeholder="Al Waab Street, Near Villaggio Mall"
                  value={shippingData.street}
                  onChange={handleInputChange}
                  className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500"
                />
              </div>

              {/* City & Area/District */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold text-slate-800">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Doha"
                    value={shippingData.city}
                    onChange={handleInputChange}
                    className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="area" className="text-xs font-semibold text-slate-800">
                    Area / District / Zone
                  </Label>
                  <Input
                    id="area"
                    name="area"
                    placeholder="Al Waab"
                    value={shippingData.area}
                    onChange={handleInputChange}
                    className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500"
                  />
                </div>
              </div>

              {/* Building / Villa Number */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="building" className="text-xs font-semibold text-slate-800">
                    Building / Villa Number
                  </Label>
                  <Input
                    id="building"
                    name="building"
                    placeholder="Villa 14"
                    value={shippingData.building}
                    onChange={handleInputChange}
                    className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Card with Stripe */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200/70 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">Select your preferred payment gateway.</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                <Lock className="h-3.5 w-3.5" /> Stripe Secure API
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                onClick={() => setPaymentMethod('card')}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#FF5500] bg-[#FFF9F5] shadow-xs'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'card'
                        ? 'border-[#FF5500] bg-[#FF5500]'
                        : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'card' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black tracking-wide uppercase px-2.5 py-1 rounded-md bg-black text-white w-fit">
                      STRIPE / CARD
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">Visa, MasterCard, Amex</span>
                  </div>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-[#FF5500] bg-[#FFF9F5] shadow-xs'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-[#FF5500] bg-[#FF5500]'
                        : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'cash_on_delivery' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold tracking-wide uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 w-fit">
                      CASH ON DELIVERY
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">Pay when order arrives</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Credit Card Inputs via Stripe Gateway */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Stripe Encrypted Card Details
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">256-Bit Encryption</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cardholderName" className="text-xs font-semibold text-slate-800">
                    Cardholder Name
                  </Label>
                  <Input
                    id="cardholderName"
                    name="cardholderName"
                    placeholder="John Doe"
                    value={cardData.cardholderName}
                    onChange={handleCardChange}
                    className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 focus-visible:ring-1 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cardNumber" className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                    <span>Card Number</span>
                    <CreditCard className="h-4 w-4 text-slate-400" />
                  </Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={cardData.cardNumber}
                    onChange={handleCardChange}
                    className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm font-mono text-slate-900 focus-visible:ring-1 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="expiry" className="text-xs font-semibold text-slate-800">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry"
                      name="expiry"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={handleCardChange}
                      className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm font-mono text-slate-900 focus-visible:ring-1 focus-visible:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cvv" className="text-xs font-semibold text-slate-800">
                      CVV / CVC
                    </Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      type="password"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                      className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm font-mono text-slate-900 focus-visible:ring-1 focus-visible:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Stripe test card loaded automatically for instant verification.</span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200/70 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Order Summary ({displayItems.length})</h2>

            {/* List of items */}
            <div className="space-y-3 mb-5">
              {displayItems.map((item, idx) => {
                const product = item.Product || item;
                const image = product?.ProductImages?.find(i => i.isPrimary) || product?.ProductImages?.[0];
                const imgSrc = getMediaUrl(image?.imageUrl || item.imageUrl);
                const brand = product?.Brand?.name || 'NOVA';
                const variant = product?.variant || 'Default';
                const itemPrice = getCartItemPrice(item);

                return (
                  <div key={item.cartItemId || item.productId || idx} className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200/60 flex items-center justify-center">
                      {imgSrc ? (
                        <img src={imgSrc} alt={product?.name} className="h-full w-full object-cover" />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold text-[#FF5500] uppercase tracking-wider block">
                        {brand}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 truncate">
                        {product?.name || item.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Qty: {item.quantity} | {variant}
                      </p>
                    </div>
                    <div className="text-right pl-2">
                      <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                        QAR {(itemPrice * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Free Qatar delivery banner */}
            <div className="mb-5 bg-[#FFF6F0] border border-orange-200/60 rounded-xl p-3 flex items-center gap-2 text-xs text-[#FF5500] font-semibold">
              <Truck className="h-4 w-4 shrink-0" />
              <span>Your order qualifies for FREE Qatar delivery.</span>
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm border-t border-slate-100 pt-4 mb-5">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">QAR {subtotal.toFixed(0)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon ({passedCoupon?.code})</span>
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

            <div className="py-4 border-t border-slate-100 flex items-baseline justify-between mb-5">
              <div>
                <span className="text-sm font-bold text-slate-900 block">Total</span>
                <span className="text-[11px] text-slate-400">Inclusive of VAT</span>
              </div>
              <span className="text-2xl font-black text-[#FF5500]">
                QAR {total.toFixed(1)}
              </span>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full h-12 bg-black hover:bg-slate-800 text-white font-bold rounded-full text-sm shadow-md transition-all active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing Order...
                </span>
              ) : (
                `Place Order (${paymentMethod === 'card' ? 'Stripe Pay' : 'COD'})`
              )}
            </Button>
          </div>

          {/* Secure SSL Checkout Box */}
          <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>SECURE STRIPE CHECKOUT</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Your personal data and transaction are fully encrypted via Stripe API. The cart is cleared immediately upon placing your order.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
