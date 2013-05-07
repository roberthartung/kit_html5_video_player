kit_html5_video_player
======================

Kit HTML5 Video Player is a powerful tool to provide HTML5 Videos on your website. The player does not provide a flash fallback.

### Requirements

Kit HTML5 Video uses a set of external libraries. For basic usage kit requires jquery. For optimal skin optic you should also include bootstrap and fontawesome vector icons. But these libs are not required. If you don't want to use either bootstrap or fontawesome vector icons, you have to add icons to the player yourself manually.

### Usage

Include Javascript and CSS files:

```html
	<script src="js/player.js" type="text/javascript"></script>
	<link rel="stylesheet" type="text/css" href="css/player.basic.css"/>
	<link rel="stylesheet" type="text/css" href="css/player.skins.css"/>
```

### Init player from sources

```html
	<div id="player">
		<video controls>
			<source ...>
		</video>
	</div>

	<script type="text/javascript">
		var p = $('#player').kit_HTML5VideoPlayer({
			// optional
			width 		: 600,
			height 		: 480,
			skin			: 'yt'
		});

		var api = p.kit_HTML5VideoPlayer();
	</script>
```

### Clip Object

Single Source
--------------

```javascript
	var clipObject = {
		title : 'My Clip', // optional
		src : 'video.webm',
		type : 'video/webm'
	};
```

Multiple Sources
--------------

```javascript
	var clipObject = {
		sources : [
			{ type : 'video/webm', src : 'video.webm' },
			{ type : 'video/mp4', src : 'video.mp4' },
			{ type : 'video/ogg', src : 'video.ogg' }
		]
	};
```

Multiple Sources with resolutions
--------------

```javascript
	var clipObject = {
		sources : [
			{ type : 'video/webm', resolutions : { '240p' : 'video-240p.webm', '360p' : 'video-360p.webm' } },
			{ type : 'video/mp4', resolutions : { '240p' : 'video-240p.mp4', '360p' : 'video-360p.mp4' }  },
			{ type : 'video/ogg', resolutions : { '240p' : 'video-240p.ogg', '360p' : 'video-360p.ogg' }  }
		]
	};
```

### Playlist

```html
	<div id="player"><video controls></video></div>

	<script type="text/javascript">
		var p = $('#player').kit_HTML5VideoPlayer({
			playlist = [
				clipObject1, ..., clipObjectN
			]
		});

		var api = p.kit_HTML5VideoPlayer();
	</script>
```