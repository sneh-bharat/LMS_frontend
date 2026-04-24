'use client';

import { useState, useEffect } from 'react';
import { runAllTests, ConnectionTestResult } from '../Apis/Patients/connection-test';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader } from 'lucide-react';

export default function PatientApiTestPage() {
  const [results, setResults] = useState<ConnectionTestResult[]>([]);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    setResults([]);
    const testResults = await runAllTests();
    setResults(testResults);
    setRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    if (status === 'pass') {
      return <CheckCircle className="text-emerald-500" size={20} />;
    } else if (status === 'fail') {
      return <XCircle className="text-rose-500" size={20} />;
    } else {
      return <AlertTriangle className="text-amber-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'pass') return 'bg-emerald-50 border-emerald-200';
    if (status === 'fail') return 'bg-rose-50 border-rose-200';
    return 'bg-amber-50 border-amber-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">
                Patient API Connection Test
              </h1>
              <p className="text-slate-600">
                Diagnose and troubleshoot backend connectivity issues
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={running}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {running ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Running Tests...
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Run Tests
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900 font-medium">
              <strong>API Base URL:</strong>{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}
              </code>
            </p>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Test Results</h2>
            
            {results.map((result, index) => (
              <div
                key={index}
                className={`rounded-xl border-2 p-6 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      {result.test}
                    </h3>
                    <p className="text-slate-700 font-medium">
                      {result.message}
                    </p>
                  </div>
                </div>

                {/* Details */}
                {result.details && (
                  <div className="bg-white/50 rounded-lg p-4 mt-4">
                    <pre className="text-xs text-slate-700 font-mono overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-xl">
                  <div className="text-3xl font-black text-emerald-600">
                    {results.filter(r => r.status === 'pass').length}
                  </div>
                  <div className="text-sm font-bold text-emerald-700 mt-1">Passed</div>
                </div>
                <div className="text-center p-4 bg-rose-50 rounded-xl">
                  <div className="text-3xl font-black text-rose-600">
                    {results.filter(r => r.status === 'fail').length}
                  </div>
                  <div className="text-sm font-bold text-rose-700 mt-1">Failed</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <div className="text-3xl font-black text-amber-600">
                    {results.filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-sm font-bold text-amber-700 mt-1">Warnings</div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            {results.some(r => r.status === 'fail') && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">🔧 Next Steps</h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span>Make sure your Spring Boot backend is running on port 8080</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span>Check that CORS is configured to allow http://localhost:3000</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span>Verify the API URL in .env.local file</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">4.</span>
                    <span>Restart your Next.js development server</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">5.</span>
                    <span>Read the TROUBLESHOOTING.md guide for more details</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>For detailed troubleshooting, see TROUBLESHOOTING.md</p>
          <p className="mt-2">API Documentation: app/Apis/Patients/README.md</p>
        </div>
      </div>
    </div>
  );
}
