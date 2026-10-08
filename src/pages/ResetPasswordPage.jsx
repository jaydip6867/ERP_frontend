import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { authService } from '../services/auth.service';

const resetPasswordFormSchema = z
  .object({
    token: z.string().min(5, 'Reset token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      token: tokenFromUrl,
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (tokenFromUrl) {
      setValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);

    try {
      await authService.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      setServerError(err.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a4d25] via-slate-900 to-[#042912] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img src="/danza-logo-white.png" alt="DANZA-SON" className="h-14 sm:h-16 w-auto object-contain drop-shadow-md" />
          </div>
          <p className="text-emerald-400 font-semibold text-xs tracking-widest uppercase">"Ur Path Ur Style"</p>
          <p className="text-slate-400 text-xs mt-1">Set New Corporate Password</p>
        </div>

        <Card className="border-slate-800 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Create New Password</CardTitle>
            <CardDescription>
              Ensure your new password complies with enterprise complexity policies.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {serverError && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Reset Failed</div>
                  <div className="mt-0.5">{serverError}</div>
                </div>
              </div>
            )}

            {isSuccess ? (
              <div className="space-y-4 text-center">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col items-center gap-2 text-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  <div className="font-bold text-base text-slate-900">Password Updated!</div>
                  <div className="text-slate-600">
                    Your password has been changed and all previous sessions have been invalidated.
                  </div>
                </div>

                <Link to="/login" className="block w-full">
                  <Button className="w-full" size="lg">
                    Sign In with New Password
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Input
                    label="Reset Verification Token"
                    placeholder="Paste or verify token"
                    error={errors.token?.message}
                    {...register('token')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 characters (A-Z, a-z, 0-9)"
                      error={errors.newPassword?.message}
                      {...register('newPassword')}
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

                <div>
                  <Input
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2"
                  size="lg"
                  isLoading={loading}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
