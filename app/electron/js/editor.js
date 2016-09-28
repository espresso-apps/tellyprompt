/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tim Jenkins. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var count = 0;

var editorIsDirty = false;
var editorFileName = "untitled.txt";
var editorFileId = null;

var helpWindow = null;
var settingsWindow = null;

var setEditorDirty = function(dirty) {
    dirty = !!dirty; // force boolean
    console.log("Setting editor " + (dirty ? "" : "not ") + "dirty.");
    editorIsDirty = dirty;
    updateWindowTitle();
    
    window.localStorage.setItem( 'editorIsDirty', dirty );
};

var setEditorFile = function(filePath, fileName) {
    if(filePath === null) {
        editorFileId = null;
        editorFileName = (fileName === null ? "untitled.txt" : fileName);
    } else {
        editorFileId = filePath;
        editorFileName = fileName;
    }
    updateWindowTitle();
    
    window.localStorage.setItem( 'editorFileId', editorFileId );
    window.localStorage.setItem( 'editorFileName', editorFileName );
}

var updateWindowTitle = function() {
    $("title").html("" + (editorIsDirty ? "&#x25cf;" : "") + editorFileName + " - Editor - TellyPrompt");
}

var newDocument = function() {
    $("#text-editor").val("").change();
    setEditorFile(null, "untitled.txt");
    setEditorDirty(false);
};

var saveDocument = function(save_as) {
    function saveEntry(fileName) {
        return new Promise(function(resolve, reject) {
            fs.writeFile(fileName, $("#text-editor").val(), function(err) {
                if(err) {
                    console.error("Write Error: ", e);
                    reject(e);
                    return;
                }
                
                console.log("write completed.");
                setEditorFile(fileName, path.basename(fileName));
                setEditorDirty(false);
                resolve();
                
            });
        });
    }
    
    function browseForEntry() {
        return new Promise(function(resolve, reject) {
            dialog.showSaveDialog({
                "defaultPath": editorFileName,
                "filters": [
                    { "name": "Text Documents", "extensions": [ "txt" ] },
                    { "name": "All Files", "extensions": [ "*" ] }
                ]
            }, function(fileName) {
                resolve(fileName);
            });
        });
    }
    
    return new Promise(function(resolve, reject) {
        
        function dontRestore() {
            browseForEntry().then(function(fileName) {
                saveEntry(fileName).then(function() {
                    resolve();
                },
                function(err) {
                    reject(err);
                });
            },
            function(err) {
                reject(err);
            });
        }
        
        // try to restore file entry, if user isn't forcing a "save as"
        if(!save_as && editorFileId && editorFileId.length > 0) {
            saveEntry(editorFileId).then(function() {
                resolve();
            },
            function(err) {
                reject(err);
            });
        } else {
            dontRestore();
        }
    });
};

var loadDocument = function(success_callback) {
    return new Promise(function(resolve, reject) {
        dialog.showOpenDialog({
            "defaultPath": editorFileName,
            "filters": [
                { "name": "Text Documents", "extensions": [ "txt" ] },
                { "name": "All Files", "extensions": [ "*" ] }
            ],
            "properties": [ 'openFile' ]
        }, function(fileNames) {
            fs.readFile(fileNames[0], 'utf-8', function(err, data) {
                if(err) {
                    console.error("Read Error: ", err);
                    reject(err);
                    return;
                }
                console.log("load completed.");
                
                $("#text-editor").val(data).change();
                setEditorFile(fileNames[0], path.basename(fileNames[0]));
                setEditorDirty(false);
                resolve();
            });
        });
    });
};

var checkIfEditorDirtyAndSave = function() {
    return new Promise(function(resolve, reject) {
        if(editorIsDirty) {
            $("#dlgConfirmSave").off("click").on("click", function() {
                $("#dlgConfirmNew").modal("hide");
                saveDocument(false).then(
                    function() {
                        resolve();
                    }
                )
            });
            $("#dlgConfirmDiscard").off("click").on("click", function() {
                $("#dlgConfirmNew").modal("hide");
                resolve();
            });
            $("#dlgConfirmNew").modal("show");
        } else {
            resolve();
        }
    });
};

$(document).ready(function() {

    $("#text-editor").on("change input paste", function() {
        window.localStorage.setItem( 'contentText', $(this).val() );
        console.log("content changed");
        setEditorDirty(true);
    });
  
    $("#btnStartPresenting").on("click", function() {
        ipcRenderer.send("show-presenter");
    });
  
    $("#btnNew").on("click", function() {
        checkIfEditorDirtyAndSave().then(
            function() {
                newDocument();
            }
        );
    });
    
    $("#btnOpen").on("click", function() {
        checkIfEditorDirtyAndSave().then(
            function() {
                loadDocument(function(entry) {
                    setEditorDirty(false);
                });
            }
        );
    });
    
    $("#btnSave").on("click", function() {
        saveDocument(false);
    });
    $("#btnSaveAs").on("click", function() {
        saveDocument(true);
    });
    
    $("#btnExit").on("click", function() {
        electron.remote.app.quit();
    });
    
    $("#btnHelp").on("click", function() {
        ipcRenderer.send("show-help");
    });
    
    if(window.localStorage.getItem('textDirection') !== null) {
        $("#text-editor").attr('dir', window.localStorage.getItem('textDirection'));
    } else {
        $("#text-editor").attr('dir','auto');
    }
    if(window.localStorage.getItem('contentText') !== null) {
        $('#text-editor').val(window.localStorage.getItem('contentText'));
    } else {
        $('#text-editor').val("");
    }
    if(window.localStorage.getItem('editorFontSize') !== null) {
        var size = window.localStorage.getItem('editorFontSize');
        $("#text-editor").css("font-size", size + "pt");
    } else {
        $("#text-editor").css("font-size", "16pt");
    }
    
    if(window.localStorage.getItem('editorFileName') !== null) {
        editorFileName = window.localStorage.getItem('editorFileName');
    } else {
        editorFileName = null;
    }
    if(window.localStorage.getItem('editorFileId') !== null) {
        editorFileId = window.localStorage.getItem('editorFileId');
    } else {
        editorFileId = null;
    }
    if(window.localStorage.getItem('editorIsDirty') !== null) {
        var dirty = window.localStorage.getItem('editorIsDirty');
        dirty = (dirty === true || dirty === 1 || dirty === "true");
        setEditorDirty(dirty);
    } else {
        setEditorDirty(false);
    }
    
    window.addEventListener('storage', function(e) {
        if(e.key == 'textDirection') {
            $("#text-editor").attr('dir', e.newValue);
        }
        else if(e.key == 'editorFontSize') {
            $('#inputEditorTextSize').val(e.newValue);
            $("#text-editor").css('font-size', e.newValue + "pt");
        }
    });
  
    $("#btnSettings").on("click", function() {
        ipcRenderer.send("show-settings", window.id);
    });
});

