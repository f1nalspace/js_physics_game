var finalgine = finalgine || {};

/*
Timer class
*/
finalgine.Timer = function () {
   this.gameTime = 0;
   this.maxStep = 0.05;
   this.lastTimestamp = 0;
};

//Returns some sort of total milliseconds, since starting the application or since unix epoche
finalgine.Timer.prototype.currentTimeMillis = function () {
   return window.performance.now();
};

//Resets game time to zero and set last timestamp to current time
finalgine.Timer.prototype.reset = function () {
   this.gameTime = 0;
   this.lastTimestamp = this.currentTimeMillis();
};

// Updates current time, calculates delta and returns game delta
finalgine.Timer.prototype.tick = function () {
   var current = this.currentTimeMillis();
   var delta = (current - this.lastTimestamp) / 1000;
   this.lastTimestamp = current;

   var gameDelta = Math.min(delta, this.maxStep);
   this.gameTime += gameDelta;
   return gameDelta;
};