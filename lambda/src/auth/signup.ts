import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import passport from 'passport';
// import { getReqData } from './get-req-data';
import { pathToRegexp, match, parse, compile } from 'path-to-regexp';
import express from 'express';

// import express from 'express';
// import serverlessExpress from '@vendia/serverless-express';
// const app = express();
// const port = 3000;

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });
// app.get('/me/:id', (req, res) => {
//   console.log(req.params);
//   res.send('me path!');
// });

// app.emit('/');
// app.re
// export const handler = serverlessExpress({ app });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });
//
export const get: APIGatewayProxyHandler = async (event, ctx) => {
  const { multiValueHeaders, ...filteredEvent } = event;

  const path = pathToRegexp('/books/:id/:name');

  const pathExec = path.exec(event.path);
  if (pathExec) {
    const pathObj = {};

    console.log('\n\n\n\n');
    path.keys.forEach((key, i) => {
      pathObj[key.name] = pathExec[i + 1];
    });
    console.log(pathObj);
    console.log('\n\n\n\n');
  }
  // const pathMatch = path('/books/:id');
  // console.log('\n\n\n\n');
  // const pattern = new URLPattern({ pathname: '/books/:id' });

  // console.log(passport);

  // const { params, query } = getReqData(event);

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Hello from default!',
      // params,
      // query,
      input: filteredEvent,
      // ctx,
    }),
  };
};
