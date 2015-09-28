var defaultSettings = {
    launchStartup: false,
    connectLaunch: false,
    saveCredentials: false,
    minToTaskbar: true
};

module.exports = {
  settings: function (item) {
    var haveDefault = null;
    if (defaultSettings[item]) {
        haveDefault = defaultSettings[item];
    }
    if(localStorage.getItem('settings.'+item) === 'true' || 'false')
      return (localStorage.getItem('settings.'+item) === 'true') ? true : false || haveDefault;
    else
      return localStorage.getItem('settings.'+item) || haveDefault;
  },
  saveSettings: function (key, value) {
    log.info('Settings | ' + key + ' = ' + value);
    localStorage.setItem('settings.'+key, value);
  }
};
