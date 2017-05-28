/**
*	@title : jsDesktop.js
*	@author : Spl3en
*	@contact : Spl3en.contact@gmail.com
*/

// Environnement
var desktop = null;

// Server connection
var ajax = new Ajax();

// Debug
var console = null;

function JsMenu (parent)
{



}

JsMenu.prototype = 
{



}

function JsWindow (divName, isWindowed, parentJsWindow)
{			
	var newWindow = document.createElement('div');
	registerObject(newWindow, divName + (desktop.idHandle) + '_JsWindowDiv', 'JsWindow');
	
	if (isWindowed)
	{
		addClass(newWindow, 'isRounded');
		addClass(newWindow, 'isWindow');
	}
		
	newWindow.style.zIndex = desktop.getStyleIndex();
	newWindow.parentJsWindow = this;

	this.attachWindow(newWindow, parentJsWindow);

	this.isWindow = isWindowed;
	this.divName = divName + (desktop.idHandle++);
	this.div = newWindow;
	this.setCoordArray();
	this.destX = 0;
	this.destY = 0;
	this.curPos = null;
	this.iconArray = new Array();
	this.posArrayList = new Array();
	this.pluginContentHeight = 0;
	this.isAnimated = false;
	this.isMaximized = false;
	this.isMinimized = false;
	this.isFocused = false;
	this.isClosing = false;
	this.isResizable = false;
	this.isResized = false;
	this.isDragged = false;
	this.focusObject = null;
	this.iconCaller = null;
	this.directionIcon = 'width';
	this.path = '';
	this.name = '';
	
	this.minSizeWidth = 510;
	this.minSizeHeight = 200;
	this.movementSpeed = 30;
	this.title = divName;
	
	var oThis = this;
	this.refTryPutObject = function (e) {oThis.tryPutObject(e);};

	if (this.isWindow)
	{
		this.buildHeader();
		this.addToTaskBar();
		this.setResizable();
		desktop.addWindow(this);
	}
	
	this.buildContent();
	this.setTitle(divName);
	this.setDragSensitive(false);
	
	return this;
}

JsWindow.prototype =
{
	setDragSensitive : function (active)
	{
		var oThis = this;
		
		this.dragSensitive = active;
		addEvent(this.content, 'mouseover', this.refTryPutObject);
	},
	
	tryPutObject : function (event)
	{
		if (desktop.draggedObject == null)		
			return true;
		
		else if (this.dragSensitive == false)
			return true;
		
		desktop.dropObject = this;
		desktop.dropObject.childJsWindow = this;
	},
	
	setResizable : function ()
	{
		var oThis = this;
		this.isResizable = true;
		
		addEvent(this.div, 'mousemove', function (e) {oThis.tryResize(e);});
		addEvent(this.div, 'mousedown', function (e) {oThis.resizeBegin(e);});
	},
	
	resizeBegin : function (e)
	{
		var oThis = this;
		this.refResizeProcess = function (e) {oThis.resizeProcess(e);};
		this.refResizeEnd = function (e) {oThis.resizeEnd(e);};
		
		if (e.button == 1 && window.event != null || e.button == 0)
		{	
			if (this.curPos == null)
				return;
			
			this.isResized = true;
			this.setFocus();
			
			this.resizeLastX = (this.curX + this.getSize().width);
			this.resizeLastY = (this.curY + this.getSize().height);
			
			addEvent(window, 'mousemove', this.refResizeProcess);
			addEvent(window, 'mouseup', this.refResizeEnd);
			addEvent(document, 'selectstart', function () {return false;});	
		}
	},
	
	resizeProcess : function (e)
	{
		if (this.isResized == false)
			return;

		if (this.curPos == null || this.curPos == undefined)
			return;
			
		if (!this.isWindow)
			return;
		
		if (e == null)
			e = window.event;
			
		var _mouseX = e.clientX;
		var _mouseY = e.clientY - desktop.theme.headerWindowHeight - (desktop.theme.taskbarHeight - desktop.theme.headerWindowHeight);
		
		disableSelection(document.body);
		
		for (var i = 0; i < this.curPos.length; i++)
		{
			var resDir = this.curPos.charAt(i);
			
			switch (resDir)
			{
				case 'g' :
					var newWidth = this.getSize().width + (this.curX - _mouseX);
					
					if (newWidth >= this.minSizeWidth)
					{
						this.setSize (
							newWidth,
							this.getSize().height
						);
						
						this.curX = _mouseX;
					}
				break;
				
				case 'd' :
					var newWidth = this.getSize().width + (_mouseX - this.resizeLastX);
					
					if (newWidth >= this.minSizeWidth)
					{
						this.setSize (
								newWidth,
								this.getSize().height
						);
						
						this.resizeLastX = (this.curX + this.getSize().width);
					}
				break;
				
				
				case 'h' :
					var newHeight = this.getSize().height + (this.curY - _mouseY);
					
					if (newHeight >= this.minSizeHeight)
					{
						this.setSize (
							this.getSize().width,
							newHeight
						);
						
						this.curY = _mouseY;
					}
				break;
				
				
				case 'b' :
					var newHeight = this.getSize().height + (_mouseY - this.resizeLastY);
					
					if (newHeight >= this.minSizeHeight)
					{
						this.setSize (
								this.getSize().width,
								newHeight
						);
						
						this.resizeLastY = (this.curY + this.getSize().height);
					}
				break;
				
			}
		}
		
		this.displayAt(this.curX, this.curY);
	},
	
	resizeEnd : function (e)
	{
		if (this.isResized == false)
			return;
			
		enableSelection(document.body);
		
		this.isResized = false;
		
		removeEvent(document, 'mousemove', this.refResizeProcess);
		removeEvent(document, 'mouseup', this.refResizeEnd);
		removeEvent(document, 'selectstart', function () {return false;});	
	},
	
	tryResize : function (e)
	{
		if (this.isResized == true)
			return;
		
		if (this.isMaximized == true)
			return;
		
		var margin = 5;
		
		if (e == null) 
			e = window.event;
		
		var realX = e.clientX - this.curX;
		var realY = e.clientY - this.curY - desktop.theme.taskbarHeight;
		
		realX = (realX < 0) ? 0 : realX;
		realY = (realY < 0) ? 0 : realY;
		
		var s = this.div.style;
		this.curPos = null;
		
		if (realX < margin)
		{
			if (realY < margin)
			{
				// Haut à gauche
				s.cursor = 'nw-resize';
				this.curPos = 'hg';
			}
			
			else if (realY > this.getSize().height - margin)
			{
				// Bas à gauche
				s.cursor = 'sw-resize';
				this.curPos = 'bg';
			}
			
			else
			{
				// Gauche
				s.cursor = 'e-resize';
				this.curPos = 'g';
			}
		}
		
		else if (realY < margin)
		{
			if (realX > this.getSize().width - margin)
			{
				// Haut à droite
				s.cursor = 'sw-resize';
				this.curPos = 'hd';
			}
			
			else
			{
				// Haut
				s.cursor = 's-resize';
				this.curPos = 'h';
			}		
		}
		
		else if (realX > this.getSize().width - margin)
		{
			if (realY > this.getSize().height - margin)
			{
				// Bas à droite
				s.cursor = 'nw-resize';
				this.curPos = 'bd';
			}
			
			else
			{
				// Droite
				s.cursor = 'e-resize';
				this.curPos = 'd';
			}
		}
		
		else if (realY > this.getSize().height - margin)
		{
			// Bas
			s.cursor = 's-resize';
			this.curPos = 'b';
		}
		
		else
		{
			s.cursor = "default";
		}
		
	},
	
	remove : function ()
	{
		if (!this.isClosing)
		{
			this.onClose();
			this.removeFromTaskBar();
			this.removeFocus();
			
			delete this;
		}
	},

	buildHeader : function ()
	{
		var oThis = this;
		var headerBar = document.createElement('div');
		headerBar.height = desktop.theme.headerWindowHeight;
		
		registerObject(headerBar, this.divName + '_JsWindowHeader', 'jsWindowHeader', this);
		
		this.headerBar = headerBar;
		this.setHeaderBackground('url(img/window/headerBarInactive.png) repeat-x');
		this.div.appendChild(headerBar);
		
		var bWidth = 20;
		var bHeight = 10;
		
		var b = new JsButton (
			'Close', this, function () {oThis.remove();}
		);
		headerBar.appendChild(b.div);
		
		b = new JsButton (
			'Maximize', this, function () {oThis.setMaximize();}
		);	
		headerBar.appendChild(b.div);
		
		b = new JsButton (
			'Minimize', this, function () {oThis.onMinimize();}
		);
		headerBar.appendChild(b.div);
		
		addEvent(headerBar, 'dblclick', function () {oThis.setMaximize()});
		addEvent(headerBar, 'mousedown', function (e) {oThis.headerBarOnMouseDown(e)});
	},
	
	headerBarOnMouseDown : function (e)
	{
	    if (isClickLeft(e))
		{
			this.setFocus();
			this.beginDrag(e);
		}
	},
	
	onMinimize : function ()
	{
		var oThis = this;
		
		if (this.isMinimized == false && this.isFocused == true)
		{
			this.isMinimized = true;
			this.fadeAnimation(15, true, function () {oThis.div.style.display = 'none';});
			this.removeCurrentFocus();
		}
		
		else
		{
			this.isMinimized = false;
			this.fadeAnimation(15, false);
			this.setFocus();
		}
	},
	
	beginDrag : function (e)
	{
		var pos = this.getPos();
		var oThis = this;
		this.refOnDrag = function (e) {oThis.onDrag(e)};
		this.refDragEnd = function (e) {oThis.dragEnd(e)};
		
		this.isDragged = true;
		this.startX = e.clientX;
		this.startY = e.clientY;
		this.offsetX = pos.x;
		this.offsetY = pos.y;
		
		document.body.focus();
		
		addEvent(document, 'mousemove', this.refOnDrag);
		addEvent(document, 'mouseup', this.refDragEnd);
		addEvent(document, 'selectstart', function () {return false;});
		addEvent(this.div, 'dragstart', function (e) { e.preventDefault();});	
	},
	
	getContentSize : function ()
	{
		var style = this.content.style;
		
		return {'width' : parseInt(style.width), 'height' : parseInt(style.height)};
	},
	
	onDrag : function (e)
	{
		if (this.isMaximized == true)
			return;
		
		if (this.isResized == true)
			return;
			
		if (!this.isDragged)
			return;
		
		if (e == null) 
			e = window.event;
		
		var rootSize = this.rootJsWindow.getSize();
		var dragWindowSize = this.getSize();
		var realX = (this.offsetX + e.clientX - this.startX);
		var realY = (this.offsetY + e.clientY - this.startY);
		var maxY =  rootSize.height - dragWindowSize.height - 5;
		var maxX =  rootSize.width - dragWindowSize.width - 5;
		
		realX = (realX < 0) ? 0 : realX;
		realY = (realY < 0) ? 0 : realY;
		realX = realX < (maxX) ? realX : maxX;
		realY = realY < (maxY) ? realY : maxY;
		
		this.div.style.left =  realX + 'px';
		this.div.style.top = realY + 'px';
		
		this.curX = realX;
		this.curY = realY;
	},
	
	dragEnd : function (e)
	{
		this.isDragged = false;
		
		removeEvent(document, 'mousemove', this.refOnDrag);
		removeEvent(document, 'mouseup', this.refDragEnd);
		removeEvent(document, 'selectstart', function () {return false;});
		removeEvent(this.div, 'dragstart', function (e) { e.preventDefault(); });

		this.startY = 0; 
		this.startX = 0;
		this.offsetX = 0;
		this.offsetY = 0;
	},
	
	addPluginHeight : function (value)
	{
		this.pluginContentHeight += value;
	},

	setOpacity : function (opacity)
	{
		makeOpacity(this.content.style, opacity);
	},

	setFocus : function ()
	{
	
		if (this.isMinimized)
		{
			this.isMinimized = false;
			this.fadeAnimation(15, false);
		}
		
		var rWindow = this.rootJsWindow;
		
		if (rWindow == null)
			return;
	
		if (rWindow.focusObject != null)
			rWindow.focusObject.removeFocus();
				
		rWindow.focusObject = this;
		this.isFocused = true;
		
			
		this.setHeaderBackground('url(img/window/headerBar.png) repeat-x');
		
		var style = this.div.style;
		style.zIndex = desktop.getStyleIndex();
		
		var button = this.taskBarButton;
		
		button.setFocus();
	},

	removeFocus : function ()
	{
		var rWindow = this.rootJsWindow;
		rWindow.focusObject = null;
		
		this.isFocused = false;
		
		this.setHeaderBackground('url(img/window/headerBarInactive.png) repeat-x');
		
		var button = this.taskBarButton;
		button.removeFocus();
	},

	buildContent : function ()
	{
		var oThis = this;
		var content = document.createElement('div');
		
		registerObject(content, this.divName + '_JsWindowContent', 'jsWindowContent', this);
		
		this.content = content;
		this.div.appendChild(content);
		
		addEvent(content, 'mousedown', function (e) {oThis.contentOnMouseDown(e);});
	},
	
	removeCurrentFocus : function ()
	{
		if (this.rootJsWindow == null)
		{
			if (this.focusObject != null)
				this.focusObject.removeFocus();
			
			return;
		}
		
		if (this.rootJsWindow.focusObject != null)
			this.rootJsWindow.focusObject.removeFocus();
	},
	
	contentOnMouseDown : function (e)
	{
	    if (isClickLeft(e))
		{
			var targetW = this;
			this.removeCurrentFocus();
			
			if (this.isWindow)
				this.setFocus();
		}
	},

	setContentBackground : function (background) 
	{
		if (background == 'undefined')
			return;
			
		if (background.charAt(0) == '#')
			this.content.style.background = background;		
	
		else
			this.content.style.background = 'url('+background+') no-repeat top center #000';
	},
	
	setHeaderBackground : function (background) 
	{			
		this.headerBar.style.background = background;		
	},
	
	setPos : function (x, y)
	{
		var style = this.div.style;
		
		style.left = x +'px';
		style.top  = y +'px';
	},

	getPos : function ()
	{
		var style = this.div.style;
		return {'x' : parseInt(style.left), 'y' : parseInt(style.top)};
	},
	
	setMovementSpeed : function (speed)
	{
		this.movementSpeed = speed;
	},
	
	getMovementSpeed : function ()
	{
		return this.movementSpeed;
	},

	refreshContentSize : function ()
	{
		var style = this.div.style;
		var dim = this.getSize();
		
		this.content.style.width  = dim.width + 'px';
		this.content.style.height = dim.height - this.getHeaderBarHeight() - this.pluginContentHeight + 'px';
	},

	getHeaderBarHeight : function ()
	{
		if (!this.isWindow)
			return 0;
			
		else
		{
			return parseInt(this.headerBar.height);
		}
	},

	setSize : function (width, height)
	{
		var style = this.div.style;
		
		style.width  = width  + 'px';
		style.height = height + 'px';
		
		this.refreshContentSize();
	},

	getSize : function ()
	{
		var style = this.div.style;
		
		return {'width' : parseInt(style.width), 'height' : parseInt(style.height)};
	},
	
	getParentSize : function ()
	{
		var style = this.rootJsWindow.div.style;
		
		return {'width' : parseInt(style.width), 'height' : parseInt(style.height)};
	},

	setCenter : function ()
	{
		var style = this.div.style;
		var dim = desktop.workArea.getSize();
		var wSize = this.getSize();
		
		this.displayAt
		(
			parseInt((dim.width - wSize.width) / 2),
			parseInt((dim.height - wSize.height) / 2) 			
		);
	},

	setBorderWidth : function (width)
	{
		var style = this.div.style;
		style.borderWidth = width;
	},

	getBorderWidth : function ()
	{
		var style = this.div.style;
		return parseInt(style.borderWidth);
	},
	
	setTitle : function (title)
	{
		if (!this.isWindow)
			return;
			
		var h = this.headerBar;
		
		var titleDiv = document.createElement('div');
		addClass(titleDiv, 'jsWindowHeader');
		
		registerObject(titleDiv, this.divName + '_JsWindowTitle', 'jsWindowTitle', this);
		titleDiv.innerHTML = title;
		disableSelection(titleDiv);
		
		if (h.titleDiv != undefined)
			h.replaceChild(titleDiv, h.titleDiv);
		
		else
		{
			var x = h.firstChild;
			h.insertBefore(titleDiv, x);
		}
		
		h.titleDiv = titleDiv;
		this.title = title;
	},
	
	setMaximize : function ()
	{
		if (this.isMaximized == false)
		{
			var size = this.getSize();
			var pos = this.getPos();
			
			this.oldW = size.width;
			this.oldH = size.height;
			this.oldX = pos.x;
			this.oldY = pos.y;
						
			var dim = this.getParentSize();
			
			var width  = dim.width;
			var height = dim.height;
			
			this.setSize(width, height);
			this.displayAt(0, 0);
			
			this.isMaximized = true;
		}
		
		else
		{
			this.setSize(this.oldW, this.oldH);
			this.displayAt(this.oldX, this.oldY);	

			this.isMaximized = false;
		}
		
	},
	
	setWorkArea : function ()
	{
		this.div.style.position = 'relative';
		this.div.style.padding = '0px';
		this.directionIcon = 'height';
		this.isWorkArea = true;

		var dim = getWindowDimension();
		var width  = dim[0];
		var height = dim[1] - desktop.theme.taskbarHeight;
		
		this.setSize(width, height);
		this.displayAt(0, 0);
		this.setContentBackground('img/desktop/wall.png');
		this.setDragSensitive(true);
		
		
		desktop.addWindow(this);
	},
	
	addToTaskBar : function ()
	{
		if (desktop.taskBar == null)
			return;
		
		var oThis = this;
		
		var tB = new JsButton (
			'WList', this, function () { oThis.onMinimize(); }
		);
		tB.div.innerHTML = this.title;
		
		desktop.taskBar.wListDiv.appendChild(tB.div);
		
		this.taskBarButton = tB;
	},
	
	removeFromTaskBar : function ()
	{
		if (desktop.taskBar == null)
			return;
		
		var button = this.taskBarButton.div;
		desktop.taskBar.wListDiv.removeChild(button);
	},
	
	attachWindow : function (newWindow, parentJsWindow)
	{
		var divParentNode = null;
	
		if (parentJsWindow != null)
			divParentNode = parentJsWindow.div;
		else
			divParentNode = document.body;
		
		divParentNode.appendChild(newWindow);
		
		this.rootJsWindow = parentJsWindow;
	},
	
	fadeAnimation : function (ms, fade, callback)
	{
		var oThis = this;
		var grad = ms;
		
		if (oThis.div.style.opacity == "")
			oThis.div.style.opacity = 1.0;
		
		if (oThis.div.style.opacity > 1.0)
			oThis.div.style.opacity = 1;
			
		if (!fade)
			this.div.style.display = 'block';
		
		function animation (ms)
		{
			if (ms <= 0)
			{
				if (callback != undefined)
					callback();
					
				return;
			}
			
			var dec = 1 / grad;
			
			if (!fade)
			{
				dec *= -1;
				oThis.div.style.display = 'block';
			}
			
			makeOpacity(oThis.div.style, oThis.div.style.opacity - dec);
			
			setTimeout(function () {animation(ms-1);}, 10);
		}
	
		animation(ms);
	},
	
	onClose : function ()
	{
		var oThis = this;
		this.isClosing = true;
		this.fadeAnimation(20, true, function () {desktop.workArea.div.removeChild(oThis.div);});
		
		var index = getIndex(desktop.jsWindowArray, this);
		desktop.jsWindowArray = popIndexElement(desktop.jsWindowArray, index);
	},

	moveTo : function (newX, newY)
	{
		this.destX = newX;
		this.destY = newY;

		this.getLine(this.posArrayList, this.curX, this.curY, this.destX, this.destY);
		this.setCoord(this.destX, this.destY);

		if (this.isAnimated == false)
		{
			setAnimateRepeat(this, 20, this.movementSpeed);
			this.isAnimated = true;
		}

		function setAnimateRepeat (oThis, interval, speed)
		{
			oThis.posArrayList = oThis.posArrayList.slice(speed);

			var pos = oThis.posArrayList.shift();

			if (pos)
			{
				var x = pos[0];
				var y = pos[1];

				setTimeout (
					function () {
						setAnimateRepeat(oThis, interval, speed);
					},
					interval
				);
				
				oThis.setPos(x, y);
			}

			else
			{
				oThis.setPos(oThis.destX, oThis.destY);
				oThis.isAnimated = false;
			}
		}
	},

	displayAt : function (x, y)
	{
		this.setCoord(x, y);
		this.setPos(x, y);
	},
	
	setCoord : function (x, y)
	{
		this.curX = x;
		this.curY = y;
	},
	
	addContent : function (data)
	{
		this.content.innerHTML += data;
	},
	
	putContent : function (data)
	{
		this.content.innerHTML = data;
	},
	
	setCoordArray : function (coordArray)
	{
		var pos = this.getPos();
		this.curX = pos.x;
		this.curY = pos.y;
	},

	getCoord : function (x, y)
	{
		return new Array(this.curX , this.curY);
	},
	
	open : function ()
	{
		var openSpace = this.getWindowSpace();
		this.setSize(550, 300);
		this.displayAt(openSpace, openSpace);		
	},
	
	setApplication : function (ext, type)
	{
		if (type == 'dir')
		{
			this.open();
			
			this.applicationOpened = new JsExplorer(this);
			this.applicationOpened.process();
		}
		
		else if (ext == 'console')
		{
			var width = 300;
			this.setSize(width, 300);
			this.displayAt(getWindowDimension()[0] - width - 10, 10);
			this.setOpacity(0.6);
			this.content.style.color = '#0F0';
			
			this.applicationOpened = 'console';
		}
		
		else if (ext == 'txt' || ext == 'doc' || ext == 'odt')
		{
			this.open();
			this.applicationOpened = 'notepad';
		}
		
		else if (ext == 'jpg' || ext == 'png' || ext == 'gif')
		{
			this.applicationOpened = new JsImageViewer(this);
			this.applicationOpened.process();
		}
		
		else
		{
			this.open();
			wlog(ext + ' => Open with ?');
		}
	},

	getWindowSpace : function ()
	{
		var waHeight = desktop.workArea.getSize().height;
		var grad = parseInt(waHeight / 10);
		
		if (typeof desktop.workArea.openAt == 'undefined')
			desktop.workArea.openAt = 0;
		
		desktop.workArea.openAt = (desktop.workArea.openAt + grad) % (waHeight - 300);
		
		return desktop.workArea.openAt;
	},
	
	getLine : function (posArray, x1, y1, x2, y2)
	{
		if (x1 == x2 && y1 == y2)
		{
			posArray.push (new Array(x1, y1));
			return;
		}
		
		var dx = x2 - x1; 
		var dy = y2 - y1; 
		var sx = 1;
		var sy = 1;

		if (dx < 0)
		{
			sx = -1;
			dx = -dx;
		}

		if (dy < 0)
		{
			sy = -1;
			dy = -dy;
		}

		dx = dx << 1;
		dy = dy << 1;

		posArray.push (new Array(x1, y1));

		if (dy < dx)
		{
			var fraction = dy - (dx >> 1);

			while (x1 != x2)
			{
				if (fraction >= 0)
				{
					y1 += sy;
					fraction -= dx;
				}

				fraction += dy;
				x1 += sx;

				posArray.push (new Array(x1, y1));
			}
		}

		else 
		{
			var fraction = dx - (dy >> 1);      
			
			while (y1 != y2)
			{
				if (fraction >= 0)
				{
					x1 += sx;
					fraction -= dy;
				}
				
				fraction += dx;
				y1 += sy;
				
				posArray.push (new Array(x1, y1));
			}    
		}
	},
	
	addIcon : function (icon)
	{
		icon.parentJsWindow = this;
		
		this.putIconAt(icon, this.iconArray.length);
		this.iconArray.push(icon);
		this.content.appendChild(icon.div);
	},
	
	clearIcon : function ()
	{
		var el = this.content;
		delete this.iconArray;
		
		this.iconArray = new Array();
		
		while (el.hasChildNodes()) {
			el.removeChild(el.childNodes[0]);
		}
	},
	
	removeIcon : function (icon)
	{
		var index = -1;
		
		for (var i = 0; i < this.iconArray.length; i++)
		{
			if (this.iconArray[i] == icon)
			{
				index = i;
				break;
			}
		}
		
		if (index != -1)
			this.iconArray = popIndexElement(this.iconArray, index);
	
		icon.div.parentNode.removeChild(icon.div);
		
		this.orderIcons();
	},
	
	orderIcons : function ()
	{
		for (i in this.iconArray)
		{
			var icon = this.iconArray[i];
			
			this.putIconAt(icon, i);
		}
	},

	refresh : function (res)
	{
		this.clearIcon();
		this.getDir(res);
	},
	
	getDir : function (res)
	{
		try
		{
			var ret = JSON.parse(res);
			
			for (e in ret)
			{
				var i = new JsIcon(ret[e]);
				this.addIcon(i);
			}
		}
		
		catch (err)
		{
			wlog('<font color="lightblue"><b>getDir Error</b><br>' + res + '</font>');
			wlogerr(err);
		}
	},
	
	putIconAt : function (icon, position)
	{
		var d, x, y;
		var len = position;
		var direction = this.directionIcon;
		var iS = icon.div.style;
		
		if (direction == 'height')
		{
			d = this.getSize().height;
			x = parseInt(len / parseInt(d / icon.size));
			y = parseInt(len % parseInt(d / icon.size));
		}
		
		else if (direction == 'width')
		{
			d = this.getSize().width;
			y = parseInt(len / parseInt(d / icon.size));
			x = parseInt(len % parseInt(d / icon.size));	
		}
		
		iS.left = (x * icon.size) + desktop.theme.paddingExplorer + 'px';
		iS.top = (y * icon.size) + desktop.theme.paddingExplorer + 'px';
	}
}

function JsButton (type, parent, callback)
{
	var button = document.createElement('div');
	addClass(button, 'jsButton');
	
	registerObject(button, parent.divName + '_JsButton' + type, 'jsButton_' + type, parent);
	
	this.div = button;
	this.parentJsWindow = parent;
	this.type = type;
	this.isFocused = false;
	this.isActive = true;
	this.url = '';
	
	var oThis = this;
	
	addEvent(this.div, 'click', callback);
	addEvent(this.div, 'mousedown', function (e)  { oThis.animateOnMouseDown(e); });
	addEvent(this.div, 'mouseover', function (e)  { oThis.animateOnMouseOver(e); });
	addEvent(this.div, 'mouseout', 	function (e)  { oThis.animateOnMouseOut(e); });
	addEvent(this.div, 'dragstart', function (e) { e.preventDefault(); });
	
	disableSelection(this.div);
	this.buildStyle(type);
	
	return this;
}

JsButton.prototype = 
{
	buildStyle : function (style)
	{
		switch (style)
		{
			case 'Close' :
				addClass(this.div, 'jsButton_WindowHeader');
				this.div.innerHTML = 'X';
				this.url = 'img/window/btn';
			break;
			
			case 'Maximize' :
				addClass(this.div, 'jsButton_WindowHeader');
				this.div.innerHTML = 'O';
				this.url = 'img/window/btn';
			break;
		
			case 'Minimize' :
				addClass(this.div, 'jsButton_WindowHeader');
				this.div.innerHTML = '-';
				this.url = 'img/window/btn';
	
			break;
			
			case 'WList' :
				this.url = 'img/desktop/btnBar';
			break;
			
			case 'previousExplorer' :
				this.url = 'img/explorer/back';
			break;
			
			case 'forwardExplorer' :
				this.url = 'img/explorer/forward';
			break;
			
			case 'upExplorer' :
				this.url = 'img/explorer/up';
			break;
			
			case 'thumbnailExplorer' :
				this.url = 'img/explorer/Thumbnails';
			break;
			
			case 'tilesExplorer' :
				this.url = 'img/explorer/tile';
			break;
			
			case 'iconsExplorer' :
				this.url = 'img/explorer/icons';
			break;
			
			case 'detailsExplorer' :
				this.url = 'img/explorer/details';
			break;
			
			case 'optionExplorer' :
				this.url = 'img/explorer/option';
			break;
			
			case 'taskBarStart' :
				this.url = 'img/desktop/startButton';
			break;
		}
	},

	animateOnMouseDown : function ()
	{
	
	},
	
	animateOnMouseOver : function ()
	{
		if (this.isFocused == false)
		{
			if (!this.isActive)
				return;
				
			var s = this.div.style;
			this.oldBackground = s.background;
			s.background = 'url(' + this.url + '2.png) no-repeat';
		
		}
	},
	
	animateOnMouseOut : function ()
	{
		if (this.isFocused == false)
		{
			if (!this.isActive)
				return;
				
			var s = this.div.style;
			s.background = this.oldBackground;
		}
	},
	
	setActive : function (active)
	{
		this.isActive = active;
	},
	
	setFocus : function ()
	{
		this.div.style.background = 'url("' + this.url + '3.png") repeat-x';
		this.isFocused = true;
	},
	
	removeFocus : function ()
	{
		this.div.style.background = 'url("' + this.url + '1.png") repeat-x';
		this.isFocused = false;
	}
}

function JsDesktop ()
{
	this.taskBar = null;
	this.workArea = null;
	this.draggedObject = null;
	this.dropObject = null;
	this.jsWindowArray = new Array();
 	
	this.theme = 
	{
		'taskbarHeight' : 30,
		'headerWindowHeight' : 20,
		'paddingExplorer' : 10
	};
	
	this.idHandle = 0;
	
	return this;
}

JsDesktop.prototype = 
{
	getStyleIndex : function ()
	{
		this.updateStyleIndex();
		return (this.topIndex += 2);
	},
	
	updateStyleIndex : function ()
	{
		if (this.topIndex == undefined
		||  this.topIndex < this.jsWindowArray.length)
			this.topIndex = this.jsWindowArray.length;
	},
	
	addWindow : function (window)
	{
		this.jsWindowArray.push(window);
		this.updateStyleIndex();
	},
	
	isAlreadyOpened : function (window)
	{
		var arr = desktop.jsWindowArray;
		
		for (var i in arr)
		{
			if (arr[i].path == window.path
			&& arr[i].name == window.name)
			{
				return arr[i];
			}
		}
		
		return null;
	},
	
	transferComplete : function (res, src, dest)
	{
		var oThis = this;
		var pWinSrc = null;
		var newPath = dest.path + dest.name + '/';
		
		if (res == 'true')
		{
			if (pWinSrc = desktop.isAlreadyOpened(src))
			{
				if (pWinSrc.applicationOpened.appName == 'jsExplorer')
				{
					pWinSrc.applicationOpened.setPath(newPath);
					pWinSrc.path = newPath;
				}
			}

			if (src.parentJsWindow != null)
				src.parentJsWindow.removeIcon(src);
			
			if (dest.childJsWindow != null)
			{
				dest.childJsWindow.addIcon(src);
				src.path = newPath;
			}
		}
		
		else
			wlog('<font color="red">Erreur, le fichier "'+ src.path + src.name +'" n\'a pas pu être transféré vers "' + dest.path + dest.name + '"');
	},
	
	moveObject : function (file, dest)
	{
		var oThis = this;
		var transfer = new JsTransfer(file, dest);
		
		transfer.process();
	}
}

function JsIcon (e)
{
	this.size = 80;
	this.isContainer = false;
	this.type = e['type'];
	this.path = e['path'] + '/';
	this.name = e['name'];
	this.getFileExtension(e['name'], this.type);
	this.isFocused = false;
	this.isDragged = false;
	this.parentJsWindow = null;
	this.childJsWindow = null;
	this.imgDrag = null;
	
	this.div = null;
	
	this.build();
	
	var oThis = this;
	
	addEvent(this.div, 'mouseover', function () { oThis.onMouseOver() 	});
	addEvent(this.div, 'mouseout', 	function () { oThis.onMouseOut() 	});
	addEvent(this.div, 'click', 	function () { oThis.onClick() 	});
	addEvent(this.div, 'dblclick', 	function () { oThis.onDoubleClick() });
	
	return this;
}

JsIcon.prototype = 
{
	onMouseOver : function ()
	{
		this.div.style.zIndex += 1;
		var s = this.div.firstChild.style;
		s.display = 'block';
		s = this.div.lastChild.style;
		s.overflow = 'visible';
	},
	
	onMouseOut : function ()
	{
		this.div.style.zIndex -= 1;
		
		if (!this.isFocused)
		{
			s = this.div.firstChild.style;
			s.display = 'none';			
			s = this.div.lastChild.style;
			s.overflow = 'hidden';
		}
	},
	
	onClick : function ()
	{
		s = this.div.firstChild.style;
		s.background = '#222';
	},
	
	onDoubleClick : function ()
	{
		var pWin = null;
		
		for (var i = 0; i < desktop.jsWindowArray.length; i++)
		{
			if (desktop.jsWindowArray[i].path == this.path
			&& desktop.jsWindowArray[i].name == this.name)
			{
				pWin = desktop.jsWindowArray[i];
				break;
			}
		}
		
		if (pWin == null)
		{	
			var newWindow = new JsWindow(this.title, true, desktop.workArea);
			newWindow.path = this.path;
			newWindow.name = this.name;
			newWindow.iconCaller = this;
			newWindow.setApplication(this.ext, this.type);
			newWindow.setFocus();
			
			this.childJsWindow = newWindow;
		}
		
		else
		{
			pWin.setFocus();	
		}
	},
	
	tryContainer : function (e)
	{
		if (desktop.draggedObject == null)
			return;
		
		if (this.isContainer)
		{
			this.div.style.cursor = 'cell';
			desktop.dropObject = this;
		}
		
		else
		{
			this.div.style.cursor = 'no-drop';
		}
	},
	
	quitContainer : function ()
	{
		this.div.style.cursor = 'pointer';
		
		if (desktop.dropObject != null)
		{
			if (desktop.dropObject == this)
				desktop.dropObject = null;
		}
	},
	
	setContainer : function ()
	{
		var oThis = this;
		addEvent(this.div, 'mouseout', function(e){oThis.quitContainer(e);});
		addEvent(this.div, 'mouseover', function(e){oThis.tryContainer(e);});
	},
	
	getFileExtension : function (filename, type)
	{	
		if (type == "dir")
		{
			this.title = filename;
			this.ext = "dir";
			this.isContainer = true;
		}
		
		else
		{
			var ext = /[^.]+$/.exec(filename);
			if (ext == filename)
				ext = '';
			
			this.ext = ext.toString();
			this.ext = this.ext.toLowerCase();
			var name = filename.replace('.'+ ext, '');
			this.title = name;
		}
	},

	build : function ()
	{
		var imgIcon = new Image();
		var oThis = this;
		
		addEvent(imgIcon, 'error', function () {this.src = 'img/icon/unknown.png'; this.width = 32; this.height = 32;}); 
		
		if (this.type == 'file')
			imgIcon.src = 'img/icon/' + this.ext + '.png';
		
		else
			imgIcon.src = 'img/icon/' + this.type + '.png';
		
		
		var iconDiv = document.createElement('div');
		addClass(iconDiv, 'jsIcon');
		iconDiv.parentIcon = this;
		disableSelection(iconDiv);
		
		var eSelec = document.createElement('div');
		addClass(eSelec, 'jsIcon');
		addClass(eSelec, 'jsIconSel');
		eSelec.parentDiv = iconDiv;
		makeOpacity(eSelec.style, 0.3);
		
		var eImg = document.createElement('div');
		addClass(eImg, 'jsIcon');
		addClass(eImg, 'jsIconImg');
		eImg.parentDiv = iconDiv;
		eImg.style.background = 'url('+ imgIcon.src + ') no-repeat top center';
		
		var eTitle = document.createElement('div');
		addClass(eTitle, 'jsIcon');
		addClass(eTitle, 'jsIconTitle');
		
		eTitle.parentDiv = iconDiv;
		eTitle.innerHTML = this.title;
		
		if (this.ext != 'dir')
			eTitle.innerHTML += '.' + this.ext;
			
		eTitle.innerHTML = wordwrap(eTitle.innerHTML, 10, '<br>', true);
		
		iconDiv.style.width = '64px';
		iconDiv.style.height = '72px';
		iconDiv.style.cursor = 'pointer';
		
		iconDiv.appendChild(eSelec);
		iconDiv.appendChild(eImg);
		iconDiv.appendChild(eTitle);
		
		this.div = iconDiv;
		var oThis = this;
		this.imgIcon = imgIcon;
		
		this.setContainer();
		
		addEvent(iconDiv, 'mousedown', function (e) {oThis.beginDrag(e)});
	},
	
	getPos : function (e)
	{
		var style = this.div.style;
		return {'x' : parseInt(style.left), 'y' : parseInt(style.top)};
	},
	
	beginDrag : function (e)
	{
		var oThis = this;
		this.refMouseMove = function (e) {oThis.onDrag(e)};
		this.refMouseUp = function (e) {oThis.dragEnd(e)};
		
		document.body.focus();
		
		addEvent(document, 'mousemove', this.refMouseMove);
		addEvent(document, 'mouseup', this.refMouseUp);
		addEvent(document, 'selectstart', function () {return false;});
		addEvent(this.div, 'dragstart', function (e) { e.preventDefault();});	
	},
	
	onDrag : function (e)
	{
		desktop.draggedObject = this;
		
		if (!this.imgDrag)
		{
			var img = new Image();
			img.src = this.imgIcon.src;
			img.width = 16;
			img.height = 16;
			
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.left = e.clientX + 'px';
			div.style.top = e.clientY + 'px';
			
			div.appendChild(img);
			desktop.workArea.div.appendChild(div);
			
			this.imgDrag = div;
			this.imgDrag.img = img;
		}
		
		this.imgDrag.style.zIndex = desktop.getStyleIndex();
		this.imgDrag.style.display = 'block';
		this.imgDrag.style.left = e.clientX + 10 + 'px';
		this.imgDrag.style.top = e.clientY - 20 + 'px';
	},
	
	dragEnd : function (e)
	{
		var oThis = this.self;
		
		if (this.imgDrag)
			this.imgDrag.style.display = 'none';
		
		removeEvent(document, 'mousemove', this.refMouseMove);
		removeEvent(document, 'mouseup', this.refMouseUp);
		removeEvent(document, 'selectstart', function () {return false;});
		removeEvent(this.div, 'dragstart', function (e) {e.preventDefault();});
		
		if (desktop.dropObject != null)
		{
			if (desktop.dropObject != desktop.draggedObject)
			{
				if (!desktop.dropObject.isWorkArea)
					desktop.dropObject.div.style.cursor = 'pointer';
				
				desktop.moveObject(this, desktop.dropObject);
			}
		}
		
		desktop.dropObject = null;
		desktop.draggedObject = null;
	},
	
	displayAt : function (x, y)
	{
		this.setCoord(x, y);
		this.setPos(x, y);
	},
	
	setCoord : function (x, y)
	{
		this.curX = x;
		this.curY = y;
	},
	
	getSize : function ()
	{
		var style = this.div.style;
		
		return {
			'width' : parseInt(style.width), 
			'height' : parseInt(style.height)
		};
	},
	
	setPos : function (x, y)
	{
		var style = this.div.style;
		
		style.left = x +'px';
		style.top  = y +'px';
	},

	getPos : function ()
	{
		var style = this.div.style;
		return {'x' : parseInt(style.left), 'y' : parseInt(style.top)};
	},
	
	setFocus : function ()
	{
		var s = null;
		this.parentJsWindow.focusObject = this;
		
		s = this.div.lastChild.style;
		s.overflow = 'visible';
		
		s = this.div.firstChild.style;
		s.display = 'block';
		s.background = '#181818';
		
		this.isFocused = true;
	},
	
	removeFocus : function ()
	{
		this.parentJsWindow.focusObject.isFocused = false;
		this.parentJsWindow.focusObject.onMouseOut();
		this.parentJsWindow.focusObject.div.lastChild.style.overflow = 'hidden';
	}
}

function JsTaskBar ()
{
	this.window = new JsWindow('taskBar', false, null);
	
	var width = getWindowDimension()[0];	
	var height = desktop.theme.taskbarHeight;
	
	this.window.setSize(width, height);
	this.window.displayAt(0, 0);
	
	this.wListDiv = null;
	this.startButton = null;

	this.menuStartOpen = false;
	
	return this;
}

JsTaskBar.prototype =
{
	onClickStart : function ()
	{
		if (!this.menuStartOpen)
		{
			if (desktop.workArea.focusObject != null)
				desktop.workArea.focusObject.removeFocus();
			
			this.setFocus();
			desktop.workArea.focusObject = this;
		}
		else
			this.removeFocus();
	},
	
	setFocus : function ()
	{
		this.menuStartOpen = true;
		this.menu.style.display = 'block';
		this.menu.style.zIndex = desktop.getStyleIndex();
	},
	
	removeFocus : function ()
	{
		this.menuStartOpen = false;
		this.menu.style.display = 'none';
		desktop.workArea.focusObject = null;
	},
	
	build : function ()
	{	
		var oThis = this;

		var wB = document.createElement('div');
		registerObject(wB, 'taskBar_JsWindowBList', 'taskBar_buttonList', this.window);
		
		var startButton = new JsButton (
			'taskBarStart', this, function () { oThis.onClickStart();}
		);
		
		var startMenu = document.createElement('div');		
		registerObject(startMenu, 'taskBar_JsWindowStartMenu', 'taskBar_startMenu', this.window);
		
		startMenu.style.height = parseInt(desktop.workArea.getSize().height / 3) + 'px';
		startMenu.style.top = desktop.theme.taskbarHeight + 1 + 'px';
		document.body.appendChild(startMenu);
		this.menu = startMenu;
		
		this.window.content.style.overflow = 'hidden';
		this.window.content.appendChild(startButton.div);
		this.window.content.appendChild(wB);
		this.window.div.style.position = 'relative';
		
		this.wListDiv = wB;
		this.startButton = startButton;
	}
}

function main ()
{
	jsDesktopInit();
	
	console = new JsWindow('Console', false, desktop.workArea);
	console.setApplication('console');
	
	wlog('Contexte d\'éxecution chargé');
	wlog('Rapatriement des données côté serveur en cours...');
	ajax.send(function (res) {desktop.workArea.getDir(res);}, 'scanFolder', '');
	wlog('Zone de travail initialisée.');

}
addEvent(window, 'load', main);

function jsDesktopInit ()
{
	window.onerror = function (err, file, line) {wlog('<br><font color="red">Error : ' + err + '<br>' + 'File : ' + file + '<br>' + 'Line : ' + line + '</font>');};
	
	desktop = new JsDesktop();
	
	desktop.taskBar = new JsTaskBar();
	desktop.workArea = new JsWindow('workArea', false, null);
	
	desktop.workArea.setWorkArea();
	desktop.taskBar.build();
	
	document.body.style.padding = '0px';
	document.body.style.margin = '0px';
	document.body.style.overflow = 'hidden';
}

function getIndex(array, element)
{
	for (var i = 0; i < array.length; i++)
	{
		if (array[i] == element)
			return i;
	}
	
	return -1;
}

function popIndexElement(array, index)
{
	if (index > array.length)
		return false;
	
	return (array.slice(0, index).concat(array.slice(index + 1, array.length)));
}

function hasClass(ele, cls)
{
	return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function addClass(ele, cls)
{
	if (!this.hasClass(ele,cls))
		ele.className += " " + cls;
}

function removeClass(ele, cls)
{
	if (hasClass(ele,cls))
	{
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		
		ele.className = ele.className.replace(reg,' ');
	}
}

function isClickLeft (e)
{
	if (e == null) 
        e = window.event;
		
    return (e.button == 1 && window.event != null || 
			e.button == 0)
}

function addEvent(obj, event, callback)
{
	if (obj.attachEvent)
	{
		var retVal = obj.attachEvent("on" + event, callback);
		if (!retVal)
			wlog('addEvent : error');
	}
	
	else if (obj.addEventListener)
	{
		obj.addEventListener(event, callback, true);
	}
}

function removeEvent(obj, event, callback)
{
	if (obj.detachEvent)
		obj.detachEvent("on" + event, callback);
		
	else if (obj.removeEventListener)
	{
		obj.removeEventListener(event, callback, true);
	}
	
	else
		obj.event = null;
}

function getWindowDimension()
{
	var windowHeight = 0;
	
	if (typeof(window.innerHeight) == 'number')
		windowHeight = window.innerHeight;

	else
	{
		if (document.body && document.body.clientHeight)
			windowHeight = document.body.clientHeight;

		else
		{
			if (document.documentElement && document.documentElement.clientHeight)
				windowHeight = document.documentElement.clientHeight;
		}
	}

	var windowWidth = 0;

	if (typeof(window.innerWidth) == 'number')
		windowWidth = window.innerWidth;
	
	else
	{
		if (document.body && document.body.clientWidth)
			windowWidth = document.body.clientWidth;
			
		else
		{
			if (document.documentElement && document.documentElement.clientWidth)
				windowWidth = document.documentElement.clientWidth;
		}
	}

	return new Array(windowWidth, windowHeight);
}

/**
*	Autre utilitaires
*/
function disableSelection (target)
{
	if (typeof target.onselectstart != "undefined")
	{
		addEvent(target, "selectstart", function () { return false;});
	}
	
	else if (typeof target.style.MozUserSelect != "undefined")
	{
		target.style.MozUserSelect = "none";
	}
	
	else
	{
		addEvent(target, 'mousedown', function (){return false;});
	}
}
function wordwrap (str, int_width, str_break, cut)
{
    // http://kevin.vanzonneveld.net
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net), Sakimori, Nick Callen, Michael Grier
    var m = ((arguments.length >= 2) ? arguments[1] : 75   );
    var b = ((arguments.length >= 3) ? arguments[2] : "\n" );
    var c = ((arguments.length >= 4) ? arguments[3] : false);

    var i, j, l, s, r;

    str += '';

    if (m < 1) {
        return str;
    }

    for (i = -1, l = (r = str.split(/\r\n|\n|\r/)).length; ++i < l; r[i] += s) {
        for (s = r[i], r[i] = ""; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : "")){
            j = c == 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length || c == 1 && m || j.input.length + (j = s.slice(m).match(/^\S*/)).input.length;
        }
    }
    
    return r.join("\n");
}

function registerObject(object, id, className, parent)
{
	object.id = id;
	addClass(object, className);
	object.parentJsWindow = parent;
}

function enableSelection (target)
{
	if (typeof target.onselectstart != "undefined")
	{
		removeEvent(target, "selectstart", function () { return false;});
		addEvent(target, "selectstart", function () { return true;});
	}
	
	else if (typeof target.style.MozUserSelect != "undefined")
	{
		target.style.MozUserSelect = "text";
	}
	
	else
	{
		removeEvent(target, "mousedown", function (){return false;});
		addEvent(target, "mousedown", function (){return true;});
	}
}
function makeOpacity (style, opacity)
{
	style.opacity = opacity;
}

function wlog (log)
{
	if (console == null)
		return;
		
	console.addContent('- ' + log + '<br />');
	console.content.scrollTop = console.content.scrollHeight;
}

function wlogerr (err)
{
	if (console == null)
		return;
		
	console.addContent('<font color="lightblue">Error = <b>' + err.message + '</b></font><br />');
	console.content.scrollTop = console.content.scrollHeight;
}
