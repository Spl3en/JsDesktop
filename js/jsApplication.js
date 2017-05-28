/**
*	@title : jsApplication.js
*	@author : Spl3en
*	@contact : Spl3en.contact@gmail.com
*/

function JsExplorer (window)
{
	this.appName = "jsExplorer";
	this.window = window;
	this.path = window.path;
	this.name = window.name;
	this.iconArray = new Array();
	this.pathHistory = new Array();
	
	this.build();
	
	return this;
}

JsExplorer.prototype = 
{
	process : function ()
	{
		var oThis = this;
		ajax.send(function (res) {oThis.window.getDir(res, oThis); }, 'scanFolder', this.path + this.name);
	},
	
	build : function ()
	{
		this.window.addPluginHeight(60);
		var window = this.window;
		var oThis = this;
	
		var headerExplorer = document.createElement('div');
		registerObject(headerExplorer, window.divName + '_jsApplication_Explorer_Header', 'jsApplication_Explorer_Header', window);
		
		var b = null;
		var bNav =  document.createElement('div');
		addClass(bNav, 'jsApplication_Explorer_HeaderbNav');

		b = new JsButton ('previousExplorer', window, function () {oThis.previous()});
		b.setActive(false);
		bNav.appendChild(b.div);
		
		b = new JsButton ('forwardExplorer', window, function () {oThis.forward()});
		b.setActive(false);
		bNav.appendChild(b.div);

		b = new JsButton ('upExplorer', window, function () {oThis.up()});
		b.setActive(false);
		bNav.appendChild(b.div);
		
		headerExplorer.appendChild(bNav);
		
		var pathBar = document.createElement('div');
		registerObject(pathBar, window.divName + '_jsApplication_Explorer_PathBar', 'jsApplication_Explorer_PathBar', window);
		
		var d = document.createElement('div');
		addClass(d, 'jsApplication_Explorer_PathBarLeft');		
		pathBar.appendChild(d);
		
		var pathBarContent = document.createElement('div');
		addClass(pathBarContent, 'jsApplication_Explorer_PathBarContent');
		pathBar.appendChild(pathBarContent);
		
		d = document.createElement('div');
		addClass(d, 'jsApplication_Explorer_PathBarRight');
		pathBar.appendChild(d);
		
		b = new JsButton ('thumbnailExplorer', window, function () {oThis.setThumnail()});
		pathBarContent.appendChild(b.div);
		
		b = new JsButton ('tilesExplorer', window, function () {oThis.setTiles()});
		pathBarContent.appendChild(b.div);
		
		b = new JsButton ('iconsExplorer', window, function () {oThis.setIcons()});
		pathBarContent.appendChild(b.div);
		
		b = new JsButton ('detailsExplorer', window, function () {oThis.setDetails()});
		pathBarContent.appendChild(b.div);
		
		d = document.createElement('div');
		addClass(d, 'jsApplication_Explorer_PathbarTextLeft');
		pathBarContent.appendChild(d);
		
		var pathBarTextContent = document.createElement('div');
		addClass(pathBarTextContent, 'jsApplication_Explorer_PathbarTextContent');
		pathBarContent.appendChild(pathBarTextContent);
		
		var inputPath = document.createElement('input');
		registerObject(inputPath, window.divName + '_jsApplication_Explorer_PathbarText', 'jsApplication_Explorer_PathbarText', window);
		inputPath.type = 'text';
		pathBarTextContent.appendChild(inputPath);
		
		d = document.createElement('div');
		addClass(d, 'jsApplication_Explorer_PathbarTextRight');
		pathBarContent.appendChild(d);
		
		headerExplorer.appendChild(pathBar);
		
		b = new JsButton ('optionExplorer', window, function () {oThis.getOptions()});
		headerExplorer.appendChild(b.div);
		
		window.div.insertBefore(headerExplorer, window.content);
		
		this.pathContainer = inputPath;
		this.setTitlePath(this.path, this.name);
		
		window.refreshContentSize();
		window.setDragSensitive(true);
	},
	
	setTitlePath : function (path, name)
	{
		this.path = path;
		this.name = name;
		
		this.pathContainer.value = path + name;
	},
	
	setPath : function (newPath)
	{
		var win = this.window;
		var arr = win.iconArray;
		this.path = newPath;
		
		for (var i = 0; i < arr.length; i++)
		{
			arr[i].path = newPath + this.name + '/';
		}
		
		this.setTitlePath(newPath, this.name);
	}
}

function JsImageViewer (window)
{
	this.window = window;
	this.img = null;
	this.height = 0;
	this.width = 0;
	this.zoom = 1;

	return this;
}

JsImageViewer.prototype =
{
	errorLoading : function ()
	{
		wlog('error');
		
		this.window.content.style.textAlign = 'center';
		this.window.content.style.color = 'red'
		;
		this.window.content.innerHTML = '<br/><br/>Sorry, but the image cannot be loaded.';
	},
	
	process : function ()
	{
		var window = this.window;
		var deskSize = desktop.workArea.getSize();
		var deskW = deskSize.width;
		var deskH = deskSize.height;
		var oThis = this;
		
		this.img = new Image();
		this.img.src = 'home' + window.path + window.name;
		
		addEvent(this.img, 'error', function () {oThis.errorLoading();});
		ajax.preload('home' + window.path + window.name, function () {});
		
		window.open();
		window.setCenter();
		window.setMaximize();
	
		window.content.appendChild(this.img);
	}
}

function JsTransfer (file, dest)
{
	this.sec = 1;
	this.file = file;
	this.dest = dest;
	this.transferComplete = false;
	this.isOpen = false;
	
	return this;
}

JsTransfer.prototype =
{
	build : function ()
	{
		addClass(this.window.div, 'jsApplication_Transfer_Window');
		this.window.setSize(300, 200);
		this.window.setCenter();
	},
	
	close : function ()
	{
		this.transferComplete = true;
		
		if (this.isOpen)
			this.window.remove();
	},
	
	load : function ()
	{
		if (this.transferComplete)
			return;
		
		this.window = new JsWindow('Transfer', true, desktop.workArea);
		this.build();
		this.isOpen = true;
	},
	
	process : function ()
	{
		var oThis = this;
		
		setTimeout(function () {
			oThis.load();
		}, this.sec * 1000);

		ajax.send
		(
			function (res) {
				oThis.close();
				desktop.transferComplete(res, oThis.file, oThis.dest);
			},
			
			'moveObject',
			
			this.file.path + this.file.name,
			this.dest.path + this.dest.name
		);
	}
}

function JsConsole ()
{





}

JsConsole.prototype =
{




}