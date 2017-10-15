// Todo
// Add date picker(open new window)
// Defaults to today

angular
  .module('runinga')
  .component('dateChooser', {
    bindings: {
      date: '=',
      pickDate: '&'
    },
    templateUrl: "components/date-chooser/date-chooser.html",
    controller: DateChooser
  });

  DateChooser.$inject = ['$scope','$rootScope'];
function DateChooser($scope, $rootScope) {
  this.rootScope = $rootScope;
  
  $scope.$watch(
      "DateChooser.date",
      function handleFooChange( newValue, oldValue ) {
          console.log( "DateChooser.date:", newValue );
      }
  );

  this.setCurrent = function(idx, date){
    if(!date){
      this.current = idx;
      this.date = this.dates[idx];
    }else{
      this.current = this.dates.findIndex((d) => d === date);
      this.date = date;
      $scope.$apply();
    }
  }
}

DateChooser.prototype = {
  $onInit: function() {
    var d = new Date();
    this.current = d.getDay();
    this.days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var today = d.getDay();
    var week_start = new Date();
    week_start.setDate(week_start.getDate() - today);
    var week_end = new Date();
    week_end.setDate(week_end.getDate() + (6 - today));

    this.dates = getDates(week_start, week_end).map(function(d){
      return parseInt(d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
    });

    this.date = this.dates[this.current];

    var self = this;
    self.rootScope.$on("date-picked",function(e, date){
      // self.date = date;
      self.setCurrent(-1, date);
      // self.current = self.dates.findIndex((d) => d === date);
    });
  },

  $onChanges: function() {
    
  }
}

function getDates(startDate, endDate) {
  var dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};