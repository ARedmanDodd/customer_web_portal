const keys = {
    debug: true,
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
        user: 'webapi',
        password: '5t0k3C!TY',
        server: '10.10.1.15',
        database: 'vixen_live'
    },
    causeway: {
        username: 'webapi@doddgroup.com',
        password: 'HawkTags!764!'
    },
    google: {
        map: 'AIzaSyDkWYNbJG8RPVlyWYhc3aCARhCxALu4pn4',
        refreshRate: 30000//ms
    },
    sms:{
        from: 'DoddGroup',
        apiKey: 'BC15FD87-A102-360D-A187-E83405B9FF0C',
        username: 'doddwebapi'
    }
}

module.exports = keys;