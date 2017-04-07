(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
	Home: require('./views/templates/Home'),
	Snag: require('./views/templates/Snag')
};

},{"./views/templates/Home":12,"./views/templates/Snag":13}],2:[function(require,module,exports){
'use strict';

module.exports = {
	Home: require('./views/Home'),
	Snag: require('./views/Snag')
};

},{"./views/Home":7,"./views/Snag":8}],3:[function(require,module,exports){
"use strict";

module.exports = Object.create(Object.assign({}, require('../../lib/MyObject'), {

    Request: {
        constructor: function constructor(data) {
            var _this = this;

            var req = new XMLHttpRequest();

            return new Promise(function (resolve, reject) {

                req.onload = function () {
                    [500, 404, 401].includes(this.status) ? reject(this.response) : resolve(JSON.parse(this.response));
                };

                if (data.method === "get" || data.method === "options") {
                    var qs = data.qs ? "?" + data.qs : '';
                    req.open(data.method, "/" + data.resource + qs);
                    _this.setHeaders(req, data.headers);
                    req.send(null);
                } else {
                    req.open(data.method, "/" + data.resource, true);
                    _this.setHeaders(req, data.headers);
                    req.send(data.data);
                }
            });
        },
        plainEscape: function plainEscape(sText) {
            /* how should I treat a text/plain form encoding? what characters are not allowed? this is what I suppose...: */
            /* "4\3\7 - Einstein said E=mc2" ----> "4\\3\\7\ -\ Einstein\ said\ E\=mc2" */
            return sText.replace(/[\s\=\\]/g, "\\$&");
        },
        setHeaders: function setHeaders(req) {
            var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            req.setRequestHeader("Accept", headers.accept || 'application/json');
            req.setRequestHeader("Content-Type", headers.contentType || 'text/plain');
        }
    },

    _factory: function _factory(data) {
        return Object.create(this.Request, {}).constructor(data);
    },
    constructor: function constructor() {

        if (!XMLHttpRequest.prototype.sendAsBinary) {
            XMLHttpRequest.prototype.sendAsBinary = function (sData) {
                var nBytes = sData.length,
                    ui8Data = new Uint8Array(nBytes);
                for (var nIdx = 0; nIdx < nBytes; nIdx++) {
                    ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
                }
                this.send(ui8Data);
            };
        }

        return this._factory.bind(this);
    }
}), {}).constructor();

},{"../../lib/MyObject":21}],4:[function(require,module,exports){
'use strict';

module.exports = Object.create({
    create: function create(name, opts) {
        var lower = name;
        name = name.charAt(0).toUpperCase() + name.slice(1);
        return Object.create(this.Views[name], Object.assign({
            name: { value: name },
            factory: { value: this },
            template: { value: this.Templates[name] },
            user: { value: this.User }
        }, opts)).constructor().on('navigate', function (route) {
            return require('../router').navigate(route);
        }).on('deleted', function () {
            return delete require('../router').views[name];
        });
    }
}, {
    Templates: { value: require('../.TemplateMap') },
    Views: { value: require('../.ViewMap') }
});

},{"../.TemplateMap":1,"../.ViewMap":2,"../router":6}],5:[function(require,module,exports){
'use strict';

window.initMap = function () {
  return true;
};
window.onload = function () {
  return require('./router');
};

},{"./router":6}],6:[function(require,module,exports){
'use strict';

module.exports = Object.create({

    Error: require('../../lib/MyError'),

    ViewFactory: require('./factory/View'),

    Views: require('./.ViewMap'),

    constructor: function constructor() {
        this.contentContainer = document.querySelector('#content');

        window.onpopstate = this.handle.bind(this);

        this.handle();

        return this;
    },
    handle: function handle() {
        this.handler(window.location.pathname.split('/').slice(1));
    },
    handler: function handler(path) {
        var _this = this;

        var name = path[0] ? path[0].charAt(0).toUpperCase() + path[0].slice(1) : '',
            view = this.Views[name] ? path[0] : 'home';

        (view === this.currentView ? Promise.resolve() : Promise.all(Object.keys(this.views).map(function (view) {
            return _this.views[view].hide();
        }))).then(function () {

            _this.currentView = view;

            if (_this.views[view]) return _this.views[view].navigate(path);

            return Promise.resolve(_this.views[view] = _this.ViewFactory.create(view, {
                insertion: { value: { el: _this.contentContainer } },
                path: { value: path, writable: true }
            }));
        }).catch(this.Error);
    },
    navigate: function navigate(location) {
        history.pushState({}, '', location);
        this.handle();
    }
}, { currentView: { value: '', writable: true }, views: { value: {} } }).constructor();

},{"../../lib/MyError":20,"./.ViewMap":2,"./factory/View":4}],7:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {
    postRender: function postRender() {
        var _this = this;

        setTimeout(function () {
            return _this.hide().then(function () {
                return _this.emit('navigate', 'snag');
            }).catch(_this.Error);
        }, 2000);

        return this;
    }
});

},{"./__proto__":9}],8:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {

    garagePath: require('./lib/carPath'),

    bindSwipe: function bindSwipe() {
        var _this = this;

        this.swipeTime = 1000;
        this.minX = 30;
        this.maxY = 30;

        this.els.container.addEventListener('mousedown', function (e) {
            return _this.onSwipeStart(e);
        }, false);
        this.els.container.addEventListener('touchstart', function (e) {
            return _this.onSwipeStart(e);
        }, false);
        this.els.container.addEventListener('mousemove', function (e) {
            return _this.onSwipeMove(e);
        }, false);
        this.els.container.addEventListener('touchmove', function (e) {
            return _this.onSwipeMove(e);
        }, false);
        this.els.container.addEventListener('mouseup', function (e) {
            return _this.onSwipeEnd(e);
        }, false);
        this.els.container.addEventListener('touchend', function (e) {
            return _this.onSwipeEnd(e);
        }, false);
    },
    getTemplateOptions: function getTemplateOptions() {
        return this.data;
    },


    data: [
    /*{
        id: 1,
        distance: '300 ft away',
        mapLocation: { lat: -34.397, lng: 150.644 },
        spotLocation: { lat: -34.397, lng: 150.644 },
        name: 'LAZ Parking',
        context: [
            'Private Parking Structure',
            '88/240 spots'
        ],
        details: [
            '$3/hr',
            '4hr max',
            'open 24 hrs'
        ],
        image: 'sidekick-shed-xs.jpg',
        temp: 57
    }*/
    {
        id: 1,
        distance: 'ft away',
        mapLocation: { lat: 39.9564950, lng: -75.1925837 },
        spotLocation: { lat: 39.9564950, lng: -75.1925837 },
        name: 'Drexel Lot C',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['$3/hr', '5hr max', 'open 24 hrs'],
        image: 'spots/lot_c.JPG',
        temp: 57
    }, {
        id: 2,
        distance: 'ft away',
        mapLocation: { lat: 39.9593209, lng: -75.1920907 },
        spotLocation: { lat: 39.9593209, lng: -75.1920907 },
        name: 'Drexel Lot D Spot 45',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_d_spot_45.JPG',
        temp: 57
    }, {
        id: 3,
        distance: 'ft away',
        mapLocation: { lat: 39.9599256, lng: -75.1889950 },
        spotLocation: { lat: 39.9599256, lng: -75.1889950 },
        name: 'Drexel Lot H Spot 4',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_h_spot_4.JPG',
        temp: 57
    }, {
        id: 4,
        distance: 'ft away',
        mapLocation: { lat: 39.9597497, lng: -75.1886260 },
        spotLocation: { lat: 39.9597497, lng: -75.1886260 },
        name: 'Drexel Lot H Spot 15',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_h_spot_15.JPG',
        temp: 57
    }, {
        id: 5,
        distance: 'ft away',
        mapLocation: { lat: 39.9596049, lng: -75.1888546 },
        spotLocation: { lat: 39.9596049, lng: -75.1888546 },
        name: 'Drexel Lot H Spot 26',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_h_spot_26.JPG',
        temp: 57
    }, {
        id: 6,
        distance: 'ft away',
        mapLocation: { lat: 39.9583045, lng: -75.18882359 },
        spotLocation: { lat: 39.9583045, lng: -75.18882359 },
        name: 'Drexel Lot J',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_j.JPG',
        temp: 57
    }, {
        id: 7,
        distance: 'ft away',
        mapLocation: { lat: 39.9575587, lng: -75.1934095 },
        spotLocation: { lat: 39.9575587, lng: -75.1934095 },
        name: 'Drexel Lot K Spot 115',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_k_spot_115.JPG',
        temp: 57
    }, {
        id: 8,
        distance: 'ft away',
        mapLocation: { lat: 39.9563293, lng: -75.1911949 },
        spotLocation: { lat: 39.9563293, lng: -75.1911949 },
        name: 'Drexel Lot P',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_p.JPG',
        temp: 57
    }, {
        id: 9,
        distance: 'ft away',
        mapLocation: { lat: 39.9563185, lng: -75.1911229 },
        spotLocation: { lat: 39.9563185, lng: -75.1911229 },
        name: 'Drexel Lot P Spot 2',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_p_spot_2.JPG',
        temp: 57
    }, {
        id: 10,
        distance: 'ft away',
        mapLocation: { lat: 39.9579902, lng: -75.1901658 },
        spotLocation: { lat: 39.9579902, lng: -75.1901658 },
        name: 'Drexel Lot R Spot 20',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_r_spot_20.JPG',
        temp: 57
    }, {
        id: 11,
        distance: 'ft away',
        mapLocation: { lat: 39.9568154, lng: -75.1872669 },
        spotLocation: { lat: 39.9568154, lng: -75.1872669 },
        name: 'Drexel Lot S',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_s_signage.JPG',
        temp: 57
    }, {
        id: 12,
        distance: 'ft away',
        mapLocation: { lat: 39.9578782, lng: -75.1882803 },
        spotLocation: { lat: 39.9578782, lng: -75.1882803 },
        name: 'Drexel Lot T Spot 2',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_t_spot_2.JPG',
        temp: 57
    }, {
        id: 13,
        distance: 'ft away',
        mapLocation: { lat: 39.9576998, lng: -75.1881897 },
        spotLocation: { lat: 39.9576998, lng: -75.1881897 },
        name: 'Drexel Lot T Spot 4',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_t_spot_4.JPG',
        temp: 57
    }, {
        id: 14,
        distance: 'ft away',
        mapLocation: { lat: 39.9545688, lng: -75.1915902 },
        spotLocation: { lat: 39.9545688, lng: -75.1915902 },
        name: 'Off-Campus Structure',
        context: ['Private Parking Structure', '88/240 spots'],
        details: ['$13/hour'],
        image: 'spots/offcampusstructure.jpg',
        temp: 57
    }],

    initMap: function initMap() {
        this.map = new google.maps.Map(this.els.map, {
            center: { lat: 39.956135, lng: -75.190693 }, //3333 Market St, Philadelphia, PA 19104
            disableDefaultUI: true,
            gestureHandling: 'greedy',
            zoom: 15
        });

        var marker = new google.maps.Marker({
            position: this.map.getCenter(),
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                strokeColor: '#007aff'
            },
            draggable: true,
            map: this.map
        });

        this.icon = {
            path: this.garagePath,
            strokeColor: '#d380d6',
            fillOpacity: .1,
            anchor: new google.maps.Point(0, 0),
            strokeWeight: 1,
            scale: .050
        };

        this.renderIcons();

        this.update();
    },
    renderIcons: function renderIcons() {
        var _this2 = this;

        this.data.forEach(function (datum) {
            return _this2.markers[datum.id] = new google.maps.Marker({
                position: datum.spotLocation,
                map: _this2.map,
                title: datum.name,
                icon: _this2.icon
            });
        });
    },
    onSwipeStart: function onSwipeStart(e) {
        e = 'changedTouches' in e ? e.changedTouches[0] : e;
        this.touchStartCoords = { x: e.pageX, y: e.pageY };
        this.startTime = new Date().getTime();
    },
    onSwipeMove: function onSwipeMove(e) {
        e.preventDefault();
    },
    onSwipeEnd: function onSwipeEnd(e) {
        e = 'changedTouches' in e ? e.changedTouches[0] : e;
        this.touchEndCoords = { x: e.pageX - this.touchStartCoords.x, y: e.pageY - this.touchStartCoords.y };
        this.elapsedTime = new Date().getTime() - this.startTime;

        if (this.elapsedTime <= this.swipeTime) {
            if (Math.abs(this.touchEndCoords.x) >= this.minX && Math.abs(this.touchEndCoords.y) <= this.maxY) {
                this.touchEndCoords.x < 0 ? this.onSwipeLeft() : this.onSwipeRight();
            }
        }
    },
    onSwipeLeft: function onSwipeLeft() {
        this.currentSpot = this.data[this.currentSpot + 1] ? this.currentSpot + 1 : 0;

        this.update();
    },
    onSwipeRight: function onSwipeRight() {
        console.log('right');
    },
    postRender: function postRender() {
        this.currentSpot = 0;
        this.markers = {};

        window.google ? this.initMap() : window.initMap = this.initMap;

        this.bindSwipe();

        return this;
    },


    templates: {
        Dot: require('./templates/lib/dot')
    },

    update: function update() {
        var data = this.data[this.currentSpot];

        this.map.setCenter(data.mapLocation);
        this.els.temp.textContent = data.temp;
        this.els.spotName.textContent = data.name;
        this.els.distance.textContent = data.distance;
        this.els.spotContext.innerHTML = data.context.join(this.templates.Dot);
        this.els.detail.innerHTML = data.details.join(this.templates.Dot);
        this.els.image.src = '/static/img/' + data.image;
    }
});

},{"./__proto__":9,"./lib/carPath":11,"./templates/lib/dot":16}],9:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = Object.assign({}, require('../../../lib/MyObject'), require('events').EventEmitter.prototype, {

    OptimizedResize: require('./lib/OptimizedResize'),

    Xhr: require('../Xhr'),

    bindEvent: function bindEvent(key, event) {
        var _this = this;

        var els = Array.isArray(this.els[key]) ? this.els[key] : [this.els[key]];
        els.forEach(function (el) {
            return el.addEventListener(event || 'click', function (e) {
                return _this['on' + _this.capitalizeFirstLetter(key) + _this.capitalizeFirstLetter(event)](e);
            });
        });
    },


    capitalizeFirstLetter: function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    constructor: function constructor() {

        if (this.size) this.OptimizedResize.add(this.size);

        return Object.assign(this, { els: {}, slurp: { attr: 'data-js', view: 'data-view' }, views: {} }).render();
    },
    delegateEvents: function delegateEvents(key, el) {
        var _this2 = this;

        var type = _typeof(this.events[key]);

        if (type === "string") {
            this.bindEvent(key, this.events[key]);
        } else if (Array.isArray(this.events[key])) {
            this.events[key].forEach(function (eventObj) {
                return _this2.bindEvent(key, eventObj.event);
            });
        } else {
            this.bindEvent(key, this.events[key].event);
        }
    },
    delete: function _delete() {
        var _this3 = this;

        return this.hide().then(function () {
            _this3.els.container.parentNode.removeChild(_this3.els.container);
            return Promise.resolve(_this3.emit('deleted'));
        });
    },


    events: {},

    getData: function getData() {
        if (!this.model) this.model = Object.create(this.Model, { resource: { value: this.name } });

        return this.model.get();
    },
    getTemplateOptions: function getTemplateOptions() {
        return Object.assign({}, this.model ? this.model.data : {}, { user: this.user ? this.user.data : {} }, { opts: this.templateOpts ? this.templateOpts : {} });
    },
    hide: function hide() {
        var _this4 = this;

        return new Promise(function (resolve) {
            if (!document.body.contains(_this4.els.container) || _this4.isHidden()) return resolve();
            _this4.onHiddenProxy = function (e) {
                return _this4.onHidden(resolve);
            };
            _this4.els.container.addEventListener('transitionend', _this4.onHiddenProxy);
            _this4.els.container.classList.add('hide');
        });
    },
    htmlToFragment: function htmlToFragment(str) {
        var range = document.createRange();
        // make the parent of the first div in the document becomes the context node
        range.selectNode(document.getElementsByTagName("div").item(0));
        return range.createContextualFragment(str);
    },
    isHidden: function isHidden() {
        return this.els.container.classList.contains('hidden');
    },
    onHidden: function onHidden(resolve) {
        this.els.container.removeEventListener('transitionend', this.onHiddenProxy);
        this.els.container.classList.add('hidden');
        resolve(this.emit('hidden'));
    },
    onLogin: function onLogin() {
        Object.assign(this, { els: {}, slurp: { attr: 'data-js', view: 'data-view' }, views: {} }).render();
    },
    onShown: function onShown(resolve) {
        this.els.container.removeEventListener('transitionend', this.onShownProxy);
        if (this.size) this.size();
        resolve(this.emit('shown'));
    },
    showNoAccess: function showNoAccess() {
        alert("No privileges, son");
        return this;
    },
    postRender: function postRender() {
        return this;
    },
    render: function render() {
        this.slurpTemplate({ template: this.template(this.getTemplateOptions()), insertion: this.insertion });

        if (this.size) this.size();

        return this.renderSubviews().postRender();
    },
    renderSubviews: function renderSubviews() {
        var _this5 = this;

        Object.keys(this.Views || []).forEach(function (key) {
            if (_this5.Views[key].el) {
                var opts = _this5.Views[key].opts;

                opts = opts ? (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) === "object" ? opts : opts() : {};

                _this5.views[key] = _this5.factory.create(key, Object.assign({ insertion: { value: { el: _this5.Views[key].el, method: 'insertBefore' } } }, opts));
                _this5.Views[key].el.remove();
                _this5.Views[key].el = undefined;
            }
        });

        return this;
    },
    show: function show(duration) {
        var _this6 = this;

        return new Promise(function (resolve) {
            _this6.onShownProxy = function (e) {
                return _this6.onShown(resolve);
            };
            _this6.els.container.addEventListener('transitionend', _this6.onShownProxy);
            _this6.els.container.classList.remove('hide', 'hidden');
        });
    },
    slurpEl: function slurpEl(el) {
        var key = el.getAttribute(this.slurp.attr) || 'container';

        if (key === 'container') el.classList.add(this.name);

        this.els[key] = Array.isArray(this.els[key]) ? this.els[key].push(el) : this.els[key] !== undefined ? [this.els[key], el] : el;

        el.removeAttribute(this.slurp.attr);

        if (this.events[key]) this.delegateEvents(key, el);
    },
    slurpTemplate: function slurpTemplate(options) {
        var _this7 = this;

        var fragment = this.htmlToFragment(options.template),
            selector = '[' + this.slurp.attr + ']',
            viewSelector = '[' + this.slurp.view + ']';

        this.slurpEl(fragment.querySelector('*'));
        fragment.querySelectorAll(selector + ', ' + viewSelector).forEach(function (el) {
            return el.hasAttribute(_this7.slurp.attr) ? _this7.slurpEl(el) : _this7.Views[el.getAttribute(_this7.slurp.view)].el = el;
        });

        options.insertion.method === 'insertBefore' ? options.insertion.el.parentNode.insertBefore(fragment, options.insertion.el) : options.insertion.el[options.insertion.method || 'appendChild'](fragment);

        return this;
    }
});

},{"../../../lib/MyObject":21,"../Xhr":3,"./lib/OptimizedResize":10,"events":22}],10:[function(require,module,exports){
'use strict';

module.exports = Object.create({
    add: function add(callback) {
        if (!this.callbacks.length) window.addEventListener('resize', this.onResize);
        this.callbacks.push(callback);
    },
    onResize: function onResize() {
        if (this.running) return;

        this.running = true;

        window.requestAnimationFrame ? window.requestAnimationFrame(this.runCallbacks) : setTimeout(this.runCallbacks, 66);
    },
    runCallbacks: function runCallbacks() {
        this.callbacks = this.callbacks.filter(function (callback) {
            return callback();
        });
        this.running = false;
    }
}, { callbacks: { value: [] }, running: { value: false } }).add;

},{}],11:[function(require,module,exports){
"use strict";

module.exports = "M245.791,0C153.799,0,78.957,74.841,78.957,166.833c0,36.967,21.764,93.187,68.493,176.926\n\t\t\tc31.887,57.138,63.627,105.4,64.966,107.433l22.941,34.773c2.313,3.507,6.232,5.617,10.434,5.617s8.121-2.11,10.434-5.617\n\t\t\tl22.94-34.771c1.326-2.01,32.835-49.855,64.967-107.435c46.729-83.735,68.493-139.955,68.493-176.926\n\t\t\tC412.625,74.841,337.783,0,245.791,0z M322.302,331.576c-31.685,56.775-62.696,103.869-64.003,105.848l-12.508,18.959\n\t\t\tl-12.504-18.954c-1.314-1.995-32.563-49.511-64.007-105.853c-43.345-77.676-65.323-133.104-65.323-164.743\n\t\t\tC103.957,88.626,167.583,25,245.791,25s141.834,63.626,141.834,141.833C387.625,198.476,365.647,253.902,322.302,331.576zM245.791,73.291c-51.005,0-92.5,41.496-92.5,92.5s41.495,92.5,92.5,92.5s92.5-41.496,92.5-92.5\n\t\t\tS296.796,73.291,245.791,73.291z M245.791,233.291c-37.22,0-67.5-30.28-67.5-67.5s30.28-67.5,67.5-67.5\n\t\t\tc37.221,0,67.5,30.28,67.5,67.5S283.012,233.291,245.791,233.291z";

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function (p) {
  return '<div><div>' + require('./lib/logo') + '</div><div>Finding the closest parking spots...sit tight.</div>';
};

},{"./lib/logo":19}],13:[function(require,module,exports){
'use strict';

module.exports = function (p) {
    var pageUi = require('./lib/dot');
    return '<div>\n        <div class="map-wrap">\n            <div data-js="map" class="map"></div>\n            <div class="menu">\n                <div class="menu-item">\n                    <div>' + require('./lib/info') + '</div>\n                </div>\n                <div class="menu-item">\n                    <div>' + require('./lib/cursor') + '</div>\n                </div>\n            </div>\n        </div>\n        <div class="info-main">\n            <div data-js="pageUi" class="page-ui">\n                ' + Array.from(Array(p.length).keys()).map(function () {
        return pageUi;
    }).join('') + '\n            </div>\n            <div data-js="weather" class="weather">\n                <span>' + require('./lib/cloud') + '</span>\n                <span data-js="temp"></span>\n            </div>\n            <div class="snag-area">\n                <div class="line-wrap">' + require('./lib/line') + '</div>\n                <div class="button-row">\n                    <button class="snag" data-js="snag">\n                        <div>Snag This Spot</div>\n                        <div data-js="distance"></div>\n                    </button>\n                </div>\n            </div>\n            <div class="spot-details">\n                <div data-js="spotName"></div>\n                <div data-js="spotContext"></div>\n                <div data-js="detail"></div>\n                <img data-js="image" />\n            </div>\n        </div>\n    </div>';
};

},{"./lib/cloud":14,"./lib/cursor":15,"./lib/dot":16,"./lib/info":17,"./lib/line":18}],14:[function(require,module,exports){
"use strict";

module.exports = "<svg class=\"cloud\" version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 496 496\" style=\"enable-background:new 0 0 496 496;\" xml:space=\"preserve\">\n<g>\n\t<g>\n\t\t<path d=\"M413.968,233.096c-10.832-63.92-65.816-111.512-130.944-112.96C265.88,90.336,234.536,72,200,72\n\t\t\tc-40.936,0-77.168,26.096-90.52,64.288c-20.696-2.144-40.208,7.464-51.624,24.056C25.08,163.424,0,190.6,0,224\n\t\t\tc0,20.104,9.424,38.616,25.04,50.616C9.568,290.488,0,312.136,0,336c0,48.52,39.48,88,88,88h312c52.936,0,96-43.064,96-96\n\t\t\tC496,280.424,460.464,239.928,413.968,233.096z M16,224c0-26.144,20.496-47.192,46.648-47.928l4.472-0.128l2.232-3.872\n\t\t\tc8.648-14.984,25.728-23.24,43.864-18.96l7.56,1.792l2-7.512C132.104,112.424,163.848,88,200,88\n\t\t\tc25.88,0,49.584,12.416,64.496,32.984c-53.496,6.096-98.608,43.224-114.44,95.288C148.008,216.088,145.984,216,144,216\n\t\t\tc-24.032,0-46.56,12.184-59.856,32.08c-17.272,0.752-33.248,6.528-46.552,15.864C24.2,255.096,16,240.24,16,224z M400,408H88\n\t\t\tc-39.704,0-72-32.296-72-72c0-39.704,32.296-72,71.688-72.008l5.536,0.04l2.304-3.992C105.536,242.744,124.12,232,144,232\n\t\t\tc3.352,0,6.856,0.336,10.424,1.008l7.424,1.4l1.824-7.336C176.96,173.448,224.8,136,280,136\n\t\t\tc60.512,0,111.672,45.28,119.008,105.32l0.56,4.592C399.84,249.24,400,252.6,400,256c0,66.168-53.832,120-120,120v16\n\t\t\tc74.992,0,136-61.008,136-136c0-2.12-0.176-4.2-0.272-6.296C452.432,257.088,480,289.776,480,328C480,372.112,444.112,408,400,408\n\t\t\tz\"/>\n\t</g>\n</g>\n</svg>";

},{}],15:[function(require,module,exports){
"use strict";

module.exports = "<svg class=\"cursor\" version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 512 512\" style=\"enable-background:new 0 0 512 512;\" xml:space=\"preserve\"><g><path d=\"M503.842,8.333c-0.03-0.03-0.054-0.062-0.084-0.092s-0.062-0.054-0.092-0.082c-7.968-7.902-19.398-10.276-29.86-6.185 L17.789,180.281c-12.056,4.713-19.119,16.516-17.58,29.367c1.543,12.852,11.196,22.649,24.023,24.378l222.877,30.058 c0.417,0.057,0.751,0.389,0.808,0.809l30.058,222.875c1.729,12.827,11.526,22.482,24.378,24.023 c1.174,0.141,2.337,0.208,3.489,0.208c11.458,0,21.594-6.834,25.878-17.787L510.029,38.19 C514.118,27.73,511.745,16.302,503.842,8.333z M27.847,207.253c-0.5-0.068-0.725-0.097-0.812-0.821 c-0.086-0.724,0.126-0.808,0.593-0.989L454.282,38.616L254.727,238.173C253.426,237.796,27.847,207.253,27.847,207.253z M306.558,484.373c-0.182,0.467-0.255,0.682-0.989,0.592c-0.723-0.086-0.754-0.313-0.82-0.81c0,0-30.543-225.579-30.92-226.88\tL473.384,57.719L306.558,484.373z\"/>\t</g></svg>";

},{}],16:[function(require,module,exports){
"use strict";

module.exports = "<svg class=\"dot\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\">\n  <circle cx=\"10\" cy=\"10\" r=\"10\"/>\n</svg>";

},{}],17:[function(require,module,exports){
"use strict";

module.exports = "<svg class=\"info\"version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 330 330\" style=\"enable-background:new 0 0 330 330;\" xml:space=\"preserve\"><g><path d=\"M165,0C74.019,0,0,74.02,0,165.001C0,255.982,74.019,330,165,330s165-74.018,165-164.999C330,74.02,255.981,0,165,0z M165,300c-74.44,0-135-60.56-135-134.999C30,90.562,90.56,30,165,30s135,60.562,135,135.001C300,239.44,239.439,300,165,300z\"/><path d=\"M164.998,70c-11.026,0-19.996,8.976-19.996,20.009c0,11.023,8.97,19.991,19.996,19.991c11.026,0,19.996-8.968,19.996-19.991C184.994,78.976,176.024,70,164.998,70z\"/><path d=\"M165,140c-8.284,0-15,6.716-15,15v90c0,8.284,6.716,15,15,15c8.284,0,15-6.716,15-15v-90C180,146.716,173.284,140,165,140z\"/></g></svg>";

},{}],18:[function(require,module,exports){
"use strict";

module.exports = "<svg viewBox=\"0 0 20 20\" class=\"line\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n    <line stroke-linecap=\"round\" x1=\"5\" y1=\"10\" x2=\"20\" y2=\"10\" stroke=\"black\" stroke-width=\"5\"/>\n</svg>";

},{}],19:[function(require,module,exports){
"use strict";

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 591.52 919.41\"><defs><style>.cls-1,.cls-5{fill:#231f20;}.cls-1,.cls-2{fill-rule:evenodd;}.cls-2{fill:url(#New_Gradient);}.cls-3{font-size:245.5px;font-family:Impact, Impact;}.cls-3,.cls-4{fill:#fff;}.cls-5{font-size:54.89px;font-family:AvenirNext-Regular, Avenir Next;letter-spacing:0.4em;}.cls-6{letter-spacing:0.38em;}.cls-7{letter-spacing:0.4em;}</style><linearGradient id=\"New_Gradient\" x1=\"-194.65\" y1=\"994.88\" x2=\"-194.65\" y2=\"1060.92\" gradientTransform=\"translate(1942.27 -8210.14) scale(8.5)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.31\" stop-color=\"#2986a5\"/><stop offset=\"0.69\" stop-color=\"#1c708c\"/></linearGradient></defs><title>Asset 2</title><g id=\"Layer_2\" data-name=\"Layer 2\"><g id=\"Layer_1-2\" data-name=\"Layer 1\"><path class=\"cls-1\" d=\"M478.78,245.55C358.16,205.83,363,50.13,152.42,0c13.8,49.36,22.49,77.15,28.82,128.78l51.52,5.68c-26,6.76-51.41,8.49-55.68,32.54-12.36,70.38-58.17,59.31-81.94,81.52a125.9,125.9,0,0,0,20.28,1.62,121.52,121.52,0,0,0,36.83-5.66l0,.1A121.56,121.56,0,0,0,185.56,228l15.84-11.21L217.25,228a121.48,121.48,0,0,0,33.27,16.57l0-.1a123.6,123.6,0,0,0,73.64.1v-.1A120.83,120.83,0,0,0,357.49,228l15.84-11.21L389.18,228a121.18,121.18,0,0,0,33.27,16.57l0-.1a121.46,121.46,0,0,0,36.82,5.66,124.45,124.45,0,0,0,17.48-1.24,5.12,5.12,0,0,0,2-3.36Z\"/><path class=\"cls-2\" d=\"M573.93,264.58V812H0V268.2a147.8,147.8,0,0,0,33.44-17.77,149,149,0,0,0,171.94,0,149,149,0,0,0,171.93,0,149,149,0,0,0,171.95,0,149.11,149.11,0,0,0,24.67,14.14Z\"/><text class=\"cls-3\" transform=\"translate(47.25 722.62) scale(0.83 1)\">shark</text><path class=\"cls-4\" d=\"M190.92,369.82l-.69,14.06q5.36-8.52,11.81-12.73a25.32,25.32,0,0,1,14.1-4.2A23.47,23.47,0,0,1,232.27,373a25.69,25.69,0,0,1,8.49,14q1.69,7.91,1.69,26.85v67q0,21.7-2.13,30.87a26,26,0,0,1-8.74,14.63,24.22,24.22,0,0,1-15.94,5.45,24.52,24.52,0,0,1-13.8-4.2,40.87,40.87,0,0,1-11.62-12.49v36.47H150.11V369.82Zm11.42,46.27q0-14.74-.89-17.86t-5-3.12a4.85,4.85,0,0,0-5.11,3.6q-1.14,3.6-1.14,17.38V482q0,14.38,1.19,18a4.93,4.93,0,0,0,5.16,3.6q3.87,0,4.82-3.3t.94-16Z\"/><path class=\"cls-4\" d=\"M292.49,431.43H254.86V420.76q0-18.46,3.52-28.47t14.15-17.68q10.62-7.67,27.6-7.67,20.35,0,30.68,8.69A34.58,34.58,0,0,1,343.23,397q2.09,12.65,2.08,52.08v79.84h-39V514.72q-3.67,8.53-9.48,12.79A22.78,22.78,0,0,1,283,531.77a30,30,0,0,1-19.31-7.13q-8.79-7.13-8.79-31.23V480.34q0-17.86,4.67-24.33t23.13-15.1q19.76-9.35,21.15-12.59t1.39-13.19q0-12.47-1.54-16.24t-5.11-3.78q-4.07,0-5.06,3.18t-1,16.48Zm12.71,21.82q-9.63,8.51-11.17,14.26t-1.54,16.54q0,12.35,1.34,15.94a5.17,5.17,0,0,0,5.31,3.6q3.77,0,4.92-2.82T305.2,486Z\"/><path class=\"cls-4\" d=\"M399.23,369.82l-1.59,20.92q8.74-22.47,25.32-23.79v56q-11,0-16.18,3.6a15.06,15.06,0,0,0-6.35,10q-1.19,6.41-1.19,29.55v62.81H359.12V369.82Z\"/><path class=\"cls-4\" d=\"M518.27,369.82,502,433.17l21.15,95.72H484.56l-12.51-69.33,0,69.33H431.89V334.82H472l0,81.47,12.51-46.47Z\"/><text class=\"cls-5\" transform=\"translate(0.71 896.85)\">stop ci<tspan class=\"cls-6\" x=\"318.73\" y=\"0\">r</tspan><tspan class=\"cls-7\" x=\"359.46\" y=\"0\">cling</tspan></text></g></g></svg>";

},{}],20:[function(require,module,exports){
"use strict";

module.exports = function (err) {
  console.log(err.stack || err);
};

},{}],21:[function(require,module,exports){
'use strict';

module.exports = {

    Error: require('./MyError'),

    P: function P(fun) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var thisArg = arguments[2];
        return new Promise(function (resolve, reject) {
            return Reflect.apply(fun, thisArg || undefined, args.concat(function (e) {
                for (var _len = arguments.length, callback = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    callback[_key - 1] = arguments[_key];
                }

                return e ? reject(e) : resolve(callback);
            }));
        });
    },

    constructor: function constructor() {
        return this;
    }
};

},{"./MyError":20}],22:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzL1hoci5qcyIsImNsaWVudC9qcy9mYWN0b3J5L1ZpZXcuanMiLCJjbGllbnQvanMvbWFpbi5qcyIsImNsaWVudC9qcy9yb3V0ZXIuanMiLCJjbGllbnQvanMvdmlld3MvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy9TbmFnLmpzIiwiY2xpZW50L2pzL3ZpZXdzL19fcHJvdG9fXy5qcyIsImNsaWVudC9qcy92aWV3cy9saWIvT3B0aW1pemVkUmVzaXplLmpzIiwiY2xpZW50L2pzL3ZpZXdzL2xpYi9jYXJQYXRoLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9Ib21lLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9TbmFnLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvY2xvdWQuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9jdXJzb3IuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9kb3QuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9pbmZvLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvbGluZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvbGliL2xvZ28uanMiLCJsaWIvTXlFcnJvci5qcyIsImxpYi9NeU9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLE9BQU0sUUFBUSx3QkFBUixDQURRO0FBRWQsT0FBTSxRQUFRLHdCQUFSO0FBRlEsQ0FBZjs7Ozs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLE9BQU0sUUFBUSxjQUFSLENBRFE7QUFFZCxPQUFNLFFBQVEsY0FBUjtBQUZRLENBQWY7Ozs7O0FDQUEsT0FBTyxPQUFQLEdBQWlCLE9BQU8sTUFBUCxDQUFlLE9BQU8sTUFBUCxDQUFlLEVBQWYsRUFBbUIsUUFBUSxvQkFBUixDQUFuQixFQUFrRDs7QUFFOUUsYUFBUztBQUVMLG1CQUZLLHVCQUVRLElBRlIsRUFFZTtBQUFBOztBQUNoQixnQkFBSSxNQUFNLElBQUksY0FBSixFQUFWOztBQUVBLG1CQUFPLElBQUksT0FBSixDQUFhLFVBQUUsT0FBRixFQUFXLE1BQVgsRUFBdUI7O0FBRXZDLG9CQUFJLE1BQUosR0FBYSxZQUFXO0FBQ3BCLHFCQUFFLEdBQUYsRUFBTyxHQUFQLEVBQVksR0FBWixFQUFrQixRQUFsQixDQUE0QixLQUFLLE1BQWpDLElBQ00sT0FBUSxLQUFLLFFBQWIsQ0FETixHQUVNLFFBQVMsS0FBSyxLQUFMLENBQVcsS0FBSyxRQUFoQixDQUFULENBRk47QUFHSCxpQkFKRDs7QUFNQSxvQkFBSSxLQUFLLE1BQUwsS0FBZ0IsS0FBaEIsSUFBeUIsS0FBSyxNQUFMLEtBQWdCLFNBQTdDLEVBQXlEO0FBQ3JELHdCQUFJLEtBQUssS0FBSyxFQUFMLFNBQWMsS0FBSyxFQUFuQixHQUEwQixFQUFuQztBQUNBLHdCQUFJLElBQUosQ0FBVSxLQUFLLE1BQWYsUUFBMkIsS0FBSyxRQUFoQyxHQUEyQyxFQUEzQztBQUNBLDBCQUFLLFVBQUwsQ0FBaUIsR0FBakIsRUFBc0IsS0FBSyxPQUEzQjtBQUNBLHdCQUFJLElBQUosQ0FBUyxJQUFUO0FBQ0gsaUJBTEQsTUFLTztBQUNILHdCQUFJLElBQUosQ0FBVSxLQUFLLE1BQWYsUUFBMkIsS0FBSyxRQUFoQyxFQUE0QyxJQUE1QztBQUNBLDBCQUFLLFVBQUwsQ0FBaUIsR0FBakIsRUFBc0IsS0FBSyxPQUEzQjtBQUNBLHdCQUFJLElBQUosQ0FBVSxLQUFLLElBQWY7QUFDSDtBQUNKLGFBbEJNLENBQVA7QUFtQkgsU0F4Qkk7QUEwQkwsbUJBMUJLLHVCQTBCUSxLQTFCUixFQTBCZ0I7QUFDakI7QUFDQTtBQUNBLG1CQUFPLE1BQU0sT0FBTixDQUFjLFdBQWQsRUFBMkIsTUFBM0IsQ0FBUDtBQUNILFNBOUJJO0FBZ0NMLGtCQWhDSyxzQkFnQ08sR0FoQ1AsRUFnQ3lCO0FBQUEsZ0JBQWIsT0FBYSx1RUFBTCxFQUFLOztBQUMxQixnQkFBSSxnQkFBSixDQUFzQixRQUF0QixFQUFnQyxRQUFRLE1BQVIsSUFBa0Isa0JBQWxEO0FBQ0EsZ0JBQUksZ0JBQUosQ0FBc0IsY0FBdEIsRUFBc0MsUUFBUSxXQUFSLElBQXVCLFlBQTdEO0FBQ0g7QUFuQ0ksS0FGcUU7O0FBd0M5RSxZQXhDOEUsb0JBd0NwRSxJQXhDb0UsRUF3QzdEO0FBQ2IsZUFBTyxPQUFPLE1BQVAsQ0FBZSxLQUFLLE9BQXBCLEVBQTZCLEVBQTdCLEVBQW1DLFdBQW5DLENBQWdELElBQWhELENBQVA7QUFDSCxLQTFDNkU7QUE0QzlFLGVBNUM4RSx5QkE0Q2hFOztBQUVWLFlBQUksQ0FBQyxlQUFlLFNBQWYsQ0FBeUIsWUFBOUIsRUFBNkM7QUFDM0MsMkJBQWUsU0FBZixDQUF5QixZQUF6QixHQUF3QyxVQUFTLEtBQVQsRUFBZ0I7QUFDdEQsb0JBQUksU0FBUyxNQUFNLE1BQW5CO0FBQUEsb0JBQTJCLFVBQVUsSUFBSSxVQUFKLENBQWUsTUFBZixDQUFyQztBQUNBLHFCQUFLLElBQUksT0FBTyxDQUFoQixFQUFtQixPQUFPLE1BQTFCLEVBQWtDLE1BQWxDLEVBQTBDO0FBQ3hDLDRCQUFRLElBQVIsSUFBZ0IsTUFBTSxVQUFOLENBQWlCLElBQWpCLElBQXlCLElBQXpDO0FBQ0Q7QUFDRCxxQkFBSyxJQUFMLENBQVUsT0FBVjtBQUNELGFBTkQ7QUFPRDs7QUFFRCxlQUFPLEtBQUssUUFBTCxDQUFjLElBQWQsQ0FBbUIsSUFBbkIsQ0FBUDtBQUNIO0FBekQ2RSxDQUFsRCxDQUFmLEVBMkRaLEVBM0RZLEVBMkROLFdBM0RNLEVBQWpCOzs7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQixPQUFPLE1BQVAsQ0FBZTtBQUU1QixVQUY0QixrQkFFcEIsSUFGb0IsRUFFZCxJQUZjLEVBRVA7QUFDakIsWUFBTSxRQUFRLElBQWQ7QUFDQSxlQUFPLEtBQUssTUFBTCxDQUFZLENBQVosRUFBZSxXQUFmLEtBQStCLEtBQUssS0FBTCxDQUFXLENBQVgsQ0FBdEM7QUFDQSxlQUFPLE9BQU8sTUFBUCxDQUNILEtBQUssS0FBTCxDQUFZLElBQVosQ0FERyxFQUVILE9BQU8sTUFBUCxDQUFlO0FBQ1gsa0JBQU0sRUFBRSxPQUFPLElBQVQsRUFESztBQUVYLHFCQUFTLEVBQUUsT0FBTyxJQUFULEVBRkU7QUFHWCxzQkFBVSxFQUFFLE9BQU8sS0FBSyxTQUFMLENBQWdCLElBQWhCLENBQVQsRUFIQztBQUlYLGtCQUFNLEVBQUUsT0FBTyxLQUFLLElBQWQ7QUFKSyxTQUFmLEVBS08sSUFMUCxDQUZHLEVBUUwsV0FSSyxHQVNOLEVBVE0sQ0FTRixVQVRFLEVBU1U7QUFBQSxtQkFBUyxRQUFRLFdBQVIsRUFBcUIsUUFBckIsQ0FBK0IsS0FBL0IsQ0FBVDtBQUFBLFNBVFYsRUFVTixFQVZNLENBVUYsU0FWRSxFQVVTO0FBQUEsbUJBQU0sT0FBUSxRQUFRLFdBQVIsQ0FBRCxDQUF1QixLQUF2QixDQUE2QixJQUE3QixDQUFiO0FBQUEsU0FWVCxDQUFQO0FBV0g7QUFoQjJCLENBQWYsRUFrQmQ7QUFDQyxlQUFXLEVBQUUsT0FBTyxRQUFRLGlCQUFSLENBQVQsRUFEWjtBQUVDLFdBQU8sRUFBRSxPQUFPLFFBQVEsYUFBUixDQUFUO0FBRlIsQ0FsQmMsQ0FBakI7Ozs7O0FDQUEsT0FBTyxPQUFQLEdBQWlCO0FBQUEsU0FBTSxJQUFOO0FBQUEsQ0FBakI7QUFDQSxPQUFPLE1BQVAsR0FBZ0I7QUFBQSxTQUFNLFFBQVEsVUFBUixDQUFOO0FBQUEsQ0FBaEI7Ozs7O0FDREEsT0FBTyxPQUFQLEdBQWlCLE9BQU8sTUFBUCxDQUFlOztBQUU1QixXQUFPLFFBQVEsbUJBQVIsQ0FGcUI7O0FBSTVCLGlCQUFhLFFBQVEsZ0JBQVIsQ0FKZTs7QUFNNUIsV0FBTyxRQUFRLFlBQVIsQ0FOcUI7O0FBUTVCLGVBUjRCLHlCQVFkO0FBQ1YsYUFBSyxnQkFBTCxHQUF3QixTQUFTLGFBQVQsQ0FBdUIsVUFBdkIsQ0FBeEI7O0FBRUEsZUFBTyxVQUFQLEdBQW9CLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsSUFBakIsQ0FBcEI7O0FBRUEsYUFBSyxNQUFMOztBQUVBLGVBQU8sSUFBUDtBQUNILEtBaEIyQjtBQWtCNUIsVUFsQjRCLG9CQWtCbkI7QUFDTCxhQUFLLE9BQUwsQ0FBYyxPQUFPLFFBQVAsQ0FBZ0IsUUFBaEIsQ0FBeUIsS0FBekIsQ0FBK0IsR0FBL0IsRUFBb0MsS0FBcEMsQ0FBMEMsQ0FBMUMsQ0FBZDtBQUNILEtBcEIyQjtBQXNCNUIsV0F0QjRCLG1CQXNCbkIsSUF0Qm1CLEVBc0JaO0FBQUE7O0FBQ1osWUFBTSxPQUFPLEtBQUssQ0FBTCxJQUFVLEtBQUssQ0FBTCxFQUFRLE1BQVIsQ0FBZSxDQUFmLEVBQWtCLFdBQWxCLEtBQWtDLEtBQUssQ0FBTCxFQUFRLEtBQVIsQ0FBYyxDQUFkLENBQTVDLEdBQStELEVBQTVFO0FBQUEsWUFDTSxPQUFPLEtBQUssS0FBTCxDQUFXLElBQVgsSUFBbUIsS0FBSyxDQUFMLENBQW5CLEdBQTZCLE1BRDFDOztBQUdBLFNBQUksU0FBUyxLQUFLLFdBQWhCLEdBQ0ksUUFBUSxPQUFSLEVBREosR0FFSSxRQUFRLEdBQVIsQ0FBYSxPQUFPLElBQVAsQ0FBYSxLQUFLLEtBQWxCLEVBQTBCLEdBQTFCLENBQStCO0FBQUEsbUJBQVEsTUFBSyxLQUFMLENBQVksSUFBWixFQUFtQixJQUFuQixFQUFSO0FBQUEsU0FBL0IsQ0FBYixDQUZOLEVBR0MsSUFIRCxDQUdPLFlBQU07O0FBRVQsa0JBQUssV0FBTCxHQUFtQixJQUFuQjs7QUFFQSxnQkFBSSxNQUFLLEtBQUwsQ0FBWSxJQUFaLENBQUosRUFBeUIsT0FBTyxNQUFLLEtBQUwsQ0FBWSxJQUFaLEVBQW1CLFFBQW5CLENBQTZCLElBQTdCLENBQVA7O0FBRXpCLG1CQUFPLFFBQVEsT0FBUixDQUNILE1BQUssS0FBTCxDQUFZLElBQVosSUFDSSxNQUFLLFdBQUwsQ0FBaUIsTUFBakIsQ0FBeUIsSUFBekIsRUFBK0I7QUFDM0IsMkJBQVcsRUFBRSxPQUFPLEVBQUUsSUFBSSxNQUFLLGdCQUFYLEVBQVQsRUFEZ0I7QUFFM0Isc0JBQU0sRUFBRSxPQUFPLElBQVQsRUFBZSxVQUFVLElBQXpCO0FBRnFCLGFBQS9CLENBRkQsQ0FBUDtBQU9ILFNBaEJELEVBaUJDLEtBakJELENBaUJRLEtBQUssS0FqQmI7QUFrQkgsS0E1QzJCO0FBOEM1QixZQTlDNEIsb0JBOENsQixRQTlDa0IsRUE4Q1A7QUFDakIsZ0JBQVEsU0FBUixDQUFtQixFQUFuQixFQUF1QixFQUF2QixFQUEyQixRQUEzQjtBQUNBLGFBQUssTUFBTDtBQUNIO0FBakQyQixDQUFmLEVBbURkLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBVCxFQUFhLFVBQVUsSUFBdkIsRUFBZixFQUE4QyxPQUFPLEVBQUUsT0FBTyxFQUFULEVBQXJELEVBbkRjLEVBbUQwRCxXQW5EMUQsRUFBakI7Ozs7O0FDQUEsT0FBTyxPQUFQLEdBQWlCLE9BQU8sTUFBUCxDQUFlLEVBQWYsRUFBbUIsUUFBUSxhQUFSLENBQW5CLEVBQTJDO0FBRXhELGNBRndELHdCQUUzQztBQUFBOztBQUNULG1CQUFZO0FBQUEsbUJBQU0sTUFBSyxJQUFMLEdBQVksSUFBWixDQUFrQjtBQUFBLHVCQUFNLE1BQUssSUFBTCxDQUFXLFVBQVgsRUFBdUIsTUFBdkIsQ0FBTjtBQUFBLGFBQWxCLEVBQTBELEtBQTFELENBQWlFLE1BQUssS0FBdEUsQ0FBTjtBQUFBLFNBQVosRUFBaUcsSUFBakc7O0FBRUEsZUFBTyxJQUFQO0FBQ0g7QUFOdUQsQ0FBM0MsQ0FBakI7Ozs7O0FDQUEsT0FBTyxPQUFQLEdBQWlCLE9BQU8sTUFBUCxDQUFlLEVBQWYsRUFBbUIsUUFBUSxhQUFSLENBQW5CLEVBQTJDOztBQUV4RCxnQkFBWSxRQUFRLGVBQVIsQ0FGNEM7O0FBSXhELGFBSndELHVCQUk1QztBQUFBOztBQUNSLGFBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNBLGFBQUssSUFBTCxHQUFZLEVBQVo7QUFDQSxhQUFLLElBQUwsR0FBWSxFQUFaOztBQUVBLGFBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsZ0JBQW5CLENBQXFDLFdBQXJDLEVBQW1EO0FBQUEsbUJBQUssTUFBSyxZQUFMLENBQWtCLENBQWxCLENBQUw7QUFBQSxTQUFuRCxFQUE4RSxLQUE5RTtBQUNBLGFBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsZ0JBQW5CLENBQXFDLFlBQXJDLEVBQW1EO0FBQUEsbUJBQUssTUFBSyxZQUFMLENBQWtCLENBQWxCLENBQUw7QUFBQSxTQUFuRCxFQUE4RSxLQUE5RTtBQUNBLGFBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsZ0JBQW5CLENBQXFDLFdBQXJDLEVBQWtEO0FBQUEsbUJBQUssTUFBSyxXQUFMLENBQWlCLENBQWpCLENBQUw7QUFBQSxTQUFsRCxFQUE0RSxLQUE1RTtBQUNBLGFBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsZ0JBQW5CLENBQXFDLFdBQXJDLEVBQWtEO0FBQUEsbUJBQUssTUFBSyxXQUFMLENBQWlCLENBQWpCLENBQUw7QUFBQSxTQUFsRCxFQUE0RSxLQUE1RTtBQUNBLGFBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsZ0JBQW5CLENBQXFDLFNBQXJDLEVBQWdEO0FBQUEsbUJBQUssTUFBSyxVQUFMLENBQWdCLENBQWhCLENBQUw7QUFBQSxTQUFoRCxFQUF5RSxLQUF6RTtBQUNBLGFBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsZ0JBQW5CLENBQXFDLFVBQXJDLEVBQWlEO0FBQUEsbUJBQUssTUFBSyxVQUFMLENBQWdCLENBQWhCLENBQUw7QUFBQSxTQUFqRCxFQUEwRSxLQUExRTtBQUNILEtBZnVEO0FBaUJ4RCxzQkFqQndELGdDQWlCbkM7QUFBRSxlQUFPLEtBQUssSUFBWjtBQUFrQixLQWpCZTs7O0FBbUJ4RCxVQUFNO0FBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQTtBQUNJLFlBQUksQ0FEUjtBQUVJLGtCQUFVLFNBRmQ7QUFHSSxxQkFBYSxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFIakI7QUFJSSxzQkFBYyxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFKbEI7QUFLSSxjQUFNLGNBTFY7QUFNSSxpQkFBUyxDQUNMLDJCQURLLEVBRUwsY0FGSyxDQU5iO0FBVUksaUJBQVMsQ0FDTCxPQURLLEVBRUwsU0FGSyxFQUdMLGFBSEssQ0FWYjtBQWVJLGVBQU8saUJBZlg7QUFnQkksY0FBTTtBQWhCVixLQW5CRSxFQXFDRjtBQUNJLFlBQUksQ0FEUjtBQUVJLGtCQUFVLFNBRmQ7QUFHSSxxQkFBYSxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFIakI7QUFJSSxzQkFBYyxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFKbEI7QUFLSSxjQUFNLHNCQUxWO0FBTUksaUJBQVMsQ0FDTCwyQkFESyxFQUVMLGNBRkssQ0FOYjtBQVVJLGlCQUFTLENBQ0wsYUFESyxDQVZiO0FBYUksZUFBTyx5QkFiWDtBQWNJLGNBQU07QUFkVixLQXJDRSxFQXFERjtBQUNJLFlBQUksQ0FEUjtBQUVJLGtCQUFVLFNBRmQ7QUFHSSxxQkFBYSxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFIakI7QUFJSSxzQkFBYyxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFKbEI7QUFLSSxjQUFNLHFCQUxWO0FBTUksaUJBQVMsQ0FDTCwyQkFESyxFQUVMLGNBRkssQ0FOYjtBQVVJLGlCQUFTLENBQ0wsYUFESyxDQVZiO0FBYUksZUFBTyx3QkFiWDtBQWNJLGNBQU07QUFkVixLQXJERSxFQXFFRjtBQUNJLFlBQUksQ0FEUjtBQUVJLGtCQUFVLFNBRmQ7QUFHSSxxQkFBYSxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFIakI7QUFJSSxzQkFBYyxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFKbEI7QUFLSSxjQUFNLHNCQUxWO0FBTUksaUJBQVMsQ0FDTCwyQkFESyxFQUVMLGNBRkssQ0FOYjtBQVVJLGlCQUFTLENBQ0wsYUFESyxDQVZiO0FBYUksZUFBTyx5QkFiWDtBQWNJLGNBQU07QUFkVixLQXJFRSxFQXFGRjtBQUNJLFlBQUksQ0FEUjtBQUVJLGtCQUFVLFNBRmQ7QUFHSSxxQkFBYSxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFIakI7QUFJSSxzQkFBYyxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFKbEI7QUFLSSxjQUFNLHNCQUxWO0FBTUksaUJBQVMsQ0FDTCwyQkFESyxFQUVMLGNBRkssQ0FOYjtBQVVJLGlCQUFTLENBQ0wsYUFESyxDQVZiO0FBYUksZUFBTyx5QkFiWDtBQWNJLGNBQU07QUFkVixLQXJGRSxFQXFHRjtBQUNJLFlBQUksQ0FEUjtBQUVJLGtCQUFVLFNBRmQ7QUFHSSxxQkFBYSxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsV0FBekIsRUFIakI7QUFJSSxzQkFBYyxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsV0FBekIsRUFKbEI7QUFLSSxjQUFNLGNBTFY7QUFNSSxpQkFBUyxDQUNMLDJCQURLLEVBRUwsY0FGSyxDQU5iO0FBVUksaUJBQVMsQ0FDTCxhQURLLENBVmI7QUFhSSxlQUFPLGlCQWJYO0FBY0ksY0FBTTtBQWRWLEtBckdFLEVBcUhGO0FBQ0ksWUFBSSxDQURSO0FBRUksa0JBQVUsU0FGZDtBQUdJLHFCQUFhLEVBQUUsS0FBSyxVQUFQLEVBQW1CLEtBQUssQ0FBQyxVQUF6QixFQUhqQjtBQUlJLHNCQUFjLEVBQUUsS0FBSyxVQUFQLEVBQW1CLEtBQUssQ0FBQyxVQUF6QixFQUpsQjtBQUtJLGNBQU0sdUJBTFY7QUFNSSxpQkFBUyxDQUNMLDJCQURLLEVBRUwsY0FGSyxDQU5iO0FBVUksaUJBQVMsQ0FDTCxhQURLLENBVmI7QUFhSSxlQUFPLDBCQWJYO0FBY0ksY0FBTTtBQWRWLEtBckhFLEVBcUlGO0FBQ0ksWUFBSSxDQURSO0FBRUksa0JBQVUsU0FGZDtBQUdJLHFCQUFhLEVBQUUsS0FBSyxVQUFQLEVBQW1CLEtBQUssQ0FBQyxVQUF6QixFQUhqQjtBQUlJLHNCQUFjLEVBQUUsS0FBSyxVQUFQLEVBQW1CLEtBQUssQ0FBQyxVQUF6QixFQUpsQjtBQUtJLGNBQU0sY0FMVjtBQU1JLGlCQUFTLENBQ0wsMkJBREssRUFFTCxjQUZLLENBTmI7QUFVSSxpQkFBUyxDQUNMLGFBREssQ0FWYjtBQWFJLGVBQU8saUJBYlg7QUFjSSxjQUFNO0FBZFYsS0FySUUsRUFxSkY7QUFDSSxZQUFJLENBRFI7QUFFSSxrQkFBVSxTQUZkO0FBR0kscUJBQWEsRUFBRSxLQUFLLFVBQVAsRUFBbUIsS0FBSyxDQUFDLFVBQXpCLEVBSGpCO0FBSUksc0JBQWMsRUFBRSxLQUFLLFVBQVAsRUFBbUIsS0FBSyxDQUFDLFVBQXpCLEVBSmxCO0FBS0ksY0FBTSxxQkFMVjtBQU1JLGlCQUFTLENBQ0wsMkJBREssRUFFTCxjQUZLLENBTmI7QUFVSSxpQkFBUyxDQUNMLGFBREssQ0FWYjtBQWFJLGVBQU8sd0JBYlg7QUFjSSxjQUFNO0FBZFYsS0FySkUsRUFxS0Y7QUFDSSxZQUFJLEVBRFI7QUFFSSxrQkFBVSxTQUZkO0FBR0kscUJBQWEsRUFBRSxLQUFLLFVBQVAsRUFBbUIsS0FBSyxDQUFDLFVBQXpCLEVBSGpCO0FBSUksc0JBQWMsRUFBRSxLQUFLLFVBQVAsRUFBbUIsS0FBSyxDQUFDLFVBQXpCLEVBSmxCO0FBS0ksY0FBTSxzQkFMVjtBQU1JLGlCQUFTLENBQ0wsMkJBREssRUFFTCxjQUZLLENBTmI7QUFVSSxpQkFBUyxDQUNMLGFBREssQ0FWYjtBQWFJLGVBQU8seUJBYlg7QUFjSSxjQUFNO0FBZFYsS0FyS0UsRUFxTEY7QUFDSSxZQUFJLEVBRFI7QUFFSSxrQkFBVSxTQUZkO0FBR0kscUJBQWEsRUFBRSxLQUFLLFVBQVAsRUFBbUIsS0FBSyxDQUFDLFVBQXpCLEVBSGpCO0FBSUksc0JBQWMsRUFBRSxLQUFLLFVBQVAsRUFBbUIsS0FBSyxDQUFDLFVBQXpCLEVBSmxCO0FBS0ksY0FBTSxjQUxWO0FBTUksaUJBQVMsQ0FDTCwyQkFESyxFQUVMLGNBRkssQ0FOYjtBQVVJLGlCQUFTLENBQ0wsYUFESyxDQVZiO0FBYUksZUFBTyx5QkFiWDtBQWNJLGNBQU07QUFkVixLQXJMRSxFQXFNRjtBQUNJLFlBQUksRUFEUjtBQUVJLGtCQUFVLFNBRmQ7QUFHSSxxQkFBYSxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFIakI7QUFJSSxzQkFBYyxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFKbEI7QUFLSSxjQUFNLHFCQUxWO0FBTUksaUJBQVMsQ0FDTCwyQkFESyxFQUVMLGNBRkssQ0FOYjtBQVVJLGlCQUFTLENBQ0wsYUFESyxDQVZiO0FBYUksZUFBTyx3QkFiWDtBQWNJLGNBQU07QUFkVixLQXJNRSxFQXFORjtBQUNJLFlBQUksRUFEUjtBQUVJLGtCQUFVLFNBRmQ7QUFHSSxxQkFBYSxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFIakI7QUFJSSxzQkFBYyxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFKbEI7QUFLSSxjQUFNLHFCQUxWO0FBTUksaUJBQVMsQ0FDTCwyQkFESyxFQUVMLGNBRkssQ0FOYjtBQVVJLGlCQUFTLENBQ0wsYUFESyxDQVZiO0FBYUksZUFBTyx3QkFiWDtBQWNJLGNBQU07QUFkVixLQXJORSxFQXFPRjtBQUNJLFlBQUksRUFEUjtBQUVJLGtCQUFVLFNBRmQ7QUFHSSxxQkFBYSxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFIakI7QUFJSSxzQkFBYyxFQUFFLEtBQUssVUFBUCxFQUFtQixLQUFLLENBQUMsVUFBekIsRUFKbEI7QUFLSSxjQUFNLHNCQUxWO0FBTUksaUJBQVMsQ0FDTCwyQkFESyxFQUVMLGNBRkssQ0FOYjtBQVVJLGlCQUFTLENBQ0wsVUFESyxDQVZiO0FBYUksZUFBTyw4QkFiWDtBQWNJLGNBQU07QUFkVixLQXJPRSxDQW5Ca0Q7O0FBMFF4RCxXQTFRd0QscUJBMFE5QztBQUNOLGFBQUssR0FBTCxHQUFXLElBQUksT0FBTyxJQUFQLENBQVksR0FBaEIsQ0FBcUIsS0FBSyxHQUFMLENBQVMsR0FBOUIsRUFBbUM7QUFDNUMsb0JBQVEsRUFBRSxLQUFLLFNBQVAsRUFBa0IsS0FBSyxDQUFDLFNBQXhCLEVBRG9DLEVBQ0E7QUFDNUMsOEJBQWtCLElBRjBCO0FBRzVDLDZCQUFpQixRQUgyQjtBQUk1QyxrQkFBTTtBQUpzQyxTQUFuQyxDQUFYOztBQU9BLFlBQU0sU0FBUyxJQUFJLE9BQU8sSUFBUCxDQUFZLE1BQWhCLENBQXdCO0FBQ25DLHNCQUFVLEtBQUssR0FBTCxDQUFTLFNBQVQsRUFEeUI7QUFFbkMsa0JBQU07QUFDRixzQkFBTSxPQUFPLElBQVAsQ0FBWSxVQUFaLENBQXVCLE1BRDNCO0FBRUYsdUJBQU8sRUFGTDtBQUdGLDZCQUFhO0FBSFgsYUFGNkI7QUFPbkMsdUJBQVcsSUFQd0I7QUFRbkMsaUJBQUssS0FBSztBQVJ5QixTQUF4QixDQUFmOztBQVdBLGFBQUssSUFBTCxHQUFZO0FBQ1Isa0JBQU0sS0FBSyxVQURIO0FBRVIseUJBQWEsU0FGTDtBQUdSLHlCQUFhLEVBSEw7QUFJUixvQkFBUSxJQUFJLE9BQU8sSUFBUCxDQUFZLEtBQWhCLENBQXNCLENBQXRCLEVBQXdCLENBQXhCLENBSkE7QUFLUiwwQkFBYyxDQUxOO0FBTVIsbUJBQU87QUFOQyxTQUFaOztBQVNBLGFBQUssV0FBTDs7QUFFQSxhQUFLLE1BQUw7QUFFSCxLQTFTdUQ7QUE0U3hELGVBNVN3RCx5QkE0UzFDO0FBQUE7O0FBQ1YsYUFBSyxJQUFMLENBQVUsT0FBVixDQUFtQjtBQUFBLG1CQUNmLE9BQUssT0FBTCxDQUFjLE1BQU0sRUFBcEIsSUFBMkIsSUFBSSxPQUFPLElBQVAsQ0FBWSxNQUFoQixDQUF3QjtBQUMvQywwQkFBVSxNQUFNLFlBRCtCO0FBRS9DLHFCQUFLLE9BQUssR0FGcUM7QUFHL0MsdUJBQU8sTUFBTSxJQUhrQztBQUkvQyxzQkFBTSxPQUFLO0FBSm9DLGFBQXhCLENBRFo7QUFBQSxTQUFuQjtBQVFILEtBclR1RDtBQXVUeEQsZ0JBdlR3RCx3QkF1VDFDLENBdlQwQyxFQXVUdEM7QUFDZCxZQUFLLG9CQUFvQixDQUFyQixHQUEwQixFQUFFLGNBQUYsQ0FBaUIsQ0FBakIsQ0FBMUIsR0FBZ0QsQ0FBcEQ7QUFDQSxhQUFLLGdCQUFMLEdBQXdCLEVBQUUsR0FBRyxFQUFFLEtBQVAsRUFBYyxHQUFHLEVBQUUsS0FBbkIsRUFBeEI7QUFDQSxhQUFLLFNBQUwsR0FBaUIsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUFqQjtBQUNILEtBM1R1RDtBQTZUeEQsZUE3VHdELHVCQTZUM0MsQ0E3VDJDLEVBNlR2QztBQUNiLFVBQUUsY0FBRjtBQUNILEtBL1R1RDtBQWlVeEQsY0FqVXdELHNCQWlVNUMsQ0FqVTRDLEVBaVV4QztBQUNaLFlBQUssb0JBQW9CLENBQXJCLEdBQTBCLEVBQUUsY0FBRixDQUFpQixDQUFqQixDQUExQixHQUFnRCxDQUFwRDtBQUNBLGFBQUssY0FBTCxHQUFzQixFQUFFLEdBQUcsRUFBRSxLQUFGLEdBQVUsS0FBSyxnQkFBTCxDQUFzQixDQUFyQyxFQUF3QyxHQUFHLEVBQUUsS0FBRixHQUFVLEtBQUssZ0JBQUwsQ0FBc0IsQ0FBM0UsRUFBdEI7QUFDQSxhQUFLLFdBQUwsR0FBbUIsSUFBSSxJQUFKLEdBQVcsT0FBWCxLQUF1QixLQUFLLFNBQS9DOztBQUVBLFlBQUksS0FBSyxXQUFMLElBQW9CLEtBQUssU0FBN0IsRUFBeUM7QUFDckMsZ0JBQUksS0FBSyxHQUFMLENBQVMsS0FBSyxjQUFMLENBQW9CLENBQTdCLEtBQW1DLEtBQUssSUFBeEMsSUFBZ0QsS0FBSyxHQUFMLENBQVMsS0FBSyxjQUFMLENBQW9CLENBQTdCLEtBQW1DLEtBQUssSUFBNUYsRUFBbUc7QUFDL0YscUJBQUssY0FBTCxDQUFvQixDQUFwQixHQUF3QixDQUF4QixHQUE0QixLQUFLLFdBQUwsRUFBNUIsR0FBaUQsS0FBSyxZQUFMLEVBQWpEO0FBQ0g7QUFDSjtBQUNKLEtBM1V1RDtBQTZVeEQsZUE3VXdELHlCQTZVMUM7QUFDVixhQUFLLFdBQUwsR0FBbUIsS0FBSyxJQUFMLENBQVcsS0FBSyxXQUFMLEdBQW1CLENBQTlCLElBQW9DLEtBQUssV0FBTCxHQUFtQixDQUF2RCxHQUEyRCxDQUE5RTs7QUFFQSxhQUFLLE1BQUw7QUFDSCxLQWpWdUQ7QUFtVnhELGdCQW5Wd0QsMEJBbVZ6QztBQUNYLGdCQUFRLEdBQVIsQ0FBWSxPQUFaO0FBQ0gsS0FyVnVEO0FBdVZ4RCxjQXZWd0Qsd0JBdVYzQztBQUNULGFBQUssV0FBTCxHQUFtQixDQUFuQjtBQUNBLGFBQUssT0FBTCxHQUFlLEVBQWY7O0FBRUEsZUFBTyxNQUFQLEdBQ00sS0FBSyxPQUFMLEVBRE4sR0FFTSxPQUFPLE9BQVAsR0FBaUIsS0FBSyxPQUY1Qjs7QUFJQSxhQUFLLFNBQUw7O0FBRUEsZUFBTyxJQUFQO0FBQ0gsS0FsV3VEOzs7QUFvV3hELGVBQVc7QUFDUCxhQUFLLFFBQVEscUJBQVI7QUFERSxLQXBXNkM7O0FBd1d4RCxVQXhXd0Qsb0JBd1cvQztBQUNMLFlBQU0sT0FBTyxLQUFLLElBQUwsQ0FBVyxLQUFLLFdBQWhCLENBQWI7O0FBRUEsYUFBSyxHQUFMLENBQVMsU0FBVCxDQUFvQixLQUFLLFdBQXpCO0FBQ0EsYUFBSyxHQUFMLENBQVMsSUFBVCxDQUFjLFdBQWQsR0FBNEIsS0FBSyxJQUFqQztBQUNBLGFBQUssR0FBTCxDQUFTLFFBQVQsQ0FBa0IsV0FBbEIsR0FBZ0MsS0FBSyxJQUFyQztBQUNBLGFBQUssR0FBTCxDQUFTLFFBQVQsQ0FBa0IsV0FBbEIsR0FBZ0MsS0FBSyxRQUFyQztBQUNBLGFBQUssR0FBTCxDQUFTLFdBQVQsQ0FBcUIsU0FBckIsR0FBaUMsS0FBSyxPQUFMLENBQWEsSUFBYixDQUFtQixLQUFLLFNBQUwsQ0FBZSxHQUFsQyxDQUFqQztBQUNBLGFBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsU0FBaEIsR0FBNEIsS0FBSyxPQUFMLENBQWEsSUFBYixDQUFtQixLQUFLLFNBQUwsQ0FBZSxHQUFsQyxDQUE1QjtBQUNBLGFBQUssR0FBTCxDQUFTLEtBQVQsQ0FBZSxHQUFmLG9CQUFvQyxLQUFLLEtBQXpDO0FBQ0g7QUFsWHVELENBQTNDLENBQWpCOzs7Ozs7O0FDQUEsT0FBTyxPQUFQLEdBQWlCLE9BQU8sTUFBUCxDQUFlLEVBQWYsRUFBb0IsUUFBUSx1QkFBUixDQUFwQixFQUFzRCxRQUFRLFFBQVIsRUFBa0IsWUFBbEIsQ0FBK0IsU0FBckYsRUFBZ0c7O0FBRTdHLHFCQUFpQixRQUFRLHVCQUFSLENBRjRGOztBQUk3RyxTQUFLLFFBQVEsUUFBUixDQUp3Rzs7QUFNN0csYUFONkcscUJBTWxHLEdBTmtHLEVBTTdGLEtBTjZGLEVBTXJGO0FBQUE7O0FBQ3BCLFlBQUksTUFBTSxNQUFNLE9BQU4sQ0FBZSxLQUFLLEdBQUwsQ0FBVSxHQUFWLENBQWYsSUFBbUMsS0FBSyxHQUFMLENBQVUsR0FBVixDQUFuQyxHQUFxRCxDQUFFLEtBQUssR0FBTCxDQUFVLEdBQVYsQ0FBRixDQUEvRDtBQUNBLFlBQUksT0FBSixDQUFhO0FBQUEsbUJBQU0sR0FBRyxnQkFBSCxDQUFxQixTQUFTLE9BQTlCLEVBQXVDO0FBQUEsdUJBQUssYUFBVyxNQUFLLHFCQUFMLENBQTJCLEdBQTNCLENBQVgsR0FBNkMsTUFBSyxxQkFBTCxDQUEyQixLQUEzQixDQUE3QyxFQUFvRixDQUFwRixDQUFMO0FBQUEsYUFBdkMsQ0FBTjtBQUFBLFNBQWI7QUFDSCxLQVQ0Rzs7O0FBVzdHLDJCQUF1QjtBQUFBLGVBQVUsT0FBTyxNQUFQLENBQWMsQ0FBZCxFQUFpQixXQUFqQixLQUFpQyxPQUFPLEtBQVAsQ0FBYSxDQUFiLENBQTNDO0FBQUEsS0FYc0Y7O0FBYTdHLGVBYjZHLHlCQWEvRjs7QUFFVixZQUFJLEtBQUssSUFBVCxFQUFnQixLQUFLLGVBQUwsQ0FBcUIsR0FBckIsQ0FBMEIsS0FBSyxJQUEvQjs7QUFFaEIsZUFBTyxPQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCLEVBQUUsS0FBSyxFQUFQLEVBQVksT0FBTyxFQUFFLE1BQU0sU0FBUixFQUFtQixNQUFNLFdBQXpCLEVBQW5CLEVBQTJELE9BQU8sRUFBbEUsRUFBckIsRUFBK0YsTUFBL0YsRUFBUDtBQUNILEtBbEI0RztBQW9CN0csa0JBcEI2RywwQkFvQjdGLEdBcEI2RixFQW9CeEYsRUFwQndGLEVBb0JuRjtBQUFBOztBQUN0QixZQUFJLGVBQWMsS0FBSyxNQUFMLENBQVksR0FBWixDQUFkLENBQUo7O0FBRUEsWUFBSSxTQUFTLFFBQWIsRUFBd0I7QUFBRSxpQkFBSyxTQUFMLENBQWdCLEdBQWhCLEVBQXFCLEtBQUssTUFBTCxDQUFZLEdBQVosQ0FBckI7QUFBeUMsU0FBbkUsTUFDSyxJQUFJLE1BQU0sT0FBTixDQUFlLEtBQUssTUFBTCxDQUFZLEdBQVosQ0FBZixDQUFKLEVBQXdDO0FBQ3pDLGlCQUFLLE1BQUwsQ0FBYSxHQUFiLEVBQW1CLE9BQW5CLENBQTRCO0FBQUEsdUJBQVksT0FBSyxTQUFMLENBQWdCLEdBQWhCLEVBQXFCLFNBQVMsS0FBOUIsQ0FBWjtBQUFBLGFBQTVCO0FBQ0gsU0FGSSxNQUVFO0FBQ0gsaUJBQUssU0FBTCxDQUFnQixHQUFoQixFQUFxQixLQUFLLE1BQUwsQ0FBWSxHQUFaLEVBQWlCLEtBQXRDO0FBQ0g7QUFDSixLQTdCNEc7QUErQjdHLFVBL0I2RyxxQkErQnBHO0FBQUE7O0FBQ0wsZUFBTyxLQUFLLElBQUwsR0FDTixJQURNLENBQ0EsWUFBTTtBQUNULG1CQUFLLEdBQUwsQ0FBUyxTQUFULENBQW1CLFVBQW5CLENBQThCLFdBQTlCLENBQTJDLE9BQUssR0FBTCxDQUFTLFNBQXBEO0FBQ0EsbUJBQU8sUUFBUSxPQUFSLENBQWlCLE9BQUssSUFBTCxDQUFVLFNBQVYsQ0FBakIsQ0FBUDtBQUNILFNBSk0sQ0FBUDtBQUtILEtBckM0Rzs7O0FBdUM3RyxZQUFRLEVBdkNxRzs7QUF5QzdHLFdBekM2RyxxQkF5Q25HO0FBQ04sWUFBSSxDQUFDLEtBQUssS0FBVixFQUFrQixLQUFLLEtBQUwsR0FBYSxPQUFPLE1BQVAsQ0FBZSxLQUFLLEtBQXBCLEVBQTJCLEVBQUUsVUFBVSxFQUFFLE9BQU8sS0FBSyxJQUFkLEVBQVosRUFBM0IsQ0FBYjs7QUFFbEIsZUFBTyxLQUFLLEtBQUwsQ0FBVyxHQUFYLEVBQVA7QUFDSCxLQTdDNEc7QUErQzdHLHNCQS9DNkcsZ0NBK0N4RjtBQUNqQixlQUFPLE9BQU8sTUFBUCxDQUNILEVBREcsRUFFRixLQUFLLEtBQU4sR0FBZSxLQUFLLEtBQUwsQ0FBVyxJQUExQixHQUFpQyxFQUY5QixFQUdILEVBQUUsTUFBTyxLQUFLLElBQU4sR0FBYyxLQUFLLElBQUwsQ0FBVSxJQUF4QixHQUErQixFQUF2QyxFQUhHLEVBSUgsRUFBRSxNQUFPLEtBQUssWUFBTixHQUFzQixLQUFLLFlBQTNCLEdBQTBDLEVBQWxELEVBSkcsQ0FBUDtBQU1ILEtBdEQ0RztBQXdEN0csUUF4RDZHLGtCQXdEdEc7QUFBQTs7QUFDSCxlQUFPLElBQUksT0FBSixDQUFhLG1CQUFXO0FBQzNCLGdCQUFJLENBQUMsU0FBUyxJQUFULENBQWMsUUFBZCxDQUF1QixPQUFLLEdBQUwsQ0FBUyxTQUFoQyxDQUFELElBQStDLE9BQUssUUFBTCxFQUFuRCxFQUFxRSxPQUFPLFNBQVA7QUFDckUsbUJBQUssYUFBTCxHQUFxQjtBQUFBLHVCQUFLLE9BQUssUUFBTCxDQUFjLE9BQWQsQ0FBTDtBQUFBLGFBQXJCO0FBQ0EsbUJBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsZ0JBQW5CLENBQXFDLGVBQXJDLEVBQXNELE9BQUssYUFBM0Q7QUFDQSxtQkFBSyxHQUFMLENBQVMsU0FBVCxDQUFtQixTQUFuQixDQUE2QixHQUE3QixDQUFpQyxNQUFqQztBQUNILFNBTE0sQ0FBUDtBQU1ILEtBL0Q0RztBQWlFN0csa0JBakU2RywwQkFpRTdGLEdBakU2RixFQWlFdkY7QUFDbEIsWUFBSSxRQUFRLFNBQVMsV0FBVCxFQUFaO0FBQ0E7QUFDQSxjQUFNLFVBQU4sQ0FBaUIsU0FBUyxvQkFBVCxDQUE4QixLQUE5QixFQUFxQyxJQUFyQyxDQUEwQyxDQUExQyxDQUFqQjtBQUNBLGVBQU8sTUFBTSx3QkFBTixDQUFnQyxHQUFoQyxDQUFQO0FBQ0gsS0F0RTRHO0FBd0U3RyxZQXhFNkcsc0JBd0VsRztBQUFFLGVBQU8sS0FBSyxHQUFMLENBQVMsU0FBVCxDQUFtQixTQUFuQixDQUE2QixRQUE3QixDQUFzQyxRQUF0QyxDQUFQO0FBQXdELEtBeEV3QztBQTBFN0csWUExRTZHLG9CQTBFbkcsT0ExRW1HLEVBMEV6RjtBQUNoQixhQUFLLEdBQUwsQ0FBUyxTQUFULENBQW1CLG1CQUFuQixDQUF3QyxlQUF4QyxFQUF5RCxLQUFLLGFBQTlEO0FBQ0EsYUFBSyxHQUFMLENBQVMsU0FBVCxDQUFtQixTQUFuQixDQUE2QixHQUE3QixDQUFpQyxRQUFqQztBQUNBLGdCQUFTLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FBVDtBQUNILEtBOUU0RztBQWdGN0csV0FoRjZHLHFCQWdGbkc7QUFDTixlQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCLEVBQUUsS0FBSyxFQUFQLEVBQVksT0FBTyxFQUFFLE1BQU0sU0FBUixFQUFtQixNQUFNLFdBQXpCLEVBQW5CLEVBQTJELE9BQU8sRUFBbEUsRUFBckIsRUFBK0YsTUFBL0Y7QUFDSCxLQWxGNEc7QUFvRjdHLFdBcEY2RyxtQkFvRnBHLE9BcEZvRyxFQW9GMUY7QUFDZixhQUFLLEdBQUwsQ0FBUyxTQUFULENBQW1CLG1CQUFuQixDQUF3QyxlQUF4QyxFQUF5RCxLQUFLLFlBQTlEO0FBQ0EsWUFBSSxLQUFLLElBQVQsRUFBZ0IsS0FBSyxJQUFMO0FBQ2hCLGdCQUFTLEtBQUssSUFBTCxDQUFVLE9BQVYsQ0FBVDtBQUNILEtBeEY0RztBQTBGN0csZ0JBMUY2RywwQkEwRjlGO0FBQ1gsY0FBTSxvQkFBTjtBQUNBLGVBQU8sSUFBUDtBQUNILEtBN0Y0RztBQStGN0csY0EvRjZHLHdCQStGaEc7QUFBRSxlQUFPLElBQVA7QUFBYSxLQS9GaUY7QUFpRzdHLFVBakc2RyxvQkFpR3BHO0FBQ0wsYUFBSyxhQUFMLENBQW9CLEVBQUUsVUFBVSxLQUFLLFFBQUwsQ0FBZSxLQUFLLGtCQUFMLEVBQWYsQ0FBWixFQUF3RCxXQUFXLEtBQUssU0FBeEUsRUFBcEI7O0FBRUEsWUFBSSxLQUFLLElBQVQsRUFBZ0IsS0FBSyxJQUFMOztBQUVoQixlQUFPLEtBQUssY0FBTCxHQUNLLFVBREwsRUFBUDtBQUVILEtBeEc0RztBQTBHN0csa0JBMUc2Ryw0QkEwRzVGO0FBQUE7O0FBQ2IsZUFBTyxJQUFQLENBQWEsS0FBSyxLQUFMLElBQWMsRUFBM0IsRUFBaUMsT0FBakMsQ0FBMEMsZUFBTztBQUM3QyxnQkFBSSxPQUFLLEtBQUwsQ0FBWSxHQUFaLEVBQWtCLEVBQXRCLEVBQTJCO0FBQ3ZCLG9CQUFJLE9BQU8sT0FBSyxLQUFMLENBQVksR0FBWixFQUFrQixJQUE3Qjs7QUFFQSx1QkFBUyxJQUFGLEdBQ0QsUUFBTyxJQUFQLHlDQUFPLElBQVAsT0FBZ0IsUUFBaEIsR0FDSSxJQURKLEdBRUksTUFISCxHQUlELEVBSk47O0FBTUEsdUJBQUssS0FBTCxDQUFZLEdBQVosSUFBb0IsT0FBSyxPQUFMLENBQWEsTUFBYixDQUFxQixHQUFyQixFQUEwQixPQUFPLE1BQVAsQ0FBZSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsSUFBSSxPQUFLLEtBQUwsQ0FBWSxHQUFaLEVBQWtCLEVBQXhCLEVBQTRCLFFBQVEsY0FBcEMsRUFBVCxFQUFiLEVBQWYsRUFBK0YsSUFBL0YsQ0FBMUIsQ0FBcEI7QUFDQSx1QkFBSyxLQUFMLENBQVksR0FBWixFQUFrQixFQUFsQixDQUFxQixNQUFyQjtBQUNBLHVCQUFLLEtBQUwsQ0FBWSxHQUFaLEVBQWtCLEVBQWxCLEdBQXVCLFNBQXZCO0FBQ0g7QUFDSixTQWREOztBQWdCQSxlQUFPLElBQVA7QUFDSCxLQTVINEc7QUE4SDdHLFFBOUg2RyxnQkE4SHZHLFFBOUh1RyxFQThINUY7QUFBQTs7QUFDYixlQUFPLElBQUksT0FBSixDQUFhLG1CQUFXO0FBQzNCLG1CQUFLLFlBQUwsR0FBb0I7QUFBQSx1QkFBSyxPQUFLLE9BQUwsQ0FBYSxPQUFiLENBQUw7QUFBQSxhQUFwQjtBQUNBLG1CQUFLLEdBQUwsQ0FBUyxTQUFULENBQW1CLGdCQUFuQixDQUFxQyxlQUFyQyxFQUFzRCxPQUFLLFlBQTNEO0FBQ0EsbUJBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsU0FBbkIsQ0FBNkIsTUFBN0IsQ0FBcUMsTUFBckMsRUFBNkMsUUFBN0M7QUFDSCxTQUpNLENBQVA7QUFLSCxLQXBJNEc7QUFzSTdHLFdBdEk2RyxtQkFzSXBHLEVBdElvRyxFQXNJL0Y7QUFDVixZQUFJLE1BQU0sR0FBRyxZQUFILENBQWlCLEtBQUssS0FBTCxDQUFXLElBQTVCLEtBQXNDLFdBQWhEOztBQUVBLFlBQUksUUFBUSxXQUFaLEVBQTBCLEdBQUcsU0FBSCxDQUFhLEdBQWIsQ0FBa0IsS0FBSyxJQUF2Qjs7QUFFMUIsYUFBSyxHQUFMLENBQVUsR0FBVixJQUFrQixNQUFNLE9BQU4sQ0FBZSxLQUFLLEdBQUwsQ0FBVSxHQUFWLENBQWYsSUFDWixLQUFLLEdBQUwsQ0FBVSxHQUFWLEVBQWdCLElBQWhCLENBQXNCLEVBQXRCLENBRFksR0FFVixLQUFLLEdBQUwsQ0FBVSxHQUFWLE1BQW9CLFNBQXRCLEdBQ0ksQ0FBRSxLQUFLLEdBQUwsQ0FBVSxHQUFWLENBQUYsRUFBbUIsRUFBbkIsQ0FESixHQUVJLEVBSlY7O0FBTUEsV0FBRyxlQUFILENBQW1CLEtBQUssS0FBTCxDQUFXLElBQTlCOztBQUVBLFlBQUksS0FBSyxNQUFMLENBQWEsR0FBYixDQUFKLEVBQXlCLEtBQUssY0FBTCxDQUFxQixHQUFyQixFQUEwQixFQUExQjtBQUM1QixLQXBKNEc7QUFzSjdHLGlCQXRKNkcseUJBc0o5RixPQXRKOEYsRUFzSnBGO0FBQUE7O0FBQ3JCLFlBQUksV0FBVyxLQUFLLGNBQUwsQ0FBcUIsUUFBUSxRQUE3QixDQUFmO0FBQUEsWUFDSSxpQkFBZSxLQUFLLEtBQUwsQ0FBVyxJQUExQixNQURKO0FBQUEsWUFFSSxxQkFBbUIsS0FBSyxLQUFMLENBQVcsSUFBOUIsTUFGSjs7QUFJQSxhQUFLLE9BQUwsQ0FBYyxTQUFTLGFBQVQsQ0FBdUIsR0FBdkIsQ0FBZDtBQUNBLGlCQUFTLGdCQUFULENBQThCLFFBQTlCLFVBQTJDLFlBQTNDLEVBQTRELE9BQTVELENBQXFFO0FBQUEsbUJBQy9ELEdBQUcsWUFBSCxDQUFpQixPQUFLLEtBQUwsQ0FBVyxJQUE1QixDQUFGLEdBQ00sT0FBSyxPQUFMLENBQWMsRUFBZCxDQUROLEdBRU0sT0FBSyxLQUFMLENBQVksR0FBRyxZQUFILENBQWdCLE9BQUssS0FBTCxDQUFXLElBQTNCLENBQVosRUFBK0MsRUFBL0MsR0FBb0QsRUFITztBQUFBLFNBQXJFOztBQU1BLGdCQUFRLFNBQVIsQ0FBa0IsTUFBbEIsS0FBNkIsY0FBN0IsR0FDTSxRQUFRLFNBQVIsQ0FBa0IsRUFBbEIsQ0FBcUIsVUFBckIsQ0FBZ0MsWUFBaEMsQ0FBOEMsUUFBOUMsRUFBd0QsUUFBUSxTQUFSLENBQWtCLEVBQTFFLENBRE4sR0FFTSxRQUFRLFNBQVIsQ0FBa0IsRUFBbEIsQ0FBc0IsUUFBUSxTQUFSLENBQWtCLE1BQWxCLElBQTRCLGFBQWxELEVBQW1FLFFBQW5FLENBRk47O0FBSUEsZUFBTyxJQUFQO0FBQ0g7QUF2SzRHLENBQWhHLENBQWpCOzs7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQixPQUFPLE1BQVAsQ0FBZTtBQUU1QixPQUY0QixlQUV4QixRQUZ3QixFQUVkO0FBQ1YsWUFBSSxDQUFDLEtBQUssU0FBTCxDQUFlLE1BQXBCLEVBQTZCLE9BQU8sZ0JBQVAsQ0FBd0IsUUFBeEIsRUFBa0MsS0FBSyxRQUF2QztBQUM3QixhQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLFFBQXBCO0FBQ0gsS0FMMkI7QUFPNUIsWUFQNEIsc0JBT2pCO0FBQ1IsWUFBSSxLQUFLLE9BQVQsRUFBbUI7O0FBRWxCLGFBQUssT0FBTCxHQUFlLElBQWY7O0FBRUEsZUFBTyxxQkFBUCxHQUNNLE9BQU8scUJBQVAsQ0FBOEIsS0FBSyxZQUFuQyxDQUROLEdBRU0sV0FBWSxLQUFLLFlBQWpCLEVBQStCLEVBQS9CLENBRk47QUFHSCxLQWYyQjtBQWlCNUIsZ0JBakI0QiwwQkFpQmI7QUFDWCxhQUFLLFNBQUwsR0FBaUIsS0FBSyxTQUFMLENBQWUsTUFBZixDQUF1QjtBQUFBLG1CQUFZLFVBQVo7QUFBQSxTQUF2QixDQUFqQjtBQUNBLGFBQUssT0FBTCxHQUFlLEtBQWY7QUFDSDtBQXBCMkIsQ0FBZixFQXNCZCxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQVQsRUFBYixFQUE0QixTQUFTLEVBQUUsT0FBTyxLQUFULEVBQXJDLEVBdEJjLEVBc0I0QyxHQXRCN0Q7Ozs7O0FDQUEsT0FBTyxPQUFQOzs7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQjtBQUFBLHdCQUFrQixRQUFRLFlBQVIsQ0FBbEI7QUFBQSxDQUFqQjs7Ozs7QUNBQSxPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNsQixRQUFNLFNBQVMsUUFBUSxXQUFSLENBQWY7QUFDQSw0TUFLdUIsUUFBUSxZQUFSLENBTHZCLDBHQVF1QixRQUFRLGNBQVIsQ0FSdkIsaUxBY2MsTUFBTSxJQUFOLENBQVcsTUFBTSxFQUFFLE1BQVIsRUFBZ0IsSUFBaEIsRUFBWCxFQUFtQyxHQUFuQyxDQUF3QztBQUFBLGVBQU0sTUFBTjtBQUFBLEtBQXhDLEVBQXVELElBQXZELENBQTRELEVBQTVELENBZGQseUdBaUJvQixRQUFRLGFBQVIsQ0FqQnBCLCtKQXFCcUMsUUFBUSxZQUFSLENBckJyQztBQW9DUyxDQXRDYjs7Ozs7QUNBQSxPQUFPLE9BQVA7Ozs7O0FDQUEsT0FBTyxPQUFQOzs7OztBQ0FBLE9BQU8sT0FBUDs7Ozs7QUNBQSxPQUFPLE9BQVA7Ozs7O0FDQUEsT0FBTyxPQUFQOzs7OztBQ0FBLE9BQU8sT0FBUDs7Ozs7QUNBQSxPQUFPLE9BQVAsR0FBaUIsZUFBTztBQUFFLFVBQVEsR0FBUixDQUFhLElBQUksS0FBSixJQUFhLEdBQTFCO0FBQWlDLENBQTNEOzs7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQjs7QUFFYixXQUFPLFFBQVEsV0FBUixDQUZNOztBQUliLE9BQUcsV0FBRSxHQUFGO0FBQUEsWUFBTyxJQUFQLHVFQUFZLEVBQVo7QUFBQSxZQUFpQixPQUFqQjtBQUFBLGVBQ0MsSUFBSSxPQUFKLENBQWEsVUFBRSxPQUFGLEVBQVcsTUFBWDtBQUFBLG1CQUF1QixRQUFRLEtBQVIsQ0FBZSxHQUFmLEVBQW9CLG9CQUFwQixFQUFxQyxLQUFLLE1BQUwsQ0FBYSxVQUFFLENBQUY7QUFBQSxrREFBUSxRQUFSO0FBQVEsNEJBQVI7QUFBQTs7QUFBQSx1QkFBc0IsSUFBSSxPQUFPLENBQVAsQ0FBSixHQUFnQixRQUFRLFFBQVIsQ0FBdEM7QUFBQSxhQUFiLENBQXJDLENBQXZCO0FBQUEsU0FBYixDQUREO0FBQUEsS0FKVTs7QUFPYixlQVBhLHlCQU9DO0FBQUUsZUFBTyxJQUFQO0FBQWE7QUFQaEIsQ0FBakI7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cz17XG5cdEhvbWU6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0hvbWUnKSxcblx0U25hZzogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvU25hZycpXG59IiwibW9kdWxlLmV4cG9ydHM9e1xuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL0hvbWUnKSxcblx0U25hZzogcmVxdWlyZSgnLi92aWV3cy9TbmFnJylcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuLi8uLi9saWIvTXlPYmplY3QnKSwge1xuXG4gICAgUmVxdWVzdDoge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCBkYXRhICkge1xuICAgICAgICAgICAgbGV0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG5cbiAgICAgICAgICAgICAgICByZXEub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIFsgNTAwLCA0MDQsIDQwMSBdLmluY2x1ZGVzKCB0aGlzLnN0YXR1cyApXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlamVjdCggdGhpcy5yZXNwb25zZSApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHJlc29sdmUoIEpTT04ucGFyc2UodGhpcy5yZXNwb25zZSkgKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKCBkYXRhLm1ldGhvZCA9PT0gXCJnZXRcIiB8fCBkYXRhLm1ldGhvZCA9PT0gXCJvcHRpb25zXCIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBxcyA9IGRhdGEucXMgPyBgPyR7ZGF0YS5xc31gIDogJycgXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vcGVuKCBkYXRhLm1ldGhvZCwgYC8ke2RhdGEucmVzb3VyY2V9JHtxc31gIClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKG51bGwpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9wZW4oIGRhdGEubWV0aG9kLCBgLyR7ZGF0YS5yZXNvdXJjZX1gLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEhlYWRlcnMoIHJlcSwgZGF0YS5oZWFkZXJzIClcbiAgICAgICAgICAgICAgICAgICAgcmVxLnNlbmQoIGRhdGEuZGF0YSApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApXG4gICAgICAgIH0sXG5cbiAgICAgICAgcGxhaW5Fc2NhcGUoIHNUZXh0ICkge1xuICAgICAgICAgICAgLyogaG93IHNob3VsZCBJIHRyZWF0IGEgdGV4dC9wbGFpbiBmb3JtIGVuY29kaW5nPyB3aGF0IGNoYXJhY3RlcnMgYXJlIG5vdCBhbGxvd2VkPyB0aGlzIGlzIHdoYXQgSSBzdXBwb3NlLi4uOiAqL1xuICAgICAgICAgICAgLyogXCI0XFwzXFw3IC0gRWluc3RlaW4gc2FpZCBFPW1jMlwiIC0tLS0+IFwiNFxcXFwzXFxcXDdcXCAtXFwgRWluc3RlaW5cXCBzYWlkXFwgRVxcPW1jMlwiICovXG4gICAgICAgICAgICByZXR1cm4gc1RleHQucmVwbGFjZSgvW1xcc1xcPVxcXFxdL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEhlYWRlcnMoIHJlcSwgaGVhZGVycz17fSApIHtcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCBcIkFjY2VwdFwiLCBoZWFkZXJzLmFjY2VwdCB8fCAnYXBwbGljYXRpb24vanNvbicgKVxuICAgICAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoIFwiQ29udGVudC1UeXBlXCIsIGhlYWRlcnMuY29udGVudFR5cGUgfHwgJ3RleHQvcGxhaW4nIClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfZmFjdG9yeSggZGF0YSApIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUoIHRoaXMuUmVxdWVzdCwgeyB9ICkuY29uc3RydWN0b3IoIGRhdGEgKVxuICAgIH0sXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICBpZiggIVhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgKSB7XG4gICAgICAgICAgWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmRBc0JpbmFyeSA9IGZ1bmN0aW9uKHNEYXRhKSB7XG4gICAgICAgICAgICB2YXIgbkJ5dGVzID0gc0RhdGEubGVuZ3RoLCB1aThEYXRhID0gbmV3IFVpbnQ4QXJyYXkobkJ5dGVzKTtcbiAgICAgICAgICAgIGZvciAodmFyIG5JZHggPSAwOyBuSWR4IDwgbkJ5dGVzOyBuSWR4KyspIHtcbiAgICAgICAgICAgICAgdWk4RGF0YVtuSWR4XSA9IHNEYXRhLmNoYXJDb2RlQXQobklkeCkgJiAweGZmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZW5kKHVpOERhdGEpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fZmFjdG9yeS5iaW5kKHRoaXMpXG4gICAgfVxuXG59ICksIHsgfSApLmNvbnN0cnVjdG9yKClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgY3JlYXRlKCBuYW1lLCBvcHRzICkge1xuICAgICAgICBjb25zdCBsb3dlciA9IG5hbWVcbiAgICAgICAgbmFtZSA9IG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpXG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKFxuICAgICAgICAgICAgdGhpcy5WaWV3c1sgbmFtZSBdLFxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbigge1xuICAgICAgICAgICAgICAgIG5hbWU6IHsgdmFsdWU6IG5hbWUgfSxcbiAgICAgICAgICAgICAgICBmYWN0b3J5OiB7IHZhbHVlOiB0aGlzIH0sXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IHsgdmFsdWU6IHRoaXMuVGVtcGxhdGVzWyBuYW1lIF0gfSxcbiAgICAgICAgICAgICAgICB1c2VyOiB7IHZhbHVlOiB0aGlzLlVzZXIgfVxuICAgICAgICAgICAgICAgIH0sIG9wdHMgKVxuICAgICAgICApLmNvbnN0cnVjdG9yKClcbiAgICAgICAgLm9uKCAnbmF2aWdhdGUnLCByb3V0ZSA9PiByZXF1aXJlKCcuLi9yb3V0ZXInKS5uYXZpZ2F0ZSggcm91dGUgKSApXG4gICAgICAgIC5vbiggJ2RlbGV0ZWQnLCAoKSA9PiBkZWxldGUgKHJlcXVpcmUoJy4uL3JvdXRlcicpKS52aWV3c1tuYW1lXSApXG4gICAgfSxcblxufSwge1xuICAgIFRlbXBsYXRlczogeyB2YWx1ZTogcmVxdWlyZSgnLi4vLlRlbXBsYXRlTWFwJykgfSxcbiAgICBWaWV3czogeyB2YWx1ZTogcmVxdWlyZSgnLi4vLlZpZXdNYXAnKSB9XG59IClcbiIsIndpbmRvdy5pbml0TWFwID0gKCkgPT4gdHJ1ZVxud2luZG93Lm9ubG9hZCA9ICgpID0+IHJlcXVpcmUoJy4vcm91dGVyJylcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgRXJyb3I6IHJlcXVpcmUoJy4uLy4uL2xpYi9NeUVycm9yJyksXG4gICAgXG4gICAgVmlld0ZhY3Rvcnk6IHJlcXVpcmUoJy4vZmFjdG9yeS9WaWV3JyksXG4gICAgXG4gICAgVmlld3M6IHJlcXVpcmUoJy4vLlZpZXdNYXAnKSxcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbnRlbnRDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29udGVudCcpXG5cbiAgICAgICAgd2luZG93Lm9ucG9wc3RhdGUgPSB0aGlzLmhhbmRsZS5iaW5kKHRoaXMpXG5cbiAgICAgICAgdGhpcy5oYW5kbGUoKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIGhhbmRsZSgpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVyKCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5zbGljZSgxKSApXG4gICAgfSxcblxuICAgIGhhbmRsZXIoIHBhdGggKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBwYXRoWzBdID8gcGF0aFswXS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBhdGhbMF0uc2xpY2UoMSkgOiAnJyxcbiAgICAgICAgICAgICAgdmlldyA9IHRoaXMuVmlld3NbbmFtZV0gPyBwYXRoWzBdIDogJ2hvbWUnO1xuXG4gICAgICAgICggKCB2aWV3ID09PSB0aGlzLmN1cnJlbnRWaWV3IClcbiAgICAgICAgICAgID8gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgICAgIDogUHJvbWlzZS5hbGwoIE9iamVjdC5rZXlzKCB0aGlzLnZpZXdzICkubWFwKCB2aWV3ID0+IHRoaXMudmlld3NbIHZpZXcgXS5oaWRlKCkgKSApICkgXG4gICAgICAgIC50aGVuKCAoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB2aWV3XG5cbiAgICAgICAgICAgIGlmKCB0aGlzLnZpZXdzWyB2aWV3IF0gKSByZXR1cm4gdGhpcy52aWV3c1sgdmlldyBdLm5hdmlnYXRlKCBwYXRoIClcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzWyB2aWV3IF0gPVxuICAgICAgICAgICAgICAgICAgICB0aGlzLlZpZXdGYWN0b3J5LmNyZWF0ZSggdmlldywge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmNvbnRlbnRDb250YWluZXIgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogeyB2YWx1ZTogcGF0aCwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgIClcbiAgICAgICAgfSApXG4gICAgICAgIC5jYXRjaCggdGhpcy5FcnJvciApXG4gICAgfSxcblxuICAgIG5hdmlnYXRlKCBsb2NhdGlvbiApIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoIHt9LCAnJywgbG9jYXRpb24gKVxuICAgICAgICB0aGlzLmhhbmRsZSgpXG4gICAgfVxuXG59LCB7IGN1cnJlbnRWaWV3OiB7IHZhbHVlOiAnJywgd3JpdGFibGU6IHRydWUgfSwgdmlld3M6IHsgdmFsdWU6IHsgfSB9IH0gKS5jb25zdHJ1Y3RvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBwb3N0UmVuZGVyKCkge1xuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB0aGlzLmhpZGUoKS50aGVuKCAoKSA9PiB0aGlzLmVtaXQoICduYXZpZ2F0ZScsICdzbmFnJyApICkuY2F0Y2goIHRoaXMuRXJyb3IgKSwgMjAwMCApXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBnYXJhZ2VQYXRoOiByZXF1aXJlKCcuL2xpYi9jYXJQYXRoJyksXG5cbiAgICBiaW5kU3dpcGUoKSB7XG4gICAgICAgIHRoaXMuc3dpcGVUaW1lID0gMTAwMFxuICAgICAgICB0aGlzLm1pblggPSAzMFxuICAgICAgICB0aGlzLm1heFkgPSAzMFxuXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgIGUgPT4gdGhpcy5vblN3aXBlU3RhcnQoZSksIGZhbHNlIClcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgZSA9PiB0aGlzLm9uU3dpcGVTdGFydChlKSwgZmFsc2UgKVxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIGUgPT4gdGhpcy5vblN3aXBlTW92ZShlKSwgZmFsc2UgKVxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIGUgPT4gdGhpcy5vblN3aXBlTW92ZShlKSwgZmFsc2UgKVxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBlID0+IHRoaXMub25Td2lwZUVuZChlKSwgZmFsc2UgKVxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgZSA9PiB0aGlzLm9uU3dpcGVFbmQoZSksIGZhbHNlIClcbiAgICB9LFxuXG4gICAgZ2V0VGVtcGxhdGVPcHRpb25zKCkgeyByZXR1cm4gdGhpcy5kYXRhIH0sXG5cbiAgICBkYXRhOiBbXG4gICAgICAgIC8qe1xuICAgICAgICAgICAgaWQ6IDEsXG4gICAgICAgICAgICBkaXN0YW5jZTogJzMwMCBmdCBhd2F5JyxcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogLTM0LjM5NywgbG5nOiAxNTAuNjQ0IH0sXG4gICAgICAgICAgICBzcG90TG9jYXRpb246IHsgbGF0OiAtMzQuMzk3LCBsbmc6IDE1MC42NDQgfSxcbiAgICAgICAgICAgIG5hbWU6ICdMQVogUGFya2luZycsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgUGFya2luZyBTdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgICAgICc4OC8yNDAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICckMy9ocicsXG4gICAgICAgICAgICAgICAgJzRociBtYXgnLFxuICAgICAgICAgICAgICAgICdvcGVuIDI0IGhycydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3NpZGVraWNrLXNoZWQteHMuanBnJyxcbiAgICAgICAgICAgIHRlbXA6IDU3XG4gICAgICAgIH0qL1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogMSxcbiAgICAgICAgICAgIGRpc3RhbmNlOiAnZnQgYXdheScsXG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NjQ5NTAsIGxuZzogLTc1LjE5MjU4MzcgIH0sXG4gICAgICAgICAgICBzcG90TG9jYXRpb246IHsgbGF0OiAzOS45NTY0OTUwLCBsbmc6IC03NS4xOTI1ODM3ICB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgQycsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgUGFya2luZyBTdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgICAgICc4OC8yNDAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICckMy9ocicsXG4gICAgICAgICAgICAgICAgJzVociBtYXgnLFxuICAgICAgICAgICAgICAgICdvcGVuIDI0IGhycydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3Nwb3RzL2xvdF9jLkpQRycsXG4gICAgICAgICAgICB0ZW1wOiA1N1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogMixcbiAgICAgICAgICAgIGRpc3RhbmNlOiAnZnQgYXdheScsXG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1OTMyMDksIGxuZzogLTc1LjE5MjA5MDcgfSxcbiAgICAgICAgICAgIHNwb3RMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1OTMyMDksIGxuZzogLTc1LjE5MjA5MDcgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IEQgU3BvdCA0NScsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgUGFya2luZyBTdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgICAgICc4OC8yNDAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3Nwb3RzL2xvdF9kX3Nwb3RfNDUuSlBHJyxcbiAgICAgICAgICAgIHRlbXA6IDU3XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAzLFxuICAgICAgICAgICAgZGlzdGFuY2U6ICdmdCBhd2F5JyxcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU5OTI1NiwgbG5nOiAtNzUuMTg4OTk1MCB9LFxuICAgICAgICAgICAgc3BvdExvY2F0aW9uOiB7IGxhdDogMzkuOTU5OTI1NiwgbG5nOiAtNzUuMTg4OTk1MCB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgSCBTcG90IDQnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnODgvMjQwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2U6ICdzcG90cy9sb3RfaF9zcG90XzQuSlBHJyxcbiAgICAgICAgICAgIHRlbXA6IDU3XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiA0LFxuICAgICAgICAgICAgZGlzdGFuY2U6ICdmdCBhd2F5JyxcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU5NzQ5NywgbG5nOiAtNzUuMTg4NjI2MCB9LFxuICAgICAgICAgICAgc3BvdExvY2F0aW9uOiB7IGxhdDogMzkuOTU5NzQ5NywgbG5nOiAtNzUuMTg4NjI2MCB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgSCBTcG90IDE1JyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBQYXJraW5nIFN0cnVjdHVyZScsXG4gICAgICAgICAgICAgICAgJzg4LzI0MCBzcG90cydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgICAgICAgJ1Blcm1pdCBPbmx5J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltYWdlOiAnc3BvdHMvbG90X2hfc3BvdF8xNS5KUEcnLFxuICAgICAgICAgICAgdGVtcDogNTdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6IDUsXG4gICAgICAgICAgICBkaXN0YW5jZTogJ2Z0IGF3YXknLFxuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTk2MDQ5LCBsbmc6IC03NS4xODg4NTQ2IH0sXG4gICAgICAgICAgICBzcG90TG9jYXRpb246IHsgbGF0OiAzOS45NTk2MDQ5LCBsbmc6IC03NS4xODg4NTQ2IH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBIIFNwb3QgMjYnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnODgvMjQwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2U6ICdzcG90cy9sb3RfaF9zcG90XzI2LkpQRycsXG4gICAgICAgICAgICB0ZW1wOiA1N1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogNixcbiAgICAgICAgICAgIGRpc3RhbmNlOiAnZnQgYXdheScsXG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1ODMwNDUsIGxuZzogLTc1LjE4ODgyMzU5IH0sXG4gICAgICAgICAgICBzcG90TG9jYXRpb246IHsgbGF0OiAzOS45NTgzMDQ1LCBsbmc6IC03NS4xODg4MjM1OSB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgSicsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgUGFya2luZyBTdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgICAgICc4OC8yNDAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3Nwb3RzL2xvdF9qLkpQRycsXG4gICAgICAgICAgICB0ZW1wOiA1N1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogNyxcbiAgICAgICAgICAgIGRpc3RhbmNlOiAnZnQgYXdheScsXG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NzU1ODcsIGxuZzogLTc1LjE5MzQwOTUgfSxcbiAgICAgICAgICAgIHNwb3RMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NzU1ODcsIGxuZzogLTc1LjE5MzQwOTUgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IEsgU3BvdCAxMTUnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnODgvMjQwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2U6ICdzcG90cy9sb3Rfa19zcG90XzExNS5KUEcnLFxuICAgICAgICAgICAgdGVtcDogNTdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6IDgsXG4gICAgICAgICAgICBkaXN0YW5jZTogJ2Z0IGF3YXknLFxuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTYzMjkzLCBsbmc6IC03NS4xOTExOTQ5IH0sXG4gICAgICAgICAgICBzcG90TG9jYXRpb246IHsgbGF0OiAzOS45NTYzMjkzLCBsbmc6IC03NS4xOTExOTQ5IH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBQJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBQYXJraW5nIFN0cnVjdHVyZScsXG4gICAgICAgICAgICAgICAgJzg4LzI0MCBzcG90cydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgICAgICAgJ1Blcm1pdCBPbmx5J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltYWdlOiAnc3BvdHMvbG90X3AuSlBHJyxcbiAgICAgICAgICAgIHRlbXA6IDU3XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiA5LFxuICAgICAgICAgICAgZGlzdGFuY2U6ICdmdCBhd2F5JyxcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU2MzE4NSwgbG5nOiAtNzUuMTkxMTIyOSB9LFxuICAgICAgICAgICAgc3BvdExvY2F0aW9uOiB7IGxhdDogMzkuOTU2MzE4NSwgbG5nOiAtNzUuMTkxMTIyOSB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgUCBTcG90IDInLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnODgvMjQwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2U6ICdzcG90cy9sb3RfcF9zcG90XzIuSlBHJyxcbiAgICAgICAgICAgIHRlbXA6IDU3XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAxMCxcbiAgICAgICAgICAgIGRpc3RhbmNlOiAnZnQgYXdheScsXG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1Nzk5MDIsIGxuZzogLTc1LjE5MDE2NTggfSxcbiAgICAgICAgICAgIHNwb3RMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1Nzk5MDIsIGxuZzogLTc1LjE5MDE2NTggfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IFIgU3BvdCAyMCcsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgUGFya2luZyBTdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgICAgICc4OC8yNDAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3Nwb3RzL2xvdF9yX3Nwb3RfMjAuSlBHJyxcbiAgICAgICAgICAgIHRlbXA6IDU3XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAxMSxcbiAgICAgICAgICAgIGRpc3RhbmNlOiAnZnQgYXdheScsXG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NjgxNTQsIGxuZzogLTc1LjE4NzI2NjkgfSxcbiAgICAgICAgICAgIHNwb3RMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NjgxNTQsIGxuZzogLTc1LjE4NzI2NjkgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IFMnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnODgvMjQwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2U6ICdzcG90cy9sb3Rfc19zaWduYWdlLkpQRycsXG4gICAgICAgICAgICB0ZW1wOiA1N1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogMTIsXG4gICAgICAgICAgICBkaXN0YW5jZTogJ2Z0IGF3YXknLFxuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTc4NzgyLCBsbmc6IC03NS4xODgyODAzIH0sXG4gICAgICAgICAgICBzcG90TG9jYXRpb246IHsgbGF0OiAzOS45NTc4NzgyLCBsbmc6IC03NS4xODgyODAzIH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBUIFNwb3QgMicsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgUGFya2luZyBTdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgICAgICc4OC8yNDAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3Nwb3RzL2xvdF90X3Nwb3RfMi5KUEcnLFxuICAgICAgICAgICAgdGVtcDogNTdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6IDEzLFxuICAgICAgICAgICAgZGlzdGFuY2U6ICdmdCBhd2F5JyxcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU3Njk5OCwgbG5nOiAtNzUuMTg4MTg5NyB9LFxuICAgICAgICAgICAgc3BvdExvY2F0aW9uOiB7IGxhdDogMzkuOTU3Njk5OCwgbG5nOiAtNzUuMTg4MTg5NyB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgVCBTcG90IDQnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnODgvMjQwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2U6ICdzcG90cy9sb3RfdF9zcG90XzQuSlBHJyxcbiAgICAgICAgICAgIHRlbXA6IDU3XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAxNCxcbiAgICAgICAgICAgIGRpc3RhbmNlOiAnZnQgYXdheScsXG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NDU2ODgsIGxuZzogLTc1LjE5MTU5MDIgfSxcbiAgICAgICAgICAgIHNwb3RMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NDU2ODgsIGxuZzogLTc1LjE5MTU5MDIgfSxcbiAgICAgICAgICAgIG5hbWU6ICdPZmYtQ2FtcHVzIFN0cnVjdHVyZScsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgUGFya2luZyBTdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgICAgICc4OC8yNDAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICckMTMvaG91cidcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3Nwb3RzL29mZmNhbXB1c3N0cnVjdHVyZS5qcGcnLFxuICAgICAgICAgICAgdGVtcDogNTdcbiAgICAgICAgfVxuICAgIF0sXG5cbiAgICBpbml0TWFwKCkge1xuICAgICAgICB0aGlzLm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoIHRoaXMuZWxzLm1hcCwge1xuICAgICAgICAgIGNlbnRlcjogeyBsYXQ6IDM5Ljk1NjEzNSwgbG5nOiAtNzUuMTkwNjkzIH0sLy8zMzMzIE1hcmtldCBTdCwgUGhpbGFkZWxwaGlhLCBQQSAxOTEwNFxuICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXG4gICAgICAgICAgZ2VzdHVyZUhhbmRsaW5nOiAnZ3JlZWR5JyxcbiAgICAgICAgICB6b29tOiAxNVxuICAgICAgICB9IClcblxuICAgICAgICBjb25zdCBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogdGhpcy5tYXAuZ2V0Q2VudGVyKCksXG4gICAgICAgICAgICBpY29uOiB7XG4gICAgICAgICAgICAgICAgcGF0aDogZ29vZ2xlLm1hcHMuU3ltYm9sUGF0aC5DSVJDTEUsXG4gICAgICAgICAgICAgICAgc2NhbGU6IDEwLFxuICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnIzAwN2FmZidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXG4gICAgICAgICAgICBtYXA6IHRoaXMubWFwXG4gICAgICAgIH0gKVxuXG4gICAgICAgIHRoaXMuaWNvbiA9IHsgICAgICAgICAgICBcbiAgICAgICAgICAgIHBhdGg6IHRoaXMuZ2FyYWdlUGF0aCxcbiAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnI2QzODBkNicsXG4gICAgICAgICAgICBmaWxsT3BhY2l0eTogLjEsXG4gICAgICAgICAgICBhbmNob3I6IG5ldyBnb29nbGUubWFwcy5Qb2ludCgwLDApLFxuICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiAxLFxuICAgICAgICAgICAgc2NhbGU6IC4wNTBcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVuZGVySWNvbnMoKVxuXG4gICAgICAgIHRoaXMudXBkYXRlKClcblxuICAgIH0sXG5cbiAgICByZW5kZXJJY29ucygpIHtcbiAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goIGRhdHVtID0+XG4gICAgICAgICAgICB0aGlzLm1hcmtlcnNbIGRhdHVtLmlkIF0gPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGRhdHVtLnNwb3RMb2NhdGlvbixcbiAgICAgICAgICAgICAgICBtYXA6IHRoaXMubWFwLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBkYXR1bS5uYW1lLFxuICAgICAgICAgICAgICAgIGljb246IHRoaXMuaWNvblxuICAgICAgICAgICAgfSApXG4gICAgICAgIClcbiAgICB9LFxuXG4gICAgb25Td2lwZVN0YXJ0KCBlICkge1xuICAgICAgICBlID0gKCdjaGFuZ2VkVG91Y2hlcycgaW4gZSkgPyBlLmNoYW5nZWRUb3VjaGVzWzBdIDogZVxuICAgICAgICB0aGlzLnRvdWNoU3RhcnRDb29yZHMgPSB7IHg6IGUucGFnZVgsIHkgOmUucGFnZVkgfVxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgfSxcbiAgICBcbiAgICBvblN3aXBlTW92ZSggZSApIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfSxcbiAgICBcbiAgICBvblN3aXBlRW5kKCBlICkge1xuICAgICAgICBlID0gKCdjaGFuZ2VkVG91Y2hlcycgaW4gZSkgPyBlLmNoYW5nZWRUb3VjaGVzWzBdIDogZVxuICAgICAgICB0aGlzLnRvdWNoRW5kQ29vcmRzID0geyB4OiBlLnBhZ2VYIC0gdGhpcy50b3VjaFN0YXJ0Q29vcmRzLngsIHkgOmUucGFnZVkgLSB0aGlzLnRvdWNoU3RhcnRDb29yZHMueSB9XG4gICAgICAgIHRoaXMuZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRoaXMuc3RhcnRUaW1lXG5cbiAgICAgICAgaWYoIHRoaXMuZWxhcHNlZFRpbWUgPD0gdGhpcy5zd2lwZVRpbWUgKSB7XG4gICAgICAgICAgICBpZiggTWF0aC5hYnModGhpcy50b3VjaEVuZENvb3Jkcy54KSA+PSB0aGlzLm1pblggJiYgTWF0aC5hYnModGhpcy50b3VjaEVuZENvb3Jkcy55KSA8PSB0aGlzLm1heFkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b3VjaEVuZENvb3Jkcy54IDwgMCA/IHRoaXMub25Td2lwZUxlZnQoKSA6IHRoaXMub25Td2lwZVJpZ2h0KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvblN3aXBlTGVmdCgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50U3BvdCA9IHRoaXMuZGF0YVsgdGhpcy5jdXJyZW50U3BvdCArIDEgXSA/IHRoaXMuY3VycmVudFNwb3QgKyAxIDogMFxuXG4gICAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9LFxuICAgIFxuICAgIG9uU3dpcGVSaWdodCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3JpZ2h0JylcbiAgICB9LFxuXG4gICAgcG9zdFJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50U3BvdCA9IDBcbiAgICAgICAgdGhpcy5tYXJrZXJzID0geyB9XG5cbiAgICAgICAgd2luZG93Lmdvb2dsZVxuICAgICAgICAgICAgPyB0aGlzLmluaXRNYXAoKVxuICAgICAgICAgICAgOiB3aW5kb3cuaW5pdE1hcCA9IHRoaXMuaW5pdE1hcFxuXG4gICAgICAgIHRoaXMuYmluZFN3aXBlKCkgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICAgIERvdDogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbGliL2RvdCcpXG4gICAgfSxcblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuZGF0YVsgdGhpcy5jdXJyZW50U3BvdCBdXG5cbiAgICAgICAgdGhpcy5tYXAuc2V0Q2VudGVyKCBkYXRhLm1hcExvY2F0aW9uIClcbiAgICAgICAgdGhpcy5lbHMudGVtcC50ZXh0Q29udGVudCA9IGRhdGEudGVtcFxuICAgICAgICB0aGlzLmVscy5zcG90TmFtZS50ZXh0Q29udGVudCA9IGRhdGEubmFtZVxuICAgICAgICB0aGlzLmVscy5kaXN0YW5jZS50ZXh0Q29udGVudCA9IGRhdGEuZGlzdGFuY2VcbiAgICAgICAgdGhpcy5lbHMuc3BvdENvbnRleHQuaW5uZXJIVE1MID0gZGF0YS5jb250ZXh0LmpvaW4oIHRoaXMudGVtcGxhdGVzLkRvdCApXG4gICAgICAgIHRoaXMuZWxzLmRldGFpbC5pbm5lckhUTUwgPSBkYXRhLmRldGFpbHMuam9pbiggdGhpcy50ZW1wbGF0ZXMuRG90IClcbiAgICAgICAgdGhpcy5lbHMuaW1hZ2Uuc3JjID0gYC9zdGF0aWMvaW1nLyR7ZGF0YS5pbWFnZX1gXG4gICAgfVxuXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiggeyB9LCByZXF1aXJlKCcuLi8uLi8uLi9saWIvTXlPYmplY3QnKSwgcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwge1xuXG4gICAgT3B0aW1pemVkUmVzaXplOiByZXF1aXJlKCcuL2xpYi9PcHRpbWl6ZWRSZXNpemUnKSxcbiAgICBcbiAgICBYaHI6IHJlcXVpcmUoJy4uL1hocicpLFxuXG4gICAgYmluZEV2ZW50KCBrZXksIGV2ZW50ICkge1xuICAgICAgICB2YXIgZWxzID0gQXJyYXkuaXNBcnJheSggdGhpcy5lbHNbIGtleSBdICkgPyB0aGlzLmVsc1sga2V5IF0gOiBbIHRoaXMuZWxzWyBrZXkgXSBdXG4gICAgICAgIGVscy5mb3JFYWNoKCBlbCA9PiBlbC5hZGRFdmVudExpc3RlbmVyKCBldmVudCB8fCAnY2xpY2snLCBlID0+IHRoaXNbIGBvbiR7dGhpcy5jYXBpdGFsaXplRmlyc3RMZXR0ZXIoa2V5KX0ke3RoaXMuY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGV2ZW50KX1gIF0oIGUgKSApIClcbiAgICB9LFxuXG4gICAgY2FwaXRhbGl6ZUZpcnN0TGV0dGVyOiBzdHJpbmcgPT4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpLFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgaWYoIHRoaXMuc2l6ZSApIHRoaXMuT3B0aW1pemVkUmVzaXplLmFkZCggdGhpcy5zaXplICk7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIHRoaXMsIHsgZWxzOiB7IH0sIHNsdXJwOiB7IGF0dHI6ICdkYXRhLWpzJywgdmlldzogJ2RhdGEtdmlldycgfSwgdmlld3M6IHsgfSB9ICkucmVuZGVyKClcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVFdmVudHMoIGtleSwgZWwgKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHRoaXMuZXZlbnRzW2tleV1cblxuICAgICAgICBpZiggdHlwZSA9PT0gXCJzdHJpbmdcIiApIHsgdGhpcy5iaW5kRXZlbnQoIGtleSwgdGhpcy5ldmVudHNba2V5XSApIH1cbiAgICAgICAgZWxzZSBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5ldmVudHNba2V5XSApICkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbIGtleSBdLmZvckVhY2goIGV2ZW50T2JqID0+IHRoaXMuYmluZEV2ZW50KCBrZXksIGV2ZW50T2JqLmV2ZW50ICkgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnQoIGtleSwgdGhpcy5ldmVudHNba2V5XS5ldmVudCApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVsZXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oaWRlKClcbiAgICAgICAgLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKCB0aGlzLmVscy5jb250YWluZXIgKVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggdGhpcy5lbWl0KCdkZWxldGVkJykgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgZXZlbnRzOiB7fSxcblxuICAgIGdldERhdGEoKSB7XG4gICAgICAgIGlmKCAhdGhpcy5tb2RlbCApIHRoaXMubW9kZWwgPSBPYmplY3QuY3JlYXRlKCB0aGlzLk1vZGVsLCB7IHJlc291cmNlOiB7IHZhbHVlOiB0aGlzLm5hbWUgfSB9IClcblxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlbC5nZXQoKVxuICAgIH0sXG5cbiAgICBnZXRUZW1wbGF0ZU9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICAodGhpcy5tb2RlbCkgPyB0aGlzLm1vZGVsLmRhdGEgOiB7fSAsXG4gICAgICAgICAgICB7IHVzZXI6ICh0aGlzLnVzZXIpID8gdGhpcy51c2VyLmRhdGEgOiB7fSB9LFxuICAgICAgICAgICAgeyBvcHRzOiAodGhpcy50ZW1wbGF0ZU9wdHMpID8gdGhpcy50ZW1wbGF0ZU9wdHMgOiB7fSB9XG4gICAgICAgIClcbiAgICB9LFxuXG4gICAgaGlkZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGlmKCAhZG9jdW1lbnQuYm9keS5jb250YWlucyh0aGlzLmVscy5jb250YWluZXIpIHx8IHRoaXMuaXNIaWRkZW4oKSApIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgICAgIHRoaXMub25IaWRkZW5Qcm94eSA9IGUgPT4gdGhpcy5vbkhpZGRlbihyZXNvbHZlKVxuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgdGhpcy5vbkhpZGRlblByb3h5IClcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRlJylcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIGh0bWxUb0ZyYWdtZW50KCBzdHIgKSB7XG4gICAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIC8vIG1ha2UgdGhlIHBhcmVudCBvZiB0aGUgZmlyc3QgZGl2IGluIHRoZSBkb2N1bWVudCBiZWNvbWVzIHRoZSBjb250ZXh0IG5vZGVcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImRpdlwiKS5pdGVtKDApKVxuICAgICAgICByZXR1cm4gcmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KCBzdHIgKVxuICAgIH0sXG4gICAgXG4gICAgaXNIaWRkZW4oKSB7IHJldHVybiB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKSB9LFxuXG4gICAgb25IaWRkZW4oIHJlc29sdmUgKSB7XG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25IaWRkZW5Qcm94eSApXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxuICAgICAgICByZXNvbHZlKCB0aGlzLmVtaXQoJ2hpZGRlbicpIClcbiAgICB9LFxuXG4gICAgb25Mb2dpbigpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbiggdGhpcywgeyBlbHM6IHsgfSwgc2x1cnA6IHsgYXR0cjogJ2RhdGEtanMnLCB2aWV3OiAnZGF0YS12aWV3JyB9LCB2aWV3czogeyB9IH0gKS5yZW5kZXIoKVxuICAgIH0sXG5cbiAgICBvblNob3duKCByZXNvbHZlICkge1xuICAgICAgICB0aGlzLmVscy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uU2hvd25Qcm94eSApXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB0aGlzLnNpemUoKVxuICAgICAgICByZXNvbHZlKCB0aGlzLmVtaXQoJ3Nob3duJykgKVxuICAgIH0sXG5cbiAgICBzaG93Tm9BY2Nlc3MoKSB7XG4gICAgICAgIGFsZXJ0KFwiTm8gcHJpdmlsZWdlcywgc29uXCIpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7IHJldHVybiB0aGlzIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuc2x1cnBUZW1wbGF0ZSggeyB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXRUZW1wbGF0ZU9wdGlvbnMoKSApLCBpbnNlcnRpb246IHRoaXMuaW5zZXJ0aW9uIH0gKVxuXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB0aGlzLnNpemUoKVxuXG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlclN1YnZpZXdzKClcbiAgICAgICAgICAgICAgICAgICAucG9zdFJlbmRlcigpXG4gICAgfSxcblxuICAgIHJlbmRlclN1YnZpZXdzKCkge1xuICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5WaWV3cyB8fCBbIF0gKS5mb3JFYWNoKCBrZXkgPT4ge1xuICAgICAgICAgICAgaWYoIHRoaXMuVmlld3NbIGtleSBdLmVsICkge1xuICAgICAgICAgICAgICAgIGxldCBvcHRzID0gdGhpcy5WaWV3c1sga2V5IF0ub3B0c1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9wdHMgPSAoIG9wdHMgKVxuICAgICAgICAgICAgICAgICAgICA/IHR5cGVvZiBvcHRzID09PSBcIm9iamVjdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG9wdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIDogb3B0cygpXG4gICAgICAgICAgICAgICAgICAgIDoge31cblxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbIGtleSBdID0gdGhpcy5mYWN0b3J5LmNyZWF0ZSgga2V5LCBPYmplY3QuYXNzaWduKCB7IGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5WaWV3c1sga2V5IF0uZWwsIG1ldGhvZDogJ2luc2VydEJlZm9yZScgfSB9IH0sIG9wdHMgKSApXG4gICAgICAgICAgICAgICAgdGhpcy5WaWV3c1sga2V5IF0uZWwucmVtb3ZlKClcbiAgICAgICAgICAgICAgICB0aGlzLlZpZXdzWyBrZXkgXS5lbCA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBzaG93KCBkdXJhdGlvbiApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMub25TaG93blByb3h5ID0gZSA9PiB0aGlzLm9uU2hvd24ocmVzb2x2ZSlcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25TaG93blByb3h5IClcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCAnaGlkZScsICdoaWRkZW4nIClcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIHNsdXJwRWwoIGVsICkge1xuICAgICAgICB2YXIga2V5ID0gZWwuZ2V0QXR0cmlidXRlKCB0aGlzLnNsdXJwLmF0dHIgKSB8fCAnY29udGFpbmVyJ1xuXG4gICAgICAgIGlmKCBrZXkgPT09ICdjb250YWluZXInICkgZWwuY2xhc3NMaXN0LmFkZCggdGhpcy5uYW1lIClcblxuICAgICAgICB0aGlzLmVsc1sga2V5IF0gPSBBcnJheS5pc0FycmF5KCB0aGlzLmVsc1sga2V5IF0gKVxuICAgICAgICAgICAgPyB0aGlzLmVsc1sga2V5IF0ucHVzaCggZWwgKVxuICAgICAgICAgICAgOiAoIHRoaXMuZWxzWyBrZXkgXSAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgICAgICA/IFsgdGhpcy5lbHNbIGtleSBdLCBlbCBdXG4gICAgICAgICAgICAgICAgOiBlbFxuXG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLnNsdXJwLmF0dHIpXG5cbiAgICAgICAgaWYoIHRoaXMuZXZlbnRzWyBrZXkgXSApIHRoaXMuZGVsZWdhdGVFdmVudHMoIGtleSwgZWwgKVxuICAgIH0sXG5cbiAgICBzbHVycFRlbXBsYXRlKCBvcHRpb25zICkge1xuICAgICAgICB2YXIgZnJhZ21lbnQgPSB0aGlzLmh0bWxUb0ZyYWdtZW50KCBvcHRpb25zLnRlbXBsYXRlICksXG4gICAgICAgICAgICBzZWxlY3RvciA9IGBbJHt0aGlzLnNsdXJwLmF0dHJ9XWAsXG4gICAgICAgICAgICB2aWV3U2VsZWN0b3IgPSBgWyR7dGhpcy5zbHVycC52aWV3fV1gXG5cbiAgICAgICAgdGhpcy5zbHVycEVsKCBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKCcqJykgKVxuICAgICAgICBmcmFnbWVudC5xdWVyeVNlbGVjdG9yQWxsKCBgJHtzZWxlY3Rvcn0sICR7dmlld1NlbGVjdG9yfWAgKS5mb3JFYWNoKCBlbCA9PlxuICAgICAgICAgICAgKCBlbC5oYXNBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApICkgXG4gICAgICAgICAgICAgICAgPyB0aGlzLnNsdXJwRWwoIGVsIClcbiAgICAgICAgICAgICAgICA6IHRoaXMuVmlld3NbIGVsLmdldEF0dHJpYnV0ZSh0aGlzLnNsdXJwLnZpZXcpIF0uZWwgPSBlbFxuICAgICAgICApXG4gICAgICAgICAgXG4gICAgICAgIG9wdGlvbnMuaW5zZXJ0aW9uLm1ldGhvZCA9PT0gJ2luc2VydEJlZm9yZSdcbiAgICAgICAgICAgID8gb3B0aW9ucy5pbnNlcnRpb24uZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIGZyYWdtZW50LCBvcHRpb25zLmluc2VydGlvbi5lbCApXG4gICAgICAgICAgICA6IG9wdGlvbnMuaW5zZXJ0aW9uLmVsWyBvcHRpb25zLmluc2VydGlvbi5tZXRob2QgfHwgJ2FwcGVuZENoaWxkJyBdKCBmcmFnbWVudCApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgYWRkKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmKCAhdGhpcy5jYWxsYmFja3MubGVuZ3RoICkgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemUpXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spXG4gICAgfSxcblxuICAgIG9uUmVzaXplKCkge1xuICAgICAgIGlmKCB0aGlzLnJ1bm5pbmcgKSByZXR1cm5cblxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICA/IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMucnVuQ2FsbGJhY2tzIClcbiAgICAgICAgICAgIDogc2V0VGltZW91dCggdGhpcy5ydW5DYWxsYmFja3MsIDY2KVxuICAgIH0sXG5cbiAgICBydW5DYWxsYmFja3MoKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0gdGhpcy5jYWxsYmFja3MuZmlsdGVyKCBjYWxsYmFjayA9PiBjYWxsYmFjaygpIClcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2UgXG4gICAgfVxuXG59LCB7IGNhbGxiYWNrczogeyB2YWx1ZTogW10gfSwgcnVubmluZzogeyB2YWx1ZTogZmFsc2UgfSB9ICkuYWRkXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGBNMjQ1Ljc5MSwwQzE1My43OTksMCw3OC45NTcsNzQuODQxLDc4Ljk1NywxNjYuODMzYzAsMzYuOTY3LDIxLjc2NCw5My4xODcsNjguNDkzLDE3Ni45MjZcblx0XHRcdGMzMS44ODcsNTcuMTM4LDYzLjYyNywxMDUuNCw2NC45NjYsMTA3LjQzM2wyMi45NDEsMzQuNzczYzIuMzEzLDMuNTA3LDYuMjMyLDUuNjE3LDEwLjQzNCw1LjYxN3M4LjEyMS0yLjExLDEwLjQzNC01LjYxN1xuXHRcdFx0bDIyLjk0LTM0Ljc3MWMxLjMyNi0yLjAxLDMyLjgzNS00OS44NTUsNjQuOTY3LTEwNy40MzVjNDYuNzI5LTgzLjczNSw2OC40OTMtMTM5Ljk1NSw2OC40OTMtMTc2LjkyNlxuXHRcdFx0QzQxMi42MjUsNzQuODQxLDMzNy43ODMsMCwyNDUuNzkxLDB6IE0zMjIuMzAyLDMzMS41NzZjLTMxLjY4NSw1Ni43NzUtNjIuNjk2LDEwMy44NjktNjQuMDAzLDEwNS44NDhsLTEyLjUwOCwxOC45NTlcblx0XHRcdGwtMTIuNTA0LTE4Ljk1NGMtMS4zMTQtMS45OTUtMzIuNTYzLTQ5LjUxMS02NC4wMDctMTA1Ljg1M2MtNDMuMzQ1LTc3LjY3Ni02NS4zMjMtMTMzLjEwNC02NS4zMjMtMTY0Ljc0M1xuXHRcdFx0QzEwMy45NTcsODguNjI2LDE2Ny41ODMsMjUsMjQ1Ljc5MSwyNXMxNDEuODM0LDYzLjYyNiwxNDEuODM0LDE0MS44MzNDMzg3LjYyNSwxOTguNDc2LDM2NS42NDcsMjUzLjkwMiwzMjIuMzAyLDMzMS41NzZ6TTI0NS43OTEsNzMuMjkxYy01MS4wMDUsMC05Mi41LDQxLjQ5Ni05Mi41LDkyLjVzNDEuNDk1LDkyLjUsOTIuNSw5Mi41czkyLjUtNDEuNDk2LDkyLjUtOTIuNVxuXHRcdFx0UzI5Ni43OTYsNzMuMjkxLDI0NS43OTEsNzMuMjkxeiBNMjQ1Ljc5MSwyMzMuMjkxYy0zNy4yMiwwLTY3LjUtMzAuMjgtNjcuNS02Ny41czMwLjI4LTY3LjUsNjcuNS02Ny41XG5cdFx0XHRjMzcuMjIxLDAsNjcuNSwzMC4yOCw2Ny41LDY3LjVTMjgzLjAxMiwyMzMuMjkxLDI0NS43OTEsMjMzLjI5MXpgXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gYDxkaXY+PGRpdj4ke3JlcXVpcmUoJy4vbGliL2xvZ28nKX08L2Rpdj48ZGl2PkZpbmRpbmcgdGhlIGNsb3Nlc3QgcGFya2luZyBzcG90cy4uLnNpdCB0aWdodC48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4ge1xuICAgIGNvbnN0IHBhZ2VVaSA9IHJlcXVpcmUoJy4vbGliL2RvdCcpXG4gICAgcmV0dXJuIGA8ZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibWFwLXdyYXBcIj5cbiAgICAgICAgICAgIDxkaXYgZGF0YS1qcz1cIm1hcFwiIGNsYXNzPVwibWFwXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVudVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZW51LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj4ke3JlcXVpcmUoJy4vbGliL2luZm8nKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVudS1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+JHtyZXF1aXJlKCcuL2xpYi9jdXJzb3InKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImluZm8tbWFpblwiPlxuICAgICAgICAgICAgPGRpdiBkYXRhLWpzPVwicGFnZVVpXCIgY2xhc3M9XCJwYWdlLXVpXCI+XG4gICAgICAgICAgICAgICAgJHtBcnJheS5mcm9tKEFycmF5KHAubGVuZ3RoKS5rZXlzKCkpLm1hcCggKCkgPT4gcGFnZVVpICkuam9pbignJyl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgZGF0YS1qcz1cIndlYXRoZXJcIiBjbGFzcz1cIndlYXRoZXJcIj5cbiAgICAgICAgICAgICAgICA8c3Bhbj4ke3JlcXVpcmUoJy4vbGliL2Nsb3VkJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtanM9XCJ0ZW1wXCI+PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic25hZy1hcmVhXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxpbmUtd3JhcFwiPiR7cmVxdWlyZSgnLi9saWIvbGluZScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidXR0b24tcm93XCI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJzbmFnXCIgZGF0YS1qcz1cInNuYWdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+U25hZyBUaGlzIFNwb3Q8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgZGF0YS1qcz1cImRpc3RhbmNlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BvdC1kZXRhaWxzXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBkYXRhLWpzPVwic3BvdE5hbWVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtanM9XCJzcG90Q29udGV4dFwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgZGF0YS1qcz1cImRldGFpbFwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxpbWcgZGF0YS1qcz1cImltYWdlXCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5gIH1cbiIsIm1vZHVsZS5leHBvcnRzID0gXHJcbmA8c3ZnIGNsYXNzPVwiY2xvdWRcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJMYXllcl8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCIgdmlld0JveD1cIjAgMCA0OTYgNDk2XCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ5NiA0OTY7XCIgeG1sOnNwYWNlPVwicHJlc2VydmVcIj5cclxuPGc+XHJcblx0PGc+XHJcblx0XHQ8cGF0aCBkPVwiTTQxMy45NjgsMjMzLjA5NmMtMTAuODMyLTYzLjkyLTY1LjgxNi0xMTEuNTEyLTEzMC45NDQtMTEyLjk2QzI2NS44OCw5MC4zMzYsMjM0LjUzNiw3MiwyMDAsNzJcclxuXHRcdFx0Yy00MC45MzYsMC03Ny4xNjgsMjYuMDk2LTkwLjUyLDY0LjI4OGMtMjAuNjk2LTIuMTQ0LTQwLjIwOCw3LjQ2NC01MS42MjQsMjQuMDU2QzI1LjA4LDE2My40MjQsMCwxOTAuNiwwLDIyNFxyXG5cdFx0XHRjMCwyMC4xMDQsOS40MjQsMzguNjE2LDI1LjA0LDUwLjYxNkM5LjU2OCwyOTAuNDg4LDAsMzEyLjEzNiwwLDMzNmMwLDQ4LjUyLDM5LjQ4LDg4LDg4LDg4aDMxMmM1Mi45MzYsMCw5Ni00My4wNjQsOTYtOTZcclxuXHRcdFx0QzQ5NiwyODAuNDI0LDQ2MC40NjQsMjM5LjkyOCw0MTMuOTY4LDIzMy4wOTZ6IE0xNiwyMjRjMC0yNi4xNDQsMjAuNDk2LTQ3LjE5Miw0Ni42NDgtNDcuOTI4bDQuNDcyLTAuMTI4bDIuMjMyLTMuODcyXHJcblx0XHRcdGM4LjY0OC0xNC45ODQsMjUuNzI4LTIzLjI0LDQzLjg2NC0xOC45Nmw3LjU2LDEuNzkybDItNy41MTJDMTMyLjEwNCwxMTIuNDI0LDE2My44NDgsODgsMjAwLDg4XHJcblx0XHRcdGMyNS44OCwwLDQ5LjU4NCwxMi40MTYsNjQuNDk2LDMyLjk4NGMtNTMuNDk2LDYuMDk2LTk4LjYwOCw0My4yMjQtMTE0LjQ0LDk1LjI4OEMxNDguMDA4LDIxNi4wODgsMTQ1Ljk4NCwyMTYsMTQ0LDIxNlxyXG5cdFx0XHRjLTI0LjAzMiwwLTQ2LjU2LDEyLjE4NC01OS44NTYsMzIuMDhjLTE3LjI3MiwwLjc1Mi0zMy4yNDgsNi41MjgtNDYuNTUyLDE1Ljg2NEMyNC4yLDI1NS4wOTYsMTYsMjQwLjI0LDE2LDIyNHogTTQwMCw0MDhIODhcclxuXHRcdFx0Yy0zOS43MDQsMC03Mi0zMi4yOTYtNzItNzJjMC0zOS43MDQsMzIuMjk2LTcyLDcxLjY4OC03Mi4wMDhsNS41MzYsMC4wNGwyLjMwNC0zLjk5MkMxMDUuNTM2LDI0Mi43NDQsMTI0LjEyLDIzMiwxNDQsMjMyXHJcblx0XHRcdGMzLjM1MiwwLDYuODU2LDAuMzM2LDEwLjQyNCwxLjAwOGw3LjQyNCwxLjRsMS44MjQtNy4zMzZDMTc2Ljk2LDE3My40NDgsMjI0LjgsMTM2LDI4MCwxMzZcclxuXHRcdFx0YzYwLjUxMiwwLDExMS42NzIsNDUuMjgsMTE5LjAwOCwxMDUuMzJsMC41Niw0LjU5MkMzOTkuODQsMjQ5LjI0LDQwMCwyNTIuNiw0MDAsMjU2YzAsNjYuMTY4LTUzLjgzMiwxMjAtMTIwLDEyMHYxNlxyXG5cdFx0XHRjNzQuOTkyLDAsMTM2LTYxLjAwOCwxMzYtMTM2YzAtMi4xMi0wLjE3Ni00LjItMC4yNzItNi4yOTZDNDUyLjQzMiwyNTcuMDg4LDQ4MCwyODkuNzc2LDQ4MCwzMjhDNDgwLDM3Mi4xMTIsNDQ0LjExMiw0MDgsNDAwLDQwOFxyXG5cdFx0XHR6XCIvPlxyXG5cdDwvZz5cclxuPC9nPlxyXG48L3N2Zz5gXHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuYDxzdmcgY2xhc3M9XCJjdXJzb3JcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJMYXllcl8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCIgdmlld0JveD1cIjAgMCA1MTIgNTEyXCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7XCIgeG1sOnNwYWNlPVwicHJlc2VydmVcIj48Zz48cGF0aCBkPVwiTTUwMy44NDIsOC4zMzNjLTAuMDMtMC4wMy0wLjA1NC0wLjA2Mi0wLjA4NC0wLjA5MnMtMC4wNjItMC4wNTQtMC4wOTItMC4wODJjLTcuOTY4LTcuOTAyLTE5LjM5OC0xMC4yNzYtMjkuODYtNi4xODUgTDE3Ljc4OSwxODAuMjgxYy0xMi4wNTYsNC43MTMtMTkuMTE5LDE2LjUxNi0xNy41OCwyOS4zNjdjMS41NDMsMTIuODUyLDExLjE5NiwyMi42NDksMjQuMDIzLDI0LjM3OGwyMjIuODc3LDMwLjA1OCBjMC40MTcsMC4wNTcsMC43NTEsMC4zODksMC44MDgsMC44MDlsMzAuMDU4LDIyMi44NzVjMS43MjksMTIuODI3LDExLjUyNiwyMi40ODIsMjQuMzc4LDI0LjAyMyBjMS4xNzQsMC4xNDEsMi4zMzcsMC4yMDgsMy40ODksMC4yMDhjMTEuNDU4LDAsMjEuNTk0LTYuODM0LDI1Ljg3OC0xNy43ODdMNTEwLjAyOSwzOC4xOSBDNTE0LjExOCwyNy43Myw1MTEuNzQ1LDE2LjMwMiw1MDMuODQyLDguMzMzeiBNMjcuODQ3LDIwNy4yNTNjLTAuNS0wLjA2OC0wLjcyNS0wLjA5Ny0wLjgxMi0wLjgyMSBjLTAuMDg2LTAuNzI0LDAuMTI2LTAuODA4LDAuNTkzLTAuOTg5TDQ1NC4yODIsMzguNjE2TDI1NC43MjcsMjM4LjE3M0MyNTMuNDI2LDIzNy43OTYsMjcuODQ3LDIwNy4yNTMsMjcuODQ3LDIwNy4yNTN6IE0zMDYuNTU4LDQ4NC4zNzNjLTAuMTgyLDAuNDY3LTAuMjU1LDAuNjgyLTAuOTg5LDAuNTkyYy0wLjcyMy0wLjA4Ni0wLjc1NC0wLjMxMy0wLjgyLTAuODFjMCwwLTMwLjU0My0yMjUuNTc5LTMwLjkyLTIyNi44OFx0TDQ3My4zODQsNTcuNzE5TDMwNi41NTgsNDg0LjM3M3pcIi8+XHQ8L2c+PC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFxuYDxzdmcgY2xhc3M9XCJkb3RcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuICA8Y2lyY2xlIGN4PVwiMTBcIiBjeT1cIjEwXCIgcj1cIjEwXCIvPlxuPC9zdmc+YFxuIiwibW9kdWxlLmV4cG9ydHMgPVxyXG5gPHN2ZyBjbGFzcz1cImluZm9cInZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHZpZXdCb3g9XCIwIDAgMzMwIDMzMFwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzMzAgMzMwO1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+PGc+PHBhdGggZD1cIk0xNjUsMEM3NC4wMTksMCwwLDc0LjAyLDAsMTY1LjAwMUMwLDI1NS45ODIsNzQuMDE5LDMzMCwxNjUsMzMwczE2NS03NC4wMTgsMTY1LTE2NC45OTlDMzMwLDc0LjAyLDI1NS45ODEsMCwxNjUsMHogTTE2NSwzMDBjLTc0LjQ0LDAtMTM1LTYwLjU2LTEzNS0xMzQuOTk5QzMwLDkwLjU2Miw5MC41NiwzMCwxNjUsMzBzMTM1LDYwLjU2MiwxMzUsMTM1LjAwMUMzMDAsMjM5LjQ0LDIzOS40MzksMzAwLDE2NSwzMDB6XCIvPjxwYXRoIGQ9XCJNMTY0Ljk5OCw3MGMtMTEuMDI2LDAtMTkuOTk2LDguOTc2LTE5Ljk5NiwyMC4wMDljMCwxMS4wMjMsOC45NywxOS45OTEsMTkuOTk2LDE5Ljk5MWMxMS4wMjYsMCwxOS45OTYtOC45NjgsMTkuOTk2LTE5Ljk5MUMxODQuOTk0LDc4Ljk3NiwxNzYuMDI0LDcwLDE2NC45OTgsNzB6XCIvPjxwYXRoIGQ9XCJNMTY1LDE0MGMtOC4yODQsMC0xNSw2LjcxNi0xNSwxNXY5MGMwLDguMjg0LDYuNzE2LDE1LDE1LDE1YzguMjg0LDAsMTUtNi43MTYsMTUtMTV2LTkwQzE4MCwxNDYuNzE2LDE3My4yODQsMTQwLDE2NSwxNDB6XCIvPjwvZz48L3N2Zz5gXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gXG5gPHN2ZyB2aWV3Qm94PVwiMCAwIDIwIDIwXCIgY2xhc3M9XCJsaW5lXCIgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgICA8bGluZSBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgeDE9XCI1XCIgeTE9XCIxMFwiIHgyPVwiMjBcIiB5Mj1cIjEwXCIgc3Ryb2tlPVwiYmxhY2tcIiBzdHJva2Utd2lkdGg9XCI1XCIvPlxuPC9zdmc+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgdmlld0JveD1cIjAgMCA1OTEuNTIgOTE5LjQxXCI+PGRlZnM+PHN0eWxlPi5jbHMtMSwuY2xzLTV7ZmlsbDojMjMxZjIwO30uY2xzLTEsLmNscy0ye2ZpbGwtcnVsZTpldmVub2RkO30uY2xzLTJ7ZmlsbDp1cmwoI05ld19HcmFkaWVudCk7fS5jbHMtM3tmb250LXNpemU6MjQ1LjVweDtmb250LWZhbWlseTpJbXBhY3QsIEltcGFjdDt9LmNscy0zLC5jbHMtNHtmaWxsOiNmZmY7fS5jbHMtNXtmb250LXNpemU6NTQuODlweDtmb250LWZhbWlseTpBdmVuaXJOZXh0LVJlZ3VsYXIsIEF2ZW5pciBOZXh0O2xldHRlci1zcGFjaW5nOjAuNGVtO30uY2xzLTZ7bGV0dGVyLXNwYWNpbmc6MC4zOGVtO30uY2xzLTd7bGV0dGVyLXNwYWNpbmc6MC40ZW07fTwvc3R5bGU+PGxpbmVhckdyYWRpZW50IGlkPVwiTmV3X0dyYWRpZW50XCIgeDE9XCItMTk0LjY1XCIgeTE9XCI5OTQuODhcIiB4Mj1cIi0xOTQuNjVcIiB5Mj1cIjEwNjAuOTJcIiBncmFkaWVudFRyYW5zZm9ybT1cInRyYW5zbGF0ZSgxOTQyLjI3IC04MjEwLjE0KSBzY2FsZSg4LjUpXCIgZ3JhZGllbnRVbml0cz1cInVzZXJTcGFjZU9uVXNlXCI+PHN0b3Agb2Zmc2V0PVwiMC4zMVwiIHN0b3AtY29sb3I9XCIjMjk4NmE1XCIvPjxzdG9wIG9mZnNldD1cIjAuNjlcIiBzdG9wLWNvbG9yPVwiIzFjNzA4Y1wiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48dGl0bGU+QXNzZXQgMjwvdGl0bGU+PGcgaWQ9XCJMYXllcl8yXCIgZGF0YS1uYW1lPVwiTGF5ZXIgMlwiPjxnIGlkPVwiTGF5ZXJfMS0yXCIgZGF0YS1uYW1lPVwiTGF5ZXIgMVwiPjxwYXRoIGNsYXNzPVwiY2xzLTFcIiBkPVwiTTQ3OC43OCwyNDUuNTVDMzU4LjE2LDIwNS44MywzNjMsNTAuMTMsMTUyLjQyLDBjMTMuOCw0OS4zNiwyMi40OSw3Ny4xNSwyOC44MiwxMjguNzhsNTEuNTIsNS42OGMtMjYsNi43Ni01MS40MSw4LjQ5LTU1LjY4LDMyLjU0LTEyLjM2LDcwLjM4LTU4LjE3LDU5LjMxLTgxLjk0LDgxLjUyYTEyNS45LDEyNS45LDAsMCwwLDIwLjI4LDEuNjIsMTIxLjUyLDEyMS41MiwwLDAsMCwzNi44My01LjY2bDAsLjFBMTIxLjU2LDEyMS41NiwwLDAsMCwxODUuNTYsMjI4bDE1Ljg0LTExLjIxTDIxNy4yNSwyMjhhMTIxLjQ4LDEyMS40OCwwLDAsMCwzMy4yNywxNi41N2wwLS4xYTEyMy42LDEyMy42LDAsMCwwLDczLjY0LjF2LS4xQTEyMC44MywxMjAuODMsMCwwLDAsMzU3LjQ5LDIyOGwxNS44NC0xMS4yMUwzODkuMTgsMjI4YTEyMS4xOCwxMjEuMTgsMCwwLDAsMzMuMjcsMTYuNTdsMC0uMWExMjEuNDYsMTIxLjQ2LDAsMCwwLDM2LjgyLDUuNjYsMTI0LjQ1LDEyNC40NSwwLDAsMCwxNy40OC0xLjI0LDUuMTIsNS4xMiwwLDAsMCwyLTMuMzZaXCIvPjxwYXRoIGNsYXNzPVwiY2xzLTJcIiBkPVwiTTU3My45MywyNjQuNThWODEySDBWMjY4LjJhMTQ3LjgsMTQ3LjgsMCwwLDAsMzMuNDQtMTcuNzcsMTQ5LDE0OSwwLDAsMCwxNzEuOTQsMCwxNDksMTQ5LDAsMCwwLDE3MS45MywwLDE0OSwxNDksMCwwLDAsMTcxLjk1LDAsMTQ5LjExLDE0OS4xMSwwLDAsMCwyNC42NywxNC4xNFpcIi8+PHRleHQgY2xhc3M9XCJjbHMtM1wiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSg0Ny4yNSA3MjIuNjIpIHNjYWxlKDAuODMgMSlcIj5zaGFyazwvdGV4dD48cGF0aCBjbGFzcz1cImNscy00XCIgZD1cIk0xOTAuOTIsMzY5LjgybC0uNjksMTQuMDZxNS4zNi04LjUyLDExLjgxLTEyLjczYTI1LjMyLDI1LjMyLDAsMCwxLDE0LjEtNC4yQTIzLjQ3LDIzLjQ3LDAsMCwxLDIzMi4yNywzNzNhMjUuNjksMjUuNjksMCwwLDEsOC40OSwxNHExLjY5LDcuOTEsMS42OSwyNi44NXY2N3EwLDIxLjctMi4xMywzMC44N2EyNiwyNiwwLDAsMS04Ljc0LDE0LjYzLDI0LjIyLDI0LjIyLDAsMCwxLTE1Ljk0LDUuNDUsMjQuNTIsMjQuNTIsMCwwLDEtMTMuOC00LjIsNDAuODcsNDAuODcsMCwwLDEtMTEuNjItMTIuNDl2MzYuNDdIMTUwLjExVjM2OS44MlptMTEuNDIsNDYuMjdxMC0xNC43NC0uODktMTcuODZ0LTUtMy4xMmE0Ljg1LDQuODUsMCwwLDAtNS4xMSwzLjZxLTEuMTQsMy42LTEuMTQsMTcuMzhWNDgycTAsMTQuMzgsMS4xOSwxOGE0LjkzLDQuOTMsMCwwLDAsNS4xNiwzLjZxMy44NywwLDQuODItMy4zdC45NC0xNlpcIi8+PHBhdGggY2xhc3M9XCJjbHMtNFwiIGQ9XCJNMjkyLjQ5LDQzMS40M0gyNTQuODZWNDIwLjc2cTAtMTguNDYsMy41Mi0yOC40N3QxNC4xNS0xNy42OHExMC42Mi03LjY3LDI3LjYtNy42NywyMC4zNSwwLDMwLjY4LDguNjlBMzQuNTgsMzQuNTgsMCwwLDEsMzQzLjIzLDM5N3EyLjA5LDEyLjY1LDIuMDgsNTIuMDh2NzkuODRoLTM5VjUxNC43MnEtMy42Nyw4LjUzLTkuNDgsMTIuNzlBMjIuNzgsMjIuNzgsMCwwLDEsMjgzLDUzMS43N2EzMCwzMCwwLDAsMS0xOS4zMS03LjEzcS04Ljc5LTcuMTMtOC43OS0zMS4yM1Y0ODAuMzRxMC0xNy44Niw0LjY3LTI0LjMzdDIzLjEzLTE1LjFxMTkuNzYtOS4zNSwyMS4xNS0xMi41OXQxLjM5LTEzLjE5cTAtMTIuNDctMS41NC0xNi4yNHQtNS4xMS0zLjc4cS00LjA3LDAtNS4wNiwzLjE4dC0xLDE2LjQ4Wm0xMi43MSwyMS44MnEtOS42Myw4LjUxLTExLjE3LDE0LjI2dC0xLjU0LDE2LjU0cTAsMTIuMzUsMS4zNCwxNS45NGE1LjE3LDUuMTcsMCwwLDAsNS4zMSwzLjZxMy43NywwLDQuOTItMi44MlQzMDUuMiw0ODZaXCIvPjxwYXRoIGNsYXNzPVwiY2xzLTRcIiBkPVwiTTM5OS4yMywzNjkuODJsLTEuNTksMjAuOTJxOC43NC0yMi40NywyNS4zMi0yMy43OXY1NnEtMTEsMC0xNi4xOCwzLjZhMTUuMDYsMTUuMDYsMCwwLDAtNi4zNSwxMHEtMS4xOSw2LjQxLTEuMTksMjkuNTV2NjIuODFIMzU5LjEyVjM2OS44MlpcIi8+PHBhdGggY2xhc3M9XCJjbHMtNFwiIGQ9XCJNNTE4LjI3LDM2OS44Miw1MDIsNDMzLjE3bDIxLjE1LDk1LjcySDQ4NC41NmwtMTIuNTEtNjkuMzMsMCw2OS4zM0g0MzEuODlWMzM0LjgySDQ3MmwwLDgxLjQ3LDEyLjUxLTQ2LjQ3WlwiLz48dGV4dCBjbGFzcz1cImNscy01XCIgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDAuNzEgODk2Ljg1KVwiPnN0b3AgY2k8dHNwYW4gY2xhc3M9XCJjbHMtNlwiIHg9XCIzMTguNzNcIiB5PVwiMFwiPnI8L3RzcGFuPjx0c3BhbiBjbGFzcz1cImNscy03XCIgeD1cIjM1OS40NlwiIHk9XCIwXCI+Y2xpbmc8L3RzcGFuPjwvdGV4dD48L2c+PC9nPjwvc3ZnPmBcbiIsIm1vZHVsZS5leHBvcnRzID0gZXJyID0+IHsgY29uc29sZS5sb2coIGVyci5zdGFjayB8fCBlcnIgKSB9XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIEVycm9yOiByZXF1aXJlKCcuL015RXJyb3InKSxcblxuICAgIFA6ICggZnVuLCBhcmdzPVsgXSwgdGhpc0FyZyApID0+XG4gICAgICAgIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IFJlZmxlY3QuYXBwbHkoIGZ1biwgdGhpc0FyZyB8fCB0aGlzLCBhcmdzLmNvbmNhdCggKCBlLCAuLi5jYWxsYmFjayApID0+IGUgPyByZWplY3QoZSkgOiByZXNvbHZlKGNhbGxiYWNrKSApICkgKSxcbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpIHsgcmV0dXJuIHRoaXMgfVxufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4gKCcgKyBlciArICcpJyk7XG4gICAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGV2bGlzdGVuZXIpKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoZXZsaXN0ZW5lcilcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gMDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIl19
