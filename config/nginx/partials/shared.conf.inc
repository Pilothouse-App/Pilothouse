listen 80;

index index.html index.php;

location / {
	try_files $uri $uri/ /index.php?$args;
}

location ~ .php$ {
	include fastcgi_params;
	fastcgi_index index.php;
	fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
	fastcgi_pass php:9000;
	fastcgi_read_timeout 3600s;
}
