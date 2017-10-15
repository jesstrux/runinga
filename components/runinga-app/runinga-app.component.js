const {ipcRenderer} = require('electron');

angular
  .module('runinga')
  .component('runingaApp', {
    bindings: {

    },
    templateUrl: "components/runinga-app/runinga-app.html",
    controller: RuningaApp
  });

RuningaApp.$inject = ['ShowService', 'Favorites', '$rootScope'];

function RuningaApp(ShowService, Favorites, $rootScope) {
  var self = this;
  this.showService = ShowService;
  this.favService = Favorites;
  this.rootScope = $rootScope;
}

RuningaApp.prototype = {
  $onInit: function() {
    var self = this;
    this.page = 0;
    ipcRenderer.on('clear-shows-cache', (event) => {
      this.clearShowsCache();
    });

    ipcRenderer.on('clear-favorites', (event) => {
      this.clearFavorites();
    });

    ipcRenderer.on('prefs-changed', (event, prefs) => {
      self.rootScope.$broadcast('prefs-changed', prefs);
    });
  },

  minimizeApp : function(){
    ipcRenderer.send('manage-window', {win: 'main', action: "minimize"});
  },

  closeApp : function(){
    ipcRenderer.send('manage-window', {win: 'main', action: "close"});
  },

  openSettings: function(){
    ipcRenderer.send('open-settings');
  },

  clearShowsCache: function () {
    this.showService.clearShowsCache([])
    .then(function(){
      ipcRenderer.send('shows-cache-cleared');
    });
  },

  clearFavorites: function () {
    this.favService.setFavorites([])
    .then(function(){
      ipcRenderer.send('favorites-cleared');
    });
  }
}