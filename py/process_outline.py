# process_outline.py

import os
import json
import PyPDF2
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.0,
    max_retries=2,
    api_key=groq_api_key
)

prompt_template = PromptTemplate(
    input_variables=["document_text"],
    template="""
You are an academic assistant tasked with analyzing the following document text.

Your objectives are:

1. Determine whether the document is a course outline. Respond with 'Yes' or 'No'.

2. If it is a course outline:
   a. Extract the lecturer's name and email address.
   b. List the course topics covered.
   c. Describe the assessment methods used in the module (e.g., exam, coursework, presentations, essays) and specify their respective weightings in percentage.

3. If it is not a course outline:
   a. Set all fields except 'course_outline' to empty values.

Document Text:
{document_text}

Please respond in valid JSON:

{
  "course_outline": "<Yes/No>",
  "lecturer": {
    "name": "",
    "email": ""
  },
  "topics": [],
  "assessment": []
}
"""
)

def extract_text_from_pdf(path: str) -> str:
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        return "".join(page.extract_text() or "" for page in reader.pages)

def process_outline(file_path: str) -> dict:
    text = extract_text_from_pdf(file_path)
    prompt = prompt_template.format(document_text=text)
    messages = [
        {"role": "system", "content": "You are an academic assistant."},
        {"role": "user", "content": prompt}
    ]

    response = llm.invoke(messages)
    try:
        return json.loads(response.content)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON from model", "raw": response.content}
