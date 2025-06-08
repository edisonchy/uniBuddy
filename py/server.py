# server.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from extract_module_id import extract_module_id
from download_outline import download_outline
from process_outline import process_outline
from upload_data_supabase import upload_data_supabase

app = Flask(__name__)
CORS(app)

@app.route("/supabase-webhook", methods=["POST"])
def supabase_webhook():
    payload = request.get_json()
    record = payload.get("record", {})
    bucket, name = record.get("bucket_id"), record.get("name")
    if not bucket or not name:
        return jsonify({"error": "Missing bucket or file name"}), 400
    
    module_id = extract_module_id(name)
    if not module_id:
        return jsonify({"error": "Invalid file name"}), 400
    
    try:
        local_path = download_outline(bucket, name)
    except Exception as e:
        app.logger.error("Download failed: %s", e)
        return jsonify({"error": str(e)}), 500

    result = None
    try:
        result = process_outline(local_path)
        app.logger.info("Processed result: %s", result)
    except Exception as e:
        app.logger.error("Processing failed: %s", e)
        return jsonify({"error": str(e)}), 500
    
    try:
        resp = upload_data_supabase(module_id, result)
        app.logger.info("Inserted record ID: %s", resp.data)
        return jsonify({"message": "OK"}), 200
    except Exception as e:
        app.logger.error("Upload failed: %s", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8888, debug=True)
