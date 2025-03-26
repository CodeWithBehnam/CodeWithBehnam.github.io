---
layout: post
title: "Introduction to Clustering: Unveiling Patterns in Unlabeled Data"
date: 2023-03-31
categories: [Machine Learning, Data Analysis]
tags: [clustering, k-means, hierarchical clustering, dbscan, unsupervised learning, python]
---

Clustering is a fundamental technique in unsupervised machine learning that groups similar data points together based on their characteristics. Unlike supervised learning, clustering doesn't require labeled data, making it valuable for discovering hidden patterns and structures. In this post, I'll explore different clustering algorithms and demonstrate their implementation in Python.

## What is Clustering?

Clustering involves organizing data points into groups (clusters) where:
- Points within a cluster are similar to each other
- Points in different clusters are dissimilar from each other

The similarity or dissimilarity is typically measured using distance metrics such as Euclidean distance, Manhattan distance, or cosine similarity.

## Applications of Clustering

Clustering has numerous applications across various domains:

1. **Customer Segmentation**: Grouping customers with similar purchasing behaviors for targeted marketing
2. **Image Segmentation**: Dividing an image into distinct regions for object detection
3. **Anomaly Detection**: Identifying outliers that don't belong to any cluster
4. **Document Clustering**: Organizing documents by topics
5. **Genetic Analysis**: Finding patterns in genetic data
6. **Recommendation Systems**: Grouping similar items or users

## Popular Clustering Algorithms

Let's explore the most widely used clustering algorithms:

### 1. K-Means Clustering

K-Means is perhaps the most popular clustering algorithm due to its simplicity and efficiency. It works by:

1. Selecting K initial centroids (K is specified by the user)
2. Assigning each data point to the nearest centroid
3. Recalculating the centroids based on the assigned points
4. Repeating steps 2-3 until convergence (minimal centroid movement)

Let's implement K-Means clustering using scikit-learn:

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
from sklearn.preprocessing import StandardScaler

# Generate synthetic data
X, y_true = make_blobs(n_samples=300, centers=4, cluster_std=0.60, random_state=42)

# Standardize the data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Apply K-Means clustering
kmeans = KMeans(n_clusters=4, random_state=42)
y_kmeans = kmeans.fit_predict(X_scaled)

# Get cluster centers
centers = kmeans.cluster_centers_

# Plot the results
plt.figure(figsize=(10, 8))
plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=y_kmeans, s=50, cmap='viridis')
plt.scatter(centers[:, 0], centers[:, 1], c='red', s=200, alpha=0.75, marker='X')
plt.title('K-Means Clustering')
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.show()
```

#### Determining the Optimal Number of Clusters (K)

Choosing the right K is crucial for effective clustering. The Elbow Method helps find the optimal K by plotting the within-cluster sum of squares (WCSS) against different K values:

```python
wcss = []
for k in range(1, 11):
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(X_scaled)
    wcss.append(kmeans.inertia_)

plt.figure(figsize=(10, 6))
plt.plot(range(1, 11), wcss, marker='o', linestyle='-')
plt.title('Elbow Method')
plt.xlabel('Number of clusters (K)')
plt.ylabel('Within-Cluster Sum of Squares (WCSS)')
plt.grid(True)
plt.show()
```

The "elbow" in the plot represents the optimal K value, where adding more clusters doesn't significantly reduce WCSS.

#### Pros and Cons of K-Means

**Pros:**
- Simple to understand and implement
- Efficient for large datasets
- Works well with globular clusters

**Cons:**
- Requires specifying K in advance
- Sensitive to initial centroid selection
- Struggles with non-globular shapes
- Affected by outliers

### 2. Hierarchical Clustering

Hierarchical clustering builds a tree of clusters, known as a dendrogram. There are two approaches:

- **Agglomerative (bottom-up)**: Starts with each data point as a separate cluster and merges the closest pairs until only one cluster remains
- **Divisive (top-down)**: Starts with all data in one cluster and recursively splits until each point is in its own cluster

Let's implement agglomerative hierarchical clustering:

```python
from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import dendrogram, linkage
import matplotlib.pyplot as plt

# Apply Hierarchical Clustering
hierarchical = AgglomerativeClustering(n_clusters=4, linkage='ward')
y_hierarchical = hierarchical.fit_predict(X_scaled)

# Plot the clusters
plt.figure(figsize=(10, 8))
plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=y_hierarchical, s=50, cmap='viridis')
plt.title('Hierarchical Clustering')
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.show()

# Create and visualize the dendrogram
linked = linkage(X_scaled, method='ward')

plt.figure(figsize=(12, 8))
dendrogram(linked, truncate_mode='level', p=5)
plt.title('Dendrogram')
plt.xlabel('Data Points')
plt.ylabel('Euclidean Distance')
plt.axhline(y=6, color='r', linestyle='--')  # Horizontal line for cluster cutoff
plt.show()
```

The dendrogram visualizes the hierarchical relationship between clusters. The height of each branch represents the distance between merged clusters.

#### Pros and Cons of Hierarchical Clustering

**Pros:**
- No need to specify the number of clusters in advance
- Produces a dendrogram showing the hierarchical structure
- Can capture clusters of different shapes and sizes

**Cons:**
- Computationally expensive for large datasets (O(n³) time complexity)
- Sensitive to noise and outliers
- Cannot revise once a merge or split is performed

### 3. DBSCAN (Density-Based Spatial Clustering of Applications with Noise)

DBSCAN identifies clusters as dense regions of points separated by regions of lower density. It doesn't require specifying the number of clusters and can discover clusters of arbitrary shapes.

The algorithm works with two parameters:
- **eps (ε)**: The maximum distance between two points to be considered neighbors
- **min_samples**: The minimum number of points required to form a dense region

DBSCAN classifies points as:
- **Core points**: Points with at least min_samples neighbors within distance ε
- **Border points**: Points that are neighbors of a core point but don't have enough neighbors themselves
- **Noise points (outliers)**: Points that aren't core or border points

Let's implement DBSCAN:

```python
from sklearn.cluster import DBSCAN

# Apply DBSCAN
dbscan = DBSCAN(eps=0.3, min_samples=5)
y_dbscan = dbscan.fit_predict(X_scaled)

# Plot the results
plt.figure(figsize=(10, 8))
plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=y_dbscan, s=50, cmap='viridis')
plt.title('DBSCAN Clustering')
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.colorbar(label='Cluster')
plt.show()

# Count the number of clusters and noise points
n_clusters = len(set(y_dbscan)) - (1 if -1 in y_dbscan else 0)
n_noise = list(y_dbscan).count(-1)
print(f'Number of clusters: {n_clusters}')
print(f'Number of noise points: {n_noise}')
```

#### Selecting DBSCAN Parameters

Choosing appropriate values for eps and min_samples is crucial. One approach is to use the k-distance graph:

```python
from sklearn.neighbors import NearestNeighbors

# Compute distances to the nearest neighbors
neighbors = NearestNeighbors(n_neighbors=5)
neighbors_fit = neighbors.fit(X_scaled)
distances, indices = neighbors_fit.kneighbors(X_scaled)

# Sort distances
distances = np.sort(distances[:, 4])  # Distance to the 5th nearest neighbor

# Plot k-distance graph
plt.figure(figsize=(10, 6))
plt.plot(distances)
plt.title('K-Distance Graph (k=5)')
plt.xlabel('Data Points (sorted)')
plt.ylabel('Distance to 5th Nearest Neighbor')
plt.grid(True)
plt.show()
```

Look for the "elbow" in the k-distance graph to determine a good eps value.

#### Pros and Cons of DBSCAN

**Pros:**
- Doesn't require specifying the number of clusters
- Can find clusters of arbitrary shapes
- Robust to outliers (identifies them as noise)
- Works well with density-based clusters

**Cons:**
- Struggles with clusters of varying densities
- Sensitive to the eps and min_samples parameters
- Can be slower than K-Means for large datasets

### 4. Gaussian Mixture Models (GMM)

GMM is a probabilistic model that assumes data is generated from a mixture of several Gaussian distributions. Unlike K-Means, which assigns each point to exactly one cluster, GMM provides the probability of each point belonging to each cluster.

```python
from sklearn.mixture import GaussianMixture

# Apply Gaussian Mixture Model
gmm = GaussianMixture(n_components=4, random_state=42)
gmm.fit(X_scaled)
y_gmm = gmm.predict(X_scaled)

# Plot the results
plt.figure(figsize=(10, 8))
plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=y_gmm, s=50, cmap='viridis')
plt.title('Gaussian Mixture Model Clustering')
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.show()

# Plot probability contours
x = np.linspace(-3, 3, 200)
y = np.linspace(-3, 3, 200)
X_grid, Y_grid = np.meshgrid(x, y)
XX = np.array([X_grid.ravel(), Y_grid.ravel()]).T
Z = -gmm.score_samples(XX)
Z = Z.reshape(X_grid.shape)

plt.figure(figsize=(10, 8))
plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=y_gmm, s=50, cmap='viridis')
plt.contour(X_grid, Y_grid, Z, levels=10, cmap='viridis', alpha=0.3)
plt.title('GMM with Probability Contours')
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.show()
```

#### Pros and Cons of GMM

**Pros:**
- Provides probabilistic assignments (soft clustering)
- Can model clusters with different sizes and shapes
- Can represent complex distributions

**Cons:**
- Requires specifying the number of components
- Converges to local optima, sensitive to initialization
- Computationally more expensive than K-Means

## Comparing Clustering Algorithms

Let's compare these algorithms on a more complex dataset:

```python
from sklearn.datasets import make_moons

# Generate two interleaving half circles
X_moons, y_moons = make_moons(n_samples=200, noise=0.05, random_state=42)

# Apply different clustering algorithms
algorithms = [
    ('K-Means', KMeans(n_clusters=2, random_state=42)),
    ('Hierarchical', AgglomerativeClustering(n_clusters=2)),
    ('DBSCAN', DBSCAN(eps=0.3, min_samples=5)),
    ('GMM', GaussianMixture(n_components=2, random_state=42))
]

plt.figure(figsize=(15, 10))
for i, (name, algorithm) in enumerate(algorithms):
    # Fit and predict
    if name == 'GMM':
        algorithm.fit(X_moons)
        y_pred = algorithm.predict(X_moons)
    else:
        y_pred = algorithm.fit_predict(X_moons)
    
    # Plot
    plt.subplot(2, 2, i+1)
    plt.scatter(X_moons[:, 0], X_moons[:, 1], c=y_pred, s=50, cmap='viridis')
    plt.title(f'{name} Clustering')
    plt.xlabel('Feature 1')
    plt.ylabel('Feature 2')

plt.tight_layout()
plt.show()
```

This comparison demonstrates that DBSCAN excels at finding non-globular clusters, while K-Means and GMM struggle with the interleaving half-circles.

## Evaluating Clustering Results

Unlike supervised learning, evaluating clustering is challenging without ground truth labels. Here are some metrics:

### Internal Evaluation Metrics

These metrics use the clustered data itself:

#### Silhouette Coefficient

Measures how similar a point is to its own cluster compared to other clusters:

```python
from sklearn.metrics import silhouette_score, silhouette_samples

# Calculate silhouette score for K-Means
silhouette_avg = silhouette_score(X_scaled, y_kmeans)
print(f'Silhouette Score for K-Means: {silhouette_avg:.3f}')

# Calculate sample silhouette scores
sample_silhouette_values = silhouette_samples(X_scaled, y_kmeans)

# Plot silhouette plot
plt.figure(figsize=(10, 6))
y_lower = 10
for i in range(4):  # 4 clusters
    # Get samples in each cluster
    cluster_silhouette_values = sample_silhouette_values[y_kmeans == i]
    cluster_silhouette_values.sort()
    cluster_size = cluster_silhouette_values.shape[0]
    y_upper = y_lower + cluster_size
    
    # Color
    color = plt.cm.viridis(float(i) / 4)
    
    # Plot
    plt.fill_betweenx(np.arange(y_lower, y_upper), 0, cluster_silhouette_values, 
                      facecolor=color, alpha=0.7)
    
    # Label cluster number
    plt.text(-0.05, y_lower + 0.5 * cluster_size, str(i))
    
    # Update y_lower for next plot
    y_lower = y_upper + 10

plt.title('Silhouette Plot for K-Means Clustering')
plt.xlabel('Silhouette Coefficient Values')
plt.ylabel('Cluster Labels')
plt.axvline(x=silhouette_avg, color='red', linestyle='--')
plt.yticks([])
plt.show()
```

#### Calinski-Harabasz Index

Ratio of between-cluster dispersion to within-cluster dispersion:

```python
from sklearn.metrics import calinski_harabasz_score

# Calculate Calinski-Harabasz Index
ch_score = calinski_harabasz_score(X_scaled, y_kmeans)
print(f'Calinski-Harabasz Index: {ch_score:.3f}')
```

#### Davies-Bouldin Index

Ratio of within-cluster distances to between-cluster distances:

```python
from sklearn.metrics import davies_bouldin_score

# Calculate Davies-Bouldin Index
db_score = davies_bouldin_score(X_scaled, y_kmeans)
print(f'Davies-Bouldin Index: {db_score:.3f}')
```

### External Evaluation Metrics

If ground truth labels are available (e.g., in synthetic data), you can use:

```python
from sklearn.metrics import adjusted_rand_score, normalized_mutual_info_score

# Assuming y_true contains the true labels
# Calculate Adjusted Rand Index
ari = adjusted_rand_score(y_true, y_kmeans)
print(f'Adjusted Rand Index: {ari:.3f}')

# Calculate Normalized Mutual Information
nmi = normalized_mutual_info_score(y_true, y_kmeans)
print(f'Normalized Mutual Information: {nmi:.3f}')
```

## Real-World Clustering Example: Customer Segmentation

Let's apply clustering to a real-world problem: customer segmentation for a retail business:

```python
import pandas as pd
from sklearn.decomposition import PCA

# Load sample data (replacing this with your actual data)
# Format: Customer ID, Recency (days since last purchase), Frequency (number of purchases), 
# Monetary (total spend)
data = {
    'CustomerID': range(1, 101),
    'Recency': np.random.randint(1, 100, 100),
    'Frequency': np.random.randint(1, 50, 100),
    'Monetary': np.random.randint(100, 5000, 100)
}
df = pd.DataFrame(data)

# Select features for clustering
X_customer = df[['Recency', 'Frequency', 'Monetary']].values

# Standardize the data
scaler = StandardScaler()
X_customer_scaled = scaler.fit_transform(X_customer)

# Apply K-Means clustering
kmeans = KMeans(n_clusters=4, random_state=42)
df['Cluster'] = kmeans.fit_predict(X_customer_scaled)

# Apply PCA for visualization
pca = PCA(n_components=2)
principal_components = pca.fit_transform(X_customer_scaled)
df['PC1'] = principal_components[:, 0]
df['PC2'] = principal_components[:, 1]

# Plot the clusters
plt.figure(figsize=(10, 8))
for cluster in range(4):
    plt.scatter(df[df['Cluster'] == cluster]['PC1'], 
                df[df['Cluster'] == cluster]['PC2'], 
                label=f'Cluster {cluster}')

plt.title('Customer Segments')
plt.xlabel('Principal Component 1')
plt.ylabel('Principal Component 2')
plt.legend()
plt.show()

# Analyze cluster characteristics
cluster_stats = df.groupby('Cluster')[['Recency', 'Frequency', 'Monetary']].mean()
print("Cluster Characteristics:")
print(cluster_stats)
```

Based on these characteristics, we can interpret the clusters:
- **Cluster 0**: High-value loyal customers (low recency, high frequency, high monetary)
- **Cluster 1**: Potential loyal customers (medium recency, medium frequency, medium monetary)
- **Cluster 2**: At-risk customers (high recency, low frequency, low monetary)
- **Cluster 3**: New customers (low recency, low frequency, low monetary)

## Conclusion

Clustering is a powerful technique for discovering hidden patterns in unlabeled data. Each algorithm has its strengths and weaknesses, making them suitable for different types of data and applications:

- **K-Means**: Simple and efficient, works well with globular clusters
- **Hierarchical Clustering**: Provides a tree-like structure, useful when the number of clusters is unknown
- **DBSCAN**: Excellent for finding clusters of arbitrary shapes and identifying outliers
- **GMM**: Provides probabilistic assignments, can model clusters of different shapes and sizes

When applying clustering, consider these best practices:
1. Preprocess your data (handle missing values, scale features)
2. Select appropriate distance metrics
3. Choose the right algorithm for your data structure
4. Determine the optimal number of clusters (if required)
5. Validate results using evaluation metrics
6. Interpret the clusters in the context of your domain

In future posts, we'll explore more advanced clustering techniques and their applications in different domains. 