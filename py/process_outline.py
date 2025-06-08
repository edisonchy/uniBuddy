from dotenv import load_dotenv
load_dotenv()

import os, json, PyPDF2
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate

groq_api_key = os.getenv("GROQ_API_KEY")
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.0,
    max_retries=2,
    api_key=groq_api_key,
)

prompt_template = PromptTemplate(
    input_variables=["document_text"],
    template="""
You are an academic assistant tasked with analyzing the following document text.

Your objectives are:

1. Determine whether the document is a course outline. Respond with 'Yes' or 'No'.

2. If it is a course outline:
   a. Extract all lecturers’ names and email addresses.
   b. List the course topics covered.
   c. Describe the assessment methods used in the module (e.g., exam, coursework, presentations, essays) and specify their respective weightings in percentage.
   d. Extract all learning outcomes as a list.
   e. Extract textbook information, including title, edition, authors, publisher, and publication year if available.

3. If it is not a course outline:
   a. Set all fields except 'course_outline' to empty values.

Document Text:
{document_text}

Please respond in valid JSON:

{{  
  "course_outline": "<Yes/No>",
  "lecturers": [
    {{ "name": "", "email": "" }}
  ],
  "topics": [],
  "assessment": [],
  "learning_outcomes": [],
  "textbook": {{
    "title": "",
    "edition": "",
    "authors": "",
    "publisher": "",
    "year": ""
  }}
}}
"""
)

def extract_text_from_pdf(path: str) -> str:
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        return "".join(page.extract_text() or "" for page in reader.pages)

def process_outline(file_path: str) -> dict:
    text = extract_text_from_pdf(file_path)
    prompt = prompt_template.format(document_text=text)
    response = llm.invoke([
        {"role": "system", "content": "You are an academic assistant."},
        {"role": "user", "content": prompt},
    ])
    raw = response.content
    # print("🔹 Raw LLM output:", raw, flush=True)

    # Remove triple-backticks if any, then parse JSON
    if raw.strip().startswith("```"):
        raw = raw.strip().lstrip("```json").rstrip("```").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print("❗ JSON parse error:", e, flush=True)
        raise RuntimeError(f"Failed to parse JSON: {e}")
