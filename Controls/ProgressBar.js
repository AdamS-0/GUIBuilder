class ProgressBar extends Rectangle {
	Type = "ProgressBar";
	
	Direction = Directions.Left2Right; // 0: L->R, 1: R->L, 2: T->B, 3: B->T

	BorderColor = "#FFFFFF";
	BorderColorRGBA = {r:0, g:0, b:0, a:255};

	GotUpdater = true;
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
		this.setAutoFunctionName();

		tab = super.showProperties(panel, tab);
		createRow(this, tab, "combobox", "Direction", this.Direction,  Object.values(Directions) );
		createRow(this, tab, "color", "BorderColor", this.BorderColor);
		createRow(this, tab, "checkbox", "GotUpdater", this.GotUpdater);
		createRow(this, tab, "text", "FunctionName", this.FunctionName);

		return tab;
	}
	
	draw(ctx) {
		var fillValue = 0.6;

		var x = Number(this.X) + 1, y = Number(this.Y) + 1, w = Number(this.Width) - 2, h = Number(this.Height) - 2;

		if( this.Direction == Directions.Righ2Left )		x = Math.round( x + (1 - fillValue)*w );
		else if( this.Direction == Directions.Bottom2Top )	y = Math.round( y + (1 - fillValue)*h );
		
		if( this.Direction == Directions.Left2Right || this.Direction == Directions.Righ2Left )			w = Math.round(fillValue*w);
		else if( this.Direction == Directions.Top2Bottom || this.Direction == Directions.Bottom2Top )	h = Math.round(fillValue*h);

		if(this.Fill) {
			if(this.Round)	fillRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.FillColorRGBA);
			else			fillRect(this.X, this.Y, this.Width, this.Height, this.FillColorRGBA);
		}

		if(this.Round)	fillRoundRect(x, y, w, h, this.R - 2, this.ColorRGBA);
		else			fillRect(x, y, w, h, this.ColorRGBA);

		if(this.Round)	drawRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.BorderColorRGBA);
		else 			drawRect(this.X, this.Y, this.Width, this.Height, this.BorderColorRGBA);
		
	}
	
	getBoundingBox() {
		var x = this.X, y = this.Y;
		var w = this.Width, h = this.Height;
		return {x, y, w, h};
	}
	
	drawBounding(ctx) {
		drawBoundingBox(ctx, this.getBoundingBox());
		drawModifier(ctx, this.X + 0.5, this.Y + 0.5);
		drawModifier(ctx, this.X + this.Width - 0.5, this.Y + 0.5);
		drawModifier(ctx, this.X + this.Width - 0.5, this.Y + this.Height - 0.5);
		drawModifier(ctx, this.X + 0.5, this.Y + this.Height - 0.5);
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
		
		//
		var fillValue = 0.6;

		var x = Number(this.X) + 1, y = Number(this.Y) + 1, w = Number(this.Width) - 2, h = Number(this.Height) - 2;

		if( this.Direction == Directions.Righ2Left )		x = Math.round( x + (1 - fillValue)*w );
		else if( this.Direction == Directions.Bottom2Top )	y = Math.round( y + (1 - fillValue)*h );
		
		if( this.Direction == Directions.Left2Right || this.Direction == Directions.Righ2Left )			w = Math.round(fillValue*w);
		else if( this.Direction == Directions.Top2Bottom || this.Direction == Directions.Bottom2Top )	h = Math.round(fillValue*h);
		//

		if(this.Fill) {
			if(this.Round)	strCode += codeFillRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorFill);
			else			strCode += codeFillRect(className, this.X, this.Y, this.Width, this.Height, colorFill);
		}

		if(this.Round)	strCode += codeFillRoundRect(className, x, y, w, h, this.R - 2, colorF);
		else			strCode += codeFillRect(className, x, y, w, h, colorF);

		if(this.Round)	strCode += codeDrawRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorBorder);
		else 			strCode += codeDrawRect(className, this.X, this.Y, this.Width, this.Height, colorBorder);

		return strCode;
	}

	generateCodeUpdater(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		this.setAutoFunctionName();
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

		strCode += "void " + this.FunctionName + "(double value) {\n";
		strCode += "\tuint16_t x = " + x + ", y = " + y + ";\n";
		strCode += "\tdouble w = " + w + ", h = " + h + ";\n";
		strCode += "\tif( value < 0 ) value = 0;\n";
		strCode += "\tif( value > 1 ) value = 1;\n";
		
		if(this.Round)	strCode += codeFillRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorBack);
		else 			strCode += codeFillRect(className, this.X, this.Y, this.Width, this.Height, colorBack);

		if( this.Direction == Directions.Righ2Left )
			strCode += "\tx = round( " + x + " + (1 - value)*" + w + " );\n";
		else if( this.Direction == Directions.Bottom2Top )
			strCode += "\ty = round( " + y + " + (1 - value)*" + h + " );\n";
		
		if( this.Direction == Directions.Left2Right || this.Direction == Directions.Righ2Left )
			strCode += "\tw = round(value*w);\n";
		else if( this.Direction == Directions.Top2Bottom || this.Direction == Directions.Bottom2Top )
			strCode += "\th = round(value*h);\n";
		
		if(this.Fill) {
			if(this.Round)	strCode += codeFillRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorFill);
			else			strCode += codeFillRect(className, this.X, this.Y, this.Width, this.Height, colorFill);
		}

		if(this.Round)	strCode += codeFillRoundRect(className, "x", "y", "w", "h", this.R - 2, colorF);
		else			strCode += codeFillRect(className, "x", "y", "w", "h", colorF);

		if(this.Round)	strCode += codeDrawRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorFill);
		else 			strCode += codeDrawRect(className, this.X, this.Y, this.Width, this.Height, colorFill);
		
		strCode += "}\n";
		return strCode;
	}
}