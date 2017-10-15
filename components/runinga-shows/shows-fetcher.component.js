// TODOS
// Fetch show info and rating(IMDB)
// Cache schedules to json files
// Cache show info, posters and ratings

angular
  .module('runinga')
  .component('showsFetcher', {
    bindings: {
      loading: '=',
      shows: '=',
      filter: '<',
      query: '<',
      fetch: '<',
      onAppendComplete: '&'
    },
    controller: ShowsFetcher
  });
  
  ShowsFetcher.$inject = ['ShowService', '$scope', '$timeout'];

function ShowsFetcher(showService, $scope, $timeout) {
  this.showService = showService;
  this.scope = $scope;
  this.timeout = $timeout;
  var self = this;
  // this.diff = 52.33; //93.6px
}

ShowsFetcher.prototype = {
  $onInit: function() {
    this.fetchShows();
    this.page = 1;
  },

  $onChanges: function(changes) {
      if(changes.query){
        if(this.query && this.query.length)
          this.searchShows();
        else
          this.fetchShows();
      }
      else if(changes.fetch){
        if(changes.fetch.currentValue){
          this.fetchPage();
        }
      }
  },

  fetchShows: function(){
    console.log("Fetching shows.....");
    var self = this;
    this.listLoading = true;
    this.shows = [];
    this.showService.fetchShowsOnline()
      .then(function(data){
        self.shows = data;
        self.listLoading = false;
        // console.log("Shows fetched!");
        // console.log(data);
      })
      .catch(function(er){
        console.log("Show fetch failed!");
        console.log(er);
        self.listLoading = false;
      });
  },

  searchShows: function(){
    this.shows = [];
    var self = this;
    self.listLoading = true;

    this.showService.searchShows(this.query)
      .then(function(data){
        self.timeout(function() {
          self.shows = data;
          self.listLoading = false;
        }, 0);
        // self.scope.$apply();
        // console.log(data);
      })
      .catch(function(er){
        console.log(er);
        self.listLoading = false;
      });
  },

  fetchPage: function(){
    this.page++;

    // console.log("Fetching shows on new page:" + this.page + "\n\n");
    var self = this;
    var shows = this.shows;
    this.showService.fetchShowsOnline(this.page)
      .then(function(data){
        console.log("Shows from new page!");
        for (var i=0; i<data.length; i++){
            self.shows.push(data[i]);
        }

        self.timeout(function() {
          self.onAppendComplete();
        }, 500);
      })
      .catch(function(er){
        console.log("Fetching failed");
        self.page = self.page - 1;
        self.listLoading = false;
        self.onAppendComplete();
      });
  },
}