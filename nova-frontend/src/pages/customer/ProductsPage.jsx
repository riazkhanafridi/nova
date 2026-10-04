import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { ShoppingCart, SlidersHorizontal, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { getMediaUrl } from '../../lib/media';
import { addGuestCartItem } from '../../lib/cart';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);

  const image = product.ProductImages?.find((i) => i.isPrimary) || product.ProductImages?.[0];
  const imgSrc = getMediaUrl(image?.imageUrl) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';

  const badgeText = product.isBestSeller ? 'BEST SELLER' : product.isNewArrival ? 'NEW' : null;
  const brandName = product.Brand?.name || 'NOVA';

  useEffect(() => {
    if (!user || !product?.productId) return;

    api.get(`/wishlist/check/${product.productId}`)
      .then(({ data }) => setLiked(Boolean(data?.data?.wishlisted || data?.wishlisted)))
      .catch(() => setLiked(false));
  }, [user, product?.productId]);

  const toggleWishlist = async (e) => {
    e.stopPropagation();

    if (!user) {
      toast({ variant: 'destructive', title: 'Login required', description: 'Please sign in to save items to your wishlist.' });
      return;
    }

    try {
      const { data } = await api.post('/wishlist/toggle', { productId: product.productId });
      const nextLiked = Boolean(data?.data?.wishlisted ?? data?.wishlisted ?? !liked);
      setLiked(nextLiked);
      toast({
        title: nextLiked ? 'Added to wishlist' : 'Removed from wishlist',
        description: product.name,
      });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to update wishlist' });
    }
  };

  const addToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      addGuestCartItem(product, 1);
      toast({ title: 'Added to cart!', description: product.name });
      return;
    }
    try {
      await api.post('/cart/add', { productId: product.productId, quantity: 1 });
      toast({ title: 'Added to cart!', description: product.name });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to add to cart' });
    }
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.slug || ''}`)}
      className="group cursor-pointer rounded-3xl border border-neutral-200/70 bg-white p-4 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 mb-4 flex items-center justify-center">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {badgeText && (
            <span className="absolute top-3 left-3 bg-orange-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
              {badgeText}
            </span>
          )}

          <button
            type="button"
            onClick={toggleWishlist}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors shadow-xs"
            title={liked ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`h-4 w-4 stroke-[2] ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1 text-left">
          {brandName}
        </p>
        <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug line-clamp-2 mb-2 text-left group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <div>
          <span className="font-black text-neutral-900 text-base sm:text-lg">
            QAR {Number(product.price).toLocaleString()}
          </span>
        </div>

        <Button
          size="sm"
          className="rounded-full h-9 w-9 p-0 bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/25 transition-transform hover:scale-105 flex items-center justify-center"
          onClick={addToCart}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: categoriesData } = useFetch('/categories', { params: { parentOnly: true } });
  const { data: brandsData } = useFetch('/brands');

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];
  const selectedCategoryParam = searchParams.get('category');
  const selectedBrandParam = searchParams.get('brand');

  const selectedCategory = categories.find((category) =>
    category.slug === selectedCategoryParam || category.name.toLowerCase() === String(selectedCategoryParam || '').toLowerCase()
  );
  const selectedBrand = brands.find((brand) =>
    brand.slug === selectedBrandParam || brand.name.toLowerCase() === String(selectedBrandParam || '').toLowerCase()
  );

  const { data: productsData, loading } = useFetch('/products', {
    params: {
      limit: 48,
      categoryId: selectedCategory?.categoryId || undefined,
      brandId: selectedBrand?.brandId || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    },
  });

  const products = productsData?.data?.products || [];
  const totalProducts = productsData?.data?.pagination?.total || products.length;

  const categoryFilters = [{ label: 'All Products', val: null }, ...categories.slice(0, 6).map((category) => ({
    label: category.name,
    val: category.slug,
  }))];

  const handleCategoryChange = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('category', val); else next.delete('category');
    next.delete('brand');
    setSearchParams(next);
  };

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-[#FFF0E6] via-[#FFD4B8] to-[#FF6B2B] p-8 sm:p-12 lg:p-14 overflow-hidden shadow-xs border border-orange-100/60">
          <div className="max-w-xl text-left space-y-3 z-10 relative">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-orange-200/80 text-orange-600 font-bold text-xs tracking-wider uppercase backdrop-blur-sm shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>NOVA STORE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 leading-tight">
              All Products
            </h1>

            <p className="text-neutral-600 text-base sm:text-lg max-w-lg leading-relaxed font-normal">
              Curated from the world's top brands — tested and approved by our experts.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border border-neutral-200/70 shadow-xs space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-100">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-sm font-bold text-neutral-400 flex items-center gap-2 mr-1">
                <SlidersHorizontal className="h-4 w-4" /> Filter:
              </span>

              {categoryFilters.map((c) => (
                <button
                  key={c.label}
                  onClick={() => handleCategoryChange(c.val)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    (selectedCategoryParam || null) === c.val
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                      : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="text-xs sm:text-sm font-bold text-neutral-400">
              {loading ? 'Loading...' : `${totalProducts} products`}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {!loading && products.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center text-neutral-500">
                No products found for this selection.
              </div>
            )}

            {products.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-[#181310] via-[#5C2304] to-[#F95700] p-8 sm:p-10 lg:p-12 overflow-hidden shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-orange-950/30">
          <div className="space-y-1.5 max-w-xl z-10 text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Can't find what you need?
            </h2>
            <p className="text-white/80 text-sm sm:text-base font-normal">
              Our team can source any product directly from the brand.
            </p>
          </div>

          <Button
            onClick={() => navigate('/contact')}
            className="h-12 sm:h-14 px-7 sm:px-9 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-orange-600/30 transition-all hover:scale-105 cursor-pointer flex items-center gap-2 border-0 z-10 shrink-0"
          >
            Contact Our Team <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

