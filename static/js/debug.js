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
                    req.open(data.method, data.url || "/" + data.resource + qs);
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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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


    data: [{
        mapLocation: { lat: 39.9564950, lng: -75.1925837 },
        name: 'Drexel Lot C',
        context: ['Hourly/Private Parking Structure', '5/60 spots'],
        details: ['$3/hr 0-3 hours', '3-5hr max time is $14.00', 'open 24 hrs'],
        image: 'spots/lot_c.JPG',
        spots: [8, 9, 10, 11, 49]
    }, {
        mapLocation: { lat: 39.9593209, lng: -75.1920907 },
        name: 'Drexel Lot D',
        context: ['Private Parking Structure', '1/60 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_d.JPG',
        spots: [45]
    }, {
        mapLocation: { lat: 39.9599256, lng: -75.1889950 },
        name: 'Drexel Lot H Spot 4',
        context: ['Private Parking Structure', '3/10 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_h.JPG',
        spots: [4, 15, 26]
    }, {
        mapLocation: { lat: 39.9583045, lng: -75.18882359 },
        name: 'Drexel Lot J',
        context: ['Private Parking Structure', '4/11 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_j.JPG',
        spots: [1, 2, 3, 4]
    }, {
        mapLocation: { lat: 39.9575587, lng: -75.1934095 },
        name: 'Drexel Lot K',
        context: ['Private Parking Structure', '1/210 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_k.JPG',
        spots: [115]
    }, {
        mapLocation: { lat: 39.9563293, lng: -75.1911949 },
        name: 'Drexel Lot P',
        context: ['Private Parking Structure', '5/9 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_p.JPG',
        spots: [1, 2, 3, 4, 5]
    }, {
        mapLocation: { lat: 39.9579902, lng: -75.1901658 },
        name: 'Drexel Lot R',
        context: ['Private Parking Structure', '1/24 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_r_signage.JPG',
        spots: [20]
    }, {
        mapLocation: { lat: 39.9568154, lng: -75.1872669 },
        name: 'Drexel Lot S',
        context: ['Private Parking Structure', '3/240 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_s_signage.JPG',
        spots: [71, 72, 73]
    }, {
        mapLocation: { lat: 39.9578782, lng: -75.1882803 },
        name: 'Drexel Lot T',
        context: ['Private Parking Structure', '2/19 spots'],
        details: ['Permit Only'],
        image: 'spots/lot_t_signage.JPG',
        spots: [2, 4]
    }, {
        mapLocation: { lat: 39.9545688, lng: -75.1915902 },
        name: 'Drexel Parking Services',
        context: ['Public Parking Structure', '88/803 spots'],
        details: ['$13/hour'],
        image: 'spots/offcampusstructure.jpg'
    }],

    initMap: function initMap() {
        var _ref,
            _this2 = this;

        this.directionsService = new google.maps.DirectionsService();

        this.map = new google.maps.Map(this.els.map, (_ref = {
            disableDefaultUI: true,
            disableDoubleClickZoom: true,
            draggable: false,
            navigationControl: false,
            scrollwheel: false
        }, _defineProperty(_ref, 'navigationControl', false), _defineProperty(_ref, 'mapTypeControl', false), _defineProperty(_ref, 'mapTypeId', google.maps.MapTypeId.ROADMAP), _defineProperty(_ref, 'scaleControl', false), _ref));

        this.origin = { lat: 39.956135, lng: -75.190693 };

        var marker = new google.maps.Marker({
            position: this.origin,
            icon: {
                fillColor: '#007aff',
                fillOpacity: 1,
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                strokeColor: 'white',
                strokeOpacity: .8,
                strokeWeight: 3
            },
            map: this.map
        });

        this.data.forEach(function (datum) {
            datum.marker = new google.maps.Marker({
                position: datum.mapLocation,
                title: datum.name,
                icon: window.location.origin + '/static/img/garage.png'
            });
        });

        this.els.pageUi.children[0].classList.add('selected');
        this.updating = true;
        this.update().then(function () {
            return Promise.resolve(_this2.updating = false);
        }).catch(this.Error);
    },
    onSwipeStart: function onSwipeStart(e) {
        e = 'changedTouches' in e ? e.changedTouches[0] : e;
        this.touchStartCoords = { x: e.pageX, y: e.pageY };
        this.startTime = new Date().getTime();
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
    getOffsetTop: function getOffsetTop(el) {
        var top = 0;
        do {
            if (!isNaN(el.offsetTop)) {
                top += el.offsetTop;
            }
        } while (el = el.offsetParent);
        return top;
    },
    onSwipeLeft: function onSwipeLeft() {
        var _this3 = this;

        console.log(this.els.container.clientHeight);
        console.log(window.document.body.scrollTop);
        console.log(this.getOffsetTop(this.els.image));
        if (this.expanded) {
            return this.swipeImage('left');
        }

        if (this.updating) return false;

        this.updating = true;

        this.removeOldMarkers();

        this.currentSpot = this.data[this.currentSpot + 1] ? this.currentSpot + 1 : 0;

        this.update('right').then(function () {
            return Promise.resolve(_this3.updating = false);
        }).catch(this.Error);
    },
    onSwipeRight: function onSwipeRight() {
        var _this4 = this;

        if (this.expanded) {
            return this.swipeImage('right');
        }

        if (this.updating) return false;

        this.updating = true;

        this.removeOldMarkers();

        this.currentSpot = this.data[this.currentSpot - 1] ? this.currentSpot - 1 : this.data.length - 1;

        this.update('left').then(function () {
            return Promise.resolve(_this4.updating = false);
        }).catch(this.Error);
    },
    postRender: function postRender() {
        var _this5 = this;

        this.currentSpot = 0;

        window.google ? this.initMap() : window.initMap = this.initMap;

        this.bindSwipe();

        this.Xhr({ method: 'get', url: 'http://api.openweathermap.org/data/2.5/weather?zip=19104,us&APPID=d5e191da9e31b8f644037ca310628102' }).then(function (response) {
            return _this5.els.temp.textContent = Math.round(response.main.temp * (9 / 5) - 459.67);
        }).catch(function (e) {
            console.log(e.stack || e);_this5.els.temp.remove();
        });

        return this;
    },
    removeOldMarkers: function removeOldMarkers() {
        var datum = this.data[this.currentSpot];
        datum.marker.setMap(null);
        datum.directionsDisplay.setMap(null);
        this.els.pageUi.children[this.currentSpot].classList.remove('selected');
    },
    renderDirections: function renderDirections(data) {
        var _this6 = this;

        if (data.directionsDisplay) {
            this.els.distance.textContent = data.distance;
            return Promise.resolve(data.directionsDisplay.setMap(this.map));
        }

        data.directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
        data.directionsDisplay.setMap(this.map);

        return new Promise(function (resolve, reject) {
            _this6.directionsService.route({
                origin: _this6.origin,
                destination: data.mapLocation,
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.IMPERIAL
            }, function (result, status) {
                if (status === 'OK') {
                    data.directionsDisplay.setDirections(result);
                    data.distance = result.routes[0].legs[0].distance.text + ' away';
                    _this6.els.distance.textContent = data.distance;
                    return resolve();
                } else {
                    return reject(status);
                }
            });
        });
    },


    templates: {
        Dot: require('./templates/lib/dot')
    },

    update: function update(swipe) {
        var _this7 = this;

        var data = this.data[this.currentSpot];

        if (swipe) {
            this.els.container.classList.add('hidden');
            this.els.container.classList.remove('slide-in-left', 'slide-in-right');
        }

        data.marker.setMap(this.map);
        this.els.pageUi.children[this.currentSpot].classList.add('selected');
        this.els.spotName.textContent = data.name;
        this.els.spotContext.innerHTML = data.context.join(this.templates.Dot);
        this.els.detail.innerHTML = data.details.join(this.templates.Dot);
        this.els.image.src = '/static/img/' + data.image;

        return this.renderDirections(data).then(function () {
            if (swipe) {
                _this7.els.container.classList.remove('hidden');
                _this7.els.container.classList.add('slide-in-' + swipe);
            }
            return Promise.resolve();
        });
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
            window.requestAnimationFrame(function () {
                _this6.els.container.classList.remove('hidden');
                window.requestAnimationFrame(function () {
                    return _this6.els.container.classList.remove('hide');
                });
            });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzL1hoci5qcyIsImNsaWVudC9qcy9mYWN0b3J5L1ZpZXcuanMiLCJjbGllbnQvanMvbWFpbi5qcyIsImNsaWVudC9qcy9yb3V0ZXIuanMiLCJjbGllbnQvanMvdmlld3MvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy9TbmFnLmpzIiwiY2xpZW50L2pzL3ZpZXdzL19fcHJvdG9fXy5qcyIsImNsaWVudC9qcy92aWV3cy9saWIvT3B0aW1pemVkUmVzaXplLmpzIiwiY2xpZW50L2pzL3ZpZXdzL2xpYi9jYXJQYXRoLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9Ib21lLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9TbmFnLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvY2xvdWQuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9jdXJzb3IuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9kb3QuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9pbmZvLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvbGluZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvbGliL2xvZ28uanMiLCJsaWIvTXlFcnJvci5qcyIsImxpYi9NeU9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLE9BQU0sUUFBUSx3QkFBUixDQURRO0FBRWQsT0FBTSxRQUFRLHdCQUFSO0FBRlEsQ0FBZjs7Ozs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLE9BQU0sUUFBUSxjQUFSLENBRFE7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cz17XG5cdEhvbWU6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0hvbWUnKSxcblx0U25hZzogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvU25hZycpXG59IiwibW9kdWxlLmV4cG9ydHM9e1xuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL0hvbWUnKSxcblx0U25hZzogcmVxdWlyZSgnLi92aWV3cy9TbmFnJylcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuLi8uLi9saWIvTXlPYmplY3QnKSwge1xuXG4gICAgUmVxdWVzdDoge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCBkYXRhICkge1xuICAgICAgICAgICAgbGV0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG5cbiAgICAgICAgICAgICAgICByZXEub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIFsgNTAwLCA0MDQsIDQwMSBdLmluY2x1ZGVzKCB0aGlzLnN0YXR1cyApXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlamVjdCggdGhpcy5yZXNwb25zZSApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHJlc29sdmUoIEpTT04ucGFyc2UodGhpcy5yZXNwb25zZSkgKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKCBkYXRhLm1ldGhvZCA9PT0gXCJnZXRcIiB8fCBkYXRhLm1ldGhvZCA9PT0gXCJvcHRpb25zXCIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBxcyA9IGRhdGEucXMgPyBgPyR7ZGF0YS5xc31gIDogJycgXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vcGVuKCBkYXRhLm1ldGhvZCwgZGF0YS51cmwgfHwgYC8ke2RhdGEucmVzb3VyY2V9JHtxc31gIClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKG51bGwpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9wZW4oIGRhdGEubWV0aG9kLCBgLyR7ZGF0YS5yZXNvdXJjZX1gLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEhlYWRlcnMoIHJlcSwgZGF0YS5oZWFkZXJzIClcbiAgICAgICAgICAgICAgICAgICAgcmVxLnNlbmQoIGRhdGEuZGF0YSApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApXG4gICAgICAgIH0sXG5cbiAgICAgICAgcGxhaW5Fc2NhcGUoIHNUZXh0ICkge1xuICAgICAgICAgICAgLyogaG93IHNob3VsZCBJIHRyZWF0IGEgdGV4dC9wbGFpbiBmb3JtIGVuY29kaW5nPyB3aGF0IGNoYXJhY3RlcnMgYXJlIG5vdCBhbGxvd2VkPyB0aGlzIGlzIHdoYXQgSSBzdXBwb3NlLi4uOiAqL1xuICAgICAgICAgICAgLyogXCI0XFwzXFw3IC0gRWluc3RlaW4gc2FpZCBFPW1jMlwiIC0tLS0+IFwiNFxcXFwzXFxcXDdcXCAtXFwgRWluc3RlaW5cXCBzYWlkXFwgRVxcPW1jMlwiICovXG4gICAgICAgICAgICByZXR1cm4gc1RleHQucmVwbGFjZSgvW1xcc1xcPVxcXFxdL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEhlYWRlcnMoIHJlcSwgaGVhZGVycz17fSApIHtcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCBcIkFjY2VwdFwiLCBoZWFkZXJzLmFjY2VwdCB8fCAnYXBwbGljYXRpb24vanNvbicgKVxuICAgICAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoIFwiQ29udGVudC1UeXBlXCIsIGhlYWRlcnMuY29udGVudFR5cGUgfHwgJ3RleHQvcGxhaW4nIClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfZmFjdG9yeSggZGF0YSApIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUoIHRoaXMuUmVxdWVzdCwgeyB9ICkuY29uc3RydWN0b3IoIGRhdGEgKVxuICAgIH0sXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICBpZiggIVhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgKSB7XG4gICAgICAgICAgWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmRBc0JpbmFyeSA9IGZ1bmN0aW9uKHNEYXRhKSB7XG4gICAgICAgICAgICB2YXIgbkJ5dGVzID0gc0RhdGEubGVuZ3RoLCB1aThEYXRhID0gbmV3IFVpbnQ4QXJyYXkobkJ5dGVzKTtcbiAgICAgICAgICAgIGZvciAodmFyIG5JZHggPSAwOyBuSWR4IDwgbkJ5dGVzOyBuSWR4KyspIHtcbiAgICAgICAgICAgICAgdWk4RGF0YVtuSWR4XSA9IHNEYXRhLmNoYXJDb2RlQXQobklkeCkgJiAweGZmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZW5kKHVpOERhdGEpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fZmFjdG9yeS5iaW5kKHRoaXMpXG4gICAgfVxuXG59ICksIHsgfSApLmNvbnN0cnVjdG9yKClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgY3JlYXRlKCBuYW1lLCBvcHRzICkge1xuICAgICAgICBjb25zdCBsb3dlciA9IG5hbWVcbiAgICAgICAgbmFtZSA9IG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpXG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKFxuICAgICAgICAgICAgdGhpcy5WaWV3c1sgbmFtZSBdLFxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbigge1xuICAgICAgICAgICAgICAgIG5hbWU6IHsgdmFsdWU6IG5hbWUgfSxcbiAgICAgICAgICAgICAgICBmYWN0b3J5OiB7IHZhbHVlOiB0aGlzIH0sXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IHsgdmFsdWU6IHRoaXMuVGVtcGxhdGVzWyBuYW1lIF0gfSxcbiAgICAgICAgICAgICAgICB1c2VyOiB7IHZhbHVlOiB0aGlzLlVzZXIgfVxuICAgICAgICAgICAgICAgIH0sIG9wdHMgKVxuICAgICAgICApLmNvbnN0cnVjdG9yKClcbiAgICAgICAgLm9uKCAnbmF2aWdhdGUnLCByb3V0ZSA9PiByZXF1aXJlKCcuLi9yb3V0ZXInKS5uYXZpZ2F0ZSggcm91dGUgKSApXG4gICAgICAgIC5vbiggJ2RlbGV0ZWQnLCAoKSA9PiBkZWxldGUgKHJlcXVpcmUoJy4uL3JvdXRlcicpKS52aWV3c1tuYW1lXSApXG4gICAgfSxcblxufSwge1xuICAgIFRlbXBsYXRlczogeyB2YWx1ZTogcmVxdWlyZSgnLi4vLlRlbXBsYXRlTWFwJykgfSxcbiAgICBWaWV3czogeyB2YWx1ZTogcmVxdWlyZSgnLi4vLlZpZXdNYXAnKSB9XG59IClcbiIsIndpbmRvdy5pbml0TWFwID0gKCkgPT4gdHJ1ZVxud2luZG93Lm9ubG9hZCA9ICgpID0+IHJlcXVpcmUoJy4vcm91dGVyJylcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgRXJyb3I6IHJlcXVpcmUoJy4uLy4uL2xpYi9NeUVycm9yJyksXG4gICAgXG4gICAgVmlld0ZhY3Rvcnk6IHJlcXVpcmUoJy4vZmFjdG9yeS9WaWV3JyksXG4gICAgXG4gICAgVmlld3M6IHJlcXVpcmUoJy4vLlZpZXdNYXAnKSxcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbnRlbnRDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29udGVudCcpXG5cbiAgICAgICAgd2luZG93Lm9ucG9wc3RhdGUgPSB0aGlzLmhhbmRsZS5iaW5kKHRoaXMpXG5cbiAgICAgICAgdGhpcy5oYW5kbGUoKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIGhhbmRsZSgpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVyKCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5zbGljZSgxKSApXG4gICAgfSxcblxuICAgIGhhbmRsZXIoIHBhdGggKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBwYXRoWzBdID8gcGF0aFswXS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBhdGhbMF0uc2xpY2UoMSkgOiAnJyxcbiAgICAgICAgICAgICAgdmlldyA9IHRoaXMuVmlld3NbbmFtZV0gPyBwYXRoWzBdIDogJ2hvbWUnO1xuXG4gICAgICAgICggKCB2aWV3ID09PSB0aGlzLmN1cnJlbnRWaWV3IClcbiAgICAgICAgICAgID8gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgICAgIDogUHJvbWlzZS5hbGwoIE9iamVjdC5rZXlzKCB0aGlzLnZpZXdzICkubWFwKCB2aWV3ID0+IHRoaXMudmlld3NbIHZpZXcgXS5oaWRlKCkgKSApICkgXG4gICAgICAgIC50aGVuKCAoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB2aWV3XG5cbiAgICAgICAgICAgIGlmKCB0aGlzLnZpZXdzWyB2aWV3IF0gKSByZXR1cm4gdGhpcy52aWV3c1sgdmlldyBdLm5hdmlnYXRlKCBwYXRoIClcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzWyB2aWV3IF0gPVxuICAgICAgICAgICAgICAgICAgICB0aGlzLlZpZXdGYWN0b3J5LmNyZWF0ZSggdmlldywge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmNvbnRlbnRDb250YWluZXIgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogeyB2YWx1ZTogcGF0aCwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgIClcbiAgICAgICAgfSApXG4gICAgICAgIC5jYXRjaCggdGhpcy5FcnJvciApXG4gICAgfSxcblxuICAgIG5hdmlnYXRlKCBsb2NhdGlvbiApIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoIHt9LCAnJywgbG9jYXRpb24gKVxuICAgICAgICB0aGlzLmhhbmRsZSgpXG4gICAgfVxuXG59LCB7IGN1cnJlbnRWaWV3OiB7IHZhbHVlOiAnJywgd3JpdGFibGU6IHRydWUgfSwgdmlld3M6IHsgdmFsdWU6IHsgfSB9IH0gKS5jb25zdHJ1Y3RvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBwb3N0UmVuZGVyKCkge1xuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB0aGlzLmhpZGUoKS50aGVuKCAoKSA9PiB0aGlzLmVtaXQoICduYXZpZ2F0ZScsICdzbmFnJyApICkuY2F0Y2goIHRoaXMuRXJyb3IgKSwgMjAwMCApXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBnYXJhZ2VQYXRoOiByZXF1aXJlKCcuL2xpYi9jYXJQYXRoJyksXG5cbiAgICBiaW5kU3dpcGUoKSB7XG4gICAgICAgIHRoaXMuc3dpcGVUaW1lID0gMTAwMFxuICAgICAgICB0aGlzLm1pblggPSAzMFxuICAgICAgICB0aGlzLm1heFkgPSAzMFxuXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgIGUgPT4gdGhpcy5vblN3aXBlU3RhcnQoZSksIGZhbHNlIClcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgZSA9PiB0aGlzLm9uU3dpcGVTdGFydChlKSwgZmFsc2UgKVxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBlID0+IHRoaXMub25Td2lwZUVuZChlKSwgZmFsc2UgKVxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgZSA9PiB0aGlzLm9uU3dpcGVFbmQoZSksIGZhbHNlIClcbiAgICB9LFxuXG4gICAgZ2V0VGVtcGxhdGVPcHRpb25zKCkgeyByZXR1cm4gdGhpcy5kYXRhIH0sXG5cbiAgICBkYXRhOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU2NDk1MCwgbG5nOiAtNzUuMTkyNTgzNyAgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IEMnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdIb3VybHkvUHJpdmF0ZSBQYXJraW5nIFN0cnVjdHVyZScsXG4gICAgICAgICAgICAgICAgJzUvNjAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICckMy9ociAwLTMgaG91cnMnLFxuICAgICAgICAgICAgICAgICczLTVociBtYXggdGltZSBpcyAkMTQuMDAnLFxuICAgICAgICAgICAgICAgICdvcGVuIDI0IGhycydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3Nwb3RzL2xvdF9jLkpQRycsXG4gICAgICAgICAgICBzcG90czogWyA4LCA5LCAxMCwgMTEsIDQ5IF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTkzMjA5LCBsbmc6IC03NS4xOTIwOTA3IH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBEJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBQYXJraW5nIFN0cnVjdHVyZScsXG4gICAgICAgICAgICAgICAgJzEvNjAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3Nwb3RzL2xvdF9kLkpQRycsXG4gICAgICAgICAgICBzcG90czogWyA0NSBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU5OTI1NiwgbG5nOiAtNzUuMTg4OTk1MCB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgSCBTcG90IDQnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnMy8xMCBzcG90cydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgICAgICAgJ1Blcm1pdCBPbmx5J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltYWdlOiAnc3BvdHMvbG90X2guSlBHJyxcbiAgICAgICAgICAgIHNwb3RzOiBbIDQsIDE1LCAyNiBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU4MzA0NSwgbG5nOiAtNzUuMTg4ODIzNTkgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IEonLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnNC8xMSBzcG90cydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgICAgICAgJ1Blcm1pdCBPbmx5J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltYWdlOiAnc3BvdHMvbG90X2ouSlBHJyxcbiAgICAgICAgICAgIHNwb3RzOiBbIDEsIDIsIDMsIDQgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NzU1ODcsIGxuZzogLTc1LjE5MzQwOTUgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IEsnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnMS8yMTAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3Nwb3RzL2xvdF9rLkpQRycsXG4gICAgICAgICAgICBzcG90czogWyAxMTUgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NjMyOTMsIGxuZzogLTc1LjE5MTE5NDkgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IFAnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnNS85IHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2U6ICdzcG90cy9sb3RfcC5KUEcnLFxuICAgICAgICAgICAgc3BvdHM6IFsgMSwgMiwgMywgNCwgNSBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU3OTkwMiwgbG5nOiAtNzUuMTkwMTY1OCB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgUicsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgUGFya2luZyBTdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgICAgICcxLzI0IHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2U6ICdzcG90cy9sb3Rfcl9zaWduYWdlLkpQRycsXG4gICAgICAgICAgICBzcG90czogWyAyMCBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU2ODE1NCwgbG5nOiAtNzUuMTg3MjY2OSB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgUycsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgUGFya2luZyBTdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgICAgICczLzI0MCBzcG90cydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgICAgICAgJ1Blcm1pdCBPbmx5J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltYWdlOiAnc3BvdHMvbG90X3Nfc2lnbmFnZS5KUEcnLFxuICAgICAgICAgICAgc3BvdHM6IFsgNzEsIDcyLCA3MyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU3ODc4MiwgbG5nOiAtNzUuMTg4MjgwMyB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgVCcsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgUGFya2luZyBTdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgICAgICcyLzE5IHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2U6ICdzcG90cy9sb3RfdF9zaWduYWdlLkpQRycsXG4gICAgICAgICAgICBzcG90czogWyAyLCA0IF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTQ1Njg4LCBsbmc6IC03NS4xOTE1OTAyIH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIFBhcmtpbmcgU2VydmljZXMnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQdWJsaWMgUGFya2luZyBTdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgICAgICc4OC84MDMgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICckMTMvaG91cidcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3Nwb3RzL29mZmNhbXB1c3N0cnVjdHVyZS5qcGcnLFxuICAgICAgICB9XG4gICAgXSxcblxuICAgIGluaXRNYXAoKSB7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uc1NlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1NlcnZpY2UoKVxuXG4gICAgICAgIHRoaXMubWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCggdGhpcy5lbHMubWFwLCB7XG4gICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxuICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcbiAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBuYXZpZ2F0aW9uQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXG4gICAgICAgICAgICBuYXZpZ2F0aW9uQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICBtYXBUeXBlQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxuICAgICAgICAgICAgc2NhbGVDb250cm9sOiBmYWxzZVxuICAgICAgICAgICAgLy96b29tOiAxNVxuICAgICAgICB9IClcblxuICAgICAgICB0aGlzLm9yaWdpbiA9IHsgbGF0OiAzOS45NTYxMzUsIGxuZzogLTc1LjE5MDY5MyB9XG5cbiAgICAgICAgY29uc3QgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigge1xuICAgICAgICAgICAgcG9zaXRpb246IHRoaXMub3JpZ2luLFxuICAgICAgICAgICAgaWNvbjoge1xuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJyMwMDdhZmYnLFxuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAxLFxuICAgICAgICAgICAgICAgIHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFLFxuICAgICAgICAgICAgICAgIHNjYWxlOiA3LFxuICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICAgIHN0cm9rZU9wYWNpdHk6IC44LFxuICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogM1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1hcDogdGhpcy5tYXBcbiAgICAgICAgfSApXG5cbiAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goIGRhdHVtID0+IHtcbiAgICAgICAgICAgIGRhdHVtLm1hcmtlciA9XG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogZGF0dW0ubWFwTG9jYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXR1bS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgYC9zdGF0aWMvaW1nL2dhcmFnZS5wbmdgXG4gICAgICAgICAgICAgICAgfSApXG4gICAgICAgIH0gKVxuXG4gICAgICAgIHRoaXMuZWxzLnBhZ2VVaS5jaGlsZHJlblsgMCBdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgICAgICAgdGhpcy51cGRhdGluZyA9IHRydWVcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgICAudGhlbiggKCkgPT4gUHJvbWlzZS5yZXNvbHZlKCB0aGlzLnVwZGF0aW5nID0gZmFsc2UgKSApXG4gICAgICAgIC5jYXRjaCggdGhpcy5FcnJvciApXG5cbiAgICB9LFxuXG4gICAgb25Td2lwZVN0YXJ0KCBlICkge1xuICAgICAgICBlID0gKCdjaGFuZ2VkVG91Y2hlcycgaW4gZSkgPyBlLmNoYW5nZWRUb3VjaGVzWzBdIDogZVxuICAgICAgICB0aGlzLnRvdWNoU3RhcnRDb29yZHMgPSB7IHg6IGUucGFnZVgsIHkgOmUucGFnZVkgfVxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgfSxcbiAgICBcbiAgICBvblN3aXBlRW5kKCBlICkge1xuICAgICAgICBlID0gKCdjaGFuZ2VkVG91Y2hlcycgaW4gZSkgPyBlLmNoYW5nZWRUb3VjaGVzWzBdIDogZVxuICAgICAgICB0aGlzLnRvdWNoRW5kQ29vcmRzID0geyB4OiBlLnBhZ2VYIC0gdGhpcy50b3VjaFN0YXJ0Q29vcmRzLngsIHkgOmUucGFnZVkgLSB0aGlzLnRvdWNoU3RhcnRDb29yZHMueSB9XG4gICAgICAgIHRoaXMuZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRoaXMuc3RhcnRUaW1lXG5cbiAgICAgICAgaWYoIHRoaXMuZWxhcHNlZFRpbWUgPD0gdGhpcy5zd2lwZVRpbWUgKSB7XG4gICAgICAgICAgICBpZiggTWF0aC5hYnModGhpcy50b3VjaEVuZENvb3Jkcy54KSA+PSB0aGlzLm1pblggJiYgTWF0aC5hYnModGhpcy50b3VjaEVuZENvb3Jkcy55KSA8PSB0aGlzLm1heFkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b3VjaEVuZENvb3Jkcy54IDwgMCA/IHRoaXMub25Td2lwZUxlZnQoKSA6IHRoaXMub25Td2lwZVJpZ2h0KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRPZmZzZXRUb3AoIGVsICkge1xuICAgICAgICBsZXQgdG9wID0gMFxuICAgICAgICBkbyB7XG4gICAgICAgICAgaWYgKCAhaXNOYU4oIGVsLm9mZnNldFRvcCApICkgeyB0b3AgKz0gZWwub2Zmc2V0VG9wIH1cbiAgICAgICAgfSB3aGlsZSggZWwgPSBlbC5vZmZzZXRQYXJlbnQgKVxuICAgICAgICByZXR1cm4gdG9wXG4gICAgfSxcblxuICAgIG9uU3dpcGVMZWZ0KCkge1xuICAgICAgICBjb25zb2xlLmxvZyggdGhpcy5lbHMuY29udGFpbmVyLmNsaWVudEhlaWdodCApXG4gICAgICAgIGNvbnNvbGUubG9nKCB3aW5kb3cuZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKVxuICAgICAgICBjb25zb2xlLmxvZyggdGhpcy5nZXRPZmZzZXRUb3AoIHRoaXMuZWxzLmltYWdlKSApXG4gICAgICAgIGlmKCB0aGlzLmV4cGFuZGVkICkgeyByZXR1cm4gdGhpcy5zd2lwZUltYWdlKCdsZWZ0JykgfVxuXG4gICAgICAgIGlmKCB0aGlzLnVwZGF0aW5nICkgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgdGhpcy51cGRhdGluZyA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5yZW1vdmVPbGRNYXJrZXJzKClcblxuICAgICAgICB0aGlzLmN1cnJlbnRTcG90ID0gdGhpcy5kYXRhWyB0aGlzLmN1cnJlbnRTcG90ICsgMSBdID8gdGhpcy5jdXJyZW50U3BvdCArIDEgOiAwXG5cbiAgICAgICAgdGhpcy51cGRhdGUoJ3JpZ2h0JylcbiAgICAgICAgLnRoZW4oICgpID0+IFByb21pc2UucmVzb2x2ZSggdGhpcy51cGRhdGluZyA9IGZhbHNlICkgKVxuICAgICAgICAuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgIH0sXG4gICAgXG4gICAgb25Td2lwZVJpZ2h0KCkge1xuICAgICAgICBpZiggdGhpcy5leHBhbmRlZCApIHsgcmV0dXJuIHRoaXMuc3dpcGVJbWFnZSgncmlnaHQnKSB9XG5cbiAgICAgICAgaWYoIHRoaXMudXBkYXRpbmcgKSByZXR1cm4gZmFsc2VcblxuICAgICAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnJlbW92ZU9sZE1hcmtlcnMoKVxuXG4gICAgICAgIHRoaXMuY3VycmVudFNwb3QgPSB0aGlzLmRhdGFbIHRoaXMuY3VycmVudFNwb3QgLSAxIF0gPyB0aGlzLmN1cnJlbnRTcG90IC0gMSA6IHRoaXMuZGF0YS5sZW5ndGggLSAxXG5cbiAgICAgICAgdGhpcy51cGRhdGUoJ2xlZnQnKVxuICAgICAgICAudGhlbiggKCkgPT4gUHJvbWlzZS5yZXNvbHZlKCB0aGlzLnVwZGF0aW5nID0gZmFsc2UgKSApXG4gICAgICAgIC5jYXRjaCggdGhpcy5FcnJvciApXG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFNwb3QgPSAwXG5cbiAgICAgICAgd2luZG93Lmdvb2dsZVxuICAgICAgICAgICAgPyB0aGlzLmluaXRNYXAoKVxuICAgICAgICAgICAgOiB3aW5kb3cuaW5pdE1hcCA9IHRoaXMuaW5pdE1hcFxuXG4gICAgICAgIHRoaXMuYmluZFN3aXBlKCkgICAgICAgIFxuICAgIFxuICAgICAgICB0aGlzLlhociggeyBtZXRob2Q6ICdnZXQnLCB1cmw6IGBodHRwOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS93ZWF0aGVyP3ppcD0xOTEwNCx1cyZBUFBJRD1kNWUxOTFkYTllMzFiOGY2NDQwMzdjYTMxMDYyODEwMmAgfSApXG4gICAgICAgIC50aGVuKCByZXNwb25zZSA9PiB0aGlzLmVscy50ZW1wLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZCggKCByZXNwb25zZS5tYWluLnRlbXAgKiAoOS81KSApIC0gNDU5LjY3ICkgKVxuICAgICAgICAuY2F0Y2goIGUgPT4geyBjb25zb2xlLmxvZyggZS5zdGFjayB8fCBlICk7IHRoaXMuZWxzLnRlbXAucmVtb3ZlKCkgfSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgcmVtb3ZlT2xkTWFya2VycygpIHtcbiAgICAgICAgY29uc3QgZGF0dW0gPSB0aGlzLmRhdGFbIHRoaXMuY3VycmVudFNwb3QgXVxuICAgICAgICBkYXR1bS5tYXJrZXIuc2V0TWFwKG51bGwpXG4gICAgICAgIGRhdHVtLmRpcmVjdGlvbnNEaXNwbGF5LnNldE1hcChudWxsKVxuICAgICAgICB0aGlzLmVscy5wYWdlVWkuY2hpbGRyZW5bIHRoaXMuY3VycmVudFNwb3QgXS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gICAgfSxcblxuICAgIHJlbmRlckRpcmVjdGlvbnMoIGRhdGEgKSB7XG4gICAgICAgIGlmKCBkYXRhLmRpcmVjdGlvbnNEaXNwbGF5ICkge1xuICAgICAgICAgICAgdGhpcy5lbHMuZGlzdGFuY2UudGV4dENvbnRlbnQgPSBkYXRhLmRpc3RhbmNlXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCBkYXRhLmRpcmVjdGlvbnNEaXNwbGF5LnNldE1hcCggdGhpcy5tYXAgKSApXG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLmRpcmVjdGlvbnNEaXNwbGF5ID0gbmV3IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNSZW5kZXJlciggeyBzdXBwcmVzc01hcmtlcnM6IHRydWUgfSApXG4gICAgICAgIGRhdGEuZGlyZWN0aW9uc0Rpc3BsYXkuc2V0TWFwKCB0aGlzLm1hcCApXG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uc1NlcnZpY2Uucm91dGUoIHtcbiAgICAgICAgICAgICAgICBvcmlnaW46IHRoaXMub3JpZ2luLFxuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uOiBkYXRhLm1hcExvY2F0aW9uLFxuICAgICAgICAgICAgICAgIHRyYXZlbE1vZGU6ICdEUklWSU5HJyxcbiAgICAgICAgICAgICAgICB1bml0U3lzdGVtOiBnb29nbGUubWFwcy5Vbml0U3lzdGVtLklNUEVSSUFMXG4gICAgICAgICAgICB9LCAoIHJlc3VsdCwgc3RhdHVzICkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCBzdGF0dXMgPT09ICdPSycgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZGlyZWN0aW9uc0Rpc3BsYXkuc2V0RGlyZWN0aW9ucyhyZXN1bHQpXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZGlzdGFuY2UgPSBgJHtyZXN1bHQucm91dGVzWzBdLmxlZ3NbMF0uZGlzdGFuY2UudGV4dH0gYXdheWBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbHMuZGlzdGFuY2UudGV4dENvbnRlbnQgPSBkYXRhLmRpc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyByZXR1cm4gcmVqZWN0KHN0YXR1cykgfVxuICAgICAgICAgICAgfSApXG4gICAgICAgIH0gKVxuXG4gICAgfSxcblxuICAgIHRlbXBsYXRlczoge1xuICAgICAgICBEb3Q6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xpYi9kb3QnKVxuICAgIH0sXG5cbiAgICB1cGRhdGUoIHN3aXBlICkge1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5kYXRhWyB0aGlzLmN1cnJlbnRTcG90IF07XG5cbiAgICAgICAgaWYoIHN3aXBlICkge1xuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSggJ3NsaWRlLWluLWxlZnQnLCAnc2xpZGUtaW4tcmlnaHQnIClcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEubWFya2VyLnNldE1hcCggdGhpcy5tYXAgKVxuICAgICAgICB0aGlzLmVscy5wYWdlVWkuY2hpbGRyZW5bIHRoaXMuY3VycmVudFNwb3QgXS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gICAgICAgIHRoaXMuZWxzLnNwb3ROYW1lLnRleHRDb250ZW50ID0gZGF0YS5uYW1lXG4gICAgICAgIHRoaXMuZWxzLnNwb3RDb250ZXh0LmlubmVySFRNTCA9IGRhdGEuY29udGV4dC5qb2luKCB0aGlzLnRlbXBsYXRlcy5Eb3QgKVxuICAgICAgICB0aGlzLmVscy5kZXRhaWwuaW5uZXJIVE1MID0gZGF0YS5kZXRhaWxzLmpvaW4oIHRoaXMudGVtcGxhdGVzLkRvdCApXG4gICAgICAgIHRoaXMuZWxzLmltYWdlLnNyYyA9IGAvc3RhdGljL2ltZy8ke2RhdGEuaW1hZ2V9YFxuXG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlckRpcmVjdGlvbnMoIGRhdGEgKVxuICAgICAgICAudGhlbiggKCkgPT4ge1xuICAgICAgICAgICAgaWYoIHN3aXBlICkge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCAnaGlkZGVuJyApXG4gICAgICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoIGBzbGlkZS1pbi0ke3N3aXBlfWAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgIH0gKVxuICAgIH1cblxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHsgfSwgcmVxdWlyZSgnLi4vLi4vLi4vbGliL015T2JqZWN0JyksIHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlci5wcm90b3R5cGUsIHtcblxuICAgIE9wdGltaXplZFJlc2l6ZTogcmVxdWlyZSgnLi9saWIvT3B0aW1pemVkUmVzaXplJyksXG4gICAgXG4gICAgWGhyOiByZXF1aXJlKCcuLi9YaHInKSxcblxuICAgIGJpbmRFdmVudCgga2V5LCBldmVudCApIHtcbiAgICAgICAgdmFyIGVscyA9IEFycmF5LmlzQXJyYXkoIHRoaXMuZWxzWyBrZXkgXSApID8gdGhpcy5lbHNbIGtleSBdIDogWyB0aGlzLmVsc1sga2V5IF0gXVxuICAgICAgICBlbHMuZm9yRWFjaCggZWwgPT4gZWwuYWRkRXZlbnRMaXN0ZW5lciggZXZlbnQgfHwgJ2NsaWNrJywgZSA9PiB0aGlzWyBgb24ke3RoaXMuY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGtleSl9JHt0aGlzLmNhcGl0YWxpemVGaXJzdExldHRlcihldmVudCl9YCBdKCBlICkgKSApXG4gICAgfSxcblxuICAgIGNhcGl0YWxpemVGaXJzdExldHRlcjogc3RyaW5nID0+IHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKSxcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB0aGlzLk9wdGltaXplZFJlc2l6ZS5hZGQoIHRoaXMuc2l6ZSApO1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKCB0aGlzLCB7IGVsczogeyB9LCBzbHVycDogeyBhdHRyOiAnZGF0YS1qcycsIHZpZXc6ICdkYXRhLXZpZXcnIH0sIHZpZXdzOiB7IH0gfSApLnJlbmRlcigpXG4gICAgfSxcblxuICAgIGRlbGVnYXRlRXZlbnRzKCBrZXksIGVsICkge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiB0aGlzLmV2ZW50c1trZXldXG5cbiAgICAgICAgaWYoIHR5cGUgPT09IFwic3RyaW5nXCIgKSB7IHRoaXMuYmluZEV2ZW50KCBrZXksIHRoaXMuZXZlbnRzW2tleV0gKSB9XG4gICAgICAgIGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuZXZlbnRzW2tleV0gKSApIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzWyBrZXkgXS5mb3JFYWNoKCBldmVudE9iaiA9PiB0aGlzLmJpbmRFdmVudCgga2V5LCBldmVudE9iai5ldmVudCApIClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50KCBrZXksIHRoaXMuZXZlbnRzW2tleV0uZXZlbnQgKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRlbGV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlkZSgpXG4gICAgICAgIC50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCggdGhpcy5lbHMuY29udGFpbmVyIClcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoIHRoaXMuZW1pdCgnZGVsZXRlZCcpIClcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIGV2ZW50czoge30sXG5cbiAgICBnZXREYXRhKCkge1xuICAgICAgICBpZiggIXRoaXMubW9kZWwgKSB0aGlzLm1vZGVsID0gT2JqZWN0LmNyZWF0ZSggdGhpcy5Nb2RlbCwgeyByZXNvdXJjZTogeyB2YWx1ZTogdGhpcy5uYW1lIH0gfSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZWwuZ2V0KClcbiAgICB9LFxuXG4gICAgZ2V0VGVtcGxhdGVPcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgKHRoaXMubW9kZWwpID8gdGhpcy5tb2RlbC5kYXRhIDoge30gLFxuICAgICAgICAgICAgeyB1c2VyOiAodGhpcy51c2VyKSA/IHRoaXMudXNlci5kYXRhIDoge30gfSxcbiAgICAgICAgICAgIHsgb3B0czogKHRoaXMudGVtcGxhdGVPcHRzKSA/IHRoaXMudGVtcGxhdGVPcHRzIDoge30gfVxuICAgICAgICApXG4gICAgfSxcblxuICAgIGhpZGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBpZiggIWRvY3VtZW50LmJvZHkuY29udGFpbnModGhpcy5lbHMuY29udGFpbmVyKSB8fCB0aGlzLmlzSGlkZGVuKCkgKSByZXR1cm4gcmVzb2x2ZSgpXG4gICAgICAgICAgICB0aGlzLm9uSGlkZGVuUHJveHkgPSBlID0+IHRoaXMub25IaWRkZW4ocmVzb2x2ZSlcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25IaWRkZW5Qcm94eSApXG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZScpXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBodG1sVG9GcmFnbWVudCggc3RyICkge1xuICAgICAgICBsZXQgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAvLyBtYWtlIHRoZSBwYXJlbnQgb2YgdGhlIGZpcnN0IGRpdiBpbiB0aGUgZG9jdW1lbnQgYmVjb21lcyB0aGUgY29udGV4dCBub2RlXG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJkaXZcIikuaXRlbSgwKSlcbiAgICAgICAgcmV0dXJuIHJhbmdlLmNyZWF0ZUNvbnRleHR1YWxGcmFnbWVudCggc3RyIClcbiAgICB9LFxuICAgIFxuICAgIGlzSGlkZGVuKCkgeyByZXR1cm4gdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5jb250YWlucygnaGlkZGVuJykgfSxcblxuICAgIG9uSGlkZGVuKCByZXNvbHZlICkge1xuICAgICAgICB0aGlzLmVscy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uSGlkZGVuUHJveHkgKVxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbiAgICAgICAgcmVzb2x2ZSggdGhpcy5lbWl0KCdoaWRkZW4nKSApXG4gICAgfSxcblxuICAgIG9uTG9naW4oKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oIHRoaXMsIHsgZWxzOiB7IH0sIHNsdXJwOiB7IGF0dHI6ICdkYXRhLWpzJywgdmlldzogJ2RhdGEtdmlldycgfSwgdmlld3M6IHsgfSB9ICkucmVuZGVyKClcbiAgICB9LFxuXG4gICAgb25TaG93biggcmVzb2x2ZSApIHtcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgdGhpcy5vblNob3duUHJveHkgKVxuICAgICAgICBpZiggdGhpcy5zaXplICkgdGhpcy5zaXplKClcbiAgICAgICAgcmVzb2x2ZSggdGhpcy5lbWl0KCdzaG93bicpIClcbiAgICB9LFxuXG4gICAgc2hvd05vQWNjZXNzKCkge1xuICAgICAgICBhbGVydChcIk5vIHByaXZpbGVnZXMsIHNvblwiKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBwb3N0UmVuZGVyKCkgeyByZXR1cm4gdGhpcyB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLnNsdXJwVGVtcGxhdGUoIHsgdGVtcGxhdGU6IHRoaXMudGVtcGxhdGUoIHRoaXMuZ2V0VGVtcGxhdGVPcHRpb25zKCkgKSwgaW5zZXJ0aW9uOiB0aGlzLmluc2VydGlvbiB9IClcblxuICAgICAgICBpZiggdGhpcy5zaXplICkgdGhpcy5zaXplKClcblxuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJTdWJ2aWV3cygpXG4gICAgICAgICAgICAgICAgICAgLnBvc3RSZW5kZXIoKVxuICAgIH0sXG5cbiAgICByZW5kZXJTdWJ2aWV3cygpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoIHRoaXMuVmlld3MgfHwgWyBdICkuZm9yRWFjaCgga2V5ID0+IHtcbiAgICAgICAgICAgIGlmKCB0aGlzLlZpZXdzWyBrZXkgXS5lbCApIHtcbiAgICAgICAgICAgICAgICBsZXQgb3B0cyA9IHRoaXMuVmlld3NbIGtleSBdLm9wdHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBvcHRzID0gKCBvcHRzIClcbiAgICAgICAgICAgICAgICAgICAgPyB0eXBlb2Ygb3B0cyA9PT0gXCJvYmplY3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPyBvcHRzXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG9wdHMoKVxuICAgICAgICAgICAgICAgICAgICA6IHt9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzWyBrZXkgXSA9IHRoaXMuZmFjdG9yeS5jcmVhdGUoIGtleSwgT2JqZWN0LmFzc2lnbiggeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuVmlld3NbIGtleSBdLmVsLCBtZXRob2Q6ICdpbnNlcnRCZWZvcmUnIH0gfSB9LCBvcHRzICkgKVxuICAgICAgICAgICAgICAgIHRoaXMuVmlld3NbIGtleSBdLmVsLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgdGhpcy5WaWV3c1sga2V5IF0uZWwgPSB1bmRlZmluZWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgc2hvdyggZHVyYXRpb24gKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uU2hvd25Qcm94eSA9IGUgPT4gdGhpcy5vblNob3duKHJlc29sdmUpXG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uU2hvd25Qcm94eSApXG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoICdoaWRkZW4nIClcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSggJ2hpZGUnICkgKVxuICAgICAgICAgICAgfSApXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBzbHVycEVsKCBlbCApIHtcbiAgICAgICAgdmFyIGtleSA9IGVsLmdldEF0dHJpYnV0ZSggdGhpcy5zbHVycC5hdHRyICkgfHwgJ2NvbnRhaW5lcidcblxuICAgICAgICBpZigga2V5ID09PSAnY29udGFpbmVyJyApIGVsLmNsYXNzTGlzdC5hZGQoIHRoaXMubmFtZSApXG5cbiAgICAgICAgdGhpcy5lbHNbIGtleSBdID0gQXJyYXkuaXNBcnJheSggdGhpcy5lbHNbIGtleSBdIClcbiAgICAgICAgICAgID8gdGhpcy5lbHNbIGtleSBdLnB1c2goIGVsIClcbiAgICAgICAgICAgIDogKCB0aGlzLmVsc1sga2V5IF0gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICAgICAgPyBbIHRoaXMuZWxzWyBrZXkgXSwgZWwgXVxuICAgICAgICAgICAgICAgIDogZWxcblxuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5zbHVycC5hdHRyKVxuXG4gICAgICAgIGlmKCB0aGlzLmV2ZW50c1sga2V5IF0gKSB0aGlzLmRlbGVnYXRlRXZlbnRzKCBrZXksIGVsIClcbiAgICB9LFxuXG4gICAgc2x1cnBUZW1wbGF0ZSggb3B0aW9ucyApIHtcbiAgICAgICAgdmFyIGZyYWdtZW50ID0gdGhpcy5odG1sVG9GcmFnbWVudCggb3B0aW9ucy50ZW1wbGF0ZSApLFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBgWyR7dGhpcy5zbHVycC5hdHRyfV1gLFxuICAgICAgICAgICAgdmlld1NlbGVjdG9yID0gYFske3RoaXMuc2x1cnAudmlld31dYFxuXG4gICAgICAgIHRoaXMuc2x1cnBFbCggZnJhZ21lbnQucXVlcnlTZWxlY3RvcignKicpIClcbiAgICAgICAgZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCggYCR7c2VsZWN0b3J9LCAke3ZpZXdTZWxlY3Rvcn1gICkuZm9yRWFjaCggZWwgPT5cbiAgICAgICAgICAgICggZWwuaGFzQXR0cmlidXRlKCB0aGlzLnNsdXJwLmF0dHIgKSApIFxuICAgICAgICAgICAgICAgID8gdGhpcy5zbHVycEVsKCBlbCApXG4gICAgICAgICAgICAgICAgOiB0aGlzLlZpZXdzWyBlbC5nZXRBdHRyaWJ1dGUodGhpcy5zbHVycC52aWV3KSBdLmVsID0gZWxcbiAgICAgICAgKVxuICAgICAgICAgIFxuICAgICAgICBvcHRpb25zLmluc2VydGlvbi5tZXRob2QgPT09ICdpbnNlcnRCZWZvcmUnXG4gICAgICAgICAgICA/IG9wdGlvbnMuaW5zZXJ0aW9uLmVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKCBmcmFnbWVudCwgb3B0aW9ucy5pbnNlcnRpb24uZWwgKVxuICAgICAgICAgICAgOiBvcHRpb25zLmluc2VydGlvbi5lbFsgb3B0aW9ucy5pbnNlcnRpb24ubWV0aG9kIHx8ICdhcHBlbmRDaGlsZCcgXSggZnJhZ21lbnQgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGFkZChjYWxsYmFjaykge1xuICAgICAgICBpZiggIXRoaXMuY2FsbGJhY2tzLmxlbmd0aCApIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplKVxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKVxuICAgIH0sXG5cbiAgICBvblJlc2l6ZSgpIHtcbiAgICAgICBpZiggdGhpcy5ydW5uaW5nICkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgPyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLnJ1bkNhbGxiYWNrcyApXG4gICAgICAgICAgICA6IHNldFRpbWVvdXQoIHRoaXMucnVuQ2FsbGJhY2tzLCA2NilcbiAgICB9LFxuXG4gICAgcnVuQ2FsbGJhY2tzKCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMuY2FsbGJhY2tzLmZpbHRlciggY2FsbGJhY2sgPT4gY2FsbGJhY2soKSApXG4gICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlIFxuICAgIH1cblxufSwgeyBjYWxsYmFja3M6IHsgdmFsdWU6IFtdIH0sIHJ1bm5pbmc6IHsgdmFsdWU6IGZhbHNlIH0gfSApLmFkZFxuIiwibW9kdWxlLmV4cG9ydHMgPSBgTTI0NS43OTEsMEMxNTMuNzk5LDAsNzguOTU3LDc0Ljg0MSw3OC45NTcsMTY2LjgzM2MwLDM2Ljk2NywyMS43NjQsOTMuMTg3LDY4LjQ5MywxNzYuOTI2XG5cdFx0XHRjMzEuODg3LDU3LjEzOCw2My42MjcsMTA1LjQsNjQuOTY2LDEwNy40MzNsMjIuOTQxLDM0Ljc3M2MyLjMxMywzLjUwNyw2LjIzMiw1LjYxNywxMC40MzQsNS42MTdzOC4xMjEtMi4xMSwxMC40MzQtNS42MTdcblx0XHRcdGwyMi45NC0zNC43NzFjMS4zMjYtMi4wMSwzMi44MzUtNDkuODU1LDY0Ljk2Ny0xMDcuNDM1YzQ2LjcyOS04My43MzUsNjguNDkzLTEzOS45NTUsNjguNDkzLTE3Ni45MjZcblx0XHRcdEM0MTIuNjI1LDc0Ljg0MSwzMzcuNzgzLDAsMjQ1Ljc5MSwweiBNMzIyLjMwMiwzMzEuNTc2Yy0zMS42ODUsNTYuNzc1LTYyLjY5NiwxMDMuODY5LTY0LjAwMywxMDUuODQ4bC0xMi41MDgsMTguOTU5XG5cdFx0XHRsLTEyLjUwNC0xOC45NTRjLTEuMzE0LTEuOTk1LTMyLjU2My00OS41MTEtNjQuMDA3LTEwNS44NTNjLTQzLjM0NS03Ny42NzYtNjUuMzIzLTEzMy4xMDQtNjUuMzIzLTE2NC43NDNcblx0XHRcdEMxMDMuOTU3LDg4LjYyNiwxNjcuNTgzLDI1LDI0NS43OTEsMjVzMTQxLjgzNCw2My42MjYsMTQxLjgzNCwxNDEuODMzQzM4Ny42MjUsMTk4LjQ3NiwzNjUuNjQ3LDI1My45MDIsMzIyLjMwMiwzMzEuNTc2ek0yNDUuNzkxLDczLjI5MWMtNTEuMDA1LDAtOTIuNSw0MS40OTYtOTIuNSw5Mi41czQxLjQ5NSw5Mi41LDkyLjUsOTIuNXM5Mi41LTQxLjQ5Niw5Mi41LTkyLjVcblx0XHRcdFMyOTYuNzk2LDczLjI5MSwyNDUuNzkxLDczLjI5MXogTTI0NS43OTEsMjMzLjI5MWMtMzcuMjIsMC02Ny41LTMwLjI4LTY3LjUtNjcuNXMzMC4yOC02Ny41LDY3LjUtNjcuNVxuXHRcdFx0YzM3LjIyMSwwLDY3LjUsMzAuMjgsNjcuNSw2Ny41UzI4My4wMTIsMjMzLjI5MSwyNDUuNzkxLDIzMy4yOTF6YFxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+IGA8ZGl2PjxkaXY+JHtyZXF1aXJlKCcuL2xpYi9sb2dvJyl9PC9kaXY+PGRpdj5GaW5kaW5nIHRoZSBjbG9zZXN0IHBhcmtpbmcgc3BvdHMuLi5zaXQgdGlnaHQuPC9kaXY+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+IHtcbiAgICBjb25zdCBwYWdlVWkgPSByZXF1aXJlKCcuL2xpYi9kb3QnKVxuICAgIHJldHVybiBgPGRpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1hcC13cmFwXCI+XG4gICAgICAgICAgICA8ZGl2IGRhdGEtanM9XCJtYXBcIiBjbGFzcz1cIm1hcFwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnVcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVudS1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+JHtyZXF1aXJlKCcuL2xpYi9pbmZvJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PiR7cmVxdWlyZSgnLi9saWIvY3Vyc29yJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbmZvLW1haW5cIj5cbiAgICAgICAgICAgIDxkaXYgZGF0YS1qcz1cInBhZ2VVaVwiIGNsYXNzPVwicGFnZS11aVwiPlxuICAgICAgICAgICAgICAgICR7QXJyYXkuZnJvbShBcnJheShwLmxlbmd0aCkua2V5cygpKS5tYXAoICgpID0+IHBhZ2VVaSApLmpvaW4oJycpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGRhdGEtanM9XCJ3ZWF0aGVyXCIgY2xhc3M9XCJ3ZWF0aGVyXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4+JHtyZXF1aXJlKCcuL2xpYi9jbG91ZCcpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLWpzPVwidGVtcFwiPjwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNuYWctYXJlYVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsaW5lLXdyYXBcIj4ke3JlcXVpcmUoJy4vbGliL2xpbmUnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwic25hZ1wiIGRhdGEtanM9XCJzbmFnXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlNuYWcgVGhpcyBTcG90PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtanM9XCJkaXN0YW5jZVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwb3QtZGV0YWlsc1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgZGF0YS1qcz1cInNwb3ROYW1lXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBkYXRhLWpzPVwic3BvdENvbnRleHRcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtanM9XCJkZXRhaWxcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8aW1nIGRhdGEtanM9XCJpbWFnZVwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+YCB9XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFxyXG5gPHN2ZyBjbGFzcz1cImNsb3VkXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiTGF5ZXJfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHZpZXdCb3g9XCIwIDAgNDk2IDQ5NlwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0OTYgNDk2O1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XHJcbjxnPlxyXG5cdDxnPlxyXG5cdFx0PHBhdGggZD1cIk00MTMuOTY4LDIzMy4wOTZjLTEwLjgzMi02My45Mi02NS44MTYtMTExLjUxMi0xMzAuOTQ0LTExMi45NkMyNjUuODgsOTAuMzM2LDIzNC41MzYsNzIsMjAwLDcyXHJcblx0XHRcdGMtNDAuOTM2LDAtNzcuMTY4LDI2LjA5Ni05MC41Miw2NC4yODhjLTIwLjY5Ni0yLjE0NC00MC4yMDgsNy40NjQtNTEuNjI0LDI0LjA1NkMyNS4wOCwxNjMuNDI0LDAsMTkwLjYsMCwyMjRcclxuXHRcdFx0YzAsMjAuMTA0LDkuNDI0LDM4LjYxNiwyNS4wNCw1MC42MTZDOS41NjgsMjkwLjQ4OCwwLDMxMi4xMzYsMCwzMzZjMCw0OC41MiwzOS40OCw4OCw4OCw4OGgzMTJjNTIuOTM2LDAsOTYtNDMuMDY0LDk2LTk2XHJcblx0XHRcdEM0OTYsMjgwLjQyNCw0NjAuNDY0LDIzOS45MjgsNDEzLjk2OCwyMzMuMDk2eiBNMTYsMjI0YzAtMjYuMTQ0LDIwLjQ5Ni00Ny4xOTIsNDYuNjQ4LTQ3LjkyOGw0LjQ3Mi0wLjEyOGwyLjIzMi0zLjg3MlxyXG5cdFx0XHRjOC42NDgtMTQuOTg0LDI1LjcyOC0yMy4yNCw0My44NjQtMTguOTZsNy41NiwxLjc5MmwyLTcuNTEyQzEzMi4xMDQsMTEyLjQyNCwxNjMuODQ4LDg4LDIwMCw4OFxyXG5cdFx0XHRjMjUuODgsMCw0OS41ODQsMTIuNDE2LDY0LjQ5NiwzMi45ODRjLTUzLjQ5Niw2LjA5Ni05OC42MDgsNDMuMjI0LTExNC40NCw5NS4yODhDMTQ4LjAwOCwyMTYuMDg4LDE0NS45ODQsMjE2LDE0NCwyMTZcclxuXHRcdFx0Yy0yNC4wMzIsMC00Ni41NiwxMi4xODQtNTkuODU2LDMyLjA4Yy0xNy4yNzIsMC43NTItMzMuMjQ4LDYuNTI4LTQ2LjU1MiwxNS44NjRDMjQuMiwyNTUuMDk2LDE2LDI0MC4yNCwxNiwyMjR6IE00MDAsNDA4SDg4XHJcblx0XHRcdGMtMzkuNzA0LDAtNzItMzIuMjk2LTcyLTcyYzAtMzkuNzA0LDMyLjI5Ni03Miw3MS42ODgtNzIuMDA4bDUuNTM2LDAuMDRsMi4zMDQtMy45OTJDMTA1LjUzNiwyNDIuNzQ0LDEyNC4xMiwyMzIsMTQ0LDIzMlxyXG5cdFx0XHRjMy4zNTIsMCw2Ljg1NiwwLjMzNiwxMC40MjQsMS4wMDhsNy40MjQsMS40bDEuODI0LTcuMzM2QzE3Ni45NiwxNzMuNDQ4LDIyNC44LDEzNiwyODAsMTM2XHJcblx0XHRcdGM2MC41MTIsMCwxMTEuNjcyLDQ1LjI4LDExOS4wMDgsMTA1LjMybDAuNTYsNC41OTJDMzk5Ljg0LDI0OS4yNCw0MDAsMjUyLjYsNDAwLDI1NmMwLDY2LjE2OC01My44MzIsMTIwLTEyMCwxMjB2MTZcclxuXHRcdFx0Yzc0Ljk5MiwwLDEzNi02MS4wMDgsMTM2LTEzNmMwLTIuMTItMC4xNzYtNC4yLTAuMjcyLTYuMjk2QzQ1Mi40MzIsMjU3LjA4OCw0ODAsMjg5Ljc3Niw0ODAsMzI4QzQ4MCwzNzIuMTEyLDQ0NC4xMTIsNDA4LDQwMCw0MDhcclxuXHRcdFx0elwiLz5cclxuXHQ8L2c+XHJcbjwvZz5cclxuPC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbmA8c3ZnIGNsYXNzPVwiY3Vyc29yXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiTGF5ZXJfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHZpZXdCb3g9XCIwIDAgNTEyIDUxMlwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyO1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+PGc+PHBhdGggZD1cIk01MDMuODQyLDguMzMzYy0wLjAzLTAuMDMtMC4wNTQtMC4wNjItMC4wODQtMC4wOTJzLTAuMDYyLTAuMDU0LTAuMDkyLTAuMDgyYy03Ljk2OC03LjkwMi0xOS4zOTgtMTAuMjc2LTI5Ljg2LTYuMTg1IEwxNy43ODksMTgwLjI4MWMtMTIuMDU2LDQuNzEzLTE5LjExOSwxNi41MTYtMTcuNTgsMjkuMzY3YzEuNTQzLDEyLjg1MiwxMS4xOTYsMjIuNjQ5LDI0LjAyMywyNC4zNzhsMjIyLjg3NywzMC4wNTggYzAuNDE3LDAuMDU3LDAuNzUxLDAuMzg5LDAuODA4LDAuODA5bDMwLjA1OCwyMjIuODc1YzEuNzI5LDEyLjgyNywxMS41MjYsMjIuNDgyLDI0LjM3OCwyNC4wMjMgYzEuMTc0LDAuMTQxLDIuMzM3LDAuMjA4LDMuNDg5LDAuMjA4YzExLjQ1OCwwLDIxLjU5NC02LjgzNCwyNS44NzgtMTcuNzg3TDUxMC4wMjksMzguMTkgQzUxNC4xMTgsMjcuNzMsNTExLjc0NSwxNi4zMDIsNTAzLjg0Miw4LjMzM3ogTTI3Ljg0NywyMDcuMjUzYy0wLjUtMC4wNjgtMC43MjUtMC4wOTctMC44MTItMC44MjEgYy0wLjA4Ni0wLjcyNCwwLjEyNi0wLjgwOCwwLjU5My0wLjk4OUw0NTQuMjgyLDM4LjYxNkwyNTQuNzI3LDIzOC4xNzNDMjUzLjQyNiwyMzcuNzk2LDI3Ljg0NywyMDcuMjUzLDI3Ljg0NywyMDcuMjUzeiBNMzA2LjU1OCw0ODQuMzczYy0wLjE4MiwwLjQ2Ny0wLjI1NSwwLjY4Mi0wLjk4OSwwLjU5MmMtMC43MjMtMC4wODYtMC43NTQtMC4zMTMtMC44Mi0wLjgxYzAsMC0zMC41NDMtMjI1LjU3OS0zMC45Mi0yMjYuODhcdEw0NzMuMzg0LDU3LjcxOUwzMDYuNTU4LDQ4NC4zNzN6XCIvPlx0PC9nPjwvc3ZnPmBcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcbmA8c3ZnIGNsYXNzPVwiZG90XCIgdmlld0JveD1cIjAgMCAyMCAyMFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgPGNpcmNsZSBjeD1cIjEwXCIgY3k9XCIxMFwiIHI9XCIxMFwiLz5cbjwvc3ZnPmBcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuYDxzdmcgY2xhc3M9XCJpbmZvXCJ2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIiB2aWV3Qm94PVwiMCAwIDMzMCAzMzBcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzMwIDMzMDtcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPjxnPjxwYXRoIGQ9XCJNMTY1LDBDNzQuMDE5LDAsMCw3NC4wMiwwLDE2NS4wMDFDMCwyNTUuOTgyLDc0LjAxOSwzMzAsMTY1LDMzMHMxNjUtNzQuMDE4LDE2NS0xNjQuOTk5QzMzMCw3NC4wMiwyNTUuOTgxLDAsMTY1LDB6IE0xNjUsMzAwYy03NC40NCwwLTEzNS02MC41Ni0xMzUtMTM0Ljk5OUMzMCw5MC41NjIsOTAuNTYsMzAsMTY1LDMwczEzNSw2MC41NjIsMTM1LDEzNS4wMDFDMzAwLDIzOS40NCwyMzkuNDM5LDMwMCwxNjUsMzAwelwiLz48cGF0aCBkPVwiTTE2NC45OTgsNzBjLTExLjAyNiwwLTE5Ljk5Niw4Ljk3Ni0xOS45OTYsMjAuMDA5YzAsMTEuMDIzLDguOTcsMTkuOTkxLDE5Ljk5NiwxOS45OTFjMTEuMDI2LDAsMTkuOTk2LTguOTY4LDE5Ljk5Ni0xOS45OTFDMTg0Ljk5NCw3OC45NzYsMTc2LjAyNCw3MCwxNjQuOTk4LDcwelwiLz48cGF0aCBkPVwiTTE2NSwxNDBjLTguMjg0LDAtMTUsNi43MTYtMTUsMTV2OTBjMCw4LjI4NCw2LjcxNiwxNSwxNSwxNWM4LjI4NCwwLDE1LTYuNzE2LDE1LTE1di05MEMxODAsMTQ2LjcxNiwxNzMuMjg0LDE0MCwxNjUsMTQwelwiLz48L2c+PC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFxuYDxzdmcgdmlld0JveD1cIjAgMCAyMCAyMFwiIGNsYXNzPVwibGluZVwiIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHgxPVwiNVwiIHkxPVwiMTBcIiB4Mj1cIjIwXCIgeTI9XCIxMFwiIHN0cm9rZT1cImJsYWNrXCIgc3Ryb2tlLXdpZHRoPVwiNVwiLz5cbjwvc3ZnPmBcbiIsIm1vZHVsZS5leHBvcnRzID0gYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHZpZXdCb3g9XCIwIDAgNTkxLjUyIDkxOS40MVwiPjxkZWZzPjxzdHlsZT4uY2xzLTEsLmNscy01e2ZpbGw6IzIzMWYyMDt9LmNscy0xLC5jbHMtMntmaWxsLXJ1bGU6ZXZlbm9kZDt9LmNscy0ye2ZpbGw6dXJsKCNOZXdfR3JhZGllbnQpO30uY2xzLTN7Zm9udC1zaXplOjI0NS41cHg7Zm9udC1mYW1pbHk6SW1wYWN0LCBJbXBhY3Q7fS5jbHMtMywuY2xzLTR7ZmlsbDojZmZmO30uY2xzLTV7Zm9udC1zaXplOjU0Ljg5cHg7Zm9udC1mYW1pbHk6QXZlbmlyTmV4dC1SZWd1bGFyLCBBdmVuaXIgTmV4dDtsZXR0ZXItc3BhY2luZzowLjRlbTt9LmNscy02e2xldHRlci1zcGFjaW5nOjAuMzhlbTt9LmNscy03e2xldHRlci1zcGFjaW5nOjAuNGVtO308L3N0eWxlPjxsaW5lYXJHcmFkaWVudCBpZD1cIk5ld19HcmFkaWVudFwiIHgxPVwiLTE5NC42NVwiIHkxPVwiOTk0Ljg4XCIgeDI9XCItMTk0LjY1XCIgeTI9XCIxMDYwLjkyXCIgZ3JhZGllbnRUcmFuc2Zvcm09XCJ0cmFuc2xhdGUoMTk0Mi4yNyAtODIxMC4xNCkgc2NhbGUoOC41KVwiIGdyYWRpZW50VW5pdHM9XCJ1c2VyU3BhY2VPblVzZVwiPjxzdG9wIG9mZnNldD1cIjAuMzFcIiBzdG9wLWNvbG9yPVwiIzI5ODZhNVwiLz48c3RvcCBvZmZzZXQ9XCIwLjY5XCIgc3RvcC1jb2xvcj1cIiMxYzcwOGNcIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHRpdGxlPkFzc2V0IDI8L3RpdGxlPjxnIGlkPVwiTGF5ZXJfMlwiIGRhdGEtbmFtZT1cIkxheWVyIDJcIj48ZyBpZD1cIkxheWVyXzEtMlwiIGRhdGEtbmFtZT1cIkxheWVyIDFcIj48cGF0aCBjbGFzcz1cImNscy0xXCIgZD1cIk00NzguNzgsMjQ1LjU1QzM1OC4xNiwyMDUuODMsMzYzLDUwLjEzLDE1Mi40MiwwYzEzLjgsNDkuMzYsMjIuNDksNzcuMTUsMjguODIsMTI4Ljc4bDUxLjUyLDUuNjhjLTI2LDYuNzYtNTEuNDEsOC40OS01NS42OCwzMi41NC0xMi4zNiw3MC4zOC01OC4xNyw1OS4zMS04MS45NCw4MS41MmExMjUuOSwxMjUuOSwwLDAsMCwyMC4yOCwxLjYyLDEyMS41MiwxMjEuNTIsMCwwLDAsMzYuODMtNS42NmwwLC4xQTEyMS41NiwxMjEuNTYsMCwwLDAsMTg1LjU2LDIyOGwxNS44NC0xMS4yMUwyMTcuMjUsMjI4YTEyMS40OCwxMjEuNDgsMCwwLDAsMzMuMjcsMTYuNTdsMC0uMWExMjMuNiwxMjMuNiwwLDAsMCw3My42NC4xdi0uMUExMjAuODMsMTIwLjgzLDAsMCwwLDM1Ny40OSwyMjhsMTUuODQtMTEuMjFMMzg5LjE4LDIyOGExMjEuMTgsMTIxLjE4LDAsMCwwLDMzLjI3LDE2LjU3bDAtLjFhMTIxLjQ2LDEyMS40NiwwLDAsMCwzNi44Miw1LjY2LDEyNC40NSwxMjQuNDUsMCwwLDAsMTcuNDgtMS4yNCw1LjEyLDUuMTIsMCwwLDAsMi0zLjM2WlwiLz48cGF0aCBjbGFzcz1cImNscy0yXCIgZD1cIk01NzMuOTMsMjY0LjU4VjgxMkgwVjI2OC4yYTE0Ny44LDE0Ny44LDAsMCwwLDMzLjQ0LTE3Ljc3LDE0OSwxNDksMCwwLDAsMTcxLjk0LDAsMTQ5LDE0OSwwLDAsMCwxNzEuOTMsMCwxNDksMTQ5LDAsMCwwLDE3MS45NSwwLDE0OS4xMSwxNDkuMTEsMCwwLDAsMjQuNjcsMTQuMTRaXCIvPjx0ZXh0IGNsYXNzPVwiY2xzLTNcIiB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoNDcuMjUgNzIyLjYyKSBzY2FsZSgwLjgzIDEpXCI+c2hhcms8L3RleHQ+PHBhdGggY2xhc3M9XCJjbHMtNFwiIGQ9XCJNMTkwLjkyLDM2OS44MmwtLjY5LDE0LjA2cTUuMzYtOC41MiwxMS44MS0xMi43M2EyNS4zMiwyNS4zMiwwLDAsMSwxNC4xLTQuMkEyMy40NywyMy40NywwLDAsMSwyMzIuMjcsMzczYTI1LjY5LDI1LjY5LDAsMCwxLDguNDksMTRxMS42OSw3LjkxLDEuNjksMjYuODV2NjdxMCwyMS43LTIuMTMsMzAuODdhMjYsMjYsMCwwLDEtOC43NCwxNC42MywyNC4yMiwyNC4yMiwwLDAsMS0xNS45NCw1LjQ1LDI0LjUyLDI0LjUyLDAsMCwxLTEzLjgtNC4yLDQwLjg3LDQwLjg3LDAsMCwxLTExLjYyLTEyLjQ5djM2LjQ3SDE1MC4xMVYzNjkuODJabTExLjQyLDQ2LjI3cTAtMTQuNzQtLjg5LTE3Ljg2dC01LTMuMTJhNC44NSw0Ljg1LDAsMCwwLTUuMTEsMy42cS0xLjE0LDMuNi0xLjE0LDE3LjM4VjQ4MnEwLDE0LjM4LDEuMTksMThhNC45Myw0LjkzLDAsMCwwLDUuMTYsMy42cTMuODcsMCw0LjgyLTMuM3QuOTQtMTZaXCIvPjxwYXRoIGNsYXNzPVwiY2xzLTRcIiBkPVwiTTI5Mi40OSw0MzEuNDNIMjU0Ljg2VjQyMC43NnEwLTE4LjQ2LDMuNTItMjguNDd0MTQuMTUtMTcuNjhxMTAuNjItNy42NywyNy42LTcuNjcsMjAuMzUsMCwzMC42OCw4LjY5QTM0LjU4LDM0LjU4LDAsMCwxLDM0My4yMywzOTdxMi4wOSwxMi42NSwyLjA4LDUyLjA4djc5Ljg0aC0zOVY1MTQuNzJxLTMuNjcsOC41My05LjQ4LDEyLjc5QTIyLjc4LDIyLjc4LDAsMCwxLDI4Myw1MzEuNzdhMzAsMzAsMCwwLDEtMTkuMzEtNy4xM3EtOC43OS03LjEzLTguNzktMzEuMjNWNDgwLjM0cTAtMTcuODYsNC42Ny0yNC4zM3QyMy4xMy0xNS4xcTE5Ljc2LTkuMzUsMjEuMTUtMTIuNTl0MS4zOS0xMy4xOXEwLTEyLjQ3LTEuNTQtMTYuMjR0LTUuMTEtMy43OHEtNC4wNywwLTUuMDYsMy4xOHQtMSwxNi40OFptMTIuNzEsMjEuODJxLTkuNjMsOC41MS0xMS4xNywxNC4yNnQtMS41NCwxNi41NHEwLDEyLjM1LDEuMzQsMTUuOTRhNS4xNyw1LjE3LDAsMCwwLDUuMzEsMy42cTMuNzcsMCw0LjkyLTIuODJUMzA1LjIsNDg2WlwiLz48cGF0aCBjbGFzcz1cImNscy00XCIgZD1cIk0zOTkuMjMsMzY5LjgybC0xLjU5LDIwLjkycTguNzQtMjIuNDcsMjUuMzItMjMuNzl2NTZxLTExLDAtMTYuMTgsMy42YTE1LjA2LDE1LjA2LDAsMCwwLTYuMzUsMTBxLTEuMTksNi40MS0xLjE5LDI5LjU1djYyLjgxSDM1OS4xMlYzNjkuODJaXCIvPjxwYXRoIGNsYXNzPVwiY2xzLTRcIiBkPVwiTTUxOC4yNywzNjkuODIsNTAyLDQzMy4xN2wyMS4xNSw5NS43Mkg0ODQuNTZsLTEyLjUxLTY5LjMzLDAsNjkuMzNINDMxLjg5VjMzNC44Mkg0NzJsMCw4MS40NywxMi41MS00Ni40N1pcIi8+PHRleHQgY2xhc3M9XCJjbHMtNVwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgwLjcxIDg5Ni44NSlcIj5zdG9wIGNpPHRzcGFuIGNsYXNzPVwiY2xzLTZcIiB4PVwiMzE4LjczXCIgeT1cIjBcIj5yPC90c3Bhbj48dHNwYW4gY2xhc3M9XCJjbHMtN1wiIHg9XCIzNTkuNDZcIiB5PVwiMFwiPmNsaW5nPC90c3Bhbj48L3RleHQ+PC9nPjwvZz48L3N2Zz5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGVyciA9PiB7IGNvbnNvbGUubG9nKCBlcnIuc3RhY2sgfHwgZXJyICkgfVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICBFcnJvcjogcmVxdWlyZSgnLi9NeUVycm9yJyksXG5cbiAgICBQOiAoIGZ1biwgYXJncz1bIF0sIHRoaXNBcmcgKSA9PlxuICAgICAgICBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiBSZWZsZWN0LmFwcGx5KCBmdW4sIHRoaXNBcmcgfHwgdGhpcywgYXJncy5jb25jYXQoICggZSwgLi4uY2FsbGJhY2sgKSA9PiBlID8gcmVqZWN0KGUpIDogcmVzb2x2ZShjYWxsYmFjaykgKSApICksXG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7IHJldHVybiB0aGlzIH1cbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgICBpZiAoaXNGdW5jdGlvbihldmxpc3RlbmVyKSlcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGV2bGlzdGVuZXIpXG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiJdfQ==
