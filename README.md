Cinema is a workspace for video production.

Киностудия - это рабочая среда, предоставляющая инструменты для совместной работы в области кинопроизводства.

Установка
==========

npm install

// sudo npm instal --global pm2

Запуск (development)
=====================

npm run dev

Далее зайти на:

http://localhost:3000

(страница будет сама обновляться при изменении исходных кодов)

Запуск (production)
=====================

Построить проект webpack'ом и запустить web сервер:

npm run production

Далее зайти на:

http://localhost:3000

Запуск демоном (production, пока ещё не сделано)
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

pm2 logs cinema

Возможна кластеризация, безостановочное самообновление и т.п.

Сделать
====================

api выделить в отдельную папку

изоморфность вынести в отдельный модуль

preload вызывается для всей цепочки (Layout, About)

сделать страницу login_success и добавить её в routes

(мб) login_success чтобы перенаправляла на ту страницу, с которой входили

хешировать пароль на сервере в auth

сабмит формы, чтобы она сохраняла в оперативку на сервере, и обновляла store на клиенте
(+ чтобы работала при обновлении страницы)

почему webpack два раза билдит

попробовать сделать npm run production на чистом build (без stats)

не запускать web сервер до того, как появится файл webpack-stats.json

api вынести в отдельную папку api в code

мб статику держать не по пути client, а прямо так

https://www.google.com/design/icons/

Убрать из api client понятие о сервере

Отрефакторить весь код

api client порефакторить

Запускать web сервер в dev только после того, как webpack-dev-server запустился

сделать showcase с drag n drop

https://github.com/gaearon/react-dnd

nodemon не watch'ит новые файлы

Долго запускается webpack dev server: слушает сразу, но stats выводятся только потом

Долго рестартует web сервер после изменений - мб улучшить это как-то

Добавить аутентикацию и пользователя

Мб упразднить папку flux в пути

Обновить Json Rpc и api согласно последним изменениям в pussy

// Посмотреть потом, что скажет react-router-proxy-loader про react-router 1.0.0
// Поддерживает ли react-router 1.0.0 постепенную загрузку dependencies

В react-router сделать модульность (постепенную загрузку dependencies)

https://github.com/rackt/react-router/blob/master/examples/huge-apps/app.js

// Мб перейти с bluebird на обычные Promises
// Пока bluebird лучше:
// http://programmers.stackexchange.com/questions/278778/why-are-native-es6-promises-slower-and-more-memory-intensive-than-bluebird

Сделать сборку и проверить, что она работает

Мб использовать это:

https://github.com/obscene/Obscene-Layout

Прикрутить перевод на языки: react-intl

Скрипты установки сразу писать на Ansible

NginX

https://github.com/acdlite/redux-react-router

GraphQL, когда он выйдет в релиз

https://medium.com/@clayallsopp/your-first-graphql-server-3c766ab4f0a2


Рендеринг React'а вместе с React-router'ом и Redux'ом взят отсюда
(будет обновляться после 13.08.2015 - мержить к себе новые изменения):

https://github.com/erikras/react-redux-universal-hot-example/commits/master

Разделить проект на ядро и чисто кастомный код (actions, stores, pages, components)

Прочее
====================

В javascript'овом коде используется ES6/ES7 через Babel:
https://github.com/google/traceur-compiler/wiki/LanguageFeatures


В качестве среды разработки используется Sublime Text 3, с плагинами

https://github.com/babel/babel-sublime


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


Небольшой мониторинг есть по адресу http://localhost:5959/

(npm модуль look)


В качестве слоя данных используется как Json-Rpc, так и Relay и GraphQL (когда он выйдет)

https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html
http://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html
https://gist.github.com/wincent/598fa75e22bdfa44cf47


React Context

http://jaysoo.ca/2015/06/09/react-contexts-and-dependency-injection/