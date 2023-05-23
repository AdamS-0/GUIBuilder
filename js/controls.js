function createRow(sender, tab, propType, propertyName, propertyValue) {
	var row = tab.insertRow(-1);
	var c0 = row.insertCell(0);
	var c1 = row.insertCell(1);
	
	var elemInput = document.createElement("input"); elemInput.type = propType; elemInput.value = propertyValue;
	if( propType == "number" ) elemInput.min = 0;
	if( propType == "checkbox" ) elemInput.checked = propertyValue;
	
	c0.innerHTML = propertyName;
	c1.appendChild(elemInput);
	elemInput.onchange = function(e){
		if( propType == "checkbox" )	sender[propertyName] = 0 + e.target.checked;
		else 							sender[propertyName] = e.target.value;
		//loadScreensList();
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




function isBetween(v, a, b) {
	a = parseFloat(a);	b = parseFloat(b);
	var min = Math.min(a, b);
	var max = Math.max(a, b);
	return v >= a && v <= b;
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
		
		strCode += "}";
		
		return strCode;
	}
	
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







class Control {
	Type = "Control";
	Name = "";
	X = 0; Y = 0;
	Color = "#FFFFFF";
	ColorRGBA = {r:255, g:255, b:255, a:255};
	
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
		return isBetween(x, this.X, this.X) && isBetween(y, this.Y, this.Y);
	}
	
	requiredRefresh() {
		if( this.ParentScreen ) this.ParentScreen.requiredRefresh();
		showProps(this.ParentScreen, this);
	}
	
	tryCursorModify( bx, by, px, py, px2, py2 ) {
		this.X = bx + px2 - px;	this.Y = by + py2 - py;
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
	TestSize = 1;
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
		strCode += className + ".setTextSize(" + this.TestSize + ");\n";
		strCode += className + ".setCursor(" + this.X + "," + this.Y + ");\n";
		strCode += className + ".print(\"" + this.Text + "\");\n";
		
		return strCode;
	}
}

class Line extends Control {
	Type = "Line";
	EndX = 0;
	EndY = 0;
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

class HLine extends Control {
	Type = "HLine";
	Width = 0;
	static cnum = 0;
	constructor(name, x = 0, y = 0, width = 10) {
		if( name.length == 0) name = "hLine" + HLine.cnum++;
		super(name, x, y);
		this.Width = width;
	}
	
	showProperties(panel) {
		var tab = super.showProperties(panel);
		createRow(this, tab, "number", "Width", this.Width);
		return tab;
	}
	
	draw(ctx) {
		drawHLine(this.X, this.Y, this.Width, this.ColorRGBA);
	}
	
	checkCursorOver(x, y) {
		return isBetween(x, this.X, this.X + this.Width) && isBetween(y, parseInt(this.Y) - 1, parseInt(this.Y) + 1);
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
		
		strCode += className + ".drawFastHLine(" + this.X + "," + this.Y + "," + this.Width + ", " + colorF + ");\n";
		
		return strCode;
	}
}


class VLine extends Control {
	Type = "VLine";
	Height = 0;
	static cnum = 0;
	constructor(name, x = 0, y = 0, height = 10) {
		if( name.length == 0) name = "vLine" + VLine.cnum++;
		super(name, x, y);
		this.Height = height;
	}
	
	showProperties(panel) {
		var tab = super.showProperties(panel);
		createRow(this, tab, "number", "Height", this.Height);
		return tab;
	}
	
	draw(ctx) {
		drawVLine(this.X, this.Y, this.Height, this.ColorRGBA); //{r:255, g:0, b:0}
	}
	
	checkCursorOver(x, y) {
		var tx = parseInt(this.X);
		return isBetween(x, tx - 1, tx + 1) && isBetween(y, this.Y, parseInt(this.Y) + parseInt(this.Height));
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
		
		strCode += className + ".drawFastVLine(" + this.X + "," + this.Y + "," + this.Height + ", " + colorF + ");\n";
		
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
		var tx = parseInt(this.X);	var ty = parseInt(this.Y);
		var w = parseInt(this.Width);	var h = parseInt(this.Height);
		return isBetween(x, tx, tx + w - 1) && isBetween(y, ty, ty + h - 1);
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
		var rc = Math.pow(x - this.X, 2) + Math.pow(y - this.Y, 2);
		if( rc <= Math.pow( parseFloat(this.R) + 0.5, 2 ) ) return true;
		
		return false;
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









