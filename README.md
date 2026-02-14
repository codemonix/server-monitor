Server Monitor (SRM)

A high-performance, real-time infrastructure monitoring solution built with the MERN stack. 

This platform is a comprehensive full-stack solution designed to track and visualize server health across distributed environments. It features a lightweight, cross-platform agent that pushes system metrics to a centralized dashboard via WebSockets with an automated HTTP fallback mechanism. 


🚀 Core Technical Stack

Frontend: React 19 (Vite) , Redux Toolkit , Material UI (MUI) , ECharts , and React Router. 



Backend: Node.js and Express , MongoDB via Mongoose , and WebSockets (ws). 



Agent: Node.js/Bun for high-performance execution , systeminformation for hardware metrics , and a Disk Queue for offline persistence. 



DevOps: Docker & Docker Compose , GitHub Actions for CI/CD , and Nginx for web serving. 


✨ Key Features
1. Real-Time Data Streaming
Utilizes a custom WebSocket Hub to broadcast live metrics from agents directly to user dashboards with sub-second latency. 


Includes a robust connection handler that manages authentication handshakes and maintains a registry of active agents and dashboards. 


Features an automated fallback to an HTTP API to ensure data continuity if the WebSocket connection is interrupted. 

2. Intelligent Agent Architecture

Persistence: Implements a built-in Disk Queue to store metrics locally if the backend is unreachable, preventing data loss during network outages. 


Cross-Platform: Compiled using Bun to produce optimized standalone binaries for both Linux (.deb) and Windows (.exe). 


Security: Uses unique enrollment tokens and JWT-based session rotation (Access & Refresh tokens) for secure agent-to-server communication. 

3. Advanced Dashboard & RBAC

Visualization: Interactive multi-metric charts for CPU, Memory, Disk, and Network I/O powered by ECharts. 

Role-Based Access Control: Securely separates Admin (management) and Viewer (monitoring) roles. 


Persistent State: Data grids maintain user-defined sorting, filtering, and pagination across sessions using local storage. 

4. Automated DevOps Pipeline

CI/CD: Automated GitHub Actions workflows for building Docker images and releasing multi-platform agent binaries. 


Containerization: The entire stack is orchestrated via Docker Compose, including log rotation for the database. 

🛠️ Installation & Setup
Rapid Deployment (Docker)
Bash
# Clone the repository
git clone https://github.com/saeidmon/server-monitor.git
cd server-monitor

# Configure environment variables
# Ensure MONGODB_URI and JWT secrets are defined 
cp .env.example .env

# Launch the entire stack [cite: 29]
docker-compose up -d

The dashboard is available at http://localhost:8082 by default. 

🧪 Testing
The project maintains high code quality through comprehensive unit and integration tests using Vitest. 


Agent: Validates metrics collection, JWT parsing, and queue logic. 


Backend: Tests API endpoints, JWT authentication, and WebSocket handshakes. 


Frontend: Ensures UI component integrity and state management. 

Potential Project Enhancements

Metric Math Accuracy: Update ServerCard.jsx to use a standard constant for GB conversion (e.g., 1024 ** 3) instead of bitwise operators. 


Demo Optimization: Fully integrate the isDemoMode configuration to provide a one-click login for recruiters on the landing page. 
