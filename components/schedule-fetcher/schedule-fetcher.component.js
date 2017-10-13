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
      schedule: '='
    },
    controller: ScheduleFetcher
  });
  
  ScheduleFetcher.$inject = ['Muse'];

function ScheduleFetcher(Muse) {
  this.muse = Muse;
  var self = this;
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
      });
  }
}