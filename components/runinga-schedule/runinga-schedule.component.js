angular
  .module('runinga')
  .component('runingaSchedule', {
    bindings: {

    },
    templateUrl: "components/runinga-schedule/runinga-schedule.html",
    controller: RuningaSchedule
  });

RuningaSchedule.$inject = ['ShowService', 'Favorites', '$rootScope'];

function RuningaSchedule(ShowService, Favorites, $rootScope) {
  var self = this;
  this.showService = ShowService;
  this.favService = Favorites;
  this.rootScope = $rootScope;
}

RuningaSchedule.prototype = {
  $onInit: function() {
    var self = this;
    ipcRenderer.on('date-picked', (event, date) => {
      self.rootScope.$broadcast('date-picked', date);
    });
  },

  $onChanges: function() {
    
  },

  viewShow: function(show){
    ipcRenderer.send('open-show-details', {show: show, fetch: true});
  },

  showDatePicker: function(){
    ipcRenderer.send('pick-date');
  },

  reFetchSchedule: function(){
    this.rootScope.$broadcast('refetch-schedule');
  }
}