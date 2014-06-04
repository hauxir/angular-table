angular.module('angular-table', [])
    .directive('angularTable', ['TemplateStaticState','$window',
        function(TemplateStaticState,$window) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.
            restrict: 'E',
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                TemplateStaticState.modelName = tAttrs.model;

                // find whatever classes were passed into the angular-table, and merge them with the built in classes for the container div
                tElement.addClass('angularTableContainer');

                var rowTemplate = tElement[0].outerHTML.replace('<angular-table', '<div');
                rowTemplate = rowTemplate.replace('</angular-table>', '</div>');
                tElement.replaceWith(rowTemplate);

                return function(scope, elem, attrs) {
                    var table = elem.find(".angularTableTable");
                    var tablecontainer = elem.find(".angularTableTableContainer");
                    var header = elem.find(".angularTableHeaderTableContainer")
                    var resize = function()  {
                        if( !elem.is(":visible") ) {
                          return;
                        }
                        var elem_height = elem.height();
                        tablecontainer.height(elem_height-header.height());
                        header.width(table.width());
                    }
                    scope.parent = scope.$parent;
                    angular.element($window).resize(resize);
                    scope.$watch("ngShow",resize);
                    scope.$watchCollection("resizeEvents",resize);
                    scope.$watchCollection("model",resize);
                    };
            },
            scope: {
                model: '=',
                ngShow: '=',
                resizeEvents : '=',
            }
        };
    }])
  .directive('headerRow', ['ManualCompiler',
      function(ManualCompiler) {
      return {
          // only support elements for now to simplify the manual transclusion and replace logic.
          restrict: 'E',
          controller: ['$scope', '$parse', function($scope, $parse) {

          }],
          // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
          // see bug: https://github.com/angular/angular.js/issues/1459
          compile: function (tElement, tAttrs) {
              ManualCompiler.compileRow(tElement, tAttrs, true);

              // return a linking function
              return function(scope, iElement) {
              };
          }
      };
  }])
  .directive('row', ['ManualCompiler', '$window','TemplateStaticState',
      '$compile',
      function(ManualCompiler, $window, TemplateStaticState,
          $compile) {
      return {
          // only support elements for now to simplify the manual transclusion and replace logic.
          restrict: 'E',
          controller: ['$scope', function($scope) {
          }],
          // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
          // see bug: https://github.com/angular/angular.js/issues/1459
          compile: function (tElement, tAttrs) {

              ManualCompiler.compileRow(tElement, tAttrs, false);
          }
      };
  }])
  .service('ManualCompiler', ['TemplateStaticState', function(TemplateStaticState) {
      var self = this;

      self.compileRow = function(tElement, tAttrs, isHeader) {
          var headerUppercase = '';
          var headerDash = ''

          if(isHeader) {
                headerUppercase = 'Header';
                headerDash = 'header-'
            }

            // find whatever classes were passed into the row, and merge them with the built in classes for the tr
            tElement.addClass('angularTable' + headerUppercase + 'Row');

            // find whatever classes were passed into each column, and merge them with the built in classes for the td
            tElement.children().addClass('angularTable' + headerUppercase + 'Column');

            // replace row with tr
            if(isHeader) {
                var rowTemplate = tElement[0].outerHTML.replace('<header-row', '<tr');
                rowTemplate = rowTemplate.replace('/header-row>', '/tr>')
            } else {
                var rowTemplate = tElement[0].outerHTML.replace('<row', '<tr');
                rowTemplate = rowTemplate.replace('/row>', '/tr>')
            }

            // replace column with td
            var columnRegexString = headerDash + 'column';
            var columnRegex = new RegExp(columnRegexString, "g");
            rowTemplate = rowTemplate.replace(columnRegex, 'td');

            if(isHeader) {
                rowTemplate = rowTemplate.replace(/sort-arrow-descending/g, 'div');
                rowTemplate = rowTemplate.replace(/sort-arrow-ascending/g, 'div');
            } else {
                // add the ng-repeat and row selection click handler to each row
                rowTemplate = rowTemplate.replace('<tr',
                    '<tr on-last-repeat ng-repeat="row in ' + TemplateStaticState.modelName + '"');
            }

            // wrap our rows in a table, and a container div.  the container div will manage the scrolling.
            rowTemplate = '<div class="angularTable' + headerUppercase + 'TableContainer"><table class="angularTable' + headerUppercase + 'Table">' + rowTemplate + '</table></div></div></div>';

            // replace the original template with the manually replaced and transcluded version
            tElement.replaceWith(rowTemplate);
        };
    }])

    .service('TemplateStaticState', function() {
        var self = this;

        // store selected, even and odd row background colors
        self.modelName = '';

        return self;
    });
