
export var V = SAT.Vector;
export var P = SAT.Polygon;
export var B = SAT.Box;

export function Vector2(x_pos, y_pos) {
    this.x = x_pos;
    this.y = y_pos;
};

export function MapTile(texture, worldpos, grid) {
    this.tex = texture;
    this.pos = worldpos;
    this.tile = grid;
};
