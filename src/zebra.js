/*
 * Copyright (c) 2014 Lu, Jun
 * Licensed under the MIT license.
 */
(function ($) {
  'use strict';

  function Zebra($el, options) {
    this.width = $el.width();
    this.height = $el.height();
    this.$el = $el;
    this.options = options;
  }

  var ZebraProto = Zebra.prototype;

  ZebraProto.init = function() {
    var me = this,
        pages = this.$el.find(this.options.selector);

    pages.on('touchstart touchmove touchend', function(e) {
      e.preventDefault();
      var touch = e.originalEvent.touches[0] || {},
          view = e.target;
      switch(e.type) {
        case 'touchstart': me.start(view, touch.pageX, touch.pageY); break;
        case 'touchmove':  me.move(view, touch.pageX, touch.pageY); break;
        case 'touchend' :  me.end(view);
      }
    });
  };

  ZebraProto.start = function(view, x, y) {
    this.x0 = x;
    this.y0 = y;
    this.distance = 0;
    this.view = view;
  };

  ZebraProto.cancel = function(view) {
    var animate = {
      north : { top : -this.height },
      south : { top : this.height },
      east : { left : this.width },
      west : { left : -this.width }
    }[this.direction];

    view.animate(animate, {
      complete : function() {
        view.addClass('hide')
            .removeClass('active');
      }
    });
  };

  ZebraProto.updateDirection = function(direction) {
    if (this.direction !== direction) {
      this.cancel(this.nextView());
    }
    this.direction = direction;
  };

  ZebraProto.update = function() {
    var offsetX = this.x0 - this.x1, 
        offsetY = this.y0 - this.y1, 
        distanceX = Math.abs(offsetX), 
        distanceY = Math.abs(offsetY);

    if (distanceX > distanceY) {
      this.offset = { left : (this.x0 > this.x1 ? this.width : -this.width) - offsetX };
      this.distance = distanceX;
      this.updateDirection(this.x0 > this.x1 ? 'east' : 'west');
    } else {
      this.offset = { top : (this.y0 > this.y1 ? this.height : -this.height) - offsetY };
      this.distance = distanceY;
      this.updateDirection(this.y0 > this.y1 ? 'south' : 'north');
    }
  };

  ZebraProto.nextView = function() {
    var name = this.options.prefix + '-' + this.direction,
        selector = this.currentView().data(name);
    return this.$el.find(selector);
  };

  ZebraProto.currentView = function() {
    return $(this.view);
  };

  ZebraProto.move = function(view, x, y) {
    this.x1 = x;
    this.y1 = y;
    this.update();
    this.nextView()
      .removeClass('hide')
      .addClass('active')
      .css(this.offset);
  };

  ZebraProto.end = function() {
    var current = this.currentView(),
        next = this.nextView();

    if (this.distance > this.options.threshold) {
      next.animate({ top: 0, left: 0}, {
        complete: function() {
          current.addClass('hide');
          next.removeClass('active');
        }
      });
    } else {
      this.cancel(next);
    }
  };

  $.fn.zebra = function(options) {
    var opts = $.extend({}, $.fn.zebra.options, options);
    return this.each(function() {
      var zebra = new Zebra($(this), opts);
      zebra.init();
    });  
  };

  $.fn.zebra.options = {
    selector : 'section',
    prefix : 'zebra',
    threshold : 80
  };

}(jQuery));
