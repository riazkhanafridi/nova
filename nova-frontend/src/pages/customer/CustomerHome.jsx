import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  ArrowRight,
  Star,
  ShoppingCart,
  Zap,
  Shield,
  Headphones,
  Cpu,
  Sparkles,
  Truck,
  RotateCcw,
  ShieldCheck,
  Clock,
  ChevronRight,
  Heart
} from 'lucide-react';
import { getMediaUrl } from '../../lib/media';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';

const CategoryIcon = ({ name }) => {
  const map = { Audio: Headphones, Mobile: Zap, Computer: Cpu, Accessories: Shield };
  const Icon = map[name] || ShoppingCart;
  return <Icon className="h-6 w-6 text-orange-600" />;
};

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);

  const image = product.ProductImages?.find((i) => i.isPrimary) || product.ProductImages?.[0];
  const imgSrc = getMediaUrl(image?.imageUrl) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';

  const badgeText = product.isBestSeller ? 'BEST SELLER' : product.isNewArrival ? 'NEW ARRIVAL' : null;
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
        <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug line-clamp-1 mb-2 text-left group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <span className="font-black text-neutral-900 text-base sm:text-lg">
          QAR {Number(product.price).toLocaleString()}
        </span>

        <Button
          size="sm"
          className="rounded-full h-9 w-9 p-0 bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/25 transition-transform hover:scale-105 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/products/${product.slug || ''}`);
          }}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CustomerHome() {
  const navigate = useNavigate();
  const { data: featuredData } = useFetch('/products/featured', { params: { limit: 8 } });
  const { data: newArrivalsData } = useFetch('/products/new-arrivals', { params: { limit: 4 } });
  const { data: bestSellersData } = useFetch('/products/best-sellers', { params: { limit: 4 } });
  const { data: bannersData } = useFetch('/banners/active');
  const { data: categoriesData } = useFetch('/categories', { params: { parentOnly: true } });

  const featured = featuredData?.data || [];
  const newArrivals = newArrivalsData?.data || [];
  const bestSellers = bestSellersData?.data || [];
  const banners = bannersData?.data || [];
  const categories = categoriesData?.data || [];

  const curatedCategories = categories.slice(0, 5).map((category) => ({
    name: category.name,
    count: `${category.subCategories?.length || 0} subcategories`,
    img: getMediaUrl(category.image) || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    link: `/products?category=${encodeURIComponent(category.slug)}`,
  }));

  const heroBanner = banners[0];
  const heroImage = heroBanner?.image ? getMediaUrl(heroBanner.image) : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80';

  const dealsProducts = [...featured, ...newArrivals].slice(0, 4);
  const bestSellersProducts = bestSellers.slice(0, 4);

  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 38, seconds: 56 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen pb-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-[#FFF0E6] via-[#FFD4B8] to-[#FF6B2B] p-6 sm:p-10 lg:p-14 overflow-hidden shadow-xs border border-orange-100/60">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-10">
            <div className="space-y-6 text-left z-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-orange-200/80 text-orange-600 font-bold text-xs tracking-wider uppercase backdrop-blur-sm shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{heroBanner?.title || 'NEW COLLECTION'}</span>
              </div>

              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 leading-[1.1]">
                  {heroBanner?.subtitle || 'Elevate Your'}
                </h1>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-orange-600 leading-[1.1]">
                  {heroBanner?.link ? 'Digital Life.' : 'Digital Life.'}
                </h1>
              </div>

              <p className="text-neutral-700 text-base sm:text-lg leading-relaxed max-w-lg">
                Premium gadgets, accessories, and expert support tailored for work, home, and daily tech life in Qatar.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => navigate('/products')} className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 py-3 font-bold shadow-lg shadow-orange-500/25">
                  Shop Collection
                </Button>
                <Button variant="outline" onClick={() => navigate('/brands')} className="rounded-full border-neutral-200 bg-white/70 text-neutral-800 hover:text-neutral-900 px-6 py-3 font-bold">
                  Explore Brands
                </Button>
              </div>
            </div>

            <div className="relative z-10">
              <div className="rounded-[2rem] overflow-hidden border border-white/70 shadow-2xl bg-white/20 backdrop-blur-sm">
                <img src={heroImage} alt={heroBanner?.title || 'Nova collection'} className="h-[360px] w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] uppercase text-orange-600">shop by category</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-900">Featured Categories</h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700 hover:text-orange-600">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {curatedCategories.map((category) => (
            <Link
              key={category.name}
              to={category.link}
              className="group relative overflow-hidden rounded-[2rem] bg-white p-3 shadow-xs border border-neutral-200/70 hover:shadow-xl transition-all"
            >
              <div className="aspect-[4/4.6] overflow-hidden rounded-[1.4rem]">
                <img src={category.img} alt={category.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-neutral-900">{category.name}</h3>
                  <p className="text-xs font-medium text-neutral-500">{category.count}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                  <CategoryIcon name={category.name} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="rounded-[2.5rem] border border-neutral-200/70 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-600">deals of the day</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-900">Hot Deals</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase text-orange-700">
              <Clock className="h-3.5 w-3.5" />
              {formatNumber(timeLeft.hours)} : {formatNumber(timeLeft.minutes)} : {formatNumber(timeLeft.seconds)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {dealsProducts.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] uppercase text-orange-600">best sellers</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-900">Most Loved Products</h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700 hover:text-orange-600">
            Browse more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bestSellersProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="rounded-[2.5rem] bg-[#18181B] p-8 text-white shadow-xl border border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">why choose nova</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Built for everyday tech life</h2>
            </div>
            <Button onClick={() => navigate('/contact')} className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 py-3 font-bold">
              Talk to Experts
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[{ label: 'Fast shipping', icon: Truck, text: 'Same-day dispatch on selected items' }, { label: 'Secure checkout', icon: ShieldCheck, text: 'Protected payments and trusted logistics' }, { label: 'Easy returns', icon: RotateCcw, text: 'Simple return window and support' }, { label: 'Expert support', icon: Headphones, text: 'Local assistance before and after purchase' }].map(({ label, icon: Icon, text }) => (
              <div key={label} className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{label}</h3>
                <p className="mt-2 text-sm text-neutral-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
