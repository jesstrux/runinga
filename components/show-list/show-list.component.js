angular
  .module('runinga')
  .component('showList', {
    bindings: {
      listLoading: '=',
      shows: '<',
      onViewShow: '&'
    },
    templateUrl: "components/show-list/show-list.html",
    controller: ShowList
  });

function ShowList() {
  var self = this;
}

ShowList.prototype = {
  $onInit: function() {
    
  },

  $onChanges: function(changes) {
    console.log(changes);
  }
}