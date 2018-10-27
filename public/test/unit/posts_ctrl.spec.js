describe("controller:Main Ctrl with spy callThrough", function(){
	//Instantiate a new version of  before each tests
	beforeEach(module("flapperNews"));
	var ctrl, mockBackend;
	var mockcomment = {body:"body",author:"user"};
	beforeEach(module(function($provide){
		mockpost = {_id:0,comments:[]};	
		$provide.value("post",mockpost);

	}));
	beforeEach(module(function ($urlRouterProvider) {
		$urlRouterProvider.otherwise(function(){return false;});
	}));
	beforeEach(inject(function ($rootScope, $controller, $httpBackend) {

            scope = $rootScope.$new();
			ctrl = $controller('PostsCtrl', {$scope: scope});
			
    }));
	
	it( "Should call the addComment method of posts", function(){
		expect(scope.post).toBeDefined();
		expect(scope.post).toBe(mockpost);
		expect(scope.post).toEqual(mockpost);
		expect(scope.post.comments).toBeDefined();
		expect(scope.post.comments.length).toEqual(0);
		scope.body = "";
		expect(scope.post.comments.length).toEqual(0);;
		expect(scope.body).toEqual("");
	});	

});


describe("controller:Main Ctrl with spy callThrough", function(){
	//Instantiate a new version of  before each tests
	beforeEach(module("flapperNews"));
	var ctrl, mockBackend;
	var mockcomment = {body:"body",author:"user"};
	beforeEach(module(function($provide){
		mockpost = {_id:0,comments:[]};
		mockPosts = {
			posts:[
			],
			upvoteComment: function(post,comment){
				return 5;
			}
		};
		$provide.value("post",mockpost);
	}));
	beforeEach(module(function ($urlRouterProvider) {
		$urlRouterProvider.otherwise(function(){return false;});
	}));
	beforeEach(inject(function ($rootScope, $controller, $httpBackend) {
		    mockBackend = $httpBackend;
			mockBackend.expectPOST('/posts/' + mockpost._id + '/comments',
				mockcomment)
				.respond(200,mockcomment);
            scope = $rootScope.$new();
			ctrl = $controller('PostsCtrl', {$scope: scope});
    }));
	afterEach(function() {
    // Ensure that all expects set on the $httpBackend
    // were actually called
    mockBackend.verifyNoOutstandingExpectation();

    // Ensure that all requests to the server
    // have actually responded (using flush())
    mockBackend.verifyNoOutstandingRequest();
  });
	it( "Should call the addComment method of posts", function(){
		expect(mockPosts).toBeDefined();
		expect(scope.post.comments.length).toEqual(0);
		scope.body = "body";
		scope.addComment();
		mockBackend.flush();
		expect(scope.post.comments[0]).toEqual({body:"body",author:"user"});
		scope.body = "";
		scope.addComment();
		expect(scope.post.comments.length).toEqual(1);
	});
	it( "Should call the addComment method of posts", function(){
		expect(scope.post.comments.length).toEqual(0);
		scope.body = "body";
		scope.addComment();
		mockBackend.flush();
		expect(scope.post.comments[0].body).toEqual("body");
		expect(scope.body).toEqual("");
	
	});
});
