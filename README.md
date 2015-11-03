WebApp is an example of a generic web application with React and Flux.

Features

* React
* React-router
* Redux as Flux
* Isomorphic (universal) rendering
* Webpack
* Express / Koa
* Internationalization with React-intl (v2)
* To be done: Authentication
* To be done: GraphQL + Relay
* To be done: Persistence (PostgreSQL, Bookshelf)
* Maybe to be done: Locale switch hot reload (without reloading page)
* Microservice architecture
* Bunyan logging (log file rotation is built-in)
* Protected against Cross Site Request Forgery attacks
* To be done: native Node.js clustering

Quick Start
===========

* `npm install`
* `npm run dev` (nodemon has a bug when starting several nodemon processes in parallel fails; if this command fails - try to run it several times; eventually it will work)
* wait a bit for Webpack to finish the first build (green stats will appear in the terminal)
* go to `http://localhost:3000`
* interact with the development version of the web application
* `Ctrl + C`
* `npm run production`
* wait a bit for Webpack to finish the build (green stats will appear in the terminal)
* go to `http://localhost:3000`
* interact with the production version of the web application

Installation
==========

npm install

Optionally you may want to install ImageMagic for image upload to work

Optionally you may want to install Redis (can be used for user session storage instead of memory storage)

https://github.com/MSOpenTech/redis/releases


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

Images
====================

You'll need to install ImageMagic to make image server work.

https://github.com/elad/node-imagemagick-native#installation-windows

http://www.imagemagick.org/script/binary-releases.php

Сделать
====================

в set_locale в locale switcher - this.context.location.pathname старый остаётся

alert(this.context.location.pathname)

адаптивный дизайн

меню как в appstore

мб обеспечить доступ из компонентов React к переменным style.scss

может быть добавить задержку в запуск nodemon'ов

сделать, чтобы каждый nodemon watch-ил только свой набор файлов

у dropdown сделать scroll при переполнении

нужна ли arrow у dropdown, и либо убрать её из dropdown (+ стили), либо сделать нормально

showcase элементов: dropdown, modal, ...

// после выбора locale - крутилку на весь экран мб (мб не на весь)

соединение tcp устанавливать при создании лога, и дальше просто писать

сделать флаг demo, и проверять его на редисе и imagemagick

взять страницу ошибки из erikras (красную в dev mode)

koa redis session store (optionally)

если нету imagemagick'а, то просто возвращать нересайженную картинку (npm run demo)

rotating log per worker

выделить log server, куда слать логи (мб через node-ipc, мб просто по http, мб thrift или protobuf - можно попробовать)

image server -> file upload server

image server: imagemagick

сделать application settings get (языки, путь к картинкам) - в начале, перед показом страницы

языки оттуда подставлять в locale switcher

путь к картинкам подставлять из settings на странице пользователей

в button.js сделать автопрефиксы

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





// сделать можно загрузку более специфичного 'intl/locale-data/jsonp/ru-...'




при вошедшем пользователе - проверить, что генерится страница нормально (то есть как бы работает вход на сервере при запросе страницы, даже если нету сессии, но есть "remember me")

remember me - хранить в базе данных, вместе с полем user_id

если происходит новый логин - добавлять новый remember me в базу (проверять по нескольким совпадение можно)

по каждой remember me писать дату последней активности






cluster и bunyan

https://github.com/trentm/node-bunyan/issues/117#issuecomment-151124385





upload только при вошедшем пользователе (и ресайз тоже, и api тоже (не все методы - логин, например, публичен должен быть, и пинг, и настройки))

если нет Редиса при запуске - должно работать в любом случае.
можно свой псевдоредис небольшой запустить.






мониторинг: image server (status, uptime, размер папки со временными файлами) и другие

сервер мониторинга с хранением в бд (пока в оперативе)

графики на d3

в меню сделать пункт Мониторинг

сделать возможность горячей замены image server'а (и других, (у web server'а хранить сессии в редисе для этого можно (если он установлен)))

выводить ошибки с бекенда на панель во фронтенде (и логи можно тоже) - пункт меню Logs

в showcase в форму добавить загрузку файла
отсылать её по API на сервер
+ валидацию формы сделать (вводимых значений, с inline ошибками)

// во время загрузки картинки - показывать выбранную картинку, уменьшенную, в обозревателе
(либо прямо через src, либо предварительно уменьшив), и тикать, как установка приложения в AppStore, пока не загрузится на сервер

// мб перейти на imagemagick-native, когда будет исправлен build
// https://github.com/elad/node-imagemagick-native/issues
// + потестить ресайз аватаров: чтобы выравнивало по центру как по ширине, так и по высоте

// можно сделать проверку на установленность image magic (необязательно)

сделать 4 страницы example: ram, database, graphql, graphql + database

чтобы работало без наличия postgresql (чтобы запусклось, и в API выдавало ошибку просто с показом на странице)




"Locale Data as Modules" - подгрузку Intl модулей для языков мб изменить




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




перевести title страниц


перевести в layout title и description


react-intl v2

на сервере класть переводы мб в window.__locale_messages и на клиенте их брать оттуда




FormattedMessage -> message
и т.п.





api client порефакторить



async await


загружать locales в locale switcher с сервера по api, который будет брать, считывая содержимое папки


сабмит формы, чтобы она сохраняла в оперативку на сервере, и обновляла store на клиенте
(+ чтобы работала при обновлении страницы)

showcase form чтобы имел кнопку с валидацией и записью на сервере в оперативку, и получал бы с сервера

мб использовать redux-form

https://github.com/devknoll/relay-nested-routes


Добавить аутентикацию и пользователя

сделать страницу login_success и добавить её в routes

(мб) login_success чтобы перенаправляла на ту страницу, с которой входили




сделать showcase с drag n drop

https://github.com/gaearon/react-dnd




тикающие relative_time




В react-router сделать модульность (постепенную загрузку dependencies)




update-schema вызывать при изменении схемы Relay (nodemon)




graphiql в development mode

https://github.com/graphql/graphiql




когда graphql будет выделен в отдельное, переименовать:
server -> rendering_server




два раза вызывается Layout componentDidMount при использовании Redux DevTools

i18n в webpage_title


проверить, что ошибка на сервере в production покажется как страница ошибки мб (или как-то ещё)
для рендеринга + для api

выводить ошибку нормально, а не Internal Server Error - весь стектрейс, чтобы в консоль не переключаться на просмотр текста ошибки

localized routes

locale hot switch

https://github.com/gpbl/react-locale-hot-switch/

preload вызывается для всей цепочки (Layout, About) (автор пишет, что preload сам должен определять, нужно ли ему вызываться - на мой взгляд, не лучшее решение)

хешировать пароль на сервере в auth

https://www.google.com/design/icons/

nodemon не watch'ит новые файлы

Долго рестартует web сервер после изменений - мб улучшить это как-то

Обновить Json Rpc и api согласно последним изменениям в pussy

// Посмотреть потом, что скажет react-router-proxy-loader про react-router 1.0.0
// Поддерживает ли react-router 1.0.0 постепенную загрузку dependencies

https://github.com/rackt/react-router/blob/master/examples/huge-apps/app.js

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
(будет обновляться после 03.10.2015 - мержить к себе новые изменения):

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
можно использовать такой "Where": -build/*


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