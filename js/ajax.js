/**
*	@title : ajax.js
*	@author : Moreau Cyril - Spl3en
*	@contact : spl3en.contact@gmail.com
*/

function Ajax ()
{
	this.ajaxServer = 'php/ajaxServer.php';
	this._async = true;
	
	return this;
}

Ajax.prototype = 
{
	getXhr : function ()
	{
		if (window.XMLHttpRequest) 
			return new XMLHttpRequest(); 

		if (window.ActiveXObject) 
		{
			var IeXhr = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"]; 

			for (var i in IeXhr)
			{
				try { return new ActiveXObject(IeXhr[i]); } 
				catch(e) { }
			}
		} 

		return null;
	},
	
	setAsync : function (async)
	{
		this._async = async;
	},
	
	connect : function (xhr)
	{
		xhr.open('post', this.ajaxServer, this._async);

		xhr.setRequestHeader ( 
			'Content-Type', 
			'application/x-www-form-urlencoded;charset=ISO-8859-15' 
		);
	},
	
	send : function (callback, funcName)
	{
		var oThis = this;
		var xhr = this.getXhr();
		this.connect(xhr);
		
		var strPost = 'funcName=' + funcName + '&';
		
		for (var i = 2; i < arguments.length; i++)
		{
			strPost += "arg" + (i-1) 
					 + "=" + encodeURIComponent(arguments[i]) + "&";
		}
		
		addEvent(xhr , 'readystatechange', function onReceiveData()
		{
			if (xhr.readyState == 4) {
				callback(xhr.responseText); 
			} 
		});
		
		xhr.send(strPost);
	},
	
	
	preload : function (file, callback)
	{
		var oThis = this;
		var xhr = this.getXhr();
		
		addEvent(xhr , 'readystatechange', function onReceiveData()
		{
			if (xhr.readyState == 4) {
				callback();
			}
		});
		
		xhr.open('GET', file);
		xhr.send('');
	}
}