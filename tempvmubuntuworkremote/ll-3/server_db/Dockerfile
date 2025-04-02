FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=student

COPY all-databases.sql /docker-entrypoint-initdb.d

EXPOSE 3306

CMD ["mysqld"]