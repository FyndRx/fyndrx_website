import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find all <button ...> tags
    def replacer(match):
        tag = match.group(0)
        # Only replace if it's not a blocky card (e.g. p-4 without px/py)
        # Let's just blindly replace rounded-* with rounded-full for all buttons
        # EXCEPT if we see it's a huge block or list item, but honestly rounded-full is the pill aesthetic they want.
        # Actually, let's just do it. If it's a <button>, they probably want it pill shaped to match inputs.
        # Wait, let's exclude "rounded-2xl" if it also has "w-full" and "p-4" (like in ProfileView).
        if 'w-full' in tag and 'p-4' in tag and 'justify-between' in tag:
            return tag # leave ProfileView cards alone
            
        new_tag = re.sub(r'\brounded-(sm|md|lg|xl|2xl|3xl)\b', 'rounded-full', tag)
        return new_tag

    new_content = re.sub(r'<button\b[^>]*>', replacer, content)

    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.vue'):
            process_file(os.path.join(root, file))
