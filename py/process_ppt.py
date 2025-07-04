from dotenv import load_dotenv
import os, json, re
import PyPDF2
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from create_and_upload_vectors import create_and_upload_vectors
from supabasedb import supabase

load_dotenv()

# --- Load LLM ---
groq_api_key = os.getenv("GROQ_API_KEY")
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.0,
    max_retries=2,
    api_key=groq_api_key,
)

# --- Prompt to check topic relevance ---
topic_check_prompt = PromptTemplate(
    input_variables=["document_text", "topic"],
    template="""
You are an academic assistant.

Given the text content of a PowerPoint presentation, determine if it is related to the following topic:

Topic: "{topic}"

Presentation Text:
{document_text}

Respond ONLY with valid JSON in the following format:

{{ "topic_related_to_ppt": "<Yes/No>" }}
"""
)

# --- Extract text from PDF ---
def extract_text_from_pdf(file_path: str) -> str:
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        return "".join(page.extract_text() or "" for page in reader.pages)

# --- Sanitize filenames/paths ---
def sanitize_for_path(s: str) -> str:
    return re.sub(r'[^\w\-_. ]', '_', s)

# --- Main processor ---
def process_ppt(file_path: str, topic: str, module_id: str) -> dict:
    try:
        # 1. Extract text
        text = extract_text_from_pdf(file_path)

        # 2. Sanitize inputs for file paths
        clean_topic = sanitize_for_path(topic)
        clean_module_id = sanitize_for_path(module_id)
        storage_path = f"{clean_module_id}/{clean_topic}.pdf"
        storage_bucket = "ppt"

        # 3. Check topic relevance via LLM
        prompt = topic_check_prompt.format(document_text=text, topic=topic)
        response = llm.invoke([
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ])
        raw = re.sub(r"^```json|```$", "", response.content.strip()).strip()

        result = json.loads(raw)
        if "topic_related_to_ppt" not in result:
            raise ValueError("Missing 'topic_related_to_ppt' key.")

        # 4. Only upload if relevant
        if result["topic_related_to_ppt"].strip().lower() == "no":
            # Upload to Supabase Storage
            with open(file_path, "rb") as f:
                upload_resp = supabase.storage.from_(storage_bucket).upload(
                    path=storage_path,
                    file=f,
                    file_options={"cache-control": "3600", "content-type": "application/pdf", "upsert": "true"}
                )

            # Correct attribute access
            if hasattr(upload_resp, "error") and upload_resp.error:
                print("⚠️ Upload to storage failed:", upload_resp.error)
                return {"error": "Failed to upload file to Supabase storage"}

            # On success, upload_resp.data contains bucket info
            print("✅ Upload succeeded, value:", getattr(upload_resp, "data", None))

            # Generate and upload vector embeddings
            create_and_upload_vectors(text, storage_path, topic, module_id)

            result["storage_path"] = storage_path  # Optionally return
            return result
        else:
            return result  # Not related to topic
    except Exception as e:
        raise RuntimeError(f"Failed in process_ppt: {e}")