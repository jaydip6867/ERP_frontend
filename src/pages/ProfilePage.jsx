import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  Key,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { authService } from '../services/auth.service';
import { useAppStore } from '../store/useAppStore';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().optional(),
  language: z.string().min(2, 'Language code required'),
  timezone: z.string().min(2, 'Timezone required'),
  default_dashboard: z.string().min(2, 'Dashboard setting required'),
});

export const ProfilePage = () => {
  const { user, updateUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      mobile: user?.mobile || '',
      language: user?.language || 'en',
      timezone: user?.timezone || 'UTC',
      default_dashboard: user?.default_dashboard || 'standard',
    },
  });

  // Fetch fresh user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setFetching(true);
      try {
        const response = await authService.getCurrentUser();
        const freshUser = response.data?.user || response.data;
        if (freshUser) {
          updateUser(freshUser);
          reset({
            full_name: freshUser.full_name || '',
            mobile: freshUser.mobile || '',
            language: freshUser.language || 'en',
            timezone: freshUser.timezone || 'UTC',
            default_dashboard: freshUser.default_dashboard || 'standard',
          });
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [reset, updateUser]);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const response = await authService.updateProfile(data);
      const updated = response.data?.user || response.data;
      updateUser(updated);
      setSuccessMessage('Profile information saved successfully.');
    } catch (err) {
      setServerError(err.message || 'Failed to update profile information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Profile Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-100">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{user?.full_name || 'User Profile'}</h1>
              <Badge variant="indigo">{user?.user_code || 'EMP-001'}</Badge>
              <Badge variant={user?.status === 'active' ? 'success' : 'warning'}>
                {user?.status || 'Active'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>{user?.designation || 'Staff'}</span>
              <span>•</span>
              <span>{user?.department || 'General'}</span>
              <span>•</span>
              <span className="capitalize">{user?.employee_type || 'Full Time'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/change-password">
            <Button variant="outline" size="sm">
              <Key className="w-3.5 h-3.5 mr-1.5" />
              Change Password
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Editable Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your identity and display preferences across Danza ERP.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {serverError && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{serverError}</div>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>{successMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Full Legal Name"
                      error={errors.full_name?.message}
                      {...register('full_name')}
                    />
                  </div>
                  <div>
                    <Input
                      label="Mobile Contact"
                      placeholder="+1-555-0199"
                      error={errors.mobile?.message}
                      {...register('mobile')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      System Language
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      {...register('language')}
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      Preferred Timezone
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      {...register('timezone')}
                    >
                      <option value="UTC">UTC (Universal Coordinated)</option>
                      <option value="America/New_York">Eastern Time (US & Canada)</option>
                      <option value="America/Chicago">Central Time (US & Canada)</option>
                      <option value="Europe/London">London (GMT/BST)</option>
                      <option value="Asia/Kolkata">India Standard Time (IST)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Default Workspace Dashboard
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register('default_dashboard')}
                  >
                    <option value="standard">Standard Executive Overview</option>
                    <option value="inventory">Inventory & Logistics Focus</option>
                    <option value="sales">Sales & Revenue Focus</option>
                    <option value="finance">Finance & Accounts Ledger</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button type="submit" isLoading={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security & System Attributes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Corporate Record</CardTitle>
              <CardDescription>Managed enterprise profile parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500">Corporate Email</span>
                <span className="font-semibold text-slate-800">{user?.email || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500">Employee Code</span>
                <span className="font-semibold text-indigo-700">{user?.user_code || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500">Department</span>
                <span className="font-semibold text-slate-800">{user?.department || 'General'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500">Designation</span>
                <span className="font-semibold text-slate-800">{user?.designation || 'Staff'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500">Joining Date</span>
                <span className="font-semibold text-slate-800">
                  {user?.joining_date ? new Date(user.joining_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security & Audit</CardTitle>
              <CardDescription>Account access and authentication telemetry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500">Two-Factor Authentication</span>
                <Badge variant={user?.two_factor_enabled ? 'success' : 'default'}>
                  {user?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500">Last Sign In</span>
                <span className="font-semibold text-slate-800">
                  {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Just now'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500">Last Client IP</span>
                <span className="font-mono text-slate-700">{user?.last_login_ip || 'Localhost'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
