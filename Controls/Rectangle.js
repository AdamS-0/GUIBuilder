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
	
	forceParser() {
		super.forceParser();
		this.Width = parseInt(this.Width);
		this.Height = parseInt(this.Height);
		this.R = parseInt(this.R);
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
		this.forceParser();
		if(this.Round){
			if(this.Fill)	fillRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.FillColorRGBA);
			drawRoundRect(this.X, this.Y, this.Width, this.Height, this.R, this.ColorRGBA);
		} else {
			if(this.Fill)	fillRect(this.X, this.Y, this.Width, this.Height, this.FillColorRGBA);
			drawRect(this.X, this.Y, this.Width, this.Height, this.ColorRGBA);
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
	
	saveLastSize() {
		this.forceParser();
		this.lastSize = { X: Number(this.X), Y: Number(this.Y), Width: Number(this.Width), Height: Number(this.Height) };
	}

	checkCursorOver(x, y) {
		this.saveLastSize();
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
		this.forceParser();
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
		this.forceParser();
		var strCode = "";
		
		var colorF = "1", colorFill = "0";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
			colorFill = RGB2binaryColor( this.FillColorRGBA );
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
			colorFill = "0x" + componentToHex( RGB2565( this.FillColorRGBA ), 4 );
		}
		
		
		if(this.Round){
			if(this.Fill)	strCode += codeFillRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorFill);
			else			strCode += codeDrawRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorFill);
		} else {
			if(this.Fill)	strCode += codeFillRect(className, this.X, this.Y, this.Width, this.Height, colorFill);
			else			strCode += codeDrawRect(className, this.X, this.Y, this.Width, this.Height, colorFill);
		}
		
		if(this.Round)	strCode += codeDrawRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorF);
		else 			strCode += codeDrawRect(className, this.X, this.Y, this.Width, this.Height, colorF);
		
		return strCode;
	}
}