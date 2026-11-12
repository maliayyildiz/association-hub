// Central access helpers (CLAUDE.md §4). Collections must import access
// functions from here instead of writing inline authorization logic.
// isTenantAdmin, isTenantEditor, canPublish and tenantScoped arrive with the
// tenancy work in H2–H3.
export { isSuperAdmin, isSuperAdminOrSelf } from './is-super-admin'
