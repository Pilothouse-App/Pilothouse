listen 80;

location / {
	index index.php index.html;
	try_files $uri $uri/ /index.php?$args;
}

location = /favicon.ico {
    access_log off;
    log_not_found off;
}

location = /robots.txt {
    access_log off;
    log_not_found off;
}

location ~* \.(css|eot|gif|html|ico|jpe?g|js|mov|mp3|png|svg|ttf|txt|woff)$ {
	access_log off;
	expires 0;
}

# Rewrite requests to `/wp-.*` on subdirectory installs.
if ( !-e $request_filename ) {
	rewrite /wp-admin$ $scheme://$host$uri/ permanent;
	rewrite ^/[_0-9a-zA-Z-]+(/wp-.*) $1 last;
	rewrite ^/[_0-9a-zA-Z-]+(/.*\.php)$ $1 last;
}

location ~ \.php$ {
    try_files $uri =404;
	include fastcgi_params;
	fastcgi_index index.php;
	fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
	fastcgi_pass $backend;
	fastcgi_read_timeout 3600s;
}
