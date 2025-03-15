"use strict";

const { TwitterMediaUpload } = require('./nodes/Twitter/TwitterMediaUpload.node');
const { TwitterApi } = require('./credentials/TwitterApi.credentials');

module.exports = {
    nodeTypes: [
        TwitterMediaUpload
    ],
    credentialTypes: [
        TwitterApi
    ]
};
