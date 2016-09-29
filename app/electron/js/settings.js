/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tim Jenkins. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

if(process.platform == 'darwin') {
    $("#dialogActions div.win").hide();
    $("#dialogActions div.mac").show();
}

function closeDialog() {
    ipcRenderer.send("close-this-window");
}

function saveChanges() {
    if(isDirty) {
        console.log("Saving changes...");
        if(!validateSettingsDialog()) return;
        console.log("Validation successful.");
        
        var textDirection = $("input:radio[name=optionTextDir]:checked").val();
        var editorFontSize = parseInt($("#inpEditorFontSize").val());
        var displayFontSize = parseInt($("#inpDisplayFontSize").val());
        var displayTextColor = $("#inpDisplayFontColor").val();
        var displayBackgroundColor = $("#inpDisplayBackgroundColor").val();
        var displayHorizMargin = parseInt($("#inpDisplayMarginsHoriz").val());
        
        var showMarker = $("#chkShowMarker").prop("checked") ? true : false;
        var markerColor = $("#inpMarkerColor").val();
        var markerOpacity = parseInt($("#inpMarkerOpacity").val());
        var markerPosition = parseInt($("#inpMarkerPosition").val());
        var markerThickness = parseInt($("#inpMarkerThickness").val());
        
        var mirrorHoriz = $("#chkMirrorHorizontal").prop("checked") ? true : false;
        var mirrorVert = $("#chkMirrorVertical").prop("checked") ? true : false;
        var useDualMonitor = $("#chkUseDualMonitorView").prop("checked") ? true : false;
        var displayScreen = $("#selectDisplayScreen").val();
        
        var settings = {
            'textDirection': textDirection,
            'editorFontSize': editorFontSize,
            'displayFontSize': displayFontSize,
            'displayTextColor': displayTextColor,
            'displayBackgroundColor': displayBackgroundColor,
            'marginsHoriz': displayHorizMargin,
            
            'centerMarkerVisible': showMarker,
            'centerMarkerColor': markerColor,
            'centerMarkerOpacity': markerOpacity,
            'centerMarkerPosition': markerPosition,
            'centerMarkerLineThickness': markerThickness,
            
            'mirrorHoriz': mirrorHoriz,
            'mirrorVert': mirrorVert,
            'usePresenterView': useDualMonitor,
            'displayScreenId': displayScreen
        };
        
        //chrome.storage.local.set(settings);
        for(var key in settings) {
            if(settings.hasOwnProperty(key)) {
                window.localStorage.setItem(key, settings[key]);
            }
        }
        setDirty(false);
        console.log("Done saving changes.");
    }
}

function loadSettings() {

    if(systemDisplays.length <= 1) {
        //*
        console.log("Only one display detected. Ensuring dual monitor mode is disabled.");
        $("#dualMonitorSettings").prop("disabled", true);
        $("#chkUseDualMonitorView").prop("checked", false);
        window.localStorage.setItem( 'usePresenterView', false );
        //*/
    } else {
        console.log("Multiple (" + systemDisplays.length + ") displays detected. Enabling dual monitor option in settings.");
        $("#dualMonitorSettings").prop("disabled", false);
    }
    var sel = $("#selectDisplayScreen");
    if(systemDisplays.length >= 1) {
        sel.empty();
        $.each(systemDisplays, function(index, item) {
            console.log(item);
            var opt = $("<option></option>").attr("value", item.id).text((item.isPrimray ? "===" : "") + item.name);
            if(!item.isPrimary) opt.prop("selected", true);
            sel.append(opt);
        });
    }

    var radios = $("input:radio[name=optionTextDir]");
    if(window.localStorage.getItem('textDirection') !== null) {
        var dir = window.localStorage.getItem('textDirection');
        radios.filter('[value=' + dir + ']').prop('checked', true);
    } else {
        radios.filter('[value=ltr]').prop('checked', true);
    }
    if(window.localStorage.getItem('editorFontSize') !== null) {
        $('#inpEditorFontSize').val(window.localStorage.getItem('editorFontSize'));
    } else {
        $("#inpEditorFontSize").val(16);
    }
    if(window.localStorage.getItem('centerMarkerVisible') !== null) {
        $('#chkShowMarker').prop('checked', varToBool(window.localStorage.getItem('centerMarkerVisible')));
    } else {
        $('#chkShowMarker').prop('checked', true);
    }
    if(window.localStorage.getItem('centerMarkerColor') !== null) {
        $('#inpMarkerColor').val(window.localStorage.getItem('centerMarkerColor'));
    } else {
        $('#inpMarkerColor').val("#FFFFFF");
    }
    if(window.localStorage.getItem('centerMarkerOpacity') !== null) {
        $('#inpMarkerOpacity').val(window.localStorage.getItem('centerMarkerOpacity'));
    } else {
        $('#inpMarkerOpacity').val(50);
    }
    if(window.localStorage.getItem('centerMarkerLineThickness') !== null) {
        $('#inpMarkerThickness').val(window.localStorage.getItem('centerMarkerLineThickness'));
    } else {
        $('#inpMarkerThickness').val(2);
    }
    if(window.localStorage.getItem('centerMarkerPosition') !== null) {
        $('#inpMarkerPosition').val(window.localStorage.getItem('centerMarkerPosition'));
    } else {
        $('#inpMarkerPosition').val(50);
    }
    if(window.localStorage.getItem('displayFontSize') !== null) {
        $('#inpDisplayFontSize').val(window.localStorage.getItem('displayFontSize'));
    } else {
        $("#inpDisplayFontSize").val(64);
    }
    if(window.localStorage.getItem('displayTextColor') !== null) {
        $('#inpDisplayFontColor').val(window.localStorage.getItem('displayTextColor'));
    } else {
        $("#inpDisplayFontColor").val("#FFFFFF");
    }
    if(window.localStorage.getItem('displayBackgroundColor') !== null) {
        $('#inpDisplayBackgroundColor').val(window.localStorage.getItem('displayBackgroundColor'));
    } else {
        $("#inpDisplayBackgroundColor").val("#000000");
    }
    if(window.localStorage.getItem('marginsHoriz') !== null) {
        $('#inpDisplayMarginsHoriz').val(window.localStorage.getItem('marginsHoriz'));
    } else {
        $("#inpDisplayMarginsHoriz").val(80);
    }
    if(window.localStorage.getItem('mirrorHoriz') !== null) {
        $("#chkMirrorHorizontal").prop("checked", varToBool(window.localStorage.getItem('mirrorHoriz')));
    } else {
        $("#chkMirrorHorizontal").prop("checked", false);
    }
    if(window.localStorage.getItem('mirrorVert') !== null) {
        $("#chkMirrorVertical").prop("checked", varToBool(window.localStorage.getItem('mirrorVert')));
    } else {
        $("#chkMirrorVertical").prop("checked", false);
    }
    if(window.localStorage.getItem('usePresenterView') !== null) {
        var val = varToBool(window.localStorage.getItem('usePresenterView'));
        $("#chkUseDualMonitorView").prop("checked", val);
        $("#selectDisplayScreen").prop("disabled", !val);
    } else {
        $("#chkUseDualMonitorView").prop("checked", true);
        $("#selectDisplayScreen").prop("disabled", false);
    }
    if(window.localStorage.getItem('displayScreenId') !== null) {
        var id = window.localStorage.getItem('displayScreenId');
        var display = findDisplay(id);
        console.log("display id: ", id, display);
        if(display !== null) {
            $("#selectDisplayScreen").val(id);
        }
    }
    
    $("#selectDisplayScreen").change();

    $("#chkUseDualMonitorView").on("change", function() {
        $("#selectDisplayScreen").prop("disabled", !$("#chkUseDualMonitorView").prop("checked"));
    });

    $("#selectDisplayScreen").on("change", function() {
        updateSelectedDisplayInfo();
    });

    updateSelectedDisplayInfo();
    setDirty(false);
}

function updateSelectedDisplayInfo() {
    // Display Info: Size: 0x0 - Offset: 0,0
    var display = findDisplay($("#selectDisplayScreen").val());
    var bs = display.bounds;
    $(".screen-debug-info").html("Display Info: Size: " + bs.width + "x" + bs.height + " - Offset: " + bs.x + "," + bs.y);
}

var isDirty = false;
function setDirty(dirty) {
    if(dirty === "true" || dirty === "yes" || dirty === "y" || dirty === "t") dirty = true;
    if(dirty === "false" || dirty === "no" || dirty === "n" || dirty === "f") dirty = false;
    
    isDirty = !!dirty;
    
    $("#applyButton").prop("disabled", !isDirty);
}

$(document).ready(function() {
    console.log("document ready.");
    
    loadSettings();

    $("#cancelButtonWin, #cancelButtonMac").on("click", function() {
        closeDialog();
    });

    $("#okButtonWin, #okButtonMac").on("click", function() {
        saveChanges();
        closeDialog();
    });

    $("#applyButtonWin").on("click", function() {
        saveChanges();
    });

    $("form").on("change input paste", "input, select", function() {
        setDirty(true);
    });
});

var validateSettingsDialog = function() {
    
    var radios = $("input:radio[name=optionTextDir]");
    
    var inputParent = $(radios[0]);
    while(!inputParent.is(".form-group") && !inputParent.is("form") && inputParent.parent().exists()) {
        inputParent = inputParent.parent();
    }
    if(!inputParent.is(".form-group")) inputParent = input;
    
    inputParent.removeClass("has-error");
    
    if(radios.is(":checked") === false) {
            inputParent.addClass("has-error");
            $("#dialogContent a[href='#dlgTabStyles']").tab('show');
            return false;
    }
    
    if(!validateIntNumberField("inpEditorFontSize", "dialogContent", "dlgTabStyles")) return false;
    if(!validateIntNumberField("inpDisplayFontSize", "dialogContent", "dlgTabStyles")) return false;
    if(!validateColorField("inpDisplayFontColor", "dialogContent", "dlgTabStyles")) return false;
    if(!validateColorField("inpDisplayBackgroundColor", "dialogContent", "dlgTabStyles")) return false;
    if(!validateIntNumberField("inpDisplayMarginsHoriz", "dialogContent", "dlgTabStyles")) return false;
    
    if(!validateColorField("inpMarkerColor", "dialogContent", "dlgTabDisplay")) return false;
    if(!validateIntNumberField("inpMarkerOpacity", "dialogContent", "dlgTabDisplay")) return false;
    if(!validateIntNumberField("inpMarkerPosition", "dialogContent", "dlgTabDisplay")) return false;
    if(!validateIntNumberField("inpMarkerThickness", "dialogContent", "dlgTabDisplay")) return false;
    
    return true;  
};

var validateIntNumberField = function(id, tabContainerId, tabId) {
    var input = $("#" + id);
    
    if(!input.exists()) {
        console.error("Unable to find input field: #" + id);
        return;
    }
    
    var inputParent = input;
    while(!inputParent.is(".form-group") && !inputParent.is("form") && inputParent.parent().exists()) {
        inputParent = inputParent.parent();
    }
    if(!inputParent.is(".form-group")) inputParent = input;
    inputParent.removeClass("has-error");
    
    var editorText = input.val();
    var editorNumber = parseInt(editorText);
    
    if(isNaN(editorNumber)) {
        inputParent.addClass("has-error");
        if(typeof(tabContainerId) !== 'undefined') $("#" + tabContainerId + " a[href='#" + tabId + "']").tab('show');
        input.focus();
        return false;
    }
  
    var min = input.attr("min");
    if(typeof min !== 'undefined') {
        if(editorNumber < parseInt(min)) {
            inputParent.addClass("has-error");
            if(typeof(tabContainerId) !== 'undefined') $("#" + tabContainerId + " a[href='#" + tabId + "']").tab('show');
            input.focus();
            return false;
        }
    }
  
    var max = input.attr("max");
    if(typeof max !== 'undefined') {
        if(editorNumber > parseInt(max)) {
            inputParent.addClass("has-error");
            if(typeof(tabContainerId) !== 'undefined') $("#" + tabContainerId + " a[href='#" + tabId + "']").tab('show');
            input.focus();
            return false;
        }
    }
  
    return true;
};

var validateColorField = function(id, tabContainerId, tabId) {
    var input = $("#" + id);
    
    if(!input.exists()) return false;
    
    var inputParent = input;
    while(!inputParent.is(".form-group") && !inputParent.is("form") && inputParent.parent().exists()) {
        inputParent = inputParent.parent();
    }
    if(!inputParent.is(".form-group")) inputParent = input;
    inputParent.removeClass("has-error");
    
    var editorText = input.val();
    
    var res = editorText.match(/#(?:[0-9a-f]{3}){1,2}/gi);
    if(res === null) {
        inputParent.addClass("has-error");
        if(typeof(tabContainerId) !== 'undefined') $("#" + tabContainerId + " a[href='#" + tabId + "']").tab('show');
        input.focus();
        return false;
    }
    
    return true;
};
