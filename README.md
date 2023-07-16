*Pausing development on this project for now but I am potentially open to returning to it in the future*

# Webmention Server (TypeScript)

Welcome to the repo!

This project is mostly for learning purposes. It also powers my personal blog's webmentions (https://cobysher.dev/blog).

It should pass almost all of the tests on [webmention.rocks](https://webmention.rocks/) save for one of the more edgecase ones (one of the twenties, I forgot exactly which one).


## Architecture and Tech Used

- Node Bull + Redis for the queue
- Postgres for the RDBMS
- TypeScript + express.js for the webserver
- Docker & docker-compose (podman) to glue it all together


## Run it Locally

1. Copy the .env.example to .env
2. Fill in the vars
3. `podman-compose up -d`

If you want to build the image locally with semver tags, use `./podman.build.sh [MAJOR|MINOR|PATCH]`. It will build the current Dockerfile and tag the image with `latest` and the semver bump specified. You don't need to use this, but I think it's neat.

## Bug Reports

Feel free to open an issue.