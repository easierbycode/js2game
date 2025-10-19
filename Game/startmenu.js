
const start_game = 0;
const level_editor = 1;
const options = 2;

var menu_item = start_game;


export function startMenu(){

    var pad = Pads.get();

    if(pad.justPressed(Pads.UP)){
        menu_item -= 1;
    };

    if(pad.justPressed(Pads.DOWN)){
        menu_item += 1;
    };

    if(menu_item > 2){
        menu_item = 0;
    } else if ( menu_item < 0){
        menu_item = 2;
    }

    if(pad.justPressed(Pads.CROSS)){
        switch(menu_item){
            case start_game:
                globalThis.game_state = loading;
                break;
            case level_editor:
                globalThis.game_state = level_ed;
                break;
            case options:
                globalThis.game_state = options_st;
                break;
            default:
                break;
        };
    };

    pixeloid.print(170.0, 150.0, "Start Game", menu_item == 0? Color.new(128,128,128):Color.new(64,64,64));
    pixeloid.print(170.0, 220.0, "Level Editor", menu_item == 1? Color.new(128,128,128):Color.new(64,64,64));
    pixeloid.print(170.0, 290.0, "Options",    menu_item == 2? Color.new(128,128,128):Color.new(64,64,64));

};