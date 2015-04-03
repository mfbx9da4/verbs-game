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

