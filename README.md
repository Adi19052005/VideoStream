🎬 VideoStream

VideoStream is a cloud-native, scalable, and secure video streaming platform designed for modern web applications. It enables users to upload, process, and stream videos using adaptive HLS streaming, backed by a CDN (AWS CloudFront), protected by AWS WAF, and securely stored in AWS S3 with IAM-based access control.

Videos are processed using FFmpeg by an independent microservice to generate HLS segments and playlists. All components are containerized and orchestrated via Kubernetes (kind) for scalable deployments.

🚀 Features

🔐 Authentication & user session management

📤 Video uploads with secure backend storage

🎥 Adaptive HLS streaming for smooth playback

☁️ Secure video storage using AWS S3

🌍 Global delivery using AWS CloudFront CDN

🛡️ Edge protection via AWS WAF

🔑 IAM-controlled access (no public buckets)

⚙️ Video processing via FFmpeg (separate service)

🐳 Dockerized for reproducible environments

☸️ Scalable on Kubernetes (kind)

📌 Architecture Diagram

graph TB

    subgraph Client
        U[User / Browser / App]
    end

    subgraph CDN
        CF["AWS CloudFront<br>Content Delivery Network"]
        WAF["AWS WAF<br>Web Application Firewall"]
    end

    subgraph Compute
        BE["Backend API<br>(Node.js / Express)"]
        FR["Frontend UI<br>(React)"]
        VP["Video Processing Service"]
        FF["FFmpeg Transcoder"]
    end

    subgraph Storage
        S3R["S3 Raw Videos<br>(Private)"]
        S3P["S3 Processed HLS<br>(Private)"]
    end

    U --> CF
    CF --> WAF
    WAF --> BE

    BE -->|Serve Frontend| FR
    FR --> CF

    BE -->|Upload / Manage Videos| S3R
    S3R --> VP

    VP --> FF
    FF -->|HLS Output| S3P

    S3P --> CF
    CF --> U
🧠 Design Overview
🔒 Secure Storage

AWS S3 stores both raw uploaded videos and final HLS assets.

Buckets are not publicly accessible.

Access is handled by the backend via IAM roles and signed CloudFront URLs.

🌍 Global Streaming

AWS CloudFront delivers video segments and manifests globally.

Console caches content for low latency worldwide.

AWS WAF sits in front to block malicious or unauthorized traffic.

🎥 HLS Streaming

Video files are:

Transcoded into multiple resolutions/bitrates.

Split into segment files (.ts) and playlists (.m3u8) using FFmpeg.

Stored in processed S3 bucket.

Served through CloudFront to clients.

🗂️ Repo Structure
VideoStream/
├── backend/                  # API server & logic
├── frontend/                 # React UI
├── docker-compose.yml        # Local dev multi-container setup
├── .gitignore
└── README.md
Video processing service (FFmpeg logic) lives in a separate repository:
https://github.com/Adi19052005/videoprocessing

🛠️ Prerequisites

To run this project, you will need:

Docker & Docker Compose

Kind (Kubernetes in Docker)

AWS Account with:

S3 buckets

CloudFront distribution

WAF enabled

IAM roles configured

Node.js (optional — only if running services outside containers)

⚙️ Environment Configuration

Create a .env file in backend/ with the following:

PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret

AWS_REGION=your_region
AWS_ACCESS_KEY_ID=your_aws_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=raw_videos_bucket
PROCESSED_BUCKET_NAME=processed_videos_bucket
CLOUDFRONT_DOMAIN=your_cloudfront_domain
CLOUDFRONT_KEY_PAIR_ID=your_key_pair

🐳 Running Locally (Docker Compose)

To run the platform locally for development:
docker compose up -d

☸️ Running on Kubernetes (kind)

Install Kind:
https://kind.sigs.k8s.io

Create a cluster:
kind create cluster

Apply deployment manifests (to be added in future release):
kubectl apply -f k8s/

📦 Related Repositories

🔄 Video Processing (FFmpeg)
https://github.com/Adi19052005/videoprocessing

Handles video transcoding and HLS generation.

💡 Security Principles


| Concern             | Implementation          |
| ------------------- | ----------------------- |
| No public S3 access | IAM roles & signed URLs |
| CDN caching         | CloudFront distribution |
| Edge security       | AWS WAF                 |
| Microservices       | Component separation    |
| Config isolation    | Environment variables   |


