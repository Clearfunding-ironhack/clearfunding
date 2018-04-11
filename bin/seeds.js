require('dotenv').config();

const latch = require('latch-sdk');

latch.init({ appId: process.env.LATCH_APP_ID, secretKey: process.env.LATCH_SECRET_KEY});

latch.unpair(process.env.USER_ID, function() {
    console.log("OK");
});