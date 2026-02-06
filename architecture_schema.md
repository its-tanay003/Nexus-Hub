# Part 2 & 3: Architecture & Schema Design

## Step 1: System Architecture

### Backend Architecture Strategy
The system follows a **Event-Driven Microservices Architecture** to ensure loose coupling and high availability, specifically for the "Red Alert" and "AI Pulse" features.

#### 1. AI Mail Summarizer (High Concurrency)
*   **Ingestion Layer:** Webhooks from the University Email Provider (Google Workspace/Outlook) push new raw emails to a message queue (RabbitMQ or Kafka).
*   **Processing Workers:** Stateless Node.js workers consume the queue.
    *   They invoke the **Gemini API** (`gemini-3-flash-preview`) to generate a one-sentence summary and a sentiment score.
    *   *Optimization:* We use a "Token Bucket" rate limiter to manage Gemini API quotas.
*   **Delivery:**
    *   Summaries are stored in the database.
    *   Real-time delivery to the frontend via **WebSockets (Socket.io)** for active users.
    *   Background updates via **FCM (Firebase Cloud Messaging)** for mobile users.

#### 2. Red Alert (Emergency Response) - Critical Path
*   **Protocol:** Uses a dual-channel transport strategy.
    *   **Primary:** Secure WebSocket (WSS) for sub-100ms latency location streaming.
    *   **Fallback:** If WSS fails (poor signal), it falls back to HTTP/2 REST calls.
    *   **Offline:** Native mobile bridge triggers an SMS via Twilio API containing the last known GPS coordinates.
*   **Dispatcher:** A dedicated "Safety Service" receives the SOS.
    *   It immediately queries the **Geospatial Index (Redis Geo)** to find nearby security personnel.
    *   It broadcasts a priority override alert to Security Dashboards.

### Architecture Diagram (Text Representation)

```mermaid
[Mobile/Web Client] <--> [Load Balancer (Nginx)]
       |                         |
       |                         +---> [API Gateway]
       |                                   |
       +--(WebSocket)--+                   +--> [Auth Service (JWT)]
                       |                   +--> [Academic Service]
[Socket.io Cluster] <--+                   +--> [Student Exchange Service]
       |                                   +--> [Safety Service (Red Alert)]
       +--> [Redis Pub/Sub]                          |
                                                     +--> [Twilio (SMS)]
                                                     +--> [Firebase (Push)]
[AI Worker Nodes]
       |
       +--> [Gemini API]
       +--> [Email Queue (RabbitMQ)]
```

## Step 2: Database Schema

We utilize a **Hybrid Database Approach**.

### SQL (PostgreSQL) - Structured Academic & Logistics Data

**1. Users Table**
*   `id` (UUID, PK)
*   `email` (VARCHAR, Unique)
*   `role` (ENUM: 'student', 'faculty', 'security')
*   `safety_contacts` (JSONB) - Trusted contacts for SOS.

**2. Courses & Timetables (Academic Cockpit)**
*   `course_id` (UUID, PK)
*   `code` (VARCHAR)
*   `schedule` (JSONB) - Array of { day, time, room, type }.
*   `professor_id` (UUID, FK)

**3. Enrollments**
*   `user_id` (UUID, FK)
*   `course_id` (UUID, FK)

### NoSQL (MongoDB/Firestore) - Dynamic & High Velocity Data

**1. RideRequests (Cab-Pool)**
*   `_id` (ObjectId)
*   `requester_id` (String)
*   `origin` (GeoJSON Point)
*   `destination` (GeoJSON Point)
*   `departure_window` (Object { start: Date, end: Date })
*   `status` (Enum: 'open', 'matched', 'completed')
*   `matched_group_id` (ObjectId, Ref)

**2. MessMenu (Daily Pulse)**
*   `date` (Date)
*   `meal_type` (Enum: 'breakfast', 'lunch', 'dinner')
*   `items` (Array<String>)
*   `calories` (Number)
*   `crowd_meter` (Number 0-100) - Real-time occupancy.

**3. EmergencyLogs (Red Alert)**
*   `_id` (ObjectId)
*   `user_id` (String)
*   `timestamp` (ISODate)
*   `location_history` (Array<GeoJSON>)
*   `status` (Enum: 'active', 'resolved', 'false_alarm')
*   `audio_clip_url` (String, Optional)
