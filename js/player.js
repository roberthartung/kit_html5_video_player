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
		init : function(conf)
		{
			var conf = $.extend(
			{
				orientation : 'horizontal'
			}, conf);
		
			return this.each(function()
			{
				var that = $(this);
				that.data('orientation', conf.orientation);
				
				var bar = that.find('.' + that.attr('class') + '-bar');
				
				var isSeeking = false;
				
				function seekFromEvent(e)
				{
					var offset = that.offset();
					// e.clientX
					if(that.data('orientation') == 'horizontal')
					{
						seekFromWidth(e.pageX - offset.left);
					}
					else
					{
						seekFromHeight(e.pageY - offset.top);
					}
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
				
				function seekFromHeight(h)
				{
					var height = that.height();
					
					if(h < 0)
						h = 0;
					else if(h > height)
						h = height;
					
					var percent = 1 - h / height;
					
					bar.css('height', (percent * 100) + '%');
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
					
					if(that.triggerHandler('beforeSeek') == false)
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
		orientation : function(d)
		{
			return this.each(function()
			{
				$(this).data('orientation', d);
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
				
				if(that.data('orientation') == 'horizontal')
				{
					bar.css('width', (p * 100) + '%');
				}
				else
				{
					bar.css('height', (p * 100) + '%');
				}
			});
		}
	}

	$.fn.seekSlider = function(method)
	{
		if ( methods[method] )
		{
		  return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if ( typeof method === 'object' || !method )
		{
		  return methods.init.apply( this, arguments );
		}
		else
		{
		  $.error( 'Method ' +  method + ' does not exist' );
		}
	}
})(jQuery);
  
(function( $ )
{
	var _scripts = document.getElementsByTagName('script');
	var _script = _scripts[_scripts.length - 1];
	var _script_path = $(_script).attr('src').split('/');
	_script_path.pop();
	var _script_path_js = _script_path.join('/') + '/';
	if(_script_path[_script_path.length-1] == 'js')
	{
		_script_path.pop();
		_script_path.push('css');
		var _script_path_css = _script_path.join('/') + '/';
	}
	else
	{
		var _script_path_css = _script_path_js;
	}
	
  $.fn.kit_HTML5VideoPlayer = function(conf)
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
	  indicateAds : false
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
		
		if(typeof console != 'undefined' && conf.debug && console.log && console.log.apply)
		{
			console.log.apply(console, arguments);
		}
	}
	
	function _info()
	{
		if(_addDebugLine.apply(this, arguments))
			return;
		
		if(typeof console != 'undefined' && conf.debug && console.info && console.info.apply)
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
			if(typeof console.error == 'function' && console.error && console.error.apply)
			{
				console.error.apply(console, arguments);
			}
			else
			{
				//alert(arguments[0]);
			}
		}
	}
	
	return this.data('player') || this.each(function()
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
		var adAnnotations = [];
		
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
		var div_contents = $('<div class="contents"><ol></ol></div>');
		var div_overlay = $('<div class="overlay"/>');
		var control_timeline = $('<div class="control-timeline"></div>');
		var control_timeline_elements = $('<div class="control-timeline-elements"></div>');
		var control_mute = $('<i class="icon-white control-button-mute icon-volume-up"></i>');
		var control_play = $('<i class="icon-white control-button-play icon-play"></i>');
		var control_time = $('<span class="control-info-time"></span>');
		var control_time_left = $('<span class="control-info-time-left"></span>');
		var control_time_total = $('<span class="control-info-time-total"></span>');
		var control_time_played = $('<span class="control-info-time-played"></span>');
		var control_volume = $('<div class="control-volume"></div>');
		var control_volume_bar = $('<div class="control-volume-bar"></div>');
		var control_timeline_progress = $('<div class="control-timeline-bar"></div>');
		var control_timeline_caret = $('<div class="kit-player-timeline-caret"><a></a></div>');
		var control_volume_caret = $('<div class="kit-player-volume-caret"><a></a></div>');
		// @deprecated: var control_timeline_loaded = $('<div class="control-timeline-loaded"></div>');
		//var control_volume_bar = control_timeline.find('.control-volume-bar');
		var control_fullscreen = $('<i class="icon-white control-fullscreen icon-resize-full"></i>');
		var div_info_clip_title = $('<div class="info-clip-title"></div>');
		var control_settings = $('<i class="icon-white control-settings icon-cog"></i>');
		var indicator_loading = $('<i class="indicator-loading icon-spinner icon-spin icon-2x"></i>');
		
		var divCollection = {
			div_wrapper : div_wrapper,
			div_controls_bar : div_controls_bar,
			div_controls : div_controls,
			div_overlay : div_overlay,
			div_contents : div_contents,
			div_info_clip_title : div_info_clip_title,
			control_timeline : control_timeline,
			//@deprecated: control_timeline_loaded : control_timeline_loaded,
			control_timeline_progress : control_timeline_progress,
			control_mute : control_mute,
			control_play : control_play,
			control_time : control_time,
			control_volume : control_volume,
			control_volume_bar : control_volume_bar,
			control_fullscreen : control_fullscreen,
			control_time_left : control_time_left,
			control_time_total : control_time_total,
			control_time_played : control_time_played,
			control_settings : control_settings,
			indicator_loading : indicator_loading,
			control_timeline_elements : control_timeline_elements,
			control_timeline_caret : control_timeline_caret,
			control_volume_caret : control_volume_caret
		}
		
		/*
		//$(this).tooltip({animate:false,delay:0,title:0,trigger:'manual'});
		
		// Show seek time above timeline
		var last = null;
		*/
		
		var features = {
			timeAnnotation : {
				lastAnnotation : null,
				init : function()
				{
					var that = this;
					control_timeline.on('mousemove.timeAnnotation', function(e)
					{
						var offset = $(this).offset();
						
						var p = (e.pageX - offset.left) / $(this).width();
						
						var val = Math.round(p * videoObject.duration);
						if(val != that.lastAnnotation)
						{
							that.lastAnnotation = val;
							$(this).tooltip('destroy');
							$(this).tooltip({animate:false,title:val,trigger:'manual'}).tooltip('show');
						}
						var tooltip = $(this).siblings('.tooltip');
						tooltip.css('left', e.pageX - offset.left - tooltip.outerWidth()/2);
					});
					
					control_timeline.on('mouseout.timeAnnotation', function()
					{
						$(this).tooltip('destroy');
						that.lastAnnotation = null;
					});
				},
				destroy : function()
				{
					control_timeline.off('mousemove.timeAnnotation');
					control_timeline.off('mouseout.timeAnnotation');
				}
			},
			fadingControls : {
				controlVolumeWidth : null,
				isFading : false,
				forceFade : false,
				fadeIn : function(e)
				{
					var that = (e && e.data.that) || this;
					//console.log('fadeIn()', div_controls_bar.is(':hidden'), that.isFading);
					if(!that.isFading && (that.forceFade || div_controls_bar.is(':hidden')))
					{
						that.forceFade = false;
						div_controls_bar.show();
						that.isFading = 3;
						div_controls_bar.animate({marginBottom:'0'}, function(){
							that.isFading--;
							control_timeline.hide();
							control_timeline.show();
						});
						
						if(!div_controls_bar.has('.control-timeline').length)
						{
							control_timeline.show();
							control_timeline.animate({marginBottom:'0'}, function(){
								that.isFading--;
							});
						}
						
						div_info_clip_title.show();
						div_info_clip_title.animate({marginTop:0}, 500, function(){
							that.isFading--;
						});
					}
				},
				fadeOut : function(e)
				{
					var that = (e && e.data.that) || this;
					//console.log('fadeOut()', that.isFading);
					//if(!that.isFading)
					//{
						that.isFading = 3;
						var height = div_controls_bar.outerHeight();
						
						if(!div_controls_bar.has('.control-timeline').length)
						{
							// @todo dot from timeline still visible
							height += control_timeline.outerHeight();
							
							control_timeline.delay(1000).animate({marginBottom:'-' + height + 'px'}, 500, function(){
								control_timeline.hide();
								that.isFading--;
							});
						}
						
						div_controls_bar.delay(1000).animate({marginBottom:'-' + height + 'px'}, 500, function(){
							div_controls_bar.hide();
							that.isFading--;
						});
						
						var height_info = div_info_clip_title.outerHeight();
						div_info_clip_title.delay(1000).animate({marginTop:'-' + height_info + 'px'}, 500, function(){
							$(this).hide();
							that.isFading--;
						});
					//}
				},
				cancelFade : function(e)
				{
					// clear queue + stop animation
					div_controls_bar.stop(true);
					control_timeline.stop(true);
					div_info_clip_title.stop(true);
					
					var that = (e && e.data.that) || this;
					
					control_timeline.show();
					div_controls_bar.show();
					div_info_clip_title.show();
					that.isFading = 0;
					that.forceFade = true;
					that.fadeIn();
				},
				init : function()
				{
					var that = this;
					//console.log(this);
					that.controlVolumeWidth = control_volume.width();
					control_volume.css('width', 0);
					
					div_wrapper.on('mousemove.fadingControls', {that:this}, this.fadeIn);
					div_wrapper.on('mouseover.fadingControls', {that:this}, this.fadeIn);
					div_wrapper.on('mouseout.fadingControls', {that:this}, this.fadeOut);
					div_controls.on('mouseover.fadingControls', {that:this}, this.cancelFade);
					div_controls_bar.on('mouseover.fadingControls', {that:this}, this.cancelFade);
					control_timeline.on('mouseover.fadingControls', {that:this}, this.cancelFade);
					div_wrapper.on('mouseover.fadingControls', {that:this}, this.cancelFade);
					
					control_mute.on('mouseover.fadingControls', function(e)
					{
						control_volume.clearQueue().animate({'width': that.controlVolumeWidth + 'px'});
					});
					
					control_mute.on('mouseout.fadingControls', function(e)
					{
						control_volume.delay(1000).animate({'width': 0});
					});
					
					control_volume.on('mouseover.fadingControls', function(e)
					{
						control_volume.clearQueue().css('width', that.controlVolumeWidth);
					});
					
					control_volume.on('mouseout.fadingControls', function(e)
					{
						control_volume.delay(1000).animate({'width': 0});
					});
				},
				destroy : function()
				{
					control_volume.css('width', '');
					div_wrapper.off('.fadingControls');
					div_controls.off('.fadingControls');
					div_controls_bar.off('.fadingControls');
					control_timeline.off('.fadingControls');
					control_mute.off('.fadingControls');
					control_volume.off('.fadingControls');
					this.cancelFade();
				}
			},
			indentTimeline : {
				init : function()
				{
					var that = this;
					var left = 0;
					var right = 0;
					control_timeline.siblings().each(function()
					{
						$this = $(this);
						switch($this.css('cssFloat'))
						{
							case 'left' :
								left += $this.outerWidth(true);
							break;
							case 'right' :
								right += $this.outerWidth(true);
							break;
						}
					});
					
					var controlMargin = (div_controls.outerWidth(true) - div_controls.innerWidth()) / 2;
				
					control_timeline.css({
						left : left + controlMargin,
						right : right + controlMargin
					});
				},
				destroy : function()
				{
					control_timeline.css({
						left : '',
						right : ''
					});
				}
			},
			topVolumeBar : {
				init : function()
				{
					control_volume.seekSlider('orientation', 'vertical');
					control_volume.hide();
					control_mute.on("mouseover.topVolumeBar", function(e)
					{
						var position = control_mute.position();
						control_volume.css({
							bottom : control_mute.outerHeight(),
							right : div_wrapper.width() - (position.left + control_mute.outerWidth(true)) + (control_mute.outerWidth(true) - control_mute.outerWidth()) / 2,
							width : control_mute.outerWidth()
						});
						control_volume.show();
					});
					
					control_mute.on("mouseout.topVolumeBar", function(e)
					{
						control_volume.hide();
				 	});
				 	
				 	control_volume.on("mouseover.topVolumeBar", function(e){
				 		$(this).show();
				 	});
				 	
				 	control_volume.on("mouseout.topVolumeBar", function(e){
				 		$(this).hide();
				 	});
				},
				destroy : function()
				{
					control_volume.show();
					control_volume.seekSlider('orientation', 'horizontal');
					control_mute.off('.topVolumeBar');
					control_volume.off('.topVolumeBar');
				}
			}
		};
		
		/**
		 * skins
		 */
		
		var skins = {
			/**
			 * skin.default
			 */
			'default' : {
				name : 'default',
				features : ['indentTimeline'],
				tree : {
					div_overlay : { },
					control_fullscreen : { },
					div_controls_bar : {
						div_controls : {
							control_timeline : { control_timeline_elements : {  /* control_timeline_loaded : {}, */control_timeline_progress : {} } },
							control_volume : { control_volume_bar : {} },
							control_mute : { },
							control_play : { },
							control_time : { }
						}
					}
				},
				init : function()
				{
					/*
					var controlMargin = (div_controls.outerWidth(true) - div_controls.innerWidth()) / 2;
				
					control_timeline.css({
						left : control_play.outerWidth(true) + controlMargin,
						right : control_time.outerWidth(true) + control_mute.outerWidth(true) + control_volume.outerWidth(true) + controlMargin
					})
					*/;
				},
				destroy : function()
				{
					/*
					control_timeline.css({
						left : '',
						right : ''
					});
					*/
				}
			},
			/**
			 * skin.yt
			 */
			yt : {
				name : 'yt',
				features : ['timeAnnotation', 'fadingControls'],
				tree : {
					div_info_clip_title : {},
					div_overlay : {},
					indicator_loading : {},
					div_contents : {},
					control_timeline : { control_timeline_elements : { control_timeline_progress : { control_timeline_caret : {} } } }, // '<div><a></a></div>'
					div_controls_bar : {
						div_controls : {
							control_play : {},
							control_mute : {},
							control_volume : { control_volume_bar : {} },
							control_fullscreen : { },
							control_settings : {},
							control_time : { control_time_played : {}, '<span> / </span>' : {}, control_time_total : {} }
						}
					}
				},
				init : function()
				{
					//console.log('cssFloat', control_play.css('cssFloat'));
				},
				destroy : function()
				{
					
				}
			},
			/**
			 * skin.flat
			 */
			 flat : {
				name : 'flat',
				features : ['indentTimeline', 'topVolumeBar'],
				tree : {
					div_overlay : { },
					div_controls_bar : {
						div_controls : {
							control_timeline : { control_timeline_elements : { control_timeline_progress : { control_timeline_caret : '<i class=" icon-angle-left"></i><i class=" icon-angle-right"></i>' } } },
							control_volume : { control_volume_bar : {} },
							control_fullscreen : { },
							control_play : { },
							control_mute : { },
							control_time : { }
						}
					}
				},
				init : function()
				{
					
				},
				destroy : function()
				{
					
				}
			 },
			 /**
			 * skin.bubbles
			 */
			 bubbles : {
				name : 'bubbles',
				features : ['indentTimeline'],
				tree : {
					div_overlay : { },
					div_controls_bar : {
						div_controls : {
							control_timeline : { control_timeline_elements : { control_timeline_progress : { control_timeline_caret : {} } } },
							control_volume : { control_volume_bar : {} },
							control_mute : { },
							control_play : { },
							control_time : { },
							control_fullscreen : { }
						}
					}
				},
				init : function()
				{
					
				},
				destroy : function()
				{
					
				}
			 }
		}
		
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
					// this inserts the new DOM element to the very inner child element instead of appending it to the first element
					// this is needed for the control_timeline_caret to insert icons etc
					_elem.data('children', $(tree[name]));
					_elem.find('*:not(:has("*"))').append(_elem.data('children'));
					continue;
				}
				
				_appendTree(_elem, tree[name]);
			}
		}
		
		function _removeTree(obj, tree)
		{	
			for(name in tree)
			{
				var _elem = divCollection[name];
				
				// this is a valid element - not a string or sth
				if(typeof _elem != 'undefined')
				{
					// type is object - so we might have more children to remove
					if(typeof tree[name] != 'string')
					{
						_removeTree(_elem, tree[name]);
					}
					// we inserted a string
					else
					{
						_elem.find(_elem.data('children')).detach();
					}
					
					obj.find(_elem).detach();
				}
				// name was a string that was appended
				else
				{
					obj.children().first().detach();
				}
			}
		}
		
		// API + Player Object
		
		var skin = null;
		
		/**
		 * Player object and API for the user
		 */
		
		var player = {
			// ##### Variables
			// Current Clip that is actually played (not full clip object)
			clip : null,
			skin : null,
			ad : false,
			overlay : false,
			fullscreen : false,
			waiting : false,
			// ##### Functions
			// load a new playlist
			loadPlaylist : function(pl)
			{
				clipIndex = 0;
				conf.playlist = pl;
				player.load(conf.playlist[clipIndex]);
			},
			loadSkin : function(_skinName)
			{
				if(typeof skins[_skinName] == 'undefined')
				{
					_error('Skin "' + _skinName + '" not found.');
					return null;
				}
			
				if(player.skin != null)
				{
					if(player.skin == _skinName)
						return false;
					
					that.removeClass('skin-' + player.skin);
					// @todo remove old tree recursively
					_removeTree(div_wrapper, skins[player.skin].tree);
					skin.destroy();
					$(skin.features).each(function()
					{
						features[this].destroy();
					});
					// div_wrapper.children().remove();
					that.trigger('skinchanged', [player]);
				}
				
				player.skin = _skinName;
				skin = skins[player.skin];
				_appendTree(div_wrapper, skin.tree);
				that.addClass('skin-' + _skinName);
				skin.init();
				
				$(skin.features).each(function()
				{
					features[this].init();
				});
				
				// @fix: Chrome has problems displaying timeline after skin switching - so we force a rerender here
				// hide().show() has no effect, so simply use hide + fadeIn here
				div_wrapper.hide().fadeIn(1);
				
				/*
				control_timeline.find('.control-timeline-loaded').each(function()
				{
					var left = $(this).css('left');
					if(left == '0px')
					{
						$(this).css('left', 'auto');
					}
					else
					{
						$(this).css('left', '0px');
					}
					
					$(this).css('left', left);
				});
				
				control_timeline.find('.annotation-ad').each(function()
				{
					var left = $(this).css('left');
					if(left == '0px')
					{
						$(this).css('left', 'auto');
					}
					else
					{
						$(this).css('left', '0px');
					}
					
					$(this).css('left', left);
				});
				*/
				
				return true;
			},
			// load a new clip
			load : function(clip)
			{
				//console.log('clip', clip);
				adAnnotations = [];
				if(!videoObject.paused)
				{
					videoObject.pause();
				}
			
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
						clip.type = src.type;
						
						if(src.resolutions)
						{
							var resolution = '1080p';
							
							var clipSupportsDefaultResolution = false;
							$.each(src.resolutions, function(k, v)
							{
								if(k == resolution)
								{
									clipSupportsDefaultResolution = true;
								}
							});
							
							if(!clipSupportsDefaultResolution)
							{
								for(resolution in src.resolutions)
									break;
							}
							
							clip.resolution = resolution;
							clip.resolutions = src.resolutions;
							clip.src = src.resolutions[clip.resolution];
						}
						else
						{
							clip.src = src.src;
						}
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
				
				div_info_clip_title.html(clip.title);
				div_wrapper.find('.kit-player-settings').remove();
				
				// Check for cuepoints
				if(typeof clip.cuepoints == 'object' && clip.cuepoints.length > 0)
				{
					cuePointIndex = 0;
				}
				else
				{
					cuePointIndex = null;
				}
				
				// always disable current ad
				_finishAd();
				// check for ads
				if(typeof clip.ads == 'object' && clip.ads.length > 0)
				{
					nextAd = 0;
					for(var a = 0; a < clip.ads.length; a++)
					{
						if(!clip.ads[a].position.match(/^(pre|post)-roll$/g))
						{
							adAnnotations.push(clip.ads[a]);
						}
					
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
				}
				else
				{
					nextAd = null;
				}
				
				if(clip.contents && clip.contents.length > 0)
				{
					div_contents.find('li').remove();
					div_contents.show();
					var content_li_width = (1 / clip.contents.length) * 100;
					for(var c=0;c<clip.contents.length;c++)
					{
						//console.log(clip.contents);
						var li_content = $('<li><a data-time="' + clip.contents[c].time + '">' + clip.contents[c].title + '</a></li>');
						li_content.css('width', content_li_width + '%');
						div_contents.find('ol').append(li_content);
					}
				}
				else
				{
					div_contents.hide();
					player.contents = [];
				}
				
				player.clip = clip;
				that.trigger('load', [player]);
				//console.log('player.clip', player.clip);
				//console.log('player.clip.src', player.clip.src);
				videoObject.src = player.clip.src;
				videoObject.load();
				
				//videoObject.playbackRate = 1.5;
				
				return true;
			},
			addOverlayPosition : function(pos)
			{
				var position = {css:{},width:pos.width,height:pos.height};
			
				if(typeof pos.bottom != 'undefined')
				{
					position.css.position = 'absolute';
					position.css.bottom = pos.bottom + div_controls_bar.outerHeight(true);
					
					if(!div_controls_bar.has('.control-timeline').length)
					{
						position.css.bottom += control_timeline.outerHeight(true);
					}
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
		
		// Check if HTML5 engine is available
		if(typeof videoObject.canPlayType == 'undefined')
		{
			that.addClass('error-unsupported');
			that.data('player', {error:'Not supported'});
			_error('HTML5 Video not supported in your Browser');
			return;
		}
		
		that.append(div_wrapper);
		
		div_overlay.hide();
		
		// Skin configuration
		
		// only assign the skin name to the API
		
		// has to be done before the skin is loaded
		control_timeline.seekSlider();
		control_volume.seekSlider();
		
		player.loadSkin(conf.skin);
		
		
		
		/*
		$('head').eq(0)
			.prepend($('<link rel="stylesheet" href="' + _script_path_css + 'player.skin.' + conf.skin + '.css" type="text/css"/>').on('readystatechange', function()
			{
				console.log('statechange');
			}))
			.prepend('<link rel="stylesheet" href="' + _script_path_css + 'player.basic.css" type="text/css"/>');
		*/
		
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
			
			if(typeof src.resolutions != 'undefined')
			{
				for(var key in src.resolutions)
					break;
				return {type : src.type, resolutions : src.resolutions, src : src.resolutions[key]};
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
		
		var _waitPlay;
		var _resumeTime;
		
		/**
		 * call handler for check if we have to play an ad
		 */
		
		function _playNextAd(position)
		{
			if(nextAd != null && player.clip.ads[nextAd].position == position)
			{
				_log('_playNextAd(' + position + ')', nextAd, player.clip.ads[nextAd].position);
				player.ad = player.clip.ads[nextAd];
				that.trigger('load', [player]);
				//videoObject.pause();
				videoObject.src = player.ad.src;
				videoObject.load();
				_waitPlay = true;
				
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
		
		// ### settings
		
		control_settings.on('click', function(e)
		{
			if(!div_wrapper.has('.kit-player-settings').length)
			{
				var settings = $('<div class="kit-player-settings"></div>');
				settings.hide();
				
				for(var resolution in player.clip.resolutions)
				{
					var r = $('<a data-resolution="' + resolution + '"><i class="icon-circle"></i> ' + resolution + '</a>');
					if(resolution == player.clip.resolution)
						r.addClass('active');
					settings.prepend(r);
				}
				
				//settings.append('<a><i class="icon-circle"></i> 1080p</a><a><i class="icon-circle"></i> 720p</a><a><i class="icon-circle"></i> 480p</a><a><i class="icon-circle"></i> 360p</a><a><i class="icon-circle"></i> 420p</a>');
				
				div_wrapper.append(settings);
			}
			else
			{
				var settings = div_wrapper.find('.kit-player-settings');
			}
			
			if(!settings.is(':hidden'))
			{
				settings.hide();
				return;
			}
			
			var pos = $(this).position();
			
			settings.css({
				bottom : $(this).outerHeight(true) + 'px',
				left : pos.left - settings.outerWidth(true)/2 + 'px'
			});
			
			settings.fadeIn();
		});
		
		div_contents.on('click', 'li a', function(e)
		{
			//console.log($(this).attr('data-time'));
			videoObject.currentTime = $(this).attr('data-time');
		});
		
		div_wrapper.on('click', '.kit-player-settings a', function(e)
		{
			e.preventDefault();
			e.stopPropagation();
			
			_resumeTime = videoObject.currentTime;
			_waitPlay = !videoObject.paused;
			if(_waitPlay)
			{
				videoObject.pause();
			}
			videoObject.src = player.clip.resolutions[$(this).attr('data-resolution')];
			
			div_wrapper.find('.kit-player-settings a.active').removeClass('active');
			$(this).addClass('active');
			
			div_wrapper.find('.kit-player-settings').hide();
			
			return false;
		});
		
		// ### Play | control.play.click
		control_play.on('click', function(e)
		{
			e.preventDefault();
			//if(e.isTrigger)
			e.stopPropagation();
			if(videoObject.paused)
			{
				videoObject.play();
				//_playNextAd('pre-roll');
				
				// @todo check state here
				/*
				if(player.ad || !_playNextAd('pre-roll'))
				{
					videoObject.play();
					//_waitPlay = true;
				}
				
				videoObject.play();
				// We're not in an ad and we have a pre roll
				else
				{
					//_error('Unexpected State in click event');
				}
				*/
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
			.on('beginSeek', function(e)
			{
				control_volume_bar.stop();
			})
			.on('beforeSeek', function(e)
			{
				e.stopPropagation();
				e.preventDefault();
				if(that.triggerHandler('beforevolumechange', [player]) == false)
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
			if(player.ad)
			{
				if(!player.ad.duration)
					player.ad.duration = videoObject.duration;
			}
			else
			{
				if(!player.clip.duration)
					player.clip.duration = videoObject.duration;
			}
			
			if(!player.ad)
			{
				control_timeline_elements.find('.annotation-ad').remove();
				$(player.clip.ads).each(function()
				{
					var result;
					if(typeof this.begin == 'string' && (result = this.begin.match(/^(\d+(?:\.\d+)?)\s?\%$/)))
					{
						this.begin = (result[1] / 100) * videoObject.duration;
					}
					else if(this.begin < 0)
					{
						this.begin = videoObject.duration + this.begin;
					}
					
					if(typeof this.end != 'undefined')
					{
						if(typeof this.end == 'string' && (result = this.end.match(/^(\d+(?:\.\d+)?)\s?\%$/)))
						{
							this.end = (result[1] / 100) * videoObject.duration;
						}
						else if(this.end < 0)
						{
							this.end = videoObject.duration + this.end;
						}
						
						// else: this.end is expected to be a positive number here
					}
					else if(typeof this.duration != 'undefined')
					{
						this.end = this.begin + this.duration;
					}
					else
					{
						this.end = videoObject.duration;
					}
				});
				
				$(adAnnotations).each(function()
				{
					var annotation = $('<div class="annotation-ad"></div>').css('left', (this.begin / videoObject.duration) * 100 + '%');
					
					if(this.position != 'mid-roll')
						annotation.css('width', ((this.end - this.begin) / videoObject.duration) * 100 + '%')
					
					control_timeline_progress.before(annotation);
				});
			}
			else
			{
				control_timeline_elements.find('.annotation-ad').remove();
			}
		
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
			//_info('[event.canplay]');
			if(player.waiting)
			{
				player.waiting = false;
				that.removeClass('waiting');
				// fix for timeupdate events missing in opera browser
				videoObject.pause();
				videoObject.play();
			}
		});
		
		// ### event.emptied: Reset UI
		video.on('emptied', function(e)
		{
			//_info('[event.emptied]');
			control_timeline.seekSlider('seek', 0);
		});
		
		// ### Event.Play
		
		// _playNextAd('pre-roll') removed from control_play.click because iPhone users won't click on the play button, but on the inline play button from iOS
		// therefore we have to check for the next ad here
		
		video.on('play', function(e)
		{
			//console.log('play', videoObject.currentTime, player.ad);
			if(!videoObject.currentTime && !player.ad)
			{
				if(!_playNextAd('pre-roll'))
				{
					//player.playing = false;
					//_waitPlay = true;
					//player.waiting = true;
					videoObject.play();
				}			
			}
			else
			{
				
			}
		});
		
		
		video.on('play', function(e)
		{
			_info('[event.play]');
			player.playing = true;
			if(videoObject.currentTime)
			{
				that.trigger('resume', [player]);
			}
			else
			{
				that.trigger('play', [player]);
			}
			// Switch to pause icon when in play mode
			control_play.removeClass('icon-play').addClass('icon-pause');
		});
				
		// ### event.pause
		
		video.on('pause', function(e)
		{
			player.playing = false;
			
			that.trigger('pause', [player]);
			// Switch to play icon when in pause mode
			control_play.removeClass('icon-pause').addClass('icon-play');
			// Stop animation for progress bar
			control_timeline_progress.stop();
		});
		
		function _playNextClip()
		{
			// do we have a playlist
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
			// no play
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
			//alert('ended: ' + );
			// @todo ended does not work as event name in opera 
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
					that.trigger('load', [player]);
					videoObject.src = player.clip.src;
					videoObject.load();
					videoObject.play();
					_waitPlay = true;
				}
				else if(_ad_position == 'pre-roll')
				{
					if(!_playNextAd('pre-roll'))
					{
						that.trigger('load', [player]);
						videoObject.src = player.clip.src;
						// necessary for chrome to play clip
						videoObject.load();
						videoObject.play();
						_waitPlay = true;
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
			that.addClass('is-seeking');
			//_log('[event.seeking]');
			isSeeking = true;
		});
		
		// ### Event.Seeked
		video.on('seeked', function(e)
		{
			that.removeClass('is-seeking');
			isSeeking = false;
			var p = videoObject.currentTime / videoObject.duration;
			p *= 100;
			p = Math.round(p);
			//_log('[event.seeked] ', videoObject.currentTime, 's ', p, '%');
			control_timeline_progress.stop().css({width : p + '%'});
			
			/*
			if(_waitPlay && _resumeTime)
			{
				videoObject.play();
				_waitPlay = false;
				_resumeTime = null;
			}
			*/
		});
		
		/* from flowplayer:s._trackEvent(
			"Video / Seconds played", // category
			t.engine + "/" + o.type, // action (html / video/mp4)
			n.attr("title") || o.src.split("/").slice(-1)[0].replace(d, ""), // label
			Math.round(i / 1e3) // value --> duration
		)
		*/
		
		// canplaythrough suspend abort emptied
		// suspend progress timeupdate
		video.on('play abort loadstart stalled loadeddata loadedmetadata seeking seeked waiting playing ended ratechange', function(e)
		{
			//_log(e.type, 'ready:', videoObject.readyState, 'network:', videoObject.networkState, 'buffered:', videoObject.buffered.length ? videoObject.buffered.end(0) : 'undefined', 'currentTime:', videoObject.currentTime);
			// , 'ready:', videoObject.readyState, 'network:', videoObject.networkState, 'buffered:', videoObject.buffered.length ? videoObject.buffered.end(0) : 'undefined',
			_log(e.type, 'currentTime:', videoObject.currentTime);
		});
		
		video.on('error', function(e)
		{
			//_log(e.type, 'ready:', videoObject.readyState, 'network:', videoObject.networkState, 'buffered:', videoObject.buffered.length ? videoObject.buffered.end(0) : 'undefined', 'currentTime:', videoObject.currentTime);
			_error('error:', videoObject.error.code, videoObject.src);
		});
		
		video.on('loadeddata', function(e)
		{
			timeupdate_delay = null;
			timeupdate_lastTime = null;
		
			if(_resumeTime)
			{
				if(!player.ad)
				{
					videoObject.currentTime = _resumeTime;
					_resumeTime = null;
					_waitPlay = false;
				}
			}
			// needed for switching playlists - this will reset the bar correctly
			else
			{
				videoObject.currentTime = 0;
			}
		});
		
		video.on('loadstart', function(e)
		{
			//console.log('_resumeTime', _resumeTime);
			if(_waitPlay/* && !_resumeTime*/)
			{
				videoObject.play();
				_waitPlay = false;
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
			if(!player.waiting)
			{
				videoObject.pause();
				videoObject.play();
			}
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
		var timeupdate_delay = null;
		var timeupdate_lastTime = null;
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
			
			if(timeupdate_lastTime != null)
			{
				if(timeupdate_delay == null)
				{
					timeupdate_delay = (new Date()).getTime() - timeupdate_lastTime;
				}
				else
				{
					timeupdate_delay = timeupdate_delay * .75 + ((new Date()).getTime() - timeupdate_lastTime) * .25;
				}
			}
			
			//console.log('timeupdate_delay:', timeupdate_delay);
			
			//console.log('timeupdate_delay:', timeupdate_delay, timeupdate_lastTime, (new Date()).getTime(), (new Date()).getTime() - timeupdate_lastTime);
			
			timeupdate_lastTime = (new Date()).getTime();
			
			that.trigger('timeupdate', [player]);
			
			if(player.ad)
			{
				player.ad.time = videoObject.currentTime;
			}
			else
			{
				player.clip.time = videoObject.currentTime;
			}
			
			// If we have an cuepoints
			if(!player.ad && cuePointIndex != null && !videoObject.paused)
			{
				if(videoObject.currentTime >= player.clip.cuepoints[cuePointIndex])
				{
					that.trigger('cuepoint', [player, player.clip.cuepoints[cuePointIndex]]);
					cuePointIndex++;
					
					if(cuePointIndex >= player.clip.cuepoints.length)
					{
						cuePointIndex= null;
						_log('[timeupdate] no more cuepoints');
					}
				}
			}
			
			// if there is an overlay and it has ended -> remove it
			if(player.overlay != false && player.overlay <= videoObject.currentTime)
			{
				div_overlay.find('>*').remove();
				div_overlay.hide();
				player.overlay = false;
			}
			
			// if we're not in an ad and we have more ads to show
			if(!player.ad && nextAd != null)
			{
				var _ad = player.clip.ads[nextAd];
				var position = _ad.position;
				
				/*
				var result;
				if(typeof _ad.begin == 'string' && (result = _ad.begin.match(/^(\d*)\s?\%$/)))
				{
					_ad.begin = (result[1] / 100) * videoObject.duration;
				}
				*/
				
				// check if the nextAd is an overlay and the ad should be displayed
				// @TODO check if end has not been reached (needed for seeking)
				if(position != 'pre-roll' && position != 'post-roll' && videoObject.currentTime >= _ad.begin)
				{
					// check if end has been reached aswell
					
					if(position == 'mid-roll')
					{
						_resumeTime = videoObject.currentTime;						
						_playNextAd('mid-roll');
					}
					else if(_ad.end < videoObject.currentTime)
					{
						_info('_ad.end reached');
						_gotoNextAd();
					}
					else
					{
						var position_conf = overlay_positions[_ad.position];
						
						if(typeof position_conf == 'object')
						{
							switch(_ad.type)
							{
								case 'application/x-shockwave-flash' :
								case 'swf' :
									var id = 'overlay-' + (new Date()).getTime();
									var adObject = $('<div/>');
									adObject.attr('id', id);
									div_overlay.append(adObject);
									swfobject.embedSWF(_ad.src, id, position_conf.width, position_conf.height, "9.0.0", "expressInstall.swf");
								break;
								default :
									if(_ad.type.match(/^video\/(.*)$/g))
									{
										var video = $('<video autoplay width="' + position_conf.width + '" height="' + position_conf.height + '"></video>')
										
										if(_ad.src)
										{
											video.attr('src', _ad.src);
										}
										else
										{
											var src = getSrc(_ad.sources);
											video.attr('src', src.src);
										}
										
										video.get(0).volume = 0;
										
										div_overlay.append(video);
									}
								break;
							}
							
							div_overlay.css(position_conf.css);
							div_overlay.css(
								 {
									width : position_conf.width,
									height : position_conf.height
								}
							);
							
							if(typeof position_conf.css.left != 'undefined')
							{
								div_overlay.css('marginLeft', -(position_conf.width / 2));
							}
							div_overlay.show();
							
							player.overlay = _ad.end;
						}
						
						_gotoNextAd();
					}
					
					// always goto next ad
				}
			}
			
			var currentPercent = (videoObject.currentTime / videoObject.duration) * 100;
			var nextPercent = ((videoObject.currentTime + (timeupdate_delay == null ? 0.25 : timeupdate_delay / 1000)) / videoObject.duration) * 100;
			control_timeline_progress.stop().css('width', currentPercent + '%').animate({width : nextPercent + '%'}, ((timeupdate_delay == null) ? 250 : timeupdate_delay) / videoObject.playbackRate, 'linear');
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
				
				control_timeline_elements.prepend(bar_loaded);
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
		
		// if we have both: width and height, we can set the width and height
		
		// ############ Playlist & Clip
		
		// ### If the configuration has a playlist, we always use the first clip
		
		if(conf.playlist.length > 0)
		{
			player.loadPlaylist(conf.playlist);
		}
		// ### If we have a clip, load the clip
		else if(conf.clip != null)
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
		
		that.trigger('init', [player]);
		
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
				tracker = _gat._getTracker(conf.analytics);
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
				_trackEvent('Resume', player.ad ? player.ad.time : player.clip.time);
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
				_trackEvent('Finish', player.ad ? player.ad.time : player.clip.time);
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
					_trackEvent('Stop', player.ad ? player.ad.time : player.clip.time);
				}
			});
		}
	});

  };
})(jQuery);