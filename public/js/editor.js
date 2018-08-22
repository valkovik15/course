var app = angular.module("markdownEditor", ['ngMaterial', 'ngMessages', 'material.svgAssetsCache','ngSanitize','ngTagsInput']);
app.controller("markdownEditorController", ["$scope",  "$http","$mdDialog",function ($scope, $http, $mdDialog) {
    document.getElementById("post-title").focus();

    $scope.tags = [
    ];
    $scope.editor = {
    	src: '',
    	parsed: 'Input the text to see how it will render!',
    };
    $scope.$watch('postid', function () {
        $http.get("/gettags/?id="+$scope.postid)
            .then(function(response) {
                $scope.tags=response.data;
            });
    });
    $scope.loadTags = function(query) {

        return $http.get('query', { cache: true}).then(function(response) {
            var tags = response.data;
            return tags.filter(function(item) {
                return item.text.toLowerCase().indexOf(query.toLowerCase()) != -1;
            });
        });
    };
    $scope.textChange = function() {
    	$scope.editor.parsed = marked($scope.editor.src);
    };
    $scope.textInit = function() {
        $scope.editor.parsed = marked($scope.editor.src);
    };

    $scope.onPublish = function() {
	console.log(scope.tags);
	alert("");
        var data = $.param({
            text:$scope.editor.src,
            title:$scope.editor.title,
            description:$scope.editor.description,
			picture:$scope.pic,
			tags:$scope.tags,
			topic:$scope.topic
                            });
        if(window.location.search)
        window.location.href="http://localhost:3000/publish/?"+data+'&'+window.location.search.slice(1);
        else
		{
            window.location.href="http://localhost:3000/publish/?"+data;
		}

    };

    $scope.onEditor = function(param) {
    	var sel = $scope.getSelection();
    	switch(param) {
    		case "bold":
    			if ($scope.hasSelection()) {
    				// enhance
    				$scope.insertText("**" + sel.text + "**", sel.start, sel.end);
    			} else {
    				// add new
    				$scope.insertPlacehodler("**bold**", 2, 2);
    			}
    			break;
    		case "italic":
    			if ($scope.hasSelection()) {
    				// enhance
    				$scope.insertText("_" + sel.text + "_", sel.start, sel.end);
    			} else {
    				// add new
    				$scope.insertPlacehodler("_italic_", 1, 1);
    			}
    			break;
    		case "underline":
    			if ($scope.hasSelection()) {
    				// enhance
    				$scope.insertText("<u>" + sel.text + "</u>", sel.start, sel.end);
    			} else {
    				// add new
    				$scope.insertPlacehodler("<u>underline</u>", 3, 4);
    			}
    			break;
    		case "list":
				sel.target.value += "\n";
				$scope.insertPlacehodler("- First item", 2, 0);
    			break;
    		case "list-2":
				sel.target.value += "\n";
				$scope.insertPlacehodler("1. First numbered item", 3, 0);
    			break;
    		case "header":
				sel.target.value += "\n";
				$scope.insertPlacehodler("# Header", 2, 0);
    			break;
    		case "url":
                $scope.showAdvanced();
    			var iUrl = prompt("Enter URL here:");
    			if (iUrl == "") {
    				iUrl = "http://google.com";
    			}
    			sel.target.value += "\n";
    			// insert newe
    			var aUrl = "[text](" + iUrl + ")";
    			$scope.insertPlacehodler(aUrl, 1, iUrl.length + 3 );

    			break;
    		case "img":

    			$scope.showAdvanced();


    			break;
    		case "code":
    			if ($scope.hasSelection()) {
    				// enhance
    				$scope.insertText("`" + sel.text + "`", sel.start, sel.end);
    			} else {
    				// add new
    				sel.target.value += "\n";
    				$scope.insertPlacehodler("`code here`", 19, 17);
    			}
    			break;
    		case "horline":
    			sel.target.value += "\n---";
    			sel.target.focus();
    			break;
    		case "quote":
    			if ($scope.hasSelection()) {
    				// enhance
    				$scope.insertText("> " + sel.text, sel.start, sel.end);
    			} else {
    				// add new
    				$scope.insertPlacehodler("> quote", 2, 0);
    			}
    			break;
    		case "strikethrough":
    			if ($scope.hasSelection()) {
    				// enhance
    				$scope.insertText("~~" + sel.text + "~~", sel.start, sel.end);
    			} else {
    				// add new
    				$scope.insertPlacehodler("~~strikethrough~~", 2, 2);
    			}
    			break;
    	}
    };

    $scope.hasSelection = function() {
    	var ta = document.getElementById("mark-editor");
    	if (ta.selectionStart == ta.textLength) {
    		return false;
    	}
    	return true;
    };

    $scope.getSelection = function() {
    	var ta = document.getElementById("mark-editor");

    	return {
    		target: ta,
    		start: ta.selectionStart,
    		end: ta.selectionEnd,
    		text: ta.value.substring(ta.selectionStart, ta.selectionEnd)
    	};
    };

    $scope.insertPlacehodler = function(text, padLeft, padRight) {
    	var ta = document.getElementById("mark-editor");
    	ta.focus();
    	ta.value += text;
    	ta.selectionStart = ta.textLength - text.length + padLeft;
    	ta.selectionEnd = ta.textLength - padRight;
    	console.log(ta);

    };
    $scope.showAdvanced = function() {
        $mdDialog.show ({
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true,
            templateUrl: 'template.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.hide();
                };
                $scope.answer = function(action) {
                    $mdDialog.hide();
                    if(action=='ok')
                    {
                        $scope.temp.forEach(function(element)
                        {
                            iUrl=element;
                            var aUrl = "![image text](" + iUrl + ")";
                            $scope.insertPlacehodler(aUrl, 2, iUrl.length + 3 );
                            alert(aUrl);
                        });
                    }
                    else
                    {
                        console.log('Cancel!');
                    }
                }
            }

        }).then(function(answer) {

        });
    };

    $scope.insertText = function(text, start, end) {
    	var ta = document.getElementById("mark-editor");
    	ta.focus();
    	var leftText = ta.value.substring(0, start);
    	var rightText = ta.value.substring(end);
    	ta.value = leftText + text + rightText;
    };

}]);
