import { ClockAlert, LogIn, ShieldAlert } from 'lucide-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useAppStore } from '../store/useAppStore';

export const SessionExpiredPage = () => {
  const { clearSessionExpiredFlag, sessionExpiredRedirectPath } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleReLogin = () => {
    clearSessionExpiredFlag();
    const returnPath = location.state?.from?.pathname || sessionExpiredRedirectPath || '/';
    navigate('/login', { state: { from: { pathname: returnPath } } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Card className="border-slate-800 shadow-2xl bg-white/95 backdrop-blur text-center">
          <CardHeader className="pb-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-200">
              <ClockAlert className="w-7 h-7" />
            </div>
            <CardTitle className="text-xl">Your Session Has Expired</CardTitle>
            <CardDescription className="mt-1">
              For security reasons, your ERP session automatically expires after an extended period of inactivity.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                Session Security Policy
              </div>
              <p>
                JWT tokens are refreshed continuously. When a refresh token expires or is revoked, you must re-authenticate.
              </p>
            </div>

            <Button onClick={handleReLogin} className="w-full" size="lg">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
