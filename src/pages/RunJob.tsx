import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Play } from 'lucide-react';

export default function RunJob() {
  const [manifestJson, setManifestJson] = useState('{\n  "manifest_version": "1.0",\n  "graph_id": "simple",\n  "entrypoints": ["router"],\n  "nodes": [\n    {\n      "node_id": "router",\n      "agent_type": "router",\n      "role": "root_coordinator"\n    }\n  ]\n}');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setError(null);
      const payload = JSON.parse(manifestJson);
      const res = await api.post('/jobs', payload);
      navigate(`/jobs/${res.data.id}`);
    } catch (e: any) {
      setError(e.message || 'Invalid JSON or API error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">Submit New Job</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">Provide a fully resolved JSON manifest to submit a new job.</p>
          <textarea
            className="w-full h-64 p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={manifestJson}
            onChange={(e) => setManifestJson(e.target.value)}
          />
          {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Submit Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}