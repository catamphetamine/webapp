WebApp is an example of a generic web application with React and Flux.

Features

* React
* React-router
* Redux as Flux
* Isomorphic (universal) rendering
* Responsive design
* Webpack
* Koa
* Internationalization with React-intl (v2)
* Translated messages hot reload (aka Hot Module Replacement)
* Microservice architecture
* Bunyan logging (log file rotation is built-in)
* Correctly handles Http Cookies on server-side
* To be done: Authentication
* To be done: GraphQL + Relay
* To be done: Persistence (PostgreSQL, Bookshelf)
* To be done: native Node.js clustering
* // maybe: Protection against Cross Site Request Forgery attacks

Quick Start
===========

* `npm install`
* `npm run dev`
* wait for it to finish (it will say "Now go to http://127.0.0.1:3000" in the end)
* go to `http://localhost:3000`
* interact with the development version of the web application
* `Ctrl + C`
* `npm run production`
* wait a bit for Webpack to finish the build (green stats will appear in the terminal, plus some `node.js` server running commands)
* go to `http://localhost:3000`
* interact with the production version of the web application

Installation
==========

npm install

Optionally you may want to install ImageMagic for image upload to work

https://github.com/elad/node-imagemagick-native#installation-windows

http://www.imagemagick.org/script/binary-releases.php

Optionally you may want to install Redis (can be used for user session storage instead of memory storage)

https://github.com/MSOpenTech/redis/releases

Optionally you may want to install MongoDB (can be used to store logs)

// sudo npm instal --global pm2

Running (development)
=====================

(If you have Redis and ImageMagic installed, you may want to set `demo: false` flag in your `configuration.js`)

npm run dev

(nodemon has a bug when starting several nodemon processes in parallel fails; if this command fails - try to run it several times; eventually it will work)

After it finishes loading go to:

http://localhost:3000

(the web page will refresh automatically when you save your changes)

Running (production)
=====================

(If you have Redis and ImageMagic installed, you may want to set `demo: false` flag in your `configuration.js`)

Build the project with Webpack and run the web server:

npm run production

Next go to:

http://localhost:3000

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

When switching to TLS all cookies should be reset ({ secure: true } option will be set on them automatically upon Https detection).

Architecture
============

To be described

Сделать
====================

возвращать статус 404 из Page_not_found (react-isomorphic-render)
если 401, то тоже можно что-то типа Unauthenticated
если 403, то тоже можно что-то типа Unauthorized




сделать страницы status 500 (как web server, так и page server) и 503, 401, 403, 404 (статика)




в web server connections можно считать как server.getConnections(callback), а не ++

Callback should take two arguments err and count.

server.close([callback])

Stops the server from accepting new connections and keeps existing connections. 

The optional callback will be called once the 'close' event occurs. Unlike that event, it will be called with an Error as its only argument if the server was not open when it was closed.




при переключении языка - записывать язык в данные пользователя в бд, чтобы потом знать, на каком языке ему слать письма.





online статус - в Редисе держать что-то типа user:online:id = date, наверное, с TTL = 15 минут




имя пользователя - dropdown с пунктами "Профиль", "Уведомления", "Выйти"

если клик на имени пользователя при наличии <Badge/> - переход сразу в "Уведомления".

сделать компонент <Badge/> (взять из тех двух библиотек)





мобильное меню сделать с поддержкой pan на touchdown, как в materialize css





authentication-service посадить на mongodb (если она есть в configuration.js)







способ находить все сессии для данного user.id: lua скрипт, который идёт по всем ключам user:session, и смотрит, равен ли session.user.id нужному user.id

аналогично считается количество пользователей online, количество гостей online

у пользователя сделать статус (online / offline, "был в сети тогда-то...")

online = 15 минут простоя







вести таблицу активности: последнее время активности пользователя с некоторой сессией


на странице мониторинга - количество зареганных пользователей + график, количество сессий + график


писать в лог файл все http запросы на web server, чтобы потом если что смотреть, какие дыры нашли




на личной странице пользователя ему одному сделать список IP, для которых есть remember me (мб страны, города), и когда была последняя активность по этим remember me. возможность разлогинивать сессии (уничтожение remember me из базы данных + вызов sign_out для сессии каким-то образом). отображать список текущих сессий (ip, города, страны) и время recent activity










file-server -> storage-server 







при загрузке картинок:

jpg - ресайзы делать: 300x300, 600x600, 1000x1000, 1500x1500, 2100x2100, 2800x2800, 3600x3600, 4500x4500

если размер картинки меньше 1.1 * размер ресайза, то не делать ресайз

png - ресайзы как для jpg
svg - без ресайза

сделать ограничение на размер картинки - мегабайтов 10.

возможность добавлять картинку по url'у

имя ресайза: id@widthxheight.type

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









написать метод для api, проверяющий наличие аутентикации, и производящий её, если есть remember me cookie, и выдающий ошибку, если аутентикация по remember me не удалась






страницы пользователя: profile + history, feedback






Напоминания взять отсюда

http://materializecss.com/dialogs.html

(в showcase)





Увеличение фотографий

http://materializecss.com/media.html

(в showcase)











endless scroll в логах: выгрузка тех страниц, которые выходят за предел "показывать страниц", + url нормальный (с какой страницы показывать до + "показывать страниц")

на странице логов - фильтр по error, warning, info и т.п.

из log server - писать в MongoDB (опционально)

https://github.com/mafintosh/mongojs

на клиенте сделать log, посылающий всё в консоль, и заменить все console.log на log.info и console.error на log.error






сделать пользователей (регистрация + вход)

защитить логи на доступ только админу (раздел + на web server proxy делать только для админов)





сделать application settings get (языки (считывать имена файлов из папки), путь к картинкам) - в начале, перед показом страницы

языки оттуда подставлять в locale switcher

путь к картинкам подставлять из settings на странице пользователей





image server -> file upload server

image server: imagemagick

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







async await









при вошедшем пользователе - проверить, что генерится страница нормально (то есть как бы работает вход на сервере при запросе страницы, даже если нету сессии, но есть "remember me")

remember me - хранить в базе данных, вместе с полем user_id

если происходит новый логин - добавлять новый remember me в базу (проверять по нескольким совпадение можно)

по каждой remember me писать дату последней активности




login_success чтобы перенаправляла на ту страницу, с которой входили





upload только при вошедшем пользователе (и ресайз тоже, и api тоже (не все методы - логин, например, публичен должен быть, и пинг, и настройки))






в showcase в форму добавить загрузку файла
отсылать её по API на сервер
+ валидацию формы сделать (вводимых значений, с inline ошибками)





перевести title страниц





showcase: сабмит формы, чтобы она сохраняла в оперативку на сервере, и обновляла store на клиенте
(+ чтобы работала при обновлении страницы)

showcase form чтобы имел кнопку с валидацией и записью на сервере в оперативку, и получал бы с сервера





можно упаковывать каждый сервис в docker и как-то запускать это на Windows







в button.js сделать автопрефиксы

сделать перепосылку сообщений (с ID) при неполучении подтверждения

соединяться с log server, пока он не запустится (если отвалится, то пересоединяться)

вместо флага demo - entry в конфиге на redis, mongo, imagemagick
(если нету чего-то - выдавать баннер в логах с флагом warning)

вычленить dropdown, menu, menu-button в react-responsive-ui
зарелизить react-responsive-ui, с react и react-router - peerDependencies

сделать диалоговое окошко (и зарелизить в react-responsive-ui)

showcase элементов: dropdown, modal, ...

если нету imagemagick'а, то просто возвращать нересайженную картинку (npm run demo)

rotating log per worker

monitoring server, который будет принимать статистику по udp и писать в память или MongoDB

// мб в будущем: логи слать по ssl

// мб в будущем сделать можно загрузку более специфичного 'intl/locale-data/jsonp/ru-...'

мониторинг: image server (status, uptime, размер папки со временными файлами) и другие

сервер мониторинга с хранением в бд (пока в оперативе)

графики на d3

в меню сделать пункт Мониторинг

сделать возможность горячей замены image server'а (и других, (у web server'а хранить сессии в редисе для этого можно (если он установлен)))

// во время загрузки картинки - показывать выбранную картинку, уменьшенную, в обозревателе
(либо прямо через src, либо предварительно уменьшив), и тикать, как установка приложения в AppStore, пока не загрузится на сервер

// мб перейти на imagemagick-native, когда будет исправлен build
// https://github.com/elad/node-imagemagick-native/issues
// + потестить ресайз аватаров: чтобы выравнивало по центру как по ширине, так и по высоте

// можно сделать проверку на установленность image magic (необязательно)

сделать 4 страницы example: ram, database, graphql, graphql + database

чтобы работало без наличия postgresql (чтобы запусклось, и в API выдавало ошибку просто с показом на странице)

http://city41.github.io/bookends/




вставить в production build и в development rendering server run

{
  "plugins": ["react-intl"],
  "extra": {
    "react-intl": {
        "messagesDir": "./build/messages/",
        "enforceDescriptions": true
    }
  }
}


попробовать defineMessages as define_messages
(сработает ли в этом случае Babel plugin)







сделать showcase с drag n drop

https://github.com/gaearon/react-dnd




тикающие relative_time




В react-router сделать модульность (постепенную загрузку dependencies)




update-schema вызывать при изменении схемы Relay (nodemon)




graphiql в development mode

https://github.com/graphql/graphiql

localized routes

locale hot switch

https://github.com/gpbl/react-locale-hot-switch/

preload вызывается для всей цепочки (Layout, About) (автор пишет, что preload сам должен определять, нужно ли ему вызываться - на мой взгляд, не лучшее решение)

https://www.google.com/design/icons/

nodemon не watch'ит новые файлы

Долго рестартует web сервер после изменений - мб улучшить это как-то

// Мб перейти с bluebird на обычные Promises
// Пока bluebird лучше:
// http://programmers.stackexchange.com/questions/278778/why-are-native-es6-promises-slower-and-more-memory-intensive-than-bluebird
// к тому же, в bluebird есть обработчик ошибок по умолчанию; есть .cancel(); есть много разного удобного.

Мб использовать это:

https://github.com/obscene/Obscene-Layout

Скрипты установки сразу писать на чём-нибудь типа fabric мб (если он кроссплатформенный)

NginX

https://github.com/acdlite/redux-react-router


Рендеринг React'а вместе с React-router'ом и Redux'ом взят отсюда
(будет обновляться после 14.01.2016 - мержить к себе новые изменения):

https://github.com/erikras/react-redux-universal-hot-example/commits/master

Разделить проект на ядро (модуль npm) и чисто кастомный код (actions, stores, pages, components)

можно сделать уведомление (на почту, например, и ограничение функциональности) при заходе с "нового" ip-адреса (опция)
ip-адреса можно "запоминать", назначая им имя, если ввести пароль

Загрузку видео + плеер
http://videojs.com/

Прочее
====================

В javascript'овом коде используется ES6/ES7 через Babel:
https://github.com/google/traceur-compiler/wiki/LanguageFeatures


В качестве среды разработки используется Sublime Text 3, с плагинами

https://github.com/babel/babel-sublime


Чтобы Sublime Text 3 не искал в ненужных папках во время Find in Files,
можно использовать такой "Where": <open folders>,-node_modules/*,-build/*


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