from langchain_huggingface.embeddings.huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores.supabase import SupabaseVectorStore
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from supabasedb import supabase
import os
from groq import Groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])


def process_chat(message, topic, module_id, chat_history) -> str:
    # 1. context from hybrid search
    docs = hybrid_search(message, topic, module_id, match_count=5) or []
    chunks = [d["chunk"] for d in docs]
    context = "\n\n---\n\n".join(chunks)

    # 2. build messages only with "content"
    trimmed = trim_history(chat_history, max_pairs=5)
    messages = [
        {"role": "system", "content": f"You are an AI assistant. Use this context:\n{context}"}
    ]
    for m in trimmed:
        messages.append({"role": m["role"], "content": m["text"]})
    messages.append({"role": "user", "content": message})

    # 3. call the API
    chat_completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages
    )
    return chat_completion.choices[0].message.content

    # 3. Call Groq Chat Completions API
    chat_completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile", messages=messages
    )
    return chat_completion.choices[0].message.content

# def stream_chat(message, topic, module_id, chat_history):
#     docs = hybrid_search(message, topic, module_id, match_count=5) or []
#     chunks = [d["chunk"] for d in docs]
#     context = "\n\n---\n\n".join(chunks)

#     trimmed = trim_history(chat_history, max_pairs=5)
#     messages = (
#         [{"role": "system", "content": f"You are an AI assistant. Use this context:\n{context}"}]
#         + trimmed
#         + [{"role": "user", "content": message}]
#     )

#     with client.chat.completions.with_streaming_response.create(
#         model="llama-3.3-70b-versatile",
#         messages=messages,
#         stream=True,
#     ) as response:
#         for line in response.iter_lines():
#             if line:
#                 yield f"data: {line}\n\n"

#     yield "data: [DONE]\n\n"
    
def trim_history(chat_history: list[dict], max_pairs=5):
    # chat_history is a list of {"role": ..., "text": ...}
    # Return only the last max_pairs user/assistant pairs
    """
    Trim the chat history to the last max_pairs user/assistant pairs.

    Given a list of {"role": ..., "text": ...} chat history, return a new list
    containing only the last max_pairs user/assistant pairs. The returned list
    still contains the original message dictionaries.

    :param chat_history: a list of {"role": ..., "text": ...}
    :param max_pairs: the number of user/assistant pairs to keep
    :return: a new list containing the last max_pairs user/assistant pairs
    """
    pairs = []
    temp = []
    for msg in chat_history:
        temp.append(msg)
        if msg["role"] == "assistant":
            pairs.append(temp)
            temp = []
    # Add any leftover user messages
    if temp:
        pairs.append(temp)

    # Flatten the last max_pairs
    trimmed = [m for pair in pairs[-max_pairs:] for m in pair]
    return trimmed


def hybrid_search(message, topic, module_id, match_count=10):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
    vector = embeddings.embed_query(message)

    response = (
        supabase.rpc(
            "hybrid_search",
            {
                "query_text": message,
                "query_embedding": vector,
                "match_count": match_count,
            },
        )
        .eq("topic", topic)
        .eq("module_id", module_id)
        .execute()
    )

    return response.data

