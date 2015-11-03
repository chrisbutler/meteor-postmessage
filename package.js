Package.describe({
  name: 'chrisbutler:postmessage',
  summary: 'An implementation of the Chromecast CASTV2 protocol',
  version: '1.0.0',
  git: 'https://github.com/chrisbutler/meteor-postmessage'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.2.1');
  api.addFiles('meteor-postmessage.js', ['client']);
});
