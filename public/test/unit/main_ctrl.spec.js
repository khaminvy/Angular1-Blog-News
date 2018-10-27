//Main Controlers tests
describe("controller:Main Ctrl", function(){
	beforeEach(module("flapperNews"));
	var scope, ctrl, state;
	beforeEach(module(function($provide){
		mockpost = {upvotes:0};
		mockPosts = {
			getAll: function(){
				return [];
			}
		}
		$provide.value("posts",mockPosts);
	}));
	beforeEach(inject(function ($rootScope, $controller,$state,$templateCache) {
			$templateCache.put('../partials/home.html',"some")
			state = $state;
            scope = $rootScope.$new();
            ctrl = $controller('MainCtrl', {$scope: scope,posts: mockPosts});
    }));
	it( "should be call a posts.getAll", function(){
		spyOn(mockPosts,"getAll");
		state.go("home");
		scope.$digest();
		expect(mockPosts.getAll).toHaveBeenCalled();
	});
});

describe("controller:Main Ctrl", function(){
	//Instantiate a new version of  before each tests
	beforeEach(module("flapperNews"));
	
	var scope, ctrl;
	beforeEach(module(function($provide){
		mockpost = {upvotes:0};
		mockPosts = {
			posts:[
			],
			create: function(post){
				this.posts.push(post);
			},
			upvote: function(post){
				post.upvotes += 1;
			}
		};
		$provide.value("posts",mockPosts);
	}));

    beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            ctrl = $controller('MainCtrl', {$scope: scope, posts: mockPosts});
    }));
	
	it( "Posts will empty at beginning", function(){
		expect(scope.posts.length).toEqual(0);
	});
	it( "Posts should remain empty if title is blank.", function(){
		scope.title = "";
		scope.addPost();
		expect(scope.posts.length).toEqual(0);
	});
	it( "Posts will increase one if title is not blank.", function(){
		scope.title = "title1";
		scope.link = "link1";
		scope.addPost();
		expect(scope.posts.length).toEqual(1);
		scope.title = "title2";
		scope.link = "link2";
		scope.addPost();
		expect(scope.posts.length).toEqual(2);
	});
	it( "Checking posts after addPost call", function(){
		scope.title = "title1";
		scope.link = "link1";
		scope.addPost();
		expect(scope.posts).toEqual([
			{title : "title1",link: "link1"}
		]);
		scope.title = "title2";
		scope.link = "link2";
		scope.addPost();
		expect(scope.posts).toEqual([
			{title : "title1",link: "link1"},
			{title : "title2",link: "link2"}
		]);
	});
	it( "Title and link is blank after addPost call", function(){
		scope.title = "title";
		scope.link = "link";
		scope.addPost();
		expect(scope.title).toEqual("");
		expect(scope.link).toEqual("");
	});
	
	it( "Post upvotes is zero at beginning", function(){
		expect(mockpost.upvotes).toEqual(0);
		scope.incrementUpvotes(mockpost);
		expect(mockpost.upvotes).toEqual(1);
		scope.incrementUpvotes(mockpost);
		expect(mockpost.upvotes).toEqual(2);
	});
	
});

describe("controller:Main Ctrl with spy callThrough", function(){
	//Instantiate a new version of  before each tests
	beforeEach(module("flapperNews"));
	var ctrl;
	beforeEach(module(function($provide){
		mockpost = {upvotes:0};
		mockPosts = {
			posts:[
			],
			create: function(post){
				this.posts.push(post);
			},
			upvote: function(post){
				post.upvotes += 1;
			}
		};
		$provide.value("posts",mockPosts);
	}));
	beforeEach(inject(function ($rootScope, $controller) {
			spyOn(mockPosts,"create").and.callThrough();
            scope = $rootScope.$new();
            ctrl = $controller('MainCtrl', {$scope: scope, posts: mockPosts});
    }));
	
	it( "Should call the create method of mockPosts", function(){
		scope.title = "title1";
		scope.link = "link1";
		scope.addPost();
		expect(mockPosts.create).toHaveBeenCalled();
		expect(mockPosts.create.calls.count()).toEqual(1);
	});
	
});

describe("controller:Main Ctrl with Spy Return", function(){
	//Instantiate a new version of  before each tests
	beforeEach(module("flapperNews"));
	var ctrl, postsA;
	beforeEach(module(function($provide){
		mockpost = {upvotes:0};
		mockPosts = {
			posts:[
			],
			create: function(post){
				this.posts.push(post);
			},
			upvote: function(post){
				post.upvotes += 1;
			}
		};
		$provide.value("posts",mockPosts);
	}));
	beforeEach(inject(function ($rootScope, $controller) {
			spyOn(mockPosts,"create").and.returnValue({title : "title1"});
            scope = $rootScope.$new();
            ctrl = $controller('MainCtrl', {$scope: scope, posts: mockPosts});
    }));
	
	it( "Should call the create method of mockPosts", function(){
		
		scope.title = "title1";
		scope.link = "link1";
		scope.addPost();
		expect(mockPosts.create).toHaveBeenCalled();
		expect(mockPosts.create.calls.count()).toEqual(1);
	});
	
});

