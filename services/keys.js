const keys = {
    database: {
        "uri": "mongodb://localhost:27017/clientPortal"
    },
    app: {
        "port": 80,
        "secret": '3RgLm0QDltplsztU',
        "sessionKeys": '033CPyM5yf',
        "cookieAge": 1000 * 60 * 60 * 24 * 14,
        "host": 'localhost'
    },
    messages: {
        "dbError": 'An error occured. Please try again.. If this continues, please contact support.'
    },
    sql: {
        user: 'doddtelf\\administrator',
        password: 'mercury',
        server: '10.10.1.15',
        database: 'vixen_live',
        options: {
            encrypt: true
        }
    },
    causeway: {
        username: 'webapi@doddgroup.com',
        password: 'HawkTags!764!'
    }
}

module.exports = keys;