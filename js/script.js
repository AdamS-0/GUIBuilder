
const controlsLst = [ "Bitmap", "Circle", "Gauge", "Label", "Line", "Menu", "ProgressBar", "Rectangle", "Triangle", "Graph" ];

var selectedControl = null;
var screens = new Array();
var selectedScreen = 0;
var scaleK = 2.0;





function onload() {
    addNewScreen("");
    loadToolBox();
    loadScreensList();
    showTabEditor();
}

function loadToolBox() {
    var p = document.getElementById("panelToolbox");
    
    for( var i = 0; i < controlsLst.length; i++ ) {
        var item = document.createElement("listViewItem");
        item.innerHTML = controlsLst[i];
        item.name = controlsLst[i];
        item.draggable = "true";
        item.ondragstart = drag;
        p.appendChild(item);
    }
}

function test1(){console.log("123");}

function loadScreensList() {
    var p = document.getElementById("treeScreens");
    p.innerHTML = "";
    
    for( var i = 0; i < screens.length; i++ ) {
        var item = document.createElement("screenItem" + ( selectedScreen == i ? "Selected" : ""));
        
        item.name = screens[i].Name;
        item.onmousedown = screenItemClick;
        //item.ondblclick = screenItemDoubleClick;
        item.oncontextmenu = contextMenuTreeScreens;
        
        var collapseBtn = document.createElement("flatBtn");
        collapseBtn.innerHTML = "[" + (screens[i].showControlsAtList ? "\\/" : "/\\") + "]";
        collapseBtn.name = "collapseBtn_" + screens[i].Name;
        collapseBtn.scrName = item.name;
        collapseBtn.onclick = screnCollapseBtnClick;
        item.appendChild(collapseBtn);
        
        item.innerHTML = item.innerHTML + " " + screens[i].Name + ( selectedScreen == i ? " <- Selected" : "");
        
        p.appendChild(item);
        
        if( screens[i].showControlsAtList ) {
            for(j = 0; j < screens[i].Controls.length; j++) {
                var c = document.createElement("controlItem");
                var cName = screens[i].Controls[j].Name;
                c.innerHTML = cName + " : " + screens[i].Controls[j].constructor.name;
                c.name = cName;
                c.scrName = item.name;
                c.onclick = controlItemClick;
                c.oncontextmenu = contextMenuTreeControls;
                p.appendChild(c);
            }
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
    if        ( type == "Label"     ) { c = new Label       ("", x, y); }
    else if ( type == "Line"        ) { c = new Line        ("", x, y); }
    else if ( type == "Rectangle"   ) { c = new Rectangle   ("", x, y); }
    else if ( type == "Circle"      ) { c = new Circle      ("", x, y); }
    else if ( type == "ProgressBar" ) { c = new ProgressBar ("", x, y); }
    else if ( type == "Bitmap"      ) { c = new Bitmap      ("", x, y); }
    else if ( type == "Gauge"       ) { c = new Gauge       ("", x, y); }
    else if ( type == "Triangle"    ) { c = new Triangle    ("", x, y); }
    else if ( type == "Menu"        ) { c = new Menu        ("", x, y); }
    else if ( type == "Graph"       ) { c = new Graph       ("", x, y); }
    else                              { c = new Control     ("", x, y); }
    return c;
}

// [ "Label", "Line", "HLine", "VLine", "Rectangle", "Shape" ];
function addNewControl(name, x, y, refresh = 1) {
    if( selectedScreen < 0 ) addNewScreen();

    var c = createControlByType(name, x, y);
    c.ParentScreen = screens[selectedScreen];
    
    screens[selectedScreen].Controls.push( c );
    
    if(refresh) loadScreensList();
    return c;
}



function deleteControl(scr, cntrl, _showProps = 1) {
    if (scr == null) return;
    
    cntrlId = scr.Controls.indexOf(cntrl);
    if( cntrlId < 0 ) return;
    scr.Controls.splice(cntrlId, 1); // 2nd parameter means remove one item only
    if( _showProps ) {
        loadScreensList();
        selectedScreenChanged();
        showProps(scr);
    }
    cntrl = null;
}

function deleteSelectedControls() {
    var selectedControls = getSelectedControls();
    for( var i = 0; i < selectedControls.length; i++ )
        deleteControl( selectedControls[i].ParentScreen, selectedControls[i], false );
    
    loadScreensList();
    selectedScreenChanged();
    showProps();
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


function duplicateScreen() {
    if (selectedScreen < 0 || selectedScreen >= screens.length) return;
    
    var scrNew = createScreenByCopy( screens[selectedScreen] );
    while( screens.findIndex( s => s.Name == scrNew.Name ) >= 0 ) scrNew.Name += "1";

    screens.push( scrNew );
    loadScreensList();
    selectedScreen = screens.length - 1;
    selectedScreenChanged();
}


function collapseScreen() {
    if (selectedScreen < 0 || selectedScreen >= screens.length) return;
    
    scr = screens[selectedScreen];
    scr.showControlsAtList = !scr.showControlsAtList;
    //selectedScreen = screens.indexOf(scr);
    loadScreensList();
    // showProps(scr);
    // selectedControl = null;
}


function selectedScreenChanged() {
    refreshCurrentScreen();
}

function refreshCurrentScreen() {
    var cmbBx = document.getElementById("scale");
    scaleK = cmbBx.value;
    if( selectedScreen < 0 || selectedScreen >= screens.length ) return;
    
    var cvsDest = document.getElementById("canvas");
    var cvs = document.createElement("canvas");
    cvs.width = screens[selectedScreen].Width;
    cvs.height = screens[selectedScreen].Height;
    var ctx = cvs.getContext("2d");
    ctx.lineWidth = 0.5;
    startDrawing(cvs, ctx);
    screens[selectedScreen].updateRGBcolor();
    screens[selectedScreen].refresh(cvs, ctx);
    stopDrawing(ctx);

    cvsDest.width = screens[selectedScreen].Width * scaleK;
    cvsDest.height = screens[selectedScreen].Height * scaleK;
    var ctxDest = cvsDest.getContext("2d");

    ctxDest.webkitImageSmoothingEnabled = false;
    ctxDest.mozImageSmoothingEnabled = false;
    ctxDest.imageSmoothingEnabled = false;

    ctxDest.drawImage(cvs, 0, 0, cvs.width, cvs.height, 0, 0, cvsDest.width, cvsDest.height);

    var chkBxShowBBoxes = document.getElementById("showBoundingBoxes");
    if(chkBxShowBBoxes.checked) {
        ctxDest.lineWidth = "1";
        ctxDest.strokeStyle = "red";
        ctxDest.fillStyle = "red";
        screens[selectedScreen].drawBounding(ctxDest);
    }
}



function getMiddlePanels() {
    var _pEditor = document.getElementById("pEditor");
    var _pCode = document.getElementById("pCode");
    var _pResources = document.getElementById("pResources");
    
    var _btnEditor = document.getElementById("btnTabEditor");
    var _btnCode = document.getElementById("btnTabCode");
    var _btnResources = document.getElementById("btnTabResources");

    var LPanels = { Editor: _pEditor , Code: _pCode, Resources: _pResources };
    var LBtns = { Editor: _btnEditor, Code : _btnCode, Resources: _btnResources };

    var ListPanels = [ _pEditor ,  _pCode, _pResources ];
    var ListBtns = [ _btnEditor, _btnCode, _btnResources ];

    return {List: {Panels: ListPanels, Buttons: ListBtns}, Panels: LPanels, Buttons: LBtns};
}

function hidePanels(panelsBtns) {
    panelsBtns.List.Panels.forEach(elPanel => { elPanel.style.display = "none"; });
    panelsBtns.List.Buttons.forEach(elBtn => { elBtn.style.background = "inherit"; });
}

function showTabPanel(tabBtn, panel) {
    tabBtn.style.background = "#ddd";
    panel.style.display = "inline-block";
}

function showTabEditor() {
    var panelsBtns = getMiddlePanels();
    hidePanels(panelsBtns);
    showTabPanel(panelsBtns.Buttons.Editor, panelsBtns.Panels.Editor);
}


function showTabCode() {
    var panelsBtns = getMiddlePanels();
    hidePanels(panelsBtns);
    showTabPanel(panelsBtns.Buttons.Code, panelsBtns.Panels.Code);
}


function showTabResources() {
    var panelsBtns = getMiddlePanels();
    hidePanels(panelsBtns);
    showTabPanel(panelsBtns.Buttons.Resources, panelsBtns.Panels.Resources);

    showResources();
}






function bringControlToFront() {
    if( selectedScreen < 0 || selectedScreen >= screens.length ) return;
    if( selectedControl ) {
        var cntrlId = screens[selectedScreen].Controls.indexOf(selectedControl);
        if( cntrlId < 0 ) return;
        screens[selectedScreen].Controls.splice(cntrlId, 1);
        screens[selectedScreen].Controls.push(selectedControl);
    }

    loadScreensList();
}


function sendControlToBack() {
    if( selectedScreen < 0 || selectedScreen >= screens.length ) return;
    if( selectedControl ) {
        var cntrlId = screens[selectedScreen].Controls.indexOf(selectedControl);
        if( cntrlId < 0 ) return;
        screens[selectedScreen].Controls.splice(cntrlId, 1);
        screens[selectedScreen].Controls.unshift(selectedControl);
    }

    loadScreensList();
}

function getCursorPositionFromEvent(event) {
    return {x: event.pageX, y: event.pageY};
}




var controls2copy = new Array();
function copyControl() {
    controls2copy = [];
    controls2copy = getSelectedControls();
}


function pasteControl() {
    
    if( controls2copy.length <= 0 ) return;

    if( selectedScreen < 0 ) addNewScreen();

    var controlsToSelect = new Array();
    for( var i = 0; i < controls2copy.length; i++ ) {
        var control2copy = controls2copy[i];
        var c = createControlByType(control2copy["Type"]);
        c.ParentScreen = screens[selectedScreen];
        screens[selectedScreen].Controls.push( c );

        for( var key in control2copy ) {
            if( key != "ParentScreen" && key != "Name" && key != "FunctionName" ) c[key] = control2copy[key];
        }

        c.tryCursorMove(10, 10);
        c.Name = control2copy.Name + "1";
        controlsToSelect.push(c);
    }

    controls2copy.forEach( ctrl => ctrl.Selected = false );
    controlsToSelect.forEach( ctrl => ctrl.Selected = true );
    loadScreensList();
}

