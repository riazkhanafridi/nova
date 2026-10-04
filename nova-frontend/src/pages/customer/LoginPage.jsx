import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import NovaLogo from '../../components/shared/NovaLogo';
import { getErrorMessage } from '../../lib/utils';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getSafeRedirect = (currentUser = user, search = location.search) => {
    const role = currentUser?.role?.toLowerCase?.() || '';
    if (role === 'admin') return '/admin';

    const params = new URLSearchParams(search);
    const redirect = params.get('redirect');
    if (redirect && redirect.startsWith('/')) {
      return redirect;
    }

    return '/';
  };

  useEffect(() => {
    if (user) {
      navigate(getSafeRedirect(user), { replace: true });
    }
  }, [user, navigate, location.search]);

  if (user) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim();
    if (!cleanEmail || !formData.password) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please provide both email and password.',
      });
      return;
    }

    setLoading(true);

    try {
      const loggedInUser = await login(cleanEmail, formData.password);
      toast({ title: 'Welcome back!', description: `Hello, ${loggedInUser?.fullName || 'there'}` });
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Invalid email or password.');
      console.warn('Login Error:', errorMessage);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col items-center justify-center py-10 px-4 font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      <div className="w-full max-w-[460px] flex flex-col items-center">
        
        {/* Top Logo */}
        <Link to="/" className="w-[300px] sm:w-[340px] mb-6 transition-transform hover:scale-[1.01]">
          <NovaLogo />
        </Link>

        {/* Card Box */}
        <div className="w-full bg-[#FFF6F0] border border-[#FCE8DC] rounded-[32px] p-6 sm:p-9 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1 font-normal">
              Please enter your credentials to access the admin portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-800">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@novatech.co"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-800">
                  Password
                </Label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#FF5500] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#FF5500] focus:ring-[#FF5500] accent-[#FF5500] cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs font-medium text-slate-800 cursor-pointer select-none">
                Remember me.
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-7 text-center space-y-1">
          <p className="text-[11px] text-slate-400">
            © 2026 NOVA Mobile Accessories & Computer Services . All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-1 text-[10px] tracking-widest text-slate-400/80 font-medium uppercase">
            <Lock className="h-3 w-3" /> SECURED CONFIDENTIAL ADMIN PORTAL
          </div>
        </div>

      </div>
    </div>
  );
}