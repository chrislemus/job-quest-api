import { APIGatewayProxyEvent } from 'aws-lambda';

function getParams(event: APIGatewayProxyEvent, urlPattern = '') {
  let reqPathParams = event.path || '';
  let pathParamPattern = urlPattern;
  if (reqPathParams.startsWith('/')) reqPathParams = reqPathParams.slice(1);
  if (pathParamPattern.startsWith('/'))
    pathParamPattern = pathParamPattern.slice(1);

  const pathParams = {};

  const reqPathParamsList = reqPathParams.split('/');
  pathParamPattern.split('/').forEach((pathPart, i) => {
    if (pathPart.startsWith(':')) {
      const pathKey = pathPart.slice(1);
      pathParams[pathKey] = reqPathParamsList[i];
    }
  });

  return pathParams;
}

function getQuery(event: APIGatewayProxyEvent) {
  const query = {};

  const qsList = event.multiValueQueryStringParameters;
  if (qsList) {
    Object.entries(qsList).forEach(([key, value]) => {
      if (!value) return;
      const qsValue = value.length === 1 ? value[0] : value;
      query[key] = qsValue;
    });
  }

  return query;
}

export function getReqData(
  event: APIGatewayProxyEvent,
  config = { urlPattern: '' },
) {
  const params = getParams(event, config.urlPattern);
  const query = getQuery(event);

  return {
    params,
    query,
  };
}
