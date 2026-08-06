import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Regex to find <input> tags and replace rounded-[something] with rounded-full
    # We want to replace rounded-(sm|md|lg|xl|2xl|3xl) with rounded-full, but only inside <input ...> tags.
    
    def replacer(match):
        tag_content = match.group(0)
        new_content = re.sub(r'\brounded-(sm|md|lg|xl|2xl|3xl|none)\b', 'rounded-full', tag_content)
        return new_content
        
    new_content = re.sub(r'<input\b[^>]*>', replacer, content)

    # For textareas we might want rounded-2xl
    def textarea_replacer(match):
        tag_content = match.group(0)
        new_content = re.sub(r'\brounded-(sm|md|lg|xl|full|none)\b', 'rounded-2xl', tag_content)
        return new_content
        
    new_content = re.sub(r'<textarea\b[^>]*>', textarea_replacer, new_content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.vue'):
            process_file(os.path.join(root, file))
