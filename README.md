# GUIBuilder
This web tool provides user-friendly interface to design simple GUI for various displays in uC projects.
At this moment output code is compatible only with Adafruit GFX (for sure)! 

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
Note: Make sure to enable checkbox for every Screen, which should be displayed on one color display (like SSD1306)!

