/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tim Jenkins. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// misc. utility functions

function toRgbaString(hexColor, alpha) {
  var shorthandRegex = /^#?([0-9A-F])([0-9A-F])([0-9A-F])$/i;
  hexColor = hexColor.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });
  var match = hexColor.match(/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i);
  if(match) {
    return "rgba(" + parseInt(match[1], 16) + "," + parseInt(match[2], 16) + "," + parseInt(match[3], 16) + "," + alpha + ")";
  }
  return hexColor;
}

function varToBool(val) {
  var temp = val.toLowerCase();
  if(temp === "true" || temp === "yes" || temp === "t" || temp === "y") return true;
  if(temp === "false" || temp === "no" || temp === "f" || temp === "n") return false;
  return (!!val);
}
