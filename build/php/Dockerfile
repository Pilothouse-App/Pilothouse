FROM php:7.0-fpm-alpine

RUN apk add --no-cache --virtual .build-deps \
	git autoconf g++ libtool make imagemagick-dev libmemcached-dev libjpeg-turbo-dev libpng-dev zlib-dev cyrus-sasl-dev \
	&& docker-php-source extract

RUN git clone https://github.com/websupport-sk/pecl-memcache.git /usr/src/php/ext/memcache/ \
	&& docker-php-ext-configure memcache \
	&& docker-php-ext-install memcache

RUN git clone --branch php7 https://github.com/php-memcached-dev/php-memcached /usr/src/php/ext/memcached/ \
	&& docker-php-ext-configure memcached \
	&& docker-php-ext-install memcached

RUN apk add --no-cache imagemagick libmemcached mysql-client \
	&& pecl install imagick \
	&& docker-php-ext-install calendar gd mysqli opcache pdo_mysql zip \
	&& docker-php-ext-enable imagick

RUN rm -rf /usr/src/php/ext/memcache \
	&& rm -rf /usr/src/php/ext/memcached \
	&& docker-php-source delete \
	&& apk del .build-deps

RUN apk add --no-cache less ssmtp

RUN ln -s /usr/local/vendor/wp-cli/wp-cli/bin/wp /usr/local/bin/wp
RUN mkdir -p /home/www-data/.wp-cli && chown -R www-data:www-data /home/www-data/.wp-cli
