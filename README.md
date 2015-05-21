Cinema is a bug tracker for video production.

Киностудия - это рабочая среда, предоставляющая инструменты для совместной работы в области кинопроизводства.

Установка
==========

bower install

npm install

sudo npm install --global bunyan

sudo npm install --global nodemon

sudo npm instal --global pm2

Запуск (development)
=====================

gulp

Далее зайти на:

http://localhost:3001/webpack-dev-server/

(страница будет сама обновляться при изменении исходных кодов)

Запуск (production)
====================

Будет реализован через pm2

Сделать
====================

Почитать, что такое Relay (и GraphQL) и нужен ли он:
https://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html

Сделать Flux

Сделать какую-нибудь систему перевода на языки

мб: повесить watch-er в gulp'е на папку translation, чтобы он там файлы из .coffee
переводил в ./build/client/translation/*.json

Скрипты установки сразу писать на Ansible

NginX

Отрендерить React на сервере
https://github.com/irvinebroque/isomorphic-hot-loader

мб: слать api по websocket'у

Прочее
====================

Для сборки проекта используется WebPack
http://habrahabr.ru/post/245991/

При сборке каждого chunk'а к имени фала добавляется хеш.
Таким образом обходится кеширование браузера (с исчезающе малой вероятностью "коллизии" хешей).
Нужные url'ы подставляются в index.html плагином HtmlWebpackPlugin.

Вместо LESS и CSS в "компонентах" React'а используется Radium
https://github.com/FormidableLabs/radium

Подключен react-hot-loader
http://gaearon.github.io/react-hot-loader/

Для подключения модулей из bower'а, по идее, достаточно раскомментировать два помеченных места в webpack.coffee.
Альтернативно, есть плагин:
https://github.com/lpiepiora/bower-webpack-plugin

Для кеширования Html5 через manifest можно будет посмотреть плагин AppCachePlugin
