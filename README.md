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
- To run WP-CLI commands, change to a location in the site directory you wish to run the command against, and run the `wp` command as normal. Make sure you have added the `bin` directory to your OS's include path.
- To use Xdebug, use the IDE key `wpdocker` with the port `9000`. Make sure path mappings are configured correctly in your IDE. 
- To connect to a site's database using something like Sequel Pro, connect to `localhost` on the default MySQL port with the username `wordpress`, the password `wordpress`, and the directory of the local site you wish to connect to as the database name.
- The first time you boot the system, the PHP container will need to be built, which will take quite a bit of time. Subsequent boots will use the cached container, and will not need to be built each time.
- The Bash scripts have only been tested on macOS; your mileage on other OSes will vary.

### Commands

- `wpdocker up`: Boots up the Docker containers, and adds all necessary site entries to the host's hosts file.
- `wpdocker down`: Halts the Docker containers, removing all site entries from the host's hosts file.
- `wpdocker restart`: Restarts the Docker containers.
- `wpdocker create`: Creates a new local site.
- `wpdocker delete`: Deletes an existing local site.
- `wpdocker mysql`: Runs a provided MySQL query, i.e. `wpdocker mysql "USE exampledb; SELECT * FROM table"`

### ToDo

1. Add the ability to toggle Xdebug off/on.
2. Clean up some of the remaining rough edges.
3. Add something like MailCatcher to intercept mail sent from the local sites.
