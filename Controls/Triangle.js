class Triangle extends Control {
	Type = "Triangle";
	X1 = 0;	Y1 = 0;
	X2 = 0;	Y2 = 0;
	Fill = 0;

	FillColor = "#FFFFFF";
	FillColorRGBA = {r:0, g:0, b:0, a:255};

	selectedVertex = -1;
	selectedLine = -1;
	

	static cnum = 0;
	constructor(name, x = 0, y = 0, x1 = -1, y1 = -1, x2 = -1, y2 = -1, fill = 0) {
		if( name.length == 0) name = "triangle" + Triangle.cnum++;
		super(name, x, y);
		if(x1 == -1) this.X1 = x - 7;
		if(y1 == -1) this.Y1 = y + 10;
		if(x2 == -1) this.X2 = x + 7;
		if(y2 == -1) this.Y2 = y + 10;
		this.Fill = fill;
	}
	
	forceParser() {
		super.forceParser();
		this.X1 = parseInt(this.X1); this.Y1 = parseInt(this.Y1);
		this.X2 = parseInt(this.X2); this.Y2 = parseInt(this.Y2);
	}

	showProperties(panel, tab) {
		tab = super.showProperties(panel, tab);
		createRow(this, tab, "number", "X1", this.X1);
		createRow(this, tab, "number", "Y1", this.Y1);
		createRow(this, tab, "number", "X2", this.X2);
		createRow(this, tab, "number", "Y2", this.Y2);
		return tab;
	}

	updateRGBcolor() {
		super.updateRGBcolor();
		this.FillColorRGBA = hexToRgb( this.FillColor );
	}
	
	draw(ctx) {
		this.forceParser();
		drawLine(this.X, this.Y, this.X1, this.Y1, this.ColorRGBA);
		drawLine(this.X1, this.Y1, this.X2, this.Y2, this.ColorRGBA);
		drawLine(this.X2, this.Y2, this.X, this.Y, this.ColorRGBA);
		
	}
	
	getBoundingBox() {
		this.forceParser();
		var x = Math.min(this.X, this.X1, this.X2), y = Math.min(this.Y, this.Y1, this.Y2);
		var w = Math.max(this.X, this.X1, this.X2), h = Math.max(this.Y, this.Y1, this.Y2);
		w = w - x; h = h - y;
		return {x, y, w, h};
	}
	
	drawBounding(ctx) {
		this.forceParser();
		drawBoundingBox(ctx, this.getBoundingBox());
		drawModifier(ctx, this.X + 0.5, this.Y + 0.5);
		drawModifier(ctx, this.X1 + 0.5, this.Y1 + 0.5);
		drawModifier(ctx, this.X2 + 0.5, this.Y2 + 0.5);
	}
	
	saveLastSize() {
		this.forceParser();
		this.lastSize = {
			X: Number(this.X), Y: Number(this.Y),
			X1: Number(this.X1), Y1: Number(this.Y1),
			X2: Number(this.X2), Y2: Number(this.Y2) };
	}

	checkCursorOver(x, y) {
		this.saveLastSize();
		this.selectedVertex = -1;
		this.selectedLine = -1;
		var bbox = this.getBoundingBox();
		// if( !( isBetween(x, bbox.x, bbox.x + bbox.w) &&
		// 	isBetween(y, bbox.y, bbox.y + bbox.h) ) ) return false;
		
		if( checkCursorOnBoundingModifier(x, y, this.X, this.Y) ) this.selectedVertex = 0;
		else if( checkCursorOnBoundingModifier(x, y, this.X1, this.Y1) ) this.selectedVertex = 1;
		else if( checkCursorOnBoundingModifier(x, y, this.X2, this.Y2) ) this.selectedVertex = 2;
		else {
			var r01 = checkCursorOnLine(x, y, this.X, this.Y, this.X1, this.Y1);
			var r12 = checkCursorOnLine(x, y, this.X1, this.Y1, this.X2, this.Y2);
			var r20 = checkCursorOnLine(x, y, this.X2, this.Y2, this.X, this.Y);
			if( Math.min(r01, r12, r20) >= 2 ) this.selectedLine = -1;
			else if( r01 < r12 && r01 < r20 ) this.selectedLine = 0;
			else if( r12 < r20 && r12 < r01 ) this.selectedLine = 1;
			else if( r20 < r01 && r20 < r12 ) this.selectedLine = 2;
		}

		if(this.selectedVertex >= 0 || this.selectedLine >= 0) return true;

		return false;
	}

	tryCursorMove( dx, dy ) {
		this.X = this.lastSize.X + dx;	this.Y = this.lastSize.Y + dy;
		this.X1 = this.lastSize.X1 + dx;	this.Y1 = this.lastSize.Y1 + dy;
		this.X2 = this.lastSize.X2 + dx;	this.Y2 = this.lastSize.Y2 + dy;
	}

	tryCursorModify( dx, dy ) {
		this.forceParser();
		dx = parseInt(dx);	dy = parseInt(dy);

		var x0 = parseInt( this.lastSize.X );
		var y0 = parseInt( this.lastSize.Y );
		var x1 = parseInt( this.lastSize.X1 );
		var y1 = parseInt( this.lastSize.Y1 );
		var x2 = parseInt( this.lastSize.X2 );
		var y2 = parseInt( this.lastSize.Y2 );

		if( this.selectedVertex >= 0 ) {
			if( this.selectedVertex == 0 ) { this.X = x0 + dx; this.Y = y0 + dy; }
			else if( this.selectedVertex == 1 ) { this.X1 = x1 + dx; this.Y1 = y1 + dy; }
			else if( this.selectedVertex == 2 ) { this.X2 = x2 + dx; this.Y2 = y2 + dy; }
		} else if( this.selectedLine >= 0 ) {
			if( this.selectedLine == 0 || this.selectedLine == 2 ) {
				this.X = x0 + dx; this.Y = y0 + dy; }
			if( this.selectedLine == 0 || this.selectedLine == 1 ) {
				this.X1 = x1 + dx; this.Y1 = y1 + dy; }
			if( this.selectedLine == 1 || this.selectedLine == 2 ) {
				this.X2 = x2 + dx; this.Y2 = y2 + dy; }
		} else {
			this.tryCursorMove(dx, dy);
		}
	}


	moveBy(dx, dy) {
		this.forceParser();
		dx = parseInt(dx);	dy = parseInt(dy);
		this.X = parseInt(this.X) + dx;	this.Y = parseInt(this.Y) + dy;
		this.X1 = parseInt(this.X1) + dx;	this.Y1 = parseInt(this.Y1) + dy;
		this.X2 = parseInt(this.X2) + dx;	this.Y2 = parseInt(this.Y2) + dy;
		this.requiredRefresh();
	}

	
	// generateCode(className = "tft", oneColor = 0) {
	// 	this.updateRGBcolor();
	// 	this.forceParser();
	// 	var strCode = "";
		
	// 	var colorF = "1", colorFill = "0";
		
	// 	if( oneColor ) {
	// 		colorF = RGB2binaryColor(this.ColorRGBA);
	// 		colorFill = RGB2binaryColor( this.FillColorRGBA );
	// 	} else {
	// 		colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
	// 		colorFill = "0x" + componentToHex( RGB2565( this.FillColorRGBA ), 4 );
	// 	}
		
		
	// 	if(this.Round){
	// 		if(this.Fill)	strCode += codeFillRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorFill);
	// 		else			strCode += codeDrawRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorFill);
	// 	} else {
	// 		if(this.Fill)	strCode += codeFillRect(className, this.X, this.Y, this.Width, this.Height, colorFill);
	// 		else			strCode += codeDrawRect(className, this.X, this.Y, this.Width, this.Height, colorFill);
	// 	}
		
	// 	if(this.Round)	strCode += codeDrawRoundRect(className, this.X, this.Y, this.Width, this.Height, this.R, colorF);
	// 	else 			strCode += codeDrawRect(className, this.X, this.Y, this.Width, this.Height, colorF);
		
	// 	return strCode;
	// }
}