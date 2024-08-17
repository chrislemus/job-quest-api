import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export async function authLoginHandler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const queryParams = {};
  if (event.multiValueQueryStringParameters) {
    Object.entries(event.multiValueQueryStringParameters).forEach(
      ([key, value]) => {
        if (!value) return;
        queryParams[key] = value.length === 1 ? value[0] : value;
      },
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ handler: authLoginHandler.name, event }),
  };
}
