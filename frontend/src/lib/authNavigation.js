export function portalPath(role) {
  return role === 'Travel Agent' ? '/agent' : '/trips';
}

export function loginDestination(role, requestedPath) {
  // Agent credentials always open the agent dashboard.
  if (role === 'Travel Agent') return '/agent';
  if (typeof requestedPath !== 'string') return '/trips';
  // Only restore known traveler pages, never arbitrary or agent-only URLs.
  return /^\/(?:trips(?:\/(?:new|[a-f0-9]{24}))?|messages|history|help)(?:\?[^#]*)?$/.test(requestedPath)
    ? requestedPath
    : '/trips';
}
