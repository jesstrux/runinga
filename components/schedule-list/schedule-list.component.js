angular
  .module('runinga')
  .component('scheduleList', {
    bindings: {
      scheduleLoading: '=',
      date: '<',
      schedule: '<',
      onViewShow: '&'
    },
    templateUrl: "components/schedule-list/schedule-list.html",
    controller: ScheduleList
  });

function ScheduleList() {
  var self = this;
}

ScheduleList.prototype = {
  $onInit: function() {
    
  },

  $onChanges: function() {
    
  }
}