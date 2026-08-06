import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    def replacer(match):
        tag = match.group(0)
        # Exclude blocky router-links just like we excluded blocky buttons
        if 'w-full' in tag and 'p-4' in tag and 'justify-between' in tag:
            return tag
        
        # If it has padding classes like px- or py-, it's likely a button-style link
        if re.search(r'\bpx-\d+', tag) and re.search(r'\bpy-\d+', tag):
            new_tag = re.sub(r'\brounded-(sm|md|lg|xl|2xl|3xl)\b', 'rounded-full', tag)
            return new_tag
        return tag

    new_content = re.sub(r'<router-link\b[^>]*>', replacer, content)

    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.vue'):
            process_file(os.path.join(root, file))
