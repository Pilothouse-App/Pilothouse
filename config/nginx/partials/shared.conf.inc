listen 80;

location / {
	index index.php index.html;
	try_files $uri $uri/ /index.php?$args;
}

location ~ .php$ {
	include fastcgi_params;
	fastcgi_index index.php;
	fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
	fastcgi_pass $backend;
	fastcgi_read_timeout 3600s;
}
