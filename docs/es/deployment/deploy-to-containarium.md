---
title: "Desplegar Yarah en Containarium"
description: "Ejecuta Yarah en un host Containarium LXC con contenedores por inquilino, instantáneas ZFS y aprovisionamiento vía MCP para despliegues nativos de agentes."
---

# Desplegar Yarah en Containarium

Esta guía explica paso a paso cómo desplegar Yarah en un host de [Containarium](https://github.com/footprintai/containarium). Containarium es una plataforma de código abierto y auto-alojable que ofrece a cada inquilino un contenedor Linux persistente (LXC) con primitivas de primera clase para SSH, MCP y TLS por nombre de host, un ajuste natural para despliegues de Yarah impulsados por agentes.

<Note>
  Esta guía es mantenida por la comunidad y puede quedar rezagada respecto a la última versión de Yarah. La configuración canónica y siempre actualizada es el directorio `deploy/docker-compose/` en el [repositorio de Yarah](https://github.com/Yarah/Yarah).
</Note>

## Cuándo elegir Containarium

Containarium se ajusta a los despliegues de Yarah cuando desea:

- **Infraestructura auto-alojada y multi-inquilino**: muchos proyectos de Yarah aislados en un solo host, cada uno en su propio LXC, con un nombre de host TLS por proyecto, sin el registro compartido de `docker compose -p`.
- **Persistencia y resiliencia**: almacenamiento respaldado por ZFS, instantáneas diarias con retención de 30 días, supervivencia automática ante reinicios del host y terminación de VMs spot.
- **Un plano de control nativo de agentes**: Containarium expone su superficie de administración como un servidor MCP (`mcp-server`) y ofrece un segundo MCP que se ejecuta dentro de cada contenedor (`agent-box`), de modo que el mismo agente que construye su aplicación también puede aprovisionar su backend de extremo a extremo.

## Requisitos previos

- Un host de Containarium en ejecución. Si no tiene uno, el [inicio rápido de Containarium](https://github.com/footprintai/containarium#quick-start) toma ~5 minutos en una VM de Ubuntu 24.04 recién instalada.
- La CLI `containarium` en su máquina local, configurada para alcanzar el daemon (`--server <host>:8080`), o ejecute la CLI directamente en el host.
- Un token de administrador (`containarium token generate --username admin --roles admin --secret-file /etc/containarium/jwt.secret`).
- Un dominio que usted controle, con un registro DNS A/CNAME que apunte el subdominio elegido a la IP pública del sentinel de su Containarium.

Tamaño mínimo por caja de Yarah: **2 vCPU, 4 GB de RAM, 30 GB de disco**.

## Despliegue

### 1. Aprovisionar una caja con Docker preinstalado

```bash
containarium create yarah \
  --stack docker \
  --memory 4GB \
  --cpu 2 \
  --disk 30GB \
  --ssh-key ~/.ssh/id_ed25519.pub
```

La bandera `--stack docker` instala Docker CE y el complemento compose dentro del contenedor. Configure su SSH para que `ssh yarah` funcione:

```bash
containarium ssh-config sync
# Then add one line to ~/.ssh/config:
#   Include ~/.containarium/ssh_config
ssh yarah
```

### 2. Instalar Yarah dentro de la caja

```bash
ssh yarah 'curl -fsSL https://raw.githubusercontent.com/Yarah/Yarah/main/deploy/setup.sh | sh -s ~/yarah'
```

Descarga los archivos que el stack lee y genera los secretos en `~/yarah/.env`. No arranca nada.

### 3. Configurar el entorno

Edite `~/yarah/.env` dentro de la caja. Como mínimo, configure:

```env
API_BASE_URL=https://<tu-subdominio>
VITE_API_BASE_URL=https://<tu-subdominio>
```

Los secretos ya están generados: déjalos como están.

Consulte [`.env.example`](https://github.com/yarah/yarah/blob/main/.env.example) para ver la lista completa (OpenRouter, proveedores OAuth, Stripe, Vercel).

> **Manejo de secretos:** para producción, prefiera los secretos tmpfs de Containarium (`--delivery=file`; vea el [documento de operaciones de secretos de Containarium](https://github.com/footprintai/Containarium/blob/main/docs/SECRETS-OPERATIONS.md)). Estos se entregan como archivos 0440 en tmpfs y nunca aparecen en `/proc/<pid>/environ`. Conéctelos a la pila de compose mediante un archivo de anulación (override) de compose usando `env_file:`.

### 4. Iniciar Yarah y habilitar el inicio automático

Puede iniciarlo una vez manualmente:

```bash
ssh yarah 'cd ~/yarah && docker compose up -d'
```

...o —recomendado— conectarlo al inicio automático de compose de Containarium para que la pila sobreviva a los reinicios del host:

```bash
containarium compose enable yarah --dir /home/yarah/yarah
```

Esto instala una unidad systemd-user dentro de la caja que levanta la pila en cada arranque del contenedor y reinicia los servicios ante fallos con retroceso (backoff). Verifique con:

```bash
containarium compose status yarah
```

Debería ver `4/4 services up`: `postgres`, `postgrest`, `yarah`, `deno`. (El archivo compose incluye comprobaciones de salud para `postgres`, `postgrest` y `deno`; `yarah` reporta `Up` una vez que los demás están saludables y él mismo se ha iniciado).

### 5. Exponer en un nombre de host público

Yarah sirve el panel y la API en el puerto 7130 de forma predeterminada.

```bash
containarium expose-port yarah \
  --container-port 7130 \
  --domain <your-subdomain>
```

Esto configura Caddy en el sentinel de Containarium para terminar TLS de `<your-subdomain>` y reenviar al contenedor de Yarah. El certificado se aprovisiona automáticamente mediante ACME en la primera solicitud, sin certbot, sin configuración de nginx.

Verifique:

```bash
curl https://<your-subdomain>/api/health
```

Resultado esperado:

```json
{
  "status": "ok",
  "version": "2.x.x",
  "service": "Yarah OSS Backend",
  "timestamp": "..."
}
```

### 6. Conectar su agente al MCP de Yarah

Abra `https://<your-subdomain>` en un navegador y siga el flujo dentro del producto para conectar su agente compatible con MCP (Cursor, Claude Code, Windsurf, OpenCode, etc.) al servidor MCP de Yarah.

Verifique la conexión enviando esta indicación a su agente:

```text
I'm using Yarah as my backend platform, call Yarah MCP's
fetch-docs tool to learn about Yarah instructions.
```

## Despliegue impulsado por agentes (opcional)

Dado que Containarium expone su superficie de administración como un servidor MCP (`mcp-server`) y ofrece un segundo MCP dentro de cada contenedor (`agent-box`), un agente que hable MCP puede realizar todo el despliegue de extremo a extremo:

```text
agent: create me a container called 'yarah'
  → mcp__containarium__create_container(
      username="yarah", cpu="2", memory="4GB",
      disk="30GB", stack="docker")

agent: set Yarah up, fill in .env
  → ssh yarah agent-box
    → shell_exec("curl -fsSL https://raw.githubusercontent.com/Yarah/Yarah/main/deploy/setup.sh | sh -s ~/yarah")
    → edit ~/yarah/.env: API_BASE_URL, VITE_API_BASE_URL
      (setup.sh already generated the secrets — do not rewrite the file)

agent: enable autostart
  → mcp__containarium__compose_enable(
      username="yarah",
      dir="/home/yarah/yarah")

agent: expose on a public hostname
  → mcp__containarium__expose_port(
      username="yarah",
      container_port=7130,
      domain="<your-subdomain>")
```

Consulte [`docs/MCP-INTEGRATION.md`](https://github.com/footprintai/Containarium/blob/main/docs/MCP-INTEGRATION.md) de Containarium para ver el catálogo de herramientas MCP de la plataforma.

## Multi-inquilino: muchos proyectos de Yarah por host

Cada proyecto obtiene su propio LXC y su propio nombre de host; el sentinel enruta por SNI. No hay colisiones de puertos (cada contenedor tiene su propio espacio de nombres de red), ni nombres de proyecto de compose compartidos.

```bash
containarium create yarah-acme  --stack docker --memory 4GB --cpu 2 ...
containarium create yarah-globex --stack docker --memory 4GB --cpu 2 ...

containarium expose-port yarah-acme   --container-port 7130 \
  --domain acme.<your-domain>
containarium expose-port yarah-globex --container-port 7130 \
  --domain globex.<your-domain>
```

Cada proyecto obtiene volúmenes de postgres / storage / deno aislados.

## Administración

### Ver registros

```bash
ssh yarah 'cd ~/yarah && docker compose logs -f'
```

O por servicio: `docker compose logs -f yarah` / `postgres` / `deno`.

### Actualizar Yarah

```bash
ssh yarah <<'EOF'
  cd ~/yarah
  git -C ~/yarah pull origin main
  sh deploy/setup.sh .
  docker compose pull
  docker compose up -d
EOF
```

Si el inicio automático de compose está habilitado, no es necesario volver a habilitar la unidad: esta rastrea el directorio, no una etiqueta de imagen específica.

### Respaldar la base de datos

```bash
ssh yarah 'cd ~/yarah && docker compose exec -T postgres \
  pg_dump -U postgres yarah' > backup_$(date +%Y%m%d_%H%M%S).sql
```

Containarium también toma instantáneas de todo el contenedor diariamente mediante ZFS (retención de 30 días de forma predeterminada), lo que cubre el volumen de datos de postgres como respaldo de restauración a un punto en el tiempo.

### Detener / reiniciar

```bash
containarium compose disable yarah   # stop the compose stack and disable autostart
containarium sleep yarah             # stop the entire box
containarium wake yarah              # start the box; compose comes up via autostart
```

## Solución de problemas

### `containarium compose enable` falla

Verifique que Docker funcione dentro de la caja:

```bash
ssh yarah 'docker ps'
```

Si omitió `--stack docker` al crear la caja, instálelo manualmente dentro de ella o vuelva a crearla con la bandera.

### El nombre de host público no resuelve

`containarium expose-port` configura Caddy en el sentinel; el registro DNS A/CNAME de su subdominio debe apuntar a la IP pública del sentinel. Compruebe:

```bash
dig +short <your-subdomain>
```

### El nombre de host resuelve pero devuelve 502

Compruebe que Yarah sea accesible desde dentro de la caja:

```bash
ssh yarah 'curl -s http://localhost:7130/api/health'
```

Si la comprobación dentro de la caja está bien, el siguiente elemento a investigar es el puente entre el sentinel y la caja; vea [`docs/TUNNEL-REVERSE-PROXY.md`](https://github.com/footprintai/Containarium/blob/main/docs/TUNNEL-REVERSE-PROXY.md) de Containarium.

### Falta de memoria después de `docker compose up`

Los cuatro servicios de Yarah necesitan ~3 GB residentes en reposo. Si dimensionó la caja con 2 GB, redimensione:

```bash
containarium resize yarah --memory 4GB
containarium sleep yarah && containarium wake yarah
```

## Limitaciones

- **AUTH_PORT (7131) y DENO_PORT (7133)** no se exponen externamente con los pasos anteriores. Si su aplicación llama al endpoint de autenticación independiente o a URLs de funciones Deno directas desde fuera de la caja, agregue llamadas `expose-port` adicionales con subdominios separados.
- **`containarium compose enable` requiere Containarium v0.18 o posterior** (la función de inicio automático de compose). En versiones anteriores, ejecute `docker compose up -d` y agregue manualmente una entrada de cron `@reboot`.
- **Paso a través de GPU**: Containarium lo admite, pero las funciones de borde estándar de Yarah no usan GPU. Déjelo desactivado a menos que sus funciones Deno personalizadas lo necesiten.

## Notas de seguridad

- El usuario del contenedor no tiene privilegios en el host (modo LXC sin privilegios); el root del contenedor no equivale al root del host.
- El frente sentinel admite listas de permitidos de IP de origen para los endpoints de administración; vea el [manual de seguridad operativa](https://github.com/footprintai/Containarium/blob/main/docs/security/OPERATOR-SECURITY-RUNBOOK.md) de Containarium.
- Para producción, opte por el cifrado de sobre KMS de Containarium (Vault Transit o GCP KMS) para cualquier secreto de Yarah almacenado en el almacén de secretos de Containarium.
- Use `containarium token generate --scopes containers:read,containers:write ...` para generar tokens de mínimo privilegio para agentes en lugar de distribuir tokens de administrador.

## Recursos

- **Containarium**: https://github.com/footprintai/containarium
- **Documentación de Containarium**: https://github.com/footprintai/Containarium/tree/main/docs
- **Documentación de Yarah**: https://docs.yarah.dev
- **Discord de Yarah**: https://yarah.dev/community

---

Para otras estrategias de despliegue, consulte las [guías de despliegue](/deployment/deployment-security-guide).
