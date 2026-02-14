const bcrypt = require('bcryptjs');
module.exports.hash = async (pwd) => bcrypt.hash(pwd, 10);
module.exports.compare = async (pwd, hash) => bcrypt.compare(pwd, hash);
