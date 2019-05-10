const querystring = require('querystring');
const request = require('request');
const keys = require('../keys');




// Auth Token
function auth() {
    let form = {
        grant_type: 'password',
        username: keys.causeway.username,
        password: keys.causeway.password
    };

    var formData = querystring.stringify(form);
    request({
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: 'https://telematics.causeway.com/auth/oauth/token',
        body: formData,
        method: 'POST'
    }, (err, response, body) => {
        if (err) {
            throw new Error(err);
        }
        body = JSON.parse(body)
        return body.access_token;
    });
}


// Main API
let CausewayAPI = function () {
    if (!(this instanceof CausewayAPI)) return new CausewayAPI();
};

CausewayAPI.prototype.getVehicleData = async function () {

    let form = {
        grant_type: 'password',
        username: keys.causeway.username,
        password: keys.causeway.password
    };

    var formData = querystring.stringify(form);
    request({
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: 'https://telematics.causeway.com/auth/oauth/token',
        body: formData,
        method: 'POST'
    }, (err, response, body) => {
        if (err) {
            console.log(err);
        }
        let body = body;
        body = JSON.parse(body);

        request({
            uri: 'https://telematics.causeway.com/data/api/latestinstances/assetsandposition',
            auth: {
                'bearer': body.access_token
            },
            method: 'GET',
        }, (err, request, body) => {
            if(err) console.log(err);
            return JSON.parse(body);
        })
    });
};


module.exports = CausewayAPI();