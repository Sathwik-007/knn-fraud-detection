import numpy as np
import pandas as pd
import faiss

def nightly_model_update():
    print("Starting Nightly FAISS Rebuild...")
    
    # 1. Fetch the sliding window of data (e.g., last 90 days of normal behavior)
    # In reality, this is a SQL query. For this example, imagine we pulled a new dataframe.
    # df_recent_normal = db.query("SELECT * FROM txns WHERE fraud=0 AND date >= NOW() - 90 DAYS")
    
    # Let's assume X_recent contains our fresh 29-dimensional features and df is retrieved from the database.
#     X_recent = df_recent_normal.drop(['Time', 'Class'], axis=1).values
    
#     # 2. Re-calculate the Standard Scaler! 
#     # (If spending went up for the holidays, the mean and std MUST shift to reflect it)
#     new_mean = np.mean(X_recent, axis=0)
#     new_std = np.std(X_recent, axis=0)
#     new_std[new_std == 0] = 1e-10
    
#     X_recent_scaled = (X_recent - new_mean) / new_std
#     X_recent_scaled = np.ascontiguousarray(X_recent_scaled, dtype=np.float32)
    
#     # 3. Build a brand new HNSW Index
#     d = X_recent_scaled.shape[1]
#     new_index = faiss.IndexHNSWFlat(d, 32)
#     new_index.add(X_recent_scaled)
    
#     # 4. Save the new artifacts to disk (overwriting the old ones)
#     faiss.write_index(new_index, "fraud_faiss_index.bin")
#     np.save("scaler_mean.npy", new_mean)
#     np.save("scaler_std.npy", new_std)
    
#     print("Update complete! New brain is ready for tomorrow.")

# Run the job
if __name__ == "__main__":
    nightly_model_update()