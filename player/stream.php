<?php
	ini_set('max_execution_time', 120);
	//
	
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
		
		header('Content-Type:  video/mp4');
		
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