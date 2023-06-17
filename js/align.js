function selCtrlsSetHor(option) {
	if( selectedControl == null ) return;

	var wasSelected = selectedControl.Selected;
	selectedControl.Selected = false;
	var bbox = selectedControl.getBoundingBox();
	var destX = 0;
	if( option == 'left' ) 			destX = bbox.x;
	else if( option == 'center' ) 	destX = parseFloat(bbox.x) + parseFloat(bbox.w/2);
	else if( option == 'right' )	destX = parseFloat(bbox.x) + parseFloat(bbox.w);
	
	var selectedControls = selectedControl.ParentScreen.Controls.filter( ctrl => ctrl.Selected );
	
	if( option == 'left' ) 			selectedControls.forEach( ctrl => { ctrl.alignLeft(destX) });
	else if( option == 'center' ) 	selectedControls.forEach( ctrl => { ctrl.alignCenter(destX) });
	else if( option == 'right' )	selectedControls.forEach( ctrl => { ctrl.alignRight(destX) });
	selectedControl.Selected = wasSelected;
	refreshCurrentScreen();
}

function selCtrlsSetVert(option) {
	if( selectedControl == null ) return;

	var wasSelected = selectedControl.Selected;
	selectedControl.Selected = false;
	var bbox = selectedControl.getBoundingBox();
	var destY = 0;
	if( option == 'top' ) 			destY = bbox.y;
	else if( option == 'middle' ) 	destY = parseFloat(bbox.y) + parseFloat(bbox.h/2);
	else if( option == 'bottom' )	destY = parseFloat(bbox.y) + parseFloat(bbox.h);
	
	var selectedControls = selectedControl.ParentScreen.Controls.filter( ctrl => ctrl.Selected );
	
	if( option == 'top' ) 			selectedControls.forEach( ctrl => { ctrl.alignTop(destY) });
	else if( option == 'middle' ) 	selectedControls.forEach( ctrl => { ctrl.alignMiddle(destY) });
	else if( option == 'bottom' )	selectedControls.forEach( ctrl => { ctrl.alignBottom(destY) });
	selectedControl.Selected = wasSelected;
	refreshCurrentScreen();
}


