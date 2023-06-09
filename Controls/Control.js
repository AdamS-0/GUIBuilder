class Control {
	Type = "Control";
	Name = "";
	X = 0; Y = 0;
	Color = "#FFFFFF";
	ColorRGBA = {r:255, g:255, b:255, a:255};
	
	lastSize = null;

	ParentScreen = null;
	Selected = false;
	
	GotUpdater = false;
	FunctionName = "";
	
	static cnum = 0;
	constructor(name, x = 0, y = 0) {
		if( name.length == 0) name = "control" + Control.cnum++;
		this.Name = name;
		this. X = x; this.Y = y;
	}
	
	setAutoFunctionName() {
		if( this.FunctionName.length == 0 ) {
			this.FunctionName = ( this.ParentScreen != null ? this.ParentScreen.Name + "_" : "null") +
				this.Name + "_update";
		}
	}

	forceParser() {
		this.X = parseInt(this.X);
		this.Y = parseInt(this.Y);
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

	getBoundingBox() {
		this.forceParser();
		return {x: 0, y: 0, w: 0, h: 0};
	}
	
	drawBounding(ctx) {
		drawBoundingBox(ctx, this.X, this.Y, 1, 1);
	}
	

	saveLastSize() {
		this.lastSize = { X: Number(this.X), Y: Number(this.Y) };
	}

	checkCursorOver(x, y) {
		this.saveLastSize();
		return isBetween(x, this.X, this.X) && isBetween(y, this.Y, this.Y);
	}
	
	requiredRefresh() {
		if( this.ParentScreen ) this.ParentScreen.requiredRefresh();
		showProps(this.ParentScreen, this);
	}
	
	tryCursorModify( dx, dy ) {
		this.X = this.lastSize.X + dx;	this.Y = this.lastSize.Y + dy;
	}

	tryCursorMove( dx, dy ) {
		this.X = this.lastSize.X + dx;	this.Y = this.lastSize.Y + dy;
	}
	
	moveBy(dx, dy) {
		dx = parseInt(dx);	dy = parseInt(dy);
		this.X += dx;	this.Y += dy;
		this.requiredRefresh();
	}




	alignSuper(option, destX = null, destY = null) {
		var bbox = this.getBoundingBox();
		var dy = 0, dx = 0;

		if( Number.isInteger( destX ) ) {
			if( ( option & Align.HLeft ) || ( option & Align.HRightOut ) )
				dx = destX - bbox.x;
			else if( option & Align.HCenter )
				dx = destX - bbox.x - parseInt(bbox.w/2);
			else if( ( option & Align.HRight ) || ( option & Align.HLeftOut ) )
				dx = destX - bbox.x - parseInt(bbox.w);
		}

		if( Number.isInteger( destY ) ) {
			if( ( option & Align.VTop ) || ( option & Align.VBottomOut ) )
				dy = destY - bbox.y;
			else if( option & Align.VMiddle )
				dy = destY - bbox.y - parseInt(bbox.h/2);
			else if( ( option & Align.VBottom ) || ( option & Align.VTopOut ) )
				dy = destY - bbox.y - parseInt(bbox.h);
		}

		this.moveBy(dx, dy);
	}




	generateCode(className = "tft", oneColor = 0) {
		return "";
	}

	generateCodeUpdater(className = "tft", oneColor = 0) {
		return "";
	}

}



function drawBoundingBox(ctx, x, y, w, h) {
	if(typeof y === "undefined") {
		bbox = x;
		x = bbox.x;	y = bbox.y;	w = bbox.w;	h = bbox.h;
	}

	x = parseInt(x) * scaleK - 1;	y = parseInt(y) * scaleK - 1;
	w = parseInt(w) * scaleK + 2;	h = parseInt(h) * scaleK + 2;
	ctx.beginPath();
	ctx.rect(x, y, w, h);
	ctx.stroke();
}

function drawModifier(ctx, x, y) {
	x = parseFloat(x);	y = parseFloat(y);
	var r = 1.3 * scaleK;
	x = parseFloat(x) * scaleK - r;	y = parseFloat(y) * scaleK - r;
	ctx.beginPath();
	ctx.fillRect( x, y, 2*r, 2*r );
	ctx.stroke();
}


