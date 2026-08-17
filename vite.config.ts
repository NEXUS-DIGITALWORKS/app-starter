import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// 開発時のみ、ローカルの商品画像アーカイブ（プロジェクト外のフォルダ）を配信する。
// 取込データの image 列（例: /1/0/101775621734_0157658996.jpg というMagento形式のハッシュ付きパス）を
// そのまま /product-images 配下にマッピングする。本番ビルド（vite build/preview）には含まれない。
const PRODUCT_IMAGE_DIR = 'C:\\Work\\MIK\\Archive\\product';
const MIME_TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };

function productImagesPlugin(): Plugin {
  return {
    name: 'serve-product-images',
    configureServer(server) {
      server.middlewares.use('/product-images', (req, res, next) => {
        const urlPath = decodeURIComponent((req.url ?? '').split('?')[0]);
        const filePath = path.join(PRODUCT_IMAGE_DIR, urlPath);
        if (!filePath.startsWith(PRODUCT_IMAGE_DIR)) {
          next();
          return;
        }
        fs.stat(filePath, (err, stat) => {
          if (err || !stat.isFile()) {
            next();
            return;
          }
          res.setHeader('Content-Type', MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream');
          fs.createReadStream(filePath).pipe(res);
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), productImagesPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
