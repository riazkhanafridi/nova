import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { ArrowLeft, Loader2, Mail, Lock } from 'lucide-react';
import NovaLogo from '../../components/shared/NovaLogo';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
      toast({
        title: 'Reset link sent',
        description: 'If an account exists for this email, a password reset link has been sent.',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      setSent(true);
      toast({
        title: 'Request received',
        description: 'If an account exists for this email, a password reset link has been sent.',
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
              Forgot Password?
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1 font-normal">
              {sent
                ? 'Check your inbox for password reset instructions.'
                : 'Enter your email address to receive a password reset link.'}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-800">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-11 rounded-xl border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-3 bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending Link...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-orange-200/80 bg-white p-4 text-xs text-slate-700 leading-relaxed font-medium">
                If an account exists for <span className="font-bold text-slate-900">{email}</span>, you will receive password reset instructions shortly.
              </div>
              <Button
                type="button"
                className="w-full h-12 bg-black hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                onClick={() => navigate('/login')}
              >
                Back to Sign In
              </Button>
            </div>
          )}

          {/* Back to Sign In Link */}
          <div className="mt-6 text-center text-xs text-slate-600 font-medium">
            Remember your password?{' '}
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
