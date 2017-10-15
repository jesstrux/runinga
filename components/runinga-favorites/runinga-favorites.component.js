angular
  .module('runinga')
  .component('runingaFavorites', {
    bindings: {
      visible: '<'
    },
    templateUrl: "components/runinga-favorites/runinga-favorites.html",
    controller: RuningaFavorites
  });

  RuningaFavorites.$inject = ['Favorites', '$rootScope'];

function RuningaFavorites(Favorites, $rootScope) {
  this.favs = Favorites;
  var self = this;
  this.rootScope = $rootScope;
}

RuningaFavorites.prototype = {
  $onInit: function() {
    var self = this;
    this.fetchShows();

    self.rootScope.$on("favorites-changed",function(e, favs){
      self.shows = favs;
    });
  },

  $onChanges: function(changes) {
    
  },

  viewShow: function(show){
    ipcRenderer.send('open-show-details', {show: show, fetch: false});
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