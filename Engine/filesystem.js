export function writeJSON(path, object){
    const content = JSON.stringify(object);
    const err = { errno: 0 };
    const file = std.open(path, "w", err);
    if(!file){
        // attempt fallback to System if std.open isn't available
        try{
            var fd = System.openFile(path, FCREATE);
            System.writeFile(fd, content, content.length);
            System.closeFile(fd);
            return;
        }catch(e){
            throw new Error("Failed to open file for writing: " + path + " (std.open and fallback failed)");
        }
    }

    // Use puts to write UTF-8 string (adds no extra newline)
    file.puts(content);
    file.close();
};

export function readJSON(path){
    // var fd = System.openFile(path, FREAD);
    // var data = System.readFile(fd, System.sizeFile(fd));
    // System.closeFile(fd);
    const data = std.loadFile(path);
    return JSON.parse(data);
};