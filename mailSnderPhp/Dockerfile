FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    msmtp \
    msmtp-mta \
    && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

COPY php.ini /usr/local/etc/php/

COPY msmtprc /etc/msmtprc
RUN chmod 600 /etc/msmtprc

COPY index.php /var/www/html/
COPY bcr.php /var/www/html/

WORKDIR /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]