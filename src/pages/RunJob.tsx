import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadBundle, createJob } from '../api';
import { Play, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';

export default function RunJob() {
  const [bundleData, setBundleData] = useState<{ bundle_path: string, manifest: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [running, setRunning] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setUploading(true);
      setError(null);
      setBundleData(null);
      
      try {
        const res = await uploadBundle(selectedFile);
        setBundleData(res);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to upload and validate bundle');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRun = async () => {
    if (!bundleData) return;
    try {
      setRunning(true);
      setError(null);
      const res = await createJob({ _bundle_path: bundleData.bundle_path });
      navigate(`/jobs/${res.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to start job');
      setRunning(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">Submit New Job Bundle</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-6">
            Upload a zipped job bundle containing your <code className="bg-slate-100 px-1 py-0.5 rounded">manifest.json</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">payloads</code> directory.
          </p>

          {!bundleData && (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept=".zip" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <UploadCloud className={`w-12 h-12 mx-auto ${uploading ? 'text-purple-500 animate-bounce' : 'text-slate-400'} mb-4`} />
              {uploading ? (
                <div className="flex items-center justify-center text-purple-600">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <p className="text-sm font-medium">Uploading and validating...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">.zip files only</p>
                </>
              )}
            </div>
          )}

          {bundleData && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Bundle validated successfully</h3>
                  <p className="text-xs text-green-600 mt-1">
                    Graph ID: <strong className="font-mono">{bundleData.manifest.graph_id}</strong>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Manifest Details:</h4>
                <div className="bg-slate-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(bundleData.manifest, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setBundleData(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  disabled={running}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {running ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {running ? 'Starting...' : 'Run Job Now'}
                </button>
              </div>
            </div>
          )}

          {error && <div className="mt-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm">{error}</div>}
        </div>
      </div>
    </div>
  );
}