#from sentence_transformers import SentenceTransformer

#model = SentenceTransformer("all-MiniLM-L6-v2")

#def get_embedding(text: str):
#    return model.encode(text).tolist()

# connect/services/embeddings.py

from functools import lru_cache

@lru_cache(maxsize=1)
def _get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text: str):
    model = _get_model()
    return model.encode(text).tolist()

