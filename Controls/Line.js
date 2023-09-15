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
	
	forceParser() {
		super.forceParser();
		this.EndX = parseInt(this.EndX);
		this.EndY = parseInt(this.EndY);
	}

	showProperties(panel, tab) {
		tab = super.showProperties(panel, tab);
		createRow(this, tab, "number", "EndX", this.EndX);
		createRow(this, tab, "number", "EndY", this.EndY);
		return tab;
	}
	
	draw(ctx) {
		this.forceParser();
		drawLine(this.X, this.Y, this.EndX, this.EndY, this.ColorRGBA);
	}
	
	getBoundingBox() {
		this.forceParser();
		var x = Math.min(this.X, this.EndX), y = Math.min(this.Y, this.EndY);
		var endx = Math.max(this.X, this.EndX) + 1, endy = Math.max(this.Y, this.EndY) + 1;
		var w = endx - x, h = endy - y;
		return {x, y, w, h};
	}
	
	drawBounding(ctx) {
		this.forceParser();
		drawBoundingBox(ctx, this.getBoundingBox());
		drawModifier(ctx, this.X + 0.5, this.Y + 0.5);
		drawModifier(ctx, this.EndX + 0.5, this.EndY + 0.5);
	}

	saveLastSize() {
		this.forceParser();
		this.lastSize = { X: Number(this.X), Y: Number(this.Y), EndX: Number(this.EndX), EndY: Number(this.EndY) };
	}

	checkCursorOver(x, y) {
		this.saveLastSize();
		this.selectedVert = 0;

		if( checkCursorOnBoundingModifier(x, y, this.X, this.Y ) )				this.selectedVert = 1;
		else if( checkCursorOnBoundingModifier(x, y, this.EndX, this.EndY ) )	this.selectedVert = 2;

		if( this.selectedVert > 0 ) return true;

		
		var R = checkCursorOnLine( x, y, this.X, this.Y, this.EndX, this.EndY );
		if( Math.abs( R ) < 2 ) return true;
		
		return false;
	}

	tryCursorModify( dx, dy ) {
		this.forceParser();
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

	tryCursorMove( dx, dy ) {
		this.forceParser();
		dx = parseInt(dx);	dy = parseInt(dy);
		this.X = this.lastSize.X + dx;	this.Y = this.lastSize.Y + dy;
		this.EndX = this.lastSize.EndX + dx;	this.EndY = this.lastSize.EndY + dy;
	}

	moveBy(dx, dy) {
		this.forceParser();
		dx = parseInt(dx);	dy = parseInt(dy);
		this.X = parseInt(this.X) + dx;	this.Y = parseInt(this.Y) + dy;
		this.EndX = parseInt(this.EndX) + dx;	this.EndY = parseInt(this.EndY) + dy;
		this.requiredRefresh();
	}


	generateCode(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		this.forceParser();
		var strCode = "";
		
		var colorF = "1";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
		}
		
		strCode += codeDrawLine(className, this.X, this.Y, this.EndX, this.EndY, colorF);
		
		return strCode;
	}
}