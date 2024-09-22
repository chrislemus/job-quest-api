import express, { Request } from 'express';
import bodyParser from 'body-parser';
import { Obj } from './shared';
import { apiSpecPreformatted } from './api-spec.config';
import { EventHandler } from './shared/types';

const app = express();
app.use(bodyParser.json());

Obj.entries(apiSpecPreformatted.paths).forEach(([path, methods]) => {
  Obj.entries(methods).forEach(([method, { handlerFn }]) => {
    if (!handlerFn) throw new Error('No handler function');

    const expressPath = `${path}`.replace(/{([^}]+)}/g, ':$1');

    app[method](expressPath, async (req, _res) => {
      const { status, body, headers } = await invokeHandler(req, handlerFn);
      let res = _res.status(status);
      if (headers) {
        Obj.entries(headers).forEach(([k, v]) => (res = res.setHeader(k, v)));
      }

      if (body) res = res.send(body);
      res.end();
    });
  });
});

async function invokeHandler(req: Request, handlerFn: EventHandler) {
  const { body, headers, query: queryParams, params: pathParams } = req;
  const res = await handlerFn({ body, queryParams, pathParams, headers }, {});
  return res;
}

const port = 3005;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
