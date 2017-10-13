angular
  .module('runinga')
  .component('runingaApp', {
    bindings: {

    },
    templateUrl: "components/runinga-app/runinga-app.html",
    controller: RuningaApp
  });

function RuningaApp($rootScope) {
  var self = this;
}

RuningaApp.prototype = {
  $onInit: function() {
    
  },

  $onChanges: function() {
    
  },

  minimizeApp : function(){
      require('electron').remote.getCurrentWindow().minimize();
  },

  closeApp : function(){
      require('electron').remote.getCurrentWindow().close();
  }
}