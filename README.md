kit_html5_video_player
======================

Kit HTML5 Video Player is a powerful tool to provide HTML5 Videos on your website. The player does not provide a flash fallback.

### Requirements

Kit HTML5 Video uses a set of external libraries. For basic usage kit requires jquery. For optimal skin optic you should also include bootstrap and fontawesome vector icons. But these libs are not required. If you don't want to use either bootstrap or fontawesome vector icons, you have to add icons to the player yourself manually.

### Usage

Include Javascript and CSS files:

```html
	<script src="js/player.js" type="text/javascript"></script>
	<link rel="stylesheet" type="text/css" href="player.basic.css"/>
	<link rel="stylesheet" type="text/css" href="player.skins.css"/>
```

### Init player from sources

```html
	<div id="player">
		<video controls loop>
			<source ...>
		</video>
	</div>

	<script type="text/javascript">
		var p = $('#player').kit_HTML5VideoPlayer();

		var api = p.kit_HTML5VideoPlayer();
	</script>
```
