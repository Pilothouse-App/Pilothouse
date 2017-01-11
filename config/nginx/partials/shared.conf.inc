listen 80;

location / {
	index index.php index.html;
	try_files $uri $uri/ /index.php?$args;
}

location ~* \.(css|eot|gif|html|ico|jpe?g|js|mov|mp3|png|svg|ttf|txt|woff)$ {
	access_log off;
	expires 0;
}

location ~ .php$ {
    try_files $uri =404;
	include fastcgi_params;
	fastcgi_index index.php;
	fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
	fastcgi_pass $backend;
	fastcgi_read_timeout 3600s;
}
