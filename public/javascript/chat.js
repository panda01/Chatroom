(function()
{
	var $login,
		$chat,
		users,
		messages,
		update;
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
				v = $input.val();
				
			if( v.length < 1 )
				$input.next().html('Oops, you have to enter a value');
			else if( v.length > 50  )
				$input.next().html('Username Too long');
			else
			{
				$.post('http://localhost:3000/login',
					{login: v},
					function(data){
						if( data.error !== undefined )
							$input.next().html( data.error );
						else
						{
							$login.hide();
							$chat.show();
							console.log( data.members.Users );
							users = new Users( data.success, data.members.Users );
							messages = new Messages( data.chat.Messages );
							
							render();
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
				$.post('http://localhost:3000/send/',
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
	}
	function updateChat()
	{
		update = setInterval(function(){
			$.getJSON('http://localhost:3000/update',
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
			m += '<div class="bold user user-id-' + u.id + '">';
				m += u.nick;
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
	$(document).ready(function(){ initPage(); });
}())