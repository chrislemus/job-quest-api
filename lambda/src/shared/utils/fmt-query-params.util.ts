import { APIGatewayProxyEvent } from 'aws-lambda';

export function fmtQueryParams<T extends APIGatewayProxyEvent>(
  data: T,
): T & { queryParams: Record<string, string[] | string> } {
  const multiValueQS = data.multiValueQueryStringParameters;
  const queryParams: Record<string, string[] | string> = {};

  if (multiValueQS) {
    Object.entries(multiValueQS).forEach(([k, v]) => {
      if (!v) return;
      queryParams[k] = v.length === 1 ? v[0] : v;
    });
  }
  data = Object.assign(data, { queryParams });
  return data as T & {
    queryParams: Record<string, string[] | string>;
  };
}
