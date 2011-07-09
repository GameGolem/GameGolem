// ==UserScript==
// @name		Rycochet's Castle Age Golem
// @namespace	golem
// @description	Auto player for Castle Age on Facebook. If there's anything you'd like it to do,  just ask...
// @license		GNU Lesser General Public License; http://www.gnu.org/licenses/lgpl.html
// @version		31.6.1145
// @include		http://apps.facebook.com/castle_age/*
// @include		https://apps.facebook.com/castle_age/*
// @include		http://web3.castleagegame.com/castle_ws/index.php
// @resource	golem http://game-golem.googlecode.com/svn/trunk/GameGolem.js
// @resource	stylesheet http://game-golem.googlecode.com/svn/trunk/golem.css
// ==/UserScript==
// @disabled-include		http://apps.facebook.com/reqs.php
// @disabled-include		https://apps.facebook.com/reqs.php
// 
// For the source code please check the sourse repository
// - http://code.google.com/p/game-golem/
(function () {
	var a, b, c = GM_listValues();
	// Change old data format to use localStorage instead of GM_*
	while ((a = c.pop())){
		if (/^golem\./i.test((b = GM_getValue(a)))) {
			localStorage.setItem(a, b)
			GM_deleteValue(a);
		}
	}
	GM_addStyle(GM_getResourceText('stylesheet'));
	a = document.createElement('script');
	a['type'] = 'text/javascript';
	a['text'] = GM_getResourceText('golem');
	(document.getElementsByTagName('head')[0]||document.documentElement).appendChild(a);
}());
