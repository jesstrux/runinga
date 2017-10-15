angular
  .module('runinga')
  .component('showFilters', {
    bindings: {
      filter: '=',
      query: '=',
      searchShows: '&'
    },
    templateUrl: "components/show-filters/show-filters.html",
    controller: ShowFilters
  });

ShowFilters.$inject = ['$scope'];
function ShowFilters($scope) {
  
}

ShowFilters.prototype = {
  $onInit: function() {
    this.filters = ["All", "Popular", "Latest", "Continuing"];
    this.setCurrent(1);
  },

  setCurrent : function(idx){
    this.current = idx;
    this.filter = this.filters[idx].toLowerCase();
  },

  handleSearchEntry: function(e){
    var val = this.user_input;
    if(val && val.length)
      if(this.current != 0)
        this.setCurrent(0);

     this.query = val; 
  }
}