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

### Quick Start

1. Install [Docker](https://www.docker.com/products/docker#/mac).
2. Clone the repo to your computer.
3. Add the `bin` path in the repo to your OS's include path.
4. Run `wpdocker up` to build the containers and boot up the system.
5. Create a new site by running `wpdocker create`.

### Notes

- Local WordPress sites are located in the `sites` directory.
- The default WordPress username and password is `admin`/`12345`.
- To connect to a site's database using something like Sequel Pro, connect to `localhost` on the default MySQL port with the username `wordpress`, the password `wordpress`, and the directory of the local site you wish to connect to as the database name.
- The first time you boot the system, the PHP containers will need to be built, which will take quite a bit of time. Subsequent boots will use the cached container, and will not need to be built each time.
- The Bash scripts have only been tested on macOS; your mileage on other OSes will vary.

### Using WP-CLI

To run WP-CLI commands, change to a location in the site directory you wish to run the command against, and run the `wp` command as normal. (For this to work, you will need to have added the WPDocker `bin` directory to your OS's include path as described above.)

To run a WP-CLI command with Xdebug enabled, set an environment variable `xdebug` on your host to `on` before running the command:
```
$xdebug=on
wp command-to-run
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

- `wpdocker up`: Boots up the Docker containers, and adds all necessary site entries to the host's hosts file.
- `wpdocker down`: Halts the Docker containers, removing all site entries from the host's hosts file.
- `wpdocker restart`: Restarts the Docker containers.
- `wpdocker create`: Creates a new local site.
- `wpdocker delete`: Deletes an existing local site.
- `wpdocker mysql`: Runs a provided MySQL query, i.e. `wpdocker mysql "USE exampledb; SELECT * FROM table"`

### ToDo

1. Clean up some of the remaining rough edges.
2. Add something like MailCatcher to intercept mail sent from the local sites.
