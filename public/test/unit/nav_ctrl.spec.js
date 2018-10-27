describe("nav_ctrl", function(){

	//Instantiate a new version of  before each tests
	beforeEach(module("flapperNews"));
	var scope, ctrl;
	
	beforeEach(module(function($provide){
		mockAuth = {
			isLoggedIn: function(){},
			currentUser: function(){},
			logOut: function(){}
		};
		$provide.value("auth",mockAuth);
	}));
	
	beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            ctrl = $controller('NavCtrl', {$scope: scope,auth:mockAuth});
    }));

	it( "Auth will be defined", function(){
		expect(scope.isLoggedIn).toBeDefined();
		expect(scope.currentUser).toBeDefined();
		expect(scope.logOut).toBeDefined();
	});
});
