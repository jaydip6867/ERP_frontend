import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Mail, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { authService } from '../services/auth.service';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const ForgotPasswordPage = () => {
  const [successResult, setSuccessResult] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);

    try {
      const response = await authService.forgotPassword(data.email);
      setSuccessResult(response.data || response);
    } catch (err) {
      setServerError(err.message || 'Unable to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    setValue('email', 'admin@danzaerp.com', { shouldValidate: true });
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
          <p className="text-slate-400 text-sm mt-1">Password Recovery Center</p>
        </div>

        <Card className="border-slate-800 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Forgot your password?</CardTitle>
            <CardDescription>
              Enter your corporate email address and we'll generate a secure reset link.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Quick Demo Autofill */}
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-indigo-800 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Test with: <b>admin@danzaerp.com</b></span>
              </div>
              <button
                type="button"
                onClick={autofillDemo}
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
                  <div className="font-semibold">Reset Error</div>
                  <div className="mt-0.5">{serverError}</div>
                </div>
              </div>
            )}

            {/* Success Notification */}
            {successResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">Request Processed</div>
                    <div className="mt-1 leading-relaxed">
                      If an account exists with that email, a password recovery link has been created.
                    </div>
                  </div>
                </div>

                {/* Development Convenience: Show generated link directly for testing */}
                {successResult.dev_info && (
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono space-y-2">
                    <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                      [Dev Mode Direct Reset Link]
                    </div>
                    <div className="break-all text-slate-300">
                      Token: <span className="text-indigo-400">{successResult.dev_info.resetToken}</span>
                    </div>
                    <Link
                      to={`/reset-password?token=${successResult.dev_info.resetToken}`}
                      className="inline-block mt-2 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs no-underline"
                    >
                      Click to Test Reset Password &rarr;
                    </Link>
                  </div>
                )}

                <Link to="/login" className="block w-full">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
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

                <Button
                  type="submit"
                  className="w-full mt-2"
                  size="lg"
                  isLoading={loading}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Request Password Reset
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
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
