from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pickle as pkl
import requests, os
import faiss, numpy as np
from pydantic import BaseModel

"""
@app predicts whether a transaction is fraudulent based on its features. 
It uses a pre-trained FAISS index to compute an anomaly score and compares it against a defined 
threshold to determine if the transaction should be approved or declined in real-time as the transaction
came in.
"""

app = FastAPI(title="Real-Time Fraud Detection Engine", description="This API provides real-time fraud detection capabilities.", version="1.0.0" )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all websites to talk to the API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_ARTIFACTS_PATH = os.path.join(BASE_DIR, './model_artifacts.pkl')



with open(MODEL_ARTIFACTS_PATH, 'rb') as f:
    model_artifacts = pkl.load(f)

mean = model_artifacts['mean']
std = model_artifacts['std']



index = faiss.read_index(os.path.join(BASE_DIR, './fraud_faiss_index.bin'))

class Transaction(BaseModel):
    features: list[float]

K = 100
THRESHOLD = 109.87

@app.post("/predict")
async def predict_fraud(transaction: Transaction):
    if len(transaction.features) != 29:
        raise HTTPException(status_code=400, detail="Input features must be a list of 29 floats.")
    
    raw_data = np.array(transaction.features).reshape(1, -1)

    # normalise input features
    scaled_data = (raw_data - mean) / std

    # Ensure the scaled data is contiguous and of type float32 for FAISS
    scaled_data = np.ascontiguousarray(scaled_data, dtype=np.float32)

    # Perform FAISS search
    distances, indices = index.search(scaled_data, K)

    anomaly_score = float(distances[0][K-1])

    print(f"Anomaly score: {anomaly_score}")

    is_fraud = anomaly_score > THRESHOLD

    explanation = []
    if is_fraud:
        # calculate the squared difference between the input and its nearest neighbor
        squared_distances = (scaled_data[0] ** 2)
        total_distance = np.sum(squared_distances)

        top_indices = np.argsort(squared_distances)[::-1][:3]  # Get indices of top 5 contributing features

        explanation = [
            {
                "feature": f"V{i+1}" if i < 28 else "Amount",
                "contribution": round(float(squared_distances[i] / total_distance * 100), 1)
            }
            for i in top_indices
        ]

    return {
        'fraud_detected': is_fraud,
        'anomaly_score': round(anomaly_score, 5),
        'threshold': THRESHOLD,
        'action': 'DECLINE' if is_fraud else 'APPROVE',
        'explanation': explanation
    }