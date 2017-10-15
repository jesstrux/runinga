const {ipcRenderer} = require('electron');

angular
  .module('runinga')
  .component('runingaShowDetail', {
    bindings: {

    },
    templateUrl: "components/runinga-show-detail/runinga-show-detail.html",
    controller: RuningaShowDetail
  });

RuningaShowDetail.$inject = ['ShowService', 'Favorites', '$rootScope', '$scope'];

function RuningaShowDetail(ShowService, Favorites, $rootScope, $scope) {
  var self = this;
  this.showService = ShowService;
  this.favService = Favorites;
  this.rootScope = $rootScope;
  this.scope = $scope;

  self.setFaved = function(name){
    console.log("Settings faved");

    this.favService.isFavorite(name)
      .then(function(answer){
        self.faved = answer;
      })
      .catch(function(error){
        self.show.faved = false;
        // console.log(error);
        // return false;
      });
  }
}

RuningaShowDetail.prototype = {
  $onInit: function() {
    var self = this;
    ipcRenderer.on('view-show', (event, data) => {
      self.show = data.show;
      console.log(data);
      self.setFaved(data.show.name);

      if(data.fetch)
        self.getShowDetails(data.show.name);
      else{
        console.log(data.show._links);
        self.showService.fetchTrailers({_links: data.show._links});
        self.scope.$apply();
      }
    });

    self.rootScope.$on("trailersFetched",function(e, data){
      self.show.trailers = data.trailers;
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
      })
      .catch(function(error){
        console.log("Show info couldn't be found!!");
        console.log(error);
      });
  },

  toggleFavorite: function(name){
    var self = this;
    this.favService.toggleFavorite(self.show)
      .then(function(state){
        var show = self.show;
        show.faved = state;
        self.faved = state;
        self.show = show;

        self.showService.cacheShow(show);
      })
      .catch(function(error){
        console.log(error);
        return false;
      });
  },

  viewTrailer : function(which){
      ipcRenderer.send('view-trailer', this.show.trailers[which].id);
  },

  closeApp : function(){
      ipcRenderer.send('manage-window', {win: 'show-detail', action: "close"});
  }
}