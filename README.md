# GUIBuilder
This web tool provides user-friendly interface to design simple GUI for various displays in uC projects.
At this moment output code is compatible only with Adafruit GFX (for sure)! 

Application can be found here --> https://adams-0.github.io/GUIBuilder/.

How to start:
This tool contain three sections, from left to right: ToolBox, Editor, Tree/Properties.
ToolBox shows available Controls, which can be drag&drop on screen (Editor). 
Added controls can be selected from list on the right or directly by clicking them in the Editor. After that its properties should be shown in the right bottom corner.
Their location can be changed by these properties or by simply moving objects around.

Saving and opening projects:
Projects can be downloaded (Project > Save) as \*.guibldr file, which can be uploaded in Project > Open.

Preview scaling:
Scale is set in Settings > Scale, where 1 equals 100%.

Changing prefix of the display class:
Default prefix is set to tft, but can be changed in Settings > Display instance.

Generating C/C++ code:
Code can be generated at every step of GUI designing, by choosing option Generate > C/C++ Code.
Note: Make sure to enable checkbox for every Screen, which should be displayed on single color display (like SSD1306)!

## Changes
19 January 2025:
* Changed default Menu's parameters

18 January 2025:
* Added new control: Menu
* Feature: Screen collapsible under PPM in project tree
* Fixed left alignment  of 8 bit ASCII font

06 August 2023:
* Fixed displaying 8bit ASCII font
* Fixed Gauge refreshing

14 July 2023:
* Added new control: Gauge
* Added new control: Triangle - border mode only!
* Fixed Line drag modification

28 June 2023:
* Added two color models: RGB565 and one color for Bitmap
* Feature: Controls duplication available in context menu 

27 June 2023:
* Modified tab control
* Added Resources tab
* Feature: adding images to project in Resource tab
* Added new control: Bitmap

18 June 2023:
* Removed old robust alignment system
* Added universal alignment system
* Added outter horizontal and vertical alignment system

17 June 2023:
* Fixed UI
* Added context menus
* Added bounding boxes for selected controls
* Added multiple selection
* Added horizontal and vertical alignments
* Code generator update (C/C++)
* Bug fixed

27 May 2023:
* Added new Control: ProgressBar
* Added tab view for editor and code
* Feature: modification of position and size with cursor
* Bug fixed - UI

23 May 2023:
* New UI implemented
* Added basic Controls: Circle, Label, Line, Rectangle

