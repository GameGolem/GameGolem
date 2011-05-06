-- Database structure for Game-Golem
-- Import this to create the basic table structure

-- --------------------------------------------------------

-- 
-- Table structure for table `golem_keys`
-- 

CREATE TABLE `golem_keys` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `worker` varchar(64) collate latin1_general_ci NOT NULL,
  `key1` varchar(64) collate latin1_general_ci NOT NULL,
  `key2` varchar(64) collate latin1_general_ci NOT NULL,
  `key3` varchar(64) collate latin1_general_ci NOT NULL,
  `key4` varchar(64) collate latin1_general_ci NOT NULL,
  `key5` varchar(64) collate latin1_general_ci NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `key` (`worker`,`key1`,`key2`,`key3`,`key4`,`key5`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

-- 
-- Table structure for table `golem_data`
-- 

CREATE TABLE `golem_data` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `key` int(10) unsigned NOT NULL,
  `value` text collate latin1_general_ci NOT NULL,
  `votes` int(10) unsigned NOT NULL default '1',
  `added` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `last` timestamp NOT NULL default '0000-00-00 00:00:00',
  PRIMARY KEY  (`id`),
  KEY `key` (`key`),
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

-- 
-- Table structure for table `golem_users`
-- 

CREATE TABLE `golem_users` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `user` varchar(64) collate latin1_general_ci NOT NULL,
  `email` varchar(256) collate latin1_general_ci NOT NULL,
  `hash` varchar(64) collate latin1_general_ci NOT NULL,
  `votes` int(10) unsigned NOT NULL default '0',
  `type` enum('peon','god') collate latin1_general_ci NOT NULL default 'peon',
  PRIMARY KEY  (`id`),
  KEY `user` (`user`,`hash`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

-- 
-- Table structure for table `golem_votes`
-- 

CREATE TABLE `golem_votes` (
  `user` int(10) unsigned NOT NULL,
  `key` int(10) unsigned NOT NULL,
  `added` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`user`,`key`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
