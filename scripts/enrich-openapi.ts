import { readFileSync, writeFileSync } from 'node:fs';

const SEARCH_MAX_LENGTH = 50;

const REF = {
  platforms: '[Platforms](/api/data/platforms)',
  sources: '[Build & SCM Sources](/api/data/sources)',
  buildSources: '[Build Sources](/api/data/sources#build-sources)',
  scmSources: '[SCM Sources](/api/data/sources#scm-sources)',
  scmHostTypes: '[SCM Host Types](/api/data/sources#scm-host-types)',
  architectures: '[Architectures](/api/data/architectures)',
  metadataFiletypes: '[Metadata Filetypes](/api/data/metadata-filetypes)',
};

type Schema = Record<string, unknown>;

const spec = JSON.parse(readFileSync('./openapi.json', 'utf-8'));

function setProp(schema: Schema, key: string, patch: Schema): void {
  schema.properties = schema.properties ?? {};
  schema.properties[key] = {
    ...(schema.properties[key] as Schema),
    ...patch,
  };
}

function replaceEnumWithReference(prop: Schema, description: string, example?: unknown): void {
  delete prop.enum;
  prop.description = description;
  if (example !== undefined) {
    prop.example = example;
  }
}

// --- Shared parameters ---
spec.components.parameters.ApplicationId = {
  ...spec.components.parameters.ApplicationId,
  description: 'Application ID (sqid).',
  example: 'aBc1234',
};

spec.components.parameters.BuildId = {
  ...spec.components.parameters.BuildId,
  description: 'Build ID (sqid).',
  example: 'xYz9876',
};

spec.components.parameters.ReleaseId = {
  ...spec.components.parameters.ReleaseId,
  description: 'Release ID (sqid).',
  example: 'rLs4567',
};

spec.components.parameters.WebhookId = {
  ...spec.components.parameters.WebhookId,
  description: 'Webhook ID (UUID).',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

spec.components.parameters.Search = {
  ...spec.components.parameters.Search,
  description: `Search query (max ${SEARCH_MAX_LENGTH} characters).`,
  schema: {
    type: 'string',
    maxLength: SEARCH_MAX_LENGTH,
  },
  example: 'my application',
};

function searchParam(description: string, example: string) {
  return {
    name: 'search',
    in: 'query',
    schema: {
      type: 'string',
      maxLength: SEARCH_MAX_LENGTH,
    },
    description,
    example,
  };
}

spec.components.parameters.SearchWorkspaceMembers = searchParam(
  `Search query (max ${SEARCH_MAX_LENGTH} characters). Searches member name and email.`,
  'jane@example.com',
);

spec.components.parameters.SearchApplications = searchParam(
  `Search query (max ${SEARCH_MAX_LENGTH} characters). Searches application name, description, and ID (sqid).`,
  'my application',
);

spec.components.parameters.SearchApplicationMembers = searchParam(
  `Search query (max ${SEARCH_MAX_LENGTH} characters). Searches member name and email.`,
  'jane@example.com',
);

spec.components.parameters.SearchReleases = searchParam(
  `Search query (max ${SEARCH_MAX_LENGTH} characters). Searches release title, ID (sqid), and version.`,
  '1.2.0',
);

spec.components.parameters.SortDirection = {
  ...spec.components.parameters.SortDirection,
  description: 'Sort direction.',
};

spec.components.parameters.PerPage = {
  ...spec.components.parameters.PerPage,
  description: 'Items per page (default varies by endpoint; max 100).',
};

spec.components.parameters.SortByApplications = {
  name: 'sort_by',
  in: 'query',
  schema: {
    type: 'string',
    enum: ['name', 'created_at', 'updated_at'],
    default: 'name',
  },
  description: 'Field to sort by.',
};

spec.components.parameters.SortByWorkspaceMembers = {
  name: 'sort_by',
  in: 'query',
  schema: {
    type: 'string',
    enum: ['name', 'email', 'role', 'added_at'],
    default: 'name',
  },
  description: 'Field to sort by.',
};

spec.components.parameters.SortByApplicationMembers = {
  name: 'sort_by',
  in: 'query',
  schema: {
    type: 'string',
    enum: ['name', 'email', 'role', 'resolved_role'],
    default: 'name',
  },
  description: 'Field to sort by.',
};

spec.components.parameters.PerPageApplications = {
  name: 'per_page',
  in: 'query',
  schema: {
    type: 'integer',
    default: 10,
    minimum: 1,
    maximum: 100,
  },
  description: 'Items per page.',
};

spec.components.parameters.PerPageWorkspaceMembers = {
  name: 'per_page',
  in: 'query',
  schema: {
    type: 'integer',
    default: 20,
    minimum: 1,
    maximum: 100,
  },
  description: 'Items per page.',
};

function replaceParamRef(params: Schema[], oldRef: string, newRef: string): void {
  const index = params.findIndex((param) => param.$ref === oldRef);
  if (index >= 0) {
    params[index] = { $ref: newRef };
  }
}

// --- List endpoints: endpoint-specific sort/per_page ---
replaceParamRef(
  spec.paths['/workspace/members'].get.parameters,
  '#/components/parameters/SortBy',
  '#/components/parameters/SortByWorkspaceMembers',
);
replaceParamRef(
  spec.paths['/workspace/members'].get.parameters,
  '#/components/parameters/PerPage',
  '#/components/parameters/PerPageWorkspaceMembers',
);

replaceParamRef(
  spec.paths['/applications'].get.parameters,
  '#/components/parameters/SortBy',
  '#/components/parameters/SortByApplications',
);
replaceParamRef(
  spec.paths['/applications'].get.parameters,
  '#/components/parameters/PerPage',
  '#/components/parameters/PerPageApplications',
);

replaceParamRef(
  spec.paths['/applications/{application_id}/members'].get.parameters,
  '#/components/parameters/SortBy',
  '#/components/parameters/SortByApplicationMembers',
);

replaceParamRef(
  spec.paths['/workspace/members'].get.parameters,
  '#/components/parameters/Search',
  '#/components/parameters/SearchWorkspaceMembers',
);
replaceParamRef(
  spec.paths['/applications'].get.parameters,
  '#/components/parameters/Search',
  '#/components/parameters/SearchApplications',
);
replaceParamRef(
  spec.paths['/applications/{application_id}/members'].get.parameters,
  '#/components/parameters/Search',
  '#/components/parameters/SearchApplicationMembers',
);
replaceParamRef(
  spec.paths['/applications/{application_id}/releases'].get.parameters,
  '#/components/parameters/Search',
  '#/components/parameters/SearchReleases',
);

// Platform filter descriptions with reference link
spec.paths['/applications'].get.parameters.find((p: Schema) => p.name === 'platform').description =
  `Filter by platform slug. Returns 422 if the platform does not exist. See ${REF.platforms} for valid identifiers.`;

const buildsListParams = spec.paths['/applications/{application_id}/builds'].get.parameters;
for (const name of ['platforms', 'streams', 'labels', 'custom_targets'] as const) {
  const param = buildsListParams.find((p: Schema) => p.name === name);
  if (param && name === 'platforms') {
    param.description = `${param.description} See ${REF.platforms} for valid platform slugs.`;
  }
}

const releasesListParams = spec.paths['/applications/{application_id}/releases'].get.parameters;
const releasesPlatforms = releasesListParams.find((p: Schema) => p.name === 'platforms');
if (releasesPlatforms) {
  releasesPlatforms.description = `${releasesPlatforms.description} See ${REF.platforms} for valid platform slugs.`;
}

// --- Upload: request body ---
const uploadSchema = spec.paths['/upload/request'].post.requestBody.content['application/json']
  .schema as Schema;
const uploadProps = uploadSchema.properties as Record<string, Schema>;

setProp(uploadSchema, 'application_id', {
  description: 'Application ID (sqid). Required when using a Workspace API key.',
  example: 'aBc1234',
});

replaceEnumWithReference(
  uploadProps.platform,
  `Platform identifier. Must match an enabled platform slug. See ${REF.platforms} for the full list.`,
  'windows',
);

replaceEnumWithReference(
  uploadProps.source,
  `Source of the upload. See ${REF.buildSources} for valid identifiers.`,
  'ghactions',
);

replaceEnumWithReference(
  uploadProps.architectures.items as Schema,
  `Architecture identifier. The platform must also support the architecture. See ${REF.architectures} for the full list.`,
  'x64',
);

uploadProps.architectures.description = `Architectures this build supports (the platform must also support the architecture). See ${REF.architectures} for the full list.`;
uploadProps.architectures.example = ['x64', 'arm64v8'];

setProp(uploadSchema, 'custom_target', {
  type: 'string',
  nullable: true,
  maxLength: 20,
  description: "Custom target for this build. Must exactly match the name of a target you've defined.",
  example: 'Samsung Galaxy Store',
});

setProp(uploadSchema, 'labels', {
  description:
    'Labels for the build (will be created if they do not already exist). Each label name may be up to 25 characters.',
  maxItems: 10,
  items: {
    type: 'string',
    maxLength: 25,
    pattern: '^[A-Za-z0-9\\s\\-_:\\/\\\\@#]+$',
  },
});

setProp(uploadSchema, 'expansion_files', {
  description: "Expansion files (only include if structure is 'file+expansion').",
  maxItems: 1,
  items: {
    type: 'object',
    required: ['filename', 'size_bytes'],
    properties: {
      filename: {
        type: 'string',
        maxLength: 255,
        pattern: '^[^\\/\\0]+$',
        description: 'Filename with extension (excluding path).',
        example: 'expansion.obb',
      },
      size_bytes: {
        type: 'integer',
        minimum: 1,
        maximum: 5000000000,
        description: 'Size of the expansion file in bytes (max 5GB).',
        example: 1048576,
      },
    },
  },
});

replaceEnumWithReference(
  uploadProps.vc_host_type,
  `Version control host type. \`scm_host_type\` is accepted as an alias. See ${REF.scmHostTypes} for valid identifiers.`,
  'git',
);

replaceEnumWithReference(
  uploadProps.vc_host,
  `Version control host. \`scm_host\` is accepted as an alias. See ${REF.scmSources} for valid identifiers.`,
  'github',
);

setProp(uploadSchema, 'ci_pipeline_url', {
  type: 'string',
  nullable: true,
  description: 'CI pipeline URL.',
  example: 'https://github.com/buildstash/example/actions/workflows/nightly.yml',
});

setProp(uploadSchema, 'ci_run_id', {
  type: 'string',
  nullable: true,
  maxLength: 30,
  pattern: '^[0-9]+$',
  description: 'CI run ID (numeric, up to 30 digits).',
});

setProp(uploadSchema, 'ci_build_duration', {
  type: 'string',
  nullable: true,
  maxLength: 30,
  pattern: '^[a-zA-Z0-9.: -]+$',
  description: 'CI build duration.',
});

setProp(uploadSchema, 'vc_commit_sha', {
  type: 'string',
  nullable: true,
  maxLength: 40,
  pattern: '^[a-zA-Z0-9]+$',
  description: 'Commit SHA (alphanumeric, up to 40 characters).',
});

// --- Upload: multipart ---
const multipartSchema = spec.paths['/upload/request/multipart'].post.requestBody.content[
  'application/json'
].schema as Schema;
setProp(multipartSchema, 'pending_upload_id', {
  type: 'string',
  format: 'uuid',
  description: 'Pending upload ID returned from `/upload/request`.',
  example: '550e8400-e29b-41d4-a716-446655440000',
});
setProp(multipartSchema, 'part_number', {
  type: 'integer',
  minimum: 1,
  maximum: 10000,
  description: 'Multipart part number (1-based).',
  example: 1,
});
setProp(multipartSchema, 'content_length', {
  type: 'integer',
  minimum: 1,
  description: 'Size in bytes of the part being uploaded.',
  example: 8388608,
});

// --- Upload: verify ---
const verifySchema = spec.paths['/upload/verify'].post.requestBody.content['application/json']
  .schema as Schema;
setProp(verifySchema, 'pending_upload_id', {
  type: 'string',
  format: 'uuid',
  description: 'Pending upload ID returned from `/upload/request`.',
  example: '550e8400-e29b-41d4-a716-446655440000',
});
setProp(verifySchema, 'multipart_chunks', {
  type: 'array',
  description: 'Required for multipart uploads over 5GB, or when completing a multipart upload.',
  items: {
    type: 'object',
    required: ['PartNumber', 'ETag'],
    properties: {
      PartNumber: {
        type: 'integer',
        minimum: 1,
        maximum: 10000,
        example: 1,
      },
      ETag: {
        type: 'string',
        minLength: 32,
        maxLength: 40,
        example: 'd41d8cd98f00b204e9800998ecf8427e',
      },
    },
  },
});
setProp(verifySchema, 'x-amz-checksum-crc64nvme', {
  type: 'string',
  nullable: true,
  pattern: '^[A-Za-z0-9+/]{11}[A-Za-z0-9+/=]$',
  description: 'Optional CRC64NVME checksum header value from the S3 upload response.',
});

// --- Upload: abort ---
const abortSchema = spec.paths['/upload/abort'].post.requestBody.content['application/json'].schema;
setProp(abortSchema, 'pending_upload_id', {
  type: 'string',
  format: 'uuid',
  description: 'Pending upload ID to cancel.',
  example: '550e8400-e29b-41d4-a716-446655440000',
});

// --- Upload: metadata ---
const metadataRequestSchema = spec.paths['/upload/metadata/request'].post.requestBody.content[
  'application/json'
].schema as Schema;
metadataRequestSchema.description =
  'Request a presigned URL for a metadata artifact. Provide either `build_id` or `primary_pending_upload_id`.';
setProp(metadataRequestSchema, 'build_id', {
  type: 'string',
  nullable: true,
  minLength: 7,
  maxLength: 7,
  pattern: '^[a-zA-Z0-9]+$',
  description: 'Build ID (sqid). Required if `primary_pending_upload_id` is not provided.',
  example: 'xYz9876',
});
setProp(metadataRequestSchema, 'primary_pending_upload_id', {
  type: 'string',
  format: 'uuid',
  nullable: true,
  description: 'Pending upload ID from `/upload/request`. Required if `build_id` is not provided.',
  example: '550e8400-e29b-41d4-a716-446655440000',
});
setProp(metadataRequestSchema, 'filename', {
  type: 'string',
  maxLength: 255,
  pattern: '^[^\\/\\0]+$',
  description: `Metadata filename with extension. Filetype must be supported for the build platform. See ${REF.metadataFiletypes}.`,
  example: 'Info.plist',
});
setProp(metadataRequestSchema, 'size_bytes', {
  type: 'integer',
  minimum: 1,
  maximum: 20971520,
  description: 'Size of the metadata file in bytes (max 20MB; lower limits may apply per filetype).',
  example: 4096,
});

const metadataVerifySchema = spec.paths['/upload/metadata/verify'].post.requestBody.content[
  'application/json'
].schema as Schema;
setProp(metadataVerifySchema, 'pending_upload_id', {
  type: 'string',
  format: 'uuid',
  description: 'Pending metadata upload ID returned from `/upload/metadata/request`.',
  example: '550e8400-e29b-41d4-a716-446655440001',
});
setProp(metadataVerifySchema, 'file_description', {
  type: 'string',
  nullable: true,
  maxLength: 255,
  description: 'Optional description for the metadata artifact.',
  example: 'iOS provisioning profile',
});

// --- Path identifier parameters ---
for (const [path, methods] of Object.entries(spec.paths as Record<string, Schema>)) {
  for (const operation of Object.values(methods as Record<string, Schema>)) {
    if (!operation.parameters) continue;
    for (const param of operation.parameters as Schema[]) {
      if (param.name === 'label_identifier') {
        param.description = 'Label ID (sqid) or name.';
        param.example = 'Production';
      }
      if (param.name === 'stream_identifier') {
        param.description = 'Stream ID (UUID) or name.';
        param.example = 'nightlies';
      }
      if (param.name === 'target_identifier') {
        param.description = 'Custom target ID (UUID) or name.';
        param.example = 'Samsung Galaxy Store';
      }
      if (param.name === 'artifact_id') {
        param.description = 'Metadata artifact ID (UUID).';
        param.example = '550e8400-e29b-41d4-a716-446655440002';
      }
      if (param.name === 'user_id') {
        param.description = 'User ID (sqid).';
        param.example = 'uSr1234';
      }
    }
  }
}

writeFileSync('./openapi.json', `${JSON.stringify(spec, null, 2)}\n`);
console.log('Enriched openapi.json');
