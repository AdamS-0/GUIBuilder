function createRow(sender, tab, propType, propertyName, propertyValue, comboOptions = []) {
	var row = tab.insertRow(-1);
	var c0 = row.insertCell(0);	var c1 = row.insertCell(1);
	var elemInput;
	c1.style.display="inline-block";

	if( propType == "combobox" ) {
		elemInput = document.createElement("select");
		for( var i = 0; i < comboOptions.length; i++ ){
			var optEl = document.createElement("option");
			optEl.value = comboOptions[i];
			optEl.text = comboOptions[i];
			elemInput.appendChild(optEl);
			if( propertyValue == comboOptions[i] ) optEl.selected = true;
		}
	} else {
		elemInput = document.createElement("input"); elemInput.type = propType; elemInput.value = propertyValue;
		if( propType == "number" ) elemInput.min = 0;
		if( propType == "checkbox" ) elemInput.checked = propertyValue;
		
	}

	c0.innerHTML = propertyName;
	elemInput.style.maxWidth = "100px";
	elemInput.onchange = function(e){
		if( propType == "checkbox" )	sender[propertyName] = 0 + e.target.checked;
		else 							sender[propertyName] = e.target.value;
		sender.requiredRefresh();
	};
	c1.appendChild(elemInput);

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

function screenItemDoubleClick(e) {
	scrName = e.target.name;
	
	scr = screens.find( s => s.Name == scrName );
	scr.showControlsAtList = !scr.showControlsAtList;
	//selectedScreen = screens.indexOf(scr);
	loadScreensList();
	// showProps(scr);
	// selectedControl = null;
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
	
	var tab = document.createElement("table");
	tab.style.display = "block";
	tab.style.maxWidth = "230px";

	if(ctrl == null) {
		tab = scr.showProperties(tabProps, tab);
		spn.innerHTML = " - " + scr.Name;
		
		selectedScreenChanged();
		return;
	}
	
	tab = ctrl.showProperties(tabProps, tab);
	spn.innerHTML = " - " + scr.Name + " > " + ctrl.Name;
	
	addRowButton(scr, ctrl, tab, "Delete", function(){ deleteControl(scr, ctrl); });
	addRowButton(scr, ctrl, tab, "To Back", function(){ sendControlToBack(scr, ctrl); });
	addRowButton(scr, ctrl, tab, "To Front", function(){ bringControlToFront(scr, ctrl); });
}



class Screen{
	showControlsAtList = 1;
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
	
	showProperties(panel, tab) {
		panel.innerHTML = "";
		createRow(this, tab, "text", "Name", this.Name);
		createRow(this, tab, "color", "Color", this.Color);
		createRow(this, tab, "number", "Width", this.Width);
		createRow(this, tab, "number", "Height", this.Height);
		createRow(this, tab, "checkbox", "OneColor", this.OneColor);
		panel.appendChild(tab);
		
		return tab;
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

		for( var i = 0; i < this.Controls.length; i++ ) {
			if( this.Controls[i].gotUpdater ) {
				strCode += "\n// call this function to refresh control: " + this.Controls[i].Name + "\n";
				strCode += this.Controls[i].generateCodeUpdater(className, this.OneColor);
			}
		}

		strCode += "\n// call this function to refresh whole screen\n";
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

	gotUpdater = false;
	
	static cnum = 0;
	constructor(name, x = 0, y = 0) {
		if( name.length == 0) name = "control" + Control.cnum++;
		this.Name = name;
		this. X = x; this.Y = y;
	}
	
	showProperties(panel, tab) {
		panel.innerHTML = "";
		createRow(this, tab, "text", "Name", this.Name);
		createRow(this, tab, "color", "Color", this.Color);
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

	generateCodeUpdater(className = "tft", oneColor = 0) {
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
	
	showProperties(panel, tab) {
		tab = super.showProperties(panel, tab);
		createRow(this, tab, "text", "Text", this.Text);
		createRow(this, tab, "color", "Background", this.Background);
		createRow(this, tab, "number", "TextSize", this.TextSize);
		return tab;
	}
	
	updateRGBcolor() {
		super.updateRGBcolor();
		this.BackgroundRGBA = hexToRgb( this.Background );
	}
	
	draw(ctx) {
		setFontSize(this.TextSize);
		setCursor(this.X, this.Y);
		printString(this.Text, this.ColorRGBA, this.BackgroundRGBA);
	}
	
	checkCursorOver(x, y) {
		this.lastSize = { X: this.X, Y: this.Y };

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
	
	showProperties(panel, tab) {
		tab = super.showProperties(panel, tab);
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

	FillColor = "#FFFFFF";
	FillColorRGBA = {r:0, g:0, b:0, a:255};

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
	
	showProperties(panel, tab) {
		tab = super.showProperties(panel, tab);
		createRow(this, tab, "number", "Width", this.Width);
		createRow(this, tab, "number", "Height", this.Height);
		createRow(this, tab, "checkbox", "Fill", this.Fill);
		createRow(this, tab, "color", "FillColor", this.FillColor);
		createRow(this, tab, "checkbox", "Round", this.Round);
		createRow(this, tab, "number", "R", this.R);
		return tab;
	}

	updateRGBcolor() {
		super.updateRGBcolor();
		this.FillColorRGBA = hexToRgb( this.FillColor );
	}
	
	draw(ctx) {
		if(this.Round){
			if(this.Fill)	fillRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.FillColorRGBA);
			drawRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.ColorRGBA);
		} else {
			if(this.Fill)	fillRect(this.X, this.Y, this.Width, this.Height, this.FillColorRGBA);
			drawRect(this.X, this.Y, this.Width, this.Height, this.ColorRGBA);
		}
	}
	
	checkCursorOver(x, y) {
		
		this.lastSize = { X: Number(this.X), Y: Number(this.Y), Width: Number(this.Width), Height: Number(this.Height) };
		this.selectedEdgeH = 0;	this.selectedEdgeV = 0;

		var tx = parseInt(this.X), ty = parseInt(this.Y), tw = parseInt(this.Width), th = parseInt(this.Height);
		if( !( isBetween(x, tx, tx + tw) && isBetween(y, ty, ty + th) ) ) return false;
		
		if( isBetween( x, tx - 1, tx + 1 ) )					this.selectedEdgeH = 1;
		else if( isBetween( x, tx + tw - 1, tx + tw + 1 ) )		this.selectedEdgeH = 2;
		else  this.selectedEdgeH = 0;

		if( isBetween( y, ty - 1, ty + 1 ) ) 				this.selectedEdgeV = 1;
		else if( isBetween( y, ty + th - 1, ty + th + 1 ) )	this.selectedEdgeV = 2;
		else  this.selectedEdgeV = 0;

		if( this.selectedEdgeH != 0 || this.selectedEdgeV != 0 ) return true;

		if( isBetween(x, tx, tx + tw - 1) && isBetween(y, ty, ty + th - 1) ) {
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
		
		var colorF = "1", colorFill = "0";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
			colorFill = RGB2binaryColor( this.FillColorRGBA );
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
			colorFill = "0x" + componentToHex( RGB2565( this.FillColorRGBA ), 4 );
		}
		
		strCode += className;
		if(this.Round){
			if(this.Fill)	strCode += ".fillRoundRect(";
			else			strCode += ".drawRoundRect(";
		} else {
			if(this.Fill)	strCode += ".fillRect(";
			else 			strCode += ".drawRect(";
		}
		
		strCode += this.X + "," + this.Y + "," + this.Width + "," + this.Height + (this.Round ? "," + this.R : " ") + ", " + colorFill + ");\n";



		strCode += className;
		if(this.Round)	strCode += ".drawRoundRect(";
		else 			strCode += ".drawRect(";
		
		strCode += this.X + "," + this.Y + "," + this.Width + "," + this.Height + (this.Round ? "," + this.R : " ") + ", " + colorF + ");\n";

		return strCode;
	}
}





class Circle extends Control {
	Type = "Circle";
	Fill = 0;
	R = 0;
	selectedBorder = 0; // 0 - click in middle, 1 - click on border

	FillColor = "#FFFFFF";
	FillColorRGBA = {r:0, g:0, b:0, a:255};

	static cnum = 0;
	constructor(name, x = 0, y = 0, r = 3) {
		if( name.length == 0) name = "circle" + Rectangle.cnum++;
		super(name, x, y);
		this.R = r;
	}
	
	showProperties(panel, tab) {
		tab = super.showProperties(panel, tab);
		createRow(this, tab, "number", "R", this.R);
		createRow(this, tab, "checkbox", "Fill", this.Fill);
		createRow(this, tab, "color", "FillColor", this.FillColor);
		return tab;
	}
	
	updateRGBcolor() {
		super.updateRGBcolor();
		this.FillColorRGBA = hexToRgb( this.FillColor );
	}

	draw(ctx) {
		if(this.Fill)	fillCircle(this.X, this.Y, this.R, this.FillColorRGBA);
		drawCircle(this.X, this.Y, this.R, this.ColorRGBA);
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








const Directions = {
	Left2Right: "Left to right",
	Righ2Left: "Right to left",
	Top2Bottom: "Top to bottom",
	Bottom2Top: "Bottom to top"
}

class ProgressBar extends Rectangle {
	Type = "ProgressBar";
	
	Direction = Directions.Left2Right; // 0: L->R, 1: R->L, 2: T->B, 3: B->T

	BorderColor = "#FFFFFF";
	BorderColorRGBA = {r:0, g:0, b:0, a:255};

	gotUpdater = true;
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
	

	updateRGBcolor() {
		super.updateRGBcolor();
		this.BorderColorRGBA = hexToRgb( this.BorderColor );
	}

	showProperties(panel, tab) {
		tab = super.showProperties(panel, tab);
		createRow(this, tab, "combobox", "Direction", this.Direction,  Object.values(Directions) );
		createRow(this, tab, "color", "BorderColor", this.BorderColor);
		return tab;
	}
	
	draw(ctx) {
		var fillValue = 0.6;

		var x = Number(this.X), y = Number(this.Y), w = Number(this.Width), h = Number(this.Height);

		if( this.Direction == Directions.Righ2Left )		x = Math.round( x + (1 - fillValue)*w );
		else if( this.Direction == Directions.Bottom2Top )	y = Math.round( y + (1 - fillValue)*h );
		
		if( this.Direction == Directions.Left2Right || this.Direction == Directions.Righ2Left )			w = Math.round(fillValue*w);
		else if( this.Direction == Directions.Top2Bottom || this.Direction == Directions.Bottom2Top )	h = Math.round(fillValue*h);

		if(this.Fill) {
			if(this.Round)	fillRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.FillColorRGBA);
			else			fillRect(this.X, this.Y, this.Width, this.Height, this.FillColorRGBA);
		}

		if(this.Round)	fillRoundRect(x, y, w, h, this.R, this.ColorRGBA);
		else			fillRect(x, y, w, h, this.ColorRGBA);

		if(this.Round)	drawRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.BorderColorRGBA);
		else 			drawRect(this.X, this.Y, this.Width, this.Height, this.BorderColorRGBA);
		
	}
	

	
	generateCode(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		var strCode = "";
		
		var colorF = "1", colorFill = "1", colorBorder = "0";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
			colorFill = RGB2binaryColor(this.FillColorRGBA);
			colorBorder = RGB2binaryColor(this.BorderColorRGBA);
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
			colorFill = "0x" + componentToHex( RGB2565( this.FillColorRGBA ), 4 );
			colorBorder = "0x" + componentToHex( RGB2565( this.BorderColorRGBA ), 4 );
		}
		
		var x = Number(this.X) + 1, y = Number(this.Y) + 1, w = Number(this.Width) - 2, h = Number(this.Height) - 2;

		if(this.Fill) {
			strCode += className;
			if(this.Round)	strCode += ".fillRoundRect(";
			else			strCode += ".fillRect(";
			strCode += this.X + "," + this.Y + "," + this.Width + "," + this.Height + (this.Round ? "," + this.R : " ") + ", " + colorFill + ");\n";
		}

		strCode += className;
		if(this.Round)	strCode += ".drawRoundRect(";
		else 			strCode += ".drawRect(";
		
		strCode += this.X + "," + this.Y + "," + this.Width + "," + this.Height + (this.Round ? "," + this.R : " ") + ", " + colorBorder + ");\n";
		
		return strCode;
	}

	generateCodeUpdater(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		var strCode = "";
		
		var colorF = "1", colorFill = "1", colorBorder = "0", colorBack = "0";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
			colorFill = RGB2binaryColor(this.FillColorRGBA);
			colorBorder = RGB2binaryColor(this.BorderColorRGBA);
			colorBack = RGB2binaryColor( this.ParentScreen.ColorRGBA );
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
			colorFill = "0x" + componentToHex( RGB2565( this.FillColorRGBA ), 4 );
			colorBorder = "0x" + componentToHex( RGB2565( this.BorderColorRGBA ), 4 );
			colorBack = "0x" + componentToHex( RGB2565( this.ParentScreen.ColorRGBA ), 4 );
		}

		var x = Number(this.X) + 1, y = Number(this.Y) + 1, w = Number(this.Width) - 2, h = Number(this.Height) - 2;

		strCode += "void " + this.Name + "_update(double value) {\n";
		strCode += "uint16_t x = " + x + ", y = " + y + ";\ndouble w = " + w + ", h = " + h + ";\n";
		strCode += "if( value < 0 ) value = 0;\n";
		strCode += "if( value > 1 ) value = 1;\n";

		strCode += className;
		if(this.Round)	strCode += ".fillRoundRect(";
		else			strCode += ".fillRect(";
		strCode += this.X + "," + this.Y + "," + this.Width + "," + this.Height + (this.Round ? "," + this.R : " ") + ", " + colorBack + ");\n";
		
		if( this.Direction == Directions.Righ2Left )
			strCode += "x = round( " + x + " + (1 - value)*" + w + " );\n";
		else if( this.Direction == Directions.Bottom2Top )
			strCode += "y = round( " + y + " + (1 - value)*" + h + " );\n";
		
		if( this.Direction == Directions.Left2Right || this.Direction == Directions.Righ2Left )
			strCode += "w = round(value*w);\n";
		else if( this.Direction == Directions.Top2Bottom || this.Direction == Directions.Bottom2Top )
			strCode += "h = round(value*h);\n";


		if(this.Fill) {
			strCode += className;
			if(this.Round)	strCode += ".fillRoundRect(";
			else			strCode += ".fillRect(";
			strCode += this.X + "," + this.Y + "," + this.Width + "," + this.Height + (this.Round ? "," + this.R : " ") + ", " + colorFill + ");\n";
		}

		strCode += className + ".fill" + (this.Round ? "RoundRect" : "Rect") + "( x, y, w, h," + (this.Round ? this.R : " ") + "," + colorF + ");\n";

		strCode += className;
		if(this.Round)	strCode += ".drawRoundRect(";
		else 			strCode += ".drawRect(";
		
		strCode += this.X + "," + this.Y + "," + this.Width + "," + this.Height + (this.Round ? "," + this.R : " ") + ", " + colorBorder + ");\n";


		strCode += "}\n";
		return strCode;
	}
}


