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

          const base64Data = fileData.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');

          const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadPath);
          fs.mkdirSync(uploadDir, { recursive: true });

          const fullPath = path.join(uploadDir, fileName);
          fs.writeFileSync(fullPath, buffer);

          const url = `/uploads/${uploadPath}/${fileName}`;
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
