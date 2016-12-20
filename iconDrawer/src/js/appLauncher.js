/*jslint
  node: true,
  sloppy: true,
  browser: true
*/
/*global
  iconDrawer,
  favInfo:true,
  appInfo,
  blacklist,
  drawer,
  appBundles,
  swiper,
  alert,
  grid
*/

/*

___                      ______
|_  |                     |  _  \
 | |_   _ _ __   ___  ___| | | |_ __ __ ___      _____ _ __
 | | | | | '_ \ / _ \/ __| | | | '__/ _` \ \ /\ / / _ \ '__|
/\__/ / |_| | | | |  __/\__ \ |/ /| | | (_| |\ V  V /  __/ |
\____/ \__,_|_| |_|\___||___/___/ |_|  \__,_| \_/\_/ \___|_|

Copyright (C) 2016 JunesiPhone. All Rights Reserved.

App drawer to use with OPWs (OnePageWidgets) reads applist from iOS device.
Drawer contains app icons, labels, and badges. Scrollable lists.
User can make favorites, view only by notifications, and choose two view options.
Created and maintained by @JunesiPhone http://junesiphone.com
Projects this is used in http://junesiphone.com/OPW

*/
'use strict';

/* Add move option to array */
Array.prototype.move = function (from_index, to_index) {
    var x = this[from_index];
    this.splice(from_index, 1);
    this.splice(to_index, 0, x);
    return this;
};

/* Create appDrawer methods */
var appDrawer = {
    inEditMode: false,
    inFavorites: false,
    drawerScrolling: false,
    favoriteArray: [],
    iconContainer: document.getElementById('iconContainer'),
    favButton: document.getElementById('fav'),
    allButton: document.getElementById('all'),
    moreButton: document.getElementById('more'),
    editText: document.getElementById('edit'),
    clearDiv: function (divID) {
        var div = document.getElementById(divID);
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
    },
    loadCss: function () {
        if (grid) {
            var cssFile = document.createElement("link");
            cssFile.setAttribute("rel", "stylesheet");
            cssFile.setAttribute("type", "text/css");
            cssFile.setAttribute("href", 'src/css/gridDrawer.css');
            document.getElementsByTagName("head")[0].appendChild(cssFile);
        }
    },
    searchApp: function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById('newSearch');
        filter = input.value.toUpperCase();
        ul = document.getElementById("iconContainer");
        li = ul.getElementsByTagName('li');

        for (i = 0; i < li.length; i += 1) {
            a = li[i].getAttribute('tag');
            if (a.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    },
    showDrawer: function () {
        var button = drawer;
        if (button === 'AppDrawer') {
            iconDrawer.openAppDrawer();
        } else if (button === 'Fern') {
            iconDrawer.openFern();
        } else if (button === 'InstaLauncher') {
            iconDrawer.openInstaLauncher();
        } else if (button === 'JunesDrawer') {
            document.getElementById('appDrawerDiv').style.top = '0px';
        } else if (button === 'Switcher') {
            iconDrawer.openSwitcher();
        }
        //NSLog("OPWDrawer " + document.body.outerHTML);
    },
    toggleButton: function (button) {
        var fav, all, more, edit;
        if (button === 'all') {
            fav = 'inactiveButton';
            all = 'activeButton';
            more = 'inactiveButton';
            edit = '1';
        } else if (button === 'fav') {
            fav = 'activeButton';
            all = 'inactiveButton';
            more = 'inactiveButton';
            edit = 'Z';
        } else if (button === 'more') {
            fav = 'inactiveButton';
            all = 'inactiveButton';
            more = 'activeButton';
            edit = '1';
        }
        appDrawer.favButton.className = fav;
        appDrawer.allButton.className = all;
        appDrawer.moreButton.className = more;
        appDrawer.editText.innerHTML = edit;
    },
    checkBundle: function (bundle) {
      /* Fixes for icon images */
        if (bundle === 'com.agilebits.onepassword') {
            bundle = 'com.agilebits.onepassword-ios';
        }
        if (bundle === 'com.groupme.iphone') {
            bundle = 'com.groupme.iphone-app';
        }
        if (bundle === 'com.cn') {
            bundle = 'com.cn-rulez.Blurify';
        }
        if (bundle === 'crash') {
            bundle = 'crash-reporter';
        }
        if (bundle === 'com.filippobiga.springtomize3') {
            bundle = 'com.filippobiga.springtomize3-app';
        }
        return bundle;
    },
    checkApp: function (app) {
      /* fixes for icon bundles (to open the app) */
        if (app === 'com.agilebits.onepassword') {
            app = 'com.agilebits.onepassword-ios';
        }
        if (app === 'com.groupme.iphone') {
            app = 'com.groupme.iphone-app';
        }
        return app;
    },
    showEditFav: function (nohide) {
        var selectors = document.getElementsByClassName('check'),
            i;
        for (i = 0; i < selectors.length; i += 1) {
            if (selectors[i].title === 'inFav') {
                selectors[i].className += ' checked';
            } else {
                selectors[i].className += ' notChecked';
            }
            if (nohide) {
                selectors[i].style.display = 'block';
            } else {
                selectors[i].style.display = 'none';
            }
        }
    },
    showEditApp: function () {
        var sheet = document.createElement('style');
        if (this.inEditMode) {
            sheet.innerHTML = ".moveup, .movedown{display:block;}";
        } else {
            sheet.innerHTML = ".moveup, .movedown{display:none;}";
        }
        document.body.appendChild(sheet);
    },
    editMode: function (nohide) {
        if (this.inFavorites) {
            this.showEditApp(); //edit the app in Favorites
        } else {
            this.showEditFav(nohide); //add apps to favorites
        }
    },
    saveLocal: function (bundle, name, save) {
        if (save) {
            this.favoriteArray.push(bundle + '~' + name);
        } else {
            var e = this.favoriteArray.indexOf(bundle + '~' + name);
            if (e !== -1) {
                this.favoriteArray.splice(e, 1);
            }
        }
        localStorage.appLauncher = JSON.stringify(this.favoriteArray);
    },
    addToStorage: function (span, bundle, name) {
        span.setAttribute('title', 'inFav');
        span.style.opacity = 1;
        this.saveLocal(bundle, name, true);
    },
    removeFromStorage: function (span, bundle, name) {
        span.setAttribute('title', 'null');
        span.style.opacity = 0.2;
        this.saveLocal(bundle, name, false);
    },
    onload: function () {
        var storage = JSON.parse(localStorage.appLauncher),
            i,
            c;
        if (storage) {
            for (i = 0; i < storage.length; i += 1) {
                c = document.getElementById(storage[i].split('~')[0]);
                if (c !== null) {
                    c.children[0].children[2].setAttribute('title', 'inFav');
                }
            }
        }
    },
    moveItem: function (pos, el) {
        var bundle, name, e;
        bundle = el.parentNode.parentNode.id;
        name = el.parentNode.parentNode.getAttribute('tag');
        e = this.favoriteArray.indexOf(bundle + '~' + name);
        if (pos === 'up') {
            if ((e - 1) >= 0) {
                this.favoriteArray.move(e, e - 1);
            }
        } else {
            if ((e + 1) <= this.favoriteArray.length - 1) {
                this.favoriteArray.move(e, e + 1);
            }
        }
        localStorage.appLauncher = JSON.stringify(this.favoriteArray);
        this.favApps();
        this.inEditMode = true;
    },
    createItemForLauncher: function (array, isAlerts) {
        var icon,
            li,
            div,
            img,
            label,
            span,
            span1,
            span2,
            badge,
            badgespan,
            i,
            bundle,
            name,
            doc = document,
            fragment = doc.createDocumentFragment();

        for (i = 0; i < array.length; i += 1) {
            name = array[i].split('-')[0];
            bundle = array[i].split('-')[1];
            icon = iconDrawer.getIconImage(appDrawer.checkBundle(bundle));

            if (icon.split(',')[1] !== 'null') { // check if icon image is valid
                badge = iconDrawer.getNotificationCount(appDrawer.checkBundle(bundle));
                li = doc.createElement('li');
                div = doc.createElement('div');
                img = doc.createElement('img');
                label = doc.createElement('label');
                span = doc.createElement('span');
                span1 = doc.createElement('span');
                span2 = doc.createElement('span');
                badgespan = doc.createElement('span');
                span1.innerHTML = 'l';
                span2.innerHTML = 'x';
                badgespan.innerHTML = (badge > 0) ? badge : '';
                badgespan.className = 'drawerBadges';
                span1.className = 'movedown';
                span2.className = 'moveup';
                span1.setAttribute('title', 'down');
                span2.setAttribute('title', 'up');
                span.innerHTML = "9";
                span.className = 'check';
                label.innerHTML = name;
                div.className = 'iconHolder';
                li.setAttribute('title', bundle);
                li.setAttribute('tag', name);
                li.id = bundle;
                div.appendChild(img);
                div.appendChild(label);
                div.appendChild(span);
                div.appendChild(span1);
                div.appendChild(span2);
                div.appendChild(badgespan);
                li.appendChild(div);
                img.src = icon;
            } else { //check if user has stored in favorites. If so remove it.
                if (iconDrawer.existsInArray(favInfo, name + '-' + bundle)) {
                    this.saveLocal(bundle, name, false);
                }
            }
            if (isAlerts) { //if alerts tab only show apps with notifications
                if (iconDrawer.getNotificationCount(appDrawer.checkBundle(bundle)) >= 1) {
                    fragment.appendChild(li);
                }
            } else {
                fragment.appendChild(li);
            }
        }
        this.iconContainer.appendChild(fragment);
    },
    hideFavs: function () {
        var sheet;
        sheet = document.createElement('style');
        sheet.innerHTML = ".moveup, .movedown{display:none;}";
        document.body.appendChild(sheet);
        this.inEditMode = false;
        this.inFavorites = false;
    },
    allApps: function () {
        appDrawer.toggleButton('all');
        this.hideFavs();
        this.clearDiv('iconContainer');
        this.createItemForLauncher(appInfo, false);
        this.onload();
    },
    savedLocalStorage: function () {
        if (localStorage.appLauncher !== null && localStorage.appLauncher !== undefined && localStorage.appLauncher !== 'null' && localStorage.appLauncher !== 'undefined') {
            return true;
        }
        return false;
    },
    favApps: function () {
        var storage, i;
        appDrawer.toggleButton('fav');
        this.inFavorites = true;
        favInfo = [];
        this.clearDiv('iconContainer');
        this.inEditMode = false;
        if (this.savedLocalStorage()) {
            storage = JSON.parse(localStorage.appLauncher);
            if (storage) {
                for (i = 0; i < storage.length; i += 1) {
                    iconDrawer.getFavList(storage[i].split('~')[0], storage[i].split('~')[1]);
                }
                this.createItemForLauncher(favInfo, false);
            }
        }
    },
    moreApps: function () {
        appDrawer.toggleButton('more');
        this.hideFavs();
        this.clearDiv('iconContainer');
        this.createItemForLauncher(appInfo, true);
    },
    initializeAppDrawer: function () {
        appDrawer.loadCss();
        var applications = iconDrawer.getAppList(), //gets app list, and makes array of apps (Cycript)
            i,
            s,
            displayNames,
            bundle,
            storage;

        //loop through each one and make new array
        for (i = 0; i < applications.length; i += 1) {
            displayNames = applications[i].displayName;
            bundle = applications[i].bundleIdentifier;
            if (!iconDrawer.existsInArray(blacklist, bundle) && !applications[i].isWebApplication) {
                appInfo.push(displayNames + '-' + bundle);
            }
        }
        appInfo.sort();
        applications = null; //don't need a reference

        //loop over stored favorites
        if (this.savedLocalStorage()) {
            storage = JSON.parse(localStorage.appLauncher);
            if (storage) {
                for (s = 0; s < storage.length; s += 1) {
                    appDrawer.favoriteArray.push(storage[s]); //push back to local array
                }
            }
        }
        appDrawer.favApps();
    }
};

/* TESTING ONLY THIS IS NOT NEEDED */
/***********************************/
/***********************************/
/***********************************/
/***********************************/
appDrawer.createTestIconForLauncher = function (name, bundle) {
    var icon = 'testIcon.png',
        li,
        div,
        img,
        label,
        span,
        span1,
        span2,
        badge,
        badgespan,
        doc = document;
    badge = '10';
    li = doc.createElement('li');
    div = doc.createElement('div');
    img = doc.createElement('img');
    label = doc.createElement('label');
    span = doc.createElement('span');
    span1 = doc.createElement('span');
    span2 = doc.createElement('span');
    badgespan = doc.createElement('span');
    span1.innerHTML = 'l';
    span2.innerHTML = 'x';
    badgespan.innerHTML = (badge > 0) ? badge : '';
    badgespan.className = 'drawerBadges';
    span1.className = 'movedown';
    span2.className = 'moveup';
    span1.setAttribute('title', 'down');
    span2.setAttribute('title', 'up');
    span.innerHTML = "9";
    span.className = 'check';
    label.innerHTML = name;
    div.className = 'iconHolder';
    li.setAttribute('title', bundle);
    li.setAttribute('tag', name);
    li.id = bundle;
    div.appendChild(img);
    div.appendChild(label);
    div.appendChild(span);
    div.appendChild(span1);
    div.appendChild(span2);
    div.appendChild(badgespan);
    li.appendChild(div);
    img.src = icon;
    this.iconContainer.appendChild(li);

};
appDrawer.loadTestCss = function (layout) {
    if (layout === 'grid') {
        var cssFile = document.createElement("link"),
            css = layout;
        cssFile.setAttribute("rel", "stylesheet");
        cssFile.setAttribute("type", "text/css");
        cssFile.setAttribute("href", 'src/css/' + css + 'Drawer.css');
        document.getElementsByTagName("head")[0].appendChild(cssFile);
    }
};

function testDrawer(layout) {
    var apps = 20,
        i;
    document.getElementById('appDrawerDiv').style.top = '0px';
    for (i = 0; i < apps; i += 1) {
        appDrawer.createTestIconForLauncher("AppStore" + i, "AppStore" + i);
    }
    appDrawer.loadTestCss(layout);

}
/************************/
/************************/
/************************/
/************************/
/*END OF TESTING STUFFS*/

//initialize all the things
try {
    appDrawer.initializeAppDrawer();
    //testDrawer('grid'); //for testing only will place icons in the drawer and show it parameter is grid or rows
} catch (ignore) {
    //alert("Show this error to @JunesiPhone " + err);
}

/* Events used to control the appDrawer */
appDrawer.iconContainer.addEventListener('touchmove', function () {
    appDrawer.drawerScrolling = true;
});
appDrawer.iconContainer.addEventListener('touchend', function (e) {
    var span, search;
    if (!appDrawer.drawerScrolling) {
        if (appDrawer.inEditMode) {
            if (appDrawer.inFavorites) {
                if (e.target.title === 'up' || e.target.title === 'down') {
                    appDrawer.moveItem(e.target.title, e.target);
                }
            } else {
                span = e.target.children[0].children[2];
                if (span.title === 'inFav') {
                    appDrawer.removeFromStorage(e.target.children[0].children[2], e.target.title, e.target.getAttribute('tag'));
                } else {
                    appDrawer.addToStorage(e.target.children[0].children[2], e.target.title, e.target.getAttribute('tag'));
                }
            }
        } else {
            if (e.target.title !== 'search') {
                search = document.getElementById('newSearch');
                search.value = '';
                search.blur();
                appDrawer.searchApp();
                iconDrawer.openApp(appDrawer.checkApp(e.target.title));
                document.getElementById('appDrawerDiv').style.top = '740px';
            }
        }
    }
    appDrawer.drawerScrolling = false;
});
appDrawer.handleOptionTouches = function (id) {
    switch (id) {
    case 'all':
        appDrawer.allApps();
        break;
    case 'fav':
        appDrawer.favApps();
        break;
    case 'more':
        appDrawer.moreApps();
        break;
    case 'close':
        document.getElementById('appDrawerDiv').style.top = '740px';
        break;
    case 'edit':
        if (!appDrawer.inEditMode) {
            appDrawer.inEditMode = true;
            appDrawer.editMode(true);
        } else {
            appDrawer.inEditMode = false;
            appDrawer.editMode(false);
        }
        break;
    case 'newSearch':
        document.getElementById('newSearch').focus();
        break;
    }
};
document.getElementById('appOptions').addEventListener('touchstart', function (e) {
    e.preventDefault();
    appDrawer.handleOptionTouches(e.target.id);
});

/*

Addon to disable paging
This will lock the iOS device to the page that the widget is set on. You must enable/disable through iWidget Options.
You must enable paging when the widget is closed. You can do this through <body onunload="iconDrawer.enablePaging()">

*/


var referenceScrollView;
function disablePaging() {
    var i,
        scrollView = iconDrawer.getScrollView(),
        scroll = false;
    for (i = 0; i < scrollView.length; i += 1) {
        if (scroll === true) {
            break;
        }
        if (String(scrollView[i].className) === 'SBIconScrollView') {
            referenceScrollView = scrollView[i];
            iconDrawer.disablePaging();
            scroll = true;
        }
    }
}
if (!swiper) {
    disablePaging();
}
