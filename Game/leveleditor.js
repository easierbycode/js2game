
import { MapTile, Vector2 } from "Engine/obj_types.js";
import { writeJSON } from "Engine/filesystem.js";

var level = [];


function newMapTile(texture, grid){
    var slot = new MapTile(texture, new Vector2(grid.x*tile_size, grid.y*tile_size), new Vector2(grid.x, grid.y));
    level.push(slot);
    logTile("placed tile " + texture + " at grid (" + grid.x + "," + grid.y + ")");
}

var square_x = 0;
var square_y = 0;
var tile_ed_size = 10.0;
var cur_sprite = 0;

var tileLogPrefix = "[LevelEditor]";
var loggedTileMessages = Object.create(null);

function logTile(message){
    console.log(tileLogPrefix + " " + message);
}

function logTileOnce(key, message){
    if(loggedTileMessages[key]){
        return;
    }
    loggedTileMessages[key] = true;
    logTile(message);
}

function isImageReady(image, identifier){
    if(!image){
        return false;
    }

    if(typeof image.ready === "function"){
        try{
            var state = image.ready();
            if(state === false){
                if(identifier){
                    logTileOnce("imgPending:" + identifier, "waiting for image to load: " + identifier);
                }
                return false;
            }
        }catch(e){
            if(identifier){
                logTileOnce("imgReadyErr:" + identifier, "image.ready() failed for " + identifier + ": " + (e && e.message? e.message : String(e)));
            }
        }
    }

    return true;
}

function drawImageScaled(image, x, y, width, height, identifier){
    if(!image){
        return false;
    }

    try{
        var originalWidth = image.width;
        var originalHeight = image.height;

        if(typeof width === "number"){
            image.width = width;
        }
        if(typeof height === "number"){
            image.height = height;
        }

        image.draw(x, y);

        if(typeof originalWidth === "number"){
            image.width = originalWidth;
        }
        if(typeof originalHeight === "number"){
            image.height = originalHeight;
        }

        return true;
    }catch(e){
        if(identifier){
            logTileOnce("drawErr:" + identifier, "failed to draw image " + identifier + ": " + (e && e.message? e.message : String(e)));
        }
        return false;
    }
}

function normaliseTileName(name){
    if(typeof name !== "string"){
        return null;
    }

    if(name === "." || name === ".."){
        return null;
    }

    if(name.slice(-1) === "/"){
        return null;
    }

    var lower = name.toLowerCase();
    if(lower.slice(-4) !== ".png"){
        return null;
    }

    var parts = name.split(/[\\/]/);
    var finalName = parts[parts.length - 1];
    if(!finalName){
        return null;
    }

    return finalName;
}

function collectTileEntries(entry, target, depth){
    if(entry === null || entry === undefined || depth > 4){
        return;
    }

    if(typeof entry === "string"){
        var norm = normaliseTileName(entry);
        if(norm && target.indexOf(norm) === -1){
            target.push(norm);
        }
        return;
    }

    if(typeof entry !== "object"){
        return;
    }

    if(typeof entry.name === "string"){
        var direct = normaliseTileName(entry.name);
        if(direct && target.indexOf(direct) === -1){
            target.push(direct);
        }
    }

    if(Array.isArray(entry)){
        for(var i = 0; i < entry.length; i++){
            collectTileEntries(entry[i], target, depth + 1);
        }
        return;
    }

    for(var key in entry){
        if(key === "name"){
            continue;
        }
        if(entry.hasOwnProperty ? entry.hasOwnProperty(key) : true){
            collectTileEntries(entry[key], target, depth + 1);
        }
    }
}

function loadTileFilenames(path){
    var results = [];

    function fromSource(label, entries){
        collectTileEntries(entries, results, 0);
        logTileOnce("dir:" + label, "read " + path + " via " + label + " -> " + results.length + " png(s)");
    }

    if(typeof os !== "undefined" && os && typeof os.readdir === "function"){
        try{
            fromSource("os.readdir", os.readdir(path));
        }catch(e){
            logTileOnce("dirErr:os", "os.readdir failed for " + path + ": " + (e && e.message? e.message : String(e)));
        }
    }

    if(results.length === 0 && typeof System !== "undefined" && typeof System.listDirectory === "function"){
        try{
            fromSource("System.listDirectory", System.listDirectory(path));
        }catch(e){
            logTileOnce("dirErr:sys", "System.listDirectory failed for " + path + ": " + (e && e.message? e.message : String(e)));
        }
    }

    if(results.length === 0){
        logTileOnce("noTiles:" + path, "No PNG tiles found under " + path);
    }

    return results;
}

const tile_dir = "Map/Tiles";
var framelist = loadTileFilenames(tile_dir);

framelist.sort(function(a, b){
    var a_match = a.match(/(\d+)/);
    var b_match = b.match(/(\d+)/);

    if(a_match && b_match){
        return parseInt(a_match[1], 10) - parseInt(b_match[1], 10);
    }

    return a.localeCompare(b);
});

var tilelist = [];
var tilepaths = [];

function loadTileImage(path, index){
    try{
        var img = new Image(path);
        if(img && typeof img.width === "number" && typeof img.height === "number"){
            logTileOnce("imgDim:" + path, "Loaded " + path + " (" + img.width + "x" + img.height + ")");
        } else {
            logTileOnce("imgLoad:" + path, "Loaded " + path);
        }
        return img;
    }catch(e){
        logTileOnce("imgErr:" + path, "Failed to load tile " + path + ": " + (e && e.message? e.message : String(e)));
        return null;
    }
}

// Load each of the sorted files as an image
for (var i = 0; i < framelist.length; i++) {
    var path = tile_dir + "/" + framelist[i];
    tilepaths.push(path);
    tilelist.push(loadTileImage(path, i));
};

// Ensure at least one placeholder entry so UI code has something to reference
if(tilepaths.length === 0){
    tilepaths.push("");
    tilelist.push(null);
}

cur_sprite = Math.min(cur_sprite, Math.max(0, tilelist.length - 1));

logTileOnce("summary", "found " + framelist.length + " tile image(s) under " + tile_dir);

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
        var selectedPath = tilepaths[cur_sprite];
        if(selectedPath){
            newMapTile(selectedPath, new Vector2(square_x, square_y));
        }else{
            logTileOnce("emptySelect", "tried to place tile with empty texture path (index " + cur_sprite + ")");
        }
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
        pixeloid_small.print(460.0, 135.0, "Cursor: " + square_x + "," + square_y, Color.new(96,96,96));
        pixeloid_small.print(460.0, 165.0, "Tiles: " + level.length, Color.new(96,96,96));
        if(tilepaths[cur_sprite]){
            var label = tilepaths[cur_sprite].split("/").pop();
            pixeloid_small.print(460.0, 195.0, "Sprite: " + label, Color.new(64,64,64));
        }

        // Guard the preview draw in case tilelist[cur_sprite] is missing
        try{
            var previewImage = tilelist[cur_sprite];
            var previewKey = tilepaths[cur_sprite] || ("index:" + cur_sprite);
            Draw.rect(470.0, 250.0, 150.0, 150.0, Color.new(64,64,64));
            if(previewImage && isImageReady(previewImage, "preview:" + previewKey)){
                drawImageScaled(previewImage, 470.0, 250.0, 150.0, 150.0, "preview:" + previewKey);
            } else if(!previewImage){
                logTileOnce("missingPreview:" + previewKey, "preview missing image for " + previewKey + ", drawing placeholder");
            }
        }catch(e){
            // If Draw or Image throws, draw a simple box to avoid native crashes
            Draw.rect(470.0, 250.0, 150.0, 150.0, Color.new(64,64,64));
        }

        // Draw all of the tiles that have been placed so far
        for (var i = 0; i < level.length; i++) {
            var tile = level[i];
            var tex_path = tile.tex;
            var image = null;

            // Find the pre-loaded image that corresponds to the tile's texture path
            if(tex_path){
                var tex_idx = tilepaths.indexOf(tex_path);
                if(tex_idx !== -1){
                    image = tilelist[tex_idx];
                }
            } else {
                logTileOnce("missingPath:" + i, "tile #" + i + " missing texture path");
            }

            // Draw the tile's sprite, or a green square if the sprite is missing
            try{
                var base_x = tile.tile.x*tile_ed_size;
                var base_y = tile.tile.y*tile_ed_size;
                Draw.rect(base_x, base_y, tile_ed_size, tile_ed_size, Color.new(0,255,0));
                if(image && isImageReady(image, tex_path || ("tileIndex:" + i))){
                    drawImageScaled(image, base_x, base_y, tile_ed_size, tile_ed_size, tex_path || ("tileIndex:" + i));
                } else if(image){
                    logTileOnce("notReady:" + (tex_path || i), "tile image not ready yet for " + (tex_path || ("index:" + i)));
                } else {
                    logTileOnce("missingImage:" + (tex_path || i), "missing tile image for " + (tex_path || ("index:" + i)));
                }
            }catch(e){
                // If the Draw call throws, render a fallback square to avoid crashing
                Draw.rect(tile.tile.x*tile_ed_size, tile.tile.y*tile_ed_size, tile_ed_size, tile_ed_size, Color.new(255,255,0));
            }
        };

        // Draw the currently selected tile at the cursor's position
        try{
            var cursor_img = tilelist[cur_sprite];
            var cursorKey = tilepaths[cur_sprite] || ("cursor:" + cur_sprite);
            var cursor_x = square_x*tile_ed_size;
            var cursor_y = square_y*tile_ed_size;
            Draw.rect(cursor_x, cursor_y, tile_ed_size, tile_ed_size, Color.new(255,0,0));
            if(cursor_img && isImageReady(cursor_img, "cursor:" + cursorKey)){
                drawImageScaled(cursor_img, cursor_x, cursor_y, tile_ed_size, tile_ed_size, "cursor:" + cursorKey);
            } else if(!cursor_img){
                logTileOnce("missingCursor:" + cursorKey, "cursor using placeholder for " + cursorKey);
            }
        }catch(e){
            // If the Draw call throws, render a fallback square to avoid crashing
            Draw.rect(square_x*tile_ed_size, square_y*tile_ed_size, tile_ed_size, tile_ed_size, Color.new(255,255,0));
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
