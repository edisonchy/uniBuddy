from langchain_huggingface.embeddings.huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from supabasedb import supabase
import os

def create_and_upload_vectors(text: str, file_path: str, topic: str, module_id: str):
    chunks = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    ).split_text(text)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )
    vectors = embeddings.embed_documents(chunks)

    file_name = os.path.basename(file_path)
    payload = []
    for chunk, vector in zip(chunks, vectors):
        payload.append({
            "chunk": chunk,
            "embedding": vector,
            "topic": topic,
            "file_name": file_name,
            "module_id": module_id
        })

    response = supabase.table("Slidechunks").insert(payload).execute()
    print("✅ Upload response:", response)

# create_and_upload_vectors("Hello world", "dummy.pdf", "Test Topic", "SCC100")