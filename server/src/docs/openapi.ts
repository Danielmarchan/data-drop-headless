import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import z from 'zod';
import {
  datasetDtoSchema,
  datasetColumnSchema,
  uploadDtoSchema,
  userDtoSchema,
  paginatedListSchema,
} from '@data-drop/api-schema';
import { updateDatasetSchema } from '@/api/datasets/datasets.schema';
import { createUploadSchema, updateUploadSchema } from '@/api/uploads/uploads.schema';
import { createUserSchema, updateUserSchema } from '@/api/users/users.schema';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// Schema registrations

const DatasetColumnSchema = registry.register(
  'DatasetColumn',
  datasetColumnSchema.openapi({ description: 'A single column definition within a dataset' }),
);

const DatasetDtoSchema = registry.register(
  'DatasetDto',
  datasetDtoSchema
    .extend({ columns: z.array(DatasetColumnSchema) })
    .openapi({ description: 'A dataset with its column schema' }),
);

const UploadDtoSchema = registry.register(
  'UploadDto',
  uploadDtoSchema.openapi({ description: 'A data upload belonging to a dataset' }),
);

const UserDtoSchema = registry.register(
  'UserDto',
  userDtoSchema.openapi({ description: 'A platform user with their assigned role' }),
);

const PaginatedDatasets = registry.register(
  'PaginatedDatasets',
  paginatedListSchema(DatasetDtoSchema).openapi({ description: 'Paginated list of datasets' }),
);

const PaginatedUploads = registry.register(
  'PaginatedUploads',
  paginatedListSchema(UploadDtoSchema).openapi({ description: 'Paginated list of uploads' }),
);

const PaginatedUsers = registry.register(
  'PaginatedUsers',
  paginatedListSchema(UserDtoSchema).openapi({ description: 'Paginated list of users' }),
);

const ErrorSchema = registry.register(
  'ErrorResponse',
  z.object({ error: z.string() }).openapi({ description: 'Error response' }),
);

// Common parameters

const paginationParams = [
  { name: 'page', in: 'query' as const, required: true, schema: { type: 'integer' as const, minimum: 1 } },
  { name: 'limit', in: 'query' as const, required: true, schema: { type: 'integer' as const, minimum: 1 } },
  { name: 'search', in: 'query' as const, required: false, schema: { type: 'string' as const } },
];

const unauthorizedResponse = {
  401: { description: 'Unauthorized — valid session required' },
  403: { description: 'Forbidden — admin role required' },
};

// Datasets

registry.registerPath({
  method: 'get',
  path: '/api/datasets',
  summary: 'List datasets (paginated)',
  tags: ['Datasets'],
  parameters: paginationParams,
  responses: {
    200: {
      description: 'Paginated list of datasets',
      content: { 'application/json': { schema: PaginatedDatasets } },
    },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/datasets/{id}',
  summary: 'Get a dataset by ID',
  tags: ['Datasets'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: {
      description: 'Dataset found',
      content: { 'application/json': { schema: DatasetDtoSchema } },
    },
    404: { description: 'Dataset not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/datasets/{id}',
  summary: 'Update a dataset',
  tags: ['Datasets'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: updateDatasetSchema.openapi('UpdateDatasetInput'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated dataset',
      content: { 'application/json': { schema: DatasetDtoSchema } },
    },
    404: { description: 'Dataset not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

// Uploads

registry.registerPath({
  method: 'get',
  path: '/api/uploads',
  summary: 'List uploads (paginated)',
  tags: ['Uploads'],
  parameters: paginationParams,
  responses: {
    200: {
      description: 'Paginated list of uploads',
      content: { 'application/json': { schema: PaginatedUploads } },
    },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/uploads/{id}',
  summary: 'Get an upload by ID',
  tags: ['Uploads'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: {
      description: 'Upload found',
      content: { 'application/json': { schema: UploadDtoSchema } },
    },
    404: { description: 'Upload not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/uploads',
  summary: 'Create an upload',
  tags: ['Uploads'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: createUploadSchema
            .openapi('CreateUploadInput'),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Upload created',
      content: { 'application/json': { schema: UploadDtoSchema } },
    },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/uploads/{id}',
  summary: 'Update an upload',
  tags: ['Uploads'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: updateUploadSchema
            .openapi('UpdateUploadInput'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated upload',
      content: { 'application/json': { schema: UploadDtoSchema } },
    },
    404: { description: 'Upload not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/uploads/{id}',
  summary: 'Delete an upload',
  tags: ['Uploads'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    204: { description: 'Upload deleted' },
    404: { description: 'Upload not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

// Users

registry.registerPath({
  method: 'get',
  path: '/api/users',
  summary: 'List users (paginated)',
  tags: ['Users'],
  parameters: paginationParams,
  responses: {
    200: {
      description: 'Paginated list of users',
      content: { 'application/json': { schema: PaginatedUsers } },
    },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users/{id}',
  summary: 'Get a user by ID',
  tags: ['Users'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: {
      description: 'User found',
      content: { 'application/json': { schema: UserDtoSchema } },
    },
    404: { description: 'User not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/users',
  summary: 'Create a user',
  tags: ['Users'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: createUserSchema
            .openapi('CreateUserInput'),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created',
      content: { 'application/json': { schema: UserDtoSchema } },
    },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/users/{id}',
  summary: 'Update a user',
  tags: ['Users'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: updateUserSchema
            .openapi('UpdateUserInput'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated user',
      content: { 'application/json': { schema: UserDtoSchema } },
    },
    404: { description: 'User not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/users/{id}',
  summary: 'Delete a user',
  tags: ['Users'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    204: { description: 'User deleted' },
    404: { description: 'User not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

// ─── Security scheme ─────────────────────────────────────────────────────────

registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'better-auth.session_token',
  description: 'Session cookie issued by better-auth on sign-in via /api/auth/sign-in/email',
});

// ─── Generator ───────────────────────────────────────────────────────────────

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'DataDrop API',
      version: '1.0.0',
      description: 'REST API for the DataDrop headless platform',
    },
    servers: [{ url: '/', description: 'Current server' }],
    security: [{ cookieAuth: [] }],
  });
}
