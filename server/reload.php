<?php
if ($_SERVER['HTTP_REFERER'] && $_SERVER['HTTP_REFERER'] != "") {
	echo '<html><script type="text/javascript">window.location.href="'.$_SERVER['HTTP_REFERER'].'";</script></html>';
} else {
	echo '<html><script type="text/javascript">history.back();</script></html>';
}
?>