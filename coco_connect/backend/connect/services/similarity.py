import numpy as np

def cosine_similarity(v1, v2):
    """
    Returns cosine similarity between two vectors in range [0, 1].
    Safe against empty vectors and zero division.
    """

    if not v1 or not v2:
        return 0.0

    v1 = np.asarray(v1, dtype=np.float32)
    v2 = np.asarray(v2, dtype=np.float32)

    if v1.shape != v2.shape:
        return 0.0

    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)

    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0

    similarity = np.dot(v1, v2) / (norm1 * norm2)

    # Clamp for numerical stability
    return float(np.clip(similarity, 0.0, 1.0))
