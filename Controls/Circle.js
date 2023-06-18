class Circle extends Control {
	Type = "Circle";
	Fill = 0;
	R = 0;
	selectedBorder = 0; // 0 - click in middle, 1 - click on border

	FillColor = "#FFFFFF";
	FillColorRGBA = {r:0, g:0, b:0, a:255};

	static cnum = 0;
	constructor(name, x = 0, y = 0, r = 3) {
		if( name.length == 0) name = "circle" + Circle.cnum++;
		super(name, x, y);
		this.R = r;
	}

	forceParser() {
		super.forceParser();
		this.R = parseInt(this.R);
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
		this.forceParser();
		if(this.Fill)	fillCircle(this.X, this.Y, this.R, this.FillColorRGBA);
		drawCircle(this.X, this.Y, this.R, this.ColorRGBA);
	}


	getBoundingBox() {
		this.forceParser();
		var x = this.X - this.R, y = this.Y - this.R;
		var w = parseInt(2*this.R) + 1, h = parseInt(2*this.R) + 1;
		return {x, y, w, h};
	}
	
	drawBounding(ctx) {
		this.forceParser();
		drawBoundingBox(ctx, this.getBoundingBox());
	}

	
	saveLastSize(x, y) {
		this.forceParser();
		if(typeof x === "undefined") x = this.lastSize.cX;
		if(typeof y === "undefined") y = this.lastSize.cY;
		
		this.lastSize = { X: Number(this.X), Y: Number(this.Y) , cX: Number(x), cY: Number(y) };
	}

	checkCursorOver(x, y) {
		this.saveLastSize(x, y);
		
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
		this.forceParser();
		dx = parseInt(dx);	dy = parseInt(dy);
		if( this.selectedBorder == 1 ) {
			this.R = parseInt( Math.sqrt( getRsqr(this.X, this.Y, parseInt(this.lastSize.cX) + parseInt(dx), parseInt(this.lastSize.cY) + parseInt(dy)) ) );
		} else {
			this.X = this.lastSize.X + dx;	this.Y = this.lastSize.Y + dy;
		}
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
		
		if(this.Fill)	strCode += codeFillCircle(className, this.X, this.Y, this.R, colorF);
		else			strCode += codeDrawCircle(className, this.X, this.Y, this.R, colorF);
		
		return strCode;
	}
}