class Screen{
	showControlsAtList = 1;
	Controls = new Array();
	Name = "";
	Width = 128;
	Height = 64;
	Color = "#000000";
	OneColor = 0;
	static screenNum = 0;
	
	constructor(name = "", width = 128, height = 64) {
		if ( name.length == 0 ) name = "screen" + Screen.screenNum++;
		
		this.Name = name;
		this.Width = width;
		this.Height = height;
		
	}
	
	showProperties(panel, tab) {
		panel.innerHTML = "";
		createRow(this, tab, "text", "Name", this.Name);
		createRow(this, tab, "color", "Color", this.Color);
		createRow(this, tab, "number", "Width", this.Width);
		createRow(this, tab, "number", "Height", this.Height);
		createRow(this, tab, "checkbox", "OneColor", this.OneColor);
		panel.appendChild(tab);
		
		return tab;
	}
	
	
	updateRGBcolor() {
		this.ColorRGBA = hexToRgb( this.Color );
		fillRect(0, 0, this.Width, this.Height, this.ColorRGBA);
		for( var i = 0; i < this.Controls.length; i++ ) this.Controls[i].updateRGBcolor();
	}
	
	
	refresh(cvs, ctx) {
		ctx.imageSmoothingEnabled = false;
		cvs.style.width = scaleK*this.Width + "px";
		cvs.style.Height = scaleK*this.Height + "px";
		cvs.width = this.Width;	cvs.height = this.Height;
		ctx.fillStyle = this.Color;
		ctx.fillRect( 0, 0, cvs.width, cvs.height );
		
		for( var i = 0; i < this.Controls.length; i++ )
			this.Controls[i].draw(ctx);
	}

	drawBounding(ctx) {
		for( var i = 0; i < this.Controls.length; i++ ) {
			if(this.Controls[i].Selected) this.Controls[i].drawBounding(ctx);
		}
	}
	
	requiredRefresh() {
		loadScreensList();
	}
	
	generateCode(className = "tft") {
		this.updateRGBcolor();
		var strCode = "";

		for( var i = 0; i < this.Controls.length; i++ ) {
			if( this.Controls[i].GotUpdater ) {
				strCode += "\n// call this function to refresh control: " + this.Controls[i].Name + "\n";
				strCode += this.Controls[i].generateCodeUpdater(className, this.OneColor);
			}
		}

		strCode += "\n// call this function to refresh whole screen\n";
		strCode += "void load_" + this.Name + "() {\n";
		
		var colorBg = "0";
		
		if( this.OneColor )	colorBg = RGB2binaryColor(this.ColorRGBA);
		else 				colorBg = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
		
		strCode += "\t" + className + ".fillRect(0, 0, " + this.Width + ", " + this.Height + ", " + colorBg + ");\n";
		for( var i = 0; i < this.Controls.length; i++ ) {
			strCode += this.Controls[i].generateCode(className, this.OneColor);
		}
		
		strCode += "}\n";
		
		return strCode;
	}
	
}