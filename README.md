# 🛡️ Real-Time AI Fraud Detection Engine

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Dashboard-blue?style=for-the-badge)](https://fraud-detector-puce.vercel.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

An end-to-end, full-stack Machine Learning pipeline for real-time credit card fraud detection.
click here to access the app live: https://fraud-detector-puce.vercel.app

This project bypasses traditional Supervised Learning in favor of **Semi-Supervised Anomaly Detection** using Meta's **FAISS** (Facebook AI Similarity Search). By modeling "normal" human spending behavior in a 29-dimensional vector space, the system catches novel, zero-day fraud attacks in sub-50 milliseconds via an optimized HNSW (Hierarchical Navigable Small World) graph.


![UI_screenshot](./fraud-dashboard/src/assets/UI.png)

---

## 🏗️ System Architecture

This project is built using a modern microservices architecture, completely decoupling the heavy ML inference engine from the client-facing presentation layer.

* **The ML Brain (Backend):** Python, FastAPI, Meta FAISS, NumPy, Scikit-Learn.
* **The Interface (Frontend):** React.js, Vite, standard CSS.
* **Deployment (MLOps):** Containerized via Docker, deployed as a serverless API on **Render**, with the UI hosted on **Vercel's Edge Network**.

---

## 🧠 Methodology & Technical Achievements

### 1. Solving the "Majority Vote" Density Problem
Standard Supervised KNN Classification fails on highly imbalanced datasets (e.g., a 0.5% fraud rate) because the overwhelming density of normal transactions mathematically drowns out anomalous points. This engine uses **Semi-Supervised Distance Tracking**. We only train the index on *Normal* transactions, forcing the model to calculate the exact Euclidean distance from known human behavior.

### 2. High-Dimensional Vector Search (FAISS)
Calculating nearest neighbors across 200,000+ dense vectors in real-time is mathematically impossible using standard brute-force arrays. By compiling the dataset into an **HNSW Graph**, we achieve logarithmic search complexity ($O(\log N)$), ensuring the payment gateway responds in under 50 milliseconds.

### 3. Business-Driven Thresholding (AUPRC)
Machine learning in fintech is a balancing act between fraud losses (False Negatives) and customer friction (False Positives). The distance threshold was explicitly tuned using the **Precision-Recall Curve (AUPRC)** to lock in exactly at the 99th percentile of normal spending behavior.
![AUPRC curve](./auprc_faiss.png)

### 4. Explainable AI (XAI) & PII Compliance
Black-box models are unacceptable in financial compliance. 
* **Data Privacy:** Raw transactional data (PII) is mathematically masked using Principal Component Analysis (PCA) prior to entering the pipeline. 
* **Interpretability:** A custom explainer function decomposes the L2 norm of the scaled vector to instantly extract feature-level squared-distance contributions, providing investigators with a real-time percentage breakdown of the exact drivers that triggered a fraud decline.

---

## 📁 Repository Structure

```text
├── api/
│   └── main.py                  # FastAPI application and inference logic
├── fraud-dashboard/             # React/Vite dashboard application
│   ├── src/App.jsx              # UI Component & Dynamic Vector Generator
│   └── src/App.css              # Command Center UI styling
├── 01_Euclidean.ipynb           # A standard implementation of Euclidean distance
├── 02_Faiss_HNSWIndexFlat.ipynb # Model training and Faiss index search, explain_anomaly method etc.
├── fraud_faiss_index.bin        # Pre-trained HNSW graph artifact
├── model_artifacts.pkl          # Standard scaling artifact (mean, std)
├── Dockerfile                   # Container instructions for Render
├── re_train.py                  # Template for re-training model and deploying with new transactions
└── requirements.txt             # Python dependencies

---

## 🚀 Running the Project Locally

Despite the live version on the web, you can run the project by cloning this repo and doing the follows.

### 1. Start the ML Engine (Backend)

Navigate to the root directory where the `Dockerfile` and `.bin` artifacts are located.

```bash
# Install dependencies
pip install -r requirements.txt

# Boot the FastAPI server via Uvicorn
uvicorn api.main:app --host 0.0.0.0 --port 7860 --reload

```

*The API will be live at `http://localhost:7860/docs*`

### 2. Start the Dashboard (Frontend)

Open a new terminal and navigate to the React frontend folder.

```bash
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev

```

*The UI will be live at `http://localhost:5173/*`

---

*Developed as a portfolio piece demonstrating production-grade ML engineering, high-scale inference deployment, and MLOps best practices.*