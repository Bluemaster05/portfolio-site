/** Read scopes an API token can be granted. Each guards one group of /api/public endpoints. */
export enum ApiScope {
  Site = 'site:read',
  Projects = 'projects:read',
  Experience = 'experience:read',
  Education = 'education:read',
  Honors = 'honors:read',
  Blog = 'blog:read',
}

export const ALL_API_SCOPES = Object.values(ApiScope);
