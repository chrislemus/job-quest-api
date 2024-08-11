import fs from 'fs';
import openApiSpec from './src/openapi.config';

try {
  const specStr = JSON.stringify(openApiSpec);

  const htmlContent = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>JobQuest API</title>
      <link rel="stylesheet" href="./index.css" />
    </head>
  
    <body>
      <div id="swagger"></div>
      <script src="./index.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({ url: './openapi.json', dom_id: '#swagger'});
        };
      </script>
    </body>
  </html>
  `;

  fs.writeFileSync('public/index.html', htmlContent);
  fs.writeFileSync('public/openapi.json', specStr);
} catch (error) {
  console.error(error);
}
