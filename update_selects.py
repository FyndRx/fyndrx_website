import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # For select we might want rounded-full as well, so it's consistent with input
    def replacer(match):
        tag_content = match.group(0)
        new_content = re.sub(r'\brounded-(sm|md|lg|xl|2xl|3xl|none)\b', 'rounded-full', tag_content)
        return new_content
        
    new_content = re.sub(r'<select\b[^>]*>', replacer, content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.vue'):
            process_file(os.path.join(root, file))
