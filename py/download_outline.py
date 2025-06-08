# download_outline.py

import os
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def download_outline(bucket: str, object_name: str, save_dir: str = "./downloads/outlines") -> str:
    """
    Downloads a file from Supabase Storage via a signed URL
    and saves it to ./downloads/outlines/{filename}.
    
    Returns the local file path.
    Raises RuntimeError on failure.
    """
    os.makedirs(save_dir, exist_ok=True)

    signed = supabase.storage.from_(bucket).create_signed_url(object_name, expires_in=60)
    signed_url = signed.get("signedURL")

    if not signed_url:
        raise RuntimeError(f"Failed to create signed URL: {signed}")

    resp = requests.get(signed_url)
    resp.raise_for_status()

    filename = os.path.basename(object_name)
    local_path = os.path.join(save_dir, filename)

    with open(local_path, "wb") as f:
        f.write(resp.content)

    return local_path
