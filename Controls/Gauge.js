class Gauge extends Rectangle {
	Type = "Gauge";
	
	Scale = 10;
	Border = 0;
	BorderColor = "#FFFFFF";
	BorderColorRGBA = {r:0, g:0, b:0, a:255};

	GotUpdater = true;
	static cnum = 0;
	constructor(name, x = 0, y = 0, width = 30, height = 10, fill = 0, round = 0, r = 1) {
		if( name.length == 0) name = "gauge" + Gauge.cnum++;
		super(name, x, y, width, height, fill, round, r);
		this.FillColor = "#000000";
	}
	
	forceParser() {
		super.forceParser();
	}

	updateRGBcolor() {
		super.updateRGBcolor();
		this.BorderColorRGBA = hexToRgb( this.BorderColor );
	}

	showProperties(panel, tab) {
		this.setAutoFunctionName();

		tab = super.showProperties(panel, tab);
		// createRow(this, tab, "combobox", "Direction", this.Direction,  Object.values(Directions) );
		createRow(this, tab, "number", "Scale", this.Scale);
		createRow(this, tab, "checkbox", "Border", this.Border);
		if(this.Border) createRow(this, tab, "color", "BorderColor", this.BorderColor);
		createRow(this, tab, "text", "FunctionName", this.FunctionName);

		return tab;
	}
	
	draw(ctx) {
		this.forceParser();
		var fillValue = 0.625;

		var x = Number(this.X) + 1, y = Number(this.Y) + 1, w = Number(this.Width) - 2, h = Number(this.Height) - 2;

		// background
		if(this.Fill) {
			if(this.Round)	fillRoundRect(x, y, w, h, this.R, this.FillColorRGBA);
			else			fillRect(x, y, w, h, this.FillColorRGBA);
		}

		// scale
		var RSize = 0.8, arrowSize = RSize;
		var x0 = x + w/2, y0 = y + h - 1;
		var rx = w/2, ry = h - 1;
		for(var i = 0; i <= this.Scale; i++) {
			var ai = ( 165 - i/this.Scale * 150 ) / 180 * Math.PI;
			var xi0 = x0 + rx * Math.cos( ai ), yi0 = y0 - ry * Math.sin(ai);
			var xi1 = x0 + RSize * rx * Math.cos( ai ), yi1 = y0 - RSize * ry * Math.sin(ai);
			drawLine(xi0, yi0, xi1, yi1, this.ColorRGBA);
		}

		// arrow
		var arrowAngle = ( 165 - fillValue * 150 ) / 180 * Math.PI;
		var arrowX = x0 + RSize * rx * Math.cos( arrowAngle ),
			arrowY = y0 - RSize * ry * Math.sin( arrowAngle );
		drawLine(x0, y0, arrowX, arrowY, this.ColorRGBA);
		
		// border
		if(this.Border) {
			if(this.Round)	drawRoundRect(x, y, w, h, this.R, this.BorderColorRGBA);
			else 			drawRect(x, y, w, h, this.BorderColorRGBA);
		}
	}
	
	getBoundingBox() {
		this.forceParser();
		var x = this.X, y = this.Y;
		var w = this.Width, h = this.Height;
		return {x, y, w, h};
	}
	
	drawBounding(ctx) {
		this.forceParser();
		drawBoundingBox(ctx, this.getBoundingBox());
		drawModifier(ctx, this.X + 0.5, this.Y + 0.5);
		drawModifier(ctx, this.X + this.Width - 0.5, this.Y + 0.5);
		drawModifier(ctx, this.X + this.Width - 0.5, this.Y + this.Height - 0.5);
		drawModifier(ctx, this.X + 0.5, this.Y + this.Height - 0.5);
	}

	
	generateCode(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		this.forceParser();
		var strCode = "";
		this.setAutoFunctionName();

		strCode += "\t" + this.FunctionName + "(" + 0.625 + ");\n";

		// var colorF = "1", colorFill = "1", colorBorder = "0";
		
		// if( oneColor ) {
		// 	colorF = RGB2binaryColor(this.ColorRGBA);
		// 	colorFill = RGB2binaryColor(this.FillColorRGBA);
		// 	colorBorder = RGB2binaryColor(this.BorderColorRGBA);
		// } else {
		// 	colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
		// 	colorFill = "0x" + componentToHex( RGB2565( this.FillColorRGBA ), 4 );
		// 	colorBorder = "0x" + componentToHex( RGB2565( this.BorderColorRGBA ), 4 );
		// }


		// // ========
		// var fillValue = 0.625;

		// var x = Number(this.X) + 1, y = Number(this.Y) + 1, w = Number(this.Width) - 2, h = Number(this.Height) - 2;

		// // background
		// if(this.Fill) {
		// 	if(this.Round)	strCode += codeFillRoundRect(className, x, y, w, h, this.R, colorFill);
		// 	else			strCode += codeFillRect(className, x, y, w, h, colorFill);
		// }

		// // scale
		// var RSize = 0.8, arrowSize = RSize;
		// var x0 = x + w/2, y0 = y + h - 1;
		// var rx = w/2, ry = h - 1;
		
		// strCode += "\tdouble RSize = 0.8, arrowSize = " + RSize + ";\n";
		// strCode += "\tdouble x0 = " + (x + w/2) + ", y0 = " + (y + h - 1) + ";\n";
		// strCode += "\tdouble rx = " + (w/2) + ", ry = " + (h - 1) + ";\n";
		// strCode += "\tdouble ai = 0, xi0 = 0, yi0 = 0, xi1 = 0, yi1 = 0;\n";
		// strCode += "\tfor(int i = 0; i <= " + this.Scale + "; i++) {\n";
		// strCode += "\t\tai = ( 165 - double(150 * i)/" + this.Scale + " ) / 180 * PI;\n";
		// strCode += "\t\txi0 = x0 + rx * cos( ai ); yi0 = y0 - ry * sin(ai);\n";
		// strCode += "\t\txi1 = x0 + RSize * rx * cos( ai ); yi1 = y0 - RSize * ry * sin(ai);\n";
		// // strCode += "\t\tdrawLine((int)xi0, (int)yi0, (int)xi1, (int)yi1, " + colorF + ");\n";
		// strCode += "\t" + codeDrawLine(className, "(int)xi0", "(int)yi0", "(int)xi1", "(int)yi1", colorF);
		// strCode += "\t}\n";


		// // arrow
		// strCode += "\tdouble arrowAngle = ( 165 - " + fillValue + " * 150 ) / 180 * PI;\n";
		// strCode += "\tdouble arrowX = x0 + RSize * rx * cos( arrowAngle );\n";
		// strCode += "\tdouble arrowY = y0 - RSize * ry * sin( arrowAngle );\n";
		// // strCode += "\tdrawLine((int)x0, (int)y0, (int)arrowX, (int)arrowY, " + colorF + ");\n";
		// strCode += codeDrawLine(className, "(int)x0", "(int)y0", "(int)arrowX", "(int)arrowY", colorF);
		
		// // border
		// if(this.Border) {
		// 	if(this.Round)	strCode += codeDrawRoundRect(className, x, y, w, h, this.R, colorBorder);
		// 	else 			strCode += codeDrawRect(className, x, y, w, h, colorBorder);
		// }

		// //
		// var fillValue = 0.6;

		// var x = Number(this.X) + 1, y = Number(this.Y) + 1, w = Number(this.Width) - 2, h = Number(this.Height) - 2;

		// if( this.Direction == Directions.Righ2Left )		x = Math.round( x + (1 - fillValue)*w );
		// else if( this.Direction == Directions.Bottom2Top )	y = Math.round( y + (1 - fillValue)*h );
		
		// if( this.Direction == Directions.Left2Right || this.Direction == Directions.Righ2Left )			w = Math.round(fillValue*w);
		// else if( this.Direction == Directions.Top2Bottom || this.Direction == Directions.Bottom2Top )	h = Math.round(fillValue*h);
		// //

		// if(this.Fill) {
		// 	if(this.Round)	strCode += codeFillRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorFill);
		// 	else			strCode += codeFillRect(className, this.X, this.Y, this.Width, this.Height, colorFill);
		// }

		// if(this.Round)	strCode += codeFillRoundRect(className, x, y, w, h, this.R - 2, colorF);
		// else			strCode += codeFillRect(className, x, y, w, h, colorF);

		// if(this.Round)	strCode += codeDrawRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorBorder);
		// else 			strCode += codeDrawRect(className, this.X, this.Y, this.Width, this.Height, colorBorder);

		return strCode;
	}

	generateCodeUpdater(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		this.forceParser();
		this.setAutoFunctionName();
		var strCode = "";
		
		var colorF = "1", colorFill = "1", colorBorder = "0";
		var colorParent = this.ParentScreen.ColorRGBA;
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
			colorFill = RGB2binaryColor(this.FillColorRGBA);
			colorBorder = RGB2binaryColor(this.BorderColorRGBA);
			colorParent = RGB2binaryColor(colorParent);
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
			colorFill = "0x" + componentToHex( RGB2565( this.FillColorRGBA ), 4 );
			colorBorder = "0x" + componentToHex( RGB2565( this.BorderColorRGBA ), 4 );
			colorParent = "0x" + componentToHex( RGB2565( colorParent ), 4 );
		}

		strCode += "void " + this.FunctionName + "(double value) {\n";
		

		var x = Number(this.X) + 1, y = Number(this.Y) + 1, w = Number(this.Width) - 2, h = Number(this.Height) - 2;
		
		// background
		if(this.Fill) {
			if(this.Round)	strCode += codeFillRoundRect(className, x, y, w, h, this.R, colorFill);
			else			strCode += codeFillRect(className, x, y, w, h, colorFill);
		} else {
			strCode += codeFillRect(className, x, y, w, h, colorParent);
		}

		// scale
		var RSize = 0.8, arrowSize = RSize;
		
		strCode += "\tdouble RSize = 0.8, arrowSize = " + RSize + ";\n";
		strCode += "\tdouble x0 = " + (x + w/2) + ", y0 = " + (y + h - 1) + ";\n";
		strCode += "\tdouble rx = " + (w/2) + ", ry = " + (h - 1) + ";\n";
		strCode += "\tdouble ai = 0, xi0 = 0, yi0 = 0, xi1 = 0, yi1 = 0;\n";
		strCode += "\tfor(int i = 0; i <= " + this.Scale + "; i++) {\n";
		strCode += "\t\tai = ( 165 - double(150 * i)/" + this.Scale + " ) / 180 * PI;\n";
		strCode += "\t\txi0 = x0 + rx * cos( ai ); yi0 = y0 - ry * sin(ai);\n";
		strCode += "\t\txi1 = x0 + RSize * rx * cos( ai ); yi1 = y0 - RSize * ry * sin(ai);\n";
		strCode += "\t" + codeDrawLine(className, "(int)xi0", "(int)yi0", "(int)xi1", "(int)yi1", colorF);
		strCode += "\t}\n";


		// arrow
		strCode += "\tdouble arrowAngle = ( 165 - value * 150 ) / 180 * PI;\n";
		strCode += "\tdouble arrowX = x0 + RSize * rx * cos( arrowAngle );\n";
		strCode += "\tdouble arrowY = y0 - RSize * ry * sin( arrowAngle );\n";
		strCode += codeDrawLine(className, "(int)x0", "(int)y0", "(int)arrowX", "(int)arrowY", colorF);
		
		// border
		if(this.Border) {
			if(this.Round)	strCode += codeDrawRoundRect(className, x, y, w, h, this.R, colorBorder);
			else 			strCode += codeDrawRect(className, x, y, w, h, colorBorder);
		}

		strCode += "}\n";
		return strCode;
	}
}