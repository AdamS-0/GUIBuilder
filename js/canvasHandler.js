function getSelectedControls() {
	var scr = null;
	if( topInfo != null ) {
		if( topInfo.screen != null ) scr = topInfo.screen;
	}

	if(scr == null) scr = screens[selectedScreen];
	return scr.Controls.filter( ctrl => ctrl.Selected );
}

shiftPressed = false;
function setShiftKeyPressed(state) {
	shiftPressed = state;
}

var KEY_LEFT 	= 37;
var KEY_UP 		= 38;
var KEY_RIGHT 	= 39;
var KEY_DOWN 	= 40;
var KEY_DEL	 	= 46;
var KEY_C 		= 67;
var KEY_V 		= 86;

function UI_onkeydown(ev) {
	setShiftKeyPressed(ev.shiftKey);
	var selectedControls = getSelectedControls();
	
	if( selectedControls.length > 0 ) {
		key = ev.keyCode;
		if( key >= KEY_LEFT && key <= KEY_DOWN ) {
			var dx = 0 + -1*(key == KEY_LEFT) + (key == KEY_RIGHT);
			var dy = 0 + -1*(key == KEY_UP) + (key == KEY_DOWN);

			if( ev.ctrlKey ) {
				dx *= 10;
				dy *= 10;
			}

			selectedControls.forEach( ctrl => { if(ctrl.Selected) ctrl.moveBy(dx, dy); } );
		} else if ( key == KEY_DEL ) {
			deleteSelectedControls();
		} else if ( (key == KEY_C) && (ev.ctrlKey) ) {
			copyControl();
		}
	}
	
	if ( (ev.keyCode == KEY_V) && (ev.ctrlKey) ) {
		pasteControl();
	}
}



function UI_onkeyup(ev) {
	shiftPressed = ev.shiftKey;
}








function getTopControl(screen, cursorX, cursorY) {	
	for( var i = screen.Controls.length - 1; i >= 0; i-- ) {
		if( screen.Controls[i].checkCursorOver(cursorX, cursorY) ) {
			showProps( screen, screen.Controls[i] );
			return screen.Controls[i];
		}
	}

	return null;
}


var mouseMoving = false;
var mouseLast = {x: 0, y: 0};
var topInfo;

function getScreenControlTop(e) {
	var cvs = document.getElementById("canvas");
	var cvsRect = cvs.getBoundingClientRect();
	px = Math.floor( ( e.pageX - cvsRect.left ) / scaleK );
	py = Math.floor( ( e.pageY - cvsRect.top ) / scaleK );
	
	var scr = screens[selectedScreen];
	var ctrl = getTopControl(scr, px, py);

	return {screen: scr, control: ctrl, cursor: {X: px, Y: py}};
}


var deltaMove = {x: 0, y:0};
function canvasDown(e) {
	e = e || window.event;
	if( selectedScreen < 0 || selectedScreen >= screens.length ) return;

	deltaMove = {x: 0, y: 0};
	topInfo = getScreenControlTop(e);
	if( topInfo.screen != null ) {

		if(topInfo.control != null) {
			if( !topInfo.control.Selected ) {
				if( !shiftPressed ) {
					topInfo.screen.Controls.forEach(control => { control.Selected = false; });
				}
				topInfo.control.Selected = true;
				selectedControl = topInfo.control;
			} else if(shiftPressed) topInfo.control.Selected = false;
		} else topInfo.screen.Controls.forEach(control => { control.Selected = false; });
		
		

		refreshCurrentScreen();
		showProps(topInfo.screen, topInfo.control);
	}

	if( topInfo.control != null ) {
		var selectedControls = getSelectedControls();
		selectedControls.forEach(ctrl => { ctrl.saveLastSize(); } );
		if(topInfo.control.Selected) mouseMoving = true;
	}
}


function canvasUp(e) {
	e.preventDefault();
	if( selectedScreen < 0 || selectedScreen >= screens.length ) return;
	mouseMoving = false;

	if(deltaMove.x == 0 && deltaMove.y == 0) { // without movement
		refreshCurrentScreen();
	}

	showProps(topInfo.screen, topInfo.control);
}


var lastCursorPos = {X:0, Y:0};
function getLastCursorPos() {
	return structuredClone(lastCursorPos);
}

function canvasMouseMove(mouseEvent) {
	var cvs = document.getElementById("canvas");
	var cvsRect = cvs.getBoundingClientRect();

	var px2 = Math.floor( ( mouseEvent.pageX - cvsRect.left ) / scaleK );
	var py2 = Math.floor( ( mouseEvent.pageY - cvsRect.top ) / scaleK );
	
	lastCursorPos.X = px2;
	lastCursorPos.Y = py2;

	if(!mouseMoving) return;
	
	var dx = parseInt(px2) - topInfo.cursor.X;
	var dy = parseInt(py2) - topInfo.cursor.Y;
	deltaMove = {dx, dy};

	var selectedControls = getSelectedControls();

	if( selectedControls.length == 1 ) topInfo.control.tryCursorModify( parseInt(dx), parseInt(dy) );
	else if( selectedControls.length > 1 )
		selectedControls.forEach( ctrl => { ctrl.tryCursorMove(parseInt(dx), parseInt(dy)); } );
	
	refreshCurrentScreen();
}


