class Graph extends Control {
    Type = "Graph";
    Width = 0;
    Height = 0;

    GridLinesX = 0;
    GridLinesY = 0;

    selectedEdgeH = 0;
    selectedEdgeV = 0;

    FillColor = "#FFFFFF";
    FillColorRGBA = {r:0, g:0, b:0, a:255};

	Background = "#000000";
	BackgroundRGBA = {r:0, g:0, b:0, a:255};

    static cnum = 0;
    constructor(name, x = 0, y = 0, width = 20, height = 10) {
        if( name.length == 0) name = "graph" + Graph.cnum++;
        super(name, x, y);
        this.Width = width;
        this.Height = height;
    }
    
    forceParser() {
        super.forceParser();
        this.Width = parseInt(this.Width);
        this.Height = parseInt(this.Height);
    }

    showProperties(panel, tab) {
        this.setAutoFunctionName();
        tab = super.showProperties(panel, tab);
		createRow(this, tab, "color", "Background", this.Background);
        createRow(this, tab, "number", "Width", this.Width);
        createRow(this, tab, "number", "Height", this.Height);
        createRow(this, tab, "number", "GridLinesX", this.GridLinesX);
        createRow(this, tab, "number", "GridLinesY", this.GridLinesY);
        createRow(this, tab, "checkbox", "GotUpdater", this.GotUpdater);
        createRow(this, tab, "text", "FunctionName", this.FunctionName);
        return tab;
    }

    updateRGBcolor() {
        super.updateRGBcolor();
        this.FillColorRGBA = hexToRgb( this.FillColor );
    }
    
    draw(ctx) {
        var xi = 0;
        var yi = 0;

        this.forceParser();
        xi = this.X + 1;
        yi = this.Y + this.Height - 2;
        drawLine(xi, yi, xi + this.Width - 2, yi, this.ColorRGBA);
        drawLine(xi, this.Y + 1, xi, yi, this.ColorRGBA);

        for( var idx = 0; idx < Number(this.GridLinesX); idx++ ) {
            xi = this.X + 1 + ((Number(this.Width) - 2) * idx) / (Number(this.GridLinesX) - 1); 
            yi = this.Y + this.Height - 1;
            drawLine(xi, yi, xi, yi - (2 + (idx % 2 == 0 ? 1 : 0 )), this.ColorRGBA);
        }

        for( var idy = 0; idy < Number(this.GridLinesY); idy++ ) {
            yi = this.Y + ((Number(this.Height) - 2) * idy) / (Number(this.GridLinesY) - 1); 
            xi = this.X;
            drawLine(xi, yi, xi + 2 + (idy % 2 == 0 ? 1 : 0 ), yi, this.ColorRGBA);
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
        this.selectedEdgeH = 0;    this.selectedEdgeV = 0;

        var tx = parseInt(this.X), ty = parseInt(this.Y), tw = parseInt(this.Width), th = parseInt(this.Height);
        if( !( isBetween(x, tx, tx + tw) && isBetween(y, ty, ty + th) ) ) return false;
        
        if( isBetween( x, tx - 1, tx + 1 ) )                    this.selectedEdgeH = 1;
        else if( isBetween( x, tx + tw - 1, tx + tw + 1 ) )        this.selectedEdgeH = 2;
        else  this.selectedEdgeH = 0;

        if( isBetween( y, ty - 1, ty + 1 ) )                 this.selectedEdgeV = 1;
        else if( isBetween( y, ty + th - 1, ty + th + 1 ) )    this.selectedEdgeV = 2;
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
        dx = parseInt(dx);    dy = parseInt(dy);

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
        
		strCode += "\tuint16_t idx = 0;\n";
		strCode += "\tuint16_t idy = 0;\n";
		strCode += "\tuint16_t xi = 0;\n";
		strCode += "\tuint16_t yi = 0;\n";
		strCode += "\tuint16_t x0 = " + this.X + ";\n";
		strCode += "\tuint16_t y0 = " + this.Y + ";\n";
		strCode += "\tuint16_t gridLinesX = " + this.GridLinesX + ";\n";
		strCode += "\tuint16_t gridLinesY = " + this.GridLinesY + ";\n";
		strCode += "\tuint16_t wid = " + this.Width + ";\n";
		strCode += "\tuint16_t hei = " + this.Height + ";\n";
		strCode += "\txi = x0 + 1;\n";
		strCode += "\tyi = y0 + hei - 2;\n";
    
		strCode += codeDrawLine(className, "xi", "yi", "xi + wid - 2", "yi", colorF);
		strCode += codeDrawLine(className, "xi", "y0 + 1", "xi", "yi", colorF);

    	strCode += "\tfor( idx = 0; idx < gridLinesX; idx++ ) {\n";
        strCode += "\t\txi = x0 + 1 + ((wid - 2) * idx) / (gridLinesX - 1); \n";
        strCode += "\t\tyi = y0 + hei - 1;\n";
		strCode += "\t" + codeDrawLine(className, "xi", "yi", "xi", "yi - (2 + (idx % 2 == 0 ? 1 : 0 ))", colorF);
    	strCode += "\t}\n";

    	strCode += "\tfor( idy = 0; idy < gridLinesY; idy++ ) {\n";
        strCode += "\t\tyi = y0 + ((hei - 2) * idy) / (gridLinesY - 1); \n";
        strCode += "\t\txi = x0;\n";
		strCode += "\t" + codeDrawLine(className, "xi", "yi", "xi + 2 + (idy % 2 == 0 ? 1 : 0 )", "yi", colorF);
    	strCode += "\t}\n";
        return strCode;
    }

    generateCodeUpdater(className = "tft", oneColor = 0) {
        this.updateRGBcolor();
        this.forceParser();
        this.setAutoFunctionName();
        var strCode = "";
        
        var colorF = "1";    var colorBg = "0";
        
        if( oneColor ) {
            colorF = RGB2binaryColor(this.ColorRGBA);
            colorBg = RGB2binaryColor(this.BackgroundRGBA);
        } else {
            colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
            colorBg = "0x" + componentToHex( RGB2565( this.BackgroundRGBA ), 4);
        }

        strCode += "void " + this.FunctionName + "(float tab[], uint16_t tabSize) {\n";

		strCode += "\tuint16_t xi = 0;\n";
		strCode += "\tuint16_t yi = 0;\n";
		strCode += "\tuint16_t xiPrev = 0;\n";
		strCode += "\tuint16_t yiPrev = 0;\n";
		strCode += "\tuint16_t idx = 0;\n";
			
		strCode += "\tuint16_t x0 = " + (Number(this.X) + 2) + ";\n";
		strCode += "\tuint16_t y0 = " + (Number(this.Y) + Number(this.Height) - 3) + ";\n";
		strCode += "\tuint16_t wid = " + (Number(this.Width) - 3) + ";\n";
		strCode += "\tuint16_t hei = " + (Number(this.Height) - 2) + ";\n";
		strCode += "\tfloat    fHei = (float)hei;\n";
    	strCode += "\tfloat    fWid = (float)wid;\n";
    
    	strCode += "\tif( tabSize == 0 ) { return; }\n";
        strCode += "\txi = x0 + (uint16_t)(fWid * 0) / (tabSize - 1);\n";
        strCode += "\tyi = y0 - (uint16_t)(fHei * tab[0]);\n";    
    	strCode += "\tfor( idx = 1; idx < tabSize; idx++ ) {\n";
        strCode += "\t\txiPrev = xi;\n";
        strCode += "\t\tyiPrev = yi;\n";
        strCode += "\t\txi = x0 + (uint16_t)(fWid * idx) / (tabSize - 1);\n";
        strCode += "\t\tyi = y0 - (uint16_t)(fHei * tab[idx]);\n";
		strCode += "\t" + codeDrawLine(className, "xiPrev", "yiPrev", "xi", "yi", colorF);
    	strCode += "\t}\n";

        strCode += "}\n";
        return strCode;
    }
}