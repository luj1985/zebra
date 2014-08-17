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

    pages.on('touchstart', function(e) {
      e.preventDefault();
      var touch = e.originalEvent.touches[0];
      me.start(e.target, touch.pageX, touch.pageY);
    }).on('touchmove', function(e) {
      e.preventDefault();
      var touch = e.originalEvent.touches[0];
      me.move(e.target, touch.pageX, touch.pageY);
    }).on('touchend', function(e) {
      e.preventDefault();
      me.end(e.target);
    });
  };

  ZebraProto.start = function(view, x, y) {
    this.x0 = x;
    this.y0 = y;
    this.distance = 0;
    this.view = view;
  };

  ZebraProto.updateDirection = function(direction) {
    if (this.direction !== direction) {
      var next = this.nextView();
      next.animate(this.getCancelProps(this.direction), {
        complete : function() {
          next.addClass('hide').removeClass('active');
        }
      });
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

  ZebraProto.getCancelProps = function(direction) {
    return {
      north : { top : -this.height },
      south : { top : this.height },
      east : { left : this.width },
      west : { left : -this.width }
    }[direction];
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
      next.animate(this.getCancelProps(this.direction), {
        complete : function() {
          next.addClass('hide');
          next.removeClass('active');
        }
      });
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
