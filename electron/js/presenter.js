/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tim Jenkins. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


var contentScale = 1.0;
var displayContentWidth = 1024-160;
var displayFontSize = 64;

var usePresenter = false;
var presenterOpen = false;
var mirrorHoriz = false;
var mirrorVert = false;
var displayScreenId = null;
var haveSettings = false;
var markerPosition = .5;

var closePresenterWindow = function() {
    ipcRenderer.send("close-display");
};

ipcRenderer.on("display-shown", () => {
  presenterOpen = true;
  updateMirroring();
});
ipcRenderer.on("display-closed", () => {
  presenterOpen = false;
  updateMirroring();
})

var showPresenterWindow = function() {
    console.log("start showPresenterWindow()...");
    if(systemDisplays.length === 0) {
        console.log("no system displays found. can't show presenter window");
        return;
    }
    if(!haveSettings) {
        console.log("don't have settings. can't show presenter window.");
        return;
    }
    if(!usePresenter) {
        console.log("dual display mode not enabled. can't show presenter window");
        return;
    }

    var disp = findDisplay(displayScreenId);
    console.log("found display id " + displayScreenId + ": ", disp);
    if(usePresenter && systemDisplays.length >= 1) {
        if(disp === null) disp = systemDisplays[systemDisplays.length - 1];

        ipcRenderer.send("show-display", { bounds: disp.bounds });
    }
};

var updateMirroring = function() {
    $("#text").css("transform", "scale(" + ((!presenterOpen && mirrorHoriz) ? "-1" : "1") + ", " + ((!presenterOpen && mirrorVert) ? "-1" : "1") + ")");
};

$(document).ready(function() {
  
  scrollSpeedHandler();
  
  setTimeout(updateProgressBar, 100);
  
  //chrome.storage.local.get(['disableScroll', 'mirrorHoriz', 'mirrorVert', 'contentText', 'scrollSpeed', 'textDirection', 'displayFontSize', 'displayTextColor', 'displayBackgroundColor', 'marginsHoriz', 'usePresenterView', 'displayScreenId', 'centerMarkerVisible', 'centerMarkerColor', 'centerMarkerOpacity', 'centerMarkerLineThickness', 'centerMarkerPosition'], function(items) {
  if(window.localStorage.getItem('disableScroll') !== null) {
    $("#chkDisableScroll").prop("checked", varToBool(window.localStorage.getItem('disableScroll'))).change();
  }
  if(window.localStorage.getItem('mirrorHoriz') !== null) {
    mirrorHoriz = varToBool(window.localStorage.getItem('mirrorHoriz'));
  }
  if(window.localStorage.getItem('mirrorVert') !== null) {
    mirrorVert = varToBool(window.localStorage.getItem('mirrorVert'));
  }
  if(window.localStorage.getItem('marginsHoriz') !== null) {
    $("#text").css("padding-left", window.localStorage.getItem('marginsHoriz') + "px")
        .css("padding-right", window.localStorage.getItem('marginsHoriz') + "px");
  }
  if(window.localStorage.getItem('contentText') !== null) {
    $("#content").html(window.localStorage.getItem('contentText'));
  }
  if(window.localStorage.getItem('scrollSpeed') !== null) {
    $("#scrollSpeedSlider").val(window.localStorage.getItem('scrollSpeed'));
    scrollSpeedHandler(false);
  }
  if(window.localStorage.getItem('textDirection') !== null) {
    $("#content").attr('dir', window.localStorage.getItem('textDirection'));
  }
  if(window.localStorage.getItem('displayFontSize') !== null) {
    $("#content").css('font-size', window.localStorage.getItem('displayFontSize') + "pt");
    displayFontSize = window.localStorage.getItem('displayFontSize');
    updateMargins();
    updateDisplayScale();
  }
  if(window.localStorage.getItem('displayTextColor') !== null) {
    $("#content").css('color', window.localStorage.getItem('displayTextColor'));
  }
  if(window.localStorage.getItem('displayBackgroundColor') !== null) {
    $("body").css('background-color', window.localStorage.getItem('displayBackgroundColor'));
    $("#topGradient").css('background', 'linear-gradient(to bottom, ' + toRgbaString(window.localStorage.getItem('displayBackgroundColor'), 1) + ' 0%,' + toRgbaString(window.localStorage.getItem('displayBackgroundColor'), 0) + ' 100%)');
    $("#bottomGradient").css('background', 'linear-gradient(to bottom, ' + toRgbaString(window.localStorage.getItem('displayBackgroundColor'), 0) + ' 0%,' + toRgbaString(window.localStorage.getItem('displayBackgroundColor'), 1) + ' 100%)');
  }
  if(window.localStorage.getItem('usePresenterView') !== null) {
    usePresenter = varToBool(window.localStorage.getItem('usePresenterView'));
  }
  if(window.localStorage.getItem('displayScreenId') !== null) {
    displayScreenId = window.localStorage.getItem('displayScreenId');
  }
  
  //, 'centerMarkerVisible', 'centerMarkerColor', 'centerMarkerOpacity', 'centerMarkerPosition'
  if(window.localStorage.getItem('centerMarkerVisible') !== null) {
    $("#screenMarker").toggle(varToBool(window.localStorage.getItem('centerMarkerVisible')));
  }
  if(window.localStorage.getItem('centerMarkerOpacity') !== null) {
    $("#screenMarker").css('opacity', window.localStorage.getItem('centerMarkerOpacity') / 100.0);
  }
  if(window.localStorage.getItem('centerMarkerPosition') !== null) {
    $("#screenMarker").css("top", window.localStorage.getItem('centerMarkerPosition') + "%");
    markerPosition = window.localStorage.getItem('centerMarkerPosition') / 100.0;
    updateMargins();
  }
  if(window.localStorage.getItem('centerMarkerLineThickness') !== null) {
    $("#screenMarker svg line").css("strokeWidth", window.localStorage.getItem('centerMarkerLineThickness'));
  }
  if(window.localStorage.getItem('centerMarkerColor') !== null) {
    $("#screenMarker svg line").css("stroke", window.localStorage.getItem('centerMarkerColor'));
    $("#screenMarker svg path").css("fill", window.localStorage.getItem('centerMarkerColor'));
  }
  
  haveSettings = true;
  
  updateMirroring();
  
  if(usePresenter) {
    showPresenterWindow();
  }
  //});
  
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
        displayFontSize = storageChange.newValue;
        updateMargins();
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
      else if(key == 'usePresenterView') {
        var val = varToBool(storageChange.newValue);
        if(usePresenter === val) return;

        console.log("usePresenterView changed to ", val);
        usePresenter = val;
        updateMirroring();
        if(usePresenter) {
          showPresenterWindow();
        } else {
          closePresenterWindow();
        }
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
  
  
  displayContentWidth = $("#content").width();
  
  $(window).resize();
});

ipcRenderer.on('to-presenter', (event, msg) => {
  if(msg.cmd == "resizeContent") {
    //console.log("resizeContent", msg.value);
    var w = msg.value.width;
    displayContentWidth = w;
    updateDisplayScale();
  }
  else if(msg.cmd == "toggleScrolling") {
    setScrolling(!isScrolling);
  }
});

var updateDisplayScale = function() {
  var txtW = $("#content").width();
  contentScale = parseFloat(txtW) / displayContentWidth;
  $("#content")
    .css("font-size", (displayFontSize * contentScale) + "pt");
};

var isScrolling = false;
var scrollSpeed = 1;
var lastScroll = 0;
var scrollAccumulator = 0;

var scrollFn = function() {
  // get frame time in secs
  var now = Date.now();
  
  // prevent huge scroll value on first iteration
  if(lastScroll == 0) {
    lastScroll = now;
  }

  var frameTime = (now - lastScroll) / 1000.0;
  
  // scroll speed is lines/sec, amount is speed * frame time
  var fontSize = parseFloat($("#content").css("fontSize"));
  var lineHeight = fontSize * 1.3;
  var scrollAmount = frameTime * scrollSpeed * lineHeight;
  
  // scrollTop truncates fractional values, but we want to keep them
  scrollAccumulator += scrollAmount;
  
  // get largest whole number from accumulator (and remove it)
  scrollAmount = Math.floor(scrollAccumulator);
  scrollAccumulator -= scrollAmount;

  // scroll by whole number value
  var newTop = $("#text")[0].scrollTop + scrollAmount;
  $("#text").scrollTop(newTop);
  
  // cancel scroll if it doesn't move the amount we ask it to
  if($("#text").scrollTop() != newTop && isScrolling) $("#btnStart").click();
  
  // continue scrolling if not canceled
  lastScroll = now;
  if(isScrolling) {
    setTimeout(scrollFn, 10);
  }
};

var updateProgressBar = function() {
  var scrollTop = $("#text")[0].scrollTop;
  var scrollHeight = $("#text")[0].scrollHeight;
  var divHeight = $("#text").height();
  var scrollBottom = scrollHeight - divHeight;
  var scrollPercent = scrollTop / scrollBottom;
  $("#progressBar_progress").css("width", (scrollPercent * 100) + "%");
  
  var scl = contentScale;
  
  ipcRenderer.send('to-display', { cmd: "scroll-sync", value: scrollPercent });
};

//chrome.app.window.current().onFullscreened.addListener(function() { setTimeout(updateProgressBar, 100); });
//chrome.app.window.current().onRestored.addListener(function() {  setTimeout(updateProgressBar, 100); });
//chrome.app.window.current().onMaximized.addListener(function() {  setTimeout(updateProgressBar, 100); });
//chrome.app.window.current().onMinimized.addListener(function() {  setTimeout(updateProgressBar, 100); });

$(window).on("resize", function() {
  $("#text").css("height", $(window).height());
  updateMargins();
  updateDisplayScale();
});

var updateMargins = function() {
  var topMargin = $(window).height() * markerPosition;
  var bottomMargin = $(window).height() * (1.0 - markerPosition);
  
  $("#content").css("margin-top", topMargin + "px");
  $("#content").css("margin-bottom", bottomMargin + "px");
  
  updateProgressBar();
};

$(window).on("keydown keyup", function(e) {
  if(e.keyCode == 27 /* ESC */) {
    e.preventDefault();
    ipcRenderer.send('close-this-window')
  }
  else if(e.type == "keydown" && e.keyCode == 32) {
    e.preventDefault();
    setScrolling(!isScrolling);
  }
  else if(e.type == "keydown" && (e.keyCode >= 37 && e.keyCode <= 40)) {
    e.preventDefault();
    var step = 0.01;
    if(e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      step = 0.001;
    } else if(e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
      step = 0.1;
    }
    console.log(((e.keyCode == 37 || e.keyCode == 40) ? "Slow down by " : "Speed up by ") + step);
    
    if(e.keyCode == 37 || e.keyCode == 40) step *= -1;
    
    var curVal = parseFloat($("#scrollSpeedSlider").val());
    curVal += step;
    $("#scrollSpeedSlider").val(curVal);
    
    scrollSpeedHandler(true);
  }
  else {
    //console.log("type=" + e.type + "; code=" + e.keyCode, e);
  }
});

$("#chkDisableScroll").on("change", function() {
  var checked = $(this).prop("checked");
  var doit = checked && isScrolling;
  $("#scrollDisabler").toggle(doit);
  window.localStorage.setItem('disableScroll', checked);
});

$("#text").on("scroll", updateProgressBar).scroll();

$("#btnStart").on("click", function() {
  setScrolling(!isScrolling);
});

var setScrolling = function(scroll) {
  var pathData;
  if(!scroll) {
    isScrolling = false;
    //postMmsg({"cmd": "scroll", "value": isScrolling});
    $("#btnStart i.material-icons").html("play_arrow");
    $("#scrollDisabler").hide();
  } else {
    isScrolling = true;
    $("#btnStart .material-icons").html("pause");
    $("#scrollDisabler").toggle($("#chkDisableScroll").prop("checked"));
    lastScroll = Date.now();
    setTimeout(scrollFn, 10);
  }
};

var scrollSpeedHandler = function(save) {
  var value = $("#scrollSpeedSlider").val();
  if(value > 1) {
    value = 1 + ((value - 1) * 4.0);
  }
  scrollSpeed = value;
  $("#scrollSpeedLabel").text(parseFloat(value).toFixed(3));
  
  if(save) {
    window.localStorage.setItem("scrollSpeed", value);
  }
  //postMsg({"cmd": "scrollSpeed", "value": scrollSpeed });
};

$("#scrollSpeedSlider")
  .on("input", function() { scrollSpeedHandler(false); })
  .on("change", function() { scrollSpeedHandler(true); });
