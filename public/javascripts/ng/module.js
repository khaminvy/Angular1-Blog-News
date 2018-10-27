var app = angular.module('flapperNews', ['ui.router']);
app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
		url: '/home',
		templateUrl: '../partials/home.html',
		controller: 'MainCtrl',
		resolve: {
			postPromise: ['posts', function(posts){
				return posts.getAll();
			}]
		}
    });

  $stateProvider
    .state('posts', {
     url: '/posts/{id}',
     templateUrl: '../partials/posts.html',
     controller: 'PostsCtrl',
	 resolve: {
			post: ['$stateParams', 'posts', function($stateParams, posts) {
				return posts.get($stateParams.id);
			}]
		}
    });
	
  $stateProvider
	.state('login', {
		url: '/login',
		templateUrl: '../partials/login.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}]
	});

  $stateProvider	
	.state('register', {
		url: '/register',
		templateUrl: '../partials/register.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}]
	});

  $urlRouterProvider.otherwise('home');
}]);