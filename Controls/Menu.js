class Menu extends Control {
	Type            = "Menu";
	Text            = "Menu";
    TextSize        = 1;
    
    Elements        = "";
    ElementSize     = 1;
    ElemsToShow     = 1;
    RowSpacing      = 2;
    
    SelectedId     = 0;
    
    ShowSelector    = 1; // 1
    Selector        = ">";
    SelectSize      = 2;
    
    LineNum         = 0; // 2
    LineNumSel      = 0; // 4
    
    FontWidth       = 6; // For default 6x8 char, height = 6    
    FontHeight      = 8; // For default 6x8 char, height = 8
	Background      = "#000000";
	BackgroundRGBA  = {r:0, g:0, b:0, a:255};
    
    static cnum = 0;
	constructor(name, x = 0, y = 0, text = "", textSize = 1) {
        if( text.length == 0) text = "menu" + Menu.cnum++;
		if( name.length == 0) name = text;
		super(name, x, y);
        this.Text = text;
		this.TextSize = textSize;
        super.GotUpdater = true;
	}
	
	forceParser() {
		super.forceParser();
		this.TextSize       = parseInt(this.TextSize);
        
		this.ElementSize    = parseInt(this.ElementSize);
		this.ElemsToShow    = parseInt(this.ElemsToShow);
		this.RowSpacing     = parseInt(this.RowSpacing);
		
        
        ///
        var _elements = this.Elements.split('\n');
        var NoElement = _elements.length;
        if( NoElement > 0 ) { if(_elements[0] == '') { NoElement = 0; } }
        
        this.SelectedId    = parseInt(this.SelectedId);
        if( this.SelectedId >= NoElement) {
            this.SelectedId = NoElement - 1;
        }
        
        this.ShowSelector   = parseInt(this.ShowSelector);
        if(this.Selector.length > 1) {
            this.Selector   = this.SelectedId.charAt(0);
        }
        this.SelectSize     = parseInt(this.SelectSize);
        
        this.LineNum = parseInt(this.LineNum);
        this.LineNumSel     = parseInt(this.LineNumSel);
        
        this.FontWidth      = parseInt(this.FontWidth);
        this.FontHeight     = parseInt(this.FontHeight);
        
	}

	showProperties(panel, tab) {
		this.setAutoFunctionName();
		this.TextSize = parseInt(this.TextSize);
		tab = super.showProperties(panel, tab);
		
		createRow(this, tab, "color", "Background", this.Background);
		createRow(this, tab, "text", "Text", this.Text);
        createRow(this, tab, "number", "TextSize", this.TextSize);
		
        createRow(this, tab, "textarea", "Elements", this.Elements);
        createRow(this, tab, "number", "ElementSize", this.ElementSize);
        createRow(this, tab, "number", "ElemsToShow", this.ElemsToShow);
        createRow(this, tab, "number", "RowSpacing", this.RowSpacing);
        
        createRow(this, tab, "number", "SelectedId", this.SelectedId);
        createRow(this, tab, "checkbox", "ShowSelector", this.ShowSelector);
        createRow(this, tab, "text", "Selector", this.Selector);
        createRow(this, tab, "number", "SelectSize", this.SelectSize);
        
        createRow(this, tab, "checkbox", "LineNum", this.LineNum);
        createRow(this, tab, "checkbox", "LineNumSel", this.LineNumSel);
        
		createRow(this, tab, "number", "FontHeight", this.FontHeight);
        createRow(this, tab, "number", "FontWidth", this.FontWidth);
        
        //createRow(this, tab, "checkbox", "GotUpdater", this.GotUpdater);
		createRow(this, tab, "text", "FunctionName", this.FunctionName);
        
    
		return tab;
	}
	
	updateRGBcolor() {
		super.updateRGBcolor();
		this.BackgroundRGBA = hexToRgb( this.Background );
	}
	
	draw(ctx) {
		this.forceParser();
		//setFontSize(this.TextSize);
		//setCursor(this.X, this.Y);
		//printString(this.Text, this.ColorRGBA, this.BackgroundRGBA);
        
        //Menu.draw( _selector('>'), _x(0), _y(0), _dY(0), elemens2Show(5),
        //          state(SHOW_NUM_LINE | SHOW_NUM_LINE_SELECT)[
        //            HIDE_SELECTOR, SHOW_BIG_SELECT, SHOW_NUM_LINE, SHOW_NUM_LINE_SELECT
        //          ] )
        //void Menu::draw( char _selector, int _x, int _y, int _dY,
        //  int8_t elemens2Show, uint8_t state )
        //{

        
        var _elements = this.Elements.split('\n');
        var NoElement = _elements.length;
        
        if( NoElement > 0 ) { if(_elements[0] == '') { NoElement = 0; } }
        
        var _x = this.X;
        var _y = this.Y;
        
        var minId = 0;
        var maxId = NoElement;
        minId = Math.max( this.SelectedId - parseInt(this.ElemsToShow/2), 0 );
        maxId = Math.min( minId + this.ElemsToShow, NoElement );
        minId = Math.min( minId, maxId - this.ElemsToShow );
        minId = minId < 0 ? 0 : minId;
                
        if( this.Text.length > 0 ) {
            setFontSize( this.TextSize );
            setCursor( _x, _y );
            printString( this.Text, this.ColorRGBA, this.BackgroundRGBA);
            
            _y += this.RowSpacing + this.TextSize * this.FontHeight;
        }
        
        var isCurId = 0;
        var lineNum = 0;
        
        for(let i = minId; i < maxId; i++) {
            isCurId = i == this.SelectedId;
            
            /* Set position */
            setCursor( _x, _y );
            
            /* Set font */
            if( isCurId )   { setFontSize( this.SelectSize ); }
            else            { setFontSize( this.ElementSize ); }
            
            /* Show selector or space */
            if( this.Selector.length != 0 && this.ShowSelector ) {
                printString( isCurId ? this.Selector : " ", this.ColorRGBA, this.BackgroundRGBA);
            }
            
            /* Show line number */
            if( this.LineNum  ) {
                if( !isCurId || this.LineNumSel ) {
                    lineNum = i + 1;
                    printString( lineNum + " ", this.ColorRGBA, this.BackgroundRGBA);
                }
            }
            
            
            /* Print element */
            printString(_elements[i], this.ColorRGBA, this.BackgroundRGBA);
            
            if( isCurId ) {
                _y += this.RowSpacing + this.SelectSize * this.FontHeight;
            } else {
                _y += this.RowSpacing + this.ElementSize * this.FontHeight;
            }
        }
            
        //}
        
	}

	getBoundingBox() {
		this.forceParser();
		var x = this.X, y = this.Y;
		//var txt = this.Text;
        
        var _elements = this.Elements.split('\n');
        var NoElement = _elements.length;
        var maxElementLength = 0; // [px]
        
        var h = 0;
        var w = 0;
        var el = "";
        var elWidth = 0; // [px]
        
        
        /* Calculate max height */
        if(this.Text.length > 0) { h = this.FontHeight * this.TextSize; }
        
        if(this.ElemsToShow > 0) {
            h += this.ElemsToShow * this.RowSpacing;
            
            h += this.FontHeight * (this.ElemsToShow - 1) * this.ElementSize;
            
            h += this.FontHeight * this.SelectSize;
        }
        
        /* Calculate max width */
        maxElementLength = this.FontWidth * this.Text.length * this.TextSize;
        
        for(let i = 0; i < _elements.length; i++) {
            el = _elements[i];
            if(el.length == 0) { continue; }
            el = el.replace(/\\x[0-9a-fA-F][0-9a-fA-F]/g, ' ');
            elWidth = this.FontWidth * (el.length + (this.LineNumSel ? 2 : 0) + this.ShowSelector) * this.SelectSize;
            
            maxElementLength = Math.max( maxElementLength, elWidth );
        }
        
		w = maxElementLength;
        
		return {x, y, w, h};
	}
	
	drawBounding(ctx) {
		this.forceParser();
		drawBoundingBox(ctx, this.getBoundingBox());
	}
	
	saveLastSize() {
		this.forceParser();
		this.lastSize = { X: Number(this.X), Y: Number(this.Y) };
	}

	checkCursorOver(x, y) {
		this.saveLastSize();
        var boundBox = this.getBoundingBox();
		return isBetween(x, this.X, parseInt(this.X) + boundBox.w)
			&& isBetween(y, this.Y, parseInt(this.Y) + boundBox.h);
	}
	

	
	generateCode(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		this.forceParser();
		var strCode = "";
		
		var colorF = "1";	var colorBg = "0";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
			colorBg = RGB2binaryColor(this.BackgroundRGBA);
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
			colorBg = "0x" + componentToHex( RGB2565( this.BackgroundRGBA ), 4);
		}
        
        ////
        //#define MENU_SHOW_SELECTOR      1
        //#define MENU_SHOW_LINE_NUM      2
        //#define MENU_SHOW_LINE_NUM_SEL  4

        //#define DSP_setCursor   display.setCursor
        //#define DSP_setTextSize display.setTextSize
        //#define DSP_print       display.print
        
        var _elements = this.Elements.split('\n');
        var NoElement = _elements.length;
        
        var flags = "";
        if(this.ShowSelector) { flags += "MENU_SHOW_SELECTOR"; } // 1
        if(this.LineNum     ) { flags += " | MENU_SHOW_LINE_NUM"; } // 2
        if(this.LineNumSel  ) { flags += " | MENU_SHOW_LINE_NUM_SEL"; }// 4
        
        var parentName = this.ParentScreen.Name;
        var DEF_ID = parentName + "_" + this.Name;
        var DEF_ID_UP = DEF_ID.toUpperCase();
        var elemNo = DEF_ID_UP + "_ELEM_NUM";
        strCode += "";
        
        strCode += "\tdrawMenu(\n";
        strCode += "\t\t/* char     **ppMenu        */ " + DEF_ID + ",\n";
        strCode += "\t\t/* uint16_t x, uint16_t y   */ " + this.X + ", " + this.Y + ",\n";
        strCode += "\t\t/* char     *pMenuName,     */ \"" + this.Text + "\",\n";
        strCode += "\t\t/* uint8_t  nameSize,       */ " + this.TextSize + ",\n";
        strCode += "\t\t/* uint16_t menuNameColor,  */ " + colorF + ",\n";
        strCode += "\t\t/* uint8_t  rowSpacing,     */ " + this.RowSpacing + ",\n";
        strCode += "\t\t/* uint8_t  NoElement,      */ " + elemNo + ",\n";
        strCode += "\t\t/* uint8_t  elementsToShow, */ " + this.ElemsToShow + ",\n";
        strCode += "\t\t/* uint8_t  elementSize,    */ " + this.ElementSize + ",\n";
        strCode += "\t\t/* char     selector,       */ '" + this.Selector + "',\n";
        strCode += "\t\t/* uint8_t  selectSize,     */ " + this.SelectSize + ",\n";
        strCode += "\t\t/* uint8_t  selectedId,     */ " + this.Name + "_id" + ",\n";
        strCode += "\t\t/* uint8_t  fontWidth       */ " + this.FontWidth + ",\n";
        strCode += "\t\t/* uint8_t  fontHeight      */ " + this.FontHeight + ",\n";
        strCode += "\t\t/* uint8_t  flags           */ " + flags + "\n\t);\n";
        
		//strCode += codeSetTextColor(className, colorF, colorBg);
		//strCode += codeSetTextSize(className, this.TextSize);
		//strCode += codeSetCursor(className, this.X, this.Y);
		//strCode += codePrint(className, "\"" + this.Text + "\"");
		
		return strCode;
	}

	generateCodeUpdater(className = "tft", oneColor = 0) {
		this.updateRGBcolor();
		this.forceParser();
		this.setAutoFunctionName();
		var strCode = "";
        var i = 0;
        var _elements = this.Elements.split('\n');
        var NoElement = _elements.length;
        var parentName = this.ParentScreen.Name;
        var DEF_ID = parentName + "_" + this.Name;
        var DEF_ID_UP = DEF_ID.toUpperCase();
        
        ////
        strCode += "#define " + DEF_ID_UP + "_ELEM_NUM " + NoElement + "\n";
        for(i = 0; i < NoElement; i++) {
            strCode += "#define " + DEF_ID_UP + "_STR" + i + "_LEN " + (_elements[i].length + 1) + "\n";
        }
        strCode += "\n";
        for(i = 0; i < NoElement; i++) {
            strCode += "static char " + DEF_ID + "_str" + i + "[" + DEF_ID_UP + "_STR" + i + "_LEN] = \"" + _elements[i] + "\";\n";
        }

        strCode += "\nstatic char *" + DEF_ID + "[" + DEF_ID_UP + "_ELEM_NUM" + "] = {\n";
        for(i = 0; i < NoElement; i++) {
            strCode += "\t" + DEF_ID + "_str" + i + ",\n";
        }
        strCode += "};\n";
        ////
        
        
		/*
		var colorF = "1";	var colorBg = "0";
		
		if( oneColor ) {
			colorF = RGB2binaryColor(this.ColorRGBA);
			colorBg = RGB2binaryColor(this.BackgroundRGBA);
		} else {
			colorF = "0x" + componentToHex( RGB2565( this.ColorRGBA ), 4 );
			colorBg = "0x" + componentToHex( RGB2565( this.BackgroundRGBA ), 4);
		}

		strCode += "void " + this.FunctionName + "(String msg) {\n";

		strCode += codeSetTextColor(className, colorF, colorBg);
		strCode += codeSetTextSize(className, this.TextSize);
		strCode += codeSetCursor(className, this.X, this.Y);
		strCode += codePrint(className, "msg");

		strCode += "}\n";
        */
		return strCode;
	}
    
    static generateFunctionToDraw(className = "tft") {
        var strCode = "";
        ////
        strCode  = "#define MENU_SHOW_SELECTOR      1\n";
        strCode += "#define MENU_SHOW_LINE_NUM      2\n";
        strCode += "#define MENU_SHOW_LINE_NUM_SEL  4\n\n";
        strCode += "#define DSP_setCursor   " + className + ".setCursor\n";
        strCode += "#define DSP_setTextSize " + className + ".setTextSize\n";
        strCode += "#define DSP_print       " + className + ".print\n\n";

        strCode += "void drawMenu(\n";
        strCode += "    char        **ppMenu,\n";
        strCode += "    uint16_t    x,\n";
        strCode += "    uint16_t    y,\n";
        strCode += "    char        *pMenuName,\n";
        strCode += "    uint8_t     nameSize,\n";
        strCode += "    uint16_t    nameColor,\n";
        strCode += "    uint8_t     rowSpacing,\n";
        strCode += "    uint8_t     NoElement,\n";
        strCode += "    uint8_t     elementsToShow,\n";
        strCode += "    uint8_t     elementSize,\n";
        strCode += "    char        selector,\n";
        strCode += "    uint8_t     selectSize,\n";
        strCode += "    uint8_t     selectedId,\n";
        strCode += "    uint8_t     fontWidth,\n";
        strCode += "    uint8_t     fontHeight,\n";
        strCode += "    uint8_t     flags)\n";
        strCode += "{\n";
        strCode += "    int8_t  minId   = 0;\n";  
        strCode += "    int8_t  maxId   = NoElement;\n";
        strCode += "    uint8_t isCurId = 0;\n"; 
        strCode += "    uint8_t lineNum = 0;\n"; 
        strCode += "    uint8_t i       = 0;\n\n"; 
    
        strCode += "    minId = max( selectedId - (elementsToShow/2), 0 );\n"; 
        strCode += "    maxId = min( minId + elementsToShow, NoElement );\n";
        strCode += "    minId = min( minId, maxId - elementsToShow );\n"; 
        strCode += "    minId = minId < 0 ? 0 : minId;\n\n"; 
        strCode += "    if(pMenuName != NULL) {\n";
        strCode += "        if( strlen(pMenuName) > 0 ) {\n";
        strCode += "            DSP_setTextSize( nameSize );\n";
        strCode += "            DSP_setCursor( x, y );\n";
        strCode += "            DSP_print( pMenuName );\n";
        strCode += "            y += rowSpacing + nameSize * fontHeight;\n";
        strCode += "        }\n";
        strCode += "    }\n\n";
        strCode += "    for(i = minId; i < maxId; i++) {\n";
        strCode += "        isCurId = i == selectedId;\n\n";
        strCode += "        /* Set position */\n";
        strCode += "        DSP_setCursor( x, y );\n\n";
        strCode += "        /* Set font */\n";
        strCode += "        DSP_setTextSize(isCurId ? selectSize : elementSize);\n\n";
        strCode += "        /* Show selector or space */\n";
        strCode += "        if( selector != 0 && (flags & MENU_SHOW_SELECTOR) ) {\n";
        strCode += "            DSP_print( isCurId ? (String)selector : \" \");\n";
        strCode += "        }\n\n";
        strCode += "        /* Show line number */\n";
        strCode += "        if( flags & MENU_SHOW_LINE_NUM  ) {\n";
        strCode += "            if( !isCurId || (flags & MENU_SHOW_LINE_NUM_SEL) ) {\n";
        strCode += "                lineNum = i + 1;\n";
        strCode += "                DSP_print( (String)lineNum + \" \" );\n";
        strCode += "            }\n";
        strCode += "        }\n\n";
        strCode += "        /* Print element */\n";
        strCode += "        if( ppMenu[i] != NULL ) { DSP_print(ppMenu[i]); }\n";
        strCode += "        /* Increment height */\n";
        strCode += "        if( isCurId )   { y += rowSpacing +  selectSize * fontHeight; }\n";
        strCode += "        else            { y += rowSpacing + elementSize * fontHeight; }\n";
        strCode += "    }\n";
        strCode += "}\n";
        ////
        return strCode;
    }
}

