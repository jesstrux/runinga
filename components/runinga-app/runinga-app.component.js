const remote = require('electron').remote;
const main = remote.require('./main.js');
// var detailWindow;
// detailWindow

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

  viewShow: function(show){
    // alert("View show: " + show.name);
    main.openShowDetails(show);
  },

  minimizeApp : function(){
      require('electron').remote.getCurrentWindow().minimize();
  },

  closeApp : function(){
      require('electron').remote.getCurrentWindow().close();
  }
}