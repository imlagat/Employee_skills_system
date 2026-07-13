import os
import re

directories_to_scan = ['src']
# Find exactly 'color: var(--text-main)' inside jsx style objects and quote it
pattern_invalid_var = re.compile(r"color\s*:\s*var\(--text-main\)")
replacement = "color: 'var(--text-main)'"

for root, _, files in os.walk(directories_to_scan[0]):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = pattern_invalid_var.sub(replacement, content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")

print("JSX Color fix completed.")
