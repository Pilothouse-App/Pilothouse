# Pilothouse App

An open-source local LEMP development stack using Docker. Comes with a set of Bash scripts for starting and stopping the stack, creating and deleting WordPress installs, keeping the hosts file updated, and running WP-CLI commands, among other useful features.

Pilothouse supports multiple local sites, Xdebug, multiple versions of PHP, and running WP-CLI commands directly from the host. Pilothouse is tailored to WordPress projects, but can be used for general PHP projects as well.

### What's Inside

- Nginx
- PHP 5.6, 7.0, and 7.1
- MariaDB
- Memcached
- Xdebug
- WP-CLI
- MailCatcher

### Quick Start

1. Install [Docker](https://www.docker.com/products/docker#/mac).
2. Once installed, open Docker on your computer and run through the initial configuration settings.
3. Clone the repo to your computer.
4. Run `composer install`.
5. Add the `bin` path in the repo to your shell include path ([more info](https://github.com/Pilothouse-App/pilothouse/wiki/Shell-Include-Path-Configuration)).
6. Run `pilothouse up` to build the containers and boot up the system. *On the first run, this will take quite a while as the Docker containers are downloaded and built.*
7. Create a new site by running `pilothouse create`.

### Notes

- See the [Wiki](https://github.com/Pilothouse-App/pilothouse/wiki) for instructions on using [WP-CLI](https://github.com/Pilothouse-App/pilothouse/wiki/Using-WP-CLI), [Xdebug](https://github.com/Pilothouse-App/pilothouse/wiki/Using-Xdebug), [Mailcatcher](https://github.com/Pilothouse-App/pilothouse/wiki/Using-Mailcatcher), etc.
- Local WordPress sites are located in the `sites` directory. [This can be changed](https://github.com/Pilothouse-App/pilothouse/wiki/Changing-the-Location-of-the-%22sites%22-Directory).
- The default WordPress username and password is `admin`/`password`.
- The Bash scripts have only been tested on macOS; your mileage on other OSes will vary.
- The master branch should be relatively stable, except for major releases. The develop branch should be considered "beta" and is subject to non-backwards-compatible changes.

### Commands

- `pilothouse up`: Boots up the Docker containers, and adds all necessary site entries to the host's hosts file.
- `pilothouse down`: Halts the Docker containers, removing all site entries from the host's hosts file.
- `pilothouse restart [container]`: Restarts the specified Docker container (`nginx`, `memcached`, etc.), or the entire system if no container is specified.
- `pilothouse create [site]`: Creates a new local site.
- `pilothouse delete [site]`: Deletes an existing local site.
- `pilothouse generate-ssl [site]`: Generates, installs, and trusts a self-signed SSL certificate for the specified site.
- `pilothouse mysql [command]`: Runs the provided MySQL command. The command will be run on the database of the current site, or with no database selected if not run from within a site directory.
- `pilothouse wp [command]`: Runs a WP-CLI command in the Docker container against the current site.
- `pilothouse compose [command]`: Runs a `docker-compose` command with required environment variables set.

### License

Pilothouse is open source software licensed under the GPLv2. Pilothouse is authored by [Philip Newcomer](https://github.com/philipnewcomer), along with help from [these awesome contributors](https://github.com/Pilothouse-App/pilothouse/graphs/contributors).
