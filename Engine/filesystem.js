function writeJSON(path, object){
    var fd = System.openFile(path, FCREATE);
    var content = JSON.stringify(object);
    System.writeFile(fd, content, content.length);
    System.closeFile(fd);
};

export function readJSON(path){
    // var fd = System.openFile(path, FREAD);
    // var data = System.readFile(fd, System.sizeFile(fd));
    // System.closeFile(fd);
    const data = std.loadFile(path);
    return JSON.parse(data);
};