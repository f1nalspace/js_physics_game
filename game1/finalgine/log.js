var finalgine = finalgine || {};

finalgine.Log = {};
finalgine.Log.info = function (text, section) {
    console.log((section !== undefined ? "[" + section + "] " : "") + text);
};
finalgine.Log.error = function (text, section) {
    console.error((section !== undefined ? "[" + section + "] " : "") + text);
};
