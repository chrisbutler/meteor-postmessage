Package.describe({
  name: 'chrisbutler:postmessage',
  summary: 'Simple and easy frame cross-domain Iframe and window communication through Web Messaging API',
  version: '1.0.0',
  git: 'https://github.com/chrisbutler/meteor-postmessage'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.2.1');
  api.addFiles('meteor-postmessage.js', ['client']);
});
