import { z } from 'zod';

export declare namespace OpenAPIV3zod {
  interface Document<T extends {} = {}> {
    openapi: string;
    info: InfoObject;
    servers?: ServerObject[];
    paths: PathsObject<T>;
    components?: ComponentsObject;
    security?: SecurityRequirementObject[];
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject;
    'x-express-openapi-additional-middleware'?: (
      | ((request: any, response: any, next: any) => Promise<void>)
      | ((request: any, response: any, next: any) => void)
    )[];
    'x-express-openapi-validation-strict'?: boolean;
  }
  interface InfoObject {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    version: string;
  }
  interface ContactObject {
    name?: string;
    url?: string;
    email?: string;
  }
  interface LicenseObject {
    name: string;
    url?: string;
  }
  interface ServerObject {
    url: string;
    description?: string;
    variables?: {
      [variable: string]: ServerVariableObject;
    };
  }
  interface ServerVariableObject {
    enum?: string[];
    default: string;
    description?: string;
  }
  interface PathsObject<T extends {} = {}, P extends {} = {}> {
    [pattern: string]: (PathItemObject<T> & P) | undefined;
  }
  enum HttpMethods {
    GET = 'get',
    PUT = 'put',
    POST = 'post',
    DELETE = 'delete',
    OPTIONS = 'options',
    HEAD = 'head',
    PATCH = 'patch',
    TRACE = 'trace',
  }
  type PathItemObject<T extends {} = {}> = {
    $ref?: string;
    summary?: string;
    description?: string;
    servers?: ServerObject[];
    parameters?: ParameterObject[];
  } & {
    [method in HttpMethods]?: OperationObject<T>;
  };
  type OperationObject<T extends {} = {}> = {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
    operationId?: string;
    parameters?: ParameterObject[];
    requestBody?: RequestBodyObject;
    responses: ResponsesObject;
    callbacks?: {
      [callback: string]: CallbackObject;
    };
    deprecated?: boolean;
    security?: SecurityRequirementObject[];
    servers?: ServerObject[];
  } & T;
  interface ExternalDocumentationObject {
    description?: string;
    url: string;
  }
  interface ParameterObject extends ParameterBaseObject {
    name: string;
    in: string;
  }
  interface HeaderObject extends ParameterBaseObject {}
  interface ParameterBaseObject {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: SchemaObject;
    example?: any;
    examples?: {
      [media: string]: ExampleObject;
    };
    content?: {
      [media: string]: MediaTypeObject;
    };
  }
  type NonArraySchemaObjectType =
    | 'boolean'
    | 'object'
    | 'number'
    | 'string'
    | 'integer';
  type ArraySchemaObjectType = 'array';
  type SchemaObject = z.Schema;
  interface ArraySchemaObject extends BaseSchemaObject {
    type: ArraySchemaObjectType;
    items: SchemaObject;
  }
  interface NonArraySchemaObject extends BaseSchemaObject {
    type?: NonArraySchemaObjectType;
  }
  interface BaseSchemaObject {
    title?: string;
    description?: string;
    format?: string;
    default?: any;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    additionalProperties?: boolean | SchemaObject;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: any[];
    properties?: {
      [name: string]: SchemaObject;
    };
    allOf?: SchemaObject[];
    oneOf?: SchemaObject[];
    anyOf?: SchemaObject[];
    not?: SchemaObject;
    nullable?: boolean;
    discriminator?: DiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: XMLObject;
    externalDocs?: ExternalDocumentationObject;
    example?: any;
    deprecated?: boolean;
  }
  interface DiscriminatorObject {
    propertyName: string;
    mapping?: {
      [value: string]: string;
    };
  }
  interface XMLObject {
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
  }
  interface ReferenceObject {
    $ref: string;
  }
  interface ExampleObject {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
  }
  interface MediaTypeObject {
    schema?: SchemaObject;
    example?: any;
    examples?: {
      [media: string]: ExampleObject;
    };
    encoding?: {
      [media: string]: EncodingObject;
    };
  }
  interface EncodingObject {
    contentType?: string;
    headers?: {
      [header: string]: HeaderObject;
    };
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
  }
  interface RequestBodyObject {
    description?: string;
    content: {
      [media: string]: MediaTypeObject;
    };
    required?: boolean;
  }
  interface ResponsesObject {
    [code: string]: ResponseObject;
  }
  interface ResponseObject {
    description: string;
    headers?: {
      [header: string]: HeaderObject;
    };
    content?: {
      [media: string]: MediaTypeObject;
    };
    links?: {
      [link: string]: LinkObject;
    };
  }
  interface LinkObject {
    operationRef?: string;
    operationId?: string;
    parameters?: {
      [parameter: string]: any;
    };
    requestBody?: any;
    description?: string;
    server?: ServerObject;
  }
  interface CallbackObject {
    [url: string]: PathItemObject;
  }
  interface SecurityRequirementObject {
    [name: string]: string[];
  }
  interface ComponentsObject {
    schemas?: {
      [key: string]: SchemaObject;
    };
    responses?: {
      [key: string]: ResponseObject;
    };
    parameters?: {
      [key: string]: ParameterObject;
    };
    examples?: {
      [key: string]: ExampleObject;
    };
    requestBodies?: {
      [key: string]: RequestBodyObject;
    };
    headers?: {
      [key: string]: HeaderObject;
    };
    securitySchemes?: {
      [key: string]: SecuritySchemeObject;
    };
    links?: {
      [key: string]: LinkObject;
    };
    callbacks?: {
      [key: string]: CallbackObject;
    };
  }
  type SecuritySchemeObject =
    | HttpSecurityScheme
    | ApiKeySecurityScheme
    | OAuth2SecurityScheme
    | OpenIdSecurityScheme;
  interface HttpSecurityScheme {
    type: 'http';
    description?: string;
    scheme: string;
    bearerFormat?: string;
  }
  interface ApiKeySecurityScheme {
    type: 'apiKey';
    description?: string;
    name: string;
    in: string;
  }
  interface OAuth2SecurityScheme {
    type: 'oauth2';
    description?: string;
    flows: {
      implicit?: {
        authorizationUrl: string;
        refreshUrl?: string;
        scopes: {
          [scope: string]: string;
        };
      };
      password?: {
        tokenUrl: string;
        refreshUrl?: string;
        scopes: {
          [scope: string]: string;
        };
      };
      clientCredentials?: {
        tokenUrl: string;
        refreshUrl?: string;
        scopes: {
          [scope: string]: string;
        };
      };
      authorizationCode?: {
        authorizationUrl: string;
        tokenUrl: string;
        refreshUrl?: string;
        scopes: {
          [scope: string]: string;
        };
      };
    };
  }
  interface OpenIdSecurityScheme {
    type: 'openIdConnect';
    description?: string;
    openIdConnectUrl: string;
  }
  interface TagObject {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
  }
}

export interface IJsonSchema {
  id?: string;
  $schema?: string;
  title?: string;
  description?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  additionalItems?: boolean | IJsonSchema;
  items?: IJsonSchema | IJsonSchema[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  additionalProperties?: boolean | IJsonSchema;
  definitions?: {
    [name: string]: IJsonSchema;
  };
  properties?: {
    [name: string]: IJsonSchema;
  };
  patternProperties?: {
    [name: string]: IJsonSchema;
  };
  dependencies?: {
    [name: string]: IJsonSchema | string[];
  };
  enum?: any[];
  type?: string | string[];
  allOf?: IJsonSchema[];
  anyOf?: IJsonSchema[];
  oneOf?: IJsonSchema[];
  not?: IJsonSchema;
  $ref?: string;
}
