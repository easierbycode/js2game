import { loadAnimGroup } from "Engine/anim.js";
import { readJSON } from "Engine/filesystem.js";

var bg1;
var bg2;
var bg3;
var bg4;
var bg5;

const n_yet = 0;
const loading_anim = 1;
const loading_map = 2;
const finished = 3;

var loading_state = n_yet;
var loading_started = false;

export function loadGame() {
  pixeloid.print(380.0, 300.0, "Loading...", Color.new(128, 128, 128));
  Screen.flip();

  if (!loading_started) {
    loading_started = true;
    loading_state++;
  }

  if (loading_state == loading_anim) {
    Screen.clear();
    pixeloid.print(380.0, 300.0, "Loading...", Color.new(128, 128, 128));
    pixeloid_small.print(380.0, 350.0, "Anims", Color.new(64, 64, 64));
    Screen.flip();

    loadAnimGroup("Idle");
    loadAnimGroup("Walk");
    loadAnimGroup("Run");
    loadAnimGroup("Jump");

    loading_state++;
  }

  if (loading_state == loading_map) {
    Screen.clear();
    pixeloid.print(380.0, 300.0, "Loading...", Color.new(128, 128, 128));
    pixeloid_small.print(380.0, 350.0, "Map", Color.new(64, 64, 64));
    Screen.flip();

    map = readJSON("Levels/test.json");

    bg1 = new Image("Map/Background/1.png");
    bg2 = new Image("Map/Background/2.png");
    bg3 = new Image("Map/Background/3.png");
    bg4 = new Image("Map/Background/4.png");
    bg5 = new Image("Map/Background/5.png");

    globalThis.bg1 = bg1;
    globalThis.bg2 = bg2;
    globalThis.bg3 = bg3;
    globalThis.bg4 = bg4;
    globalThis.bg5 = bg5;

    loading_state++;
  }

  if (loading_state == finished) {
    Screen.clear();
    // ram = System.getFreeMemory();
    ram = System.getMemoryStats();
    game_state = running;
    loading_state = n_yet;
    loading_started = false;
  }
}
