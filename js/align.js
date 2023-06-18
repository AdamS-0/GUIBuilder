function selCtrlsSetAlign(option) {
	if( selectedControl == null ) return;

	var wasSelected = selectedControl.Selected;
	selectedControl.Selected = false;
	var bbox = selectedControl.getBoundingBox();
	var selectedControls = selectedControl.ParentScreen.Controls.filter( ctrl => ctrl.Selected );

	if( selectedControls.length == 0 ) {
		bbox = selectedControl.ParentScreen.getBoundingBox();
		selectedControl.Selected = true;
	}
	selectedControls = selectedControl.ParentScreen.Controls.filter( ctrl => ctrl.Selected );

	var destX = null, destY = null;
	
	if( ( option & Align.HLeft ) || ( option & Align.HLeftOut ) )
		destX = bbox.x;
	else if( option & Align.HCenter )
		destX = parseFloat(bbox.x) + parseFloat(bbox.w/2);
	else if( ( option & Align.HRight ) || ( option & Align.HRightOut ) )
		destX = parseFloat(bbox.x) + parseFloat(bbox.w);
	
	if( ( option & Align.VTop ) || ( option & Align.VTopOut ) )
		destY = bbox.y;
	else if( option & Align.VMiddle )
		destY = parseFloat(bbox.y) + parseFloat(bbox.h/2);
	else if( ( option & Align.VBottom ) || ( option & Align.VBottomOut ) )
		destY = parseFloat(bbox.y) + parseFloat(bbox.h);
	
	destX = parseInt( Math.round(destX) );	destY = parseInt( Math.round(destY) );
	selectedControls.forEach( ctrl => { ctrl.alignSuper(option, destX, destY) });
	selectedControl.Selected = wasSelected;
	refreshCurrentScreen();
}





const Align = {
	HLeftOut: 1,
	HLeft: 2,
	HCenter: 4,
	HRight: 8,
	HRightOut: 16,

	VTopOut: 32,
	VTop: 64,
	VMiddle: 128,
	VBottom: 256,
	VBottomOut: 512
}
