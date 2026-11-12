# DernekHub

Fransa'daki derneklerin tek şablon üzerinden kendi web sitelerini yönettiği çok kiracılı platform.

- Kurallar: [CLAUDE.md](CLAUDE.md) · Süreç: [WORKFLOW.md](WORKFLOW.md)
- PRD: [docs/spec/dernek-platformu-spec.md](docs/spec/dernek-platformu-spec.md) · SAD: [docs/spec/dernek-platformu-teknik-mimari.md](docs/spec/dernek-platformu-teknik-mimari.md)
- Mimari kararlar: [docs/adr/](docs/adr/README.md)

## Gereksinimler

- Node.js **≥ 24.22.1** (`.nvmrc`; Payload 3.93 bu sürümü istiyor)
- pnpm 12 (`corepack enable`)
- Docker (yerel Postgres, MinIO, Mailpit, Meilisearch)

## Kurulum

```bash
corepack enable
pnpm i
cp .env.example apps/web/.env          # PAYLOAD_SECRET: openssl rand -hex 32
docker compose -f infra/docker-compose.yml up -d
pnpm payload migrate
pnpm dev                               # http://localhost:3000/admin
```

## Komutlar

| Komut | Durum |
|---|---|
| `pnpm dev` / `pnpm build` | ✓ |
| `pnpm check` (Biome + dependency-cruiser + tsc + Vitest) | ✓ |
| `pnpm payload generate:types` / `migrate:create` / `migrate` | ✓ |
| `pnpm seed` | H2 (kiracı koleksiyonlarıyla birlikte) |
| `pnpm test:isolation` | H2 (izolasyon paketi v1, Testcontainers) |
| `pnpm test:e2e` | H13 (Playwright) |
