WebApp is an example of a generic web application with React and Redux.

Features

* Babel 6
* React
* React-router
* Redux
* Webpack
* Isomorphic (universal) rendering
* Hot reload (aka Hot Module Replacement) for React components, Redux reducers, Redux action creators, translated messages
* Internationalization with React-intl
* User authentication (JSON Web Token) & authorization (roles)
* REST API
* SQL ORM (PostgreSQL + Bookshelf)
* MongoDB
* Microservice architecture
* Responsive web design
* Works both with Javascript enabled and disabled (suitable for DarkNet purposes)
* Koa
* Bunyan logging (log file rotation is built-in)
* Correctly handles Http Cookies on the server-side
* To be done: GraphQL + Relay
* To be done: native Node.js clustering
* // maybe: Protection against Cross Site Request Forgery attacks

Quick Start
===========

* make sure you have [Node.js version >= 6.0.0](https://www.npmjs.com/package/babel-preset-node6) installed
* `npm run install-recursive` (runs `npm install` for all subdirectories recursively)
* `npm run dev`
* wait for it to finish the build (green stats will appear in the terminal, and it will say "Webpage server is listening at http://localhost:3004")
* go to `http://127.0.0.1:3000`
* interact with the development version of the web application
* `Ctrl + C`
* `npm run production`
* wait a bit for Webpack to finish the build (green stats will appear in the terminal, plus some `node.js` server running commands)
* go to `http://127.0.0.1:3000`
* interact with the production version of the web application

Configuration
=============

One can configure this application through creation of `configuration.js` file in the root folder (use `configuration.defaults.js` file as a reference).

All the options set in that file will overwrite the corresponding options set in `configuration.defaults.js` file.

Running (in development)
========================

```sh
npm run dev
```

After it finishes loading go to `http://127.0.0.1:3000`

(the web page will refresh automatically when you save your changes)

localhost vs 127.0.0.1
======================

On my Windows machine in Google Chrome I get very slow Ajax requests.

That's a strange bug related to Windows and Google Chrome [discussed on StackOverflow](http://stackoverflow.com/questions/28762402/ajax-query-weird-delay-between-dns-lookup-and-initial-connection-on-chrome-but-n/35187876)

To workaround this bug I'm using `127.0.0.1` instead of `localhost` in the web browser.

Architecture
============

The application consists of the following microservices

  * `web-server` is the gateway (serves static files and proxies to all the other microservices)
  * `page-server` renders web pages on the server side (using [react-isomorphic-render](https://github.com/halt-hammerzeit/react-isomorphic-render))
  * `authentication-service` handles user authentication (sign in, sign out, register) and auditing (keeps a list of user sessions and traces latest activity time)
  * `password-service` performs password hashing and checking (these operations are lengthy and CPU-intensive)
  * `user-service` provides REST Api for users (getting users, creating users, updating users)
  * `api-service` provides some generic (uncategorized) Http REST Api
  * `image-server` resizes uploaded images using ImageMagick and serves them
  * `log-service` aggregates logs from all the other services
  * `email-service` sends emails

<!-- 
Running in production (to be done)
====================

./automation/start.sh

./automation/stop.sh

Сгенерировать скрипт автозапуска на сервере:

./automation/start.sh

pm2 startup

pm2 save

https://github.com/Unitech/pm2

Посмотреть статус процесса: 

pm2 list

Мониторинг процесса: 

pm2 monit

Посмотреть логи:

pm2 logs webapp

Возможна кластеризация, безостановочное самообновление и т.п.
 -->

<!-- Redis
=====

The application will run without Redis but user authenication will only work in demo mode.

To enable full support for user authentication Redis must be installed for storing user sessions.

After installing Redis edit the configuration.js file accordingly

```javascript
redis:
{
  host     : 'localhost',
  port     : 6379,
  // password : '...' // is optional
}
```

To secure Redis from outside intrusion set up your operating system firewall accordingly. Also a password can be set and tunneling through an SSL proxy can be set up between the microservices. Also Redis should be run as an unprivileged `redis` user.
 -->

Security
========

The application should be run as an unprivileged user.

When switching to TLS will be made all cookies should be recreated (`{ secure: true }` option will be set on them automatically upon Https detection when they are recreated).

Image Server
============

In order to be able to upload pictures ImageMagic is required to be installed

https://github.com/elad/node-imagemagick-native#installation-windows

http://www.imagemagick.org/script/binary-releases.php

On OS X:

```
brew install imagemagick
```

<!-- Then it should be configured in your `configuration.js` file

```javascript
imagemagic: true
``` -->

Redis
=====

This application can run in demo mode without Redis being installed.

If you want this application make use of Redis then you should install it first.

For Windows: https://github.com/MSOpenTech/redis/releases

For OS X:

```
brew install redis
# To have launchd start redis at login:
ln -sfv /usr/local/opt/redis/*.plist ~/Library/LaunchAgents
# Then to load redis now:
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.redis.plist
```

and configure it in your `configuration.js` file

```javascript
redis:
{
  host     : 'localhost',
  port     : 6379,
  password : ... // is optional
}
``` 

<!-- MongoDB
=======

This application can run in demo mode without MongoDB being installed.

If you want this application make use of MongoDB then you should install it first.

For windows: https://www.mongodb.org/downloads

For OS X:
```
brew install mongodb
# To have launchd start mongodb at login:
ln -sfv /usr/local/opt/mongodb/*.plist ~/Library/LaunchAgents
# Then to load mongodb now:
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist
```

Then configure it in your `configuration.js` file

```javascript
mongodb:
{
  host     : 'localhost',
  port     : 27017,
  database : ...,
  user     : ...,
  password : ...
}
``` 

Setting up a freshly installed MongoDB

```sh
mongo --port 27017

use admin
db.createUser({
  user: "administrator",
  pwd: "[type-your-administrator-password-here]",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, { role: "dbAdminAnyDatabase", db: "admin" }, { role: "readWriteAnyDatabase", db: "admin" } ]
})

exit

# set "security.authorization" to "enabled" in your mongod.conf and restart MongoDB.
# (on OS X mongod.conf path is /usr/local/etc/mongod.conf and the restart command is `launchctl unload …`)
```

```sh
mongo --port 27017 -u administrator -p [type-your-administrator-password-here] --authenticationDatabase admin

use type-your-new-database-name-here
db.createUser({
  user: "type-your-user-name-here",
  pwd: "type-your-user-password-here",
  roles:
  [
    { role: "readWrite", db: "type-your-new-database-name-here" }
  ]
})

exit
```

One may also use [Robomongo](https://robomongo.org/download) as a GUI for MongoDB.

To initialize MongoDB database

```sh
npm run mongodb-migrate
```

To rollback the latest MongoDB migration
```sh
npm run mongodb-rollback
```

Migrations are stored in the `database/sql/migrations` folder.

When switching to MongoDB make sure you delete the `authentication` cookie contaning the user id or else an exception will be thrown saying "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters". Similarly, when switching away from MongoDB back to the dummy RAM storage make sure you clear the `authentication` cookie or else "User not found" error will be thrown on page refresh. -->

PostgreSQL
==========

This application can run in demo mode without PostgreSQL being installed.

If you want this application make use of PostgreSQL then you should first install it.

For OS X:

```
brew install postgresql
# To have launchd start postgresql at login:
ln -sfv /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents
# Then to load postgresql now:
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist

# Fixes "psql: FATAL: role "postgres" does not exist"
createuser --superuser postgres

# Then you may also want to install PSequel as a GUI
# http://psequel.com/
```

(hypothetically MySQL and SQLite3 will also do but I haven't checked that since PostgreSQL is the most advanced open source SQL database nowadays)

To change the default PostgreSQL superuser password

```sh
sudo -u postgres psql
postgres=# \password postgres
```

Then create a new user in PostgreSQL and a new database. For example, in OS X or Linux terminal, using these commands

```sh
createuser --username=postgres --interactive USERNAME
createdb --username=postgres --encoding=utf8 --owner=USERNAME DATABASE_NAME --template=template0
```

Also install PostGIS for geospacial data support

```sh
brew install postgis

# install the database extension (requires superuser privileges)
psql --username=postgres --dbname=DATABASE_NAME
CREATE EXTENSION postgis;
\q
```

Then create your `knexfile.js` file

```sh
cd backend
npm run postgresql-knex-init
```

Then configure your `knexfile.js` file. An example of how it might look

```
var path = require('path')

module.exports = {
  client: 'postgresql',
  connection: {
    database: 'webapp',
    user:     'webapp',
    password: 'webapp'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: path.join(__dirname, 'database/sql/migrations'),
    tableName: 'knex_migrations'
  }
}
```

Then initialize PostgreSQL database

```sh
npm run postgresql-migrate
```

To rollback the latest PostgreSQL migration
```sh
npm run postgresql-rollback
```

Or one can alternatively drop the database and create it from scratch initializing it with the command given above.

Migrations are stored in the `database/sql/migrations` folder.

InfluxDB
========

This application can run in demo mode without InfluxDB being installed.

InfluxDB can be used to store different kinds of stats.

(ports used: 8083 (web), 8086, 8090, 8099)

If you want this application make use of InfluxDB then you should first install it.

For OS X:

```
brew install influxdb
```

```
# enable autostart
ln -sfv /usr/local/opt/influxdb/*.plist ~/Library/LaunchAgents
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.influxdb.plist
```

```
influx
> CREATE USER admin WITH PASSWORD [administrator password here] WITH ALL PRIVILEGES
> CREATE USER webapp WITH PASSWORD [webapp password here]
> exit
```

```
nano /usr/local/etc/influxdb.conf

# [http]
#   auth-enabled = true
```

```
launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.influxdb.plist
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.influxdb.plist
```

Then run `influx`.

```
CREATE DATABASE webapp
GRANT ALL ON webapp TO webapp
USE webapp

CREATE RETENTION POLICY 7_days ON webapp DURATION 7d REPLICATION 1

CREATE CONTINUOUS QUERY emails_in_a_day ON webapp BEGIN SELECT mean(website) AS mean_website, mean(phone) AS mean_phone INTO webapp."default".downsampled_emails_sent FROM emails_sent GROUP BY time(24h) END
```

```
# To do: generate SSL certificate
# 
# [http]
#   https-enabled = true
#   https-certificate = “/etc/ssl/influxdb.pem”
#
# [continuous_queries]
#   run-interval = “1m”
```

For production the password is set in `/opt/influxdb/current/config.toml`.

StatsD
======

...

Grafana
=======

Grafana can be used for displaying data stored in InfluxDB (stats) as graphs.

Installing Grafana:

http://docs.grafana.org/installation/

<!-- /usr/local/Cellar/grafana/3.1.0 -->

Setting up Grafana for InfluxDB:

http://docs.grafana.org/datasources/influxdb/

Online status
=============

Each Http request to the server will update the user's latest activity time.

If a certain Http request is automated and shouldn't be interpreted as a user being online then this Http request URL should contain `bot=✓` parameter.

This works for GET requests, and I suppose it would work for POST requests too.

Docker
======

In production all services can be containerized using Docker.

To build a Docker image, run this script from the directory of a service: (work in progress)

```
npm run docker:image
```

To monitor Docker containers (availability) one can use Consul.

Elasticsearch
=============

(currently not used)

Install JDK

```
sudo add-apt-repository -y ppa:webupd8team/java
sudo apt-get update
sudo apt-get -y install oracle-java8-installer
```

Install Elasticsearch

```
# https://www.elastic.co/downloads/elasticsearch
wget ...
dpkg --install xxx.deb

# change cluster name
nano /etc/sysconfig/elasticsearch

sudo /bin/systemctl daemon-reload
sudo /bin/systemctl enable elasticsearch.service
sudo /bin/systemctl start elasticsearch.service
```

Install Kibana

```
wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb http://packages.elastic.co/kibana/4.5/debian stable main" | sudo tee -a /etc/apt/sources.list

sudo apt-get update && sudo apt-get install kibana

sudo /bin/systemctl daemon-reload
sudo /bin/systemctl enable kibana.service
```

Elasticsearch URL: http://localhost:9200

Kibana URL: http://localhost:5601

Monitoring:

https://github.com/lmenezes/elasticsearch-kopf

https://github.com/mobz/elasticsearch-head

```
nano config/elasticsearch.yml

# action.auto_create_index: false
```

Set up a cluster with 256 primary shards (`{ settings: number_of_shards: 256 }`).

For logs: `{ settings: “index.codec”: “best_compression” }`

Maybe later use some of these notes (work in progress):

```
"type":
{
  // "include_in_all": false,
  "_all": { "enabled": false },
  "dynamic": "no"
}
```

```
PUT /my_index_v1/_alias/my_index
```

```
PUT /my_index
{
  "settings": {
    "analysis": {
      "char_filter": {
        "quotes": {
          "type": "mapping",
          "mappings": [
            "\\u0091=>\\u0027",
            "\\u0092=>\\u0027",
            "\\u2018=>\\u0027",
            "\\u2019=>\\u0027",
            "\\u201B=>\\u0027"
          ]
        }
      },
      "analyzer": {
        "quotes_analyzer": {
          "tokenizer":     "standard",
          "char_filter": [ "quotes" ],
          "filter":  [ "lowercase", "asciifolding" ]
        }
      }
    }
  }
}

{
  "query": {
    "multi_match": {
      "type":     "most_fields",
      "query":    "está loca",
      "fields": [ "title", "title.folded" ]
    }
  }
}

{
  "settings": {
    "analysis": {
      "filter": {
        "nfkc_normalizer": {
          "type": "icu_normalizer",
          "name": "nfkc_cf"
        }
      },
      "analyzer": {
        "my_normalizer": {
          "tokenizer": "icu_tokenizer",
          "filter":  [ "nfkc_normalizer" ]
        }
      }
    }
  }
}

{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_lowercaser": {
          "tokenizer": "icu_tokenizer",
          "filter":  [ "icu_normalizer" ]
        }
      }
    }
  }
}

# The icu_normalizer defaults to the nfkc_cf form.

# "char_filter":  [ "icu_normalizer" ]

{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_folder": {
          "tokenizer": "icu_tokenizer",
          "filter":  [ "icu_folding" ]
        }
      }
    }
  }
}

 {
  "settings": {
    "analysis": {
      "analyzer": {
        "ducet_sort": {
          "tokenizer": "keyword",
          "filter": [ "icu_collation" ]
        }
      }
    }
  }
}

"content": {
  "type":          "string",
  "index_options": "freqs"
}

./bin/plugin -install elasticsearch/elasticsearch-analysis-icu/$VERSION
# The current $VERSION can be found at https://github.com/elasticsearch/elasticsearch-analysis-icu.
```

Troubleshooting
===============

...

To do
====================

не сбрасывать состояние Editable_field по нажатию на сохранить, когда запрашивает пароль для смены почты.
(сбрасывать по закрытию окошка проверки пароля)




при сабмите формы, до валидации полей, вызывать метод reset_error, и его прописать для change_password и для check_password (мб для других тоже)
это заменит вызов функции on_submit у формы




ещё сделать у modal методы reset() (= cleanup()) и focus()

reset() будет вызываться после закрытия по таймауту и очищать ошибки (как сейчас сделано в close() в change password)

focus будет делать фокус на инпуте в setTimeout:

  componentDidMount()
  {
    // Because this component is mounted before
    // the react-modal contents are mounted,
    // focus after the modal has been mounted.
    setTimeout(this.refs.input.focus, 0)
  }




сделать смену почты со вводом пароля

показывать "снек", что "пароль изменён"

показывать "снек", что "почта изменена"




сделать вход по "Адресному имени" (URL name)

в настройках - смена адресного имени с подсказкой о том, что это такое

автоматически генерировать адресное имя из Имени, присоединяя 




при смене пароля - слать письмо на почту




rabbitmq для писем




при регистрации пользователя username брать из почтового адреса, и если не уникально, то подставлять мб что-нибудь



при смене емейла - отправлять i18n шаблон на новую почту со ссылкой на подтверждение ящика, до этого генерируя в authentication service ключ для смены емейла (и с текстом, что "если это не вы, то не обращайте внимания"). при проходе по ссылке - страницу "ваш email изменён".

сделать письмо восстановления (то есть смены) пароля (форма входа + настройки) - то же самое, токен писать в коллекцию (уже другую), и сделать страницу сброса пароля на новый.




справа сделать стек уведомлений.





при выдаче токена удалять наиболее старые (больше 10, например)



перейти на docker в продакшене





при сохранении настроек мб как-то уведомлять об их сохранении - типа snack bar внизу



при входе (не первом) слать письмо на почту с указанием IP, страны, времени.



писать в time series базу, что отправился email с таким-то шаблоном, и в мониторинге потом выводить общее количество отправленных email-ов за сутки (с детализацией по шаблону)

сделать смену емейла отправкой ссылки на старый емейл

сделать страницу смены почты

сделать страницу сброса пароля


сделать отправку емейла при "забытии пароля", смене емейла (запрашивать пароль при смене емейла), при смене пароля, при входе и при неудавшемся входе (с IP).



сделать смену пароля в настройках



в мониторинге показывать график "горячих запросов" (url, method, логгировать параметры)




nginx чтобы перезаписывал X-Forwarded-For.
можно это валидировать где-нибудь на web-server-е.




Задавать максимальную ширину для content-section, если это текст.
(65 символов в строке)

https://www.smashingmagazine.com/2014/09/balancing-line-length-font-size-responsive-web-design/
(45 - 85)




для почты сделать отдельную секцию (как в контакте), и отдельный метод её изменения, изменяющий её также в authentication.
вместо 'user settings: save settings' будет другой event name.




вычленить в общий случай ситуации вида:

xxx
xxx_pending
xxx_error

(можно взять за основу user settings: get user authentication tokens)




Также написать общий случай: сделать какое-то действие типа создать/сохранить/удалить, и потом перезапросить список с сервера.






Вычленить в общий случай:

result.result.n === 1

ok 1
nModified 0
upserted []





проверить дизайн settings для маленьких экранов




в профиле сделать выбор пола (м, ж)




писать объём загрузки файлов (temporary) во времени по IP за сутки (обнулять можно в 0 часов).
писать объём загрузки файлов (temporary) во времени по пользователям за сутки (обнулять можно в 0 часов).

ввести ограничение: за сутки не более 10 гигабайтов с одного IP.





лицензионные соглашения сделать маркдауном, и генерить их на лету, наверное.
для этого придётся сделать отдельный Route для /licence/${language}, и там асинхронно подгружать React компонент, который уже будет делать какой-нибудь file-loader для licence.md.





не давать просто так изменить почту: только по гуглаутентикатору мб, или по вводу пароля

при смене почты отправлять письмо на старую почту с подтверждением операции; без подтверждения со старого ящика почту не менять

сделать двухфакторную аутентикацию






сделать страницу настроек (+ web 1.0):

возможность выбрать пол в настройках (male, female)

"красивый" id пользователя (alias)

возможность менять почту

возможность смотреть (и отзывать) ключи входа - кроме текущего (таблица вида: ключ, выдан, отозван, активность)






в мониторинге можно будет смотреть размер всех файлов временных, и будет кнопка их очистки.
график загрузки файлов (temporary) во времени по IP.
график загрузки файлов (temporary) во времени по пользователям.
также будет график регистраций пользователей по времени.





рубильник на отмену регистраций + соответствующая страница




сделать какой-то auto discovery для сервисов






можно будет попробовать перейти на react-hot-loader 3, когда он исправит ошибки
https://github.com/gaearon/react-hot-boilerplate/pull/61





// при изменении роли пользователя - уничтожать все authentication_token'ы





сделать поддержку "красивых" id пользователя

// user _id: either just digits (memory store), or MongoDB ObjectId (24 hex characters)
if (!(/^\d+$/.test(id) || id.length === 24))
{
  id = get_user_id_by_alias(id)
}

в настройках сделать поле красивого url'а (alias)

в таблице user_aliases(user_id, alias) вести историю: если кто-то когда-то занимал alias, то оттуда он не будет удаляться.
сделать его unique.

переназначить alias может только тот, кто раньше уже им пользовался

можно назначать себе не более трёх alias'ов






сделать загрузку картинок на amazon s3 (и выдачу с него)






сделать отправку сообщений

отправка сообщений чтобы работала при web 1.0





сделать страницу редактирования профиля web 1.0

на странице редактирования профиля сделать загрузку аватара web 1.0 (+ проверить случай с ошибкой вообще, а также случай с превышением размера)





в логах сделать паджинацию (пока простую, с ctrl + влево вправо)






Напоминания взять отсюда

http://materializecss.com/dialogs.html

(в showcase)





Увеличение фотографий

http://materializecss.com/media.html

(в showcase)





автокомплит (в showcase)







для неяваскриптовых сделать страницу редактирования профиля (загрузка картинки, правка имени пользователя)





если регистрация прошла, но не прошёл последующий sign_in, то никакой ошибки внизу не показывается




по каждому сервису, мониторить cpu load, ram, время запроса.





в common/web server сделать monitoting middleware, у которой будет метод checkpoint(text),
и по завершении весь список чекпоинтов и их таймингов будет отправляться на monitoring service
(можно сделать IPC по UDP)





клиентские ошибки (javascript) отправлять на сервис типа log-service (только в production)




monitoring-service:

сделать страницу мониторинга, которая будет показывать (для начала) время исполнения http запроса (common/web server) в таблице вида "сервис, url, время".

потом ещё сделать метрики отзывчивости event loop'а (процентили), и количество запросов в секунду.




мониторинг - показывать в меню только для роли 'administrator'
в мониторинге - логгировать время каждого запроса (оборачивать yield next())
показывать статус бекапа базы данных




если клик на имени пользователя при наличии <Badge/> - переход сразу в "Уведомления".

сделать компонент <Badge/> (взять из тех двух библиотек)






мобильное меню сделать с поддержкой pan на touchdown, как в materialize css





встроить защиту от DoS: ввести специальный переключатель, принимающий запросы только от пользователей, и всем остальным выдающий статическую страницу (или не статическую, а нормальную). регистрация при этом отключается (с пояснительным текстом).

в конфигурации добавить параметр allowed_ips: [], с которых можно будет разрешать вход на сайт (wildcards) (по умолчанию, будет ['*.*.*.*']).

в мониторинге показывать самые долго выполняющиеся запросы с группировкой по пользователям.
(хранить данные в течение суток) — так можно будет засекать пользователей, которые досят, и замораживать их.

у замороженного пользователя ставить флажок frozen с датой и причиной блокировки. проверять этот флажок при /authenticate и /sign-in : если при вызове /authenticate выяснилось, что пользователь заблокирован, то не выполнять дальнейшие @preload()ы, и выдавать страницу с сообщением о блокировке (дата, причина). если пользователя нет при вызове /authenticate, то перенаправлять на страницу входа с сообщением о доступности только для пользователей.

при этом включателе, даже если web server не имеет флага authenticate:
если запрос идёт (common/web server), и нет токена в нём, то выдавать статус 401 (unauthenticated).
если есть токен, то должен быть вызван метод /verify-token, который при непрохождении вернёт статус 401 (unauthenticated).








на странице мониторинга - количество зареганных пользователей + график регистраций по времени, количество сессий online + график по времени

писать в influxdb: количество зареганных пользователей, количество сессий online

частота - пять минут

хранение - неделя

для регистраций - хранение по неделям вечно



мониторинг: image server (status, uptime, размер папки со временными файлами) и другие







писать в лог файл все http запросы на web server, чтобы потом если что смотреть, какие дыры нашли






endless scroll в логах: выгрузка тех страниц, которые выходят за предел "показывать страниц", + url нормальный (с какой страницы показывать до + "показывать страниц")

на странице логов - фильтр по error, warning, info и т.п.

из log server - писать в MongoDB (опционально)

на клиенте сделать log, посылающий всё в консоль, и заменить все console.log на log.info и console.error на log.error






можно упаковывать каждый сервис в docker и как-то запускать это на Windows






В react-isomorphic-render мб перейти потом на async-props и react-router-redux, когда они стабилизируются со второй версией react-router'а






Магазин:




на страницах товара и магазина (профиль + список) 
сделать скинирование страницы через переменные CSS:

const styles = getComputedStyle(document.documentElement)
const value = String(styles.getPropertyValue('--primary-color')).trim()

document.documentElement.style.setProperty('--primary-color', 'green')







// можно сделать сопоставление области на карте и IP-адреса использования токена
// 
// ajax('freegeoip.net/json/{IP_or_hostname}')
// 
// {
//   "ip": "192.30.252.129",
//   "country_code": "US",
//   "country_name": "США",
//   "region_code": "CA",
//   "region_name": "Калифорния",
//   "city": "Сан-Франциско",
//   "zip_code": "94107",
//   "time_zone": "America/Los_Angeles",
//   "latitude": 37.7697,
//   "longitude": -122.3933,
//   "metro_code": 807
// }







при загрузке картинок:

возможность добавлять картинку по url'у

при upload-е выдавать ошибку "недостаточно места на диске", если свободного места меньше 5%, например.



ошибку реконнекта к лог сервису - выдавать в лог

буферить сообщения, если нету соединения к лог сервису



видео - mp4, webm; с первым кадром (ресайзы - как для jpg)
ограничение - мегабайтов 100

пока - только возможность добавлять video по url'у


message:
{
  text: '...',
  images: 
  [{
    id: '...',
    type: 'jpg',
    meta: ...,
    url: ..., // если добавлена по url'у
    sizes: 
    [{
      width: ...,
      height: ...,
      size: ...байтов
    }]
  }],
  videos:
  [{
    {
      id: '...',
      type: 'mp4',
      width: ...,
      height: ...,
      meta: ...,
      size: ...байтов,
      url: ..., // если добавлено по url'у
      preview: то же самое, что для картинки (без meta)
  }]
}







ресайз картинки сделать (2 размера: по клику и просто маленький)

добавлять расширение к имени файла

сделать ошибку "не удалось загрузить картинку" для пользователя (inline)

refresh тоже сделать с крутилкой

busy (uploading_picture, deleting, ...) - сделать индивидуальными для каждого id пользователя

создание пользователя сделать без диалога, инлайном
ошибку - тоже

/users -> /user_ids
/users сделать нормальным, и в action тоже

ошибку удаления и переименования (inline)

user: patch (rename)
add user: validation

крутилки на добавление, удаление, переименование, загрузку.






сделать статические страницы (nginx) для status 500 (как web server, так и page server) и 503, 401, 403, 404







// мб вычленить dropdown, menu, menu-button в react-responsive-ui
// и зарелизить react-responsive-ui, с react и react-router - peerDependencies

// мб в будущем: логи слать по ssl

// во время загрузки картинки - показывать выбранную картинку, уменьшенную, в обозревателе
(либо прямо через src, либо предварительно уменьшив), и тикать, как установка приложения в AppStore, пока не загрузится на сервер

// мб перейти на imagemagick-native, когда будет исправлен build
// https://github.com/elad/node-imagemagick-native/issues




https://github.com/gaearon/react-dnd

написать свои тикающие relative_time (нормальные)

https://www.google.com/design/icons/



// В react-router сделать модульность (постепенную загрузку dependencies)

// update-schema вызывать при изменении схемы Relay (nodemon)




// graphiql в development mode

// https://github.com/graphql/graphiql




// locale hot switch

// https://github.com/gpbl/react-locale-hot-switch/

// nodemon не watch'ит новые файлы

// Долго рестартует web сервер после изменений - мб улучшить это как-то

// Мб перейти с bluebird на обычные Promises
// Пока bluebird лучше:
// http://programmers.stackexchange.com/questions/278778/why-are-native-es6-promises-slower-and-more-memory-intensive-than-bluebird
// к тому же, в bluebird есть обработчик ошибок по умолчанию; есть .cancel(); есть много разного удобного.

// NginX



Рендеринг React'а вместе с React-router'ом и Redux'ом взят отсюда
(будет обновляться после 22.03.2016 - мержить к себе новые изменения):

https://github.com/erikras/react-redux-universal-hot-example/commits/master

// Разделить проект на ядро (модуль npm) и чисто кастомный код (actions, stores, pages, components)

// можно сделать уведомление (на почту, например, и ограничение функциональности) при заходе с "нового" ip-адреса (опция)

Загрузку видео + плеер
http://videojs.com/

Прочее
====================

В javascript'овом коде используется ES6/ES7 через Babel:
https://github.com/google/traceur-compiler/wiki/LanguageFeatures


В качестве среды разработки используется Sublime Text 3, с плагинами

https://github.com/babel/babel-sublime


Чтобы Sublime Text 3 не искал в ненужных папках во время Find in Files,
можно использовать такой "Where": <open folders>,-node_modules/*,-frontend/build/*


Для общей сборки и для запуска процесса разработки сейчас используется Gulp, но вообще он мало кому нравится, и мб его можно убрать из цепи разработки.


Для сборки клиентской части проекта используется WebPack

https://www.youtube.com/watch?v=VkTCL6Nqm6Y

http://habrahabr.ru/post/245991/


Webpack development server по умолчанию принимает все запросы на себя, 
но некоторые из них может "проксировать" на Node.js сервер, например.
Для этого требуется указать шаблоны Url'ов, которые нужно "проксировать",
в файле webpack/development server.js, в параметре proxy запуска webpack-dev-server'а.


Для "профайлинга" сборки проекта Webpack'ом можно использовать Webpack Analyse Tool
http://stackoverflow.com/questions/32923085/how-to-optimize-webpacks-build-time-using-prefetchplugin-analyse-tool


На Windows при запуске в develpoment mode Webpack вызывает событие изменения файлов,
когда делает их require() в первый раз, поэтому nodemon глючит и начинает много раз
перезапускаться.

Ещё, на Windows у nodemon'а, который запускается параллельно в нескольких экземплярах, может быть ошибка "EPERM: operation not permitted", которая не исправляется:
https://github.com/remy/nodemon/issues/709


При сборке каждого chunk'а к имени фала добавляется хеш.

Таким образом обходится кеширование браузера (с исчезающе малой вероятностью "коллизии" хешей).

Нужные url'ы подставляются в index.html плагином HtmlWebpackPlugin.


При запуске через npm run dev работает hot reload для компонентов React, 
а также для Redux'а (например, для action response handlers)


Вместо LESS и CSS в "компонентах" React'а используются inline стили.

Можно также использовать Radium, если понадобится

https://github.com/FormidableLabs/radium


Для подгрузки "глобального" стиля используется модуль Webpack'а style-loader,
и поэтому при запуске в режиме разработчика при обновлении страницы присутствует 
как бы "мигание" протяжённостью в секунду: это время от загрузки Html разметки до
отработки javascript'а style-loader'а, который динамически создаёт элемент <style/>
с "глобальными" стилями (преимущество: работает hot reload для "глобальных" стилей)


В качестве реализации Flux'а используется Redux:

https://github.com/gaearon/redux


Подключен react-hot-loader

http://gaearon.github.io/react-hot-loader/


Для подключения модулей из bower'а, по идее, достаточно раскомментировать два помеченных места в webpack.coffee.

Альтернативно, есть плагин:

https://github.com/lpiepiora/bower-webpack-plugin


Для кеширования Html5 через manifest можно будет посмотреть плагин AppCachePlugin


// Небольшой мониторинг есть по адресу http://localhost:5959/

// (npm модуль look) (не компилируется на новой Node.js, поэтому выключен)


React Context

http://jaysoo.ca/2015/06/09/react-contexts-and-dependency-injection/


Если возникает такая ошибка в клиентском коде:

"Module parse failed: G:\work\webapp\code\common\log levels.js Line 1: Unexpected token
 You may need an appropriate loader to handle this file type."

то это означает, что данный файл не подключен в webpack.config.js к babel-loader


Redis для Windows по умолчанию съедает сразу около 40-ка ГигаБайтов места.

Чтобы исправить это, нужно поправить файлы redis.windows.conf и redis.windows-service.conf:

maxmemory 1gb

(править файлы в Program Files не получится, их можно править, скопировав в другое место и потом перезаписав обратно поверх)


Для того, чтобы git не отслеживал файл с переводом `en.json`, нужно выполнить такую команду:

```
git update-index --assume-unchanged frontend/code/international/translations/messages/en.json
```