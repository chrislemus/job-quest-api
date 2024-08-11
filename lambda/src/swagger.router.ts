import express from 'express';
import { OpenAPIV3 } from 'openapi-types';
import pathToSwagger from 'swagger-ui-dist';

const swaggerRouter = express.Router();

const spec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Swagger UI',
    version: '1.0.0',
  },
  paths: {
    '/api/v1/': {
      get: {
        description: 'Returns the swagger UI',
        responses: {
          200: {
            description: 'Success',
            content: {
              'text/html': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
};

const specStr = JSON.stringify(spec);
// url: 'https://petstore3.swagger.io/api/v3/openapi.json',
swaggerRouter.get('/', (req, res) => {
  res.contentType('text/html').send(`
  <!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
    <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
  </head>

  <body>
    <div id="swagger-ui"></div>
    <script src="./swagger-ui-bundle.js" charset="UTF-8"> </script>

    <script>
  window.onload = () => {
    window.ui = SwaggerUIBundle({
     
      spec: ${specStr},
      dom_id: '#swagger-ui',
    });
  };
</script>
  </body>
</html>
`);
});

swaggerRouter.get(
  '/swagger-ui.css',
  express.static(pathToSwagger.getAbsoluteFSPath('swagger-ui.css')),
);

swaggerRouter.get(
  '/swagger-ui-bundle.js',
  express.static(pathToSwagger.getAbsoluteFSPath('swagger-ui-bundle.js')),
);

swaggerRouter.get('swagger-initializer.js', (req, res) => {
  res.send(`
    const ui = SwaggerUIBundle({
      url: 'http://petstore.swagger.io/v2/swagger.json',
      dom_id: '#swagger-ui  
    });
  `);
});

export default swaggerRouter;
