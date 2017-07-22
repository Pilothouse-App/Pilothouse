# Pilothouse

*A LEMP local development environment based on Docker.*

Pilothouse is a command line app that automates the process of managing a complete Docker-based local development environment.

Pilothouse is completely free and open source, and features:
 * Unlimited local sites
 * Laravel and WordPress support built-in
 * Seamless Composer and WP-CLI integration
 * Multiple PHP versions, configurable on a per-site basis
 * Automated hosts file management
 * SSL automatically available for all local sites
 * Remote PHP debugging using Xdebug

...and much more!

## What's Inside

- Nginx
- PHP 5.6, 7.0, and 7.1
- MariaDB
- Redis
- Xdebug
- Composer
- WP-CLI
- MailCatcher

## Getting Started

Pilothouse is a NodeJS script which manages a Docker-based stack. Thus, you will need to have [Docker Community Edition](https://www.docker.com/community-edition) and [NodeJS](https://nodejs.org/) installed. If you're a web developer, there's a pretty good chance you already have Node.

Once you have Docker and Node on your system, install Pilothouse with:

```
npm install -g pilothouse
```
Then, start up the system using `pilothouse up`. The first time you start Pilothouse, your system will need to download the Docker containers, which may take quite a while, depending on the speed of your internet connection.

Once initial startup is complete, create a new local site by running `pilothouse create`.

Local sites are by default located in the `Sites` directory of your user home directory, but you can [use a different location](https://github.com/Pilothouse-App/pilothouse/wiki/Configuring-Pilothouse-Settings) if you prefer.

See below for the full list of available commands, and be sure to take a look at the [Wiki](https://github.com/Pilothouse-App/pilothouse/wiki) for advanced usage.

## Commands

*Run `pilothouse --help` for inline usage instructions at any time.*

### System Commands

- `pilothouse up`: Boots up the Docker containers, and adds all necessary site entries to the host's hosts file.
- `pilothouse down`: Halts the Docker containers, removing all site entries from the host's hosts file.
- `pilothouse restart [container]`: Restarts the specified Docker container (`nginx`, `memcached`, etc.), or the entire system if no container is specified.

### Site Commands
- `pilothouse create [site]`: Creates a new local site.
- `pilothouse delete [site]`: Deletes an existing local site.

### Utility Commands
- `pilothouse compose [command]`: Runs a [Docker Compose](https://docs.docker.com/compose/) command against the stack.
- `pilothouse logs [container]`: Tails the logs for the specified container, or the entire stack if no container is specified.
- `pilothouse mysql [query]`: Runs the provided MySQL query. The command will be run on the database of the current site, or with no database selected if not run from within a local site directory.

## Notes

- See the [Wiki](https://github.com/Pilothouse-App/pilothouse/wiki) for instructions on using [WP-CLI](https://github.com/Pilothouse-App/pilothouse/wiki/Using-WP-CLI), [Xdebug](https://github.com/Pilothouse-App/pilothouse/wiki/Using-Xdebug), [Mailcatcher](https://github.com/Pilothouse-App/pilothouse/wiki/Using-Mailcatcher), etc.
- You can connect to MySQL remotely using the host `127.0.0.1`, the username `pilothouse`, and the password `pilothouse`.
- The default WordPress username and password is `admin`/`password`.

## Meta

Pilothouse is open source software licensed under the GPLv2. Pilothouse was created and is maintained by [Philip Newcomer](https://philipnewcomer.net). Props to [these awesome contributors](https://github.com/Pilothouse-App/pilothouse/graphs/contributors)!
