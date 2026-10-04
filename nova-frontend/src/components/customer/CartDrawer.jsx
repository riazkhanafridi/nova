import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '../ui/sheet';
import { Button } from '../ui/button';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { getMediaUrl } from '../../lib/media';
import { getGuestCart, getGuestCartCount, updateGuestCartItem, removeGuestCartItem } from '../../lib/cart';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, MessageCircle, X } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../hooks/use-toast';

export default function CartDrawer({ open, onOpenChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: cartData, refetch } = useFetch(user ? '/cart' : null, { enabled: !!user });
  const [guestCartItems, setGuestCartItems] = useState(getGuestCart());

  useEffect(() => {
    const handleCartCleared = () => {
      setGuestCartItems([]);
      if (user) refetch();
    };
    window.addEventListener('nova-cart-cleared', handleCartCleared);

    if (open) {
      if (user) {
        refetch();
      } else {
        setGuestCartItems(getGuestCart());
      }
    }
    return () => window.removeEventListener('nova-cart-cleared', handleCartCleared);
  }, [open, user]);

  const items = user
    ? (cartData?.data?.CartItems || [])
    : guestCartItems;

  const subtotal = items.reduce((sum, item) => {
    const price = user ? Number(item.price) : Number(item.price);
    return sum + (price * item.quantity);
  }, 0);

  const handleUpdateQty = async (item, newQty) => {
    if (newQty < 1) return;
    if (user) {
      try {
        await api.patch(`/cart/item/${item.cartItemId}`, { quantity: newQty });
        refetch();
      } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update quantity.' });
      }
    } else {
      updateGuestCartItem(item.productId || item.cartItemId, newQty);
      setGuestCartItems(getGuestCart());
    }
  };

  const handleRemove = async (item) => {
    if (user) {
      try {
        await api.delete(`/cart/item/${item.cartItemId}`);
        refetch();
      } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove item.' });
      }
    } else {
      removeGuestCartItem(item.productId);
      setGuestCartItems(getGuestCart());
    }
  };

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  const waText = encodeURIComponent(
    `Hi! I would like to place an order for items in my cart:\n\nTotal: QAR ${subtotal.toFixed(0)}\n\nPlease assist me.`
  );
  const waUrl = `https://wa.me/97412345678?text=${waText}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white border-l border-slate-200">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <SheetTitle className="text-xl font-extrabold text-slate-900 tracking-tight">Your Cart</SheetTitle>
            <p className="text-xs text-slate-500 font-medium">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Your cart is empty</h3>
              <p className="text-xs text-slate-500 mb-6">Explore our catalog to add products.</p>
              <Button onClick={() => { onOpenChange(false); navigate('/products'); }} className="rounded-full bg-black text-white font-bold text-xs px-6 py-2.5">
                Start Shopping
              </Button>
            </div>
          ) : (
            items.map((item, idx) => {
              const product = user ? item.Product : item;
              const image = product?.ProductImages?.find(i => i.isPrimary) || product?.ProductImages?.[0];
              const imgSrc = getMediaUrl(image?.imageUrl || product?.imageUrl);
              const brand = product?.Brand?.name || 'NOVA';
              const name = product?.name || item.name;
              const price = Number(user ? item.price : item.price);

              return (
                <div key={item.cartItemId || item.productId || idx} className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3.5">
                  <div className="h-16 w-16 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200/60 flex items-center justify-center">
                    {imgSrc ? (
                      <img src={imgSrc} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-slate-300" />
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider block">
                      {brand}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {name}
                    </h4>
                    
                    {/* Qty Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-1.5 py-0.5">
                        <button
                          onClick={() => handleUpdateQty(item, item.quantity - 1)}
                          className="h-5 w-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item, item.quantity + 1)}
                          className="h-5 w-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end justify-between h-full space-y-2">
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-black text-slate-900 whitespace-nowrap">
                      QAR {(price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-white space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-600">Subtotal</span>
              <span className="text-xl font-black text-slate-900">QAR {subtotal.toLocaleString()}</span>
            </div>
            
            <p className="text-[11px] text-slate-400 text-center">
              Free delivery across Qatar · VAT included
            </p>

            <div className="space-y-2">
              <Button
                onClick={handleCheckout}
                className="w-full h-12 bg-black hover:bg-slate-800 text-white font-bold rounded-full text-sm shadow-md transition-all"
              >
                Checkout
              </Button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 bg-[#111] hover:bg-black text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="h-4 w-4" /> Order via WhatsApp
              </a>

              <button
                onClick={() => onOpenChange(false)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 text-center block transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

      </SheetContent>
    </Sheet>
  );
}
