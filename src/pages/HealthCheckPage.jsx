import { zodResolver } from '@hookform/resolvers/zod';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Globe,
  RefreshCw,
  Server
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { healthService } from '../services/health.service';

const testFormSchema = z.object({
  customHeader: z.string().optional(),
  pingNotes: z.string().max(100, 'Notes must be under 100 characters').optional(),
});

export const HealthCheckPage = () => {
  const [healthData, setHealthData] = useState(null);
  const [latency, setLatency] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      customHeader: 'Danza-ERP-Client',
      pingNotes: 'Manual health check test',
    },
  });

  const runHealthCheck = async (formData) => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const response = await healthService.getHealth();
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setHealthData(response);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Health check failed');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Diagnostics & Health</h1>
          <p className="text-sm text-slate-500 mt-1">
            Endpoint: <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-indigo-700 font-semibold">GET /api/v1/health</code>
          </p>
        </div>
        <Button onClick={handleSubmit(runHealthCheck)} isLoading={loading}>
          <RefreshCw className="w-4 h-4" />
          Ping API Now
        </Button>
      </div>

      {/* Health Status Result Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <CardTitle>Health Verification Result</CardTitle>
            </div>
            {healthData ? (
              <Badge variant="success">200 OK • Healthy</Badge>
            ) : error ? (
              <Badge variant="danger">Connection Error</Badge>
            ) : (
              <Badge variant="warning">Checking...</Badge>
            )}
          </div>
          <CardDescription>
            Live verification of API status, environment, and backend readiness.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Failed to connect to backend API</h4>
                <p className="text-xs mt-1">{error}</p>
                <p className="text-xs mt-2 text-rose-500">Ensure the backend server is running on port 5000.</p>
              </div>
            </div>
          )}

          {healthData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 uppercase font-semibold">Project Name</span>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {healthData.data?.projectName}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 uppercase font-semibold">API Status</span>
                <p className="text-lg font-bold text-emerald-600 mt-1 capitalize flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {healthData.data?.apiStatus}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 uppercase font-semibold">Environment</span>
                <p className="text-lg font-bold text-indigo-600 mt-1 capitalize">
                  {healthData.data?.environment}
                </p>
              </div>
            </div>
          )}

          {healthData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 uppercase font-semibold">Database Status</span>
                <p className="text-sm font-semibold text-slate-800 mt-1 capitalize">
                  {typeof healthData.data?.database === 'object'
                    ? `${healthData.data.database.status} (${healthData.data.database.message})`
                    : healthData.data?.database}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 uppercase font-semibold">Server Uptime</span>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {healthData.data?.uptime}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 uppercase font-semibold">Round-trip Latency</span>
                <p className="text-sm font-semibold text-emerald-700 mt-1">
                  {latency !== null ? `${latency} ms` : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Raw JSON Payload */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Raw HTTP JSON Response:
            </h4>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto shadow-inner border border-slate-800">
              {healthData ? JSON.stringify(healthData, null, 2) : error || 'No data received yet.'}
            </pre>
          </div>
        </CardContent>
        {lastChecked && (
          <CardFooter className="text-xs text-slate-400 justify-between">
            <span>Last checked at {lastChecked}</span>
            <span>HTTP Protocol: REST / JSON</span>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
