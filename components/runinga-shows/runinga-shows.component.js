angular
  .module('runinga')
  .component('runingaShows', {
    bindings: {
      visible: '<'
    },
    templateUrl: "components/runinga-shows/runinga-shows.html",
    controller: RuningaShows
  });

function RuningaShows() {
  var self = this;
}

RuningaShows.prototype = {
  $onInit: function() {
    var self = this;
  },

  $onChanges: function(changes) {
    
  },

  fetchMoreShows: function(){
    if(!this.loading){
      this.fetch = true;
      console.log("Prompt fetch!");
    }
  },

  viewShow: function(show){
    ipcRenderer.send('open-show-details', {show: show, fetch: false});
  }
}