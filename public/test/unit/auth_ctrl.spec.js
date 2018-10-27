describe("controller:Auth Ctrl", function(){
	beforeEach(module("flapperNews"));
	var scope, ctrl, state;
	beforeEach(module(function($provide){
		mockAuth = {
			isLoggedIn: function(){
				return true;
			}
		};
		$provide.value("auth",mockAuth);
	}));
	
	beforeEach(inject(function ($rootScope, $controller,$state,$templateCache) {
			$templateCache.put('../partials/login.html',"some");
			$templateCache.put('../partials/register.html',"some");
			state = $state;
            scope = $rootScope;
            ctrl = $controller('AuthCtrl', {$scope: scope,auth:mockAuth});
    }));
	it( "should be call a posts.getAll", function(){
		spyOn(mockAuth,"isLoggedIn");
		state.go("login");
		scope.$digest();
		expect(mockAuth.isLoggedIn).toHaveBeenCalled();
	});
	it( "should be call a posts.getAll", function(){
		spyOn(mockAuth,"isLoggedIn");
		state.go("register");
		scope.$digest();
		expect(mockAuth.isLoggedIn).toHaveBeenCalled();
	});
});
