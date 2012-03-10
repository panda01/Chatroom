
/*
 * GET home page.
 */

var sessions = require('./sessions.js'),
	messages = require('./messages.js');

exports.index = function(req, res){
	res.render('index', { title: 'gPanda Chat' })
};

exports.login = function(req, res){
	var v = req.body.login,
		s;
	if( v.length < 1 )
		res.json({error: 'Username too short'});
	else if( v.length > 50 )
		res.json({error: 'Username too long'});
	else if( sessions.userExists( v ) )
		res.json({error: 'Username already exists'});
	else
		res.json({success: sessions.addUser(v),
			members: sessions.json(),
			chat: messages.json()});
};

exports.send = function(req, res){
	var m = req.body.msg,
		u = req.body.sess;
	console.log( m );
	if( m.length < 1 )
		res.json({error: 'No Nessage'});
	else if( u === undefined )
		res.json({error: 'User error'});
	else
	{
		sessions.act(u.id);
		messages.addMessage( u, m );
		res.json({ chat: messages.json(),
			members: sessions.json(),
			sess: u });
	}
}

exports.update = function(req, res){
	res.json({members: sessions.json(),
		chat: messages.json()});
}