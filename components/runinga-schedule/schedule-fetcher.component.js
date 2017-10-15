// TODOS
// Fetch show info and rating(IMDB)
// Cache schedules to json files
// Cache show info, posters and ratings

angular
  .module('runinga')
  .component('scheduleFetcher', {
    bindings: {
      date: '<',
      loading: '=',
      schedule: '=',
      error: '='
    },
    controller: ScheduleFetcher
  });
  
  ScheduleFetcher.$inject = ['Muse', '$rootScope'];

function ScheduleFetcher(Muse, $rootScope) {
  this.muse = Muse;
  var self = this;
  self.rootScope = $rootScope;

  self.rootScope.$on('refetch-schedule', function(){
    console.log("Refetching schedule!!");
    self.fetchSchedule();
  });
}

ScheduleFetcher.prototype = {
  $onInit: function() {
  },

  $onChanges: function(changes) {
    if(changes.date && changes.date.currentValue)
      this.fetchSchedule();
  },

  fetchSchedule(){
    var self = this;
    self.schedule = {
      date : this.date,
      shows : []
    };
    this.loading = true;
    self.error = false;

    this.muse.getSchedule(this.date)
      .then(function(data){
        self.schedule = {
          date : this.date,
          shows : data
        };

        self.loading = false;
      })
      .catch(function(er){
        console.log(er);
        self.loading = false;
        self.error = true;

        window.addEventListener('online',  function(){
          if(self.error){
            console.log("Network returned, retrying!!");
            self.loading = true;
            self.fetchSchedule();
          }
        })
      });
  }
}