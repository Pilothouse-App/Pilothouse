# WPDocker
*A lightweight local WordPress development stack in Docker*

### What Is It?

This is a WordPress-centric local development environment using Docker. In addition to the Docker stack, this package contains a set of Bash scripts for starting and stopping the stack, creating and deleting WordPress installs, keeping the hosts file updated, and running WP-CLI commands.

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
2. Clone the repo to your computer.
3. Run `composer install`.
4. Add the `bin` path in the repo to your host operating system's include path. *Unless you've installed an alternate shell, this means you would add the following to your `~/.bash_profile` file (create it if it does not already exist), adjusting the path to match where you have installed WPDocker:* `PATH="${HOME}/wpdocker/bin:$PATH"`
5. Run `wpdocker up` to build the containers and boot up the system. *On the first run, this will take quite a while as the Docker containers are downloaded and built.*
6. Create a new site by running `wpdocker create`.

### Notes

- Local WordPress sites are located in the `sites` directory.
- The default WordPress username and password is `admin`/`password`.
- To connect to a site's database using something like Sequel Pro, connect to `localhost` on the default MySQL port with the username `wordpress`, the password `wordpress`, and the directory of the local site you wish to connect to as the database name.
- The Bash scripts have only been tested on macOS; your mileage on other OSes will vary.

### Using MailCatcher

Any emails sent out from local sites will be sent to MailCatcher, accessible at [http://localhost:1080](http://localhost:1080).

### Using WP-CLI

To run WP-CLI commands, change to a location in the site directory you wish to run the command against, and run the `wp` command as normal. (For this to work, you will need to have added the WPDocker `bin` directory to your OS's include path as described above.)

To run a WP-CLI command with Xdebug enabled, add the `--xdebug` flag to your command:
```
wp command-to-run --xdebug
```

### Using Xdebug

Configure your IDE with the IDE key `wpdocker` and the port `9000`. Make sure path mappings are configured in your IDE to map the site's local path to the path in the Docker container, which is `/var/www/html/{sitename}/`.

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

- `wp`: Runs a WP-CLI command in the Docker container against the current site.
- `wpdocker up`: Boots up the Docker containers, and adds all necessary site entries to the host's hosts file.
- `wpdocker down`: Halts the Docker containers, removing all site entries from the host's hosts file.
- `wpdocker restart [container-name]`: Restarts the specified Docker container (`nginx`, `memcached`, etc.), or the entire system if no container is specified.
- `wpdocker create`: Creates a new local site.
- `wpdocker delete`: Deletes an existing local site.
- `wpdocker generate-ssl`: Generates, installs, and trusts a self-signed SSL certificate for the specified site.
- `wpdocker mysql`: Runs a provided MySQL query, i.e. `wpdocker mysql "USE exampledb; SELECT * FROM table"`
