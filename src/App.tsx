import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import RunJob from './pages/RunJob';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetails />} />
        <Route path="run" element={<RunJob />} />
      </Route>
    </Routes>
  );
}

export default App;