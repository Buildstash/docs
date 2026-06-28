// HTTP method mapping for API endpoints
// Generated from OpenAPI spec operationIds and their methods
export const apiHttpMethods: Record<string, string> = {
  // Workspace
  '/api/endpoint/workspace/get-workspace': 'GET',
  '/api/endpoint/workspace/list-workspace-members': 'GET',
  '/api/endpoint/workspace/list-workspace-labels': 'GET',
  '/api/endpoint/workspace/get-workspace-label': 'GET',
  '/api/endpoint/workspace/list-workspace-default-streams': 'GET',
  '/api/endpoint/workspace/list-workspace-custom-targets': 'GET',
  '/api/endpoint/workspace/get-workspace-custom-target': 'GET',
  // Users
  '/api/endpoint/users/get-user': 'GET',
  // Applications
  '/api/endpoint/applications/list-applications': 'GET',
  '/api/endpoint/applications/get-application': 'GET',
  '/api/endpoint/applications/list-application-members': 'GET',
  '/api/endpoint/applications/list-application-streams': 'GET',
  '/api/endpoint/applications/get-stream': 'GET',
  '/api/endpoint/applications/list-application-labels': 'GET',
  '/api/endpoint/applications/get-application-label': 'GET',
  '/api/endpoint/applications/list-application-platforms': 'GET',
  '/api/endpoint/applications/list-application-custom-targets': 'GET',
  '/api/endpoint/applications/get-application-custom-target': 'GET',
  // Builds
  '/api/endpoint/builds/list-builds': 'GET',
  '/api/endpoint/builds/get-build': 'GET',
  '/api/endpoint/builds/download-build': 'GET',
  '/api/endpoint/builds/list-metadata-artifacts': 'GET',
  '/api/endpoint/builds/get-metadata-artifact': 'GET',
  '/api/endpoint/builds/download-metadata-artifact': 'GET',
  // Releases
  '/api/endpoint/releases/list-releases': 'GET',
  '/api/endpoint/releases/get-release': 'GET',
  // Webhooks
  '/api/endpoint/webhooks/list-webhooks': 'GET',
  '/api/endpoint/webhooks/get-webhook': 'GET',
  // Uploads
  '/api/endpoint/upload/request': 'POST',
  '/api/endpoint/upload/request-multipart': 'POST',
  '/api/endpoint/upload/verify': 'POST',
  '/api/endpoint/upload/abort-upload': 'POST',
  '/api/endpoint/upload/request-metadata-upload': 'POST',
  '/api/endpoint/upload/verify-metadata-upload': 'POST',
};
