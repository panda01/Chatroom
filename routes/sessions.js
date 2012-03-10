/*
*	A basic session manager
*/

var sessions = [],
	lastActivity = 0;


function session(n)
{
	this.nick = n;
	this.id = sessions.length;
	this.created = new Date();
	this.lastActivity = this.created;
}

session.prototype.act = function() {
	var p = this.lastActivity;
	this.lastActivity = new Date();
	return p;
}

var userExists = exports.userExists = function(n){
	for( i in sessions )
		if( sessions[i].nick === n )
			return true;
	return false
}
var addUser = exports.addUser = function(n){
	var s = new session( n );
	sessions.push( s );
	console.log( sessions[sessions.length - 1].nick );
	return s;
}
var json = exports.json = function(){
	return { lastActivity: lastActivity, Users: sessions };
}

var act = exports.act = function(i){
	sessions[i].act();
}