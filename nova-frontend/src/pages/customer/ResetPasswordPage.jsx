import { useState, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const token = useMemo(() => routeToken || searchParams.get('token') || '', [routeToken, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Invalid link',
        description: 'The password reset link is missing or invalid.',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Use at least 8 characters.',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please confirm your new password.',
      });
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        password: formData.password,
      });

      setDone(true);
      toast({
        title: 'Password updated',
        description: 'Your password has been reset successfully.',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        variant: 'destructive',
        title: 'Reset failed',
        description: error?.response?.data?.message || 'Unable to reset password. Please request a new link.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.06)] md:p-8">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>

        {!done ? (
          <>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Secure reset</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Reset password</h1>
              <p className="mt-2 text-sm text-slate-500">Create a new password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <Button type="submit" className="h-11 w-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update password'
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center rounded-full bg-emerald-100 p-3 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Password updated</h2>
              <p className="mt-2 text-sm text-slate-500">Your password has been changed successfully.</p>
            </div>
            <Button
              type="button"
              className="h-11 w-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white"
              onClick={() => navigate('/login')}
            >
              Continue to sign in
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
