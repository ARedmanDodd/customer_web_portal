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
    }
}

module.exports = keys;