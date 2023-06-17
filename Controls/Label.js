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
		this.setAutoFunctionName();
		this.TextSize = parseInt(this.TextSize);
		tab = super.showProperties(panel, tab);
		createRow(this, tab, "text", "Text", this.Text);
		createRow(this, tab, "color", "Background", this.Background);
		createRow(this, tab, "number", "TextSize", this.TextSize);
		createRow(this, tab, "checkbox", "GotUpdater", this.GotUpdater);
		createRow(this, tab, "text", "FunctionName", this.FunctionName);
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

	getBoundingBox() {
		var x = this.X, y = this.Y;
		var txtLen = this.Text.length;
		var w = txtLen * 6 * this.TextSize, h = 8;
		return {x, y, w, h};
	}
	
	drawBounding(ctx) {
		drawBoundingBox(ctx, this.getBoundingBox());
	}
	
	saveLastSize() {
		this.lastSize = { X: Number(this.X), Y: Number(this.Y) };
	}

	checkCursorOver(x, y) {
		this.saveLastSize();

		return isBetween(x, this.X, parseInt(this.X) + parseInt(this.TextSize) * 6 * parseInt(this.Text.length) )
			&& isBetween(y, this.Y, parseInt(this.Y) + parseInt(this.TextSize) * 8);
	}
	

	alignCenter(x) {
		var bbox = this.getBoundingBox();
		this.X = x - bbox.w/2;
	}
	alignRight(x) {
		var bbox = this.getBoundingBox();
		this.X = x - bbox.w;
	}

	alignMiddle(y) {
		var bbox = this.getBoundingBox();
		this.Y = y - bbox.h/2;
	}
	
	alignBottom(y) {
		var bbox = this.getBoundingBox();
		this.Y = y - bbox.h;
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

		strCode += codeSetTextColor(className, colorF, colorBg);
		strCode += codeSetTextSize(className, this.TextSize);
		strCode += codeSetCursor(className, this.X, this.Y);
		strCode += codePrint(className, "\"" + this.Text + "\"");
		
		return strCode;
	}

	generateCodeUpdater(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		this.setAutoFunctionName();
		var strCode = "";
		
		var colorF = "1";	var colorBg = "0";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
			colorBg = RGB2binaryColor(this.BackgroundRGBA);
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
			colorBg = "0x" + componentToHex( RGB2565( this.BackgroundRGBA ), 4);
		}

		strCode += "void " + this.FunctionName + "(String msg) {\n";

		strCode += codeSetTextColor(className, colorF, colorBg);
		strCode += codeSetTextSize(className, this.TextSize);
		strCode += codeSetCursor(className, this.X, this.Y);
		strCode += codePrint(className, "msg");

		strCode += "}\n";
		return strCode;
	}
}

