
# 🎬 VideoStream

**VideoStream** is a cloud-native, scalable, and secure video streaming platform designed for modern web applications. It allows users to **upload, process, and stream videos** using adaptive **HLS (HTTP Live Streaming)**.

The platform leverages:

* ☁️ **AWS S3** for secure storage
* 🌍 **AWS CloudFront** for global CDN delivery
* 🛡️ **AWS WAF** for edge protection
* 🔑 **IAM-based access control** (no public buckets)
* ⚙️ **FFmpeg microservice** for video processing
* 🐳 **Docker** for containerization
* ☸️ **Kubernetes (kind)** for orchestration

---

## 🚀 Features

* 🔐 Authentication & session management
* 📤 Secure video uploads
* 🎥 Adaptive HLS streaming for smooth playback
* ☁️ Private AWS S3 storage
* 🌍 Low-latency global streaming via CloudFront
* 🛡️ Edge protection with AWS WAF
* 🔑 IAM-controlled access (no public S3 buckets)
* ⚙️ Independent video processing service (FFmpeg)
* 🐳 Fully Dockerized environment
* ☸️ Kubernetes-ready architecture

---

## 📌 Architecture Diagram



![Image](https://docs.aws.amazon.com/images/solutions/latest/security-automations-for-aws-waf/images/aws-waf-architecture-overview.png)


**High-Level Flow**

1. User requests video via browser/app
2. CloudFront handles global delivery
3. AWS WAF filters malicious traffic
4. Backend API manages logic & permissions
5. Raw videos stored in private S3 bucket
6. Processing service transcodes using FFmpeg
7. HLS assets stored in processed S3 bucket
8. CloudFront streams adaptive video

---

## 🧠 Design Overview

### 🔒 Secure Storage

* AWS S3 stores **raw uploads** and **processed HLS assets**
* Buckets remain **private**
* Access controlled via **IAM roles** and **signed CloudFront URLs**

---

### 🌍 Global Streaming

* **AWS CloudFront** ensures low-latency global delivery
* Edge caching improves playback performance
* **AWS WAF** protects against unwanted traffic

---

### 🎥 HLS Adaptive Streaming

Videos are processed into:

* Multiple resolutions & bitrates
* `.ts` segment files
* `.m3u8` playlists

Generated using **FFmpeg** and stored in the processed S3 bucket for adaptive playback.

---

## 🗂️ Repository Structure

```
VideoStream/
├── backend/              # Node.js / Express API
├── frontend/             # React UI
├── docker-compose.yml    # Local multi-container setup
├── .gitignore
└── README.md
```

🎞️ **Video Processing Service (FFmpeg Logic):**
[https://github.com/Adi19052005/videoprocessing](https://github.com/Adi19052005/videoprocessing)

---

## 🛠️ Prerequisites

To run this project, install:

* Docker & Docker Compose
* Kind (Kubernetes in Docker)
* AWS Account with:

  * S3 Buckets
  * CloudFront Distribution
  * AWS WAF
  * IAM Roles / Credentials

Node.js is optional (only for non-container runs).

---

## ⚙️ Environment Configuration

Create a `.env` file inside **backend/**:

```
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret

AWS_REGION=your_region
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

AWS_S3_BUCKET=raw_videos_bucket
PROCESSED_BUCKET_NAME=processed_bucket

CLOUDFRONT_DOMAIN=your_cloudfront_domain
CLOUDFRONT_KEY_PAIR_ID=your_key_pair
```

---

## 🐳 Running Locally (Docker)

Start the full stack:

```bash
docker compose up -d
```

---

## ☸️ Running on Kubernetes (kind)

Create cluster:

```bash
kind create cluster
```

Deploy manifests (future release):

```bash
kubectl apply -f k8s/
```

---

## 📦 Related Repositories

🔄 **Video Processing Service (FFmpeg):**
[https://github.com/Adi19052005/videoprocessing](https://github.com/Adi19052005/videoprocessing)

Handles:

* Video transcoding
* HLS generation
* Multi-resolution outputs

---

## 💡 Security Principles

| Concern              | Implementation             |
| -------------------- | -------------------------- |
| Private video access | IAM roles & signed URLs    |
| Global performance   | CloudFront CDN caching     |
| Edge security        | AWS WAF                    |
| Scalability          | Microservices & Kubernetes |
| Config isolation     | Environment variables      |
