import fs from 'fs';
import { buildController } from '@/shared';
import { EventHandler } from './shared/types';
import { apiSpec } from './app.module';

const handler: EventHandler = async () => {
  const css = fs.readFileSync('./swagger.css').toString();
  const js = fs.readFileSync('./swagger.js').toString();
  apiSpec.paths['/v1/'] = undefined as any;
  const strSpec = JSON.stringify(apiSpec, null, 2);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: `<!DOCTYPE html>
  <html>
    <head> <meta charset="UTF-8" /> <title>Job Quest API</title> <style>${css}</style> </head>
    <body>
      <div id="swagger"></div>
      <script>${js}</script>
      <script>
        window.onload = () => {  window.ui = SwaggerUIBundle({ spec: ${strSpec}, dom_id: '#swagger'}); };
      </script>
    </body>
  </html>
  `,
  };
};

export const appController = buildController({
  '/': {
    get: {
      handlerFn: handler,
      responses: { 200: { description: '', content: { 'text/html': {} } } },
    },
  },
});
