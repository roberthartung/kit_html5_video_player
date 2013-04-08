<?php
	ini_set('max_execution_time', 120);
	//
	//var_dump(isset($_SERVER['HTTP_RANGE']), $_SERVER);
	
	define('INSTANCE_LENGTH', 1024 * 50); // 25 kB at once
	define('FILE', 'openx-ad.webm');
	$fsize = filesize(FILE);
	
	if(array_key_exists('HTTP_RANGE', $_SERVER))
	{
		if(empty($_SERVER['HTTP_RANGE']))
		{
			header('Content-Type: video/webm');
			header('Accept-Ranges: bytes');
			header('Content-Length: '.$fsize);
			header('Etag: "75fc2-4d9638fbe6337"');
		}
		else
		{
			header('HTTP/1.1 206 Partial Content');
			$range = $_SERVER['HTTP_RANGE'];
			list($type,$range) = explode('=', $range);
			list($begin, $end) = explode('-', $range);
			if(empty($end))
			{
				header('Content-Length: '.INSTANCE_LENGTH);
				$end = $begin + INSTANCE_LENGTH;
			}
			else
			{
				header('Content-Length: '.INSTANCE_LENGTH);
			}
			
			switch($type)
			{
				case 'bytes' :
					$fopen = fopen(FILE, 'r');
					
					fseek($fopen, $begin);
					$bytes_left = INSTANCE_LENGTH;
				break;
			}
			
			header('Content-Type: video/webm');
			header('Etag: "75fc2-4d9638fbe6337"');
			header('Accept-Ranges: bytes');
			header('Content-Range: bytes '.$begin.'-'.($end-1).'/'.$fsize);
			
			while(!feof($fopen))
			{
				// $bytes_left >= 1024 ? 1024 : 
				echo fread($fopen, $bytes_left);
				flush();
				//$bytes_left -= INSTANCE_LENGTH;
				//usleep(50000);
				//flush();
				//if($bytes_left <= 0)
				//break;
			}
			fclose($fopen);
		}
	}
	else
	{
		die('err');
	}
	
	exit;
	
	// Range: bytes=0-
	
	
	
	
	/*
	----------------------------------------------------------
http://git.localhost/html5_video_player/player/openx-ad.webm

GET /html5_video_player/player/openx-ad.webm HTTP/1.1
Host: git.localhost
User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:20.0) Gecko/20100101 Firefox/20.0
Accept-Language: de-de,de;q=0.8,en-us;q=0.5,en;q=0.3
DNT: 1
Range: bytes=0-
Referer: http://git.localhost/html5_video_player/player/player.html
Cookie: __utma=261119259.1835310369.1365345802.1365345802.1365345802.1; __utmb=261119259.1.10.1365345802; __utmz=261119259.1365345802.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utmc=261119259
Connection: keep-alive

HTTP/1.1 206 Partial Content
Date: Sun, 07 Apr 2013 14:45:14 GMT
Server: Apache/2.4.3 (Win32) OpenSSL/1.0.1c PHP/5.4.7
Last-Modified: Tue, 02 Apr 2013 16:52:23 GMT
Keep-Alive: timeout=5, max=100
Connection: Keep-Alive

	*/
	
	exit;
	
	/*
	header('Content-Length: '.filesize('624x260.mp4')); // provide file size
	header("Expires: -1");
	header("Cache-Control: no-store, no-cache, must-revalidate");
	header("Cache-Control: post-check=0, pre-check=0", false);
	*/
	
	if(isset($_SERVER['HTTP_RANGE']))
	{
		$range = $_SERVER['HTTP_RANGE'];
		$pos = strpos($range, '=');
		$range = substr($range, $pos+1);
		list($begin, $end) = explode('-', $range);
		
		header('Content-Type: video/mp4');
		
		http_response_code(206);
		header('Accept-Ranges: bytes');
		header('Connection: Keep-Alive');
		header('Content-Length: 2325300');
		header('Content-Range:bytes 0-2325299/2325300'); 
		//header('Connection: Keep-Alive');
		//header('ETag:"'.md5(time()).'"');	
		
		$fopen = fopen('624x260.mp4', 'r');
		while(!feof($fopen))
		{
			echo fread($fopen, 1024);
			usleep(1000);
			//flush();
		}
		fclose($fopen);
		
		/*
		["HTTP_RANGE"]=>
  string(8) "bytes=0-"
  
  	
		*/
	}
	else
	{
		var_dump($_SERVER);
		exit;
	}
?>