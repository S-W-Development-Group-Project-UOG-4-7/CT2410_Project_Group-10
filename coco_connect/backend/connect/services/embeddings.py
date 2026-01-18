# connect/services/embeddings.py

from functools import lru_cache
import numpy as np

@lru_cache(maxsize=1)
def _get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")


def get_embedding(text: str):
    """
    Returns a normalized embedding vector (list[float]).
    Safe for empty input and consistent for cosine similarity.
    """

    if not text or not text.strip():
        return []

    model = _get_model()

    # Generate embedding
    embedding = model.encode(
        text.strip(),
        convert_to_numpy=True,
        normalize_embeddings=True,  # IMPORTANT
    )

    return embedding.tolist()
