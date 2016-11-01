FROM php:7.0-fpm-alpine

RUN apk add --no-cache --virtual .build-deps \
        git autoconf g++ libtool make imagemagick-dev libmemcached-dev libjpeg-turbo-dev libpng-dev zlib-dev cyrus-sasl-dev \
	&& docker-php-source extract \

	&& git clone --branch php7 https://github.com/php-memcached-dev/php-memcached /usr/src/php/ext/memcached/ \
	&& docker-php-ext-configure memcached \
	&& docker-php-ext-install memcached \

	&& pecl install imagick \
	&& docker-php-ext-enable imagick \

	&& pecl install xdebug \
	&& docker-php-ext-enable xdebug \

	&& rm -rf /usr/src/php/ext/memcached \
	&& docker-php-source delete \
	&& apk del .build-deps \

	&& docker-php-ext-install gd mysqli opcache zip \
	&& apk add --no-cache imagemagick libmemcached mysql-client

RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
	&& chmod +x wp-cli.phar \
	&& mv wp-cli.phar /usr/local/bin/wp