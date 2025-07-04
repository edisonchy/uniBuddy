from supabase import create_client
import os

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def upload_data_supabase(module_id, result):
  resp = supabase.table("Outlines").insert({
            "module_id": module_id,
            "content": result  # store full JSON result
        }).execute()

  return resp
