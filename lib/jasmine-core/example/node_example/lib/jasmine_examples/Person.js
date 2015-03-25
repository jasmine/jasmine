function Person() {
	this.songs = [];
	this.player = null;
	this.mood = null;
};

Person.prototype.setMood = function(mood){
	this.mood = mood;
};

Person.prototype.getMood = function(){
	return this.mood;
};

Person.prototype.dance = function(){
	(this.player && this.songs.length) ? this.setMood("happy"): this.setMood("bored");
};

Person.prototype.addPlayer = function(player){
	this.player = player;
};

Person.prototype.addSong = function(song) {
	if(this.player){
		this.songs.push(song);
	}
};

Person.prototype.removePlayer = function(){
	this.player = null;
	this.removeSongs();
};

Person.prototype.removeSongs = function(){
	this.songs = [];
};

module.exports = Person;