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
				$state.go('posts');
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
angular.module('flapperNews')
.controller('AuthCtrl', ['$scope','$state','auth', function($scope, $state, auth){
	$scope.user = {};

	$scope.register = function(){
		auth.register($scope.user).error(function(error){
			$scope.error = error;
		}).then(function(){
			$state.go('home');
		});
	};

	$scope.logIn = function(){
		console.log("Log in");
		auth.logIn($scope.user).error(function(error){
			$scope.error = error;
		}).then(function(){
			$state.go('home');
		});
	};
}]);
angular.module('flapperNews')
.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};
	
	auth.saveToken = function (token){
		$window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function (){
		return $window.localStorage['flapper-news-token'];
	};

	auth.isLoggedIn = function(){
		var token = auth.getToken();
		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.username;
		}
	};
	auth.register = function(user){
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	};
	
	auth.logIn = function(user){
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.token);
			});
	};



	auth.logOut = function(){
		$window.localStorage.removeItem('flapper-news-token');
	};

  return auth;
}]);

angular.module('flapperNews')
.controller('MainCtrl', ['$scope','posts','auth',function($scope,posts,auth) {

	$scope.posts = posts.posts;
	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.addPost = function() {
		if(!$scope.title || $scope.title === '') return;
		posts.create({
			title: $scope.title,
			link: $scope.link,
		});

		$scope.title = '';
		$scope.link = '';
	};
	
	$scope.incrementUpvotes = function(post) {
		posts.upvote(post);
	};
	
}]);

angular.module('flapperNews')
.controller('NavCtrl', ['$scope','auth',function($scope, auth){
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.logOut = auth.logOut;
}]);

angular.module('flapperNews')
.controller('PostsCtrl', ['$scope','posts','post','auth',function($scope, posts, post,auth){
	$scope.post = post;
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.addComment = function(){
		if($scope.body === '') { return; }
		posts.addComment(post._id, {
			body: $scope.body,
			author: 'user'
		}).then(function(resp) {
				$scope.post.comments.push(resp.data);
		});
		$scope.body = '';
		$scope.incrementUpvotes = function(comment){
			posts.upvoteComment(post, comment);
		};
	};
}]);
angular.module('flapperNews')
.factory('posts',["$http",'auth',function($http, auth){
	var o = {
		posts: []	
	};
	//o.getAll = function() {
	//	return $http.get('/posts').success(function(data){
	//		console.log(data);
	//		angular.copy(data, o.posts);
	//	});
	//};
	
	o.create = function(post) {
		return 	$http.post('/posts', post, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					o.posts.push(data);
				});
	};

	
	o.upvote = function(post) {
		return 	$http.put('/posts/' + post._id + '/upvote', null, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					post.upvotes += 1;
				});
	};

	
	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res){
				return res.data;
		});
	};

	o.addComment = function(id, comment) {
			return $http.post('/posts/' + id + '/comments' , comment, {
						headers: {Authorization: 'Bearer '+ auth.getToken()}
					});
	};


	
	o.upvoteComment = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', null, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					comment.upvotes += 1;
				});
	};
	
	return o;
}]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImF1dGhfY3RybC5qcyIsImF1dGhfZmFjdG9yeS5qcyIsIm1haW5fY3RybC5qcyIsIm5hdl9jdHJsLmpzIiwicG9zdHNfY3RybC5qcyIsInBvc3RzX2ZhY3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZmxhcHBlck5ld3MnLCBbJ3VpLnJvdXRlciddKTtcclxuYXBwLmNvbmZpZyhbXHJcbickc3RhdGVQcm92aWRlcicsXHJcbickdXJsUm91dGVyUHJvdmlkZXInLFxyXG5mdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcblxyXG4gICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAuc3RhdGUoJ2hvbWUnLCB7XHJcblx0XHR1cmw6ICcvaG9tZScsXHJcblx0XHR0ZW1wbGF0ZVVybDogJy4uL3BhcnRpYWxzL2hvbWUuaHRtbCcsXHJcblx0XHRjb250cm9sbGVyOiAnTWFpbkN0cmwnLFxyXG5cdFx0cmVzb2x2ZToge1xyXG5cdFx0XHRwb3N0UHJvbWlzZTogWydwb3N0cycsIGZ1bmN0aW9uKHBvc3RzKXtcclxuXHRcdFx0XHRyZXR1cm4gcG9zdHMuZ2V0QWxsKCk7XHJcblx0XHRcdH1dXHJcblx0XHR9XHJcbiAgICB9KTtcclxuXHJcbiAgJHN0YXRlUHJvdmlkZXJcclxuICAgIC5zdGF0ZSgncG9zdHMnLCB7XHJcbiAgICAgdXJsOiAnL3Bvc3RzL3tpZH0nLFxyXG4gICAgIHRlbXBsYXRlVXJsOiAnLi4vcGFydGlhbHMvcG9zdHMuaHRtbCcsXHJcbiAgICAgY29udHJvbGxlcjogJ1Bvc3RzQ3RybCcsXHJcblx0IHJlc29sdmU6IHtcclxuXHRcdFx0cG9zdDogWyckc3RhdGVQYXJhbXMnLCAncG9zdHMnLCBmdW5jdGlvbigkc3RhdGVQYXJhbXMsIHBvc3RzKSB7XHJcblx0XHRcdFx0cmV0dXJuIHBvc3RzLmdldCgkc3RhdGVQYXJhbXMuaWQpO1xyXG5cdFx0XHR9XVxyXG5cdFx0fVxyXG4gICAgfSk7XHJcblx0XHJcbiAgJHN0YXRlUHJvdmlkZXJcclxuXHQuc3RhdGUoJ2xvZ2luJywge1xyXG5cdFx0dXJsOiAnL2xvZ2luJyxcclxuXHRcdHRlbXBsYXRlVXJsOiAnLi4vcGFydGlhbHMvbG9naW4uaHRtbCcsXHJcblx0XHRjb250cm9sbGVyOiAnQXV0aEN0cmwnLFxyXG5cdFx0b25FbnRlcjogWyckc3RhdGUnLCAnYXV0aCcsIGZ1bmN0aW9uKCRzdGF0ZSwgYXV0aCl7XHJcblx0XHRcdGlmKGF1dGguaXNMb2dnZWRJbigpKXtcclxuXHRcdFx0XHQkc3RhdGUuZ28oJ2hvbWUnKTtcclxuXHRcdFx0fVxyXG5cdFx0fV1cclxuXHR9KTtcclxuXHJcbiAgJHN0YXRlUHJvdmlkZXJcdFxyXG5cdC5zdGF0ZSgncmVnaXN0ZXInLCB7XHJcblx0XHR1cmw6ICcvcmVnaXN0ZXInLFxyXG5cdFx0dGVtcGxhdGVVcmw6ICcuLi9wYXJ0aWFscy9yZWdpc3Rlci5odG1sJyxcclxuXHRcdGNvbnRyb2xsZXI6ICdBdXRoQ3RybCcsXHJcblx0XHRvbkVudGVyOiBbJyRzdGF0ZScsICdhdXRoJywgZnVuY3Rpb24oJHN0YXRlLCBhdXRoKXtcclxuXHRcdFx0aWYoYXV0aC5pc0xvZ2dlZEluKCkpe1xyXG5cdFx0XHRcdCRzdGF0ZS5nbygnaG9tZScpO1xyXG5cdFx0XHR9XHJcblx0XHR9XVxyXG5cdH0pO1xyXG5cclxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCdob21lJyk7XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnZmxhcHBlck5ld3MnKVxyXG4uY29udHJvbGxlcignQXV0aEN0cmwnLCBbJyRzY29wZScsJyRzdGF0ZScsJ2F1dGgnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgYXV0aCl7XHJcblx0JHNjb3BlLnVzZXIgPSB7fTtcclxuXHJcblx0JHNjb3BlLnJlZ2lzdGVyID0gZnVuY3Rpb24oKXtcclxuXHRcdGF1dGgucmVnaXN0ZXIoJHNjb3BlLnVzZXIpLmVycm9yKGZ1bmN0aW9uKGVycm9yKXtcclxuXHRcdFx0JHNjb3BlLmVycm9yID0gZXJyb3I7XHJcblx0XHR9KS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdCRzdGF0ZS5nbygnaG9tZScpO1xyXG5cdFx0fSk7XHJcblx0fTtcclxuXHJcblx0JHNjb3BlLmxvZ0luID0gZnVuY3Rpb24oKXtcclxuXHRcdGNvbnNvbGUubG9nKFwiTG9nIGluXCIpO1xyXG5cdFx0YXV0aC5sb2dJbigkc2NvcGUudXNlcikuZXJyb3IoZnVuY3Rpb24oZXJyb3Ipe1xyXG5cdFx0XHQkc2NvcGUuZXJyb3IgPSBlcnJvcjtcclxuXHRcdH0pLnRoZW4oZnVuY3Rpb24oKXtcclxuXHRcdFx0JHN0YXRlLmdvKCdob21lJyk7XHJcblx0XHR9KTtcclxuXHR9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2ZsYXBwZXJOZXdzJylcclxuLmZhY3RvcnkoJ2F1dGgnLCBbJyRodHRwJywgJyR3aW5kb3cnLCBmdW5jdGlvbigkaHR0cCwgJHdpbmRvdyl7XHJcblx0dmFyIGF1dGggPSB7fTtcclxuXHRcclxuXHRhdXRoLnNhdmVUb2tlbiA9IGZ1bmN0aW9uICh0b2tlbil7XHJcblx0XHQkd2luZG93LmxvY2FsU3RvcmFnZVsnZmxhcHBlci1uZXdzLXRva2VuJ10gPSB0b2tlbjtcclxuXHR9O1xyXG5cclxuXHRhdXRoLmdldFRva2VuID0gZnVuY3Rpb24gKCl7XHJcblx0XHRyZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ2ZsYXBwZXItbmV3cy10b2tlbiddO1xyXG5cdH07XHJcblxyXG5cdGF1dGguaXNMb2dnZWRJbiA9IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgdG9rZW4gPSBhdXRoLmdldFRva2VuKCk7XHJcblx0XHRpZih0b2tlbil7XHJcblx0XHRcdHZhciBwYXlsb2FkID0gSlNPTi5wYXJzZSgkd2luZG93LmF0b2IodG9rZW4uc3BsaXQoJy4nKVsxXSkpO1xyXG5cdFx0XHRyZXR1cm4gcGF5bG9hZC5leHAgPiBEYXRlLm5vdygpIC8gMTAwMDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRhdXRoLmN1cnJlbnRVc2VyID0gZnVuY3Rpb24oKXtcclxuXHRcdGlmKGF1dGguaXNMb2dnZWRJbigpKXtcclxuXHRcdFx0dmFyIHRva2VuID0gYXV0aC5nZXRUb2tlbigpO1xyXG5cdFx0XHR2YXIgcGF5bG9hZCA9IEpTT04ucGFyc2UoJHdpbmRvdy5hdG9iKHRva2VuLnNwbGl0KCcuJylbMV0pKTtcclxuXHRcdFx0cmV0dXJuIHBheWxvYWQudXNlcm5hbWU7XHJcblx0XHR9XHJcblx0fTtcclxuXHRhdXRoLnJlZ2lzdGVyID0gZnVuY3Rpb24odXNlcil7XHJcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL3JlZ2lzdGVyJywgdXNlcikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0YXV0aC5zYXZlVG9rZW4oZGF0YS50b2tlbik7XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cdFxyXG5cdGF1dGgubG9nSW4gPSBmdW5jdGlvbih1c2VyKXtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCB1c2VyKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHRhdXRoLnNhdmVUb2tlbihkYXRhLnRva2VuKTtcclxuXHRcdFx0fSk7XHJcblx0fTtcclxuXHJcblxyXG5cclxuXHRhdXRoLmxvZ091dCA9IGZ1bmN0aW9uKCl7XHJcblx0XHQkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdmbGFwcGVyLW5ld3MtdG9rZW4nKTtcclxuXHR9O1xyXG5cclxuICByZXR1cm4gYXV0aDtcclxufV0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxhcHBlck5ld3MnKVxyXG4uY29udHJvbGxlcignTWFpbkN0cmwnLCBbJyRzY29wZScsJ3Bvc3RzJywnYXV0aCcsZnVuY3Rpb24oJHNjb3BlLHBvc3RzLGF1dGgpIHtcclxuXHJcblx0JHNjb3BlLnBvc3RzID0gcG9zdHMucG9zdHM7XHJcblx0JHNjb3BlLmlzTG9nZ2VkSW4gPSBhdXRoLmlzTG9nZ2VkSW47XHJcblxyXG5cdCRzY29wZS5hZGRQb3N0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRpZighJHNjb3BlLnRpdGxlIHx8ICRzY29wZS50aXRsZSA9PT0gJycpIHJldHVybjtcclxuXHRcdHBvc3RzLmNyZWF0ZSh7XHJcblx0XHRcdHRpdGxlOiAkc2NvcGUudGl0bGUsXHJcblx0XHRcdGxpbms6ICRzY29wZS5saW5rLFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0JHNjb3BlLnRpdGxlID0gJyc7XHJcblx0XHQkc2NvcGUubGluayA9ICcnO1xyXG5cdH07XHJcblx0XHJcblx0JHNjb3BlLmluY3JlbWVudFVwdm90ZXMgPSBmdW5jdGlvbihwb3N0KSB7XHJcblx0XHRwb3N0cy51cHZvdGUocG9zdCk7XHJcblx0fTtcclxuXHRcclxufV0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxhcHBlck5ld3MnKVxyXG4uY29udHJvbGxlcignTmF2Q3RybCcsIFsnJHNjb3BlJywnYXV0aCcsZnVuY3Rpb24oJHNjb3BlLCBhdXRoKXtcclxuXHQkc2NvcGUuaXNMb2dnZWRJbiA9IGF1dGguaXNMb2dnZWRJbjtcclxuXHQkc2NvcGUuY3VycmVudFVzZXIgPSBhdXRoLmN1cnJlbnRVc2VyO1xyXG5cdCRzY29wZS5sb2dPdXQgPSBhdXRoLmxvZ091dDtcclxufV0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxhcHBlck5ld3MnKVxyXG4uY29udHJvbGxlcignUG9zdHNDdHJsJywgWyckc2NvcGUnLCdwb3N0cycsJ3Bvc3QnLCdhdXRoJyxmdW5jdGlvbigkc2NvcGUsIHBvc3RzLCBwb3N0LGF1dGgpe1xyXG5cdCRzY29wZS5wb3N0ID0gcG9zdDtcclxuXHQkc2NvcGUuaXNMb2dnZWRJbiA9IGF1dGguaXNMb2dnZWRJbjtcclxuXHQkc2NvcGUuYWRkQ29tbWVudCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRpZigkc2NvcGUuYm9keSA9PT0gJycpIHsgcmV0dXJuOyB9XHJcblx0XHRwb3N0cy5hZGRDb21tZW50KHBvc3QuX2lkLCB7XHJcblx0XHRcdGJvZHk6ICRzY29wZS5ib2R5LFxyXG5cdFx0XHRhdXRob3I6ICd1c2VyJ1xyXG5cdFx0fSkudGhlbihmdW5jdGlvbihyZXNwKSB7XHJcblx0XHRcdFx0JHNjb3BlLnBvc3QuY29tbWVudHMucHVzaChyZXNwLmRhdGEpO1xyXG5cdFx0fSk7XHJcblx0XHQkc2NvcGUuYm9keSA9ICcnO1xyXG5cdFx0JHNjb3BlLmluY3JlbWVudFVwdm90ZXMgPSBmdW5jdGlvbihjb21tZW50KXtcclxuXHRcdFx0cG9zdHMudXB2b3RlQ29tbWVudChwb3N0LCBjb21tZW50KTtcclxuXHRcdH07XHJcblx0fTtcclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdmbGFwcGVyTmV3cycpXHJcbi5mYWN0b3J5KCdwb3N0cycsW1wiJGh0dHBcIiwnYXV0aCcsZnVuY3Rpb24oJGh0dHAsIGF1dGgpe1xyXG5cdHZhciBvID0ge1xyXG5cdFx0cG9zdHM6IFtdXHRcclxuXHR9O1xyXG5cdG8uZ2V0QWxsID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvcG9zdHMnKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcclxuXHRcdFx0YW5ndWxhci5jb3B5KGRhdGEsIG8ucG9zdHMpO1xyXG5cdFx0fSk7XHJcblx0fTtcclxuXHRcclxuXHRvLmNyZWF0ZSA9IGZ1bmN0aW9uKHBvc3QpIHtcclxuXHRcdHJldHVybiBcdCRodHRwLnBvc3QoJy9wb3N0cycsIHBvc3QsIHtcclxuXHRcdFx0XHRcdGhlYWRlcnM6IHtBdXRob3JpemF0aW9uOiAnQmVhcmVyICcrYXV0aC5nZXRUb2tlbigpfVxyXG5cdFx0XHRcdH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdFx0XHRvLnBvc3RzLnB1c2goZGF0YSk7XHJcblx0XHRcdFx0fSk7XHJcblx0fTtcclxuXHJcblx0XHJcblx0by51cHZvdGUgPSBmdW5jdGlvbihwb3N0KSB7XHJcblx0XHRyZXR1cm4gXHQkaHR0cC5wdXQoJy9wb3N0cy8nICsgcG9zdC5faWQgKyAnL3Vwdm90ZScsIG51bGwsIHtcclxuXHRcdFx0XHRcdGhlYWRlcnM6IHtBdXRob3JpemF0aW9uOiAnQmVhcmVyICcrYXV0aC5nZXRUb2tlbigpfVxyXG5cdFx0XHRcdH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdFx0XHRwb3N0LnVwdm90ZXMgKz0gMTtcclxuXHRcdFx0XHR9KTtcclxuXHR9O1xyXG5cclxuXHRcclxuXHRvLmdldCA9IGZ1bmN0aW9uKGlkKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvcG9zdHMvJyArIGlkKS50aGVuKGZ1bmN0aW9uKHJlcyl7XHJcblx0XHRcdFx0cmV0dXJuIHJlcy5kYXRhO1xyXG5cdFx0fSk7XHJcblx0fTtcclxuXHJcblx0by5hZGRDb21tZW50ID0gZnVuY3Rpb24oaWQsIGNvbW1lbnQpIHtcclxuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9wb3N0cy8nICsgaWQgKyAnL2NvbW1lbnRzJyAsIGNvbW1lbnQsIHtcclxuXHRcdFx0XHRcdFx0aGVhZGVyczoge0F1dGhvcml6YXRpb246ICdCZWFyZXIgJysgYXV0aC5nZXRUb2tlbigpfVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0fTtcclxuXHJcblxyXG5cdFxyXG5cdG8udXB2b3RlQ29tbWVudCA9IGZ1bmN0aW9uKHBvc3QsIGNvbW1lbnQpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wdXQoJy9wb3N0cy8nICsgcG9zdC5faWQgKyAnL2NvbW1lbnRzLycrIGNvbW1lbnQuX2lkICsgJy91cHZvdGUnLCBudWxsLCB7XHJcblx0XHRcdFx0XHRoZWFkZXJzOiB7QXV0aG9yaXphdGlvbjogJ0JlYXJlciAnK2F1dGguZ2V0VG9rZW4oKX1cclxuXHRcdFx0XHR9KS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHRcdFx0Y29tbWVudC51cHZvdGVzICs9IDE7XHJcblx0XHRcdFx0fSk7XHJcblx0fTtcclxuXHRcclxuXHRyZXR1cm4gbztcclxufV0pO1xyXG4iXX0=
