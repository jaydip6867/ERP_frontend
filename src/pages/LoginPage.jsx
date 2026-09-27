import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { authService } from '../services/auth.service';
import { useAppStore } from '../store/useAppStore';

const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { loginSuccess } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);

    try {
      const response = await authService.login(data);

      if (response.data?.requires_2fa) {
        setServerError('Two-Factor Authentication is enabled for this account. 2FA verification modal will open.');
        return;
      }

      const { user, accessToken, refreshToken } = response.data;
      loginSuccess(user, accessToken, refreshToken);
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofillAdmin = () => {
    setValue('email', 'admin@danzaerp.com', { shouldValidate: true });
    setValue('password', 'Admin@123456', { shouldValidate: true });
    setServerError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/30 mb-4 border border-indigo-400/20">
            D
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Danza ERP</h1>
          <p className="text-slate-400 text-sm mt-1">Enterprise Resource Planning Suite</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your corporate credentials to access the ERP platform
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Quick Demo Autofill helper */}
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-indigo-800 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dev Demo: <b>admin@danzaerp.com</b></span>
              </div>
              <button
                type="button"
                onClick={autofillAdmin}
                className="text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                Autofill
              </button>
            </div>

            {/* Error Notification */}
            {serverError && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Sign in error</div>
                  <div className="mt-0.5">{serverError}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  label="Corporate Email Address"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                isLoading={loading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secured with JWT, BCrypt & Enterprise Account Lock Protection</span>
        </div>
      </div>
    </div>
  );
};
