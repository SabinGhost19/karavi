FROM php:8.3-apache

RUN docker-php-ext-install mysqli pdo_mysql 
 
WORKDIR /var/www/html
 
COPY index.php .
 
EXPOSE 80/tcp
 
CMD ["apachectl", "-D", "FOREGROUND"]