// constants
	const isIE = !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g);
	const isTouch = window.matchMedia("(any-pointer: coarse)").matches;

// function for smooth scroll
function nkSmoothscroll() {
	// options
	var settings = {
		Delta: 0.08, // for page parallax speed
		Delta1: 0.02, // for $pxElm parallax calculation
		Delta2: 0.1,  // for $pxElm parallax calculation
		fDelta : 0.5,
	};

// jqeury object
	var $window = $(window);
	var $body = $('body');
	var $parent = $('#nk-content');
	var $prlx = $('.nk-parallax');
	var $pxElm = $('.nk-px-elm');
	var windowOffset = 0;

// parallax Elements 
	var $pxElements = function(elm, offset, speed, margin){
		this.elm = elm;
		this.offset = offset !== undefined ? offset : 0;
		this.speed = speed !== undefined ? speed : 1;
		this.margin = margin !== undefined ? margin : 0;
		this.isIE = isIE;
		this.isTouch = isTouch;
	};
	$pxElements.prototype.update = function(windowOffset){
		if (!this.isTouch && !this.isIE) {
			this.offset += (windowOffset * settings.Delta1 * Number(this.speed) - this.offset) * settings.Delta2;
			plPos = Math.round(this.offset);
			this.elm.css({transform:'translateY(' + ( Number(this.margin) - Number(plPos) ) + 'px)  translateZ(0)'});
		}
	};

// smoothscroll Element
	var $root = function(elm, offset, speed, margin){
		this.elm = elm;		
		this.offset = offset !== undefined ? offset : 0;
		this.speed = speed !== undefined ? speed : 1;
		this.margin = margin !== undefined ? margin : 0;
		this.isIE = isIE;
		this.isTouch = isTouch;
	};
	
	$root.prototype.update = function(windowOffset){		
		if (!this.isTouch && !this.isIE) {
			this.offset += (windowOffset - this.offset) * settings.Delta;
			rPos = Math.round(this.offset);
			this.elm.css({transform:'translateY(' + (-rPos) + 'px) translateZ(0)'});
		}
	};
	$root.prototype.setcss = function(){
		
		if (!this.isTouch && !this.isIE) {
			this.elm.css({
				'width':'100%',
				'position':'fixed'
			});
		}else{
			this.elm.css({
				'width':'100%',
			});
		}
	};
	
	// parallax Object
	var $parallax = function(elm, offset, speed, margin){
		this.elm = elm;
		this.isIE = isIE;
		this.isTouch = isTouch;
	};	
	$parallax.prototype.setCuePoints = function(){
		this.cuePoints = [];
		var t = this;
		this.elm.each(function(e) {
			var section = {
				$el: $(this),
				y: 0,
				size: 0,
				offHeigth: 0,
				scale : 1,
				ratio : 0,
				enabled: !1
			};
			t.cuePoints.push(section);
		}); 
	};
	$parallax.prototype.cuePointsPos = function(){
		this.cuePoints.forEach(function(section) {
			section.size = Math.round(section.$el.outerHeight());
			section.offHeigth = $window.height() - section.size;
		});
	};
	$parallax.prototype.cuePointsResize = function(){
		this.cuePoints.forEach(function(section) {
			section.size = Math.round(section.$el.outerHeight());
			section.offHeigth = $window.height() - section.size;
		});
	};	
	$parallax.prototype.update = function(windowOffset){
		if (!this.isTouch && !this.isIE) {
			this.cuePoints.forEach(function(section) {
				
				section.y += windowOffset + section.offHeigth - section.$el.parent().offset().top - section.y;
				pPos = Math.round(section.y);
				
				// special animation for footer
				if(section.$el.hasClass('nk-footer')){
					pPos = Math.round((section.y)  * settings.fDelta );
				}
				// for fixed move set pPos to 0
				if(section.$el.hasClass('nk-attach')){
					pPos = pPos >= 0 ? 0 : pPos;
				}
				
				// scale factor for dom elements
				sFactor = section.scale;
				if(section.$el.hasClass('nk-scale') && -(pPos) <= $window.height() && -(pPos) >= 1 ){
					section.ratio = (pPos / ( $parent.height() - $window.height()));
					sFactor = 1 - (Math.round(1e3 * section.ratio) / 1e3);
				}
				
				section.$el.css({transform:'translateY(' + (pPos) + 'px) translateZ(0) scale(' + sFactor + ')'});
			});
		}
	};
	
	// make Object
	var nkScroll = function(){
		this.$pxElements = [];
		this.$root = '';
		this.windowHeight = 0;
		this.$parallax = '';
		this.isIE = isIE;
		this.isTouch = isTouch;
	};
	nkScroll.prototype = {
		init:function(){
			var t = this;
			t.setPageHeight();
			t.createElm();
			t.loop();
			
			window.addEventListener('resize', function(){
				t.onResize();
			});
		},
		createElm:function(){
			windowOffset = $window.scrollTop();
			this.$root = new $root($parent,0,1);
			this.$root.setcss();
			this.$parallax = new $parallax($prlx,0,1);
			this.$parallax.setCuePoints();
			this.$parallax.cuePointsPos();
			
			// parallax for inner elements
			this.pxElmArrayLength = $pxElm.length;
			for (var i = 0; i < this.pxElmArrayLength; i++) {
				var e = $pxElm.eq(i);
				var speed = e.data('speed');
				var margin = e.data('margin');
				this.$pxElements.push(new $pxElements(e,0,speed, margin));
			}
		},
		onResize:function(){
			this.setPageHeight();
			this.$parallax.cuePointsResize();
		},
		setPageHeight:function(){
			if (!this.isTouch && !this.isIE) {
				$body.height(Math.round($parent.outerHeight()));
			}else{
				$body.height('');
			}
		},
		smoothScroll:function(){
			windowOffset = $window.scrollTop();
			this.$root.update(windowOffset);
			this.$parallax.update(windowOffset);
			for (var i = 0; i < this.pxElmArrayLength; i++) {
				this.$pxElements[i].update(windowOffset);
			}
		},
		loop:function(){
			this.smoothScroll();
			window.requestAnimationFrame(this.loop.bind(this));
		}
	};
	// init Smooth Scroll
	$(function(){
		var nk = new nkScroll();
		nk.init();
	});

}

function videoPlay(){
	jQuery(document).on('click', '.play-btn ,.play-btn-responsive', function(){
		if(!$('#iframe').length) {
		   $('.i-frame-inner').html('<iframe id="iframe" src="http://office.3dwalknjudev.com/" scrolling="no" style="overflow: hidden"></iframe>');
		}
	});
	jQuery('.video-player-inner').mouseenter(function() {
			//jQuery('.play-btn').fadeIn();
			jQuery('.play-btn').css({"display":"block"});
		
	});
	jQuery('.video-frame-block').mouseleave(function() {
			//jQuery('.play-btn').fadeIn();
			jQuery('.play-btn').css({"display":"none"});
		
	});
	$(document).on('click', '.play-btn, .play-btn-responsive', function(){
		$('.iframe-block').fadeIn(200);
		jQuery('.frame-close-btn').fadeIn(400);
		$('.video-player-inner').fadeOut(400);
		jQuery('.play-btn, .play-btn-responsive').css({"visibility":"hidden"});
		
	});
	$(document).on('click', '.frame-close-btn', function(){
		$('.iframe-block').fadeOut(200);
		jQuery('.play-btn , .play-btn-responsive').css({"visibility":"visible"});
		
		$('.video-player-inner').fadeIn(400);
	});
}

function mousemove(){
	var mouseX = 0, mouseY = 0;
	$(document).mousemove(function(e){
	   mouseX = e.pageX;
	   mouseY = e.pageY; 
	});

	// cache the selector
	var follower = $(".play-btn");
	var xp = 0, yp = 0;
	var loop = setInterval(function(){
		// change 12 to alter damping higher is slower
		xp += (mouseX - xp) / 12;
		yp += (mouseY - yp) / 12;
		follower.css({left:xp, top:yp});
		
	}, 30);
}

/*
function mousemove(){
$(document).ready(function () {
    $(".video-frame-block").mousemove(function (e) {
        handleMouseMove(e);
    });
    function handleMouseMove(event) {
        var x = event.pageX;
        var y = event.pageY;

        $(".play-btn").animate({
            left: x,
            top: y
        }, 1);
    }
});
*/
function scrollDown(){
	$(document).on("click", ".play-btn ,.play-btn-responsive", function(){
		scrollPage(1);
	});
}
function scrollPage(index){
	$('html, body').animate({ scrollTop: $('.video-frame-block').eq(index - 1).offset().top}, 200, function(){
		triggerWp = 0;
		setTimeout(function(){didScroll = 0;}, 100);			
	});
}
// function for mobile header resize
function mHeaderResize() {
	$(window).on('scroll', function(){
		//if(jQuery(window).width() < 960){
			if(jQuery(window).scrollTop() > 50 && !jQuery('#header').hasClass('short-header')){
				jQuery('#header').addClass('short-header');
			}
			if(jQuery(window).scrollTop() < 50 && jQuery('#header').hasClass('short-header')){
				jQuery('#header').removeClass('short-header');
			}	
		//}
	});
}

 $(document).ready(function(){
	videoPlay();
	mousemove();
	scrollDown();
	mHeaderResize();
	nkSmoothscroll();
	
 });

