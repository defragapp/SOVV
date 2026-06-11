import re

with open('apps/worker/src/index.ts', 'r') as f:
    content = f.read()

resolved = content.replace(
"""<<<<<<< HEAD
import { registerAudioRoute } from "./audio.js";
=======
import { getCorsHeaders } from "./cors.js";
>>>>>>> origin/main""",
"""import { registerAudioRoute } from "./audio.js";
import { getCorsHeaders } from "./cors.js";"""
)

with open('apps/worker/src/index.ts', 'w') as f:
    f.write(resolved)
