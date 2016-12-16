FROM php:7.0-fpm-alpine

RUN apk add --no-cache --virtual .build-deps \
        git autoconf g++ libtool make imagemagick-dev libmemcached-dev libjpeg-turbo-dev libpng-dev zlib-dev cyrus-sasl-dev \
	&& docker-php-source extract \

	&& git clone --branch php7 https://github.com/php-memcached-dev/php-memcached /usr/src/php/ext/memcached/ \
	&& docker-php-ext-configure memcached \
	&& docker-php-ext-install memcached \

	&& pecl install imagick \
	&& docker-php-ext-enable imagick \

	&& docker-php-ext-install calendar gd mysqli opcache zip \
	&& docker-php-ext-enable calendar gd zip \
	&& apk add --no-cache imagemagick libmemcached mysql-client \

	&& apk add --no-cache ssmtp \

	&& rm -rf /usr/src/php/ext/memcached \
	&& docker-php-source delete \
	&& apk del .build-deps

RUN apk add --no-cache less

RUN ln -s /usr/local/vendor/wp-cli/wp-cli/bin/wp /usr/local/bin/wp
RUN mkdir -p /home/www-data/.wp-cli/cache && chown -R www-data:www-data /home/www-data/.wp-cli/cache
