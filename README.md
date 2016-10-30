# WPDocker
*A local WordPress development stack in Docker*

### What Is It?

This is a WordPress-centric local development environment using Docker. In addition to the Docker stack, this package contains a set of Bash scripts for starting and stopping the stack, creating and deleting WordPress installs, updating the hosts file, and running WP-CLI commands.

It is somewhat opinionated, as I built it to fit my own specific needs. It is also pretty minimal and lightweight. That said, while I hope others will find it useful, I am not really interested in maintaining it as a more general tool for the masses. Feel free to report bugs and contribute, but be aware that I built this primarily for my own use, and will probably not be interested in adding a feature that I will not use myself, as I have limited spare time in which to build and maintain such things.

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
- To run WP-CLI commands, change to the site directory, and run the `wp` command as normal. Make sure you have added the `bin` directory to your OS's include path.
- To connect to a site's database using something like Sequel Pro, connect to `localhost` on the default MySQL port with the username `wordpress`, the password `wordpress`, and the directory of the local site you wish to connect to as the database name.
- The first time you boot the system, the PHP container will need to be built, which will take quite a bit of time. Subsequent boots will use the cached container, and will not need to be built each time.
- The Bash scripts have only been tested on macOS; your mileage on other OSes will vary.

### Commands

- `wpdocker up`: Boots up the Docker containers.
- `wpdocker down`: Halts the Docker containers.
- `wpdocker create`: Creates a new local site.
- `wpdocker delete`: Deletes an existing local site.

### ToDo

1. Add the ability to toggle Xdebug off/on.
2. Clean up some of the remaining rough edges.
3. Add something like MailCatcher to intercept mail sent from the local sites.
4. Remove entries from the hosts file when the system is halted, and replace them when restarted.
