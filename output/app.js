var AentropicoApp = angular.module('AentropicoApp', ['angularFileUpload', 'ngRoute']);

AentropicoApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/about', {
            templateUrl: '../README.html',
            controller: 'aboutController'
        })
        .when('/game', {
            templateUrl: '../html/game.html',
            controller: 'gameController'
        })
        .when('/login', {
            templateUrl: '../html/login.html',
            controller: 'loginController'
        })
        .when('/profile/:username', {
            templateUrl: '../html/profile.html',
            controller: 'profileController'
        })
        .otherwise({
            redirectTo: '/game'
        });
});

;AentropicoApp.controller('homeController', ['$scope', '$http', '$location', 
    function($scope, $http, $location) {
        $scope.user_found = true;
        $http.get("/get_user")
            .success(function (data) {
                if (data) {
                    $scope.username = data.user;
                } else {
                    $scope.user_found = false;
                }
            })
            .error(function (data) {throw new Error(data);});   
    }
]);

function createTable() {
    var table = "";
    table += "<table>";
    table += "<tbody>";
    table += "</tbody>";
    table += "</table>";

    return table;
}

AentropicoApp.controller('profileController', ['$scope', '$http', '$location', 
    function($scope, $http, $location) {
    //     // $scope.verbs = {};
        $scope.get_user = function(fn) {
            var user;
            $http.get("/get_user")
                    .success(function (user) {
                        if (user) {
                            fn(user);
                        } else {
                            alert('Please login');
                        }
                    })
                    .error(function (data) {consle.log('error getting user');throw new Error(data);});
        };

        $scope.loadVerbs = function (user) {
            console.log(user);
            $http.get('/api/get_verbs')
                .success(function (verbs) {
                    console.log(verbs);
                    var table = $('#verbs-table');
                    // $scope.$app\y(function() {$scope.verbs = data; });
                    for (var i in verbs) {
                        var verb = verbs[i];
                        var row = "<tr>";
                        row += "<td>" + i + "</td>";
                        row += "<td><table class='table'><tbody>";
                        for (var j in verb) {
                            var tense = verb[j];
                            row += "<tr><td>" + j + "</td>";
                            row += "<td><table class='table'><tbody>";
                            for (var k in tense) {
                                var person = tense[k];
                                row += "<tr>";
                                row += "<td>" + person.en + "</td>";
                                row += "<td><table class='table'><tbody>";
                                var response = user.responses[person.id];
                                if (response){
                                    row += "<tr><td><div style='height:1em; background-color: steelblue; width:" + ((response.right / 3) * 100) + "px'></div></tr>";  
                                    row += "<tr><td><div style='height:1em; background-color: coral; width:" + ((response.wrong / 3) * 100) + "px'></div></tr>";  
                                } 
                                row += "</table></tbody></td>";
                                row += "</tr>";
                            }
                            row += "</table></tbody></td>";
                            row += "</tr>";
                        }
                        row += "</table></tbody></td>";
                        row += "</tr>";
                        console.log(row);
                        table.append($(row));
                    }
                })
                .error(function (data) {
                    console.log('error getting verbs');
                });
        };
        $scope.get_user($scope.loadVerbs);
    }
]);

AentropicoApp.controller('gameController', ['$scope', '$http', '$location', 
    function($scope, $http, $location) {
        $scope.questions = [];
        $scope.percent_complete = 0;
        $scope.answer_submitted = false;
        $scope.progress_mode = false;
        $scope.button_text = 'Submit';
        $('#response').focus();
        $('#response').on('keyup', function (e) {
            if (e.keyCode === 13) {
                $scope.submit();
            }
        });

        var normalizeText = function (text) {
            text = text.replace(/\s/, '');
            text = text.replace(/é/, 'e');
            text = text.replace(/ó/, 'o');
            text = text.replace(/õ/, 'o');
            text = text.replace(/ẽ/, 'e');
            text = text.replace(/ñ/, 'n');
            text = text.replace(/ã/, 'a');
            console.log(text);
            return text;
        };

        var isCorrect = function (response, answers) {
            response = normalizeText(response);
            for (var i = 0; i < answers.length; i++) {
                var answer = answers[i];
                answer = normalizeText(answer);
                if (response === answer) {
                    return true;
                }
            }
        };

        $scope.start_level = function(scope) {
            $http.get("/api/get_level/0")
                .success(function (data) {
                    $scope.questions = data;
                    $scope.question_number = 0;
                    // $scope.progress();
                    var question = $scope.questions[$scope.question_number];
                    $scope.question = question.en[0];
                    $scope.answers = question.pt;
                })
                .error(function (data) {throw new Error(data);});
        };

        $scope.showAnswer = function (correct) {
            $scope.$apply(function() { 
                $scope.answer_submitted = true;
                $scope.answer_status_text = correct ? 'You were right!' : 'You were wrong.';
                $scope.answer_status_text += ' Accepted answers:';
                $scope.button_text = 'Continue';
            });
        };

        $scope.updateScore = function (correct) {
            if (correct) {
                $scope.questions[$scope.question_number].right = 1;
            } else {
                $scope.questions[$scope.question_number].wrong = 1;
            }
        };

        $scope.submit = function () {
            if ($scope.progress_mode) {
                $scope.progress();
            } else {
                $scope.submit_answer();
            }
        };

        $scope.submit_answer = function () {
            if ($scope.response) {
                var correct = isCorrect($scope.response, $scope.answers);
                $scope.updateScore(correct);
                $scope.showAnswer(correct);
                $scope.progress_mode = true;
            }
        };

        $scope.progress = function () {
            var percent = (($scope.question_number + 1) / $scope.questions.length) * 100;
            $scope.$apply(function () {$scope.percent_complete = percent;});

            if ($scope.question_number == $scope.questions.length - 1) {
                $http.get("/get_user")
                    .success(function (data) {
                        if (data) {
                            var username = data.user;
                            $http.post("/update_user/" + username, {responses: $scope.questions})
                                .success(function (data) {
                                    $location.path('/profile/' + username);
                                })
                                .error(function (data) {throw new Error(data);});
                        } else {
                            alert('Please login');
                        }
                    })
                    .error(function (data) {throw new Error(data);});
                
            } else {
                $scope.$apply(function () {
                    $scope.progress_mode = false;
                    $scope.answer_submitted = false;
                    $scope.response = '';
                    $scope.question_number ++;
                    var question = $scope.questions[$scope.question_number];
                    $scope.question = question.en[0];
                    $scope.answers = question.pt;
                });
            }
        };

        $scope.start_level();

    }
]);

AentropicoApp.controller('aboutController', ['$scope',
    function($scope) {}
]);



AentropicoApp.controller('loginController', ['$scope',
    function($scope) {}
]);


