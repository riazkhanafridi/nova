import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import NovaLogo from '../../components/shared/NovaLogo';
import { getErrorMessage } from '../../lib/utils';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'Password and Confirm Password do not match.',
      });
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      toast({ title: 'Account created!', description: 'Welcome to Nova.' });
      navigate('/');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: getErrorMessage(err, 'Please try again.'),
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
              Create Account
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1 font-normal">
              Enter your details to register as an administrator.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold text-slate-800">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-800">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="yourname@novatech.co"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-800">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-800">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-3 bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Already have an account */}
          <div className="mt-6 text-center text-xs text-slate-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF5500] font-semibold hover:underline">
              Sign In
            </Link>
          </div>
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
