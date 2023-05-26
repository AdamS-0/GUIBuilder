function createRow(sender, tab, propType, propertyName, propertyValue) {
	var row = tab.insertRow(-1);
	var c0 = row.insertCell(0);	var c1 = row.insertCell(1);
	
	var elemInput = document.createElement("input"); elemInput.type = propType; elemInput.value = propertyValue;
	if( propType == "number" ) elemInput.min = 0;
	if( propType == "checkbox" ) elemInput.checked = propertyValue;
	
	c0.innerHTML = propertyName;
	c1.appendChild(elemInput);
	elemInput.onchange = function(e){
		if( propType == "checkbox" )	sender[propertyName] = 0 + e.target.checked;
		else 							sender[propertyName] = e.target.value;
		sender.requiredRefresh();
	};
}

function addRowButton(senderScreen, senderControl, tab, text, onclick) {
	var row = tab.insertRow(-1);
	var c0 = row.insertCell(0);
	c0.colSpan = 2;
	var btn = document.createElement("button");
	btn.innerHTML = text;
	btn.onclick = onclick;
	c0.appendChild(btn);
}


function getRsqr(x0, y0, x1, y1) {
	xo = Number(x0); 	y0 = Number(y0);	x1 = Number(x1);	y1 = Number(y1);
	return Math.pow( x0 - x1, 2 ) + Math.pow(y0 - y1, 2);
}

function isBetween(v, a, b) {
	a = parseFloat(a);	b = parseFloat(b);
	var min = Math.min(a, b);
	var max = Math.max(a, b);
	return v >= a && v <= b;
}


function screenItemClick(e) {
	scrName = e.target.name;
	
	scr = screens.find( s => s.Name == scrName );
	selectedScreen = screens.indexOf(scr);
	loadScreensList();
	showProps(scr);
	
	selectedControl = null;
}



function controlItemClick(e) {
	scrName = e.target.scrName;
	controlName = e.target.name;
	
	scr = screens.find( s => s.Name == scrName );
	
	var ctrl = scr.Controls.find( ci => ci.Name == controlName );
	
	showProps(scr, ctrl);
	selectedControl = ctrl;
}

function showProps(scr, ctrl) {
	var tabProps = document.getElementById("tabProperties");
	var spn = document.getElementById("propSender");
	
	if(ctrl == null) {
		scr.showProperties(tabProps);
		spn.innerHTML = " - " + scr.Name;
		
		selectedScreenChanged();
		return;
	}
	
	var tab = ctrl.showProperties(tabProps);
	spn.innerHTML = " - " + scr.Name + " > " + ctrl.Name;
	
	addRowButton(scr, ctrl, tab, "Delete", function(){ deleteControl(scr, ctrl); });
	addRowButton(scr, ctrl, tab, "To Back", function(){ sendToBack(scr, ctrl); });
	addRowButton(scr, ctrl, tab, "To Front", function(){ sendToFront(scr, ctrl); });
}



class Screen{
	Controls = new Array();
	Name = "";
	Width = 128;
	Height = 64;
	Color = "#000000";
	OneColor = 0;
	static screenNum = 0;
	
	constructor(name = "", width = 128, height = 64) {
		if ( name.length == 0 ) name = "screen" + Screen.screenNum++;
		
		this.Name = name;
		this.Width = width;
		this.Height = height;
		
	}
	
	showProperties(panel) {
		panel.innerHTML = "";
		var tab = document.createElement("table");
		createRow(this, tab, "text", "Name", this.Name);
		createRow(this, tab, "text", "Color", this.Color);
		createRow(this, tab, "number", "Width", this.Width);
		createRow(this, tab, "number", "Height", this.Height);
		createRow(this, tab, "checkbox", "OneColor", this.OneColor);
		panel.appendChild(tab);
		
	}
	
	
	updateRGBcolor() {
		this.ColorRGBA = hexToRgb( this.Color );
		fillRect(0, 0, this.Width, this.Height, this.ColorRGBA);
		for( var i = 0; i < this.Controls.length; i++ ) this.Controls[i].updateRGBcolor();
	}
	
	
	refresh(cvs, ctx) {
		ctx.imageSmoothingEnabled = false;
		cvs.style.width = scaleK*this.Width + "px";
		cvs.style.Height = scaleK*this.Height + "px";
		cvs.width = this.Width;	cvs.height = this.Height;
		ctx.fillStyle = this.Color;
		ctx.fillRect( 0, 0, cvs.width, cvs.height );
		
		for( var i = 0; i < this.Controls.length; i++ )
			this.Controls[i].draw(ctx);
	}
	
	requiredRefresh() {
		loadScreensList();
	}
	
	generateCode(className = "tft") {
		this.updateRGBcolor();
		var strCode = "";
		strCode += "void load_" + this.Name + "() {\n";
		
		var colorBg = "0";
		
		if( this.OneColor )	colorBg = RGB2binaryColor(this.ColorRGBA);
		else 				colorBg = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
		
		strCode += className + ".fillRect(0,0," + this.Width + "," + this.Height + "," + colorBg + ");\n";
		for( var i = 0; i < this.Controls.length; i++ ) {
			strCode += this.Controls[i].generateCode(className, this.OneColor);
		}
		
		strCode += "}\n";
		
		return strCode;
	}
	
}







class Control {
	Type = "Control";
	Name = "";
	X = 0; Y = 0;
	Color = "#FFFFFF";
	ColorRGBA = {r:255, g:255, b:255, a:255};
	
	lastSize = null;

	ParentScreen = null;
	
	static cnum = 0;
	constructor(name, x = 0, y = 0) {
		if( name.length == 0) name = "control" + Control.cnum++;
		this.Name = name;
		this. X = x; this.Y = y;
	}
	
	showProperties(panel) {
		panel.innerHTML = "";
		var tab = document.createElement("table");
		createRow(this, tab, "text", "Name", this.Name);
		createRow(this, tab, "text", "Color", this.Color);
		createRow(this, tab, "number", "X", this.X);
		createRow(this, tab, "number", "Y", this.Y);
		panel.appendChild(tab);
		return tab;
	}
	
	updateRGBcolor() {
		this.ColorRGBA = hexToRgb( this.Color );
	}
	
	draw(ctx) {}
	
	
	checkCursorOver(x, y) {
		this.lastSize = { X: this.X, Y: this.Y };
		return isBetween(x, this.X, this.X) && isBetween(y, this.Y, this.Y);
	}
	
	requiredRefresh() {
		if( this.ParentScreen ) this.ParentScreen.requiredRefresh();
		showProps(this.ParentScreen, this);
	}
	
	tryCursorModify( dx, dy ) {
		this.X = this.lastSize.X + dx;	this.Y = this.lastSize.Y + dy;
	}
	
	moveBy(dx, dy) {
		dx = parseInt(dx);	dy = parseInt(dy);
		this.X += dx;	this.Y += dy;
		this.requiredRefresh();
	}
	
	
	generateCode(className = "tft", oneColor = 0) {
		return "";
	}

}


// [ "Label", "Line", "HLine", "VLine", "Rectangle", "Shape" ];

class Label extends Control {
	Type = "Label";
	Text = "";
	TextSize = 1;
	Background = "#000000";
	BackgroundRGBA = {r:0, g:0, b:0, a:255};
	static cnum = 0;
	constructor(name, x = 0, y = 0, text = "", textSize = 1) {
		if( text.length == 0) text = "label" + Label.cnum++;
		if( name.length == 0) name = text;
		super(name, x, y);
		this.Text = text;
		this.TextSize = textSize;
	}
	
	showProperties(panel) {
		var tab = super.showProperties(panel);
		createRow(this, tab, "text", "Text", this.Text);
		createRow(this, tab, "text", "Background", this.Background);
		createRow(this, tab, "number", "TextSize", this.TextSize);
		return tab;
	}
	
	updateRGBcolor() {
		this.BackgroundRGBA = hexToRgb( this.Background );
	}
	
	draw(ctx) {
		setFontSize(this.TextSize);
		setCursor(this.X, this.Y);
		printString(this.Text, this.ColorRGBA, this.BackgroundRGBA);
	}
	
	checkCursorOver(x, y) {
		return isBetween(x, this.X, parseInt(this.X) + parseInt(this.TextSize) * 6 * parseInt(this.Text.length) )
			&& isBetween(y, this.Y, parseInt(this.Y) + parseInt(this.TextSize) * 8);
	}
	
	
	generateCode(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		var strCode = "";
		
		var colorF = "1";	var colorBg = "0";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
			colorBg = RGB2binaryColor(this.BackgroundRGBA);
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
			colorBg = "0x" + componentToHex( RGB2565( this.BackgroundRGBA ), 4);
		}
		
		strCode += className + ".setTextColor(" + colorF + ", " + colorBg + ");\n";
		strCode += className + ".setTextSize(" + this.TextSize + ");\n";
		strCode += className + ".setCursor(" + this.X + "," + this.Y + ");\n";
		strCode += className + ".print(\"" + this.Text + "\");\n";
		
		return strCode;
	}
}

class Line extends Control {
	Type = "Line";
	EndX = 0;
	EndY = 0;
	selectedVert = 0; // 0 - none or middle, 1 first (X, Y), 2 - second (EndX, EndY)
	static cnum = 0;
	constructor(name, x = 0, y = 0, endx = 0, endy = 0) {
		if( name.length == 0) name = "line" + Line.cnum++;
		super(name, x, y);
		this.EndX = endx;
		this.EndY = endy;
	}
	
	showProperties(panel) {
		var tab = super.showProperties(panel);
		createRow(this, tab, "number", "EndX", this.EndX);
		createRow(this, tab, "number", "EndY", this.EndY);
		return tab;
	}
	
	draw(ctx) {
		drawLine(this.X, this.Y, this.EndX, this.EndY, this.ColorRGBA);
	}
	


	checkCursorOver(x, y) {
		var R0 = getRsqr(x, y, this.X, this.Y);
		
		this.lastSize = { X: Number(this.X), Y: Number(this.Y), EndX: Number(this.EndX), EndY: Number(this.EndY) };

		if (R0 < 2) {
			this.selectedVert = 1;
			return true;
		}
		var R1 = getRsqr(x, y, this.EndX, this.EndY);
		
		if (R1 < 2) {
			this.selectedVert = 2;
			return true;
		}

		var dX = this.EndX - this.X;	var dY = this.EndY - this.Y; // delta XY of line
		var cdX = x - this.X;	var cdY = y - this.Y; // delta XY of cursor
		
		R0 = Math.sqrt( R0 );
		var alphaL = Math.atan2( dY, dX ); // alpha line
		var alphaC = Math.atan2( cdY, cdX ); // alpha cursor
		var alpha = -alphaL + alphaC;
		var c2x = R0 * Math.cos( alpha );
		
		this.selectedVert = 0;
		if( !isBetween(c2x, 0, R0) ) return false;
		
		var c2y = R0 * Math.sin( alpha );
		if( Math.abs( c2y ) < 2 ) return true;
		
		return false;
	}

	tryCursorModify( dx, dy ) {
		dx = parseInt(dx);	dy = parseInt(dy);
		if( this.selectedVert == 1 ) {
			this.X = this.lastSize.X + dx;	this.Y = this.lastSize.Y + dy;
		} else if( this.selectedVert == 2 ) {
			this.EndX = this.lastSize.EndX + dx;	this.EndY = this.lastSize.EndY + dy;
		} else {
			this.X = this.lastSize.X + dx;	this.Y = this.lastSize.Y + dy;
			this.EndX = this.lastSize.EndX + dx;	this.EndY = this.lastSize.EndY + dy;
		}
	}

	moveBy(dx, dy) {
		dx = parseInt(dx);	dy = parseInt(dy);
		this.X = parseInt(this.X) + dx;	this.Y = parseInt(this.Y) + dy;
		this.EndX = parseInt(this.EndX) + dx;	this.EndY = parseInt(this.EndY) + dy;
		this.requiredRefresh();
	}

	generateCode(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		var strCode = "";
		
		var colorF = "1";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
		}
		
		strCode += className + ".drawLine(" + this.X + "," + this.Y + "," + this.EndX + "," + this.EndY + ", " + colorF + ");\n";
		
		return strCode;
	}
}


class Rectangle extends Control {
	Type = "Rectangle";
	Width = 0;
	Height = 0;
	Fill = 0;
	Round = 0;
	R = 0;
	selectedEdgeH = 0;
	selectedEdgeV = 0;
	static cnum = 0;
	constructor(name, x = 0, y = 0, width = 10, height = 10, fill = 0, round = 0, r = 1) {
		if( name.length == 0) name = "rectangle" + Rectangle.cnum++;
		super(name, x, y);
		this.Width = width;
		this.Height = height;
		this.Fill = fill;
		this.Round = round;
		this.R = r;
	}
	
	showProperties(panel) {
		var tab = super.showProperties(panel);
		createRow(this, tab, "number", "Width", this.Width);
		createRow(this, tab, "number", "Height", this.Height);
		createRow(this, tab, "checkbox", "Fill", this.Fill);
		createRow(this, tab, "checkbox", "Round", this.Round);
		createRow(this, tab, "number", "R", this.R);
		return tab;
	}
	
	draw(ctx) {
		if(this.Round){
			if(this.Fill)	fillRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.ColorRGBA);
			else			drawRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.ColorRGBA);
		} else {
			if(this.Fill)	fillRect(this.X, this.Y, this.Width, this.Height, this.ColorRGBA);
			else			drawRect(this.X, this.Y, this.Width, this.Height, this.ColorRGBA);
		}
	}
	
	checkCursorOver(x, y) {
		
		this.lastSize = { X: Number(this.X), Y: Number(this.Y), Width: Number(this.Width), Height: Number(this.Height) };

		if( isBetween( x, this.lastSize.X - 1, this.lastSize.X + 1 ) ) this.selectedEdgeH = 1;
		else if( isBetween( x, this.lastSize.X + this.lastSize.Width - 1, this.lastSize.X + this.lastSize.Width + 1 ) ) this.selectedEdgeH = 2;
		else  this.selectedEdgeH = 0;

		if( isBetween( y, this.lastSize.Y - 1, this.lastSize.Y + 1 ) ) this.selectedEdgeV = 1;
		else if( isBetween( y, this.lastSize.Y + this.lastSize.Height - 1, this.lastSize.Y + this.lastSize.Height + 1 ) ) this.selectedEdgeV = 2;
		else  this.selectedEdgeV = 0;

		if( this.selectedEdgeH != 0 || this.selectedEdgeV != 0 ) return true;

		var tx = parseInt(this.X);	var ty = parseInt(this.Y);
		var w = parseInt(this.Width);	var h = parseInt(this.Height);
		if( isBetween(x, tx, tx + w - 1) && isBetween(y, ty, ty + h - 1) ) {
			this.selectedEdgeH = 3;
			this.selectedEdgeV = 3;
			return true;
		}
		return false;
	}

	tryCursorModify( dx, dy ) {
		dx = parseInt(dx);	dy = parseInt(dy);

		var x0 = parseInt( this.lastSize.X ); var x1 = x0 + parseInt( this.lastSize.Width );
		var y0 = parseInt( this.lastSize.Y ); var y1 = y0 + parseInt( this.lastSize.Height );

		if( this.selectedEdgeH == 1 || this.selectedEdgeH == 3 ) x0 += dx;
		if( this.selectedEdgeH == 2 || this.selectedEdgeH == 3 ) x1 += dx;
		
		if( this.selectedEdgeV == 1 || this.selectedEdgeV == 3 ) y0 += dy;
		if( this.selectedEdgeV == 2 || this.selectedEdgeV == 3 ) y1 += dy;
		
		this.X = Math.min( x0, x1 );
		this.Y = Math.min( y0, y1 );
		
		this.Width = Math.abs( x0 - x1 );
		this.Height = Math.abs( y0 - y1 );
	}

	
	generateCode(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		var strCode = "";
		
		var colorF = "1";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
		}
		
		strCode += className;
		if(this.Round){
			if(this.Fill)	strCode += ".fillRoundRect(";
			else			strCode += ".drawRoundRect(";
		} else {
			if(this.Fill)	strCode += ".fillRect(";
			else 			strCode += ".drawRect(";
		}
		
		strCode += this.X + "," + this.Y + "," + this.Width + "," + this.Height + ", " + colorF + ");\n";
		
		return strCode;
	}
}





class Circle extends Control {
	Type = "Circle";
	Fill = 0;
	R = 0;
	selectedBorder = 0; // 0 - click in middle, 1 - click on border
	static cnum = 0;
	constructor(name, x = 0, y = 0, r = 3) {
		if( name.length == 0) name = "circle" + Rectangle.cnum++;
		super(name, x, y);
		this.R = r;
	}
	
	showProperties(panel) {
		var tab = super.showProperties(panel);
		createRow(this, tab, "number", "R", this.R);
		createRow(this, tab, "checkbox", "Fill", this.Fill);
		return tab;
	}
	
	draw(ctx) {
		if(this.Fill)	fillCircle(this.X, this.Y, this.R, this.ColorRGBA);
		else			drawCircle(this.X, this.Y, this.R, this.ColorRGBA);
	}
	
	checkCursorOver(x, y) {
		this.lastSize = { X: Number(this.X), Y: Number(this.Y) , cX: Number(x), cY: Number(y) };

		var rc = getRsqr(x, y, this.X, this.Y);
		this.selectedBorder = 0;
		if( rc <= Math.pow( parseFloat(this.R) - 0.8, 2 ) ) return true;

		if( rc <= Math.pow( parseFloat(this.R) + 0.8, 2 ) ) {
			this.selectedBorder = 1;
			return true;
		}

		return false;
	}

	tryCursorModify( dx, dy ) {
		dx = parseInt(dx);	dy = parseInt(dy);
		if( this.selectedBorder == 1 ) {
			this.R = parseInt( Math.sqrt( getRsqr(this.X, this.Y, parseInt(this.lastSize.cX) + parseInt(dx), parseInt(this.lastSize.cY) + parseInt(dy)) ) );
		} else {
			this.X = this.lastSize.X + dx;	this.Y = this.lastSize.Y + dy;
		}
	}
	
	
	generateCode(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		var strCode = "";
		
		var colorF = "1";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
		}
		
		strCode += className;
		if(this.Fill)	strCode += ".fillCircle(";
		else			strCode += ".drawCircle(";
		
		strCode += this.X + "," + this.Y + "," + this.R + ", " + colorF + ");\n";
		
		return strCode;
	}
}










class ProgressBar extends Rectangle {
	Type = "ProgressBar";
	static cnum = 0;
	constructor(name, x = 0, y = 0, width = 30, height = 10, fill = 0, round = 0, r = 1) {
		if( name.length == 0) name = "progressBar" + ProgressBar.cnum++;
		super(name, x, y);
		this.Width = width;
		this.Height = height;
		this.Fill = fill;
		this.Round = round;
		this.R = r;
	}
	
	showProperties(panel) {
		var tab = super.showProperties(panel);
		createRow(this, tab, "number", "Width", this.Width);
		createRow(this, tab, "number", "Height", this.Height);
		createRow(this, tab, "checkbox", "Fill", this.Fill);
		createRow(this, tab, "checkbox", "Round", this.Round);
		createRow(this, tab, "number", "R", this.R);
		return tab;
	}
	
	draw(ctx) {
		if(this.Round){
			if(this.Fill)	fillRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.ColorRGBA);
			else			drawRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.ColorRGBA);
		} else {
			if(this.Fill)	fillRect(this.X, this.Y, this.Width, this.Height, this.ColorRGBA);
			else			drawRect(this.X, this.Y, this.Width, this.Height, this.ColorRGBA);
		}
	}
	

	
	generateCode(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		var strCode = "";
		
		var colorF = "1";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
		}
		
		strCode += className;
		if(this.Round){
			if(this.Fill)	strCode += ".fillRoundRect(";
			else			strCode += ".drawRoundRect(";
		} else {
			if(this.Fill)	strCode += ".fillRect(";
			else 			strCode += ".drawRect(";
		}
		
		strCode += this.X + "," + this.Y + "," + this.Width + "," + this.Height + ", " + colorF + ");\n";
		
		return strCode;
	}
}


