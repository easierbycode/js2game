
globalThis.debug = true;

// var SAT = require('Engine/SAT');
import "Engine/SAT.js";
// dofile("Engine/filesystem.js");
// dofile("Engine/obj_types.js");
// dofile("Engine/anim.js");
// dofile("Engine/world.js");
import "Engine/world.js";

// Font.ftInit();
var pixeloid = new Font("Font/PixeloidMono-1G8ae.ttf");
var pixeloid_small = new Font("Font/PixeloidMono-1G8ae.ttf");

globalThis.pixeloid = pixeloid;
globalThis.pixeloid_small = pixeloid_small;

// Font.SetPixelSize(pixeloid_small, 20.0, 20.0);
pixeloid_small.scale = 0.5;

var oldpad = Pads.get();
var pad = Pads.get();

globalThis.oldpad = oldpad;
globalThis.pad = pad;

const start = 0;
const loading = 1;
const running = 2;
const level_ed = 3;
const options_st = 4;
const paused = 5;

globalThis.game_state = start;

globalThis.loading = loading;
globalThis.running = running;
globalThis.level_ed = level_ed;
globalThis.options_st = options_st;

// globalThis.game_state = game_state;

var fps = 0;

var ram;
globalThis.ram = ram;

// dofile("Game/loading.js")
import { loadGame } from "Game/loading.js";
// dofile("Game/thegame.js");
import { theGame } from "Game/thegame.js";
// dofile("Game/startmenu.js");
import { startMenu } from "Game/startmenu.js";
// dofile("Game/leveleditor.js");
import { levelEditor } from "Game/leveleditor.js";

var font_size = {width:20.0, height:20.0}; 

Screen.setVSync(true);
var vsync_state = false;

globalThis.timer = Timer.new();

while(true){
    Screen.clear(Color.new(36, 36, 36));

    oldpad = pad;
    pad = Pads.get();

    if(pad.pressed(Pads.SELECT) && !oldpad.pressed(Pads.SELECT)){
        if(debug){
            debug = false;
        } else {
            debug = true;
        };
    };

    switch(game_state){
        case start:
            if(font_size.width != 40.0 || font_size.height != 40.0){
                // Font.ftSetPixelSize(pixeloid, 40.0, 40.0);
                pixeloid.scale = 2.0;
                font_size.width = 40.0;
                font_size.height = 40.0;
            };
            startMenu();
            break;
        case loading:
            if(font_size.width != 40.0 || font_size.height != 40.0){
                // Font.ftSetPixelSize(pixeloid, 40.0, 40.0);
                pixeloid.scale = 2.0;
                font_size.width = 40.0;
                font_size.height = 40.0;
            };
            loadGame();
            break;
        case running:
            if(font_size.width != 20.0 || font_size.height != 20.0){
                // Font.ftSetPixelSize(pixeloid, 20.0, 20.0);
                pixeloid.scale = 1.0;
                font_size.width = 20.0;
                font_size.height = 20.0;
            };
            theGame();
            break;
        case options_st:
            break;
        case level_ed:
            if(font_size.width != 40.0 || font_size.height != 40.0){
                // Font.ftSetPixelSize(pixeloid, 40.0, 40.0);
                pixeloid.scale = 2.0;
                font_size.width = 40.0;
                font_size.height = 40.0;
            };
            levelEditor();
            break;
        case paused:
            break;
        default:
            break;
    };

    if(pad.pressed(Pads.R2) && !oldpad.pressed(Pads.R2)){
        Timer.reset(timer);
    };

    fps = Screen.getFPS(240);
    
    if(debug){
        pixeloid_small.print(15.0, 15.0, "Free RAM:" + Math.ceil(ram/1024) + "KB - " + fps + "FPS - " + Timer.getTime(timer)/2000 + " Time", Color.new(128,128,128));
    };

    /*if(fps > 30 && !vsync_state){
        Screen.setVSync(true);
        vsync_state = true;
    } else if (vsync_state){
        Screen.setVSync(false);
        vsync_state = false;
    };*/
    Screen.flip();
    
    
}