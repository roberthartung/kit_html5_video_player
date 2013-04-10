<?php
	ini_set('max_execution_time', 120);
	//
	//var_dump(isset($_SERVER['HTTP_RANGE']), $_SERVER);
	
	define('LENGTH', 1024 * 50); // 25 kB at once
	define('FILE', $_GET['file']);
	define('FILE_SIZE', filesize(FILE));
	
	//$_SERVER['HTTP_RANGE'] = 'bytes=460800-';
	
	if(array_key_exists('HTTP_RANGE', $_SERVER) && false)
	{
		if(empty($_SERVER['HTTP_RANGE']))
		{
			header('Content-Type: video/webm');
			header('Accept-Ranges: bytes');
			header('Content-Length: '.FILE_SIZE);
			//header('Etag: "75fc2-4d9638fbe6337"');
		}
		else
		{
			header('HTTP/1.1 206 Partial Content');
			//header('Cache-Control: no-cache');
			header('Etag: "2a4cf8-4d95a5630fb86"');
			$range = $_SERVER['HTTP_RANGE'];
			list($type,$range) = explode('=', $range);
			list($begin, $end) = explode('-', $range);
			//assert($type == 'bytes');
			if(empty($end))
			{
				$end = $begin + LENGTH - 1;
				$length = LENGTH;
			}
			else
			{
				$length = $end - $begin + 1;
			}
			
			$last = false;
			if($begin + ($length - 1) > FILE_SIZE)
			{
				$length = FILE_SIZE - $begin + 1;
				$end = FILE_SIZE - 1;
				$last = true;
			}
			
			header('Content-Length: '.$length);
			header('Content-Type: video/webm');
			header('Accept-Ranges: bytes');
			header('Content-Range: bytes '.$begin.'-'.($end).'/'.FILE_SIZE);
			
			$fopen = fopen(FILE, 'r');
			fseek($fopen, $begin);
			if($last)
				echo fpassthru($fopen);
			else
				echo fread($fopen, $length);
			
			fclose($fopen);
			
			/*
			while(!feof($fopen))
			{
				// $bytes_left >= 1024 ? 1024 : 
				
				flush();
				//$bytes_left -= INSTANCE_LENGTH;
				//usleep(50000);
				//flush();
				//if($bytes_left <= 0)
				//break;
			}
			*/
		}
	}
	elseif(false)
	{
		header('Location: '.$_GET['file']);
	}
	else
	{
		header('Content-Length: '.FILE_SIZE);
		header('Content-Type: video/webm');
		//header('Accept-Ranges: bytes');
		header('Content-Range: bytes 0-'.(FILE_SIZE-1).'/'.FILE_SIZE);
		$fopen = fopen(FILE, 'r');
		// read all data at once
		//fpassthru($fopen);
		while(!feof($fopen))
		{
			echo fread($fopen, 1024 * 10);
			usleep(25000);
		}
		fclose($fopen);
	}
	
	exit;
?>