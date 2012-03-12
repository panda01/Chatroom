/*
*	A basic session manager
*/

var sessions = [],			//all of the sessions
	lastAct = 0,			//last Activity
	timeout = 10000,		//the interval for cleanup
	timer,					//the timer for the cleanup interval
	idx = 0;				//the current idx or sessions.length-1

	
/*
*	Status for users
*/
var Status = {
	active: 0,				//Supported
	idle: 1,				//Supported(beta)
	working: 2,				//Not Supported
	dead: 3					//Supported(beta)
};
/*
*	The Session Object
*/
function session(n)
{
	this.id = idx++;					//ID
	this.nick = n;						//Nickname
	this.status = Status.active;		//Status
	this.created = new Date();			//Created
	this.lastAct = this.created;		//last Major Action (Act)
	this.last = this.created;			//last Minor Action (Poke)
}
/*
*	
*/
session.prototype.act = function() {
	var p = this.lastAct;
	this.lastAct = new Date();
	this.poke();
	return p;
}

session.prototype.poke = function() {
	var r = this.last;
	this.last = new Date();
	return r;
}

var userExists = exports.userExists = function(n){
	for( i in sessions )
		if( sessions[i].nick === n )
			return true;
	return false
}
/*
*	Checks to see is the passed in nickname and id correspond to an existing session
*
*	@param n: The nickname to be searched for
*	@param id: The id for the returning user
*/
var userReturn = exports.userReturn = function(n, id){
	if( sessions[id] && sessions[id].nick === n )
		return true;
	return false;
}
/*
*	Gets the user of the specified idx
*
*	@param idx: the index of the requested user
*	@return: the requested session or false on failure
*/
var getUser = exports.getUser = function(idx){
	if( sessions[idx] )
		return sessions[idx];
	return false;
}
/*
*	Adds a user to the sessions array, does no checking for redundancy
*
*	@param n: The nickname of the new user
*	@return: the new session created;
*/
var addUser = exports.addUser = function(n){
	var s = new session( n );
	sessions.push( s );
	return s;
}
/*
*	Gets the json representation of the current sessions
*
*	@return: the json representation of the current sessions
*/
var json = exports.json = function(){
	return { lastActivity: lastAct, Users: sessions };
}

var cleanUp = exports.cleanUp = function()
{
	var now = new Date().getTime();		//What time is it
	for( i in sessions )		//is it time to kill this session?
		if( now - sessions[i].last.getTime() > timeout )
			sessions[i].status = Status.dead;
		else if( now - sessions[i].lastAct.getTime() > (timeout) )// has the person not said anything for a minute?
			sessions[i].status = Status.idle;
			
};

var scheduleCleanUp	= exports.scheduleCleanUp = function() {
	time = setInterval(function(){ cleanUp(); }, timeout);
}

var poke = exports.poke = function(i){
	sessions[i].poke();
}
var act = exports.act = function(i){
	sessions[i].act();
}
var working = exports.working = function(i, b){
	if(b == true)
		sessions[i].status = Status.working;
	else
		sessions[i].status = Status.active;
}