with open('apps/web/app/apps/defrag/page.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r'<<<<<<< HEAD.*?=======\n(.*?)\n>>>>>>> 0d32d2b \(feat: complete platform implementation \(defrag, library, spaces, api normalization\)\)', r'\1', content, flags=re.DOTALL)

with open('apps/web/app/apps/defrag/page.tsx', 'w') as f:
    f.write(content)
