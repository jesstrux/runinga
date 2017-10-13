const {ipcRenderer} = require('electron');

angular
  .module('runinga')
  .component('runingaShowDetail', {
    bindings: {

    },
    templateUrl: "components/runinga-show-detail/runinga-show-detail.html",
    controller: RuningaShowDetail
  });

RuningaShowDetail.$inject = ['ShowService', 'Favorites', '$rootScope'];

function RuningaShowDetail(ShowService, Favorites, $rootScope) {
  var self = this;
  this.showService = ShowService;
  this.favService = Favorites;
  this.rootScope = $rootScope;
}

RuningaShowDetail.prototype = {
  $onInit: function() {
    // this.showService.setFavorites([])
    // .then(function(){
    //   console.log("Favorites cleared");
    // });

    // this.showService.clearShowsCache([])
    // .then(function(){
    //   console.log("Shows cache was cleared!");
    // });
    
    // this.show = {
    //   name: "DC's Legends of Tomorrow"
    // };
    var self = this;
    ipcRenderer.on('view-show', (event, show) => {
      console.log(show);
      self.show = show;
      self.getShowDetails(self.show.name);
    });
  },

  $onChanges: function() {
    // this.getShowDetails(this.show.name);
  },

  getShowDetails: function(name){
    var self = this;
    console.log("Fetching show info!!");
    
    this.showService.getDetails(name)
      .then(function(info){
        console.log("Show info found!!");
        self.show = info;
        self.rootScope.$on("trailersFetched",function(e, data){
          self.show.trailers = data.trailers;
        });
      })
      .catch(function(error){
        console.log("Show info couldn't be found!!");
        console.log(error);
      });
  },

  isFavorite: function(name){
    this.favService.isFavorite(name)
      .then(function(answer){
        return answer;
      })
      .catch(function(error){
        console.log(error);
        return false;
      });
  },

  toggleFavorite: function(name){
    var self = this;
    this.favService.toggleFavorite(name)
      .then(function(state){
        var show = self.show;
        show.faved = state;
        self.show = show;

        self.showService.cacheShow(show);
      })
      .catch(function(error){
        console.log(error);
        return false;
      });
  },

  closeApp : function(){
      require('electron').remote.getCurrentWindow().hide();
  }
}