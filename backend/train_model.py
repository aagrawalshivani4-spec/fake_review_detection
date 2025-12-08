import pandas as pd
import numpy as np
import networkx as nx

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
import pickle

# ----------------------------------------------------
# STEP 1 — LOAD DATASET
# ----------------------------------------------------
CSV_PATH = "amazon_reviews_dataset.csv"   # same name as your file

df = pd.read_csv(CSV_PATH)

print("Columns found in CSV:")
print(df.columns, "\n")

# ----------------------------------------------------
# STEP 2 — FIXED COLUMN NAMES FOR YOUR DATA
# ----------------------------------------------------
text_col = "review_text"
user_col = "reviewer_id"
product_col = "asin"
label_col = "is_fake"     # 0 = genuine, 1 = fake

# Keep only needed columns and drop rows with missing values
df = df.dropna(subset=[text_col, user_col, product_col, label_col])

# Convert label to int
df["label"] = df[label_col].astype(int)

print("Label distribution:")
print(df["label"].value_counts(), "\n")

if df["label"].nunique() < 2:
    raise ValueError("ERROR: Dataset has only one class in 'is_fake'. Need both 0 and 1.")

# ----------------------------------------------------
# STEP 3 — BUILD REVIEWER–PRODUCT GRAPH (SNA)
# ----------------------------------------------------
G = nx.Graph()

for _, row in df.iterrows():
    G.add_edge(str(row[user_col]), str(row[product_col]))

centrality = nx.degree_centrality(G)
df["degree_centrality"] = df[user_col].map(centrality).fillna(0)

# ----------------------------------------------------
# STEP 4 — FEATURE ENGINEERING
# ----------------------------------------------------
texts = df[text_col].astype(str).values
sna_feature = df["degree_centrality"].values.reshape(-1, 1)
labels = df["label"].values

# TF-IDF on review_text
tfidf = TfidfVectorizer(stop_words="english", max_features=2000)
X_text = tfidf.fit_transform(texts).toarray()

# Scale SNA feature
scaler = StandardScaler()
X_sna = scaler.fit_transform(sna_feature)

# Combine TF-IDF + SNA
X_final = np.hstack([X_text, X_sna])

print("Feature matrix shape:", X_final.shape)

# ----------------------------------------------------
# STEP 5 — TRAIN GRADIENT BOOSTING CLASSIFIER
# ----------------------------------------------------
clf = GradientBoostingClassifier(random_state=42)
clf.fit(X_final, labels)

print("Training finished.")

# ----------------------------------------------------
# STEP 6 — SAVE MODEL PACKAGE AS model.pkl
# ----------------------------------------------------
model_package = {
    "tfidf": tfidf,
    "scaler": scaler,
    "classifier": clf,
    "text_column": text_col
}

with open("model.pkl", "wb") as f:
    pickle.dump(model_package, f)

print("\n✅ model.pkl GENERATED SUCCESSFULLY in backend folder!")

