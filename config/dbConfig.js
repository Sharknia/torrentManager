var personalData = require('./personalData');

module.exports = (function () {
    return {
        host : 'localhost',
        user : personalData.mysql.id, //mysql id
        password : personalData.mysql.password,   //mysql password
        database : personalData.mysql.database   //mysql db name
    };
})();