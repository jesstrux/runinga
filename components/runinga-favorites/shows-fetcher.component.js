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
  
  ShowsFetcher.$inject = ['Favorites'];

function ShowsFetcher(Favorites) {
  this.favs = Favorites;
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

    this.favs.getFavorites()
      .then(function(data){
        self.shows = data;
        self.listLoading = false;
        console.log(data);
      })
      .catch(function(er){
        console.log(er);
        self.listLoading = false;
      });
  }
}