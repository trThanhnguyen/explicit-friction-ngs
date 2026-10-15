/* Playback for the comparison blocks.
 *
 * Each block is ONE composited video (build_composites.py), so its tiles are in lockstep by
 * construction and loop natively; nothing here keeps clocks together. This file only plays a
 * block while it is on screen, wires Pause/Restart, and times the overlay cues -- the traced edge
 * and arrow drawn over the video -- off the video's own clock.
 */
(function () {
  'use strict';

  var players = [];

  function Player(root) {
    var self = this;
    this.root = root;
    this.video = root.querySelector('video');
    this.cues = Array.prototype.slice.call(root.querySelectorAll('svg.cue g[data-on]'));
    this.visible = false;
    this.userPaused = false;

    this.video.muted = true;
    this.video.addEventListener('click', function () { self.toggle(); });
    ['play', 'pause', 'seeked', 'loadeddata'].forEach(function (ev) {
      self.video.addEventListener(ev, function () { self.showCues(); self.watch(); });
    });
    var bar = root.querySelector('.cmp-bar');
    if (bar) {
      bar.addEventListener('click', function (ev) {
        var act = ev.target.getAttribute && ev.target.getAttribute('data-act');
        if (act === 'toggle') { self.toggle(); }
        if (act === 'restart') { self.userPaused = false; self.video.currentTime = 0; self.update(); }
      });
    }
    this.label();
  }

  Player.prototype.update = function () {
    if (this.visible && !this.userPaused) {
      var p = this.video.play();
      if (p && p.catch) { p.catch(function () {}); }
    } else {
      this.video.pause();
    }
    this.label();
  };

  Player.prototype.toggle = function () { this.userPaused = !this.userPaused; this.update(); };

  Player.prototype.label = function () {
    var b = this.root.querySelector('[data-act="toggle"]');
    if (b) { b.textContent = this.userPaused ? 'Play' : 'Pause'; }
  };

  Player.prototype.showCues = function () {
    var t = this.video.currentTime;
    for (var i = 0; i < this.cues.length; i += 1) {
      var g = this.cues[i];
      var on = t >= parseFloat(g.getAttribute('data-on'));
      if (on !== g.classList.contains('on')) { g.classList.toggle('on', on); }
      var b0 = g.getAttribute('data-blink-at');
      if (b0 === null) { continue; }
      var s0 = parseFloat(b0);
      var blink = t >= s0 && t < s0 + parseFloat(g.getAttribute('data-blink-for'));
      if (blink !== g.classList.contains('blink')) { g.classList.toggle('blink', blink); }
    }
  };

  /* Re-check the cues every frame while playing; stop when paused. */
  Player.prototype.watch = function () {
    if (!this.cues.length || this.watching || this.video.paused) { return; }
    var self = this;
    var v = this.video;
    this.watching = true;
    var step = function () {
      self.showCues();
      if (v.paused) { self.watching = false; return; }
      if (v.requestVideoFrameCallback) { v.requestVideoFrameCallback(step); }
      else { window.requestAnimationFrame(step); }
    };
    step();
  };

  function initCarousels() {
    Array.prototype.forEach.call(document.querySelectorAll('.caro'), function (c) {
      var row = c.querySelector('.caro-row');
      if (!row) { return; }
      function step(dir) {
        var card = row.querySelector('.card');
        var dx = card ? card.getBoundingClientRect().width + 18 : row.clientWidth * 0.8;
        row.scrollBy({ left: dir * dx, behavior: 'smooth' });
      }
      var prev = c.querySelector('.caro-btn.prev');
      var next = c.querySelector('.caro-btn.next');
      if (prev) { prev.addEventListener('click', function () { step(-1); }); }
      if (next) { next.addEventListener('click', function () { step(1); }); }
    });
  }

  function init() {
    initCarousels();
    Array.prototype.forEach.call(document.querySelectorAll('.cmp'), function (el) {
      players.push(new Player(el));
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          for (var i = 0; i < players.length; i += 1) {
            if (players[i].root === e.target) { players[i].visible = e.isIntersecting; players[i].update(); }
          }
        });
      }, { rootMargin: '100px 0px', threshold: 0.2 });
      players.forEach(function (p) { io.observe(p.root); });
    } else {
      players.forEach(function (p) { p.visible = true; p.update(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
