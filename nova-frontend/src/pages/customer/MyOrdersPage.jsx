import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Package, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/media';
import { useToast } from '../../hooks/use-toast';

const STATUS_COLOR = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-orange-100 text-orange-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function OrderCard({ order, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.post(`/orders/${order.orderId}/cancel`, { reason: 'Customer requested cancellation' });
      toast({ title: 'Order cancelled' });
      onCancel();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to cancel', description: err.response?.data?.message });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="rounded-[1.5rem] border border-neutral-200/70 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-sm text-neutral-900">#{order.orderNumber}</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_COLOR[order.orderStatus] || 'bg-neutral-100 text-neutral-600'}`}>
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-black text-lg text-neutral-900">QAR {Number(order.totalAmount).toFixed(2)}</span>
            {order.orderStatus === 'pending' && (
              <Button size="sm" variant="destructive" onClick={handleCancel} disabled={cancelling} className="rounded-full">
                {cancelling ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Cancel'}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setExpanded(e => !e)} className="rounded-full">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-neutral-100 px-5 py-4 bg-neutral-50/80 space-y-4">
          <div className="space-y-3">
            {order.OrderItems?.map(item => {
              const image = item.Product?.ProductImages?.find(i => i.isPrimary) || item.Product?.ProductImages?.[0];
              const imgSrc = getMediaUrl(image?.imageUrl);
              return (
                <div key={item.orderItemId} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-200 shrink-0">
                    {imgSrc ? <img src={imgSrc} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-200 flex items-center justify-center"><Package className="h-5 w-5 text-neutral-400" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1 text-neutral-900">{item.productName}</p>
                    <p className="text-xs text-neutral-500">Qty: {item.quantity} × QAR {Number(item.price).toFixed(2)}</p>
                  </div>
                  <span className="text-sm font-bold text-neutral-900">QAR {(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-neutral-200 pt-3 text-sm space-y-1">
            <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>QAR {Number(order.subTotal).toFixed(2)}</span></div>
            {Number(order.discountAmount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-QAR {Number(order.discountAmount).toFixed(2)}</span></div>}
            <div className="flex justify-between text-neutral-500"><span>Shipping</span><span>{Number(order.shippingFee) === 0 ? 'Free' : `QAR ${Number(order.shippingFee).toFixed(2)}`}</span></div>
            <div className="flex justify-between font-black text-base pt-1 border-t border-neutral-200 text-neutral-900"><span>Total</span><span>QAR {Number(order.totalAmount).toFixed(2)}</span></div>
          </div>
          {order.shippingAddress && (
            <div className="text-sm">
              <p className="font-semibold mb-0.5 text-neutral-700">Shipping to:</p>
              <p className="text-neutral-500">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.country}</p>
            </div>
          )}
          {order.trackingNumber && (
            <div className="text-sm">
              <p className="font-semibold mb-0.5 text-neutral-700">Tracking:</p>
              <p className="text-neutral-500 font-mono">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  const { data, loading, refetch } = useFetch('/orders/my-orders');
  const orders = data?.data?.orders || (Array.isArray(data?.data) ? data.data : []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">My Account</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-900">My Orders</h1>
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 rounded-[2rem] border border-neutral-200/70 bg-white">
          <Package className="h-20 w-20 mx-auto text-neutral-200 mb-6" />
          <h2 className="text-2xl font-black text-neutral-900 mb-2">No orders yet</h2>
          <p className="text-neutral-500">When you place orders, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => <OrderCard key={order.orderId} order={order} onCancel={refetch} />)}
        </div>
      )}
    </div>
  );
}
