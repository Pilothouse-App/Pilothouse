# DockerBox
*A lightweight PHP, MySQL and NGINX development stack using Docker*

### What Is It?

This is a local development stack which uses Docker for all services. The project is tailored to WordPress projects, but can be used for general PHP projects as well.

In addition to the Docker stack, this package contains a set of Bash scripts for starting and stopping the stack, creating and deleting WordPress installs, keeping the hosts file updated, and running WP-CLI commands, among other useful features.

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
5. Add the `bin` path in the repo to your host operating system's include path. *Unless you've installed an alternate shell, this means you would add the following to your `~/.bash_profile` file (create it if it does not already exist), adjusting the path to match where you have installed DockerBox:* `PATH="${HOME}/dockerbox/bin:$PATH"`
6. Run `dockerbox up` to build the containers and boot up the system. *On the first run, this will take quite a while as the Docker containers are downloaded and built.*
7. Create a new site by running `dockerbox create`.

### Notes

- Local WordPress sites are located in the `sites` directory.
- The default WordPress username and password is `admin`/`password`.
- To connect to a site's database using something like Sequel Pro, connect to `localhost` on the default MySQL port with the username `wordpress`, the password `wordpress`, and the directory of the local site you wish to connect to as the database name.
- The Bash scripts have only been tested on macOS; your mileage on other OSes will vary.

### Using MailCatcher

Any emails sent out from local sites will be sent to MailCatcher, accessible at [http://localhost:1080](http://localhost:1080).

### Using WP-CLI

To run WP-CLI commands, change to a location in the site directory you wish to run the command against, and run the `wp` command as normal. (For this to work, you will need to have added the DockerBox `bin` directory to your OS's include path as described above.)

To run a WP-CLI command with Xdebug enabled, add the `--xdebug` flag to your command:
```
wp command-to-run --xdebug
```

### Using Xdebug

Configure your IDE with the IDE key `dockerbox` and the port `9000`. Make sure path mappings are configured in your IDE to map the site's local path to the path in the Docker container, which is `/var/www/html/{sitename}/`.

Xdebug is not enabled by default, for performance reasons. However, you can easily toggle Xdebug on for a specific domain by setting a cookie named `xdebug` with a value of `on` in your browser. Whenever this cookie is present in the request, Xdebug will be enabled.

The following bookmarklets can be added to your favorites bar to quickly add and remove the Xdebug cookie:

Toggle Xdebug On
```
javascript:(function(){document.cookie='xdebug=on;path=/;';})()
```

Toggle Xdebug Off
```
javascript:(function(){document.cookie='xdebug=;path=/;';})()
```

See the *Using WP-CLI* section above for enabling Xdebug in WP-CLI commands.

### Commands

- `wp [command]`: Runs a WP-CLI command in the Docker container against the current site.
- `dockerbox up`: Boots up the Docker containers, and adds all necessary site entries to the host's hosts file.
- `dockerbox down`: Halts the Docker containers, removing all site entries from the host's hosts file.
- `dockerbox restart [container]`: Restarts the specified Docker container (`nginx`, `memcached`, etc.), or the entire system if no container is specified.
- `dockerbox create [site]`: Creates a new local site.
- `dockerbox delete [site]`: Deletes an existing local site.
- `dockerbox generate-ssl [site]`: Generates, installs, and trusts a self-signed SSL certificate for the specified site.
- `dockerbox mysql [command]`: Runs the provided MySQL command. The command will be run on the database of the current site, or with no database selected if not run from within a site directory.
