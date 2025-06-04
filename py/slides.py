import PyPDF2
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
import json

# Load environment variables
load_dotenv()
groq_api_key = os.getenv('GROQ_API_KEY')

# Initialize the ChatGroq model
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.0,
    max_retries=2,
    api_key=groq_api_key
)

# Function to extract text from PDF
def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    return text

# Extract text from the PDF
pdf_text = extract_text_from_pdf('./files/slides/slide.pdf')

# Define the prompt template
from langchain.prompts import PromptTemplate

from langchain.prompts import PromptTemplate

from langchain.prompts import PromptTemplate

prompt = PromptTemplate(
    input_variables=["document_text"],
    template="""
You are an academic assistant helping a student prepare for an exam.

Analyze the following document, which contains lecture slides, and complete the following tasks:

1. Determine whether the document consists of lecture slides. Respond with 'Yes' or 'No'.

2. If the document is lecture slides:
   - Identify and list **all key topics covered throughout the slides**.
   - These topics should be concise and useful for **exam preparation**.
   - Focus only on summarizing the core **concepts** and **terminologies** that a student should revise.

3. If the document is not lecture slides:
   - Set all fields except 'lecture_slides' to empty values.

Document Text:
{document_text}

Provide your response in the following JSON format:

{{
  "lecture_slides": "<Yes/No>",
  "key_topics": []
}}

Ensure that the output is a clean, valid JSON object with bullet-point level clarity for exam review.
"""
)



# Format the prompt with the extracted text
formatted_prompt = prompt.format(document_text=pdf_text)

# Create the list of messages for the chat model
messages = [
    {"role": "system", "content": "You are an academic assistant."},
    {"role": "user", "content": formatted_prompt}
]

# Invoke the model with the messages
response = llm.invoke(messages)

content = response.content

try:
    data = json.loads(content)
    print(data)
except json.JSONDecodeError as e:
    print("Failed to parse JSON:", e)


