(function (ng) {
    'use strict';
var module = angular.module("zInfiniteScroll",[]);
module.directive('zInfiniteScroll', ['$timeout', '$document', function ($timeout, $document) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attr) {
            var lengthThreshold = $attr.scrollThreshold || 100,
                timeThreshold   = $attr.timeThreshold || 200,
                handlerUp       = $scope.$eval($attr.scrollUp),
                handlerDown     = $scope.$eval($attr.scrollDown),
                bodyScroll      = $scope.$eval($attr.bodyScroll) === true ? true : false,
                inverse         = $scope.$eval($attr.inverse) === true ? true : false,
                promise         = null,
                lastScrolled    = 9999,
                element         = $element[0],
                scrollEvent,
                isDestorying = false;
            
            $scope.$on('$destroy', function handleDestroyEvent() {
                isDestorying = true;
                $document.off('scroll', scrollEvent);
            });

            lengthThreshold = parseInt(lengthThreshold, 10);
            timeThreshold = parseInt(timeThreshold, 10);

            // if user not setting the handle function, it would giving default one
            if (!handlerUp || !ng.isFunction(handlerUp)) {
                handlerUp = ng.noop;
            }
            // if user not setting the handle function, it would giving default one
            if (!handlerDown || !ng.isFunction(handlerDown)) {
                handlerDown = ng.noop;
            }
            
            scrollEvent = scrollUntilDataReady;

            // if element doesn't want to set height, this would be helpful.
            if (bodyScroll) {
                $document.on('scroll', scrollEvent);
                element = $document[0].documentElement;
            } else {
                $element.on('scroll', scrollEvent);
            }

            function scrolledToTop() {
                // console.log("scrollTop: "+element.scrollTop)
                // console.log("lengthThreshold: "+lengthThreshold)
                // console.log("loading: "+$scope.$parent.loading)
                return  element.scrollTop <= lengthThreshold && !$scope.$parent.loading;
            }
            
            function scrolledToBottom() {
                return Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1;
            }

            // it will be scrolled once your data loaded
            function scrollUntilDataReady() {
                if (isDestorying) return;

                var scrolled = calculateBarScrolled();
                // if we have reached the threshold and we scroll up
                if (scrolledToTop()) {
                    console.log("scrolled to top")
                    var originalHeight = element.scrollHeight;
                    var handlerCallback = $scope.$apply(handlerUp);
                    if (handlerCallback && typeof handlerCallback.then === 'function') {
                        handlerCallback.then(function() {
                            $timeout(function() {
                                element.scrollTop = element.scrollHeight - originalHeight;
                            });
                        });
                    }
                } else if(scrolledToBottom()) {
                    var originalHeight = element.scrollHeight;
                    var handlerCallback = $scope.$apply(handlerDown);
                    if (handlerCallback && typeof handlerCallback.then === 'function') {
                        handlerCallback.then(function() {
                            $timeout(function() {
                                element.scrollBottom = 0 - originalHeight;
                            });
                        });
                    }
                }
                lastScrolled = scrolled;
            }
            
            // for compatibility for all browser
            function calculateBarScrolled() {
                var scrollTop;
                if (bodyScroll) {
                    scrollTop = $document[0].documentElement.scrollTop || $document[0].body.scrollTop;
                } else {
                    scrollTop = element.scrollTop;
                }
                
                // console.log("scrollTop: "+scrollTop);
                // console.log("element.clientHeight: "+element.clientHeight);
                // console.log("element.scrollHeight: "+ element.scrollHeight);
                // console.log("element.clientHeight + scrollTop: "+ (element.clientHeight + scrollTop));
                // console.log("returned: "+(element.scrollHeight - (element.clientHeight + scrollTop)));
                return element.scrollHeight - (element.clientHeight + scrollTop);
            }
        }
    };
}]);
})(angular);
