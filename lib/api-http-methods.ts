// HTTP method mapping for API endpoints
// This mapping is generated from the frontmatter data in MDX files
// To update: change the method in your MDX file, then update the corresponding entry here
export const apiHttpMethods: Record<string, string> = {
  // Upload endpoints
  '/api/endpoint/upload/request': 'POST',
  '/api/endpoint/upload/request-multipart': 'POST',
  '/api/endpoint/upload/verify': 'POST',
  
  // Add more endpoints as needed
  // Format: '/api/path/to/endpoint': 'HTTP_METHOD',
};
