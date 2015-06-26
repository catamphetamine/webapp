Cinema is a bug tracker for video production.

Киностудия - это рабочая среда, предоставляющая инструменты для совместной работы в области кинопроизводства.

Установка
==========

bower install

npm install

sudo npm install --global coffee-script-redux

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

// Мб перейти с bluebird на обычные Promises
// Пока bluebird лучше:
// http://programmers.stackexchange.com/questions/278778/why-are-native-es6-promises-slower-and-more-memory-intensive-than-bluebird

Перейти со старого Json Rpc на новый (переписать проще)

Сделать Server Side Rendering

Мб использовать это:

https://github.com/obscene/Obscene-Layout

Перейти с CoffeeScript-а на Babel в api на client. Хз пока, переписывать ли серверный код.

Почитать, что такое Relay (и GraphQL) и нужен ли он:

https://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html

Сделать какую-нибудь систему перевода на языки

мб: повесить watch-er в gulp'е на папку translation, чтобы он там файлы из .coffee

переводил в ./build/client/translation/*.json

Скрипты установки сразу писать на Ansible

NginX

Отрендерить React на сервере

https://github.com/irvinebroque/isomorphic-hot-loader

мб: перейти на coffeescript redux

Прочее
====================

Было принято решение уходить от CoffeeScript в клиентском коде, так как этот проект затормозился в развитии.

(на оригинальный CoffeeScript его создатель уже давно забил, проект CoffeeScriptRedux тоже пришёл в запустение, и не поддерживает ES6)

Производительность ES6 растёт по сравнению со старым яваскриптом, и на клиенте, особенно мобильном, это важно: быстрота работы, энергосбережение, вот это всё...

Используется ES6 через Babel:
https://github.com/google/traceur-compiler/wiki/LanguageFeatures

А в ES7, ходят слухи, будет (наконец) async/await:
https://github.com/lukehoban/ecmascript-asyncawait


В качестве среды разработки используется Sublime Text 3, с плагинами

https://github.com/babel/babel-sublime


Для сборки проекта используется WebPack

https://www.youtube.com/watch?v=VkTCL6Nqm6Y

http://habrahabr.ru/post/245991/


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