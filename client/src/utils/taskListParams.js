/**
 * Builds axios `params` for GET /projects/:id/tasks (Feature 7 filters).
 */
export function taskListParams(statusFilter, searchTrimmed) {
  const params = {};
  if (statusFilter) {
    params.status = statusFilter;
  }
  if (searchTrimmed) {
    params.q = searchTrimmed;
  }
  return params;
}
