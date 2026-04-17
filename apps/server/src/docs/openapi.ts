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
  userDetailDtoSchema,
  paginatedListSchema,
  adminListDatasetSchema,
} from '@data-drop/api-schema';
import { updateUploadSchema } from '@/api/admin/uploads/uploads.schema';
import { createUserSchema, updateUserSchema } from '@/api/admin/users/users.schema';

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

const AdminListDatasetSchema = registry.register(
  'AdminListDataset',
  adminListDatasetSchema.openapi({ description: 'A dataset as returned in admin list endpoints, without column details' }),
);

const UploadDtoSchema = registry.register(
  'UploadDto',
  uploadDtoSchema.openapi({ description: 'A data upload belonging to a dataset' }),
);

const UserDtoSchema = registry.register(
  'UserDto',
  userDtoSchema.openapi({ description: 'A platform user with their assigned role' }),
);

const UserDetailDtoSchema = registry.register(
  'UserDetailDto',
  userDetailDtoSchema.openapi({ description: 'A platform user with their assigned role and datasets' }),
);

const PaginatedDatasets = registry.register(
  'PaginatedDatasets',
  paginatedListSchema(AdminListDatasetSchema).openapi({ description: 'Paginated list of datasets' }),
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
  {
    name: 'page',
    in: 'query' as const,
    required: true,
    schema: {
      type: 'integer' as const,
      minimum: 1,
      default: 1,
    }
  },
  {
    name: 'limit',
    in: 'query' as const,
    required: true,
    schema: {
      type: 'integer' as const,
      minimum: 1,
      default: 10,
    }
  },
  {
    name: 'search',
    in: 'query' as const,
    required: false,
    schema: { type: 'string' as const }
  },
];

const unauthorizedResponse = {
  401: { description: 'Unauthorized — valid session required' },
  403: { description: 'Forbidden — admin role required' },
};

// Auth

const SignInEmailInputSchema = registry.register(
  'SignInEmailInput',
  z.object({
    email: z.string().email(),
    password: z.string(),
  }).openapi({ description: 'Email and password credentials' }),
);

const SignUpEmailInputSchema = registry.register(
  'SignUpEmailInput',
  z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string(),
  }).openapi({ description: 'New account registration data' }),
);

const MeUserResponseSchema = registry.register(
  'MeUserResponse',
  z.object({
    user: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      role: z.object({
        id: z.string(),
        name: z.string(),
      }),
    }),
  }).openapi({ description: 'Currently authenticated user with their role' }),
);

registry.registerPath({
  method: 'post',
  path: '/api/auth/sign-in/email',
  summary: 'Sign in with email and password',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: SignInEmailInputSchema } },
    },
  },
  responses: {
    200: { description: 'Signed in — session cookie set' },
    401: { description: 'Invalid credentials' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/sign-up/email',
  summary: 'Register a new account',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: SignUpEmailInputSchema } },
    },
  },
  responses: {
    200: { description: 'Account created — session cookie set' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/sign-out',
  summary: 'Sign out',
  tags: ['Auth'],
  responses: {
    200: { description: 'Signed out — session cookie cleared' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/auth/me',
  summary: 'Get the currently authenticated user',
  tags: ['Auth'],
  responses: {
    200: {
      description: 'Authenticated user with their role',
      content: { 'application/json': { schema: MeUserResponseSchema } },
    },
    401: { description: 'Unauthorized — no active session' },
  },
});

// Admin: Datasets

registry.registerPath({
  method: 'get',
  path: '/api/admin/datasets',
  summary: 'List datasets (paginated)',
  tags: ['Admin: Datasets'],
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
  path: '/api/admin/datasets/{id}',
  summary: 'Get a dataset by ID',
  tags: ['Admin: Datasets'],
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
  method: 'get',
  path: '/api/admin/datasets/{id}/uploads',
  summary: 'List uploads for a dataset (paginated)',
  tags: ['Admin: Datasets'],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    ...paginationParams,
  ],
  responses: {
    200: {
      description: 'Paginated list of uploads for the dataset',
      content: { 'application/json': { schema: PaginatedUploads } },
    },
    404: { description: 'Dataset not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/datasets/{id}/uploads',
  summary: 'Upload a CSV file to a dataset',
  tags: ['Admin: Datasets'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  request: {
    body: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.any().openapi({
              type: 'string',
              format: 'binary',
              description: 'CSV file to upload. Headers must match the dataset column names.',
            }),
          }).openapi('UploadCsvInput'),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Upload created successfully',
      content: { 'application/json': { schema: UploadDtoSchema } },
    },
    400: { description: 'No file provided or invalid file type', content: { 'application/json': { schema: ErrorSchema } } },
    404: { description: 'Dataset not found', content: { 'application/json': { schema: ErrorSchema } } },
    422: { description: 'CSV validation failed (missing columns, no data rows, or parse error)', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

// Admin: Uploads

registry.registerPath({
  method: 'get',
  path: '/api/admin/uploads/{id}',
  summary: 'Get an upload by ID',
  tags: ['Admin: Uploads'],
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
  method: 'patch',
  path: '/api/admin/uploads/{id}',
  summary: 'Update an upload',
  tags: ['Admin: Uploads'],
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
  path: '/api/admin/uploads/{id}',
  summary: 'Delete an upload',
  tags: ['Admin: Uploads'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    204: { description: 'Upload deleted' },
    404: { description: 'Upload not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

// Admin: Users

registry.registerPath({
  method: 'get',
  path: '/api/admin/users',
  summary: 'List users (paginated)',
  tags: ['Admin: Users'],
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
  path: '/api/admin/users/{id}',
  summary: 'Get a user by ID',
  tags: ['Admin: Users'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: {
      description: 'User found',
      content: { 'application/json': { schema: UserDetailDtoSchema } },
    },
    404: { description: 'User not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/users',
  summary: 'Create a user',
  tags: ['Admin: Users'],
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
      content: { 'application/json': { schema: UserDetailDtoSchema } },
    },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/admin/users/{id}',
  summary: 'Update a user',
  tags: ['Admin: Users'],
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
      content: { 'application/json': { schema: UserDetailDtoSchema } },
    },
    404: { description: 'User not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/admin/users/{id}',
  summary: 'Delete a user',
  tags: ['Admin: Users'],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    204: { description: 'User deleted' },
    404: { description: 'User not found', content: { 'application/json': { schema: ErrorSchema } } },
    ...unauthorizedResponse,
  },
});

// Security scheme

registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'better-auth.session_token',
  description: 'Session cookie issued by better-auth on sign-in via /api/auth/sign-in/email',
});

// Generator

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
