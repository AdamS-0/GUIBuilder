class Bitmap extends Control {
	Type = "Bitmap";
	Width = 10;
	Height = 10;
	Background = 0;
	Image = "";
	ColorModel = EnumColorModel.RGB565;

	BackColor = "#000000";
	BackColorRGBA = {r:0, g:0, b:0, a:255};

	static cnum = 0;
	constructor(name, x = 0, y = 0, background = 0) {
		if( name.length == 0) name = "bitmap" + Bitmap.cnum++;
		super(name, x, y);
		this.Background = background;
	}
	
	forceParser() {
		super.forceParser();
		var img = null;
		img = resources.find( r => r.Name == this.Image );
		if(img != null && img.Bmp != null) {
			this.Width = parseInt(img.Width);
			this.Height = parseInt(img.Height);
		}
	}

	showProperties(panel, tab) {
		var imgs = [ ""] ;
		imgs = imgs.concat( resources.filter(r => r.Type == ResourceType.Bitmap ).map(r => r.Name ) );
		tab = super.showProperties(panel, tab);
		createRow(this, tab, "checkbox", "Background", this.Background);
		if(this.Background) createRow(this, tab, "color", "BackColor", this.BackColor);
		createRow(this, tab, "combobox", "Image", this.Image, imgs );
		createRow(this, tab, "combobox", "ColorModel", this.ColorModel,  Object.values(EnumColorModel) );
		return tab;
	}

	updateRGBcolor() {
		super.updateRGBcolor();
		this.BackColorRGBA = hexToRgb( this.BackColor );

		if( this.ParentScreen.OneColor && this.ColorModel != EnumColorModel.OneColor )
			this.ColorModel = EnumColorModel.OneColor;
	}
	
	draw(ctx) {
		this.forceParser();
		var img = null;
		img = resources.find( r => r.Name == this.Image );

		if(this.Background)	fillRect(this.X, this.Y, this.Width, this.Height, this.BackColorRGBA);
		if( img != null && img.Bmp != null ) {
			if(this.ParentScreen.OneColor || this.ColorModel == EnumColorModel.OneColor)
					drawBitmap(this.X, this.Y, img.BmpBinary, img.Width, img.Height, this.ColorRGBA);
			else 	drawRGBBitmap(this.X, this.Y, img.Bmp, img.Width, img.Height);
		} else 		fillRect(this.X, this.Y, this.Width, this.Height, this.ColorRGBA);
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
	}
	
	saveLastSize() {
		this.forceParser();
		this.lastSize = { X: Number(this.X), Y: Number(this.Y), Width: Number(this.Width), Height: Number(this.Height) };
	}

	checkCursorOver(x, y) {
		this.saveLastSize();
		
		var tx = parseInt(this.X), ty = parseInt(this.Y), tw = parseInt(this.Width), th = parseInt(this.Height);
		
		if( isBetween(x, tx, tx + tw - 1) && isBetween(y, ty, ty + th - 1) ) return true;
		return false;
	}

	
	generateCode(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		this.forceParser();
		var strCode = "";
		
		var colorF = "1", colorBack = "0";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
			colorBack = RGB2binaryColor( this.BackColorRGBA );
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
			colorBack = "0x" + componentToHex( RGB2565( this.BackColorRGBA ), 4 );
		}

		var img = resources.find( r => r.Name == this.Image );
		if( img != null ) {
			if( oneColor || this.ColorModel == EnumColorModel.OneColor )
				strCode += codeDrawBitmap(className, this.X, this.Y, this.Image + "_bw", this.Width, this.Height, colorF );
			else
				strCode += codeDrawRGBBitmap(className, this.X, this.Y, this.Image + "_RGB565", this.Width, this.Height );
		}
		
		return strCode;
	}
}


const EnumColorModel = {
	RGB565: "RGB565",
	OneColor: "One color"
}
