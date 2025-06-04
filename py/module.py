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
pdf_text = extract_text_from_pdf('failed.pdf')

# Define the prompt template
from langchain.prompts import PromptTemplate

prompt = PromptTemplate(
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
   a. Set all fields except 'course_outline' to empty values as shown below.

Document Text:
{document_text}

Please provide your response in the following JSON format:

{{
  "course_outline": "<Yes/No>",
  "lecturer": {{
    "name": "",
    "email": ""
  }},
  "topics": [],
  "assessment": []
}}

Ensure that the output is a valid JSON object.
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


