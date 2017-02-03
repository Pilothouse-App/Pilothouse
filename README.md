# DockerBox

An open-source local LEMP development stack using Docker. Comes with a set of Bash scripts for starting and stopping the stack, creating and deleting WordPress installs, keeping the hosts file updated, and running WP-CLI commands, among other useful features.

DockerBox supports multiple local sites, Xdebug, and running WP-CLI commands directly from the host. DockerBox is tailored to WordPress projects, but can be used for general PHP projects as well.

### What's Inside

- Nginx
- PHP 7
- MariaDB
- Memcached
- Xdebug
- WP-CLI
- MailCatcher

### Quick Start

1. Install [Docker](https://www.docker.com/products/docker#/mac).
2. Once installed, open Docker on your computer and run through the intial configuration settings.
3. Clone the repo to your computer.
4. Run `composer install`.
5. Add the `bin` path in the repo to your shell include path ([more info](https://github.com/DockerBox/dockerbox/wiki/Shell-Include-Path-Configuration)).
6. Run `dockerbox up` to build the containers and boot up the system. *On the first run, this will take quite a while as the Docker containers are downloaded and built.*
7. Create a new site by running `dockerbox create`.

### Notes

- See the [Wiki](https://github.com/DockerBox/dockerbox/wiki) for instructions on using [WP-CLI](https://github.com/DockerBox/dockerbox/wiki/Using-WP-CLI), [Xdebug](https://github.com/DockerBox/dockerbox/wiki/Using-Xdebug), [Mailcatcher](https://github.com/DockerBox/dockerbox/wiki/Using-Mailcatcher), etc.
- Local WordPress sites are located in the `sites` directory. [This can be changed](https://github.com/DockerBox/dockerbox/wiki/Changing-the-Location-of-the-%22sites%22-Directory).
- The default WordPress username and password is `admin`/`password`.
- The Bash scripts have only been tested on macOS; your mileage on other OSes will vary.

### Commands

- `wp [command]`: Runs a WP-CLI command in the Docker container against the current site.
- `dockerbox up`: Boots up the Docker containers, and adds all necessary site entries to the host's hosts file.
- `dockerbox down`: Halts the Docker containers, removing all site entries from the host's hosts file.
- `dockerbox restart [container]`: Restarts the specified Docker container (`nginx`, `memcached`, etc.), or the entire system if no container is specified.
- `dockerbox create [site]`: Creates a new local site.
- `dockerbox delete [site]`: Deletes an existing local site.
- `dockerbox generate-ssl [site]`: Generates, installs, and trusts a self-signed SSL certificate for the specified site.
- `dockerbox mysql [command]`: Runs the provided MySQL command. The command will be run on the database of the current site, or with no database selected if not run from within a site directory.
- `dockerbox compose [command]`: Runs a `docker-compose` command with required environment variables set.

### License

DockerBox is open source software licensed under the GPLv2. DockerBox is authored by [Philip Newcomer](https://github.com/philipnewcomer), along with help from [these awesome contributors](https://github.com/DockerBox/dockerbox/graphs/contributors).
