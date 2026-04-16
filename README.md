# MirrorNeuron Web UI

This is a modern Web UI for MirrorNeuron built with React, Vite, Tailwind CSS, and React Flow.

It connects to the MirrorNeuron HTTP REST API (port 4000) to provide a rich dashboard, job inspection, live multi-agent layout graph, and real-time communication logs.

## Features

- **Dashboard:** Cluster nodes overview, executor pool stats, and active jobs.
- **Jobs:** List of all completed, running, and pending jobs.
- **Job Details:**
  - **Graph View:** Visual layout of agents and their connections based on `outbound_edges` using React Flow.
  - **Agents:** Table view of all agents with mailbox depths and statuses.
  - **Communication Logs:** Real-time stream of agent communication and system events.
- **Run Job:** Web-based interface to submit a raw JSON manifest.

## Running

The Web UI runs on the same machine as your MirrorNeuron instance. 

1. Ensure your MirrorNeuron runtime is running (it starts the HTTP API on port 4000 by default).
2. Install dependencies for the Web UI:
   ```bash
   npm install
   ```
3. Start the Web UI in development mode (which proxies `/api` to `localhost:4000`):
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.
