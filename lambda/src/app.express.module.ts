import express, { Request } from 'express';
import bodyParser from 'body-parser';
import { formatHandlerError, Obj } from './shared';
import { apiSpecPreformatted } from './api-spec.config';
import { EventHandler } from './shared/types';
import {
  dynamodb,
  initializeTable,
  JobQuestDBService,
  loadTableUtil,
  tableDefinition,
} from './core/database';
import { createMockData } from './core/database/test/create-mock-data.util';

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

  // Express uses lowercase headers (preserving case)
  if (headers.authorization) headers.Authorization = headers.authorization;

  try {
    const res = await handlerFn({ body, queryParams, pathParams, headers }, {});
    return res;
  } catch (error) {
    console.log({ error });
    return formatHandlerError(error);
  }
}

async function main() {
  await initializeTable({
    definition: tableDefinition,
    dropOnExists: false,
    dynamodb,
  });
  // const data = createMockData();
  // await loadTableUtil(data);

  // const users = await JobQuestDBService.entities.user.find({}).go({});
  // console.log(users);
  // console.log('\n\n\n');
  // const usersScan = await JobQuestDBService.entities.user.scan.where((attr, op) => op.eq(attr.email ===)).go();
  // console.log({ usersScan });
  console.log('\n\n\n');

  const port = 3005;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}
main();
