from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import logging

# Assuming these imports set up your Supabase client correctly
from supabasedb import supabase
from process_outline import process_outline
from upload_data_supabase import upload_data_supabase
from process_ppt import process_ppt


app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
app.logger.setLevel(logging.INFO)

LOCAL_UPLOAD_FOLDER = './downloads/'

if not os.path.exists(LOCAL_UPLOAD_FOLDER):
    os.makedirs(LOCAL_UPLOAD_FOLDER)
    app.logger.info(f"Ensured local upload folder exists: {LOCAL_UPLOAD_FOLDER}")

@app.route("/process-outline", methods=["POST"])
def upload_outline_to_storage():
    processed_data = None
    db_upload_success = False
    supabase_file_upload_success = False # Track Supabase file upload status
    local_file_path = None # Initialize local_file_path to None

    try:
        # --- 1. Initial Request Checks ---
        if "file" not in request.files:
            app.logger.warning("No 'file' part in the request.")
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files["file"]
        moduleId = request.form.get("moduleId")

        if not file or not moduleId:
            app.logger.warning("No file or module ID provided. File presence: %s, ModuleId presence: %s", bool(file), bool(moduleId))
            return jsonify({"error": "No file or module ID provided"}), 400

        if file.filename == "":
            app.logger.warning("No selected file (empty filename).")
            return jsonify({"error": "No selected file"}), 400

        if not file.content_type == "application/pdf":
            app.logger.warning("Invalid file type: %s. Only PDF allowed.", file.content_type)
            return jsonify({"error": "Only PDF files are allowed"}), 400

        # --- 2. File Size Validation ---
        MAX_FILE_SIZE_MB = 10
        MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

        if file.content_length > MAX_FILE_SIZE_BYTES:
            app.logger.warning("File size %s bytes exceeds limit of %s bytes.", file.content_length, MAX_FILE_SIZE_BYTES)
            return jsonify({"error": f"File size exceeds {MAX_FILE_SIZE_MB}MB limit."}), 413

        # --- 3. Generate Safe Filename for Local and Supabase Storage ---
        original_filename_no_ext = os.path.splitext(file.filename)[0]
        file_extension = os.path.splitext(file.filename)[1]

        local_filename = f"outlines/{moduleId}_{original_filename_no_ext}{file_extension}"
        local_file_path = os.path.join(LOCAL_UPLOAD_FOLDER, local_filename)

        supabase_file_path = f"{moduleId}/{original_filename_no_ext}{file_extension}"

        app.logger.info(f"Generated local path: {local_file_path}")
        app.logger.info(f"Generated Supabase path: {supabase_file_path}")

        # --- 4. Save the file Locally First ---
        local_save_success = False
        try:
            file.save(local_file_path)
            local_save_success = True
            app.logger.info("File successfully saved locally to: %s", local_file_path)
        except Exception as e:
            app.logger.error("Failed to save file locally: %s", e, exc_info=True)
            return jsonify({"error": f"Failed to save file locally: {str(e)}"}), 500

        # --- Use a nested try...finally block for operations that use the local file ---
        # This ensures local_file_path is cleaned up even if subsequent steps fail
        try:
            # --- 5. Process Outline (LLM Extraction) using the locally saved file ---
            try:
                app.logger.info(f"Attempting to process outline from {local_file_path}")
                processed_data = process_outline(local_file_path) # Call your LLM processing function
                app.logger.info("Outline processed successfully.")

                if processed_data.get("course_outline") == "No":
                    app.logger.warning("Document was identified as NOT a course outline by LLM.")
                    return jsonify({
                        "error": "The uploaded document was identified as not a course outline.",
                        "llm_reason": processed_data.get("message", "LLM determined not a course outline.")
                    }), 422

            except RuntimeError as e:
                app.logger.error("Error during LLM processing of outline: %s", e, exc_info=True)
                return jsonify({"error": f"Failed to process outline with LLM: {str(e)}"}), 500
            except Exception as e:
                app.logger.error("Unexpected error during LLM processing: %s", e, exc_info=True)
                return jsonify({"error": f"An unexpected error occurred during outline processing: {str(e)}"}), 500

            # --- 6. Upload Processed Data to Supabase Database ---
            try:
                app.logger.info("Attempting to upload processed data to Supabase Database.")
                db_upload_response = upload_data_supabase(moduleId, processed_data)
                if db_upload_response:
                    db_upload_success = True
                    app.logger.info("Processed data uploaded to Supabase Database successfully.")
                else:
                    app.logger.error("Failed to upload processed data to Supabase Database.")
                    return jsonify({"error": "Failed to upload processed data to database."}), 500
            except Exception as e:
                app.logger.error("Error uploading processed data to Supabase DB: %s", e, exc_info=True)
                return jsonify({"error": f"Error uploading processed data to database: {str(e)}"}), 500

            # --- 7. Reset File Pointer for Supabase File Storage Upload ---
            file.seek(0)
            file_content_for_supabase = file.read()
            app.logger.info(f"Read file content for Supabase file upload (size: {len(file_content_for_supabase)} bytes).")

            # --- 8. Upload the Original PDF file to Supabase Storage ---
            supabase_public_url = None # Re-initialize for this block
            try:
                upload_response = supabase.storage.from_("outlines").upload(
                    supabase_file_path,
                    file_content_for_supabase,
                    {
                        "contentType": file.content_type,
                        "upsert": False,
                    },
                )

                if upload_response:
                    supabase_file_upload_success = True
                    app.logger.info("Original PDF file successfully uploaded to Supabase Storage.")

                    try:
                        public_url_response = supabase.storage.from_("outlines").get_public_url(
                            supabase_file_path
                        )
                        supabase_public_url = public_url_response
                        app.logger.info("Supabase Public URL: %s", supabase_public_url)

                    except Exception as e:
                        app.logger.error("Error retrieving public URL from Supabase: %s", e, exc_info=True)
                        return jsonify({"error": f"Failed to get public URL from Supabase: {str(e)}"}), 500
                else:
                    app.logger.error("Original PDF file upload to Supabase Storage returned an unexpected non-success response.")
                    return jsonify({"error": "Failed to upload original file to Supabase Storage: Unexpected response"}), 500

            except Exception as e:
                app.logger.error("An unexpected error occurred during Supabase file upload: %s", e, exc_info=True)
                return jsonify({"error": f"An error occurred during Supabase file upload: {str(e)}"}), 500


            # --- 9. Successful Response (only reached if inner try block completes without unhandled exception) ---
            return (
                jsonify(
                    {
                        "message": "File and outline processed successfully.",
                        "localSaveStatus": "success" if local_save_success else "failed",
                        "localFilePath": local_file_path if local_save_success else None,
                        "outlineProcessed": "success",
                        "processedData": processed_data,
                        "databaseUploadStatus": "success" if db_upload_success else "failed",
                        "supabaseFileUploadStatus": "success" if supabase_file_upload_success else "failed",
                        "supabaseFilePath": supabase_file_path if supabase_file_upload_success else None,
                        "publicUrl": supabase_public_url,
                    }
                ),
                200,
            )

        finally:
            # --- 10. Delete Local File (ALWAYS runs if local_file_path was set) ---
            if local_file_path and os.path.exists(local_file_path):
                try:
                    os.remove(local_file_path)
                    app.logger.info(f"Successfully deleted local file: {local_file_path}")
                except OSError as e:
                    app.logger.error(f"Error deleting local file {local_file_path}: {e}", exc_info=True)
            else:
                app.logger.warning(f"Local file {local_file_path} not found for deletion or path not set.")


    except Exception as e: # This outer catch handles errors before local_file_path is created, or other unhandled exceptions
        app.logger.error("Unhandled error in /process-outline: %s", e, exc_info=True)
        return jsonify({"error": "An internal server error occurred."}), 500

@app.route("/process-ppt", methods=["POST"])
def process_slide_pdf():
    try:
        if "file" not in request.files:
            return jsonify({"error": "Missing file"}), 400
        file = request.files["file"]

        module_id = request.form.get("moduleId")
        topic = request.form.get("topic")

        if not file or not module_id or not topic:
            return jsonify({"error": "Missing file, moduleId, or topic"}), 400

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if file.content_type != "application/pdf":
            return jsonify({"error": "Only PDF files are allowed"}), 400

        # --- 3. Generate File Paths ---
        original_filename_no_ext = os.path.splitext(file.filename)[0]
        file_extension = os.path.splitext(file.filename)[1]

        local_filename = f"slides/{module_id}_{topic}_{original_filename_no_ext}{file_extension}"
        local_path = os.path.join(LOCAL_UPLOAD_FOLDER, local_filename)

        # --- 4. Save Locally ---
        try:
            file.save(local_path)
            app.logger.info("File successfully saved locally to: %s", local_path)
        except Exception as e:
            app.logger.error("Failed to save file locally: %s", e, exc_info=True)
            return jsonify({"error": f"Failed to save file locally: {str(e)}"}), 500

        # --- 5. Process with process_ppt ---
        result = process_ppt(local_path, topic, module_id)

        # --- 6. Delete Local File ---
        try:
            if os.path.exists(local_path):
                os.remove(local_path)
                app.logger.info("Successfully deleted local file: %s", local_path)
        except Exception as e:
            app.logger.warning("Failed to delete local file: %s", e, exc_info=True)

        # --- 7. Return response based on result ---
        if result.get("topic_related_to_ppt", "").strip().lower() == "no":
            return jsonify({
                "status": "not_related",
                "message": "Presentation is not related to the topic",
                "result": result
            }), 200

        return jsonify({
            "status": "success",
            "message": "Presentation processed and uploaded successfully",
            "result": result
        }), 200

    except Exception as e:
        app.logger.error("Unhandled error in /process-ppt: %s", e, exc_info=True)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    
if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()

    app.run(debug=True, port=8888)