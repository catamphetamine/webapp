Cinema is a bug tracker for video production.

Киностудия - это рабочая среда, предоставляющая инструменты для совместной работы в области кинопроизводства.

Установка
==========

bower install

npm install

sudo npm install --global babel

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

Посмотреть потом, что скажет react-router-proxy-loader про react-router 1.0.0
Поддерживает ли react-router 1.0.0 постепенную загрузку dependencies

// Мб перейти с bluebird на обычные Promises
// Пока bluebird лучше:
// http://programmers.stackexchange.com/questions/278778/why-are-native-es6-promises-slower-and-more-memory-intensive-than-bluebird

Обновить React-router

Сделать Server Side Rendering

Сделать сборку и проверить, что она работает

Сделать страницу "не найдено"

Сейчас при изменении серверного кода nodemon засекает это не сразу.
Мб как-нибудь сделать так, чтобы он сразу засекал и перезапускался.
(или использовать не nodemon)

Мб использовать это:

https://github.com/obscene/Obscene-Layout

Сделать какую-нибудь систему перевода на языки

мб: повесить watch-er в gulp'е на папку translation, чтобы он там файлы из .coffee

переводил в ./build/client/translation/*.json

Скрипты установки сразу писать на Ansible

NginX

https://github.com/irvinebroque/isomorphic-hot-loader

Прочее
====================

В javascript'овом коде используется ES6/ES7 через Babel:
https://github.com/google/traceur-compiler/wiki/LanguageFeatures


В качестве среды разработки используется Sublime Text 3, с плагинами

https://github.com/babel/babel-sublime


Для сборки проекта используется WebPack

https://www.youtube.com/watch?v=VkTCL6Nqm6Y

http://habrahabr.ru/post/245991/


Webpack development server по умолчанию принимает все запросы на себя, 
но некоторые из них может "проксировать" на Node.js сервер, например.
Для этого требуется указать шаблоны Url'ов, которые нужно "проксировать",
в файле gulpfile.babel.js, в параметре proxy запуска webpack-dev-server'а.


При сборке каждого chunk'а к имени фала добавляется хеш.

Таким образом обходится кеширование браузера (с исчезающе малой вероятностью "коллизии" хешей).

Нужные url'ы подставляются в index.html плагином HtmlWebpackPlugin.


Вместо LESS и CSS в "компонентах" React'а используется Radium

https://github.com/FormidableLabs/radium


Подключен react-hot-loader

http://gaearon.github.io/react-hot-loader/

Я отключил react-hot-loader, потому что что-то он какой-то неподходящий, не обновляет страницу и т.п.

Для включения react-hot-loader обратно:

В gulp.coffee раскомментировать флаг hot: yes

В webpack.coffee раскомментировать строки в application : [...]

В webpack.coffee добавить 'react-hot' в .react и .react.page

В webpack.coffee раскомментировать new webpack.HotModuleReplacementPlugin()


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