const fs = require('fs');

const filePath = 'apps/web/components/marketing/site-shell.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// I need to properly restore the <div className="flex items-center gap-4"> after the Link component.
content = content.replace(/SOVEREIGN\.OS\n          <\/Link>\n\n          \n            <button/, `SOVEREIGN.OS
          </Link>

          <div className="flex items-center gap-4">
            <button`);

fs.writeFileSync(filePath, content);
