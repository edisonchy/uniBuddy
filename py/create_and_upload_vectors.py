from langchain_huggingface.embeddings.huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from supabasedb import supabase
import os

def create_and_upload_vectors(text: str, file_path: str, topic: str, module_id: str):
    # --- 1. Split into chunks ---
    chunks = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200).split_text(text)

    # --- 2. Create embeddings ---
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )
    vectors = embeddings.embed_documents(chunks)

    # --- 3. Prepare insert payload ---
    payload = []
    file_name = os.path.basename(file_path)

    for chunk, vector in zip(chunks, vectors):
        payload.append({
            "chunk": chunk,
            "embedding": vector,
            "topic": topic,
            "file_name": file_name,
            "module_id": module_id
        })

    # --- 4. Insert into Supabase ---
    response = supabase.table("Slidechunks").insert(payload).execute()

    # --- 5. Debug result ---
    print("✅ Insert response:", response)