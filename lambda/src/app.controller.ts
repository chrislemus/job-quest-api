import fs from 'fs';
import { buildController } from '@/shared';
import { EventHandler } from './shared/types';
import { apiSpec } from './api-spec.config';

const handler: EventHandler = async () => {
  const css = fs.readFileSync('./swagger.css').toString();
  const js = fs.readFileSync('./swagger.js').toString();
  apiSpec.paths['/v1/'] = undefined as any;
  const strSpec = JSON.stringify(apiSpec, null, 2);

  return {
    status: 200,
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

  // return {
  //   status: 200,
  //   headers: { 'Content-Type': 'text/html' },
  //   body: `<!DOCTYPE html>
  // <html>
  //   <head> <meta charset="UTF-8" /> <title>Job Quest API</title>
  //      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  //   </head>
  //   <body>
  //     <div id="swagger"></div>
  //       <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
  //     <script>
  //       window.onload = () => {  window.ui = SwaggerUIBundle({ spec: ${strSpec}, dom_id: '#swagger'}); };
  //     </script>
  //   </body>
  // </html>
  // `,
  // };
};

export const appController = buildController({
  '/': {
    get: {
      handlerFn: handler,
      responses: { 200: { description: '', content: { 'text/html': {} } } },
    },
  },
});
