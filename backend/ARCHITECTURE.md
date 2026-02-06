# NEXUS Backend System Architecture

## 1. System Overview
**NEXUS** is a Modular Monolith designed for high scalability, real-time interaction, and AI integration.

### Core Tech Stack
*   **Runtime:** Node.js v20 + Express
*   **Database:** PostgreSQL (Relation Data) + Prisma ORM
*   **Real-time:** Socket.io (Events) + Redis (Pub/Sub & Caching)
*   **AI Engine:** Google Gemini API (Flash/Pro models)
*   **Infrastructure:** Docker + Nginx Load Balancer

---

## 2. Database Design (3NF)
We utilize a relational schema to ensure data integrity for academic records while allowing flexibility for logs.

*   **Users & Auth:** `User`, `Profile`, `Role` (Enum).
*   **Academics:** `Course` ↔ `Enrollment` ↔ `User`. `Attendance` logs linked to Courses.
*   **Mess:** `MessMenu` containing nutritional info. `MessRating` with AI sentiment scores.
*   **Marketplace:** `MarketplaceItem` with lifecycle status (Available/Sold).
*   **Analytics:** `AuditLog` for tracking admin actions and `Poll` systems.

---

## 3. Real-Time Architecture
We use a **Namespace** strategy in Socket.io to segregate traffic:

1.  `/mess`: High-frequency broadcasts for crowd levels (1-second intervals).
2.  `/security`: Priority channel for SOS alerts (QoS guaranteed).
3.  `/`: General notifications (User-specific rooms).

**Scaling Strategy:**
Socket.io uses a Redis Adapter (`@socket.io/redis-adapter`) to distribute events across multiple Node.js replicas in production.

---

## 4. AI Pipelines
The system treats AI as an **Inference Service**.

*   **Summarization:** Async queue processes incoming emails -> Gemini Flash -> DB.
*   **Crowd Prediction:** Historical data + Time/Day Context -> Gemini Inference -> Redis Cache.
*   **Sentiment:** Feedback Text -> Gemini Flash -> Float Score (-1 to 1) -> Aggregated Analytics.

---

## 5. DevOps & Deployment
**Strategy:** Zero-Downtime Rolling Updates.

1.  **CI/CD:** GitHub Actions builds Docker Image.
2.  **Registry:** Push to ECR/Docker Hub.
3.  **Orchestrator:** AWS ECS or Kubernetes.
    *   Load Balancer (ALB) directs traffic.
    *   Blue/Green deployment swaps containers.

**Security:**
*   Secrets managed via `.env` injection (Docker Secrets/AWS Parameter Store).
*   `helmet` middleware for HTTP headers.
*   Rate Limiting on all public API endpoints.
