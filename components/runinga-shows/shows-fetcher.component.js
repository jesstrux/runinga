// TODOS
// Fetch show info and rating(IMDB)
// Cache schedules to json files
// Cache show info, posters and ratings

angular
  .module('runinga')
  .component('showsFetcher', {
    bindings: {
      loading: '=',
      shows: '='
    },
    controller: ShowsFetcher
  });
  
  ShowsFetcher.$inject = ['ShowService'];

function ShowsFetcher(showService) {
  this.showService = showService;
  var self = this;
}

ShowsFetcher.prototype = {
  $onInit: function() {
    this.fetchShows();
  },

  $onChanges: function(changes) {
      // if(this.visible){
      //   this.fetchShows();
      // }
  },

  fetchShows(){
    console.log("Fetching shows.....");
    var self = this;
    this.listLoading = true;

    this.showService.fetchShowsOnline()
      .then(function(data){
        self.shows = data;
        self.listLoading = false;
      })
      .catch(function(er){
        console.log(er);
        self.listLoading = false;
      });
  }
}