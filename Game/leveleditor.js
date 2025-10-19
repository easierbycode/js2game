
import { MapTile, Vector2 } from "Engine/obj_types.js";
import { writeJSON } from "Engine/filesystem.js";

var level = [];


function newMapTile(texture, grid){
    var slot = new MapTile(texture, new Vector2(grid.x*tile_size, grid.y*tile_size), new Vector2(grid.x, grid.y));
    level.push(slot);
}

var square_x = 0;
var square_y = 0;
var tile_ed_size = 10.0;
var cur_sprite = 0;

var framelist = [];
try{
    framelist = os.readdir("Map/Tiles") || [];
}catch(e){
    framelist = [];
}
var tilelist = [];
var tilepaths = [];

for (var i = 0; i < framelist.length; i++) {
    var path = "Map/Tiles" + "/" + "Tile_" + (i+1) + ".png";
    try{
        tilelist[i] = new Image(path);
    }catch(e){
        tilelist[i] = null;
    }
    tilepaths[i] = path;
};

// Ensure at least one placeholder entry so UI code has something to reference
if(tilepaths.length === 0){
    tilepaths.push("");
    tilelist.push(null);
}

function updateLevelEditorPads(){
    var pad = Pads.get();
    if(pad.justPressed(Pads.LEFT) && (square_x*tile_ed_size) > 0.0){
        square_x--;
    };

    if(pad.justPressed(Pads.RIGHT) && (square_x*tile_ed_size) < (450.0-tile_ed_size)){
        square_x++;
    };

    if(pad.justPressed(Pads.UP) && (square_y*tile_ed_size) > 0.0){
        square_y--;
    };

    if(pad.justPressed(Pads.DOWN) && (square_y*tile_ed_size) < (448.0-tile_ed_size)){
        square_y++;
    };

    if(pad.justPressed(Pads.L1) && cur_sprite > 0){
        cur_sprite--;
    };

    var maxSprite = Math.max(0, tilelist.length - 1);
    if(pad.justPressed(Pads.R1) && cur_sprite < maxSprite){
        cur_sprite++;
    };

    // clamp just in case
    if(cur_sprite < 0) cur_sprite = 0;
    if(cur_sprite > maxSprite) cur_sprite = maxSprite;

    if(pad.justPressed(Pads.CROSS)){
        // store the file path (string) rather than the Image object so JSON is serializable
        newMapTile(tilepaths[cur_sprite], new Vector2(square_x, square_y));
    };
}

function levelEditor_create(){
    var pad = Pads.get();

        updateLevelEditorPads();

        Draw.rect(450.0, 0.0, 190.0, 448.0, Color.new(0,0,0));

        pixeloid_small.print(460.0,  15.0, "X - Add tile", Color.new(128,128,128));
        pixeloid_small.print(460.0,  45.0, "Triangle - Return", Color.new(128,128,128));
        pixeloid_small.print(460.0,  75.0, "D-Pad - Move", Color.new(128,128,128));
        pixeloid_small.print(460.0, 105.0, "R1/L1 - Change \nsprite", Color.new(128,128,128));

        // Guard the preview draw in case tilelist[cur_sprite] is missing
        try{
            if(tilelist[cur_sprite]){
                Draw.rect(470.0, 250.0, 150.0, 150.0, tilelist[cur_sprite]);
            } else {
                // draw a placeholder box
                Draw.rect(470.0, 250.0, 150.0, 150.0, Color.new(64,64,64));
            }
        }catch(e){
            // If Draw or Image throws, draw a simple box to avoid native crashes
            Draw.rect(470.0, 250.0, 150.0, 150.0, Color.new(64,64,64));
        }

        for (var i = 0; i < level.length; i++) {
            var tile = level[i];
            var tex_path = tile.tex;
            var image = null;
            if(tex_path){
                var tex_idx = tilepaths.indexOf(tex_path);
                if(tex_idx !== -1){
                    image = tilelist[tex_idx];
                }
            }

            if(image){
                Draw.rect(tile.tile.x*tile_ed_size, tile.tile.y*tile_ed_size, tile_ed_size, tile_ed_size, image);
            }else{
                Draw.rect(tile.tile.x*tile_ed_size, tile.tile.y*tile_ed_size, tile_ed_size, tile_ed_size, Color.new(0,255,0));
            }
        };

        var cursor_img = tilelist[cur_sprite];
        if(cursor_img){
            Draw.rect(square_x*tile_ed_size, square_y*tile_ed_size, tile_ed_size, tile_ed_size, cursor_img);
        } else {
            Draw.rect(square_x*tile_ed_size, square_y*tile_ed_size, tile_ed_size, tile_ed_size, Color.new(255,0,0));
        }

        if(pad.justPressed(Pads.START)){
            try{
                writeJSON("Levels/test.json", level);
                sw_leveled = idle;
            }catch(e){
                // show a small error on screen instead of freezing
                pixeloid_small.print(460.0, 200.0, "Save error: " + (e && e.message? e.message : String(e)), Color.new(255,0,0));
            }
        };
        
        if(pad.justPressed(Pads.TRIANGLE)){
            sw_leveled = idle;
        };

}

const idle = 0;
const create_level = 1;
const edit_level = 2;
const delete_level = 3;

var leveled_item = 1;

var sw_leveled = 0;

function levelEditor_idle(){
    var pad = Pads.get();

    if(pad.justPressed(Pads.UP)){
        leveled_item -= 1;
    };

    if(pad.justPressed(Pads.DOWN)){
        leveled_item += 1;
    };

    if(pad.justPressed(Pads.TRIANGLE)){
        game_state = start;
    };

    if(leveled_item > 3){
        leveled_item = 1;
    } else if ( leveled_item < 1){
        leveled_item = 3;
    }

    if(pad.justPressed(Pads.CROSS)){
        sw_leveled = leveled_item;
    };

    pixeloid.print(170.0, 150.0, "Create level", leveled_item == create_level? Color.new(128,128,128):Color.new(64,64,64));
    pixeloid.print(170.0, 220.0, "Edit level", leveled_item == edit_level? Color.new(128,128,128):Color.new(64,64,64));
    pixeloid.print(170.0, 290.0, "Delete level", leveled_item == delete_level? Color.new(128,128,128):Color.new(64,64,64));
  
}

export function levelEditor(){

    switch(sw_leveled){
        case create_level:
            levelEditor_create();
            break;
        case edit_level:
            break;
        case delete_level:
            break;
        default:
            levelEditor_idle();
            break;
    };
}
