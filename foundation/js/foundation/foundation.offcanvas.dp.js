;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.offcanvas = {
    name : 'offcanvas',

    version : '5.1.0',

    settings : {},

    init : function (scope, method, options) {
      this.events();
    },

    events : function () {
      var S = this.S;

      S(this.scope).off('.offcanvas')
        .on('click.fndtn.offcanvas', '.left-off-canvas-toggle', function (e) {
          e.preventDefault();
          S(this).closest('.off-canvas-wrap').toggleClass('move-right');
        })
        .on('click.fndtn.offcanvas', '.exit-off-canvas', function (e) {
          e.preventDefault();
          S(".off-canvas-wrap").removeClass("move-right");
        })
        .on('click.fndtn.offcanvas', '.right-off-canvas-toggle', function (e) {
          e.preventDefault();
          S(this).closest(".off-canvas-wrap").toggleClass("move-left");
          
         // setTimeout("$('.right-off-canvas-toggle').toggleClass('hideit')",100);
  		 // setTimeout("$('.back-button').toggleClass('showit')",100);
          
          
        })
        .on('click.fndtn.offcanvas', '.exit-off-canvas', function (e) {
          e.preventDefault();
          S(".off-canvas-wrap").removeClass("move-left");
          
       //  setTimeout("$('.right-off-canvas-toggle').toggleClass('hideit')",0);
  	   // setTimeout("$('.back-button').toggleClass('showit')",100);
          
          
        });
    },

    reflow : function () {}
  };
}(jQuery, this, this.document));
