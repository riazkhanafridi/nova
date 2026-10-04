import { Heart, ShoppingCart, ArrowRight, Package, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/media';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, loading, refetch } = useFetch('/wishlist');
  const items = data?.data?.items || [];

  const removeFromWishlist = async (productId) => {
    try {
      await api.post('/wishlist/toggle', { productId });
      toast({ title: 'Removed from wishlist' });
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Could not update wishlist' });
    }
  };

  const addToCart = async (product) => {
    try {
      await api.post('/cart/add', { productId: product.productId, quantity: 1 });
      toast({ title: 'Added to cart!', description: product.name });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to add to cart' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">My Account</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-900">My Wishlist</h1>
        </div>
        {!loading && items.length > 0 && (
          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700">
            {items.length} saved item{items.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[2rem] border border-neutral-200/70 bg-white px-6 py-16 text-center shadow-xs">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Heart className="h-9 w-9" />
          </div>
          <h2 className="mt-6 text-2xl font-black text-neutral-900">Your wishlist is empty</h2>
          <p className="mt-2 text-neutral-500">Tap the heart on any product to save it here for later.</p>
          <Button onClick={() => navigate('/products')} className="mt-6 rounded-full bg-orange-600 hover:bg-orange-700 text-white">
            Browse products <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {items.map(({ product }) => {
            const image = product?.images?.[0] || product?.ProductImages?.[0];
            const imageUrl = getMediaUrl(image?.imageUrl || image?.url);

            return (
              <div key={product.productId} className="overflow-hidden rounded-[1.75rem] border border-neutral-200/70 bg-white shadow-xs transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.productId)}
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm transition-transform hover:scale-105"
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="h-4 w-4 fill-red-500" />
                  </button>

                  <div className="aspect-square overflow-hidden bg-neutral-100">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-neutral-400">
                        <Package className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                      {product.brand?.name || 'NOVA'}
                    </p>
                    <Link to={`/products/${product.slug}`} className="mt-1 block text-base font-bold text-neutral-900 transition-colors hover:text-orange-600">
                      {product.name}
                    </Link>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="text-lg font-black text-neutral-900">
                      QAR {Number(product.price).toLocaleString()}
                    </span>

                    <Button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="rounded-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
