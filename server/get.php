<?php
// NOTE: This file is a mess - got started and stopped several times, so it's never finished...

// Nice and simple - take a url request, parse out what's wanted, and then send a javascript file result with JSON encoded data inside it.

// Request args -
// id - semi-random number, also includes the script element id for data transfer (ie, golem_jsonp_123456789)
// worker - which worker we need data for (app+'_'+worker.name in Golem)
// date - timestamp of the last data we received with this request - so only new / changed data needs to be sent (optional)
// what - dot-separated key path (optional)

// DB fields: worker, key.path.blah, value, vote, added, last

require_once('connect.php');
$mysqli = db_connect();

$what = $mysqli->real_escape_string($_REQUEST['what']);

if ($result = $mysqli->query("SELECT golem_keys.*, golem_data.value, MAX(golem_data.votes) FROM golem_data INNER JOIN golem_keys ON golem_data.key = golem_keys.id WHERE worker='*' GROUP BY golem_data.key")) {
	$data = array();
	while ($row = $result->fetch_object()) {
		if ($row['key1']) {
			if ($row['key2']) {
				if (!is_array($data[$row['key1']])) {
					$data[$row['key1']] => array();
				}
				if ($row['key3']) {
					if (!is_array($data[$row['key1']][$row['key2']])) {
						$data[$row['key1']][$row['key2']] => array();
					}
					if ($row['key4']) {
						if (!is_array($data[$row['key1']][$row['key2']][$row['key3']])) {
							$data[$row['key1']][$row['key2']][$row['key3']] => array();
						}
						if ($row['key5']) {
							if (!is_array($data[$row['key1']][$row['key2']][$row['key3']][$row['key4']])) {
								$data[$row['key1']][$row['key2']][$row['key3']][$row['key4']] => array();
							}
							$data[$row['key1']][$row['key2']][$row['key3']][$row['key4']][$row['key5']] => $row['value'];
						} else {
							$data[$row['key1']][$row['key2']][$row['key3']][$row['key4']] => $row['value'];
						}
					} else {
						$data[$row['key1']][$row['key2']][$row['key3']] => $row['value'];
					}
				} else {
					$data[$row['key1']][$row['key2']] => $row['value'];
				}
			} else {
				$data[$row['key1']] => $row['value'];
			}
		}
	}
	echo 'function(){data="'.json_encode($data).'";}';
} else {
	echo 'function(){error="'.$mysqli->error.'";}';
}
$mysqli->close();

?>