/*
*	Messages
*/
var messages = [],
	lastActivity = 0;

	

function Message(id, name, created, txt)
{
	this.user = {id: id, nick: name};
	this.msg = txt;
	this.time = created;
}

var addMessage = exports.addMessage = function(usr, msg)
{
	messages.push( new Message( usr.id, usr.nick, usr.lastActivity, msg ) );
	return messages;
}

var json = exports.json = function(){
	return { lastActivity: lastActivity, Messages: messages};
}