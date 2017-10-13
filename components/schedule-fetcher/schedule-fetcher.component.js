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
    // console.log("Fetching schedule!");

    // Muse.getSchedule("asa", "jailer")
    //   .then(function(data){
    //     console.log("Found schedule");
    //   })
    //   .catch(function(er){
    //     console.log(er);
    //   });
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

    console.log("Fetching schedule!");

    this.muse.getSchedule(this.date)
      .then(function(data){
        console.log("Found schedule");
        console.log(data);
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