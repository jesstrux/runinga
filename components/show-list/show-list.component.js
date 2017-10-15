angular
  .module('runinga')
  .component('showList', {
    bindings: {
      listLoading: '=',
      shows: '<',
      filter: '<',
      onViewShow: '&',
      fetchMoreShows: '&',
      fetch: '='
    },
    templateUrl: "components/show-list/show-list.html",
    controller: ShowList
  });

function ShowList() {
  var self = this;
  this.titleMap = {
    'popular' : 'Most popular shows',
    'all' : 'All Shows',
    'latest' : 'Shows from recent years',
    'continuing' : 'Shows not cancelled/ended'
  }
}

ShowList.prototype = {
  $onInit: function() {
    
  },

  $onChanges: function(changes) {
    if(changes.filter)
      this.filterShows();
    else if(changes.shows)
      this.filtered_shows = this.shows;
  },

  filterShows: function(){
    var all_shows = this.shows;

    if(!this.filter || this.filter == "all")
      this.filtered_shows = all_shows;
    else{
      if(!all_shows || !all_shows.length)
        return;

      switch(this.filter){
        case 'popular':
          this.filtered_shows = all_shows.filter(e => e.popular).sort( (a, b) => b.weight - a.weight);
          break;
        case 'latest' : 
          this.filtered_shows =  all_shows.filter(e => e.age < 5).sort( (a, b) => a.age - b.age);;
          break;
        case 'continuing' : 
          this.filtered_shows =  all_shows.filter(e => e.continuing);
          break;
        default:
          this.filtered_shows = all_shows;
      }
      // self.scope.$apply();
    }
  }
}