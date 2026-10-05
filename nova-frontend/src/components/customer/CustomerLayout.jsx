import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import {
  ShoppingCart, Menu, Search, User, Package, LogOut, Settings, X,
  MapPin, Phone, Mail, Clock, Heart
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getMediaUrl } from '../../lib/media';
import { cn } from '../../lib/utils';
import { getGuestCartCount, subscribeToGuestCartCount } from '../../lib/cart';
import NovaWordmark from '../shared/NovaWordmark';
import CartDrawer from './CartDrawer';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Services', to: '/services' },
  { label: 'Brands', to: '/brands' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [guestCartCount, setGuestCartCountState] = useState(getGuestCartCount());
  const { data: cartData, refetch: refetchCart } = useFetch(user ? '/cart' : null, { enabled: !!user });
  const cartItems = cartData?.data?.CartItems || [];
  const cartCount = user
    ? cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
    : guestCartCount;

  useEffect(() => {
    const handleCartCleared = () => {
      setGuestCartCountState(0);
      if (user) {
        refetchCart();
      }
    };
    const handleCartUpdated = () => {
      if (user) refetchCart();
    };
    window.addEventListener('nova-cart-cleared', handleCartCleared);
    window.addEventListener('nova-cart-updated', handleCartUpdated);

    if (!user) {
      const unsubscribe = subscribeToGuestCartCount(setGuestCartCountState);
      setGuestCartCountState(getGuestCartCount());
      return () => {
        unsubscribe();
        window.removeEventListener('nova-cart-cleared', handleCartCleared);
        window.removeEventListener('nova-cart-updated', handleCartUpdated);
      };
    }
    setGuestCartCountState(0);
    return () => {
      window.removeEventListener('nova-cart-cleared', handleCartCleared);
      window.removeEventListener('nova-cart-updated', handleCartUpdated);
    };
  }, [user, refetchCart]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 antialiased flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/40 bg-[#f5f4f3] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-neutral-700 hover:text-neutral-900">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-6 bg-white">
                <div className="mb-8 flex items-center">
                  <NovaWordmark variant="dark" compact className="scale-[0.58] origin-left" />
                </div>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "px-4 py-3 rounded-xl text-base font-medium transition-colors",
                          isActive
                            ? "text-orange-600 bg-orange-50 font-semibold"
                            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center group">
              <NovaWordmark variant="dark" compact className="scale-[0.62] origin-left" />
            </Link>
          </div>

          {/* Center: Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium tracking-[-0.01em] transition-colors duration-200 lg:text-[15px]",
                    isActive
                      ? "text-neutral-900 font-semibold"
                      : "text-neutral-700 hover:text-neutral-900"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Actions (Search, Cart, User) */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-700 hover:text-orange-600 hover:bg-orange-50 rounded-full h-10 w-10 transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
              title="Search Products"
            >
              <Search className="h-5 w-5 stroke-[1.75]" />
            </Button>

            {/* Shopping Cart Icon */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
              onClick={() => setCartDrawerOpen(true)}
              title="Shopping Cart"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-bold text-white ring-2 ring-[#f5f4f3]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account Menu / Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 p-0 ring-2 ring-transparent hover:ring-orange-500/20 transition-all">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={getMediaUrl(user.avatar)} />
                      <AvatarFallback className="bg-orange-600 text-white font-bold text-sm">
                        {user.fullName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-lg border-neutral-200">
                  <DropdownMenuLabel className="px-3 py-2">
                    <p className="font-semibold text-neutral-900">{user.fullName}</p>
                    <p className="text-xs text-neutral-500 font-normal truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-neutral-500" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-orders')} className="rounded-lg cursor-pointer">
                    <Package className="mr-2 h-4 w-4 text-neutral-500" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')} className="rounded-lg cursor-pointer">
                    <Heart className="mr-2 h-4 w-4 text-neutral-500" />
                    <span>Wishlist</span>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-lg cursor-pointer">
                      <Settings className="mr-2 h-4 w-4 text-neutral-500" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {searchOpen && (
          <div className="bg-white border-t border-neutral-100 px-4 py-3 shadow-inner">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search products, brands, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-100 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <Button type="submit" size="sm" className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-4">
                Search
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)} className="rounded-xl">
                <X className="h-5 w-5 text-neutral-500" />
              </Button>
            </form>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      <a
        href="https://wa.me/97412345678?text=Hi%20I%20need%20help%20with%20Nova%20products"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#111827] text-white shadow-[0_14px_34px_rgba(17,24,39,0.25)] transition-transform duration-200 hover:scale-105"
        aria-label="Chat on WhatsApp"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#ff7a1a] via-[#ff6b2b] to-[#ff6b2b] text-2xl font-black text-white">∞</div>
      </a>

      {/* Dark Modern Footer matching exact screenshot */}
      <footer className="bg-[#181818] text-neutral-400 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center text-white font-black text-base shadow-sm">
                  N
                </div>
                <span className="font-extrabold text-xl tracking-tight text-white">
                  NOVA
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-xs leading-relaxed">
                Premium mobile and computer accessories. Serving Qatar with the latest technology and expert service since 2018.
              </p>

              {/* Social Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <span className="h-8 w-8 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-xs font-bold hover:bg-orange-600 hover:text-white transition-colors cursor-pointer">
                  In
                </span>
                <span className="h-8 w-8 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-xs font-bold hover:bg-orange-600 hover:text-white transition-colors cursor-pointer">
                  Tw
                </span>
                <span className="h-8 w-8 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-xs font-bold hover:bg-orange-600 hover:text-white transition-colors cursor-pointer">
                  Fb
                </span>
              </div>
            </div>

            {/* Products Column */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-white mb-4">PRODUCTS</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/products?category=mobile" className="hover:text-orange-500 transition-colors">Mobile Accessories</Link></li>
                <li><Link to="/products?category=computers" className="hover:text-orange-500 transition-colors">Computer Accessories</Link></li>
                <li><Link to="/products?category=networking" className="hover:text-orange-500 transition-colors">Networking</Link></li>
                <li><Link to="/products?category=gaming" className="hover:text-orange-500 transition-colors">Gaming Gear</Link></li>
              </ul>
            </div>

            {/* Services Column */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-white mb-4">SERVICES</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/services" className="hover:text-orange-500 transition-colors">Computer Repair</Link></li>
                <li><Link to="/services" className="hover:text-orange-500 transition-colors">Laptop Repair</Link></li>
                <li><Link to="/services" className="hover:text-orange-500 transition-colors">Data Recovery</Link></li>
                <li><Link to="/services" className="hover:text-orange-500 transition-colors">Office Setup</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-white mb-4">COMPANY</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="hover:text-orange-500 transition-colors">About NOVA</Link></li>
                <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact Us</Link></li>
                <li><Link to="/about" className="hover:text-orange-500 transition-colors">Careers</Link></li>
                <li><Link to="/about" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Middle Contact Bar */}
          <div className="border-t border-neutral-800 my-10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>Doha, Qatar</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-500" />
              <span>+974 1234 5678</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-500" />
              <span>info@novaqatar.com</span>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="border-t border-neutral-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div>
              © 2025 NOVA Qatar. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              <span>Open daily 9am – 10pm AST</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Slide-Over Cart Drawer */}
      <CartDrawer open={cartDrawerOpen} onOpenChange={setCartDrawerOpen} />
    </div>
  );
}
