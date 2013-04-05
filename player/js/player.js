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
	  defaults : {
		volume : .75
	  }
    }, conf);
	
	function _log()
	{
		if(typeof console != 'undefined' && conf.debug)
		{
			console.log.apply(console, arguments);
		}
	}
	
	function _info()
	{
		if(typeof console != 'undefined' && conf.debug)
		{
			console.info.apply(console, arguments);
		}
	}
	
	function _error()
	{
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
		var control_timeline = $('<div class="control-timeline"><div class="control-timeline-loaded"></div><div class="control-timeline-bar"></div></div>');
		var control_mute = $('<i class="icon-white control-button-mute icon-volume-up"></i>');
		var control_play = $('<i class="icon-white control-button-play icon-play"></i>');
		var control_time = $('<span class="control-info-time">00:00</span>');
		var control_volume = $('<div class="control-volume"><div class="control-volume-bar"></div></div>');
		var control_timeline_progress = control_timeline.find('.control-timeline-bar');
		var control_timeline_loaded = control_timeline.find('.control-timeline-loaded');
		var control_volume_bar = control_timeline.find('.control-volume-bar');
		var control_fullscreen = $('<i class="icon-white control-fullscreen icon-resize-full"></i>');
		
		var divCollection = {
			div_wrapper : div_wrapper,
			div_controls_bar : div_controls_bar,
			div_controls : div_controls,
			div_overlay : div_overlay,
			control_timeline : control_timeline,
			control_mute : control_mute,
			control_play : control_play,
			control_time : control_time,
			control_volume : control_volume,
			control_fullscreen : control_fullscreen
		}
		
		// Set/Get Video-Container options
		video.css({position: 'absolute'});
		video_loop = video.hasAttr('loop');
		video_controls = video.hasAttr('controls');
		if(video_controls)
		{
			video.removeAttr('controls');
		}
		
		if(video_loop)
		{
			video.removeAttr('loop');
		}
		
		console.log('collection:', divCollection, divCollection['div_overlay']);
		
		var tree = {
			div_wrapper : {
				div_overlay : { },
				control_fullscreen : { },
				div_controls_bar : {
					div_controls : {
						control_timeline : { },
						control_volume : { },
						control_mute : { },
						control_play : { },
						control_time : { }
					}
				}
			}
		};
		
		function _appendTree(obj, root)
		{
			for(name in root)
			{
				obj.append(divCollection[name]);
				_appendTree(divCollection[name], root[name]);
			}
		}
		
		_appendTree(that, tree);
		
		// Append 
		/*
		div_wrapper.append(div_overlay);
		div_wrapper.append(control_fullscreen);
		div_wrapper.append(div_controls_bar);
		div_controls_bar.append(div_controls);
		div_controls.append(control_timeline);
		div_controls.append(control_volume);
		div_controls.append(control_mute);
		div_controls.append(control_play);
		div_controls.append(control_time);
		that.append(div_wrapper);
		*/
		
		div_overlay.hide();
		
		var controlMargin = (div_controls.outerWidth(true) - div_controls.innerWidth()) / 2;
		
		control_timeline.css({
			left : control_play.outerWidth(true) + controlMargin,
			right : control_time.outerWidth(true) + control_mute.outerWidth(true) + control_volume.outerWidth(true) + controlMargin
		});
		
		// API
		
		var player = {
			// ##### Variables
			// Current Clip that is actually played (not full clip object)
			clip : null,
			ad : false,
			overlay : false,
			fullscreen : false,
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
					/*var src = null;
					var support;
					for(var s = 0;s < clip.sources.length; s++)
					{
						var _support = videoObject.canPlayType(clip.sources[s].type);
						switch(_support)
						{
							case 'probably' :
								if(src == null || _support == 'maybe')
								{
									src = clip.sources[s];
									support = 'probably';
								}
							break;
							case 'maybe' :
								if(src == null)
								{
									src = clip.sources[s];
									support = 'maybe';
								}
							break;
						}
					}
				
					if(src == null)
					{
						return;
					}
					*/
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
					
					_info('clip.ads:', clip.ads, 'nextAd:', nextAd);
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
		
		function _setVolume(v)
		{
			videoObject.volume = v;
			control_volume.seekSlider('seek', v);
			if(typeof localStorage != 'undefined')
			{
				localStorage.setItem('volume', v);
			}
			
			if(v <= 0)
			{
				control_mute.addClass('icon-volume-off').removeClass('icon-volume-up');
			}
			else
			{
				control_mute.removeClass('icon-volume-off').addClass('icon-volume-up');
			}
		}
		
		function prepareOverlayPositions()
		{
			for(var p=0;p<conf.overlays.positions.length;p++)
			{
				player.addOverlayPosition(conf.overlays.positions[p]);
			}
		}
		
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
		
		function gotoNextAd()
		{
			nextAd++;
			if(nextAd >= player.clip.ads.length)
			{
				_log('no more ads');
				nextAd = null;
			}
		}
		
		function playNextAd(position)
		{
			if(nextAd != null)
				_log('playNextAd(' + position + ')', nextAd, player.clip.ads[nextAd].position);
			
			if(nextAd != null && player.clip.ads[nextAd].position == position)
			{
				videoObject.src = player.clip.ads[nextAd].src;
				player.ad = player.clip.ads[nextAd];
				that.addClass('is-playing-ad');
				gotoNextAd();
				return true;
			}
			
			return false;
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
		
		function _play()
		{
			playNextAd('pre-roll');
			if(that.triggerHandler('beforeplay', [player]) != false)
			{
				videoObject.play();
			}
		}
		
		function _pause()
		{
			if(that.triggerHandler('beforepause', [player]) != false)
			{
				videoObject.pause();
			}
		}
		
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
		
		// ########## Initialization
		
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
		
		// ### If we have a clip, check it's types
		
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
				window.open(player.ad.url);
			}
			else
			{
				control_play.trigger('click');
			}
		});
		
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
		
		_setVolume(volume);
		
		// event.mozfullscreenerror
		// document.fullscreenElement
		// document.fullscreenEnabled
		
		// ### Play
		control_play.on('click', function(e)
		{
			e.preventDefault();
			//if(e.isTrigger)
			e.stopPropagation();
			if(videoObject.paused)
			{
				_play();	
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
					_play();
			});
		
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
			
			if(conf.debug)
			{
				//console.info('[event.loadedmetadata] duration = ', videoObject.duration);
			}
			
			setSize();
		});
		
		// ### Duration Change
		
		video.on('durationchange', function(e)
		{
			if(!timeShowCurrent)
			{
				control_time.html(secondsToTime(videoObject.duration));
			}
		
			if(conf.debug)
			{
				//console.info('[event.durationchange] duration = ', videoObject.duration);
			}
		});
		
		// ### Event.Play
		
		video.on('play', function(e)
		{
			that.trigger('play', [player]);
			// Switch to pause icon when in play mode
			$('.control-button-play').removeClass('icon-play').addClass('icon-pause');
		});
				
		// ### event.pause
		
		video.on('pause', function(e)
		{
			that.trigger('pause', [player]);
			// Switch to play icon when in pause mode
			$('.control-button-play').removeClass('icon-pause').addClass('icon-play');
			// Stop animation for progress bar
			control_timeline_progress.stop();
		});
		
		// ### event.ended
		
		video.on('ended', function(e)
		{
			hasEnded = true;
			that.trigger('ended', [player]);
			
			if(player.overlay)
			{
				player.overlay = false;
				div_overlay.hide();
				// remove ads from div
				div_overlay.find('>*').remove();
			}
			
			// we still got ads to show
			if(nextAd != null)
			{
				// we were in an ad
				// either we have more pre-rolls to show or the actual clip will follow now
				if(player.ad)
				{
					_log('[ended] was playing ad');
					player.ad = false;
					that.removeClass('is-playing-ad');
					
					// If we're not having a next pre-roll add
					if(!playNextAd('pre-roll'))
					{
						videoObject.src = player.clip.src;
						videoObject.play();
					}
					// we got another ad, start it!
					else
					{
						videoObject.play();
					}
				}
				// end of actual clip
				// we have to have post-roll ads, because nextAd != null
				else
				{
					// @TODO skip all overlays here because the clip played was the actual clip
					_log('[ended] actual clip is over, playing next post-roll');
					if(playNextAd('post-roll'))
					{
						videoObject.play();
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
				_info('no more ads for this clip');
				
				if(clipIndex != null)
				{
					clipIndex++;
					if(clipIndex >= conf.playlist.length)
					{
						clipIndex = 0;
						if(video_loop)
						{
							player.load(conf.playlist[clipIndex]);
							_play();
						}
					}
					else
					{
						player.load(conf.playlist[clipIndex]);
						_play();
					}
				}
				else
				{
					if(video_loop)
					{
						_play();
					}
				}
			}
			
			_log('[event.ended]');
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
		
		// ### event.timeupdate
		video.on('timeupdate', function(e)
		{
			if(isSeeking)
				return;
			
			if(timeShowCurrent)
			{
				control_time.html(secondsToTime(videoObject.currentTime));
			}
			// show remaining
			else
			{
				control_time.html(secondsToTime(videoObject.duration - videoObject.currentTime));
			}
			
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
						var id = 'overlay-' + (new Date()).getTime();
						var adObject = $('<div/>');
						adObject.attr('id', id);
						div_overlay.append(adObject);
						swfobject.embedSWF("ad.swf", id, _ad.width, _ad.height, "9.0.0", "expressInstall.swf");
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
					gotoNextAd();
				}
			}
			
			var p = videoObject.currentTime / videoObject.duration;
			p *= 100;
			p = Math.round(p);
			control_timeline_progress.stop().animate({width : p + '%'}, 500, 'linear');
		});
		
		video.on('progress', function(e)
		{
			if(!videoObject.buffered.length)
				return;
			
			var p = videoObject.buffered.end(0) / videoObject.duration;
			p *= 100;
			p = Math.round(p);
			
			$('.control-timeline-loaded').stop().css({width:p + '%'});
		});
		
		// after all initializations are done, we can add the player
		that.data('player', player);
	});

  };
})(jQuery);