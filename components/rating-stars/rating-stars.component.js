angular
  .module('runinga')
  .component('ratingStars', {
    bindings: {
      rating: '<'
    },
    template: `
      <div class="layout inline center">
        <i class="zmdi" ng-repeat="star in [1, 2, 3, 4, 5]" 
        ng-class="{
          'zmdi-star' : $ctrl.rating >= star,
          'zmdi-star-outline' : $ctrl.rating < star - 0.5,
          'zmdi-star-half' : $ctrl.rating < star && $ctrl.rating >= star - 0.5}"></i>
      </div> 
    `
  });