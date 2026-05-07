import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function localUploadPlugin() {
  return {
    name: 'local-upload',
    configureServer(server) {
      server.middlewares.use('/api/upload', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          let body = '';
          for await (const chunk of req) {
            body += chunk;
          }

          const { fileName, filePath: uploadPath, fileData } = JSON.parse(body);

          const safeUploadPath = path.normalize(uploadPath || '').replace(/^(\.\.(\/|\\|$))+/, '');
          const safeFileName = path.basename(fileName || '');
          if (!safeUploadPath || !safeFileName || path.isAbsolute(safeUploadPath)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid upload path' }));
            return;
          }

          const base64Data = fileData.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');

          const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
          const uploadDir = path.join(uploadsRoot, safeUploadPath);
          if (!uploadDir.startsWith(uploadsRoot + path.sep)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid upload path' }));
            return;
          }

          fs.mkdirSync(uploadDir, { recursive: true });

          const fullPath = path.join(uploadDir, safeFileName);
          fs.writeFileSync(fullPath, buffer);

          const url = `/uploads/${safeUploadPath.split(path.sep).join('/')}/${safeFileName}`;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ url }));
        } catch (err) {
          console.error('[LocalUpload] Error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localUploadPlugin()],
})
