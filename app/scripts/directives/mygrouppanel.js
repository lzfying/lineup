'use strict';

/**
 * @ngdoc directive
 * @name lineupApp.directive:myGroupPanel
 * @description
 * # responsible for moving a group of elements around
 */
angular.module('lineupApp')
  .directive('myGroupPanel', function () {
    var COLORS = {
        ORANGE: '#fd5f00',
        PINK: '#EAC7DF',
        BLUE: '#12B7A7'
    };
    var PANEL_POSITIONS = [
        {right: 100, bottom: 400, scale: 1, opacity: 1},
        {right: -500, bottom: 400, scale: 1, opacity: 1},
        {right: -500, bottom: 400, scale: 1, opacity: 1},
        {right: -100, bottom: 700, scale: .3, opacity: .2},
        {right: 0, bottom: 600, scale: .5, opacity: .4}
    ];
    return {
      transclude: true,
      template: '<div ng-transclude></div ng-transclude>',
      restrict: 'E',
      scope: {
          currentPosition: '@'
      },
      link: function postLink(scope, element, attrs) {

          var index = (!attrs.index ? 0 : attrs.index);

          var movePosition = function(ix, currentPos){
             var position = ((currentPos - ix) + PANEL_POSITIONS.length) % PANEL_POSITIONS.length;
             element.velocity(PANEL_POSITIONS[position]);
          }


          /* todo: implement */
          scope.$watch('currentPosition', function(){
              console.log("Position changed to " + scope.currentPosition)
              console.log(index);
              movePosition(index, scope.currentPosition);

              // element.velocity(PANEL_POSITIONS[scope.currentPosition]);
          
          });

          movePosition(index, scope.currentPosition);

          $(element).css({
              position: "absolute",
              right: 100,
              bottom: 400,
              width: 500,
              'font-family': '"Roboto", sans-serif',
              color: '#fff',
              'text-shadow': 'rgb(255, 255, 255) 0px 0px 30px'
          });

          var children = $(element).children().children();

          children.css({
              border: '1px solid #fff',
              padding: '10px',
              width: 200,
              float: 'left'
          });


          var $titleDiv = $("<div/>");

          var paper = new Raphael(element[0], 300, 50);

          $titleDiv.text(attrs.title);


          $titleDiv.css({
              color: "#f7d671",
              'font-family': '"Roboto", sans-serif',
              'text-transform': 'uppercase',
              'font-size': "1.4em",
              'position': 'absolute',
              'top': 0,
              'left': 35,
          });


          paper
              .path( ['M', 5, 15, 'L', 5, 40, 'L', 250, 40 ] )
              .attr({stroke: COLORS.ORANGE, 'stroke-width':2, 'opacity': 0.4, 'position': 'absolute'})
              .glow({color: COLORS.ORANGE, opacity: 0.2, width: 5});

          paper
              .circle(5,15,3)
              .attr({fill: COLORS.PINK, 'stroke-width':0, 'opacity': 0.6, 'position': 'absolute'})
              .glow({color: COLORS.PINK, opacity: 0.2, width: 5});

          paper
              .circle(5,40,3)
              .attr({fill: COLORS.PINK, 'stroke-width':0, 'opacity': 0.6, 'position': 'absolute'})
              .glow({color: COLORS.PINK, opacity: 0.2, width: 5});

         


          $(element).append($titleDiv);

          

      }
    };
  });
