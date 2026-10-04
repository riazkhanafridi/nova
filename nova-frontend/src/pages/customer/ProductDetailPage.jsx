import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/media';
import { addGuestCartItem } from '../../lib/cart';
import {
  ShoppingCart, ShoppingBag, Star, ChevronLeft, Plus, Minus,
  Package, Heart, Share2, Check, MessageCircle, Truck, ShieldCheck, RefreshCw, Info, MessageSquare
} from 'lucide-react';
import CartDrawer from '../../components/customer/CartDrawer';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data, loading } = useFetch(slug ? `/products/${slug}` : null);
  const product = data?.data;
  const { data: reviewsData, loading: reviewsLoading, refetch: refetchReviews } = useFetch(product?.productId ? `/reviews/product/${product.productId}` : null);

  const reviewPayload = Array.isArray(reviewsData?.data)
    ? { reviews: reviewsData.data }
    : (reviewsData?.data?.data ?? reviewsData?.data ?? {});

  useEffect(() => {
    if (!user || !product?.productId) return;

    api.get(`/wishlist/check/${product.productId}`)
      .then(({ data: wishlistData }) => setLiked(Boolean(wishlistData?.data?.wishlisted || wishlistData?.wishlisted)))
      .catch(() => setLiked(false));
  }, [user, product?.productId]);

  const reviews = Array.isArray(reviewPayload.reviews)
    ? reviewPayload.reviews
    : (Array.isArray(product?.Reviews) ? product.Reviews : []);

  const reviewsCount = product?.reviewCount || reviews.length || 0;
  const averageRating = product?.averageRating
    ? Number(product.averageRating)
    : (reviews.length > 0 ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length : 5.0);

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      <div className="grid lg:grid-cols-2 animate-pulse rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm bg-white">
        <div className="min-h-[400px] bg-slate-800" />
        <div className="p-8 space-y-5">
          <div className="h-4 w-20 rounded-full bg-slate-200" />
          <div className="h-9 w-3/4 rounded-xl bg-slate-200" />
          <div className="h-4 w-1/2 rounded-xl bg-slate-200" />
          <div className="h-14 rounded-xl bg-slate-200" />
          <div className="h-12 rounded-2xl bg-orange-100" />
          <div className="h-12 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center font-sans">
      <Package className="mx-auto mb-4 h-16 w-16 text-slate-300" />
      <h2 className="mb-2 text-2xl font-bold text-slate-900">Product not found</h2>
      <p className="text-sm text-slate-500 mb-6">The product you are looking for does not exist or has been removed.</p>
      <Button onClick={() => navigate('/products')} className="rounded-full bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold px-6 py-2.5">
        Back to Products
      </Button>
    </div>
  );

  const images = product.ProductImages || [];
  const activeImage = images[selectedImg] || images[0];
  const imgSrc = activeImage ? getMediaUrl(activeImage.imageUrl) : null;
  const discount = product.comparePrice && Number(product.comparePrice) > Number(product.price)
    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
    : null;
  const inStock = Number(product.quantity || 0) > 0;

  /* ── Specifications parsing ── */
  let specsObj = {};
  if (product.specifications) {
    if (typeof product.specifications === 'object') {
      specsObj = product.specifications;
    } else {
      try {
        specsObj = JSON.parse(product.specifications);
      } catch {
        specsObj = {};
      }
    }
  }

  // Fallback nicely formatted specs from dynamic fields if specifications object is empty
  if (Object.keys(specsObj).length === 0) {
    if (product.Brand?.name) specsObj['BRAND'] = product.Brand.name;
    if (product.Category?.name) specsObj['CATEGORY'] = product.Category.name;
    if (product.sku) specsObj['SKU / MODEL'] = product.sku;
    specsObj['AVAILABILITY'] = inStock ? 'In Stock — Ready to ship' : 'Out of Stock';
  }

  /* ── Add to cart ── */
  const toggleWishlist = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Login required', description: 'Please sign in to save items to your wishlist.' });
      return;
    }

    try {
      const { data: res } = await api.post('/wishlist/toggle', { productId: product.productId });
      const nextLiked = Boolean(res?.data?.wishlisted ?? res?.wishlisted ?? !liked);
      setLiked(nextLiked);
      toast({
        title: nextLiked ? 'Added to wishlist' : 'Removed from wishlist',
        description: product.name,
      });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to update wishlist' });
    }
  };

  const addToCart = async () => {
    if (authLoading) return;
    setAddingToCart(true);
    try {
      if (!user) {
        addGuestCartItem(product, quantity);
      } else {
        await api.post('/cart/add', { productId: product.productId, quantity });
      }
      toast({ title: 'Added to cart!', description: `${quantity}× ${product.name}` });
      setAddedToCart(true);
      setCartDrawerOpen(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to add to cart' });
    } finally {
      setAddingToCart(false);
    }
  };

  /* ── WhatsApp ── */
  const waText = encodeURIComponent(
    `Hi! I'm interested in:\n\n*${product.name}*\nPrice: QAR ${Number(product.price).toLocaleString()}\nQty: ${quantity}\n\nPlease confirm availability.`
  );
  const waUrl = `https://wa.me/97412345678?text=${waText}`;

  /* ── Share ── */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast({ title: 'Link copied to clipboard!' }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      
      {/* ── Cart Drawer ── */}
      <CartDrawer open={cartDrawerOpen} onOpenChange={setCartDrawerOpen} />

      {/* ── Breadcrumb Navigation ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium bg-white rounded-full px-4 py-2.5 border border-slate-200/70 shadow-2xs w-fit">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-auto p-0 text-slate-500 hover:text-slate-900 font-medium text-xs mr-1"
          >
            <ChevronLeft className="mr-0.5 h-3.5 w-3.5" /> Back
          </Button>
          <span>›</span>
          <Link to="/products" className="hover:text-slate-900">Products</Link>
          <span>›</span>
          <span className="hover:text-slate-900">{product.Category?.name || 'Accessories'}</span>
          <span>›</span>
          <span className="font-bold text-slate-900 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* ── Main Product Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-2 rounded-[28px] overflow-hidden border border-slate-200/80 shadow-sm bg-white">

          {/* ══ LEFT — Image viewer ══ */}
          <div className="relative bg-slate-900 flex flex-col p-6 sm:p-8">
            <div className="relative flex-1 flex items-center justify-center min-h-[360px] sm:min-h-[440px]">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="max-h-[380px] w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] select-none transition-transform duration-300 hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center rounded-3xl bg-slate-800">
                  <ShoppingCart className="h-20 w-20 text-slate-600" />
                </div>
              )}

              {/* Top Action Buttons */}
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <button
                  onClick={toggleWishlist}
                  title={liked ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <Heart className={`h-4 w-4 transition-all ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  title="Share"
                  className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {/* Discount Badge */}
              {discount && (
                <span className="absolute top-2 left-2 bg-[#FF5500] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-3 pt-4 overflow-x-auto justify-start">
                {images.map((img, idx) => (
                  <button
                    key={img.imageId || idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      idx === selectedImg
                        ? 'border-[#FF5500] opacity-100 scale-105 shadow-md'
                        : 'border-white/20 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={getMediaUrl(img.imageUrl)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ══ RIGHT — Product Details ══ */}
          <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white space-y-6">
            
            <div className="space-y-4">
              {/* Brand + SKU */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#FF5500]">
                  {product.Brand?.name || 'NOVA'}
                </span>
                {product.sku && (
                  <span className="text-[11px] text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                    {product.sku}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Star Ratings */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s <= Math.round(averageRating) ? 'fill-[#FF5500] text-[#FF5500]' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-900">{Number(averageRating).toFixed(1)}</span>
                <span className="text-xs text-slate-400 font-medium">({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})</span>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-xs sm:text-sm leading-relaxed text-slate-500 font-normal">
                  {product.shortDescription}
                </p>
              )}

              {/* Price Row */}
              <div className="pt-2 flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  QAR {Number(product.price).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-medium">Incl. VAT</span>
                {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                  <span className="text-lg text-slate-400 line-through font-normal ml-2">
                    QAR {Number(product.comparePrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 pt-1">
                <span className={`h-2.5 w-2.5 rounded-full ${inStock ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                <span className={`text-xs font-semibold ${inStock ? 'text-emerald-600' : 'text-red-600'}`}>
                  {inStock ? `In Stock (${product.quantity} available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">QTY</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-2 py-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white transition-all"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-black text-slate-900 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.quantity || 10, q + 1))}
                    disabled={quantity >= (product.quantity || 10)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white transition-all disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-3">
                {/* Add to Cart Button */}
                <button
                  onClick={addToCart}
                  disabled={addingToCart || !inStock}
                  className={`w-full h-12 rounded-full font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] ${
                    addedToCart
                      ? 'bg-emerald-600 shadow-emerald-500/20'
                      : 'bg-[#FF5500] hover:bg-[#E64D00] shadow-orange-500/20'
                  }`}
                >
                  {addingToCart ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : addedToCart ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Added to Cart!
                    </span>
                  ) : !inStock ? (
                    'Out of Stock'
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </span>
                  )}
                </button>

                {/* WhatsApp Button */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 bg-[#111111] hover:bg-black text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                >
                  <MessageCircle className="h-4 w-4" /> Order via WhatsApp
                </a>
              </div>

              {/* Trust Features Card */}
              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-[#FF5500] shrink-0" />
                  <span>Free delivery across Qatar</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-[#FF5500] shrink-0" />
                  <span>12 months warranty</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="h-4 w-4 text-[#FF5500] shrink-0" />
                  <span>7-day easy return policy</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ── Tabs Section (Description, Specs, Reviews) ── */}
        <div className="mt-8 bg-white rounded-[28px] border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          
          {/* Tab Header Pills */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'description'
                  ? 'bg-[#FF5500] text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Description
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'specs'
                  ? 'bg-[#FF5500] text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Specs
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-[#FF5500] text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Reviews ({reviewsCount})
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="pt-6">
            
            {/* ── TAB 1: DESCRIPTION ── */}
            {activeTab === 'description' && (
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">About This Product</h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
                    {product.description || product.shortDescription || 'No detailed description available for this product.'}
                  </p>
                </div>

                <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-[300px] flex items-center justify-center border border-slate-200/60">
                  {imgSrc ? (
                    <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="p-12 text-slate-400">
                      <ShoppingBag className="h-20 w-20 mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 2: SPECS ── */}
            {activeTab === 'specs' && (
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Technical Specifications</h3>
                
                {Object.keys(specsObj).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(specsObj).map(([key, val], idx) => (
                      <div key={key} className={`p-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm ${idx % 2 === 0 ? 'bg-slate-50/80' : 'bg-white'}`}>
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">{key}</span>
                        <span className="font-bold text-slate-900">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No technical specifications listed for this product.</p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2 font-medium">
                  <Info className="h-3.5 w-3.5 text-[#FF5500]" />
                  <span>All specifications verified by NOVA Qatar technical team</span>
                </div>
              </div>
            )}

            {/* ── TAB 3: REVIEWS ── */}
            {activeTab === 'reviews' && (
              reviewsLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading reviews...</div>
              ) : (
                <div className="space-y-8">
                  {reviews.length > 0 ? (
                    <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
                      {/* Left: Overall Rating Box */}
                      <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-6 text-center space-y-4">
                        <span className="text-5xl font-black text-slate-900 block">{Number(averageRating).toFixed(1)}</span>
                        <div className="flex justify-center gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`h-5 w-5 ${s <= Math.round(averageRating) ? 'fill-[#FF5500] text-[#FF5500]' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400 font-medium block">{reviewsCount} verified reviews</span>
                      </div>

                      {/* Right: Reviews List */}
                      <div className="space-y-4">
                        {reviews.map((rev, idx) => (
                          <div key={rev.reviewId || idx} className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-orange-100 text-[#FF5500] font-black text-sm flex items-center justify-center">
                                  {(rev.user?.fullName || rev.User?.fullName || 'C').charAt(0)}
                                </div>
                                <div>
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rev.user?.fullName || rev.User?.fullName || 'Customer'}</h4>
                                  <span className="text-[11px] text-slate-400 font-normal">
                                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Buyer'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} className={`h-3.5 w-3.5 ${s <= (Number(rev.rating) || 5) ? 'fill-[#FF5500] text-[#FF5500]' : 'text-slate-200'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{rev.comment}</p>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider pt-1">
                              <Check className="h-3 w-3 stroke-[3]" /> VERIFIED PURCHASE
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-2">
                      <MessageSquare className="h-12 w-12 mx-auto text-slate-200" />
                      <h4 className="text-sm font-bold text-slate-900">No reviews yet</h4>
                      <p className="text-xs text-slate-400">Be the first to share your experience!</p>
                    </div>
                  )}

                  {/* ── Write a Review Form ── */}
                  {user ? (
                    <div className="border-t border-slate-100 pt-6">
                      <h4 className="text-base font-black text-slate-900 mb-4">Write a Review</h4>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!reviewComment.trim()) {
                            toast({ variant: 'destructive', title: 'Please write your review before submitting.' });
                            return;
                          }
                          setSubmittingReview(true);
                          try {
                            await api.post(`/reviews/product/${product.productId}`, {
                              rating: reviewRating,
                              comment: reviewComment.trim(),
                            });
                            toast({ title: 'Review submitted!', description: 'Thank you for your feedback.' });
                            setReviewComment('');
                            setReviewRating(5);
                            refetchReviews();
                          } catch (err) {
                            toast({ variant: 'destructive', title: 'Failed to submit review', description: err.response?.data?.message || 'Please try again.' });
                          } finally {
                            setSubmittingReview(false);
                          }
                        }}
                        className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 space-y-4"
                      >
                        {/* Star Picker */}
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-2">Your Rating</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setReviewRating(s)}
                                onMouseEnter={() => setReviewHover(s)}
                                onMouseLeave={() => setReviewHover(0)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-7 w-7 transition-colors ${
                                    s <= (reviewHover || reviewRating)
                                      ? 'fill-[#FF5500] text-[#FF5500]'
                                      : 'text-slate-200 hover:text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-xs font-bold text-slate-600 self-center">
                              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewHover || reviewRating]}
                            </span>
                          </div>
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Your Review</label>
                          <textarea
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            rows={4}
                            placeholder="Share your experience with this product..."
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-[#FF5500] focus:border-[#FF5500] transition-all"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="h-11 px-6 rounded-full bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold text-sm transition-all disabled:opacity-60 flex items-center gap-2"
                        >
                          {submittingReview ? (
                            <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                          ) : (
                            <><Star className="h-4 w-4" /> Submit Review</>
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="border-t border-slate-100 pt-6 text-center">
                      <p className="text-xs text-slate-500">
                        <button onClick={() => navigate('/login')} className="text-[#FF5500] font-bold hover:underline">Sign in</button> to write a review
                      </p>
                    </div>
                  )}
                </div>
              )
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
