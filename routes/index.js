
/*
 * GET home page.
 */

var sessions = require('./sessions.js'),
	messages = require('./messages.js');
	
sessions.scheduleCleanUp();

exports.index = function(req, res){
	res.render('index', { title: 'gPanda Chat' })
};

exports.login = function(req, res){
	var v = req.body.login,
		cid = req.body.cookieid,
		s;
	if( v.length < 1 )
		res.json({error: 'Username too short'});
	else if( v.length > 50 )
		res.json({error: 'Username too long'});
	else if( sessions.userReturn( v, parseInt(cid) ) )
	{
		req.session.sess = sessions.getUser(cid);
		res.json({success: req.session.sess,
			members: sessions.json(),
			chat: messages.json()});
	}
	else if( sessions.userExists( v ) )
		res.json({error: 'Username already exists'});
	else
	{
		req.session.sess = sessions.addUser(v);
		res.json({success: req.session.sess,
			members: sessions.json(),
			chat: messages.json()});
	}
};

exports.send = function(req, res){
	var m = req.body.msg,
		u = req.body.sess;
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
	if( req.session.sess == undefined )
		res.json({error: 'Not signed in'});
	else
	{
		sessions.poke(req.session.sess.id);
		sessions.working(req.session.sess.id, ((req.query.typing == 1)?true:false) );
		res.json({members: sessions.json(),
			chat: messages.json()});
	}
}