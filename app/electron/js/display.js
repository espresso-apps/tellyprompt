/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tim Jenkins. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


var mirrorHoriz = false;
var mirrorVert = false;

var markerPosition = .5;


$(document).ready(function() {
  if(window.localStorage.getItem('mirrorHoriz') !== null) {
    mirrorHoriz = varToBool(window.localStorage.getItem('mirrorHoriz'));
  }
  if(window.localStorage.getItem('mirrorVert') !== null) {
    mirrorVert = varToBool(window.localStorage.getItem('mirrorVert'));
  }
  updateMirroring();
  if(window.localStorage.getItem('marginsHoriz') !== null) {
    $("#text").css("padding-left", window.localStorage.getItem('marginsHoriz') + "px")
        .css("padding-right", window.localStorage.getItem('marginsHoriz') + "px");
  } else {
    $("#text").css("padding-left", "80px")
        .css("padding-right", "80px");
  }
  if(window.localStorage.getItem('contentText') !== null) {
    $("#content").html(window.localStorage.getItem('contentText'));
  }
  if(window.localStorage.getItem('textDirection') !== null) {
    $("#content").attr('dir', window.localStorage.getItem('textDirection'));
  } else {
    $("#content").attr('dir', "auto");
  }
  if(window.localStorage.getItem('displayFontSize') !== null) {
    $("#content").css('font-size', window.localStorage.getItem('displayFontSize') + "pt");
  } else {
    $("#content").css('font-size', "64pt");
  }
  if(window.localStorage.getItem('displayTextColor') !== null) {
    $("#content").css('color', window.localStorage.getItem('displayTextColor'));
  } else {
    $("#content").css('color', "#FFFFFF");
  }
  if(window.localStorage.getItem('displayBackgroundColor') !== null) {
    $("body").css('background-color', window.localStorage.getItem('displayBackgroundColor'));
    $("#topGradient").css('background', 'linear-gradient(to bottom, ' + toRgbaString(window.localStorage.getItem('displayBackgroundColor'), 1) + ' 0%,' + toRgbaString(window.localStorage.getItem('displayBackgroundColor'), 0) + ' 100%)');
    $("#bottomGradient").css('background', 'linear-gradient(to bottom, ' + toRgbaString(window.localStorage.getItem('displayBackgroundColor'), 0) + ' 0%,' + toRgbaString(window.localStorage.getItem('displayBackgroundColor'), 1) + ' 100%)');
  } else {
    $("body").css('background-color', "#000000");
    $("#topGradient").css('background', 'linear-gradient(to bottom, ' + toRgbaString("#000000", 1) + ' 0%,' + toRgbaString("#000000", 0) + ' 100%)');
    $("#bottomGradient").css('background', 'linear-gradient(to bottom, ' + toRgbaString("#000000", 0) + ' 0%,' + toRgbaString("#000000", 1) + ' 100%)');
  }
  
  if(window.localStorage.getItem('centerMarkerVisible') !== null) {
    $("#screenMarker").toggle(varToBool(window.localStorage.getItem('centerMarkerVisible')));
  } else {
    $("#screenMarker").toggle(true);
  }
  if(window.localStorage.getItem('centerMarkerOpacity') !== null) {
    $("#screenMarker").css('opacity', window.localStorage.getItem('centerMarkerOpacity') / 100.0);
  } else {
    $("#screenMarker").css('opacity', 1.0);
  }
  if(window.localStorage.getItem('centerMarkerPosition') !== null) {
    $("#screenMarker").css("top", window.localStorage.getItem('centerMarkerPosition') + "%");
    markerPosition = window.localStorage.getItem('centerMarkerPosition') / 100.0;
  } else {
    $("#screenMarker").css("top", "50%");
    markerPosition = 0.5;
  }
  updateMargins();
  if(window.localStorage.getItem('centerMarkerLineThickness') !== null) {
    $("#screenMarker svg line").css("strokeWidth", window.localStorage.getItem('centerMarkerLineThickness'));
  } else {
    $("#screenMarker svg line").css("strokeWidth", 2.0);
  }
  if(window.localStorage.getItem('centerMarkerColor') !== null) {
    $("#screenMarker svg line").css("stroke", window.localStorage.getItem('centerMarkerColor'));
    $("#screenMarker svg path").css("fill", window.localStorage.getItem('centerMarkerColor'));
  } else {
    $("#screenMarker svg line").css("stroke", "#FFFFFF");
    $("#screenMarker svg path").css("fill", "#FFFFFF");
  }
  
  window.addEventListener('storage', function(e) {
      var key = e.key;
      var storageChange = e;
      if(key == "contentText") {
        $("#content").html(storageChange.newValue);
      }
      else if(key == 'textDirection') {
        $("#content").attr('dir', storageChange.newValue);
      }
      else if(key == 'displayFontSize') {
        $("#content").css('font-size', storageChange.newValue + "pt");
      }
      else if(key == 'mirrorHoriz') {
        mirrorHoriz = varToBool(storageChange.newValue);
        updateMirroring();
      }
      else if(key == 'mirrorVert') {
        mirrorVert = varToBool(storageChange.newValue);
        updateMirroring();
      }
      else if(key == 'marginsHoriz') {
        $("#text").css("padding-left", storageChange.newValue + "px")
          .css("padding-right", storageChange.newValue + "px");
      }
      else if(key == 'displayBackgroundColor') {
        $("body").css('background-color', storageChange.newValue);
        $("#topGradient").css('background', 'linear-gradient(to bottom, ' + toRgbaString(storageChange.newValue, 1) + ' 0%,' + toRgbaString(storageChange.newValue, 0) + ' 100%)');
        $("#bottomGradient").css('background', 'linear-gradient(to bottom, ' + toRgbaString(storageChange.newValue, 0) + ' 0%,' + toRgbaString(storageChange.newValue, 1) + ' 100%)');
      }
      else if(key == 'displayTextColor') {
        $("#content").css('color', storageChange.newValue);
      }
      else if(key == 'centerMarkerVisible') {
        $("#screenMarker").toggle(varToBool(storageChange.newValue));
      }
      else if(key == 'centerMarkerOpacity') {
        $("#screenMarker").css('opacity', storageChange.newValue / 100.0);
      }
      else if(key == 'centerMarkerPosition') {
        $("#screenMarker").css("top", storageChange.newValue + "%");
        markerPosition = storageChange.newValue / 100.0;
        updateMargins();
      }
      else if(key == 'centerMarkerLineThickness') {
        $("#screenMarker svg line").css("strokeWidth", storageChange.newValue + "px");
      }
      else if(key == 'centerMarkerColor') {
        $("#screenMarker svg line").css("stroke", storageChange.newValue);
        $("#screenMarker svg path").css("fill", storageChange.newValue);
      }
  });
  $(window).resize();
});

var updateMirroring = function() {
  $("#text").css("transform", "scale(" + (mirrorHoriz ? "-1" : "1") + ", " + (mirrorVert ? "-1" : "1") + ")");
};

ipcRenderer.on("to-display", (event, msg) => {
  if(msg.cmd == "scroll-sync") {
    scrollToPercent(msg.value);
  }
});

var scrollToPercent = function(percent) {
  var scrollHeight = $("#text")[0].scrollHeight;
  var divHeight = $("#text").height();
  var scrollBottom = scrollHeight - divHeight;
  var scrollTop = scrollBottom * percent;
  $("#text").scrollTop(scrollTop);
};

var updateMargins = function() {
  var topMargin = $(window).height() * markerPosition;
  var bottomMargin = $(window).height() * (1.0 - markerPosition);
  
  $("#content").css("margin-top", topMargin + "px");
  $("#content").css("margin-bottom", bottomMargin + "px");
}


$(window).on("resize", function() {
  $("#text").css("height", $(window).height());
  
  var fontSize = parseFloat($("#content").css("fontSize"));
  var lineHeight = fontSize * 1.3;
  
  updateMargins();
  
  
  //updateProgressBar();
  
  ipcRenderer.send("to-presenter", {"cmd": "resizeContent", "value": { "height": $("#content").height(), "width": $("#content").width() } });
}).resize();

$(window).on("keydown keyup", function(e) {
  if(e.keyCode == 27 /* ESC */) {
    e.preventDefault();
    ipcRenderer.send("to-presenter", {"cmd": "closeWindow"});
  }
  else if(e.type == "keydown" && e.keyCode == 32 /* Space */) {
    e.preventDefault();
    ipcRenderer.send("to-presenter", {"cmd": "toggleScrolling"});
  }
});


