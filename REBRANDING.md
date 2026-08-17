# Plan maestro de rebranding: InsForge → Yarah

> Documento de trabajo. Se actualiza marcando `[x]` cada tarea completada.
> Cubre los 8 repos de `/Users/pierre/Desktop/Yarah-Baas/`.
> Regla de oro: **nunca dos fases sin verificación en medio** (ver "Puertas de verificación").

---

## 1. Identidad de marca (decisiones cerradas)

| Concepto | Antes (InsForge) | Ahora (Yarah) |
|---|---|---|
| Nombre de producto | InsForge / Insforge / insforge | **Yarah** / yarah |
| Dominio principal | insforge.dev | **yarah.dev** |
| Subdominios | api./docs./mcp.insforge.dev | api./docs./mcp.**yarah.dev** |
| Instancias de proyecto | `*.{region}.insforge.app` | `*.apps.yarah.dev` |
| Scope npm | `@insforge/*` | **`@yarahdev/*`** (org creada, owner: pierrebaldera) |
| Comando CLI | `insforge` | `yarah` |
| Variables de entorno | `INSFORGE_*` y derivados | `YARAH_*`, `NEXT_PUBLIC_YARAH_*`, `VITE_YARAH_*` |
| Carpetas de config | `~/.insforge`, `./.insforge`, `insforge.toml` | `~/.yarah`, `./.yarah`, `yarah.toml` |
| Imágenes Docker | `ghcr.io/insforge/{postgres,insforge-oss}` | `ghcr.io/darts7u7/{postgres,yarah-oss}` |
| Extensión C de Postgres | `insforge_pg_utils`, GUCs `insforge.*` | `yarah_pg_utils`, GUCs `yarah.*` (lockstep imagen↔conf) |
| Contratos de token | issuer/param/cookies con marca vieja | issuer `yarah`, param `yarah_code`, cookies `yarah_*`, HMAC `yarah:csrf:v1` |
| Prefijos de llaves | `ik_`, `anon_` | **SE QUEDAN** (fase opcional futura) |
| GitHub | github.com/InsForge/* | github.com/**Darts7u7**/Yarah-oos-* (privados hasta terminar) |
| Logo | logo-light/dark.svg de InsForge | `~/Desktop/Prometeo/YarahLabs/files/logo.svg` (negro; **generar variante blanca para dark mode**) + `favicon.ico` (6 tamaños ✓) |
| Color de marca | verde `#17B26A` | ⚠️ PENDIENTE de decidir con Pierre (provisional: mantener estructura de tokens, swap simple después) |

**Variantes de escritura a reemplazar (respetando mayúsculas):** `InsForge→Yarah`, `insforge→yarah`, `INSFORGE→YARAH`, `Insforge→Yarah`, `insForge→yarah`.

**NO tocar:** nombres de tecnologías de terceros (PostgREST, Deno, Postgres), textos de LICENSE (Apache-2.0), atribuciones de copyright de InsForge en licencias.

---

## 2. Línea base (estado ANTES del rebranding)

> Se rellena con los resultados de la suite corrida el 2026-08-16 dentro del contenedor.
> Cualquier fallo nuevo tras una fase se compara contra esta tabla: si ya fallaba aquí, no lo rompimos nosotros.

| Suite | Resultado base | Nota |
|---|---|---|
| typecheck (monorepo) | ✅ PASS (27s) | tras Fase 1 — el renombrado compila limpio |
| backend unit | ✅ PASS (49s) | |
| dashboard unit | ✅ PASS (2s) | |
| dashboard component | ✅ PASS (13s) | |
| ui unit | ✅ PASS (1s) | |
| ui component | ✅ PASS (1s) | |
| backend e2e (stack vivo) | ✅ 12/13 PASS | único fallo: `test-storage-rls` — **fallo de entorno, no de código** (requiere `psql`+`DATABASE_URL` en el host). Se corre desde el host, no en el contenedor (script bash, Alpine sin bash) |
| lint (monorepo) | ✅ PASS | 5 warnings preexistentes en backend, 0 errores. (1er intento falló por entorno: `eslint.config.js` sin montar — arreglado añadiendo mounts al compose) |
| Playwright dashboard | NO CORRIDO | requiere navegadores no instalados en contenedor; se valida a mano en :7131 |
| Stack Docker + login + health | ✅ PASS | verificado tras Fase 1 |

**Cómo correr cada suite (gates):** dentro del contenedor `docker compose exec -T insforge sh -c "…"` para typecheck/unit/component/lint; el **e2e se corre desde el host** (`cd backend && ./tests/run-all-tests.sh`) contra el stack vivo.

Log completo: `scratchpad/baseline-tests.log` (sesión Claude).

---

## 3. Puertas de verificación (después de CADA bloque)

1. `docker compose up -d --force-recreate yarah` (⚠️ el servicio se llama `yarah` desde 2b-2; nunca `restart`: no relee el compose) → `/api/health` = 200.
2. Dashboard `http://localhost:7131` carga y el login `admin` funciona.
3. Humo manual mínimo: crear tabla → insertar fila → subir archivo a un bucket.
4. Re-correr las suites afectadas por el bloque y comparar contra la línea base (§2).
5. `grep -ri insforge` sobre lo tocado = solo restos esperados (documentar cuáles).

---

## 4. Fases

### ✅ FASE 0 — Preparación (HECHA)
- [x] Fork de los 8 repos, historial borrado, subidos privados a github.com/Darts7u7
- [x] Stack corriendo en local como línea base funcional
- [x] Dominio yarah.dev confirmado; org npm `@yarahdev` reclamada
- [x] Logos recibidos (svg negro + favicon.ico)

### ✅ FASE 1 — Contrato y paquetes internos del monorepo (HECHA Y VERIFICADA)
- [x] `@insforge/shared-schemas` → `@yarahdev/shared-schemas` (419 archivos)
- [x] `@insforge/ui` → `@yarahdev/ui` (252 archivos)
- [x] `@insforge/dashboard` → `@yarahdev/dashboard` (17 archivos)
- [x] `docker-compose.yml` filtros de turbo actualizados
- [x] Verificado: contenedor recreado, health 200, dashboard 200, sin errores de módulos

### 🔄 FASE 2 — El motor completo (`Yarah-oos`) — EN CURSO
Por bloques, con puerta de verificación tras cada uno:

**2a. Cortar "llama a casa" (seguridad/soberanía)** ✅ HECHA (2026-08-16)
- [x] Rate limits remotos → sin URL por defecto, cero red; override por env se mantiene (`rate-limiters.ts`)
- [x] Lista de partners → local vacía en `frontend/src/cloud-hosting/partner.service.ts` **y** en `packages/dashboard/src/features/login/services/partnership.service.ts` (este 2º era código muerto — candidato a borrar en Fase 7)
- [x] Telemetría → endpoint y clave PostHog de InsForge eliminados; apagada de fábrica (`telemetry.service.ts`)
- [x] `CLOUD_API_HOST` default → `https://api.yarah.dev`
- [x] Gate verde: health+dashboard 200, typecheck PASS, backend 2369 tests PASS (2 tests actualizados al comportamiento nuevo: `app.config.test.ts`, `telemetry.service.test.ts`), dashboard unit PASS, grep = 0 llamadas

**2b. Identidad funcional del motor**
- [x] Contratos de token: issuer `yarah`, HMAC CSRF `yarah:csrf:v1`, param OAuth `yarah_code`, cookies `yarah_refresh_token`/`yarah_admin_refresh_token`/`yarah_admin_csrf_token`, installation-id
- [x] Prefijos env: barrido total `INSFORGE_`→`YARAH_` (código, tests, compose, Dockerfile, .env, .env.example, deploy, docs)
- [x] Nombres de paquete raíz/backend/frontend → `yarah`, `yarah-backend`, `yarah-shell` + `turbo.json` corregido (incluida la deriva de nombres de fábrica)
- [x] `COMPOSE_PROJECT_NAME=yarah`, servicio `insforge`→`yarah` (contenedores `yarah-*`), `POSTGRES_DB=yarah`, `cron.database_name='yarah'`, host interno `yarah:7130` — con `down -v` + stack fresco verificado (health, BD, login 200)
- [x] `deploy/`: setup.sh default → `Darts7u7/Yarah-oos`, compose de deploy renombrado
- [x] `postgresql.conf`: GUCs `yarah.*` y `yarah_pg_utils` — ejecutado en lockstep con la Fase 4 (checkbox actualizado tras auditoría)
- [x] `Dockerfile`: ENV y rutas `/yarah-storage`, `/yarah-logs`, entrypoint `yarah-entrypoint`
- [x] Workflows `.github/`: renombrados a marca yarah (imagen `yarah-oss`); ⚠️ pendiente Fase 4/7: podar pushes a DockerHub/ECR de InsForge y probar el build

**2c. Marca visible del producto** ✅ HECHA (2026-08-16)
- [x] Barrido de marca (5 variantes) con tokens protegidos; health = "Yarah OSS Backend"
- [x] Dashboard: literales renombrados; archivos fuente `YarahDashboard.tsx` / `InstallYarahPage.tsx`
- [x] i18n: 4 locales renombrados y validados como JSON
- [x] Assets: globo Yarah en `yarah_light.svg` (negro) / `yarah_dark.svg` (blanco), `assets/logo-*.svg`, favicon multi-tamaño
- [x] Título "Yarah Dashboard" en `index.html`
- [ ] Color de marca: tokens intactos; swap cuando Pierre decida color
- [x] `.agents/docs/` (docs servidas por `/api/docs`) renombradas y barridas (`yarah-instructions-sdk.md`)
- [x] Lección aprendida: `--exclude-dir=logs` ocultaba dirs de código llamados `logs/` — barrido re-ejecutado sin esa exclusión; los tests delataron el hueco (parser de logs, helpers de dominio, mapa de docs — 3 tandas de fixes alineando tests al comportamiento nuevo)

**2d. Dominios y URLs en el motor** ✅ HECHA (2026-08-16, vía barrido dirigido)
- [x] `insforge.dev` → `yarah.dev`; `docs./api./app.insforge.dev` → equivalentes yarah.dev
- [x] `*.{region}.insforge.app` → `*.apps.yarah.dev` (helpers de frontend/backend + tests + docs)
- [x] Discord de InsForge → placeholder `yarah.dev/community`; X/LinkedIn barridos
- [x] `docs/` Mintlify (4 idiomas) + `openapi/*.yaml` barridos
- [x] `README.md` reescrito desde cero; `CHANGELOG.md` reiniciado; CONTRIBUTING/SECURITY barridos (revisión fina pendiente en Fase 7)

**2e. Legal**
- [x] `LICENSE` Apache-2.0 intacta (excluida de barridos)
- [x] `NOTICE` creado con atribución a InsForge (tokens de atribución protegidos en barridos futuros)
- [ ] Quitar skills internas de contribución de InsForge (`.claude/`, `.codex/`, `.agents/skills/`) — pendiente Fase 7 (nota: `.agents/docs/` ya adaptada porque es contenido servido)

**Puerta Fase 2:** suites completas vs línea base + humo manual + `grep -ric insforge` → solo `@insforge/sdk` (esperado hasta Fase 3) y LICENSE/NOTICE.

### FASE 3 — SDK (`Yarah-oos-sdk-js`) y publicación npm — código ✅, publicación ⏸️
- [x] Paquete → `@yarahdev/sdk` (v1.5.2); dep → `@yarahdev/shared-schemas ^1.2.1`
- [x] Identidad funcional: cookies `yarah_*`, `yarah_pkce_verifier`, `yarah_code`, env `NEXT_PUBLIC_YARAH_*`, `__yarah_dispatch__`
- [x] Lógica de dominio: guard `.apps.yarah.dev`, funciones directas `{appKey}.functions.yarah.dev`, placeholder `yarah.local`
- [x] Marca en textos/README/User-Agent; repo → Darts7u7/Yarah-oos-sdk-js
- [x] Verificado local: **212 tests PASS + build PASS** (schemas como tarball local; `prepare`/`prepublishOnly` de shared-schemas eliminados — estorbaban publish e install en host)
- [x] `npm login` de Pierre hecho (pierrebaldera)
- [ ] ⏸️ Publicar: **BLOQUEADO esperando 2FA de npm** (obligatorio desde ago-2026; error 403 sin él). Con OTP: publicar schemas 1.2.1 → revertir dep del SDK a `^1.2.1` → publicar sdk 1.5.2
- [ ] Motor: `npm:@insforge/sdk` → `npm:@yarahdev/sdk` + función end-to-end (tras publicar)
- [x] Secreto interno ya es `YARAH_INTERNAL_URL` con host `yarah:7130` (hecho en 2b)

### FASE 4 — Imagen de Postgres (`Yarah-oos-db`) — ✅ HECHA EN LOCAL (2026-08-16)
- [x] Extensión `yarah_pg_utils` (Makefile, .c, GUCs `yarah.*`), repo barrido a 0 restos
- [x] Imagen construida local: `ghcr.io/darts7u7/postgres:v15.13.4` (compiló C+Rust a la primera)
- [x] Motor en lockstep: postgresql.conf, migración 056, deploy variants, compose → imagen propia; stack reseteado (`down -v`) y verificado: preload `yarah_pg_utils` ✓, `SHOW yarah.policy_grant_role`='project_admin' ✓, health/dashboard/login 200 ✓
- [x] Incidente resuelto: dep externa `insforge-test` (helper de tests de InsForge en npm) fue barrida por error a `yarah-test` (no existe) y rompió `npm install` — revertida y añadida a tokens protegidos; pendiente opcional publicar un `@yarahdev/test` propio
- [ ] Publicar imagen a GHCR público (Fase 7, con `docker login ghcr.io`)

### FASE 4-bis (original) — Imagen de Postgres
- [ ] Renombrar extensión `insforge_pg_utils` → `yarah_pg_utils` (Makefile, .c, GUCs `insforge.*`→`yarah.*`)
- [ ] En lockstep: `postgresql.conf` del motor (shared_preload_libraries + GUCs) — tarea aparcada de 2b
- [ ] Workflow → publica `ghcr.io/darts7u7/postgres`; construir y publicar imagen (pública en GHCR)
- [ ] Motor: compose apunta a la imagen nueva; recrear stack completo y verificar RLS de `project_admin` (crear política vía dashboard)

### FASE 5 — MCP, CLI, install, skills — código ✅ (2026-08-16), publicación ⏸️ (junto a Fase 3)
- [x] `Yarah-oos-mcp`: `@yarahdev/mcp`, dominios/URLs propios, módulo `yarah-api.ts`, regex de app-key `.apps.yarah.dev` — **318 tests PASS + build PASS** (schemas vía tarball local)
- [x] `Yarah-oos-cli`: `@yarahdev/cli`, binario **`yarah`**, `~/.yarah`, `yarah.toml`, repos → Darts7u7 — **781 tests PASS + build PASS**
- [x] `Yarah-oos-install`: `@yarahdev/install`, instala `@yarahdev/mcp`, server `yarah` — build PASS
- [x] `Yarah-oos-skills`: 4 skills renombradas (`yarah`, `yarah-cli`, `yarah-debug`, `yarah-integrations`), claim Auth0 `yarah.dev/yarah_token`, manifiestos, favicon — 0 restos
- [ ] Publicar mcp/cli/install a npm (con el OTP de Pierre; antes: revertir deps tarball → `^1.2.1`)
- [ ] Endpoints muertos conocidos en CLI para podar en Fase 7: feedback/report-download (apuntaban a funciones cloud de InsForge), `DEFAULT_CLIENT_ID` OAuth del cloud

### FASE 5-bis (original) — MCP, CLI, install, skills
- [ ] `Yarah-oos-mcp`: paquete `@yarahdev/mcp`, binarios, deps, URLs no-configurables (`usage-tracker`, `buildAccessHost`), server.json, telemetría Mixpanel fuera; publicar
- [ ] `Yarah-oos-cli`: paquete `@yarahdev/cli`, binario `yarah`, `~/.insforge`→`~/.yarah`, `insforge.toml`→`yarah.toml`, client OAuth propio o flujo OSS, endpoints feedback/analytics de InsForge fuera, ASCII art, repos de templates → Darts7u7; publicar
- [ ] `Yarah-oos-install`: `@yarahdev/install`, instala `@yarahdev/mcp`, nombre de server `yarah`, ASCII art; publicar
- [ ] `Yarah-oos-skills`: 4 skills renombradas (`yarah`, `yarah-cli`, `yarah-debug`, `yarah-integrations`), 66 ficheros md, manifiestos de plugin, claim de Auth0 `insforge.dev/insforge_token`→`yarah.dev/yarah_token`
- [ ] Verificar: `npx @yarahdev/install` + MCP conecta contra el motor local + tools funcionan

### FASE 6 — Plantillas (`Yarah-oos-templates`) — ✅ HECHA (2026-08-16)
- [x] Barrido a 0 restos; 20 archivos `insforge*` renombrados a `yarah*` (imports ya coincidían)
- [x] SDK unificado: 11 × `@yarahdev/sdk ^1.5.2` (adiós `latest` y pins viejos)
- [x] `sync.yml` (workflow al cloud de InsForge) eliminado; `testnextjs` → nombres reales
- [ ] Verificación de arranque de una plantilla contra el motor local — tras publicar el SDK en npm

### FASE 6-bis (original) — Plantillas
- [ ] SDK → `@yarahdev/sdk` con versión fija (adiós `latest`)
- [ ] Env `NEXT_PUBLIC_YARAH_*` / `VITE_YARAH_*` → Yarah (unificar también URL vs BASE_URL)
- [ ] Borrar `.github/workflows/sync.yml` (apunta a proyecto cloud de InsForge) y limpiar `registry.json` (demo URLs `insforge.site`)
- [ ] Nombres de paquete `insforge-*` → `yarah-*`; corregir los `testnextjs`
- [ ] READMEs, botones de deploy, badges
- [ ] Verificar: crear app desde plantilla contra el motor local y que funcione login+datos

### AUDITORÍA FINAL 100% (2026-08-16, 4 agentes) — hallazgos y correcciones
Sistema vivo: **30/30 PASS**. Los otros 3 auditores hallaron lo que el grep no ve; TODO corregido:
- [x] Clave PostHog de InsForge viva en `docs/docs.json` → eliminada (analytics de docs OFF)
- [x] Discord de InsForge en dashboard+docs (14×) → `yarah.dev/community`
- [x] `github.com/Yarah/Yarah` (repo inexistente, 51 archivos + llamada runtime en `github.service.ts`) → `Darts7u7/Yarah-oos`
- [x] Scope mal derivado `@yarah/*` (111 archivos) → `@yarahdev/*`
- [x] `ghcr.io/yarah/yarah-oss` (namespace ajeno, 8 archivos deploy/docs) → `ghcr.io/darts7u7/yarah-oss`
- [x] CI: `build-image.yml` → `GITHUB_TOKEN`, jobs ECR/DockerHub de InsForge eliminados, arg PostHog muerto fuera; paso `sync-skills` roto eliminado de `lint-and-format.yml`; `integration-tests` pg → v15.13.4
- [x] **Imagen de BD publicándose**: LICENSE+NOTICE añadidos a Yarah-oos-db, tag `v15.13.4` pusheado → Actions construye `ghcr.io/darts7u7/postgres:v15.13.4` (⚠️ al terminar, hacer el package PÚBLICO en GitHub Packages)
- [x] **ASCII art de la CLI decía INSFORGE** → redibujado YARAH; `create.apps.yarah.dev` (comando roto) → `create-yarah-app`; package.json de cli/install con `repository`
- [x] Lockfiles: 3 satélites con `file:/private/tmp` + 12 de plantillas con `@insforge/sdk` → todos regenerados limpios
- [x] Assets binarios de InsForge: banner del MCP eliminado, favicon del plugin skills → globo Yarah, capturas `signin/connect.png` del motor eliminadas, logo+favicon del sitio docs → globo
- [x] skills: descripción corrupta del routing arreglada; versiones de plugin alineadas 1.3.0; mantenedores `Darts7u7`
- [x] Plantillas: `testreact`→`yarah-react-starter`, env unificado `*_YARAH_URL`, docs SDK dominio `functions.yarah.dev`
- [x] Republicación: sdk 1.5.3, mcp 1.2.13, cli 0.2.8 (arte YARAH), install 0.0.54
- [ ] PENDIENTES CONOCIDOS (no bloqueantes, decisión de producto): mascota "Forger" de la CLI (animación sin texto), dep `mixpanel` inerte en mcp, `clf_` client-id muerto del cloud viejo, paquete `create-yarah-app` por crear, ~38 capturas de docs con UI de InsForge (regenerar desde el dashboard Yarah), publicar `@yarahdev/test` propio (hoy devDep `insforge-test`), hacer público el package GHCR de postgres al terminar Actions

### FASE 7 — Barrido final y cierre — EN CURSO (2026-08-16)
- [x] Meta-dirs internos de InsForge eliminados del motor (`.claude`, `.codex`, `.agents/skills`, `.internal`, `.archive`, `.gstack`, logs) — `.agents/docs` conservado (servido por `/api/docs`)
- [x] **Commit + push de los 8 repos a github.com/Darts7u7** (1.750 archivos) — todo el rebranding a salvo
- [x] Publicación npm ejecutada: los 5 `@yarahdev/*` ACEPTADOS por el servidor pero **en cuarentena anti-spam** (falso positivo por cuenta+org nueva+ráfaga+token bypass). Prueba: republicar da "cannot publish over the previously published versions". → Pierre abre ticket en npmjs.com/support (texto redactado en el chat) y revisa su email
- [x] **Los 5 paquetes npm VIVOS en el registro** (la "cuarentena" era propagación de scope nuevo ~15 min; emails "Successfully published" ×5, sin flags) — sin ticket necesario
- [x] Motor conectado a `npm:@yarahdev/sdk` (todos los `@insforge/*` liberados; 0 restos no-esperados)
- [x] Incidente final resuelto: `functions/deno.lock` congelaba nombres del barrido intermedio → borrado y regenerado (lección: lockfiles se regeneran tras renombrados, no se barren)
- [x] **E2E FUNCIÓN: PASS** — `POST /functions/yarah-e2e` → `{"ok":true,"brand":"Yarah","runtime":"deno"}` con `@yarahdev/sdk` descargado del npm público. **REBRANDING FUNCIONALMENTE COMPLETO.**
- [ ] Pierre: borrar el token `yarah-publish` de npm (quedó pegado en el chat; expira solo el 23-ago)
- [ ] Opcionales de lanzamiento: publicar imagen `ghcr.io/darts7u7/postgres` a GHCR; visibilidad pública de repos; cambiar `ROOT_ADMIN_PASSWORD` antes de exponer nada
- [ ] Tokens restantes POR DISEÑO: devDep `insforge-test` (opcional publicar uno propio), atribución en LICENSE/NOTICE/CHANGELOG (permanente)

### FASE 7-bis (original) — Barrido final y cierre
- [ ] `grep -ri insforge` en los 8 repos = 0 (excepto LICENSE/NOTICE documentados)
- [ ] Despliegue limpio de punta a punta en carpeta virgen (simulando usuario nuevo): setup → up → conectar MCP → crear app
- [ ] Suites completas en verde vs línea base
- [ ] Commit + push de los 8 repos
- [ ] Decisiones de lanzamiento: visibilidad de repos (público/privado), imágenes GHCR públicas, DNS de yarah.dev

---

## CIERRE (2026-08-16/17) — PASADA FINAL 100% EN VERDE
Barrido 8 repos limpio · motor 6/6 suites PASS · e2e 12/13 (=base) · sdk 212 + mcp 318 + cli 781 PASS · sistema vivo OK · npm 5/5 · git 8/8 sync. **Repos PÚBLICOS** (decisión de Pierre; Actions gratis). Token npm con autocaducidad 7d (decisión de Pierre, no se borra a mano). Pendiente en vuelo: build multi-arch de `ghcr.io/darts7u7/postgres` en Actions → al terminar, hacer el package público en GitHub Packages.
Trampa nueva aprendida (#10): **bind mounts de UN SOLO ARCHIVO en Docker quedan obsoletos cuando `sed -i` reemplaza el inode** — el contenedor ve el archivo viejo/trunco (así cayeron 5 suites de golpe con "Unterminated string in /app/package.json"); arreglo: `up -d --force-recreate`.

## 5. Riesgos conocidos y trampas (aprendidas del análisis)

1. **`docker compose restart` NO relee el compose** → usar `up -d --force-recreate` (ya nos pasó).
2. **`@insforge/sdk` se importa en caliente desde npm** en el runtime de funciones → no tocar hasta que `@yarahdev/sdk` esté publicado (Fase 3).
3. **Extensión C ↔ postgresql.conf en lockstep**: renombrar GUCs sin reconstruir la imagen (o al revés) = Postgres no arranca. Se hace todo junto en Fase 4.
4. **5 variantes de mayúsculas** de la marca; los reemplazos van por variante, nunca case-insensitive a ciegas.
5. **Reemplazos en i18n chino**: la marca aparece dentro de frases; revisar que el reemplazo no rompa JSON (validar parseo tras tocar).
6. **`ENCRYPTION_KEY` vacío cae a `JWT_SECRET`**: al renombrar variables de entorno, mantener la semántica exacta del fallback.
7. **Secretos sembrados en BD** (`API_KEY`, `YARAH_INTERNAL_URL`…): la BD local ya tiene datos sembrados con nombres viejos; tras renombrar claves de seed puede requerir reset del volumen (`docker compose down -v`) — aceptable en dev, documentar.
8. **Deriva ya existente en `turbo.json`** (nombres `@insforge/backend`/`frontend` que nunca coincidieron): corregir de paso en 2b.
9. **Lint/typecheck con deuda preexistente**: comparar SIEMPRE contra línea base, no contra cero.

---

## 6. Registro de avance

| Fecha | Qué se hizo | Verificación |
|---|---|---|
| 2026-08-16 | Fase 0 y Fase 1 completas | Stack recreado, health 200, dashboard 200, sin errores de módulos |
| 2026-08-16 | Línea base de tests COMPLETA: 6/6 suites de código PASS, lint PASS (5 warns preexistentes), e2e 12/13 (1 fallo de entorno) | volcada en §2; mounts de eslint añadidos al compose |
| 2026-08-16 | Fase 2a completa (soberanía: 0 llamadas a InsForge) | gate: typecheck, 2369 unit, dashboard unit, grep=0 |
| 2026-08-16 | Fase 2b-1: identidad funcional (issuer/cookies/CSRF/oauth-param, env YARAH_*, paquetes yarah/yarah-backend/yarah-shell, turbo.json) | gate: health, typecheck, 2369 unit, dashboard unit, login admin 200 |
| 2026-08-16 | Fase 2b-2: proyecto/BD/servicio compose → yarah, setup.sh → Darts7u7, Dockerfile, workflows; stack fresco con `down -v` | gate: health 45s, dashboard 200, BD `yarah` OK, login 200; imagen pg y GUCs preservados para Fase 4 |
| 2026-08-16 | Fase 2c+2d+2e: barrido de marca completo (con fix del punto ciego `--exclude-dir=logs`), assets Yarah, i18n, docs, README/NOTICE/CHANGELOG | gate FINAL Fase 2: typecheck PASS, backend 2369 PASS, dashboard unit+component PASS, ui PASS, lint PASS (tras `--fix` de reflows), health "Yarah OSS Backend", dashboard "Yarah Dashboard" |
