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
	
	getBoundingBox() {
		var x = Math.min(this.X, this.EndX), y = Math.min(this.Y, this.EndY);
		var endx = Math.max(this.X, this.EndX) + 1, endy = Math.max(this.Y, this.EndY) + 1;
		var w = endx - x, h = endy - y;
		return {x, y, w, h};
	}
	
	drawBounding(ctx) {
		drawBoundingBox(ctx, this.getBoundingBox());
		drawModifier(ctx, this.X + 0.5, this.Y + 0.5);
		drawModifier(ctx, this.EndX + 0.5, this.EndY + 0.5);
	}

	saveLastSize() {
		this.lastSize = { X: Number(this.X), Y: Number(this.Y), EndX: Number(this.EndX), EndY: Number(this.EndY) };
	}

	checkCursorOver(x, y) {
		this.saveLastSize();
		var R0 = Math.abs( getRsqr(x, y, this.X, this.Y) );
		
		if (R0 < 2) {
			this.selectedVert = 1;
			return true;
		}
		var R1 = Math.abs( getRsqr(x, y, this.EndX, this.EndY) );
		
		if (R1 < 2) {
			this.selectedVert = 2;
			return true;
		}

		var dX = this.EndX - this.X;	var dY = this.EndY - this.Y; // delta XY of line
		var cdX = x - this.X;	var cdY = y - this.Y; // delta XY of cursor
		
		R0 = Math.abs( Math.sqrt( R0 ) ); // radius: cursor <-> (X, Y)
		var RLine = Math.abs( Math.sqrt( getRsqr(this.X, this.Y, this.EndX, this.EndY) ) ); // line length
		var alphaL = Math.atan2( dY, dX ); // alpha line
		var alphaC = Math.atan2( cdY, cdX ); // alpha cursor
		var alpha = -alphaL + alphaC;
		var c2x = R0 * Math.cos( alpha );
		
		this.selectedVert = 0;
		if( !isBetween(c2x, 0, RLine) ) return false;
		
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

	tryCursorMove( dx, dy ) {
		dx = parseInt(dx);	dy = parseInt(dy);
		this.X = this.lastSize.X + dx;	this.Y = this.lastSize.Y + dy;
		this.EndX = this.lastSize.EndX + dx;	this.EndY = this.lastSize.EndY + dy;
	}

	moveBy(dx, dy) {
		dx = parseInt(dx);	dy = parseInt(dy);
		this.X = parseInt(this.X) + dx;	this.Y = parseInt(this.Y) + dy;
		this.EndX = parseInt(this.EndX) + dx;	this.EndY = parseInt(this.EndY) + dy;
		this.requiredRefresh();
	}


	alignLeft(x) {
		var bbox = this.getBoundingBox();
		var dx = x - bbox.x;
		this.X += parseFloat(dx);
		this.EndX += parseFloat(dx);
	}

	alignMiddle(x) {
		var bbox = this.getBoundingBox();
		var dx = x - ( parseFloat(bbox.x) + parseFloat(bbox.w/2));
		this.X += parseFloat(dx);
		this.EndX += parseFloat(dx);
	}

	alignRight(x) {
		var bbox = this.getBoundingBox();
		var dx = x - ( parseFloat(bbox.x) + parseFloat(bbox.w) );
		this.X += parseFloat(dx);
		this.EndX += parseFloat(dx);
	}

	alignTop(y) {
		var bbox = this.getBoundingBox();
		var dy = y - bbox.y;
		this.Y += parseFloat(dy);
		this.EndY += parseFloat(dy);
	}

	alignCenter(y) {
		var bbox = this.getBoundingBox();
		var dy = y - ( parseFloat(bbox.y) + parseFloat(bbox.h/2));
		this.Y += parseFloat(dy);
		this.EndY += parseFloat(dy);
	}

	alignBottom(y) {
		var bbox = this.getBoundingBox();
		var dy = y - ( parseFloat(bbox.y) + parseFloat(bbox.h) );
		this.Y += parseFloat(dy);
		this.EndY += parseFloat(dy);
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
		
		strCode += codeDrawLine(className, this.X, this.Y, this.EndX, this.EndY, colorF);
		
		return strCode;
	}
}