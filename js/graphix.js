
var cX = 0;	var cY = 0;
var fontWidthBase = 6;	var fontHeightBase = 8;
var fontWidth = 6;	var fontHeight = 8;
var fontSize = 1;

function setCursor(x, y) { cX = parseInt( x ); cY = parseInt( y ); }
function setFontSize(fSize) { fontSize = parseInt( fSize ); }


function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}


function fillPlaces(value, places) {
    while( value.length < places ) value = "0" + value;
    return value;
}

function value2hex(value, places = 2, base = 2) {
    var hex = parseInt(value, base).toString(16);
	hex = fillPlaces( hex, places );
	return "0x" + hex;
}

function componentToHex(c, places = 2) {
	var hex = c.toString(16);
	while( hex.length < places ) hex = "0" + hex;
	return hex;
}

function rgbToHex(r, g, b) { return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b); }
function RGB2565(color) { return ( ((color.r & 0xF8) << 8) | ((color.g & 0xFC) << 3) | (color.b >> 3) ); }
function RGB2binaryColor(color) { return ( parseInt(color.g) + parseInt(color.g) + parseInt(color.b))/3 > 127 ? 1 : 0; }



var image;
var bmp;

function startDrawing(cvs, ctx) {
	image = ctx.createImageData(cvs.width, cvs.height);
	bmp = image.data;
	for( var i = 3; i < bmp.length; i += 4)
		bmp[i] = 255;
}

function stopDrawing(ctx) {
	ctx.putImageData(image, 0, 0);
}

function setPixel(x, y, color) {
	if( x < 0 || x >= image.width || y < 0 || y >= image.height ) return;
	var index = 4 * (parseInt(image.width) * parseInt(y) + parseInt(x));
	bmp[index + 0] = color.r;
	bmp[index + 1] = color.g;
	bmp[index + 2] = color.b;
}

function drawHLine(x0, y0, len, color) {
	for( var x = x0; x < parseInt(x0) + parseInt(len); x++ ) setPixel( x, y0, color );
}

function drawVLine(x0, y0, len, color) {
	for( var y = y0; y < parseInt(y0) + parseInt(len); y++ ) setPixel( x0, y, color );
}


function drawLine(x0, y0, x1, y1, color) {
    x0 = parseInt(x0);  y0 = parseInt(y0);
    x1 = parseInt(x1);  y1 = parseInt(y1);
	if(x0 == x1)		drawVLine(x0, Math.min(y0, y1), Math.abs( y1 - y0 ) + 1, color);
    else if(y0 == y1)	drawHLine(Math.min(x0, x1), y0, Math.abs( x1 - x0 ) + 1, color);
    else {
        printLine(parseInt(x0), parseInt(y0), parseInt(x1), parseInt(y1), color);
    }
}

function printLine( x0, y0, x1, y1, color) {
	x0 = parseInt(x0);	x1 = parseInt(x1);
	y0 = parseInt(y0);	y1 = parseInt(y1);
	
    var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
    
	if (steep) {
        i = x0; x0 = y0; y0 = i;
        i = x1; x1 = y1; y1 = i;
    }
	
    if (x0 > x1) {
        i = x0; x0 = x1; x1 = i;
        i = y0; y0 = y1; y1 = i;
    }
	
    dx = x1 - x0;
    dy = Math.abs(y1 - y0);
	
    err = parseInt(dx / 2);
    var ystep = y0 < y1 ? 1 : -1;
	

    for (; x0<=x1; x0++) {
        if (steep) setPixel(y0, x0, color);
        else setPixel(x0, y0, color);
        
        err -= dy;
        if (err < 0) {
            y0 += ystep;
            err += dx;
        }
    }
}








function drawRect( x, y, w, h, color) {
    drawHLine(x, y, w, color);
	drawHLine(x, parseInt(y) + parseInt(h) - 1, w, color);
	drawVLine(x, y, h, color);
	drawVLine(parseInt(x) + parseInt(w) - 1, y, h, color);
}

function fillRect( x, y, w, h, color) {
    for ( i = x; i < parseInt(x) + parseInt(w); i++)	drawVLine(i, y, h, color);
}








function drawCircle(x0, y0, r, color) {
    x0 = parseInt(x0);	y0 = parseInt(y0);	r = parseInt(r);
	
	var f = 1 - r;
    var ddF_x = 1;
    var ddF_y = -2 * r;
    var x = 0;
    var y = r;

    setPixel(x0  , y0 + r, color);
    setPixel(x0  , y0 - r, color);
    setPixel(x0 + r, y0  , color);
    setPixel(x0 - r, y0  , color);

    while ( x < y ) {
        if (f >= 0) {
            y--;
            ddF_y += 2;
            f += ddF_y;
        }
        x++;
        ddF_x += 2;
        f += ddF_x;

        setPixel(x0 + x, y0 + y, color);
        setPixel(x0 - x, y0 + y, color);
        setPixel(x0 + x, y0 - y, color);
        setPixel(x0 - x, y0 - y, color);
        setPixel(x0 + y, y0 + x, color);
        setPixel(x0 - y, y0 + x, color);
        setPixel(x0 + y, y0 - x, color);
        setPixel(x0 - y, y0 - x, color);
    }
}


function fillCircle(x0, y0, r,color) {
	x0 = parseInt(x0);	y0 = parseInt(y0);	r = parseInt(r);
    drawVLine(x0, y0-r, 2*r+1, color);
    fillCircleHelper(x0, y0, r, 3, 0, color);
}


function drawCircleHelper(x0, y0, r, cornername, color) {
	x0 = parseInt(x0);	y0 = parseInt(y0);	r = parseInt(r);
    var f     = 1 - r;
    var ddF_x = 1;
    var ddF_y = -2 * r;
    var x     = 0;
    var y     = r;

    while ( x < y ) {
        if (f >= 0) {
            y--;
            ddF_y += 2;
            f     += ddF_y;
        }
        x++;
        ddF_x += 2;
        f     += ddF_x;
        if (cornername & 0x4) {
            setPixel(x0 + x, y0 + y, color);
            setPixel(x0 + y, y0 + x, color);
        }
        if (cornername & 0x2) {
            setPixel(x0 + x, y0 - y, color);
            setPixel(x0 + y, y0 - x, color);
        }
        if (cornername & 0x8) {
            setPixel(x0 - y, y0 + x, color);
            setPixel(x0 - x, y0 + y, color);
        }
        if (cornername & 0x1) {
            setPixel(x0 - y, y0 - x, color);
            setPixel(x0 - x, y0 - y, color);
        }
    }
}

function fillCircleHelper(x0, y0, r, corners, delta, color) {
	x0 = parseInt(x0);	y0 = parseInt(y0);	r = parseInt(r);
	corners = parseInt(corners);	delta = parseInt(delta);
    
	var f     = 1 - r;
    var ddF_x = 1;
    var ddF_y = -2 * r;
    var x     = 0;
    var y     = r;
    var px    = x;
    var py    = y;

    delta++; // Avoid some +1's in the loop

    while(x < y) {
        if (f >= 0) {
            y--;
            ddF_y += 2;
            f     += ddF_y;
        }
        x++;
        ddF_x += 2;
        f     += ddF_x;
        // These checks avoid double-drawing certain lines, important
        // for the SSD1306 library which has an INVERT drawing mode.
        if(x < (y + 1)) {
            if(corners & 1) drawVLine(x0+x, y0-y, 2*y+delta, color);
            if(corners & 2) drawVLine(x0-x, y0-y, 2*y+delta, color);
        }
        if(y != py) {
            if(corners & 1) drawVLine(x0+py, y0-px, 2*px+delta, color);
            if(corners & 2) drawVLine(x0-py, y0-px, 2*px+delta, color);
            py = y;
        }
        px = x;
    }
}




function drawRoundRect(x, y, w, h, r, color) {
	x = parseInt(x);	y = parseInt(y);	w = parseInt(w);	h = parseInt(h);	r = parseInt(r);
    var max_radius = parseInt( ((w < h) ? w : h) / 2 ); // 1/2 minor axis
    if(r > max_radius) r = max_radius;
    // smarter version
    
    drawHLine(x+r  , y    , w-2*r, color); // Top
    drawHLine(x+r  , y+h-1, w-2*r, color); // Bottom
    drawVLine(x    , y+r  , h-2*r, color); // Left
    drawVLine(x+w-1, y+r  , h-2*r, color); // Right
    // draw four corners
    drawCircleHelper(x+r    , y+r    , r, 1, color);
    drawCircleHelper(x+w-r-1, y+r    , r, 2, color);
    drawCircleHelper(x+w-r-1, y+h-r-1, r, 4, color);
    drawCircleHelper(x+r    , y+h-r-1, r, 8, color);
}

function fillRoundRect(x, y, w, h, r, color) {
	x = parseInt(x);	y = parseInt(y);	w = parseInt(w);	h = parseInt(h);	r = parseInt(r);
    var max_radius = parseInt( ((w < h) ? w : h) / 2); // 1/2 minor axis
    if(r > max_radius) r = max_radius;
    // smarter version
	
    fillRect(x+r, y, w-2*r, h, color);
    // draw four corners
    fillCircleHelper(x+w-r-1, y+r, r, 1, h-2*r-1, color);
    fillCircleHelper(x+r    , y+r, r, 2, h-2*r-1, color);
}


function writeChar(c, colorOn, colorOff) {
	if( c == '\n' ) {
		cx = 0;
		cy += fontWidth * fontSize;
		return;
	}

	if( typeof c == "string" ) c = parseInt(c.charCodeAt());
	
	var i = 0; var j = 0;
	var id = c * 6;
	
	var cr = 0;
	
	for( i = 0; i < 6; i++ ) {
		cr = font[id];
		for( j = 0; j < 8; j++ ) {
			//setPixel( cx + i, cy + j, cr & 1 ? colorOn : colorOff );
			fillRect(cX + i * fontSize, cY + j * fontSize, fontSize, fontSize, cr & 1 ? colorOn : colorOff);
			cr = cr >> 1;
		}
		
		id++;
	}
	cX += fontSize * fontWidth;
}


function printString(str, colorOn, colorOff ) {
	for( var i = 0; i < str.length; i++) {
		var c = str[i];
		if( c == '\\' ) {
			if( str[i + 1] == 'x' ) {
				c = parseInt( str[i + 2] + str[i + 3], 16 );
				i += 2;
			}
			i++;
		}
		writeChar(c, colorOn, colorOff);
	}
}





function drawRGBBitmap(x, y, bitmap, w, h) {
    for(var j = 0; j < h; j++) {
        for(var i = 0; i < w; i++) {
            setPixel( parseInt(x + i), parseInt(y + j), bitmap.getPixel(i, j));
            
        }
    }
}

function drawBitmap(x, y, bitmap, w, h, color) {
    for(var j = 0; j < h; j++) {
        for(var i = 0; i < w; i++) {
            if(bitmap.getPixel(i, j) == 1) setPixel( parseInt(x + i), parseInt(y + j), color);
        }
    }
}



