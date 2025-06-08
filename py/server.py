from flask import Flask, request, jsonify
from flask_cors import CORS
from download_outline import download_outline
from process_outline import process_outline

app = Flask(__name__)
CORS(app)

@app.route("/supabase-webhook", methods=["POST"])
def supabase_webhook():
    payload = request.get_json()
    record = payload.get("record", {})
    bucket, name = record.get("bucket_id"), record.get("name")

    if not bucket or not name:
        return jsonify({"error": "Missing bucket or file name"}), 400

    try:
        local_path = download_outline(bucket, name)
        result = process_outline(local_path)
        return jsonify({"message": "OK", "analysis": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8888, debug=True)
