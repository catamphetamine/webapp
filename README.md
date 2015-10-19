WebApp is an example of a generic web application with React and Flux.

Features

* React
* React-router
* Redux as Flux
* Isomorphic (universal) rendering
* Webpack
* Express / Koa
* Internationalization with React-intl
* To be done: Authentication
* To be done: GraphQL + Relay
* To be done: Persistence (PostgreSQL, Bookshelf)
* Maybe to be done: Locale switch hot reload (without reloading page)

Quick Start
===========

* `npm install`
* `npm run dev`
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

// sudo npm instal --global pm2

Running (development)
=====================

npm run dev

After it finishes loading go to:

http://localhost:3000

(the web page will refresh automatically when you save your changes)

Running (production)
=====================

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

Сделать
====================

user: delete, patch
add user: validation

крутилки на добавление, удаление, переименование, загрузку.

нормально обрабатывать ошибки (например, синтаксические на сервере: свойство error), в том числе Not Found

мб: одинаковую крутилку как в начале, так и в refresh

сделать 4 страницы example: ram, database, graphql, graphql + database

чтобы работало без наличия postgresql (чтобы запусклось, и в API выдавало ошибку просто с показом на странице)




"Locale Data as Modules" - подгрузку Intl модулей для языков мб изменить



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

Мб использовать это:

https://github.com/obscene/Obscene-Layout

Скрипты установки сразу писать на чём-нибудь типа fabric мб (если он кроссплатформенный)

NginX

https://github.com/acdlite/redux-react-router


Рендеринг React'а вместе с React-router'ом и Redux'ом взят отсюда
(будет обновляться после 03.10.2015 - мержить к себе новые изменения):

https://github.com/erikras/react-redux-universal-hot-example/commits/master

Разделить проект на ядро и чисто кастомный код (actions, stores, pages, components)

Прочее
====================

В javascript'овом коде используется ES6/ES7 через Babel:
https://github.com/google/traceur-compiler/wiki/LanguageFeatures


В качестве среды разработки используется Sublime Text 3, с плагинами

https://github.com/babel/babel-sublime


Чтобы Sublime Text 3 не искал в ненужных папках во время Find in Files,
можно использовать такой "Where": -build/*


Для общей сборки и для запуска процесса разработки сейчас используется Gulp, но вообще он мало кому нравится, и мб его можно убрать из цепи разработки.


Для разработки серверного когда используется Nodemon.

Он медленно засекает изменения на винде, и я сделал pull request, решающий это.

https://github.com/remy/nodemon/issues/582

https://github.com/remy/nodemon/issues/555


Для сборки клиентской части проекта используется WebPack

https://www.youtube.com/watch?v=VkTCL6Nqm6Y

http://habrahabr.ru/post/245991/


Webpack development server по умолчанию принимает все запросы на себя, 
но некоторые из них может "проксировать" на Node.js сервер, например.
Для этого требуется указать шаблоны Url'ов, которые нужно "проксировать",
в файле webpack/development server.js, в параметре proxy запуска webpack-dev-server'а.


При сборке каждого chunk'а к имени фала добавляется хеш.

Таким образом обходится кеширование браузера (с исчезающе малой вероятностью "коллизии" хешей).

Нужные url'ы подставляются в index.html плагином HtmlWebpackPlugin.


При запуске через npm run dev работает hot reload для компонентов React, 
а также для Redux'а (например, для action response handlers)


Вместо LESS и CSS в "компонентах" React'а используются inline стили.

Можно также использовать Radium, если понадобится

https://github.com/FormidableLabs/radium


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


В качестве слоя данных используется как Json-Rpc, так и Relay и GraphQL (когда он выйдет)

https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html
http://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html
https://gist.github.com/wincent/598fa75e22bdfa44cf47


React Context

http://jaysoo.ca/2015/06/09/react-contexts-and-dependency-injection/