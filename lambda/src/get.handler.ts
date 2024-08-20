import { BuildOpenApiSpecArgOperationObj } from './common';
import { EventHandler } from './common/types';
import fs from 'fs';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: { 200: { description: '', content: { 'text/html': {} } } },
};

export const handler: EventHandler = async () => {
  const css = fs.readFileSync('./swagger.css').toString();
  const js = fs.readFileSync('./swagger.js').toString();
  const apiSpec = fs.readFileSync('./api-spec.json').toString();
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
        window.onload = () => {  window.ui = SwaggerUIBundle({ spec: ${apiSpec}, dom_id: '#swagger'}); };
      </script>
    </body>
  </html>
  `,
  };
};
