// Enforces module boundaries from CLAUDE.md §3.1.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Modules must not depend on each other circularly (CLAUDE.md §3.1).',
      from: {},
      to: { circular: true },
    },
    {
      name: 'module-public-api-only',
      severity: 'error',
      comment:
        'A module may only be imported through modules/<x>/index.ts; deep imports are forbidden (CLAUDE.md §3.1).',
      from: { path: '^apps/web/src/(?!modules/)' },
      to: {
        path: '^apps/web/src/modules/[^/]+/.+',
        pathNot: '^apps/web/src/modules/[^/]+/index\\.ts$',
      },
    },
    {
      name: 'cross-module-public-api-only',
      severity: 'error',
      comment: 'Modules reach other modules only through their index.ts (CLAUDE.md §3.1).',
      from: { path: '^apps/web/src/modules/([^/]+)/' },
      to: {
        path: '^apps/web/src/modules/[^/]+/.+',
        pathNot: ['^apps/web/src/modules/$1/', '^apps/web/src/modules/[^/]+/index\\.ts$'],
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'apps/web/tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
    },
  },
}
