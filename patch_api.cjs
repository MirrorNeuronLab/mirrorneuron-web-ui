const fs = require('fs');
let code = fs.readFileSync('src/api/index.ts', 'utf8');

if (!code.includes('pauseJob')) {
  code += `\nexport const pauseJob = (id: string) => api.post(\`/jobs/\${id}/pause\`).then(r => r.data);`;
}
if (!code.includes('resumeJob')) {
  code += `\nexport const resumeJob = (id: string) => api.post(\`/jobs/\${id}/resume\`).then(r => r.data);`;
}
if (!code.includes('uploadBundle')) {
  code += `\nexport const uploadBundle = (file: File) => {
  const formData = new FormData();
  formData.append('bundle', file);
  return api.post('/bundles/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};`;
}
if (!code.includes('createJob')) {
  code += `\nexport const createJob = (payload: any) => api.post('/jobs', payload).then(r => r.data);`;
}

fs.writeFileSync('src/api/index.ts', code);
