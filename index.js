module.exports = {
  nodes: [
    {
      routing: {
        endpoint: 'file:dist/nodes/Twitter/TwitterMediaUpload.node.js',
        className: 'Twitter',
      },
    },
  ],
  credentials: [
    {
      routing: {
        endpoint: 'file:dist/credentials/TwitterApi.credentials.js',
        className: 'TwitterApi',
      },
    },
  ],
};
