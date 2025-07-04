from langchain_huggingface.embeddings.huggingface import HuggingFaceEmbeddings
from supabasedb import supabase  # your Supabase client
import os

# --- 1. Prepare text to embed ---
text = "Hello world"
chunk = text
topic = "Test Topic"
file_name = "dummy.pdf"
module_id = "SCC100"

# --- 2. Create embedding using Hugging Face model ---
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True}
)

vector = embeddings.embed_documents([text])[0]  # returns a list of vectors, take first

# --- 3. Insert into Supabase manually ---
response = supabase.table("Slidechunks").insert({
    "content": chunk,
    "embedding": vector,
    "topic": topic,
    "file_name": file_name,
    "module_id": module_id
}).execute()

print("✅ Insert result:", response)