# хеширование паролей методом Blowfish
# http://ru.wikipedia.org/wiki/Blowfish

# соль встроена в Bcrypt, поэтому при проверке она не требуется

# (единственный недостаток - при проверке пароля, он хешируется не мгновенно 
#  (0.4 секунды на моей машине), 
#  и на это время процесс node.js "подвисает")
# (то же самое имеет место при регистрации пользователя)
# (для сравнения: md5 хешируется за пару миллисекунд)

# bcrypt = require './other/Bcrypt'

# exports.blowfish = 
#   hash: (value, salt) -> bcrypt.hashpw(value, salt)
#   check: (value, hash) -> 
#     try
#       bcrypt.checkpw(value, hash)
#       return yes
#     catch error
#       return no
#   salt: -> bcrypt.gensalt()

# хеширование паролей методом MD5 (md5 теперь считают ненадёжным и призывают отказаться от него)

crypto = require 'crypto'

# соли:
# http://ru.wikipedia.org/wiki/%D0%A1%D0%BE%D0%BB%D1%8C_(%D0%BA%D1%80%D0%B8%D0%BF%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%8F)

# 16 bytes
exports.md5 = 
  hash: (value, salt) ->
    original = crypto.createHash('md5')
    original.update(value)
    hash = original.digest('hex')

    salty = crypto.createHash('md5')
    salty.update(hash)
    salty.update(salt)
    return salty.digest('hex')
  check: (value, hash, salt) -> @hash(value, salt) == hash
  salt: -> String(Math.random()).substring(2)