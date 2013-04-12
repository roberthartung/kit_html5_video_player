(function( $ )
{
  $.fn.hasAttr = function(attr)
  {
	var attr = this.attr(attr);
	return typeof attr !== 'undefined' && attr !== false
  }
 })(jQuery);
 
 /*
(function( $ )
{
	var global1 = 'foo1';
	
	var methods = {
		init : function()
		{
			_log('init');
			
			var global2 = 'foo2';
			
			return this.each(function()
			{
				var global3 = 'foo3';
				
				_log(this, global1, global2, global3);
				
				return 'test';
			});
		},
		doIt : function()
		{
			_log('doIt');
		}
	};
	
  $.fn.testPlugin = function(method)
  {
  	if ( methods[method] )
		{
		  return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if ( typeof method === 'object' || ! method )
		{
		  return methods.init.apply( this, arguments );
		}
		else
		{
		  $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}
  }
 })(jQuery);
 */

(function( $ )
{
  var methods = {
		init : function()
		{
			return this.each(function()
			{
				var that = $(this);
				var bar = that.find('.' + that.attr('class') + '-bar');
				
				var isSeeking = false;
				
				function seekFromEvent(e)
				{
					var offset = that.offset();
					var position = e.clientX - offset.left;
					seekFromWidth(position);
				}
				
				function seekFromWidth(w)
				{
					var width = that.width();
					
					if(w < 0)
						w = 0;
					else if(w > width)
						w = width;
					
					var percent = w / width;
					
					bar.css('width', (percent * 100) + '%');
					that.trigger('seek', [percent]);
				}
				
				that.on('mousedown', function(e)
				{
					e.preventDefault();
					
					$(document).on('mouseup.player', function(e)
					{
						e.preventDefault();
						// Clear mouseup event
						$(document).off('mouseup.player');
						
						//if(isSeeking)
						//{
							//isSeeking = false;
							that.trigger('endSeek');
							$(document).off('mousemove.player');
						//}
					});
					
					if(that.triggerHandler('beforeSeek', [e]) == false)
					{
						return;
					}
					
					$(document).on('mousemove.player', function(e)
					{
						//if(isSeeking)
						//{
							seekFromEvent(e);
						//}
					});
					
					isSeeking = true;
					that.trigger('beginSeek');
					seekFromEvent(e);
				});
				
			});
		},
		seek : function(p)
		{
			if(p < 0)
				p = 0;
			else if(p > 1)
				p = 1;
			
			return this.each(function()
			{
				var that = $(this);
				var bar = that.find('.' + that.attr('class') + '-bar');
				
				bar.css('width', (p * 100) + '%');
			});
		}
	}

	$.fn.seekSlider = function(method)
	{
		if ( methods[method] )
		{
		  return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if ( typeof method === 'object' || ! method )
		{
		  return methods.init.apply( this, arguments );
		}
		else
		{
		  $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}
	}
})(jQuery);
  
(function( $ )
{
  $.fn.player = function(conf)
  {
	var conf = $.extend(
	{
		width : null,
		height : null,
		debug : false,
      'controls'         : {
		play	:	true,
		mute	:	true
	  },
	  info : {
		time : {
			show_current : true
		}
	  },
	  playlist : [],
	  clip : null,
	  playing : false,
	  defaults : {
		volume : .75
	  },
	  skin : 'default',
	  tree : {
		default : {
			div_overlay : { },
			control_fullscreen : { },
			div_controls_bar : {
				div_controls : {
					control_timeline : { control_timeline_loaded : {}, control_timeline_progress : {} },
					control_volume : { control_volume_bar : {} },
					control_mute : { },
					control_play : { },
					control_time : { }
				}
			}
		},
		yt : {
			div_overlay : { },
			control_timeline : { control_timeline_loaded : {}, control_timeline_progress : '<div><a></a></div>' },
			div_controls_bar : {
				div_controls : {
					control_play : { },
					control_mute : { },
					control_volume : { control_volume_bar : {} },
					control_time : { control_time_played : {}, ' / ' : {}, control_time_total : {} },
					control_fullscreen : { }
				}
			}
		}
	  }
    }, conf);
	
	function _addDebugLine()
	{
		if($('#debug').length)
		{
			var old = $('#debug').text();
			$('#debug').text('');
			
			$(arguments).each(function(k,v)
			{
				if(typeof v == 'string')
				{
					$('#debug').text($('#debug').text() + (""+v) + ((""+v).length <= 4 ? "\t" : "") + ((""+v).length < 8 ? "\t" : "") + ((""+v).length < 12 ? "\t" : "") + ((""+v).length < 16 ? "\t" : "") + "\t");
				}
				else
				{
					$('#debug').text($('#debug').text() + (""+v) + ((""+v).length <= 4 ? "\t" : "") + "\t");
				}
			});
			
			 $('#debug').text($('#debug').text() + "\n" + old);
			
			//$('#debug').text($('#debug').text() + "\n");
			/*
			if(!$('#autoscroll').length || $('#autoscroll').is(':checked'))
				$('#debug').get(0).scrollTop = $('#debug').get(0).scrollHeight - $('#debug').get(0).offsetHeight;
				*/
			return true;
		}	
		return false;
	}
	
	function _log()
	{
		if(_addDebugLine.apply(this, arguments))
			return;
		
		if(typeof console != 'undefined' && conf.debug)
		{
			console.log.apply(console, arguments);
		}
	}
	
	function _info()
	{
		if(_addDebugLine.apply(this, arguments))
			return;
		
		if(typeof console != 'undefined' && conf.debug)
		{
			console.info.apply(console, arguments);
		}
	}
	
	function _error()
	{
		if(_addDebugLine.apply(this, arguments))
			return;
		
		if(typeof console != 'undefined')
		{
			if(typeof console.error == 'function')
			{
				console.error.apply(console, arguments);
			}
			else
			{
				//alert(arguments[0]);
			}
		}
	}
	
  return this.data('player') || this.each(function xxx()
	{
		var that = $(this);
		
		// Video Object
		var video = that.find('video').eq(0);
		var videoObject = video.get(0);
		var video_loop;
		var video_autoplay;
		var video_controls;
		var timeShowCurrent = conf.info.time.show_current ? 1 : 0; // 0 = remaining, 1 = current
		
		// Settings
		var width = conf.width;
		var height = conf.height;
		
		// Variables & States
		var isSeeking = false;
		var hasEnded = false;
		var wasPlaying = false;
		var clipIndex = null;
		var volume = conf.defaults.volume; // @TODO read from local storage?
		var nextAd = null;
		var overlay_positions = {};
		
		if(typeof localStorage != 'undefined')
		{
			volume = localStorage.getItem('volume');
			if(volume === null)
			{
				volume = conf.defaults.volume;
			}
		}
		
		var cuePointIndex = null;
		
		// Controls
		var div_wrapper = $('<div style="position: absolute; width: 640px; height: 280px;" class="wrapper"/>');
		var div_controls_bar = $('<div class="controls-bar"/>');
		var div_controls = $('<div class="controls"/>');
		var div_overlay = $('<div class="overlay"/>');
		var control_timeline = $('<div class="control-timeline"></div>');
		var control_mute = $('<i class="icon-white control-button-mute icon-volume-up"></i>');
		var control_play = $('<i class="icon-white control-button-play icon-play"></i>');
		var control_time = $('<span class="control-info-time"></span>');
		var control_time_left = $('<span class="control-info-time-left"></span>');
		var control_time_total = $('<span class="control-info-time-total"></span>');
		var control_time_played = $('<span class="control-info-time-played"></span>');
		var control_volume = $('<div class="control-volume"></div>');
		var control_volume_bar = $('<div class="control-volume-bar"></div>');
		var control_timeline_progress = $('<div class="control-timeline-bar"></div>');
		var control_timeline_loaded = $('<div class="control-timeline-loaded"></div>');
		//var control_volume_bar = control_timeline.find('.control-volume-bar');
		var control_fullscreen = $('<i class="icon-white control-fullscreen icon-resize-full"></i>');
		
		var divCollection = {
			div_wrapper : div_wrapper,
			div_controls_bar : div_controls_bar,
			div_controls : div_controls,
			div_overlay : div_overlay,
			control_timeline : control_timeline,
			control_timeline_loaded : control_timeline_loaded,
			control_timeline_progress : control_timeline_progress,
			control_mute : control_mute,
			control_play : control_play,
			control_time : control_time,
			control_volume : control_volume,
			control_volume_bar : control_volume_bar,
			control_fullscreen : control_fullscreen,
			control_time_left : control_time_left,
			control_time_total : control_time_total,
			control_time_played : control_time_played
		}
		
		var controlsHidden = false;
		
		
		
		div_wrapper.on('mouseout', function(e)
		{
			var height = div_controls_bar.height();
			
			if(!div_controls_bar.has('.control-timeline').length)
			{
				// @todo dot from timeline still visible
				height += control_timeline.height();
				
				control_timeline.delay(1000).animate({marginBottom:'-' + height + 'px'}, 500, function(){
					controlsHidden = true;
				});
			}
			
			div_controls_bar.delay(1000).animate({marginBottom:'-' + height + 'px'}, 500, function(){
				controlsHidden = true;
			});
		});
		
		function _fadeInControls()
		{
			if(controlsHidden)
			{
				div_controls_bar.animate({marginBottom:'0'}, function(){
					controlsHidden = false;
				});
				
				if(!div_controls_bar.has('.control-timeline').length)
				{
					control_timeline.animate({marginBottom:'0'}, function(){
						controlsHidden = false;
					});
				}
			}
		}
		
		function _cancelHide()
		{
			div_controls_bar.clearQueue();
			control_timeline.clearQueue();
		}
		
		div_wrapper.on('mouseover', _fadeInControls);
		div_controls.on('mouseover', _cancelHide);
		div_controls_bar.on('mouseover', _cancelHide);
		control_timeline.on('mouseover', _cancelHide);
		div_wrapper.on('mouseover', _cancelHide);
		
		// Set/Get Video-Container options
		video.css({position: 'absolute'});
		video_loop = video.hasAttr('loop');
		video_autoplay = video.hasAttr('autoplay');
		video_controls = video.hasAttr('controls');
		if(video_controls)
		{
			video.removeAttr('controls');
		}
		
		if(video_loop)
		{
			video.removeAttr('loop');
		}
		
		if(video_autoplay)
		{
			video.removeAttr('autoplay');
		}
		
		function _appendTree(obj, tree)
		{
			for(name in tree)
			{
				var _elem = divCollection[name];
				if(typeof _elem == 'undefined')
				{
					_elem = name;
				}
				
				obj.append(_elem);
				
				if(typeof tree[name] === 'string')
				{
					_elem.append(tree[name]);
					continue;
				}
				
				_appendTree(_elem, tree[name]);
			}
		}
		
		_appendTree(div_wrapper, conf.tree[conf.skin]);
		
		//that.append('<div style="clear: both;"></div>');
		that.append(div_wrapper);
		//that.append('<div style="clear: both;"></div>');
		//that.prepend('<div style="clear: both;"></div>');
		
		if(conf.skin == 'yt')
		{
			var control_volume_width = control_volume.width();
			
			control_volume.css('width', 0);
			control_mute.on('mouseover', function(e)
			{
				control_volume.clearQueue().animate({'width': control_volume_width + 'px'});
			});
			
			control_mute.on('mouseout', function(e)
			{
				control_volume.delay(1000).animate({'width': 0});
			});
			
			control_volume.on('mouseover', function(e)
			{
				control_volume.clearQueue().css('width', control_volume_width);
			});
			
			control_volume.on('mouseout', function(e)
			{
				control_volume.delay(1000).animate({'width': 0});
			});
		}
		
		div_overlay.hide();
		
		var controlMargin = (div_controls.outerWidth(true) - div_controls.innerWidth()) / 2;
		
		if(div_controls.has('.control-timeline').length)
		{
			control_timeline.css({
				left : control_play.outerWidth(true) + controlMargin,
				right : control_time.outerWidth(true) + control_mute.outerWidth(true) + control_volume.outerWidth(true) + controlMargin
			});
		}
		
		// API
		
		var player = {
			// ##### Variables
			// Current Clip that is actually played (not full clip object)
			clip : null,
			ad : false,
			overlay : false,
			fullscreen : false,
			waiting : false,
			// ##### Functions
			// load a new clip
			load : function(clip)
			{
				if(clip.src && clip.type && videoObject.canPlayType(clip.type) != '')
				{
					// valid clip found
					_info('loading clip ', clip.src, clip.type);
				}
				else if(clip.sources && clip.sources.length)
				{
					var src;
					if(src = getSrc(clip.sources))
					{
						//clip.src = {type : src.type, src : src.src};
						clip.src = src.src;
						clip.type = src.type;
					}
					else
					{
						_error('No clip found');
						return false;
					}
				}
				else
				{
					return false;
				}
				
				player.clip = clip;
				videoObject.src = player.clip.src;
				videoObject.load();
				
				// Check for cuepoints
				if(typeof clip.cuepoints == 'object' && clip.cuepoints.length > 0)
				{
					cuePointIndex = 0;
				}
				else
				{
					cuePointIndex = null;
				}
				
				// check for ads
				if(typeof clip.ads == 'object' && clip.ads.length > 0)
				{
					nextAd = 0;
					for(var a=0;a<clip.ads.length;a++)
					{
						if(typeof clip.ads[a].src != 'undefined')
						{
							continue;
						}
						
						if(typeof clip.ads[a].sources != 'undefined')
						{
							var src;
							
							if(src = getSrc(clip.ads[a].sources))
							{
								clip.ads[a].src = src.src;
								clip.ads[a].type = src.type;
							}
							
							continue;
						}
						
						delete clip.ads[a];
					}
					
					//_info('clip.ads:', clip.ads, 'nextAd:', nextAd);
				}
				else
				{
					nextAd = null;
				}
				
				return true;
			},
			addOverlayPosition : function(pos)
			{
				var position = {css:{}};
			
				if(typeof pos.bottom != 'undefined')
				{
					position.css.position = 'absolute';
					position.css.bottom = pos.bottom + div_controls_bar.outerHeight(true);
				}
				
				if(typeof pos.align != 'undefined')
				{
					if(pos.align == 'center')
					{
						position.css.left = '50%';
					}
				}
			
				overlay_positions[pos.id] = position;
			},
			hideTimeline : function()
			{
				control_timeline.hide();
			},
			showTimeline : function()
			{
				control_timeline.show();
			}
		};
		
		// ############ Helper Functions
		
		function _checkMuted()
		{
			if(videoObject.volume == 0)
			{
				control_mute.addClass('icon-volume-off').removeClass('icon-volume-up');
			}
			else
			{
				control_mute.removeClass('icon-volume-off').addClass('icon-volume-up');
			}
		}
		
		// set current volume level and store to 
		function _setVolume(v)
		{
			videoObject.volume = v;
			control_volume.seekSlider('seek', v);
			if(typeof localStorage != 'undefined')
			{
				localStorage.setItem('volume', v);
			}
		}
		
		function prepareOverlayPositions()
		{
			for(var p=0;p<conf.overlays.positions.length;p++)
			{
				player.addOverlayPosition(conf.overlays.positions[p]);
			}
		}
		
		/**
		 * Determines which sources are playable for a clip
		 *
		 * @param sources
		 *
		 * @return object null if no src is playable, object {src, type}
		 */
		
		function getSrc(sources)
		{
			var src = null;
			var support;
			for(var s = 0;s < sources.length; s++)
			{
				var _support = videoObject.canPlayType(sources[s].type);
				switch(_support)
				{
					case 'probably' :
						if(src == null || _support == 'maybe')
						{
							src = sources[s];
							support = 'probably';
						}
					break;
					case 'maybe' :
						if(src == null)
						{
							src = sources[s];
							support = 'maybe';
						}
					break;
				}
			}
		
			if(src == null)
			{
				return null;
			}
			
			return {type : src.type, src : src.src};
		}
		
		/**
		 * Sets the size of the player
		 */
		
		function setSize()
		{
			that.css({
				width : width,
				height : height
			});
			
			div_wrapper.css({
				width : width,
				height : height
			});
		}
		
		/**
		 * converts seconds to a timestamp
		 *
		 * @param int Seconds
		 * @param bool force hours in string 
		 *
		 * @return string
		 */
		
		function secondsToTime(s, forceHours)
		{
			s = Math.round(s);
			
			var forceHours = forceHours || false;
			
			var hours = Math.floor(s / (60 * 60));
			hours -= 60 * 60 * hours;
			
			var min = Math.floor(s / 60);
			s -= 60 * min;
			
			var str = '';
			
			if(hours > 0 || forceHours)
			{
				if(hours < 10)
				{
					hours = '0' + hours;
				}
				
				str += hours + ':';
			}
			
			if(min < 10)
			{
				min = '0' + min;
			}
			
			str += min;
			
			if(s < 10)
			{
				s = '0' + s;
			}
			
			return str + ':' + s;
		}
		
		/**
		 * increases the ad pointer or sets it to null if there are no more ads
		 */
		
		function _gotoNextAd()
		{
			nextAd++;
			if(nextAd >= player.clip.ads.length)
			{
				nextAd = null;
			}
		}
		
		/**
		 * call handler for check if we have to play an ad
		 */
		
		function _playNextAd(position)
		{
			if(nextAd != null)
				_log('_playNextAd(' + position + ')', nextAd, player.clip.ads[nextAd].position);
			
			if(nextAd != null && player.clip.ads[nextAd].position == position)
			{
				videoObject.src = player.clip.ads[nextAd].src;
				//video.attr('preload', 'metadata');
				//player.waiting = true;
				videoObject.load();
				videoObject.play();
				//video.attr('preload', 'none');
				// force waiting for play causes play() on event.canplay
				
				player.ad = player.clip.ads[nextAd];
				that.addClass('is-playing-ad');
				_gotoNextAd();
				return true;
			}
			
			return false;
		}
		
		function _finishAd()
		{
			player.ad = false;
			that.removeClass('is-playing-ad');
		}
		
		function requestFullscreen(e)
		{
			if(!player.fullscreen)
			{
				if (videoObject.requestFullscreen)
				{
				  that.get(0).requestFullscreen();
				}
				else if (videoObject.mozRequestFullScreen)
				{
				  that.get(0).mozRequestFullScreen();
				}
				else if (videoObject.webkitRequestFullscreen)
				{
				  that.get(0).webkitRequestFullscreen();
				}
			}
			else
			{
				if (document.cancelFullScreen)
				{
				  document.cancelFullScreen();
				}
				else if (document.mozCancelFullScreen)
				{
				  document.mozCancelFullScreen();
				}
				else if (document.webkitCancelFullScreen)
				{
				  document.webkitCancelFullScreen();
				}
			}
		}
		
		function _initialPlay()
		{
			if(!_playNextAd('pre-roll'))
			{
				videoObject.play();
			}
		}
		
		/*
		function _play()
		{
			_playNextAd('pre-roll');
			
			if(that.triggerHandler('beforeplay', [player]) != false)
			{
				//videoObject.play();
			}
			
		}
		*/
		
		function _pause()
		{
			if(that.triggerHandler('beforepause', [player]) != false)
			{
				videoObject.pause();
			}
		}
		
		// If width and height have been set in configuration
		// force width and height for the player as well
		if(width && height)
		{
			setSize();
			video.css({
				width : width,
				height : height
			});
		}
		else
		{
			if(conf.debug)
			{
				_info('applying width and height from video resolution');
			}
		}
		
		// ############ CONTROLS
		
		// ### Fullscreen
		control_fullscreen.on('click', requestFullscreen);
		that.on('dblclick', requestFullscreen);
		
		$(document).on('mozfullscreenchange webkitfullscreenchange fullscreenchange', function toggleFullscreen(e)
		{
			if(player.fullscreen)
			{
				player.fullscreen = false;
				that.removeClass('is-fullscreen');
				control_fullscreen.addClass('icon-resize-full').removeClass('icon-resize-small');
			}
			else
			{
				player.fullscreen = true;
				that.addClass('is-fullscreen');
				control_fullscreen.removeClass('icon-resize-full').addClass('icon-resize-small');
			}
		});
		
		// event.mozfullscreenerror
		// document.fullscreenElement
		// document.fullscreenEnabled
		
		// ### Play | control.play.click
		control_play.on('click', function(e)
		{
			e.preventDefault();
			//if(e.isTrigger)
			e.stopPropagation();
			if(videoObject.paused)
			{
				//_playNextAd('pre-roll');
				
				// @todo check state here
				if(player.ad || !_playNextAd('pre-roll'))
				{
					videoObject.play();
				}
				else
				{
					_error('Unexpected');
				}
			}
			else
			{
				_pause();
			}
		});
		
		// ### Mute
		
		control_mute.on('click', function(e)
		{
			e.preventDefault();
			if(!videoObject.volume)
			{
				// if the user has muted and reloads the page then the button will have no effect
				// that's why we set the volume back to default
				if(volume == 0)
				{
					volume = conf.defaults.volume;
				}
				//videoObject.volume = volume;
				_setVolume(volume);
				//control_mute.removeClass('icon-volume-off').addClass('icon-volume-up');
			}
			else
			{
				volume = videoObject.volume;
				//videoObject.volume = 0;
				//control_mute.removeClass('icon-volume-up').addClass('icon-volume-off');
				_setVolume(0);
			}
			
			control_volume.seekSlider('seek', videoObject.volume);
		});
		
		// ### Time
		control_time.on('click', function(e)
		{
			if(control_time.has('.control-info-time-total') || control_time.has('.control-info-time-left'))
				return;
		
			timeShowCurrent = timeShowCurrent ? 0 : 1;
			if(timeShowCurrent)
			{
				control_time.html(secondsToTime(videoObject.currentTime));
			}
			else
			{
				control_time.html(secondsToTime(videoObject.duration - videoObject.currentTime));
			}
		});
		
		div_controls_bar.on('dblclick', function(e)
		{
			e.stopPropagation();
			return false;
		});
		
		div_wrapper.on('click', function(e)
		{
			if(!$(e.target).is(div_wrapper))
				return;
		
			if(player.ad)
			{
				that.trigger('ad.click', [player]);
				window.open(player.ad.url);
			}
			else
			{
				control_play.trigger('click');
			}
		});
		
		// ### Timeline
		control_timeline
			.seekSlider()
			.on('beginSeek', function(e)
			{
				control_timeline_progress.stop();
				wasPlaying = !videoObject.paused;
				videoObject.pause();
			})
			.on('beforeSeek', function(e)
			{
				//_log('beforeSeek');
				e.stopPropagation();
				e.preventDefault();
				
				var ev = jQuery.Event('beforeseek');
				if(that.triggerHandler(ev, [player]) == false)
				{
					return false;
				}
				
				return true;
			})
			.on('seek', function(e, p)
			{
				if(p > 0.997)
				{
					p = 0.997;
				}
				var offset = videoObject.duration * p;
				videoObject.currentTime = offset;
			})
			.on('endSeek', function(e)
			{
				if(wasPlaying)
					videoObject.play();
			});
		
		// ### Volume Slider
		
		control_volume
			.seekSlider()
			.on('beginSeek', function(e)
			{
				control_volume_bar.stop();
			})
			.on('beforeSeek', function(e)
			{
				e.stopPropagation();
				e.preventDefault();
				if(that.triggerHandler('beforevolumechange', [e]) == false)
				{
					return false;
				}
				return true;
			})
			.on('seek', function(e, p)
			{
				_setVolume(p);
			});
		
		// ############ EVENTS
		
		// ### Loaded Meta Data
		
		video.on('loadedmetadata', function(e)
		{
			if(width == null)
			{
				 width = video.outerWidth();
			}
			
			if(height == null)
			{
				height = video.outerHeight();
			}
			
			videoObject.width = width;
			videoObject.height = height;
			
			setSize();
		});
		
		// ### Duration Change
		
		video.on('durationchange', function(e)
		{
			control_time_left.html(secondsToTime(videoObject.duration - videoObject.currentTime));
			control_time_played.html(secondsToTime(0));
			control_time_total.html(secondsToTime(videoObject.duration));
			
			if(!control_time.has('.control-info-time-total') && !control_time.has('.control-info-time-left') && !timeShowCurrent)
			{
				control_time.html(secondsToTime(videoObject.duration));
			}
		
			_info('[event.durationchange] duration = ', videoObject.duration);
		});
		
		// ### event.canplay @TODO
		video.on('canplay', function(e)
		{
			_info('[event.canplay]');
			if(player.waiting)
			{
				player.waiting = false;
				that.removeClass('waiting');
				videoObject.play();
			}
		})
		
		// ### event.emptied: Reset UI
		video.on('emptied', function(e)
		{
			_info('[event.emptied]');
			control_timeline.seekSlider('seek', 0);
		});
		
		// ### Event.Play
		
		video.on('play', function(e)
		{
			if(videoObject.currentTime)
			{
				that.trigger('resume', [player]);
			}
			else
			{
				that.trigger('play', [player]);
			}
			player.playing = true;
			// Switch to pause icon when in play mode
			$('.control-button-play').removeClass('icon-play').addClass('icon-pause');
		});
				
		// ### event.pause
		
		video.on('pause', function(e)
		{
			player.playing = false;
			
			that.trigger('pause', [player]);
			// Switch to play icon when in pause mode
			$('.control-button-play').removeClass('icon-pause').addClass('icon-play');
			// Stop animation for progress bar
			control_timeline_progress.stop();
		});
		
		function _playNextClip()
		{
			//_info('_playNextClip');
			// playlist
			if(clipIndex != null)
			{
				clipIndex++;
				// end of playlist already reached
				if(clipIndex >= conf.playlist.length)
				{
					clipIndex = 0;
					if(video_loop)
					{
						player.load(conf.playlist[clipIndex]);
						_initialPlay();
					}
				}
				else
				{
					player.load(conf.playlist[clipIndex]);
					_initialPlay();
				}
			}
			else
			{
				if(video_loop)
				{
					player.load(conf.clip);
					_initialPlay();
				}
			}
		}
		
		// ### event.ended
		
		video.on('ended', function(e)
		{
			_info('[event.ended]');
			hasEnded = true;
			that.trigger('ended', [player]);
			//that.trigger('ad.finish', [player, player.ad]);
			
			// clear overlays
			if(player.overlay)
			{
				player.overlay = false;
				div_overlay.hide();
				// remove ads from div
				div_overlay.find('>*').remove();
			}
			
			// we were playing a pre-, mid- or post-roll
			if(player.ad)
			{
				var _ad_position = player.ad.position;
				_finishAd();
				// the ad played was a mid-roll, resume the clip
				if(_ad_position == 'mid-roll')
				{
					// @todo resume clip
				}
				else if(_ad_position == 'pre-roll')
				{
					if(!_playNextAd('pre-roll'))
					{
						videoObject.src = player.clip.src;
						videoObject.load();
						videoObject.play();
					}
				}
				else if(_ad_position == 'post-roll')
				{
					if(!_playNextAd('post-roll'))
					{
						// we finished all ads
						// check for loop or next clip
						_playNextClip();
					}
				}
				else
				{
					_error('Position unknown');
				}
			}
			// we were playing the actual clip
			else
			{
				// we got 
				if(_playNextAd('post-roll'))
				{
					player.waiting = true;
					//videoObject.play();
				}
				else
				{
					_playNextClip();
				}
			}
			
			/*
			// we still got ads to show
			if(nextAd != null)
			{
				// we were in an ad
				// either we have more pre-rolls to show or the actual clip will follow now
				if(player.ad)
				{
					_log('[event.ended] was playing ad');
					player.ad = false;
					that.removeClass('is-playing-ad');
					
					// If we're not having a next pre-roll we need to show the actual clip
					if(!_playNextAd('pre-roll'))
					{
						videoObject.src = player.clip.src;
						videoObject.load();
						player.waiting = true;
					}
					// we got another ad, start it!
					else
					{
						player.waiting = true;
						//videoObject.play();
					}
				}
				// end of actual clip
				// we have to have post-roll ads, because nextAd != null
				else
				{
					// @TODO skip all overlays here because the clip played was the actual clip
					_log('[event.ended] actual clip is over, playing next post-roll');
					if(_playNextAd('post-roll'))
					{
						player.waiting = true;
						//videoObject.play();
					}
					else
					{
						_error('Oops - this state is unexpected!');
					}
				}
			}
			// no more ads to play
			else
			{
				// we were in an ad
				if(player.ad)
				{
					that.removeClass('is-playing-ad');
					player.ad = false;
				}
				
				// @TODO if we have no more post-roll ads -> check if we should loop!
				_info('[event.ended] no more ads for this clip');
				
				
			}
			
			_log('[event.ended]');
			*/
			
			control_timeline.seekSlider('seek', 1);
		});
		
		// ### Event.Seeking
		video.on('seeking', function(e)
		{
			//_log('[event.seeking]');
			//isSeeking = true;
		});
		
		// ### Event.Seeked
		video.on('seeked', function(e)
		{
			//isSeeking = false;
			var p = videoObject.currentTime / videoObject.duration;
			p *= 100;
			p = Math.round(p);
			//_log('[event.seeked] ', videoObject.currentTime, 's ', p, '%');
			control_timeline_progress.stop().css({width : p + '%'});
		});
		
		/* from flowplayer:s._trackEvent(
			"Video / Seconds played", // category
			t.engine + "/" + o.type, // action (html / video/mp4)
			n.attr("title") || o.src.split("/").slice(-1)[0].replace(d, ""), // label
			Math.round(i / 1e3) // value --> duration
		)*/
		
		// canplaythrough suspend abort emptied
		
		// timeupdate
		video.on('suspend abort progress loadstart stalled loadeddata loadedmetadata seeking seeked waiting playing ended error', function(e)
		{
			//console.log(e.type, e);
			_log(e.type, 'ready:', videoObject.readyState, 'network:', videoObject.networkState, 'buffered:', videoObject.buffered.length ? videoObject.buffered.end(0) : 'undefined', 'currentTime:', videoObject.currentTime);
			
			if(e.type == 'error')
			{
				_error('error:', videoObject.error.code);
			}
		});
		
		
		video.on('volumechange', function(e)
		{
			_info('[event.volumechange]', videoObject.volume);
			_checkMuted();
		});
		
		// Waiting
		video.on('waiting', function(e)
		{
			_info('[event.waiting]');
			player.waiting = true;
			that.addClass('waiting');
		});
		
		// Can play
		video.on('canplay', function(e)
		{
			if(player.waiting)
			{
				that.removeClass('waiting');
				player.waiting = false;
				//_play();
			}
		});
		
		// ### event.timeupdate --> Update bar + info time
		video.on('timeupdate', function(e)
		{
			if(control_time.has('.control-info-time-total') || control_time.has('.control-info-time-left'))
			{
				// control_time_total.val(videoObject.duration);
				control_time_left.html(secondsToTime(videoObject.duration - videoObject.currentTime));
				control_time_played.html(secondsToTime(videoObject.currentTime));
			}
			else if(timeShowCurrent)
			{
				control_time.html(secondsToTime(videoObject.currentTime));
			}
			// show remaining
			else
			{
				control_time.html(secondsToTime(videoObject.duration - videoObject.currentTime));
			}
			
			// if we're seeking, we dont want any cuepoints to be triggered
			if(isSeeking)
				return;
			
			player.clip.time = videoObject.currentTime;
			
			// If we have an index
			if(!player.ad && cuePointIndex != null && !videoObject.paused)
			{
				if(videoObject.currentTime >= player.clip.cuepoints[cuePointIndex])
				{
					that.trigger('cuepoint', [that, player.clip, player.clip.cuepoints[cuePointIndex]]);
					cuePointIndex++;
					
					if(cuePointIndex >= player.clip.cuepoints.length)
					{
						cuePointIndex= null;
						_log('[timeupdate] no more cuepoints');
					}
				}
			}
			
			if(player.overlay != false && player.overlay <= videoObject.currentTime)
			{
				div_overlay.find('>*').remove();
				div_overlay.hide();
				player.overlay = false;
			
				/*
				if(player.overlay.end.match())
				{
					
				}
				*/
			}
			
			if(!player.ad && nextAd != null)
			{
				var _ad = player.clip.ads[nextAd];
				var position = _ad.position;
				
				// check if the nextAd is an overlay and the ad should be displayed
				// @TODO check if end has not been reached (needed for seeking)
				if(position != 'pre-roll' && position != 'post-roll' && videoObject.currentTime >= _ad.begin)
				{
					var position_conf = overlay_positions[_ad.position]
					
					if(typeof overlay_positions[_ad.position] == 'object')
					{
						console.log(_ad);
						
						switch(_ad.type)
						{
							case 'swf' :
								var id = 'overlay-' + (new Date()).getTime();
								var adObject = $('<div/>');
								adObject.attr('id', id);
								div_overlay.append(adObject);
								swfobject.embedSWF(_ad.src, id, _ad.width, _ad.height, "9.0.0", "expressInstall.swf");
							break;
							default :
								if(_ad.type.match(/^video\/(.*)$/g))
								{
									var video = $('<video autoplay width="' + _ad.width + '" height="' + _ad.height + '"></video>')
									
									if(_ad.src)
									{
										video.attr('src', _ad.src);
									}
									else
									{
										var src = getSrc(_ad.sources);
										video.attr('src', src.src);
									}
									
									div_overlay.append(video);
								}
							break;
						}
						
						div_overlay.css(position_conf.css);
						div_overlay.css(
							 {
								width : _ad.width,
								height : _ad.height
							}
						);
						
						if(typeof position_conf.css.left != 'undefined')
						{
							div_overlay.css('marginLeft', -(_ad.width / 2));
						}
						div_overlay.show();
						
						if(typeof _ad.end != 'undefined')
						{
							var result;
							if(result = _ad.end.match(/^(\d*)\s?\%$/))
							{
								player.overlay = (result[1] / 100) * videoObject.duration;
							}
							else if(result = _ad.end.match(/^(\d*)$/))
							{
								player.overlay = result;
							}
							else
							{
								_info('Overlay end not correct');
							}
						}
						else if(typeof _ad.duration != 'undefined')
						{
							player.overlay = _ad.begin + _ad.duration;
						}
						else
						{
							player.overlay = videoObject.duration;
						}
						
						//console.log('player.overlay:', player.overlay);
					}
					
					/*
					for(var p=0;p<conf.overlays.positions.length;p++)
					{
						if(conf.overlays.positions[p].id == position)
						{
							pos = conf.overlays.positions[p];
							break;
						}
					}
					
					
					if(pos != null)
					{
						
					}
					*/
					
					// always goto next ad
					_gotoNextAd();
				}
			}
			
			var p = videoObject.currentTime / videoObject.duration;
			p *= 100;
			p = Math.round(p);
			control_timeline_progress.stop().animate({width : p + '%'}, 500, 'linear');
		});
		
		// update buffer
		video.on('progress loadeddata buffered', function(e)
		{
			control_timeline.find('.control-timeline-loaded').remove();
			
			if(!videoObject.buffered.length)
				return;
			
			var l = videoObject.buffered.length;
			var b;
			
			for(b=0;b<l;b++)
			{
				//console.log(e.type + ':', videoObject.buffered.start(b), videoObject.buffered.end(b), videoObject.currentTime);
				
				var start = videoObject.buffered.start(b);
				var end = videoObject.buffered.end(b);
				
				var bar_loaded = $('<div class="control-timeline-loaded"></div>');
				bar_loaded.css({
					position : 'absolute',
					left : (start / videoObject.duration) * 100 + '%',
					width : ((end - start) / videoObject.duration) * 100 + '%'
				});
				
				if(b == 0)	// first element
				{
					bar_loaded.addClass('first');
					
					if(l > 1 && Math.round(end * 100) / 100 == Math.round(videoObject.buffered.start(b+1) * 100) / 100) // we have a following element
					{
						bar_loaded.addClass('connect-right');
					}
				}
				else if(b == l-1) // last element
				{
					bar_loaded.addClass('last');
					
					if(b > 0 && Math.round(start * 100) / 100 == Math.round(videoObject.buffered.end(b-1) * 100) / 100) // we have a following element
					{
						bar_loaded.addClass('connect-left');
					}
				}
				else // between
				{
					if(b > 0 && Math.round(start * 100) / 100 == Math.round(videoObject.buffered.end(b-1) * 100) / 100) // we have a following element
					{
						bar_loaded.addClass('connect-left');
					}
					
					if(l > 1 && Math.round(end * 100) / 100 == Math.round(videoObject.buffered.start(b+1) * 100) / 100) // we have a following element
					{
						bar_loaded.addClass('connect-right');
					}
				}
				
				control_timeline.prepend(bar_loaded);
			}
			
			/*
			
			for(b=0;b<videoObject.buffered.length;b++)
			{
				
			}
			*/
			
			//var p = videoObject.buffered.end(0) / videoObject.duration;
			//p *= 100;
			//p = Math.round(p);
			
			//$('.control-timeline-loaded').stop().css({width:p + '%'});
		});
		
		// after all initializations are done, we can add the player
		that.data('player', player);
		
		// ########## Initialization
		
		// Check if HTML5 engine is available
		if(typeof videoObject.canPlayType == 'undefined')
		{
			that.addClass('error-unsupported');
			that.data('player', {error:'Not supported'});
			_error('HTML5 Video not supported in your Browser');
			return;
		}
		
		// if we have both: width and height, we can set the width and height
		
		// ############ Playlist & Clip
		
		// ### If the configuration has a playlist, we always use the first clip
		
		if(conf.playlist.length > 0)
		{
			clipIndex = 0;
			conf.clip = conf.playlist[clipIndex];
		}
		
		// ### If we have a clip, load the clip
		if(conf.clip != null)
		{
			// Load Clip via API (forces a reset of all variables)
			player.load(conf.clip);
		}
		
		// Check if clip was loaded
		if(player.clip != null)
		{
			// we got a clip
			if(conf.debug)
			{
				//console.info('[init] loading clip ', player.clip.src, ' (' + player.clip.type + ')');
			}
		}
		else
		{
			if(conf.debug)
			{
				//console.error('[init] no valid clip found');
			}
			
			return;
		}
		
		// player.overlay
		if(typeof conf.overlays != 'undefined')
		{
			if(typeof conf.overlays.positions != 'undefined' && conf.overlays.positions.length > 0)
			{
				prepareOverlayPositions();
			}
		}
		
		_setVolume(volume);
		
		if(video_autoplay)
		{
			// Trigger _play action
			_initialPlay();
		}
		
		// Analytics Events
		
		if(conf.analytics)
		{
			var tracker;
			
			function _loadTracker()
			{
				tracker = _gat._getTracker('UA-39348271-1');
				tracker._setDomainName('none');
			}
			
			if(typeof _gat == 'undefined')
			{
				$.getScript('//www.google-analytics.com/ga.js', _loadTracker);
			}
			else
			{
				_loadTracker();
			}
			
			function _trackEvent(action, value, implicit)
			{
				var category;
				var label;
				
				if(player.ad)
				{
					category = 'Ads / ' + player.ad.position;
					label = player.ad.title ? player.ad.title : player.ad.src;
				}
				else
				{
					category = 'Videos';
					label = player.clip.title ? player.clip.title : player.clip.src;
				}
				
				if(!value)
				{
					tracker._trackEvent(category, action, label);
				}
				else if(typeof implicit == 'undefined')
				{
					tracker._trackEvent(category, action, label, parseInt(value));
				}
				else
				{
					tracker._trackEvent(category, action, label, parseInt(value), implicit ? true : false);
				}
				
				
			}
			
			that.on('resume', function(e)
			{
				_trackEvent('Resume', player.clip.time);
				/*
				if(player.ad)
				{
					
					tracker._trackEvent("Ads / " + player.ad.position, "Resume", player.ad.title ? player.ad.title : player.ad.src, parseInt());
				}
				else
				{
					tracker._trackEvent("Videos", "Resume", player.clip.title ? player.clip.title : player.clip.src, parseInt(player.clip.time));
				}
				*/
			});
			
			that.on('ended', function(e)
			{
				_trackEvent('Finish', player.clip.time);
				/*
				if(player.ad)
				{
					tracker._trackEvent("Ads / " + player.ad.position, 'Finish', player.ad.title ? player.ad.title : player.ad.src, parseInt(player.clip.time));
				}
				else
				{
					tracker._trackEvent("Videos", 'Finish', player.clip.title ? player.clip.title : player.clip.src, parseInt(player.clip.time));
				}
				*/
			});
			
			that.on('ad.click', function(e)
			{
				if(player.ad)
				{
					_trackEvent('Click');
				}
			});
			
			$(window).on('unload', function(e)
			{
				// track event only if we have a clip and it has been played!
				if(player.clip && player.clip.time)
				{
					_trackEvent('Stop', player.clip.time);
				}
			});
		}
	});

  };
})(jQuery);