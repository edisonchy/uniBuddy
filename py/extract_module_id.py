import os

def extract_module_id(name):
    # 1. Take everything before the first slash
    module_part = name.split("/", 1)[0]
    # 2. Optionally, also strip off any extension (if it's included)
    module_id = os.path.splitext(module_part)[0]
    return module_id