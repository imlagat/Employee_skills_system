import os
import re

directories_to_scan = ['src']
pattern_white_hex = re.compile(r"color\s*:\s*['\"]?(#fff(?:fff)?)['\"]?", re.IGNORECASE)
pattern_white_word = re.compile(r"color\s*:\s*['\"]?white['\"]?", re.IGNORECASE)
pattern_var_white = re.compile(r"color\s*:\s*['\"]?var\(--white\)['\"]?", re.IGNORECASE)

replacement = "color: var(--text-main)"

for root, _, files in os.walk(directories_to_scan[0]):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = pattern_white_hex.sub(replacement, content)
            new_content = pattern_white_word.sub(replacement, new_content)
            new_content = pattern_var_white.sub(replacement, new_content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")

print("Color fix completed.")
