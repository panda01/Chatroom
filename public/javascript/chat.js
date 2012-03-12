(function()
{
	var $login,
		$chat,
		users,
		messages,
		update,
		typing = { is: 0, timer: null},
		Status = ['active', 'idle', 'typing', 'dead'];//sets up the User status variable, to be modifed
	function initPage()
	{
		initGlobalVars();
		initDOM();
		initEvents();
	}
	function initGlobalVars()
	{
		$login = $('#login');
		$chat = $('#chat');
	}
	function initDOM()
	{
		$chat.hide();
		$(':input').each(function()
		{
			if( $(this).attr('type') === 'text' )
			{
				var c = ($(this).attr('class') === undefined)? '': ' ' + $(this).attr('class');
				$(this).data('watermark', $(this).val())
					.wrap('<div class="input-wrap' + c + '" />')
					.after('<div class="errors"></div>');
			}
		});
	}
	function initEvents()
	{
		$(':input').focus(function()
		{
			if( $(this).data('watermark') == $(this).val() )
				$(this).val('');
		})
		.blur(function()
		{
			if( $(this).data('watermark') !== undefined && $(this).val() == '')
				$(this).val( $(this).data('watermark') );
		});
		
		//forms
		$login.find('form').submit(function()
		{
			var $input = $(this).find('input#name'),
				id = $(this).find('input#sessid').val(),
				v = $input.val();
			if( v.length < 1 )
				$input.next().html('Oops, you have to enter a value');
			else if( v.length > 50  )
				$input.next().html('Username Too long');
			else
			{
				$.post('/login',
					{login: v, cookieid: id},
					function(data){
						if( data.error !== undefined )
							$input.next().html( data.error );
						else
						{
							$login.hide();
							$chat.show();
							users = new Users( data.success, data.members.Users );
							messages = new Messages( data.chat.Messages );
							if( readCookie('gpandachatid') === null || readCookie('gpandachatnick') === null )
							{
								createCookie( 'gpandachatid', data.success.id, 5 );
								createCookie( 'gpandachatnick', data.success.nick, 5 );
							}
							render();
							updateChat();
						}
					},'json');
			}
			
			return false;
		});
		$chat.find('form').submit(function()
		{
			var $in = $(this).find('input#msg'),
				v = $in.val();
			if( v.length < 1 )
				$in.next().html('Please Enter a message');
			else
			{
				clearInterval( update );
				$.post('/send',
					{ msg: v, sess: users.getMe() },
					function(data){
						if( data.error !== undefined )
							$in.next().html( data.error );
						else
						{
							$in.val('');
							users.update( data.members.Users );
							users.updateMe( data.sess );
							messages.update( data.chat.Messages );
							render();
							updateChat();
						}
					}, 'json');
			}
			return false;
		});
		$chat.find('input#msg').keypress(function()
		{
			clearTimeout( typing.timer );
			typing.is = 1;
			typing.timer = setTimeout(function(){
				typing.is = 0;
			}, 3000);
		});
		
		if( readCookie('gpandachatnick' ) !== null  && readCookie('gpandachatid') !== null ) //if you have cookies from this page
		{
			$login.find('input#sessid').val( readCookie('gpandachatid') );
			$login.find('input#name').val( readCookie('gpandachatnick') );
			$login.find('form').submit();
		}
	}
	function updateChat()
	{
		update = setInterval(function(){
			$.getJSON('/update',
				{ typing: typing.is },
				function(data){
					users.update( data.members.Users );
					messages.update( data.chat.Messages );
					render();
				});
		}, 1500 );
	}
	function render()
	{
		users.render( $chat.find('#users') );
		messages.render( $chat.find('#messages-wrap') );
	}
	/*
	*	Users
	*	A class to contain all of the User functions 
	*/
	function Users(me)
	{
		this.me = me;
		this.usrs = [];
		if( arguments[1] !== undefined )
			this.update( arguments[1] );
	}
	//Functions
	/*
	*	Takes in a Jquery Object and draws the list in
	*/
	Users.prototype.render = function( $o )
	{
		var m = '<h3>Current Users:</h3>';		//markup
		for( i in this.usrs )
		{
			var u = this.usrs[i];	//the user
			
			m += '<div class="user id-' + u.id + ' status-' + Status[u.status] + '">';
				m += u.nick + ((Status[u.status] === 'typing')? '<i>Typing</i>': '') ;
			m += '</div>';
		}
		$o.html( m );
	}
	//Mutators
	Users.prototype.update = function(n)
	{
		var t = this.usrs;
		this.usrs = n;
		return t;
	}
	Users.prototype.updateMe = function(m)
	{
		var r = this.me;
		this.me = m;
		return m;
	}
	//Accessors
	Users.prototype.getMe = function()		{ return this.me; }
	/*
	*	Messages for managing all of the messages back and fourth
	*/
	function Messages()
	{
		this.msgs = [];
		if( arguments[0] !== undefined )
			this.update( arguments[0] );
	}
	Messages.prototype.update = function(m){
		var r = this.msgs;
		this.msgs = m;
		return r;
	}
	Messages.prototype.render = function( $o ){
		var m = '<h3>Chat</h3><div id="messages">';
		for( i in this.msgs )
		{
			var c = this.msgs[i];
			m += '<div class="message">';
				m += '<div class="user fleft">' + c.user.nick + ': </div>';
				m += c.msg;
			m += '</div>';
		}
		m += '</div>';
		$o.html( m );
	}
	function createCookie(name,value,days) 
	{
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}

	function readCookie(name) 
	{
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}

	function eraseCookie(name) 
	{
		createCookie(name,"",-1);
	}
	$(document).ready(function(){ initPage(); });
}())