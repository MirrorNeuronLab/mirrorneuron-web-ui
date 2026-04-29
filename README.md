# MirrorNeuron Web UI

This is a modern Web UI for MirrorNeuron built with React, Vite, Tailwind CSS, and React Flow.

It connects to the MirrorNeuron HTTP REST API to provide a rich dashboard, job inspection, live multi-agent layout graph, and real-time communication logs.

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

1. Ensure the MirrorNeuron REST API is running (the standalone `mn-api` service uses port 4001 by default).
2. Install dependencies for the Web UI:
   ```bash
   npm install
   ```
3. Start the Web UI in development mode (which proxies `/api` to `localhost:4001`):
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Configuration

Vite is configured to expose `MIRROR_NEURON_` vars to the browser build:

- `MIRROR_NEURON_WEB_API_BASE_URL`: REST API base URL, default `/api/v1`.
- `MIRROR_NEURON_WEB_API_TOKEN`: optional bearer token for protected API instances.
