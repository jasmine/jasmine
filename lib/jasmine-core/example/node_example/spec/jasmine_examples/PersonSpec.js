"use strict";
describe("Person", function(){
	var Player = require('../../lib/jasmine_examples/Player'),
  	 	Song = require('../../lib/jasmine_examples/Song'),
		 	Person = require('../../lib/jasmine_examples/Person'),
		 	person;

	beforeEach(function(){
		person = new Person();
	});

	it("has a mood", function(){
		expect(person.mood).toBeNull();
	});

	it("owns songs", function(){
		expect(person.songs.length).toBe(0);
	});

	it("owns a player", function(){
		expect(person.player).toBeNull();
	});

	it("can add a player", function(){
		var player = new Player();
		person.addPlayer(player);
		expect(person.player).not.toBeNull();
	});

	context("when losing a player", function(){
		it("loses their songs", function(){
			person.addPlayer( new Player());
			person.addSong( new Song());
			person.removePlayer();
			expect(person.songs.length).toBe(0);
		});
	});

	describe("mood", function(){
		context("when dancing", function(){
			_without("songs", function(){
				it("is bored", function(){
					person.addPlayer(new Player());
					person.dance();
					expect(person.getMood()).toBe("bored");
				});
			});

			_without("a player", function(){
				it("is bored", function(){
					person.addSong(new Song());
					person.dance();
					expect(person.getMood()).toBe("bored");
				});
			});

			_with("a player and songs", function(){
				it("is happy", function(){
					person.addPlayer(new Player());
					person.addSong(new Song());
					person.dance();
					expect(person.getMood()).toBe("happy");
				});
			});
		});
	});
});