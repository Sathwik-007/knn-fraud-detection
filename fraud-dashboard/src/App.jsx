import { useState } from 'react';
import './App.css';

// const API_URL = "https://knn-fraud-detection-2aus.onrender.com/predict";
const API_URL = "http://127.0.0.1:8000/predict";  // Localhost for testing

// const NORMAL_TXN = [-0.73, 1.25, 0.89, -0.15, 0.44, -0.02, 0.55, 0.12, -0.34, -0.11, 0.99, 0.23, -0.55, 0.45, 0.11, 0.22, -0.33, 0.44, 0.55, 0.11, -0.12, -0.05, 0.08, 0.02, 0.14, 0.07, -0.03, 0.01, 45.50];
// const FRAUD_TXN = [-4.22, 2.85, -5.60, 6.99, -2.52, -1.42, -4.53, 1.39, -2.77, -5.77, 4.20, -6.89, -0.59, -7.28, 0.38, -3.14, -5.83, -1.01, 0.41, 0.12, 0.51, -0.03, -0.46, 0.32, 0.04, 0.10, 0.24, 0.14, 999.99];

const generateRandomTxn = (isFraud) => {
  const vector = [];
  
  for (let i = 0; i < 28; i++) {
    if (isFraud) {
      // FRAUD: Inject massive volatility into the first 5 PCA features
      if (i < 5) {
        vector.push((Math.random() * 16) - 8); // Random between -8.0 and +8.0
      } else {
        vector.push((Math.random() * 6) - 3);  // Random between -3.0 and +3.0
      }
    } else {
      // NORMAL: Keep data tightly clustered around 0 (Approximating a Bell Curve)
      let rand = 0;
      for (let j = 0; j < 6; j++) rand += Math.random();
      rand = (rand / 6) * 2 - 1; // Roughly between -1.0 and 1.0
      vector.push(rand);
    }
  }
  
  if (isFraud) {
    vector.push((Math.random() * 2000) + 500); // Random massive amount: $500 - $2500
  } else {
    vector.push((Math.random() * 150) + 2);    // Random everyday amount: $2 - $152
  }
  
  return vector;
};

function App() {
  // Initialize with a randomly generated normal transaction
  const [features, setFeatures] = useState(() => generateRandomTxn(false));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('normal');

  const handleSelectTxn = (type) => {
    setActiveTab(type);
    const isFraud = type === 'fraud';
    // Dynamically generate a brand new vector on every single click!
    setFeatures(generateRandomTxn(isFraud));
    setResult(null);
  };

  const runPrediction = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to connect to the cloud engine. Please check if your Render service is awake." });
    }
    setLoading(false);
  };

  const explainAnomaly = () => {}

  const isDecline = result && result.action === 'DECLINE';
  const statusClass = isDecline ? 'decline' : 'approve';

  return (
    <div className="app-container">
      {/* Header Banner */}
      <header className="header">
        <div className="badge-mlops">MLOps Production Deployment</div>
        <br />
        <br />
        <h1 className="main-title">Real-Time Fraud Detection Terminal</h1>
        <br />
        <p className="sub-title">
          Evaluating credit card transactions using a serverless React frontend connected to a cloud-hosted Meta FAISS HNSW vector graph.
        </p>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        
        {/* Left Column: Controls and Input Data */}
        <div className="dashboard-card">
          <h2 className="card-title">1. Select Simulation Payload</h2>
          <p className="card-desc">Choose a sample transaction profile containing normalized PCA components (V1 to V28) and the transaction amount.</p>
          
          <div className="tab-container">
            <button 
              onClick={() => handleSelectTxn('normal')} 
              className={`txn-tab ${activeTab === 'normal' ? 'normal-active' : ''}`}
            >
              🟢 Standard Transaction
            </button>
            <button 
              onClick={() => handleSelectTxn('fraud')} 
              className={`txn-tab ${activeTab === 'fraud' ? 'fraud-active' : ''}`}
            >
              🔴 High-Risk Anomaly
            </button>
          </div>

          {/* NEW PCA DISCLAIMER */}
          <div className="pca-disclaimer">
            <span className="pca-icon">🔒</span>
            <span><strong>Data Privacy:</strong> Features V1 through V28 have been subjected to Principal Component Analysis (PCA) to mask Personally Identifiable Information (PII) and ensure compliance.</span>
          </div>

          <h3 className="section-label">Vector Telemetry Data</h3>
          <div className="vector-grid">
            {features.map((val, idx) => (
              <div key={idx} className="vector-badge">
                <span className="vector-name">{idx === 28 ? 'Amt' : `V${idx + 1}`}</span>
                <span className="vector-val">{val.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={runPrediction} 
            disabled={loading}
            className={`submit-btn ${activeTab === 'fraud' ? 'danger' : ''}`}
          >
            {loading ? (
              <span className="loading-flex">
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Streaming to FAISS Engine...
              </span>
            ) : "Submit to Evaluation Pipeline"}
          </button>
        </div>

        {/* Right Column: AI Model Assessment Output */}
        <div className="dashboard-card">
          <h2 className="card-title">2. Model Inference Verdict</h2>
          <p className="card-desc">Real-time mathematical distances calculated from the 99th percentile historical normal spending hyper-cluster.</p>

          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-icon">⚡</div>
              <p>Awaiting payload execution. Click the analysis button to stream vector data to the inference service.</p>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              <div className="pulse-icon">🔒</div>
              <p>Calculating high-dimensional Euclidean distance metrics across the index graph...</p>
            </div>
          )}

          {result && result.error && (
            <div className="error-banner">
              <strong>System Connectivity Error</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>{result.error}</p>
            </div>
          )}

          {result && !result.error && (
            <div>
              {/* Verdict Indicator */}
              <div className={`verdict-header ${statusClass}`}>
                <div className="verdict-meta">
                  <span className="verdict-label">GATEWAY VERDICT</span>
                  <span className={`verdict-status ${statusClass}`}>
                    {isDecline ? 'TRANSACTION BLOCKED' : 'TRANSACTION APPROVED'}
                  </span>
                </div>
                <div className={`status-icon-badge ${statusClass}`}>
                  {isDecline ? '✕' : '✓'}
                </div>
              </div>

              {/* Score Metric Row */}
              <div className="metrics-wrapper">
                <div className="metric-item">
                  <span className="metric-label">Calculated Anomaly Score</span>
                  <span className={`metric-value ${statusClass}`}>
                    {result.anomaly_score}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Security Threshold Limit</span>
                  <span className="metric-value">{result.threshold}</span>
                </div>
              </div>

              {/* Progress Visual Bar */}
              {/* Note: We keep width inline because it relies on real-time mathematical state */}
              <div className="progress-bar-bg">
                <div 
                  className={`progress-bar-fill ${statusClass}`}
                  style={{ width: `${Math.min((result.anomaly_score / result.threshold) * 50, 100)}%` }}
                ></div>
                <div className="threshold-marker">
                  <span className="marker-text">Limit ({result.threshold})</span>
                </div>
              </div>

              {/* NEW EXPLAINER BLOCK - ONLY SHOWS IF DECLINED */}
              {isDecline && result.explanation && (
                <div className="explainer-block">
                  <h4 className="explainer-title">🔍 AI Interpretability: Top Anomaly Drivers</h4>
                  <div className="driver-grid">
                    {result.explanation.map((exp, i) => (
                      <div key={i} className="driver-card">
                        <span className="driver-name">{exp.feature}</span>
                        <span className="driver-val">{exp.contribution}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Insights */}
              <div className="insights-block">
                <h4>Pipeline Logs & Core Insights</h4>
                <ul className="insight-list">
                  <li><strong>Classification Engine:</strong> Semi-Supervised HNSW Vector Graph Index</li>
                  <li><strong>Distance Threshold:</strong> Optimized at the 99th percentile to balance consumer friction vs false negative risks.</li>
                  <li><strong>Security Status:</strong> {isDecline ? 
                    'The structural vector variation indicates behavior highly uncharacteristic of recognized baseline cluster coordinates.' : 
                    'Vector proximity successfully registers well inside acceptable bounds of normal behavioral history.'}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;