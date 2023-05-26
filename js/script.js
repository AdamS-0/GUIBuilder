
const controlsLst = [ "Label", "Line", "Rectangle", "Circle" ];

var selectedControl = null;
var screens = new Array();
var selectedScreen = 0;
var scaleK = 2.0;





function onload() {
	addNewScreen("");
	loadToolBox();
	loadScreensList();
}

function loadToolBox() {
	var p = document.getElementById("toolbox");
	
	for( var i = 0; i < controlsLst.length; i++ ) {
		var item = document.createElement("listViewItem");
		item.innerHTML = controlsLst[i];
		item.name = controlsLst[i];;
		item.draggable = "true";
		item.ondragstart = drag;
		p.appendChild(item);
	}
}


function loadScreensList() {
	var p = document.getElementById("treeScreens");
	p.innerHTML = "";
	
	for( var i = 0; i < screens.length; i++ ) {
		var item = document.createElement("screenItem" + ( selectedScreen == i ? "Selected" : ""));
		item.innerHTML = screens[i].Name + ( selectedScreen == i ? " <- Selected" : "");
		item.name = screens[i].Name;
		item.onclick = screenItemClick;
		p.appendChild(item);
		
		for(j = 0; j < screens[i].Controls.length; j++) {
			var c = document.createElement("controlItem");
			var cName = screens[i].Controls[j].Name;
			c.innerHTML = cName;
			c.name = cName;
			c.scrName = item.name;
			c.onclick = controlItemClick;
			p.appendChild(c);
		}
	}
	
	refreshCurrentScreen();
}


function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.name); }

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  
  e = ev || window.event;
  cvs = document.getElementById("canvas").getBoundingClientRect();
  px = Math.floor( ( ev.pageX - cvs.left ) / scaleK );
  py = Math.floor( ( ev.pageY - cvs.top ) / scaleK );
  
  addNewControl(data, px, py);
}



function createControlByType(type, x = 0, y = 0) {
	var c;
	if( type == "Label" ) c = new Label("", x, y);
	else if( type == "Line" ) c = new Line("", x, y);
	else if( type == "Rectangle" ) c = new Rectangle("", x, y);
	else if( type == "Circle" ) c = new Circle("", x, y);
	else c = new Control("", x, y);
	return c;
}


// [ "Label", "Line", "HLine", "VLine", "Rectangle", "Shape" ];
function addNewControl(name, x, y, refresh = 1) {
	var c = createControlByType(name, x, y);
	c.ParentScreen = screens[selectedScreen];
	
	screens[selectedScreen].Controls.push( c );
	
	if(refresh) loadScreensList();
	return c;
}

function deleteControl(scr, cntrl) {
	if (scr == null) return;
	
	cntrlId = scr.Controls.indexOf(cntrl);
	if( cntrlId < 0 ) return;
	scr.Controls.splice(cntrlId, 1); // 2nd parameter means remove one item only
	loadScreensList();
	selectedScreenChanged();
	cntrl = null;
	showProps(scr);
}




function addNewScreen( name = "" ) {
	screens.push( new Screen(name) );
	loadScreensList();
	selectedScreen = screens.length - 1;
	selectedScreenChanged();
}


function deleteScreen() {
	if (selectedScreen > -1) {
		screens.splice(selectedScreen, 1); // 2nd parameter means remove one item only
		selectedScreen--;
		loadScreensList();
		selectedScreenChanged();
	}
}



function selectedScreenChanged() {
	refreshCurrentScreen();
}

function refreshCurrentScreen() {
	var cmbBx = document.getElementById("scale");
	scaleK = cmbBx.value;
	if( selectedScreen < 0 || selectedScreen >= screens.length ) return;
	
	var cvs = document.getElementById("canvas");
	var ctx = cvs.getContext("2d");
	ctx.lineWidth = 0.5;
	startDrawing(cvs, ctx);
	screens[selectedScreen].updateRGBcolor();
	screens[selectedScreen].refresh(cvs, ctx);
	stopDrawing(ctx);
}



function UI_onkeydown(ev) {
	
	if( selectedControl ) {
		key = ev.keyCode;
		if( ev.keyCode >= 37 && ev.keyCode <= 40 ) {
			var dx = 0 + -1*(key == 37) + (key == 39);
			var dy = 0 + -1*(key == 38) + (key == 40);
			selectedControl.moveBy(dx, dy);
			
		}
	}
}



function canvasDown(e) {
	e = e || window.event;
	var cvs = document.getElementById("canvas");
	var cvsRect = cvs.getBoundingClientRect();
	px = Math.floor( ( e.pageX - cvsRect.left ) / scaleK );
	py = Math.floor( ( e.pageY - cvsRect.top ) / scaleK );
	
	if( selectedScreen < 0 || selectedScreen >= screens.length ) return;
	
	var scr = screens[selectedScreen];
	var ctrl = null;
	
	var gotTopControl = false;
	for( var i = scr.Controls.length - 1; i >= 0 && gotTopControl == false; i-- ) {
		if( gotTopControl = scr.Controls[i].checkCursorOver(px, py) ) {
			showProps( scr, scr.Controls[i] );
			ctrl = scr.Controls[i];
		}
	}
	
	if( !gotTopControl ) {
		showProps(scr);
		selectedControl = null;
	} else {
		var baseX = parseInt(ctrl.X);	var baseY = parseInt(ctrl.Y);
		cvs.onmousemove = function(me) {
			var px2 = Math.floor( ( me.pageX - cvsRect.left ) / scaleK );
			var py2 = Math.floor( ( me.pageY - cvsRect.top ) / scaleK );
			var dx = parseInt(px2) - parseInt(px);	var dy = parseInt(py2) - parseInt(py);

			ctrl.tryCursorModify( parseInt(dx), parseInt(dy) );
			refreshCurrentScreen();
		};
		
		cvs.onmouseup = function() {
			cvs.onmousemove = null;
			cvs.onmouseup = null;
			showProps(scr, ctrl);
		};
		
		selectedControl = ctrl;
	}
}






function generateCode() {
	var strCode = "";
	var className = document.getElementById("className").value;
	for( var i = 0; i < screens.length; i++ ) {
		strCode += screens[i].generateCode(className);
	}
	
	downloadContent(strCode, "project.c");
}



