// Todo
// Add date picker(open new window)
// Defaults to today

angular
  .module('runinga')
  .component('dateChooser', {
    bindings: {
      date: '=',
      onDateChanged: '&'
    },
    templateUrl: "components/date-chooser/date-chooser.html",
    controller: DateChooser
  });

function DateChooser($rootScope) {
  
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
      return d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear();
    });

    this.date = this.dates[this.current];
  },

  $onChanges: function() {
    
  },

  pickDate: function(){
    this.date = "10/1/2017";
    this.current = -1;
  },

  setCurrent(idx){
    this.current = idx;
    this.date = this.dates[idx];
    // self.onDateChanged(curDate);
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