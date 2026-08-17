# Deploy Yarah with Docker

## Prerequisites

- Docker and Docker Compose installed on your machine
- Git, to check out the repository

## Setup Yarah

### Step 1: Get the repository

```bash
curl -fsSL https://raw.githubusercontent.com/Yarah/Yarah/main/deploy/setup.sh | sh -s ~/yarah
```

Checks out the files the stack reads and generates `JWT_SECRET`, `ENCRYPTION_KEY`,
`ROOT_ADMIN_PASSWORD` and `POSTGRES_PASSWORD` into `.env`. Nothing is started.

> Rather not pipe a script into a shell? Read it first:
>
> ```bash
> curl -fsSL https://raw.githubusercontent.com/Yarah/Yarah/main/deploy/setup.sh -o setup.sh
> less setup.sh
> sh setup.sh ~/yarah
> ```

Every service pulls a published image — there is no build step. The checkout is
required because Postgres mounts `deploy/docker-init/db/` from it.

### Step 2: Start Yarah

```bash
cd ~/yarah
docker compose up -d
```

### Step 3: Access Yarah

Open your browser and navigate to `http://localhost:7130`, you can see the Yarah dashboard as below:

<div align="center">
  <img src="../assets/signin.png" alt="Yarah Dashboard" width="600">
</div>

## Running Multiple Instances

You can run multiple Yarah projects on the same host by using different ports and project names.

### Step 1: Run the setup script once per directory

```bash
curl -fsSL https://raw.githubusercontent.com/Yarah/Yarah/main/deploy/setup.sh | sh -s ~/project1
curl -fsSL https://raw.githubusercontent.com/Yarah/Yarah/main/deploy/setup.sh | sh -s ~/project2
```

A directory each, so each gets its own generated secrets. Copying `.env.example`
instead would give both the placeholder values it ships — the same published
`JWT_SECRET` on every instance.

### Step 2: Give each one its own project name and ports

Both `.env` files start with `COMPOSE_PROJECT_NAME=yarah`, and **two
directories sharing that name share containers** — the second `up -d` adopts the
first's and recreates them with the second's config. Set it before starting
anything.

`~/project1/.env` keeps the default ports — which collide with the `~/yarah`
instance from the quickstart above if it is still running. Stop that one, or give
`project1` its own ports the way `project2` has:

```ini
COMPOSE_PROJECT_NAME=project1
```

`~/project2/.env` needs its own:

```ini
COMPOSE_PROJECT_NAME=project2
POSTGRES_PORT=5442
POSTGREST_PORT=5440
APP_PORT=7230
AUTH_PORT=7231
DENO_PORT=7233
```

### Step 3: Start each project

```bash
cd ~/project1 && docker compose up -d
cd ~/project2 && docker compose up -d
```

`COMPOSE_PROJECT_NAME` gives each one isolated containers, volumes, and networks; the ports keep them from colliding on the host.

### Managing multiple instances

```bash
# Check status
cd ~/project1 && docker compose ps

# View logs
cd ~/project1 && docker compose logs -f

# Stop an instance
cd ~/project1 && docker compose down

# Stop and remove all data
cd ~/project1 && docker compose down -v
```

Each project has its own database, storage, and configuration. They are completely independent.

---

## Start using Yarah

### 1. Connect Yarah MCP

Open [Yarah Dashboard](http://localhost:7130), Follow the steps to connect Yarah MCP Server:

<div align="center">
  <img src="../assets/connect.png" alt="Connect Yarah MCP" width="600">
</div>

### 2. Verify installation

To verify the connection, send the following prompt to your agent:
```
I'm using Yarah as my backend platform, call Yarah MCP's fetch-docs tool to learn about Yarah instructions.
```

### 3. Start building your project

Build your next todo app, Instagram clone, or online platform in seconds!

Sample Project Prompt:

```
Build an app similar to Reddit with community-based discussion threads using Yarah as the backend platform that has these features:

- Has a "Communities" list where users can browse or create communities
- Each community has its own posts feed
- Users can create posts with a title and body (text or image upload to Yarah storage)
- Users can comment on posts and reply to other comments
- Allows upvoting and downvoting for both posts and comments
- Shows vote counts and comment counts for each post
```
