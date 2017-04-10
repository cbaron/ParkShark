(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
	Home: require('./views/templates/Home'),
	Snag: require('./views/templates/Snag')
};

},{"./views/templates/Home":11,"./views/templates/Snag":12}],2:[function(require,module,exports){
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

    Pointer: require('./templates/lib/MapPointer'),

    events: {
        snag: 'click'
    },

    onSnagClick: function onSnagClick() {
        var location = this.data[this.currentSpot].mapLocation;

        window.location = 'waze://?ll=' + location.lat + ',' + location.lng + '&navigate=yes';
    },
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

        this.els.container.addEventListener('touchmove', function (e) {
            return e.stopImmediatePropagation();
        }, { passive: false });
        this.els.container.addEventListener('mousemove', function (e) {
            return e.stopImmediatePropagation();
        }, { passive: false });

        this.els.image.addEventListener('touchmove', function (e) {
            return e.preventDefault();
        }, { passive: false });
        this.els.image.addEventListener('mousemove', function (e) {
            return e.preventDefault();
        }, { passive: false });
    },
    getTemplateOptions: function getTemplateOptions() {
        return this.data;
    },


    data: [{
        mapLocation: { lat: 39.9564950, lng: -75.1925837 },
        name: 'Drexel Lot C',
        context: ['Hourly/Private Lot', '5/60 spots'],
        details: ['$3/hr 0-3 hours', '3-5hr max time is $14.00', 'open 24 hrs'],
        images: ['lot_c', 8, 9, 10, 11, 49],
        type: 'lot'
    }, {
        mapLocation: { lat: 39.9593209, lng: -75.1920907 },
        name: 'Drexel Lot D',
        context: ['Private Lot', '1/60 spots'],
        details: ['Permit Only'],
        images: ['lot_d', 45],
        type: 'lot'
    }, {
        mapLocation: { lat: 39.9599256, lng: -75.1889950 },
        name: 'Drexel Lot H',
        context: ['Private Lot', '3/10 spots'],
        details: ['Permit Only'],
        images: ['lot_h', 4, 15, 26],
        type: 'lot'
    }, {
        mapLocation: { lat: 39.9583045, lng: -75.18882359 },
        name: 'Drexel Lot J',
        context: ['Private Lot', '4/11 spots'],
        details: ['Permit Only'],
        images: ['lot_j', 1, 2, 3, 4],
        type: 'lot'
    }, {
        mapLocation: { lat: 39.9575587, lng: -75.1934095 },
        name: 'Drexel Lot K',
        context: ['Private Lot', '1/210 spots'],
        details: ['Permit Only'],
        images: ['lot_k', 115],
        type: 'lot'
    }, {
        mapLocation: { lat: 39.9563293, lng: -75.1911949 },
        name: 'Drexel Lot P',
        context: ['Private Lot', '5/9 spots'],
        details: ['Permit Only'],
        images: ['lot_p', 1, 2, 3, 4, 5],
        type: 'lot'
    }, {
        mapLocation: { lat: 39.9579902, lng: -75.1901658 },
        name: 'Drexel Lot R',
        context: ['Private Lot', '1/24 spots'],
        details: ['Permit Only'],
        images: ['lot_r', 20],
        type: 'lot'
    }, {
        mapLocation: { lat: 39.9568154, lng: -75.1872669 },
        name: 'Drexel Lot S',
        context: ['Private Lot', '3/240 spots'],
        details: ['Permit Only'],
        images: ['lot_s', 71, 72, 73],
        type: 'lot'
    }, {
        mapLocation: { lat: 39.9578782, lng: -75.1882803 },
        name: 'Drexel Lot T',
        context: ['Private Lot', '2/19 spots'],
        details: ['Permit Only'],
        images: ['lot_t', 2, 4],
        type: 'lot'
    }, {
        mapLocation: { lat: 39.9545688, lng: -75.1915902 },
        name: 'Drexel Parking Services',
        context: ['Public Parking Structure', '88/803 spots'],
        details: ['$13/hour'],
        images: ['offcampusstructure'],
        type: 'garage'
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
                label: datum.name,
                //path: this.Pointer,
                scale: 5,
                strokeColor: 'purple',
                strokeOpacity: .8,
                strokeWeight: 3,
                fillColor: 'purple',
                fillOpacity: 1
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
    isExpanded: function isExpanded() {
        return window.innerHeight + window.document.body.scrollTop > this.getOffsetTop(this.els.image);
    },
    swipeImage: function swipeImage(direction) {
        var _this3 = this;

        var datum = this.data[this.currentSpot];

        var image = new Image();

        image.onload = function () {
            _this3.els.image.src = image.src;
            //this.els.image.classList.remove( 'hide' )
            //window.requestAnimationFrame( () =>  this.els.image.classList.add( `slide-in-${direction}` ) )
        };

        if (!datum.imageIndex) datum.imageIndex = 0;

        datum.imageIndex = direction === 'left' ? datum.images[datum.imageIndex + 1] ? datum.imageIndex + 1 : 0 : datum.images[datum.imageIndex - 1] ? datum.imageIndex - 1 : datum.images.length - 1;

        //this.els.image.classList.add('hide')
        //window.requestAnimationFrame( () => this.els.image.classList.remove( 'slide-in-left', 'slide-in-right' ) )

        image.src = this.getImageSrc(datum, datum.imageIndex);
    },
    onSwipeLeft: function onSwipeLeft() {
        var _this4 = this;

        if (this.isExpanded()) {
            return this.swipeImage('right');
        }

        if (this.updating) return false;

        this.updating = true;

        this.removeOldMarkers();

        this.currentSpot = this.data[this.currentSpot + 1] ? this.currentSpot + 1 : 0;

        this.update('right').then(function () {
            return Promise.resolve(_this4.updating = false);
        }).catch(this.Error);
    },
    onSwipeRight: function onSwipeRight() {
        var _this5 = this;

        if (this.isExpanded()) {
            return this.swipeImage('left');
        }

        if (this.updating) return false;

        this.updating = true;

        this.removeOldMarkers();

        this.currentSpot = this.data[this.currentSpot - 1] ? this.currentSpot - 1 : this.data.length - 1;

        this.update('left').then(function () {
            return Promise.resolve(_this5.updating = false);
        }).catch(this.Error);
    },
    postRender: function postRender() {
        var _this6 = this;

        this.currentSpot = 0;

        this.els.mapWrap.style.height = window.innerHeight - 140 + 'px';

        window.google ? this.initMap() : window.initMap = this.initMap;

        this.bindSwipe();

        this.Xhr({ method: 'get', url: 'http://api.openweathermap.org/data/2.5/weather?zip=19104,us&APPID=d5e191da9e31b8f644037ca310628102' }).then(function (response) {
            return _this6.els.temp.textContent = Math.round(response.main.temp * (9 / 5) - 459.67);
        }).catch(function (e) {
            console.log(e.stack || e);_this6.els.temp.remove();
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
        var _this7 = this;

        if (data.directionsDisplay) {
            this.els.distance.textContent = data.distance;
            return Promise.resolve(data.directionsDisplay.setMap(this.map));
        }

        data.directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
        data.directionsDisplay.setMap(this.map);

        return new Promise(function (resolve, reject) {
            _this7.directionsService.route({
                origin: _this7.origin,
                destination: data.mapLocation,
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.IMPERIAL
            }, function (result, status) {
                if (status === 'OK') {
                    data.directionsDisplay.setDirections(result);
                    data.distance = result.routes[0].legs[0].distance.text + ' away';
                    _this7.els.distance.textContent = data.distance;
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

    getImageSrc: function getImageSrc(datum, imageIndex) {
        var path = typeof datum.images[imageIndex] === 'string' ? datum.images[imageIndex] : datum.images[0] + '_spot_' + datum.images[imageIndex];

        return '/static/img/spots/' + path + '.JPG';
    },
    update: function update(swipe) {
        var _this8 = this;

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
        this.els.image.src = this.getImageSrc(data, data.index || 0);

        return this.renderDirections(data).then(function () {
            if (swipe) {
                _this8.els.container.classList.remove('hidden');
                _this8.els.container.classList.add('slide-in-' + swipe);
            }
            return Promise.resolve();
        });
    }
});

},{"./__proto__":9,"./templates/lib/MapPointer":13,"./templates/lib/dot":16}],9:[function(require,module,exports){
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
'use strict';

module.exports = function (p) {
  return '<div><div>' + require('./lib/logo') + '</div><div>Finding the closest parking spots...sit tight.</div>';
};

},{"./lib/logo":19}],12:[function(require,module,exports){
'use strict';

module.exports = function (p) {
    var pageUi = require('./lib/dot');
    return '<div>\n        <div data-js="mapWrap" class="map-wrap">\n            <div data-js="map" class="map"></div>\n            <div class="menu">\n                <div class="menu-item">\n                    <div>' + require('./lib/info') + '</div>\n                </div>\n                <div class="menu-item">\n                    <div>' + require('./lib/cursor') + '</div>\n                </div>\n            </div>\n        </div>\n        <div class="info-main">\n            <div data-js="pageUi" class="page-ui">\n                ' + Array.from(Array(p.length).keys()).map(function () {
        return pageUi;
    }).join('') + '\n            </div>\n            <div data-js="weather" class="weather">\n                <span>' + require('./lib/cloud') + '</span>\n                <span data-js="temp"></span>\n            </div>\n            <div class="snag-area">\n                <div class="line-wrap">' + require('./lib/line') + '</div>\n                <div class="button-row">\n                    <button class="snag" data-js="snag">\n                        <div>Snag This Spot</div>\n                        <div data-js="distance"></div>\n                    </button>\n                </div>\n            </div>\n            <div class="spot-details">\n                <div data-js="spotName"></div>\n                <div class="context" data-js="spotContext"></div>\n                <div class="context" data-js="detail"></div>\n                <img data-js="image" />\n            </div>\n        </div>\n    </div>';
};

},{"./lib/cloud":14,"./lib/cursor":15,"./lib/dot":16,"./lib/info":17,"./lib/line":18}],13:[function(require,module,exports){
"use strict";

module.exports = "M172.98-.024a42.989,42.989,0,0,1,43.007,42.971c0,15.885-10.251,27.485-21.455,37.193-21.555,18.677-21.552,55.845-21.552,55.845s0-36.852-21.613-55.879c-11.108-9.781-21.394-21.3-21.394-37.158A42.989,42.989,0,0,1,172.98-.024Z";

},{}],14:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzL1hoci5qcyIsImNsaWVudC9qcy9mYWN0b3J5L1ZpZXcuanMiLCJjbGllbnQvanMvbWFpbi5qcyIsImNsaWVudC9qcy9yb3V0ZXIuanMiLCJjbGllbnQvanMvdmlld3MvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy9TbmFnLmpzIiwiY2xpZW50L2pzL3ZpZXdzL19fcHJvdG9fXy5qcyIsImNsaWVudC9qcy92aWV3cy9saWIvT3B0aW1pemVkUmVzaXplLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9Ib21lLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9TbmFnLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvTWFwUG9pbnRlci5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvbGliL2Nsb3VkLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvY3Vyc29yLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvZG90LmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvaW5mby5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvbGliL2xpbmUuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9sb2dvLmpzIiwibGliL015RXJyb3IuanMiLCJsaWIvTXlPYmplY3QuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsT0FBTyxPQUFQLEdBQWU7QUFDZCxPQUFNLFFBQVEsd0JBQVIsQ0FEUTtBQUVkLE9BQU0sUUFBUSx3QkFBUjtBQUZRLENBQWY7Ozs7O0FDQUEsT0FBTyxPQUFQLEdBQWU7QUFDZCxPQUFNLFFB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9Ib21lJyksXG5cdFNuYWc6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL1NuYWcnKVxufSIsIm1vZHVsZS5leHBvcnRzPXtcblx0SG9tZTogcmVxdWlyZSgnLi92aWV3cy9Ib21lJyksXG5cdFNuYWc6IHJlcXVpcmUoJy4vdmlld3MvU25hZycpXG59IiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi4vLi4vbGliL015T2JqZWN0JyksIHtcblxuICAgIFJlcXVlc3Q6IHtcblxuICAgICAgICBjb25zdHJ1Y3RvciggZGF0YSApIHtcbiAgICAgICAgICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG4gICAgICAgICAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBbIDUwMCwgNDA0LCA0MDEgXS5pbmNsdWRlcyggdGhpcy5zdGF0dXMgKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZWplY3QoIHRoaXMucmVzcG9uc2UgKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiByZXNvbHZlKCBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2UpIClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggZGF0YS5tZXRob2QgPT09IFwiZ2V0XCIgfHwgZGF0YS5tZXRob2QgPT09IFwib3B0aW9uc1wiICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcXMgPSBkYXRhLnFzID8gYD8ke2RhdGEucXN9YCA6ICcnIFxuICAgICAgICAgICAgICAgICAgICByZXEub3BlbiggZGF0YS5tZXRob2QsIGRhdGEudXJsIHx8IGAvJHtkYXRhLnJlc291cmNlfSR7cXN9YCApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SGVhZGVycyggcmVxLCBkYXRhLmhlYWRlcnMgKVxuICAgICAgICAgICAgICAgICAgICByZXEuc2VuZChudWxsKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5vcGVuKCBkYXRhLm1ldGhvZCwgYC8ke2RhdGEucmVzb3VyY2V9YCwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKCBkYXRhLmRhdGEgKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9LFxuXG4gICAgICAgIHBsYWluRXNjYXBlKCBzVGV4dCApIHtcbiAgICAgICAgICAgIC8qIGhvdyBzaG91bGQgSSB0cmVhdCBhIHRleHQvcGxhaW4gZm9ybSBlbmNvZGluZz8gd2hhdCBjaGFyYWN0ZXJzIGFyZSBub3QgYWxsb3dlZD8gdGhpcyBpcyB3aGF0IEkgc3VwcG9zZS4uLjogKi9cbiAgICAgICAgICAgIC8qIFwiNFxcM1xcNyAtIEVpbnN0ZWluIHNhaWQgRT1tYzJcIiAtLS0tPiBcIjRcXFxcM1xcXFw3XFwgLVxcIEVpbnN0ZWluXFwgc2FpZFxcIEVcXD1tYzJcIiAqL1xuICAgICAgICAgICAgcmV0dXJuIHNUZXh0LnJlcGxhY2UoL1tcXHNcXD1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRIZWFkZXJzKCByZXEsIGhlYWRlcnM9e30gKSB7XG4gICAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlciggXCJBY2NlcHRcIiwgaGVhZGVycy5hY2NlcHQgfHwgJ2FwcGxpY2F0aW9uL2pzb24nIClcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCBcIkNvbnRlbnQtVHlwZVwiLCBoZWFkZXJzLmNvbnRlbnRUeXBlIHx8ICd0ZXh0L3BsYWluJyApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2ZhY3RvcnkoIGRhdGEgKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKCB0aGlzLlJlcXVlc3QsIHsgfSApLmNvbnN0cnVjdG9yKCBkYXRhIClcbiAgICB9LFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgaWYoICFYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2VuZEFzQmluYXJ5ICkge1xuICAgICAgICAgIFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgPSBmdW5jdGlvbihzRGF0YSkge1xuICAgICAgICAgICAgdmFyIG5CeXRlcyA9IHNEYXRhLmxlbmd0aCwgdWk4RGF0YSA9IG5ldyBVaW50OEFycmF5KG5CeXRlcyk7XG4gICAgICAgICAgICBmb3IgKHZhciBuSWR4ID0gMDsgbklkeCA8IG5CeXRlczsgbklkeCsrKSB7XG4gICAgICAgICAgICAgIHVpOERhdGFbbklkeF0gPSBzRGF0YS5jaGFyQ29kZUF0KG5JZHgpICYgMHhmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VuZCh1aThEYXRhKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZhY3RvcnkuYmluZCh0aGlzKVxuICAgIH1cblxufSApLCB7IH0gKS5jb25zdHJ1Y3RvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGNyZWF0ZSggbmFtZSwgb3B0cyApIHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBuYW1lXG4gICAgICAgIG5hbWUgPSBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKVxuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShcbiAgICAgICAgICAgIHRoaXMuVmlld3NbIG5hbWUgXSxcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oIHtcbiAgICAgICAgICAgICAgICBuYW1lOiB7IHZhbHVlOiBuYW1lIH0sXG4gICAgICAgICAgICAgICAgZmFjdG9yeTogeyB2YWx1ZTogdGhpcyB9LFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB7IHZhbHVlOiB0aGlzLlRlbXBsYXRlc1sgbmFtZSBdIH0sXG4gICAgICAgICAgICAgICAgdXNlcjogeyB2YWx1ZTogdGhpcy5Vc2VyIH1cbiAgICAgICAgICAgICAgICB9LCBvcHRzIClcbiAgICAgICAgKS5jb25zdHJ1Y3RvcigpXG4gICAgICAgIC5vbiggJ25hdmlnYXRlJywgcm91dGUgPT4gcmVxdWlyZSgnLi4vcm91dGVyJykubmF2aWdhdGUoIHJvdXRlICkgKVxuICAgICAgICAub24oICdkZWxldGVkJywgKCkgPT4gZGVsZXRlIChyZXF1aXJlKCcuLi9yb3V0ZXInKSkudmlld3NbbmFtZV0gKVxuICAgIH0sXG5cbn0sIHtcbiAgICBUZW1wbGF0ZXM6IHsgdmFsdWU6IHJlcXVpcmUoJy4uLy5UZW1wbGF0ZU1hcCcpIH0sXG4gICAgVmlld3M6IHsgdmFsdWU6IHJlcXVpcmUoJy4uLy5WaWV3TWFwJykgfVxufSApXG4iLCJ3aW5kb3cuaW5pdE1hcCA9ICgpID0+IHRydWVcbndpbmRvdy5vbmxvYWQgPSAoKSA9PiByZXF1aXJlKCcuL3JvdXRlcicpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIEVycm9yOiByZXF1aXJlKCcuLi8uLi9saWIvTXlFcnJvcicpLFxuICAgIFxuICAgIFZpZXdGYWN0b3J5OiByZXF1aXJlKCcuL2ZhY3RvcnkvVmlldycpLFxuICAgIFxuICAgIFZpZXdzOiByZXF1aXJlKCcuLy5WaWV3TWFwJyksXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb250ZW50Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlbnQnKVxuXG4gICAgICAgIHdpbmRvdy5vbnBvcHN0YXRlID0gdGhpcy5oYW5kbGUuYmluZCh0aGlzKVxuXG4gICAgICAgIHRoaXMuaGFuZGxlKClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBoYW5kbGUoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlciggd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoMSkgKVxuICAgIH0sXG5cbiAgICBoYW5kbGVyKCBwYXRoICkge1xuICAgICAgICBjb25zdCBuYW1lID0gcGF0aFswXSA/IHBhdGhbMF0uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwYXRoWzBdLnNsaWNlKDEpIDogJycsXG4gICAgICAgICAgICAgIHZpZXcgPSB0aGlzLlZpZXdzW25hbWVdID8gcGF0aFswXSA6ICdob21lJztcblxuICAgICAgICAoICggdmlldyA9PT0gdGhpcy5jdXJyZW50VmlldyApXG4gICAgICAgICAgICA/IFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICA6IFByb21pc2UuYWxsKCBPYmplY3Qua2V5cyggdGhpcy52aWV3cyApLm1hcCggdmlldyA9PiB0aGlzLnZpZXdzWyB2aWV3IF0uaGlkZSgpICkgKSApIFxuICAgICAgICAudGhlbiggKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmlld1xuXG4gICAgICAgICAgICBpZiggdGhpcy52aWV3c1sgdmlldyBdICkgcmV0dXJuIHRoaXMudmlld3NbIHZpZXcgXS5uYXZpZ2F0ZSggcGF0aCApXG5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1sgdmlldyBdID1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5WaWV3RmFjdG9yeS5jcmVhdGUoIHZpZXcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5jb250ZW50Q29udGFpbmVyIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHsgdmFsdWU6IHBhdGgsIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICApXG4gICAgICAgIH0gKVxuICAgICAgICAuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgIH0sXG5cbiAgICBuYXZpZ2F0ZSggbG9jYXRpb24gKSB7XG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKCB7fSwgJycsIGxvY2F0aW9uIClcbiAgICAgICAgdGhpcy5oYW5kbGUoKVxuICAgIH1cblxufSwgeyBjdXJyZW50VmlldzogeyB2YWx1ZTogJycsIHdyaXRhYmxlOiB0cnVlIH0sIHZpZXdzOiB7IHZhbHVlOiB7IH0gfSB9ICkuY29uc3RydWN0b3IoKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgcG9zdFJlbmRlcigpIHtcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4gdGhpcy5oaWRlKCkudGhlbiggKCkgPT4gdGhpcy5lbWl0KCAnbmF2aWdhdGUnLCAnc25hZycgKSApLmNhdGNoKCB0aGlzLkVycm9yICksIDIwMDAgKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgUG9pbnRlcjogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbGliL01hcFBvaW50ZXInKSxcblxuICAgIGV2ZW50czoge1xuICAgICAgICBzbmFnOiAnY2xpY2snXG4gICAgfSxcblxuICAgIG9uU25hZ0NsaWNrKCkge1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZGF0YVsgdGhpcy5jdXJyZW50U3BvdCBdLm1hcExvY2F0aW9uXG5cbiAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYHdhemU6Ly8/bGw9JHtsb2NhdGlvbi5sYXR9LCR7bG9jYXRpb24ubG5nfSZuYXZpZ2F0ZT15ZXNgXG4gICAgfSxcblxuICAgIGJpbmRTd2lwZSgpIHtcbiAgICAgICAgdGhpcy5zd2lwZVRpbWUgPSAxMDAwXG4gICAgICAgIHRoaXMubWluWCA9IDMwXG4gICAgICAgIHRoaXMubWF4WSA9IDMwXG5cbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCAgZSA9PiB0aGlzLm9uU3dpcGVTdGFydChlKSwgZmFsc2UgKVxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBlID0+IHRoaXMub25Td2lwZVN0YXJ0KGUpLCBmYWxzZSApXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIGUgPT4gdGhpcy5vblN3aXBlRW5kKGUpLCBmYWxzZSApXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBlID0+IHRoaXMub25Td2lwZUVuZChlKSwgZmFsc2UgKVxuXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgZSA9PiBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpLCB7IHBhc3NpdmU6IGZhbHNlIH0gKVxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIGUgPT4gZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSwgeyBwYXNzaXZlOiBmYWxzZSB9IClcblxuICAgICAgICB0aGlzLmVscy5pbWFnZS5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgZSA9PiBlLnByZXZlbnREZWZhdWx0KCksIHsgcGFzc2l2ZTogZmFsc2UgfSApXG4gICAgICAgIHRoaXMuZWxzLmltYWdlLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBlID0+IGUucHJldmVudERlZmF1bHQoKSwgeyBwYXNzaXZlOiBmYWxzZSB9IClcbiAgICB9LFxuXG4gICAgZ2V0VGVtcGxhdGVPcHRpb25zKCkgeyByZXR1cm4gdGhpcy5kYXRhIH0sXG5cbiAgICBkYXRhOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU2NDk1MCwgbG5nOiAtNzUuMTkyNTgzNyAgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IEMnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdIb3VybHkvUHJpdmF0ZSBMb3QnLFxuICAgICAgICAgICAgICAgICc1LzYwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnJDMvaHIgMC0zIGhvdXJzJyxcbiAgICAgICAgICAgICAgICAnMy01aHIgbWF4IHRpbWUgaXMgJDE0LjAwJyxcbiAgICAgICAgICAgICAgICAnb3BlbiAyNCBocnMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdsb3RfYycsIDgsIDksIDEwLCAxMSwgNDkgXSxcbiAgICAgICAgICAgIHR5cGU6ICdsb3QnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU5MzIwOSwgbG5nOiAtNzUuMTkyMDkwNyB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgRCcsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgTG90JyxcbiAgICAgICAgICAgICAgICAnMS82MCBzcG90cydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgICAgICAgJ1Blcm1pdCBPbmx5J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltYWdlczogWyAnbG90X2QnLCA0NSBdLFxuICAgICAgICAgICAgdHlwZTogJ2xvdCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTk5MjU2LCBsbmc6IC03NS4xODg5OTUwIH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBIJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBMb3QnLFxuICAgICAgICAgICAgICAgICczLzEwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdsb3RfaCcsIDQsIDE1LCAyNiBdLFxuICAgICAgICAgICAgdHlwZTogJ2xvdCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTgzMDQ1LCBsbmc6IC03NS4xODg4MjM1OSB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgSicsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgTG90JyxcbiAgICAgICAgICAgICAgICAnNC8xMSBzcG90cydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgICAgICAgJ1Blcm1pdCBPbmx5J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltYWdlczogWyAnbG90X2onLCAxLCAyLCAzLCA0IF0sXG4gICAgICAgICAgICB0eXBlOiAnbG90J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NzU1ODcsIGxuZzogLTc1LjE5MzQwOTUgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IEsnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIExvdCcsXG4gICAgICAgICAgICAgICAgJzEvMjEwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdsb3RfaycsIDExNSBdLFxuICAgICAgICAgICAgdHlwZTogJ2xvdCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTYzMjkzLCBsbmc6IC03NS4xOTExOTQ5IH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBQJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBMb3QnLFxuICAgICAgICAgICAgICAgICc1Lzkgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZXM6IFsgJ2xvdF9wJywgMSwgMiwgMywgNCwgNSBdLFxuICAgICAgICAgICAgdHlwZTogJ2xvdCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTc5OTAyLCBsbmc6IC03NS4xOTAxNjU4IH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBSJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBMb3QnLFxuICAgICAgICAgICAgICAgICcxLzI0IHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdsb3RfcicsIDIwIF0sXG4gICAgICAgICAgICB0eXBlOiAnbG90J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NjgxNTQsIGxuZzogLTc1LjE4NzI2NjkgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IFMnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIExvdCcsXG4gICAgICAgICAgICAgICAgJzMvMjQwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdsb3RfcycsIDcxLCA3MiwgNzMgXSxcbiAgICAgICAgICAgIHR5cGU6ICdsb3QnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU3ODc4MiwgbG5nOiAtNzUuMTg4MjgwMyB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgVCcsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgTG90JyxcbiAgICAgICAgICAgICAgICAnMi8xOSBzcG90cydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgICAgICAgJ1Blcm1pdCBPbmx5J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltYWdlczogWyAnbG90X3QnLCAyLCA0IF0sXG4gICAgICAgICAgICB0eXBlOiAnbG90J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NDU2ODgsIGxuZzogLTc1LjE5MTU5MDIgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgUGFya2luZyBTZXJ2aWNlcycsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1B1YmxpYyBQYXJraW5nIFN0cnVjdHVyZScsXG4gICAgICAgICAgICAgICAgJzg4LzgwMyBzcG90cydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgICAgICAgJyQxMy9ob3VyJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltYWdlczogWyAnb2ZmY2FtcHVzc3RydWN0dXJlJyBdLFxuICAgICAgICAgICAgdHlwZTogJ2dhcmFnZSdcbiAgICAgICAgfVxuICAgIF0sXG5cbiAgICBpbml0TWFwKCkge1xuICAgICAgICB0aGlzLmRpcmVjdGlvbnNTZXJ2aWNlID0gbmV3IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNTZXJ2aWNlKClcblxuICAgICAgICB0aGlzLm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoIHRoaXMuZWxzLm1hcCwge1xuICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcbiAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXG4gICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgbmF2aWdhdGlvbkNvbnRyb2w6IGZhbHNlLFxuICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxuICAgICAgICAgICAgbmF2aWdhdGlvbkNvbnRyb2w6IGZhbHNlLFxuICAgICAgICAgICAgbWFwVHlwZUNvbnRyb2w6IGZhbHNlLFxuICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcbiAgICAgICAgICAgIHNjYWxlQ29udHJvbDogZmFsc2VcbiAgICAgICAgICAgIC8vem9vbTogMTVcbiAgICAgICAgfSApXG5cbiAgICAgICAgdGhpcy5vcmlnaW4gPSB7IGxhdDogMzkuOTU2MTM1LCBsbmc6IC03NS4xOTA2OTMgfVxuXG4gICAgICAgIGNvbnN0IG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB0aGlzLm9yaWdpbixcbiAgICAgICAgICAgIGljb246IHtcbiAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICcjMDA3YWZmJyxcbiAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMSxcbiAgICAgICAgICAgICAgICBwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRSxcbiAgICAgICAgICAgICAgICBzY2FsZTogNyxcbiAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICBzdHJva2VPcGFjaXR5OiAuOCxcbiAgICAgICAgICAgICAgICBzdHJva2VXZWlnaHQ6IDNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtYXA6IHRoaXMubWFwXG4gICAgICAgIH0gKVxuXG4gICAgICAgIHRoaXMuZGF0YS5mb3JFYWNoKCBkYXR1bSA9PiB7XG4gICAgICAgICAgICBkYXR1bS5tYXJrZXIgPVxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGRhdHVtLm1hcExvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0dW0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGRhdHVtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIC8vcGF0aDogdGhpcy5Qb2ludGVyLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogNSxcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdwdXJwbGUnLFxuICAgICAgICAgICAgICAgICAgICBzdHJva2VPcGFjaXR5OiAuOCxcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiAzLFxuICAgICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdwdXJwbGUnLFxuICAgICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMVxuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICB9IClcblxuICAgICAgICB0aGlzLmVscy5wYWdlVWkuY2hpbGRyZW5bIDAgXS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gICAgICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlXG4gICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgICAgLnRoZW4oICgpID0+IFByb21pc2UucmVzb2x2ZSggdGhpcy51cGRhdGluZyA9IGZhbHNlICkgKVxuICAgICAgICAuY2F0Y2goIHRoaXMuRXJyb3IgKVxuXG4gICAgfSxcblxuICAgIG9uU3dpcGVTdGFydCggZSApIHtcbiAgICAgICAgZSA9ICgnY2hhbmdlZFRvdWNoZXMnIGluIGUpID8gZS5jaGFuZ2VkVG91Y2hlc1swXSA6IGVcbiAgICAgICAgdGhpcy50b3VjaFN0YXJ0Q29vcmRzID0geyB4OiBlLnBhZ2VYLCB5IDplLnBhZ2VZIH1cbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIH0sXG4gICAgXG4gICAgb25Td2lwZUVuZCggZSApIHtcbiAgICAgICAgZSA9ICgnY2hhbmdlZFRvdWNoZXMnIGluIGUpID8gZS5jaGFuZ2VkVG91Y2hlc1swXSA6IGVcbiAgICAgICAgdGhpcy50b3VjaEVuZENvb3JkcyA9IHsgeDogZS5wYWdlWCAtIHRoaXMudG91Y2hTdGFydENvb3Jkcy54LCB5IDplLnBhZ2VZIC0gdGhpcy50b3VjaFN0YXJ0Q29vcmRzLnkgfVxuICAgICAgICB0aGlzLmVsYXBzZWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aGlzLnN0YXJ0VGltZVxuXG4gICAgICAgIGlmKCB0aGlzLmVsYXBzZWRUaW1lIDw9IHRoaXMuc3dpcGVUaW1lICkge1xuICAgICAgICAgICAgaWYoIE1hdGguYWJzKHRoaXMudG91Y2hFbmRDb29yZHMueCkgPj0gdGhpcy5taW5YICYmIE1hdGguYWJzKHRoaXMudG91Y2hFbmRDb29yZHMueSkgPD0gdGhpcy5tYXhZICkge1xuICAgICAgICAgICAgICAgIHRoaXMudG91Y2hFbmRDb29yZHMueCA8IDAgPyB0aGlzLm9uU3dpcGVMZWZ0KCkgOiB0aGlzLm9uU3dpcGVSaWdodCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0T2Zmc2V0VG9wKCBlbCApIHtcbiAgICAgICAgbGV0IHRvcCA9IDBcbiAgICAgICAgZG8ge1xuICAgICAgICAgIGlmICggIWlzTmFOKCBlbC5vZmZzZXRUb3AgKSApIHsgdG9wICs9IGVsLm9mZnNldFRvcCB9XG4gICAgICAgIH0gd2hpbGUoIGVsID0gZWwub2Zmc2V0UGFyZW50IClcbiAgICAgICAgcmV0dXJuIHRvcFxuICAgIH0sXG5cbiAgICBpc0V4cGFuZGVkKCkge1xuICAgICAgICByZXR1cm4gd2luZG93LmlubmVySGVpZ2h0ICsgd2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID4gdGhpcy5nZXRPZmZzZXRUb3AoIHRoaXMuZWxzLmltYWdlIClcbiAgICB9LFxuXG4gICAgc3dpcGVJbWFnZSggZGlyZWN0aW9uICkge1xuICAgICAgICBjb25zdCBkYXR1bSA9IHRoaXMuZGF0YVsgdGhpcy5jdXJyZW50U3BvdCBdXG5cbiAgICAgICAgbGV0IGltYWdlID0gbmV3IEltYWdlKClcblxuICAgICAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVscy5pbWFnZS5zcmMgPSBpbWFnZS5zcmNcbiAgICAgICAgICAgIC8vdGhpcy5lbHMuaW1hZ2UuY2xhc3NMaXN0LnJlbW92ZSggJ2hpZGUnIClcbiAgICAgICAgICAgIC8vd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gIHRoaXMuZWxzLmltYWdlLmNsYXNzTGlzdC5hZGQoIGBzbGlkZS1pbi0ke2RpcmVjdGlvbn1gICkgKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFkYXR1bS5pbWFnZUluZGV4ICkgZGF0dW0uaW1hZ2VJbmRleCA9IDBcblxuICAgICAgICBkYXR1bS5pbWFnZUluZGV4ID1cbiAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ2xlZnQnXG4gICAgICAgICAgICAgICAgPyBkYXR1bS5pbWFnZXNbIGRhdHVtLmltYWdlSW5kZXggKyAxIF1cbiAgICAgICAgICAgICAgICAgICAgPyBkYXR1bS5pbWFnZUluZGV4ICsgMVxuICAgICAgICAgICAgICAgICAgICA6IDBcbiAgICAgICAgICAgICAgICA6IGRhdHVtLmltYWdlc1sgZGF0dW0uaW1hZ2VJbmRleCAtIDEgXVxuICAgICAgICAgICAgICAgICAgICA/IGRhdHVtLmltYWdlSW5kZXggLSAxXG4gICAgICAgICAgICAgICAgICAgIDogZGF0dW0uaW1hZ2VzLmxlbmd0aCAtIDFcblxuICAgICAgICAvL3RoaXMuZWxzLmltYWdlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxuICAgICAgICAvL3dpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHRoaXMuZWxzLmltYWdlLmNsYXNzTGlzdC5yZW1vdmUoICdzbGlkZS1pbi1sZWZ0JywgJ3NsaWRlLWluLXJpZ2h0JyApIClcblxuICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLmdldEltYWdlU3JjKCBkYXR1bSwgZGF0dW0uaW1hZ2VJbmRleCApXG5cbiAgICB9LFxuXG4gICAgb25Td2lwZUxlZnQoKSB7XG4gICAgICAgIGlmKCB0aGlzLmlzRXhwYW5kZWQoKSApIHsgcmV0dXJuIHRoaXMuc3dpcGVJbWFnZSgncmlnaHQnKSB9XG5cbiAgICAgICAgaWYoIHRoaXMudXBkYXRpbmcgKSByZXR1cm4gZmFsc2VcblxuICAgICAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnJlbW92ZU9sZE1hcmtlcnMoKVxuXG4gICAgICAgIHRoaXMuY3VycmVudFNwb3QgPSB0aGlzLmRhdGFbIHRoaXMuY3VycmVudFNwb3QgKyAxIF0gPyB0aGlzLmN1cnJlbnRTcG90ICsgMSA6IDBcblxuICAgICAgICB0aGlzLnVwZGF0ZSgncmlnaHQnKVxuICAgICAgICAudGhlbiggKCkgPT4gUHJvbWlzZS5yZXNvbHZlKCB0aGlzLnVwZGF0aW5nID0gZmFsc2UgKSApXG4gICAgICAgIC5jYXRjaCggdGhpcy5FcnJvciApXG4gICAgfSxcbiAgICBcbiAgICBvblN3aXBlUmlnaHQoKSB7XG4gICAgICAgIGlmKCB0aGlzLmlzRXhwYW5kZWQoKSApIHsgcmV0dXJuIHRoaXMuc3dpcGVJbWFnZSgnbGVmdCcpIH1cblxuICAgICAgICBpZiggdGhpcy51cGRhdGluZyApIHJldHVybiBmYWxzZVxuXG4gICAgICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlT2xkTWFya2VycygpXG5cbiAgICAgICAgdGhpcy5jdXJyZW50U3BvdCA9IHRoaXMuZGF0YVsgdGhpcy5jdXJyZW50U3BvdCAtIDEgXSA/IHRoaXMuY3VycmVudFNwb3QgLSAxIDogdGhpcy5kYXRhLmxlbmd0aCAtIDFcblxuICAgICAgICB0aGlzLnVwZGF0ZSgnbGVmdCcpXG4gICAgICAgIC50aGVuKCAoKSA9PiBQcm9taXNlLnJlc29sdmUoIHRoaXMudXBkYXRpbmcgPSBmYWxzZSApIClcbiAgICAgICAgLmNhdGNoKCB0aGlzLkVycm9yIClcbiAgICB9LFxuXG4gICAgcG9zdFJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50U3BvdCA9IDBcblxuICAgICAgICB0aGlzLmVscy5tYXBXcmFwLnN0eWxlLmhlaWdodCA9IGAke3dpbmRvdy5pbm5lckhlaWdodCAtIDE0MH1weGBcblxuICAgICAgICB3aW5kb3cuZ29vZ2xlXG4gICAgICAgICAgICA/IHRoaXMuaW5pdE1hcCgpXG4gICAgICAgICAgICA6IHdpbmRvdy5pbml0TWFwID0gdGhpcy5pbml0TWFwXG5cbiAgICAgICAgdGhpcy5iaW5kU3dpcGUoKSAgICAgICAgXG4gICAgXG4gICAgICAgIHRoaXMuWGhyKCB7IG1ldGhvZDogJ2dldCcsIHVybDogYGh0dHA6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L3dlYXRoZXI/emlwPTE5MTA0LHVzJkFQUElEPWQ1ZTE5MWRhOWUzMWI4ZjY0NDAzN2NhMzEwNjI4MTAyYCB9IClcbiAgICAgICAgLnRoZW4oIHJlc3BvbnNlID0+IHRoaXMuZWxzLnRlbXAudGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKCAoIHJlc3BvbnNlLm1haW4udGVtcCAqICg5LzUpICkgLSA0NTkuNjcgKSApXG4gICAgICAgIC5jYXRjaCggZSA9PiB7IGNvbnNvbGUubG9nKCBlLnN0YWNrIHx8IGUgKTsgdGhpcy5lbHMudGVtcC5yZW1vdmUoKSB9IClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICByZW1vdmVPbGRNYXJrZXJzKCkge1xuICAgICAgICBjb25zdCBkYXR1bSA9IHRoaXMuZGF0YVsgdGhpcy5jdXJyZW50U3BvdCBdXG4gICAgICAgIGRhdHVtLm1hcmtlci5zZXRNYXAobnVsbClcbiAgICAgICAgZGF0dW0uZGlyZWN0aW9uc0Rpc3BsYXkuc2V0TWFwKG51bGwpXG4gICAgICAgIHRoaXMuZWxzLnBhZ2VVaS5jaGlsZHJlblsgdGhpcy5jdXJyZW50U3BvdCBdLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJylcbiAgICB9LFxuXG4gICAgcmVuZGVyRGlyZWN0aW9ucyggZGF0YSApIHtcbiAgICAgICAgaWYoIGRhdGEuZGlyZWN0aW9uc0Rpc3BsYXkgKSB7XG4gICAgICAgICAgICB0aGlzLmVscy5kaXN0YW5jZS50ZXh0Q29udGVudCA9IGRhdGEuZGlzdGFuY2VcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoIGRhdGEuZGlyZWN0aW9uc0Rpc3BsYXkuc2V0TWFwKCB0aGlzLm1hcCApIClcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEuZGlyZWN0aW9uc0Rpc3BsYXkgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1JlbmRlcmVyKCB7IHN1cHByZXNzTWFya2VyczogdHJ1ZSB9IClcbiAgICAgICAgZGF0YS5kaXJlY3Rpb25zRGlzcGxheS5zZXRNYXAoIHRoaXMubWFwIClcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25zU2VydmljZS5yb3V0ZSgge1xuICAgICAgICAgICAgICAgIG9yaWdpbjogdGhpcy5vcmlnaW4sXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb246IGRhdGEubWFwTG9jYXRpb24sXG4gICAgICAgICAgICAgICAgdHJhdmVsTW9kZTogJ0RSSVZJTkcnLFxuICAgICAgICAgICAgICAgIHVuaXRTeXN0ZW06IGdvb2dsZS5tYXBzLlVuaXRTeXN0ZW0uSU1QRVJJQUxcbiAgICAgICAgICAgIH0sICggcmVzdWx0LCBzdGF0dXMgKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIHN0YXR1cyA9PT0gJ09LJyApIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5kaXJlY3Rpb25zRGlzcGxheS5zZXREaXJlY3Rpb25zKHJlc3VsdClcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5kaXN0YW5jZSA9IGAke3Jlc3VsdC5yb3V0ZXNbMF0ubGVnc1swXS5kaXN0YW5jZS50ZXh0fSBhd2F5YFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVscy5kaXN0YW5jZS50ZXh0Q29udGVudCA9IGRhdGEuZGlzdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7IHJldHVybiByZWplY3Qoc3RhdHVzKSB9XG4gICAgICAgICAgICB9IClcbiAgICAgICAgfSApXG5cbiAgICB9LFxuXG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICAgIERvdDogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbGliL2RvdCcpXG4gICAgfSxcblxuICAgIGdldEltYWdlU3JjKCBkYXR1bSwgaW1hZ2VJbmRleCApIHtcbiAgICAgICAgY29uc3QgcGF0aCA9IHR5cGVvZiBkYXR1bS5pbWFnZXNbIGltYWdlSW5kZXggXSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgID8gZGF0dW0uaW1hZ2VzWyBpbWFnZUluZGV4IF1cbiAgICAgICAgICAgIDogYCR7ZGF0dW0uaW1hZ2VzWzBdfV9zcG90XyR7ZGF0dW0uaW1hZ2VzWyBpbWFnZUluZGV4IF19YFxuXG4gICAgICAgIHJldHVybiBgL3N0YXRpYy9pbWcvc3BvdHMvJHtwYXRofS5KUEdgXG4gICAgfSxcblxuICAgIHVwZGF0ZSggc3dpcGUgKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmRhdGFbIHRoaXMuY3VycmVudFNwb3QgXTtcblxuICAgICAgICBpZiggc3dpcGUgKSB7XG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCAnc2xpZGUtaW4tbGVmdCcsICdzbGlkZS1pbi1yaWdodCcgKVxuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5tYXJrZXIuc2V0TWFwKCB0aGlzLm1hcCApXG4gICAgICAgIHRoaXMuZWxzLnBhZ2VVaS5jaGlsZHJlblsgdGhpcy5jdXJyZW50U3BvdCBdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgICAgICAgdGhpcy5lbHMuc3BvdE5hbWUudGV4dENvbnRlbnQgPSBkYXRhLm5hbWVcbiAgICAgICAgdGhpcy5lbHMuc3BvdENvbnRleHQuaW5uZXJIVE1MID0gZGF0YS5jb250ZXh0LmpvaW4oIHRoaXMudGVtcGxhdGVzLkRvdCApXG4gICAgICAgIHRoaXMuZWxzLmRldGFpbC5pbm5lckhUTUwgPSBkYXRhLmRldGFpbHMuam9pbiggdGhpcy50ZW1wbGF0ZXMuRG90IClcbiAgICAgICAgdGhpcy5lbHMuaW1hZ2Uuc3JjID0gdGhpcy5nZXRJbWFnZVNyYyggZGF0YSwgZGF0YS5pbmRleCB8fCAwIClcblxuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJEaXJlY3Rpb25zKCBkYXRhIClcbiAgICAgICAgLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgIGlmKCBzd2lwZSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSggJ2hpZGRlbicgKVxuICAgICAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCBgc2xpZGUtaW4tJHtzd2lwZX1gIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICB9IClcbiAgICB9XG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7IH0sIHJlcXVpcmUoJy4uLy4uLy4uL2xpYi9NeU9iamVjdCcpLCByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIucHJvdG90eXBlLCB7XG5cbiAgICBPcHRpbWl6ZWRSZXNpemU6IHJlcXVpcmUoJy4vbGliL09wdGltaXplZFJlc2l6ZScpLFxuICAgIFxuICAgIFhocjogcmVxdWlyZSgnLi4vWGhyJyksXG5cbiAgICBiaW5kRXZlbnQoIGtleSwgZXZlbnQgKSB7XG4gICAgICAgIHZhciBlbHMgPSBBcnJheS5pc0FycmF5KCB0aGlzLmVsc1sga2V5IF0gKSA/IHRoaXMuZWxzWyBrZXkgXSA6IFsgdGhpcy5lbHNbIGtleSBdIF1cbiAgICAgICAgZWxzLmZvckVhY2goIGVsID0+IGVsLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50IHx8ICdjbGljaycsIGUgPT4gdGhpc1sgYG9uJHt0aGlzLmNhcGl0YWxpemVGaXJzdExldHRlcihrZXkpfSR7dGhpcy5jYXBpdGFsaXplRmlyc3RMZXR0ZXIoZXZlbnQpfWAgXSggZSApICkgKVxuICAgIH0sXG5cbiAgICBjYXBpdGFsaXplRmlyc3RMZXR0ZXI6IHN0cmluZyA9PiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSksXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICBpZiggdGhpcy5zaXplICkgdGhpcy5PcHRpbWl6ZWRSZXNpemUuYWRkKCB0aGlzLnNpemUgKTtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbiggdGhpcywgeyBlbHM6IHsgfSwgc2x1cnA6IHsgYXR0cjogJ2RhdGEtanMnLCB2aWV3OiAnZGF0YS12aWV3JyB9LCB2aWV3czogeyB9IH0gKS5yZW5kZXIoKVxuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZUV2ZW50cygga2V5LCBlbCApIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgdGhpcy5ldmVudHNba2V5XVxuXG4gICAgICAgIGlmKCB0eXBlID09PSBcInN0cmluZ1wiICkgeyB0aGlzLmJpbmRFdmVudCgga2V5LCB0aGlzLmV2ZW50c1trZXldICkgfVxuICAgICAgICBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmV2ZW50c1trZXldICkgKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c1sga2V5IF0uZm9yRWFjaCggZXZlbnRPYmogPT4gdGhpcy5iaW5kRXZlbnQoIGtleSwgZXZlbnRPYmouZXZlbnQgKSApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgga2V5LCB0aGlzLmV2ZW50c1trZXldLmV2ZW50IClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWxldGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhpZGUoKVxuICAgICAgICAudGhlbiggKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIHRoaXMuZWxzLmNvbnRhaW5lciApXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCB0aGlzLmVtaXQoJ2RlbGV0ZWQnKSApXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBldmVudHM6IHt9LFxuXG4gICAgZ2V0RGF0YSgpIHtcbiAgICAgICAgaWYoICF0aGlzLm1vZGVsICkgdGhpcy5tb2RlbCA9IE9iamVjdC5jcmVhdGUoIHRoaXMuTW9kZWwsIHsgcmVzb3VyY2U6IHsgdmFsdWU6IHRoaXMubmFtZSB9IH0gKVxuXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVsLmdldCgpXG4gICAgfSxcblxuICAgIGdldFRlbXBsYXRlT3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICh0aGlzLm1vZGVsKSA/IHRoaXMubW9kZWwuZGF0YSA6IHt9ICxcbiAgICAgICAgICAgIHsgdXNlcjogKHRoaXMudXNlcikgPyB0aGlzLnVzZXIuZGF0YSA6IHt9IH0sXG4gICAgICAgICAgICB7IG9wdHM6ICh0aGlzLnRlbXBsYXRlT3B0cykgPyB0aGlzLnRlbXBsYXRlT3B0cyA6IHt9IH1cbiAgICAgICAgKVxuICAgIH0sXG5cbiAgICBoaWRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgaWYoICFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKHRoaXMuZWxzLmNvbnRhaW5lcikgfHwgdGhpcy5pc0hpZGRlbigpICkgcmV0dXJuIHJlc29sdmUoKVxuICAgICAgICAgICAgdGhpcy5vbkhpZGRlblByb3h5ID0gZSA9PiB0aGlzLm9uSGlkZGVuKHJlc29sdmUpXG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uSGlkZGVuUHJveHkgKVxuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgaHRtbFRvRnJhZ21lbnQoIHN0ciApIHtcbiAgICAgICAgbGV0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgLy8gbWFrZSB0aGUgcGFyZW50IG9mIHRoZSBmaXJzdCBkaXYgaW4gdGhlIGRvY3VtZW50IGJlY29tZXMgdGhlIGNvbnRleHQgbm9kZVxuICAgICAgICByYW5nZS5zZWxlY3ROb2RlKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiZGl2XCIpLml0ZW0oMCkpXG4gICAgICAgIHJldHVybiByYW5nZS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoIHN0ciApXG4gICAgfSxcbiAgICBcbiAgICBpc0hpZGRlbigpIHsgcmV0dXJuIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpIH0sXG5cbiAgICBvbkhpZGRlbiggcmVzb2x2ZSApIHtcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgdGhpcy5vbkhpZGRlblByb3h5IClcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXG4gICAgICAgIHJlc29sdmUoIHRoaXMuZW1pdCgnaGlkZGVuJykgKVxuICAgIH0sXG5cbiAgICBvbkxvZ2luKCkge1xuICAgICAgICBPYmplY3QuYXNzaWduKCB0aGlzLCB7IGVsczogeyB9LCBzbHVycDogeyBhdHRyOiAnZGF0YS1qcycsIHZpZXc6ICdkYXRhLXZpZXcnIH0sIHZpZXdzOiB7IH0gfSApLnJlbmRlcigpXG4gICAgfSxcblxuICAgIG9uU2hvd24oIHJlc29sdmUgKSB7XG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25TaG93blByb3h5IClcbiAgICAgICAgaWYoIHRoaXMuc2l6ZSApIHRoaXMuc2l6ZSgpXG4gICAgICAgIHJlc29sdmUoIHRoaXMuZW1pdCgnc2hvd24nKSApXG4gICAgfSxcblxuICAgIHNob3dOb0FjY2VzcygpIHtcbiAgICAgICAgYWxlcnQoXCJObyBwcml2aWxlZ2VzLCBzb25cIilcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgcG9zdFJlbmRlcigpIHsgcmV0dXJuIHRoaXMgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5zbHVycFRlbXBsYXRlKCB7IHRlbXBsYXRlOiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldFRlbXBsYXRlT3B0aW9ucygpICksIGluc2VydGlvbjogdGhpcy5pbnNlcnRpb24gfSApXG5cbiAgICAgICAgaWYoIHRoaXMuc2l6ZSApIHRoaXMuc2l6ZSgpXG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyU3Vidmlld3MoKVxuICAgICAgICAgICAgICAgICAgIC5wb3N0UmVuZGVyKClcbiAgICB9LFxuXG4gICAgcmVuZGVyU3Vidmlld3MoKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKCB0aGlzLlZpZXdzIHx8IFsgXSApLmZvckVhY2goIGtleSA9PiB7XG4gICAgICAgICAgICBpZiggdGhpcy5WaWV3c1sga2V5IF0uZWwgKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9wdHMgPSB0aGlzLlZpZXdzWyBrZXkgXS5vcHRzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb3B0cyA9ICggb3B0cyApXG4gICAgICAgICAgICAgICAgICAgID8gdHlwZW9mIG9wdHMgPT09IFwib2JqZWN0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gb3B0c1xuICAgICAgICAgICAgICAgICAgICAgICAgOiBvcHRzKClcbiAgICAgICAgICAgICAgICAgICAgOiB7fVxuXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1sga2V5IF0gPSB0aGlzLmZhY3RvcnkuY3JlYXRlKCBrZXksIE9iamVjdC5hc3NpZ24oIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLlZpZXdzWyBrZXkgXS5lbCwgbWV0aG9kOiAnaW5zZXJ0QmVmb3JlJyB9IH0gfSwgb3B0cyApIClcbiAgICAgICAgICAgICAgICB0aGlzLlZpZXdzWyBrZXkgXS5lbC5yZW1vdmUoKVxuICAgICAgICAgICAgICAgIHRoaXMuVmlld3NbIGtleSBdLmVsID0gdW5kZWZpbmVkXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHNob3coIGR1cmF0aW9uICkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5vblNob3duUHJveHkgPSBlID0+IHRoaXMub25TaG93bihyZXNvbHZlKVxuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgdGhpcy5vblNob3duUHJveHkgKVxuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCAnaGlkZGVuJyApXG4gICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoICdoaWRlJyApIClcbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgc2x1cnBFbCggZWwgKSB7XG4gICAgICAgIHZhciBrZXkgPSBlbC5nZXRBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApIHx8ICdjb250YWluZXInXG5cbiAgICAgICAgaWYoIGtleSA9PT0gJ2NvbnRhaW5lcicgKSBlbC5jbGFzc0xpc3QuYWRkKCB0aGlzLm5hbWUgKVxuXG4gICAgICAgIHRoaXMuZWxzWyBrZXkgXSA9IEFycmF5LmlzQXJyYXkoIHRoaXMuZWxzWyBrZXkgXSApXG4gICAgICAgICAgICA/IHRoaXMuZWxzWyBrZXkgXS5wdXNoKCBlbCApXG4gICAgICAgICAgICA6ICggdGhpcy5lbHNbIGtleSBdICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgICAgID8gWyB0aGlzLmVsc1sga2V5IF0sIGVsIF1cbiAgICAgICAgICAgICAgICA6IGVsXG5cbiAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuc2x1cnAuYXR0cilcblxuICAgICAgICBpZiggdGhpcy5ldmVudHNbIGtleSBdICkgdGhpcy5kZWxlZ2F0ZUV2ZW50cygga2V5LCBlbCApXG4gICAgfSxcblxuICAgIHNsdXJwVGVtcGxhdGUoIG9wdGlvbnMgKSB7XG4gICAgICAgIHZhciBmcmFnbWVudCA9IHRoaXMuaHRtbFRvRnJhZ21lbnQoIG9wdGlvbnMudGVtcGxhdGUgKSxcbiAgICAgICAgICAgIHNlbGVjdG9yID0gYFske3RoaXMuc2x1cnAuYXR0cn1dYCxcbiAgICAgICAgICAgIHZpZXdTZWxlY3RvciA9IGBbJHt0aGlzLnNsdXJwLnZpZXd9XWBcblxuICAgICAgICB0aGlzLnNsdXJwRWwoIGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyonKSApXG4gICAgICAgIGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIGAke3NlbGVjdG9yfSwgJHt2aWV3U2VsZWN0b3J9YCApLmZvckVhY2goIGVsID0+XG4gICAgICAgICAgICAoIGVsLmhhc0F0dHJpYnV0ZSggdGhpcy5zbHVycC5hdHRyICkgKSBcbiAgICAgICAgICAgICAgICA/IHRoaXMuc2x1cnBFbCggZWwgKVxuICAgICAgICAgICAgICAgIDogdGhpcy5WaWV3c1sgZWwuZ2V0QXR0cmlidXRlKHRoaXMuc2x1cnAudmlldykgXS5lbCA9IGVsXG4gICAgICAgIClcbiAgICAgICAgICBcbiAgICAgICAgb3B0aW9ucy5pbnNlcnRpb24ubWV0aG9kID09PSAnaW5zZXJ0QmVmb3JlJ1xuICAgICAgICAgICAgPyBvcHRpb25zLmluc2VydGlvbi5lbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSggZnJhZ21lbnQsIG9wdGlvbnMuaW5zZXJ0aW9uLmVsIClcbiAgICAgICAgICAgIDogb3B0aW9ucy5pbnNlcnRpb24uZWxbIG9wdGlvbnMuaW5zZXJ0aW9uLm1ldGhvZCB8fCAnYXBwZW5kQ2hpbGQnIF0oIGZyYWdtZW50IClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCB7XG5cbiAgICBhZGQoY2FsbGJhY2spIHtcbiAgICAgICAgaWYoICF0aGlzLmNhbGxiYWNrcy5sZW5ndGggKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vblJlc2l6ZSlcbiAgICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjaylcbiAgICB9LFxuXG4gICAgb25SZXNpemUoKSB7XG4gICAgICAgaWYoIHRoaXMucnVubmluZyApIHJldHVyblxuXG4gICAgICAgIHRoaXMucnVubmluZyA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5ydW5DYWxsYmFja3MgKVxuICAgICAgICAgICAgOiBzZXRUaW1lb3V0KCB0aGlzLnJ1bkNhbGxiYWNrcywgNjYpXG4gICAgfSxcblxuICAgIHJ1bkNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSB0aGlzLmNhbGxiYWNrcy5maWx0ZXIoIGNhbGxiYWNrID0+IGNhbGxiYWNrKCkgKVxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZSBcbiAgICB9XG5cbn0sIHsgY2FsbGJhY2tzOiB7IHZhbHVlOiBbXSB9LCBydW5uaW5nOiB7IHZhbHVlOiBmYWxzZSB9IH0gKS5hZGRcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PiBgPGRpdj48ZGl2PiR7cmVxdWlyZSgnLi9saWIvbG9nbycpfTwvZGl2PjxkaXY+RmluZGluZyB0aGUgY2xvc2VzdCBwYXJraW5nIHNwb3RzLi4uc2l0IHRpZ2h0LjwvZGl2PmBcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PiB7XG4gICAgY29uc3QgcGFnZVVpID0gcmVxdWlyZSgnLi9saWIvZG90JylcbiAgICByZXR1cm4gYDxkaXY+XG4gICAgICAgIDxkaXYgZGF0YS1qcz1cIm1hcFdyYXBcIiBjbGFzcz1cIm1hcC13cmFwXCI+XG4gICAgICAgICAgICA8ZGl2IGRhdGEtanM9XCJtYXBcIiBjbGFzcz1cIm1hcFwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnVcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVudS1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+JHtyZXF1aXJlKCcuL2xpYi9pbmZvJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PiR7cmVxdWlyZSgnLi9saWIvY3Vyc29yJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbmZvLW1haW5cIj5cbiAgICAgICAgICAgIDxkaXYgZGF0YS1qcz1cInBhZ2VVaVwiIGNsYXNzPVwicGFnZS11aVwiPlxuICAgICAgICAgICAgICAgICR7QXJyYXkuZnJvbShBcnJheShwLmxlbmd0aCkua2V5cygpKS5tYXAoICgpID0+IHBhZ2VVaSApLmpvaW4oJycpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGRhdGEtanM9XCJ3ZWF0aGVyXCIgY2xhc3M9XCJ3ZWF0aGVyXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4+JHtyZXF1aXJlKCcuL2xpYi9jbG91ZCcpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLWpzPVwidGVtcFwiPjwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNuYWctYXJlYVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsaW5lLXdyYXBcIj4ke3JlcXVpcmUoJy4vbGliL2xpbmUnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwic25hZ1wiIGRhdGEtanM9XCJzbmFnXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlNuYWcgVGhpcyBTcG90PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtanM9XCJkaXN0YW5jZVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwb3QtZGV0YWlsc1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgZGF0YS1qcz1cInNwb3ROYW1lXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRleHRcIiBkYXRhLWpzPVwic3BvdENvbnRleHRcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGV4dFwiIGRhdGEtanM9XCJkZXRhaWxcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8aW1nIGRhdGEtanM9XCJpbWFnZVwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+YFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBgTTE3Mi45OC0uMDI0YTQyLjk4OSw0Mi45ODksMCwwLDEsNDMuMDA3LDQyLjk3MWMwLDE1Ljg4NS0xMC4yNTEsMjcuNDg1LTIxLjQ1NSwzNy4xOTMtMjEuNTU1LDE4LjY3Ny0yMS41NTIsNTUuODQ1LTIxLjU1Miw1NS44NDVzMC0zNi44NTItMjEuNjEzLTU1Ljg3OWMtMTEuMTA4LTkuNzgxLTIxLjM5NC0yMS4zLTIxLjM5NC0zNy4xNThBNDIuOTg5LDQyLjk4OSwwLDAsMSwxNzIuOTgtLjAyNFpgXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFxyXG5gPHN2ZyBjbGFzcz1cImNsb3VkXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiTGF5ZXJfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHZpZXdCb3g9XCIwIDAgNDk2IDQ5NlwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0OTYgNDk2O1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XHJcbjxnPlxyXG5cdDxnPlxyXG5cdFx0PHBhdGggZD1cIk00MTMuOTY4LDIzMy4wOTZjLTEwLjgzMi02My45Mi02NS44MTYtMTExLjUxMi0xMzAuOTQ0LTExMi45NkMyNjUuODgsOTAuMzM2LDIzNC41MzYsNzIsMjAwLDcyXHJcblx0XHRcdGMtNDAuOTM2LDAtNzcuMTY4LDI2LjA5Ni05MC41Miw2NC4yODhjLTIwLjY5Ni0yLjE0NC00MC4yMDgsNy40NjQtNTEuNjI0LDI0LjA1NkMyNS4wOCwxNjMuNDI0LDAsMTkwLjYsMCwyMjRcclxuXHRcdFx0YzAsMjAuMTA0LDkuNDI0LDM4LjYxNiwyNS4wNCw1MC42MTZDOS41NjgsMjkwLjQ4OCwwLDMxMi4xMzYsMCwzMzZjMCw0OC41MiwzOS40OCw4OCw4OCw4OGgzMTJjNTIuOTM2LDAsOTYtNDMuMDY0LDk2LTk2XHJcblx0XHRcdEM0OTYsMjgwLjQyNCw0NjAuNDY0LDIzOS45MjgsNDEzLjk2OCwyMzMuMDk2eiBNMTYsMjI0YzAtMjYuMTQ0LDIwLjQ5Ni00Ny4xOTIsNDYuNjQ4LTQ3LjkyOGw0LjQ3Mi0wLjEyOGwyLjIzMi0zLjg3MlxyXG5cdFx0XHRjOC42NDgtMTQuOTg0LDI1LjcyOC0yMy4yNCw0My44NjQtMTguOTZsNy41NiwxLjc5MmwyLTcuNTEyQzEzMi4xMDQsMTEyLjQyNCwxNjMuODQ4LDg4LDIwMCw4OFxyXG5cdFx0XHRjMjUuODgsMCw0OS41ODQsMTIuNDE2LDY0LjQ5NiwzMi45ODRjLTUzLjQ5Niw2LjA5Ni05OC42MDgsNDMuMjI0LTExNC40NCw5NS4yODhDMTQ4LjAwOCwyMTYuMDg4LDE0NS45ODQsMjE2LDE0NCwyMTZcclxuXHRcdFx0Yy0yNC4wMzIsMC00Ni41NiwxMi4xODQtNTkuODU2LDMyLjA4Yy0xNy4yNzIsMC43NTItMzMuMjQ4LDYuNTI4LTQ2LjU1MiwxNS44NjRDMjQuMiwyNTUuMDk2LDE2LDI0MC4yNCwxNiwyMjR6IE00MDAsNDA4SDg4XHJcblx0XHRcdGMtMzkuNzA0LDAtNzItMzIuMjk2LTcyLTcyYzAtMzkuNzA0LDMyLjI5Ni03Miw3MS42ODgtNzIuMDA4bDUuNTM2LDAuMDRsMi4zMDQtMy45OTJDMTA1LjUzNiwyNDIuNzQ0LDEyNC4xMiwyMzIsMTQ0LDIzMlxyXG5cdFx0XHRjMy4zNTIsMCw2Ljg1NiwwLjMzNiwxMC40MjQsMS4wMDhsNy40MjQsMS40bDEuODI0LTcuMzM2QzE3Ni45NiwxNzMuNDQ4LDIyNC44LDEzNiwyODAsMTM2XHJcblx0XHRcdGM2MC41MTIsMCwxMTEuNjcyLDQ1LjI4LDExOS4wMDgsMTA1LjMybDAuNTYsNC41OTJDMzk5Ljg0LDI0OS4yNCw0MDAsMjUyLjYsNDAwLDI1NmMwLDY2LjE2OC01My44MzIsMTIwLTEyMCwxMjB2MTZcclxuXHRcdFx0Yzc0Ljk5MiwwLDEzNi02MS4wMDgsMTM2LTEzNmMwLTIuMTItMC4xNzYtNC4yLTAuMjcyLTYuMjk2QzQ1Mi40MzIsMjU3LjA4OCw0ODAsMjg5Ljc3Niw0ODAsMzI4QzQ4MCwzNzIuMTEyLDQ0NC4xMTIsNDA4LDQwMCw0MDhcclxuXHRcdFx0elwiLz5cclxuXHQ8L2c+XHJcbjwvZz5cclxuPC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbmA8c3ZnIGNsYXNzPVwiY3Vyc29yXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiTGF5ZXJfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHZpZXdCb3g9XCIwIDAgNTEyIDUxMlwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyO1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+PGc+PHBhdGggZD1cIk01MDMuODQyLDguMzMzYy0wLjAzLTAuMDMtMC4wNTQtMC4wNjItMC4wODQtMC4wOTJzLTAuMDYyLTAuMDU0LTAuMDkyLTAuMDgyYy03Ljk2OC03LjkwMi0xOS4zOTgtMTAuMjc2LTI5Ljg2LTYuMTg1IEwxNy43ODksMTgwLjI4MWMtMTIuMDU2LDQuNzEzLTE5LjExOSwxNi41MTYtMTcuNTgsMjkuMzY3YzEuNTQzLDEyLjg1MiwxMS4xOTYsMjIuNjQ5LDI0LjAyMywyNC4zNzhsMjIyLjg3NywzMC4wNTggYzAuNDE3LDAuMDU3LDAuNzUxLDAuMzg5LDAuODA4LDAuODA5bDMwLjA1OCwyMjIuODc1YzEuNzI5LDEyLjgyNywxMS41MjYsMjIuNDgyLDI0LjM3OCwyNC4wMjMgYzEuMTc0LDAuMTQxLDIuMzM3LDAuMjA4LDMuNDg5LDAuMjA4YzExLjQ1OCwwLDIxLjU5NC02LjgzNCwyNS44NzgtMTcuNzg3TDUxMC4wMjksMzguMTkgQzUxNC4xMTgsMjcuNzMsNTExLjc0NSwxNi4zMDIsNTAzLjg0Miw4LjMzM3ogTTI3Ljg0NywyMDcuMjUzYy0wLjUtMC4wNjgtMC43MjUtMC4wOTctMC44MTItMC44MjEgYy0wLjA4Ni0wLjcyNCwwLjEyNi0wLjgwOCwwLjU5My0wLjk4OUw0NTQuMjgyLDM4LjYxNkwyNTQuNzI3LDIzOC4xNzNDMjUzLjQyNiwyMzcuNzk2LDI3Ljg0NywyMDcuMjUzLDI3Ljg0NywyMDcuMjUzeiBNMzA2LjU1OCw0ODQuMzczYy0wLjE4MiwwLjQ2Ny0wLjI1NSwwLjY4Mi0wLjk4OSwwLjU5MmMtMC43MjMtMC4wODYtMC43NTQtMC4zMTMtMC44Mi0wLjgxYzAsMC0zMC41NDMtMjI1LjU3OS0zMC45Mi0yMjYuODhcdEw0NzMuMzg0LDU3LjcxOUwzMDYuNTU4LDQ4NC4zNzN6XCIvPlx0PC9nPjwvc3ZnPmBcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcbmA8c3ZnIGNsYXNzPVwiZG90XCIgdmlld0JveD1cIjAgMCAyMCAyMFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgPGNpcmNsZSBjeD1cIjEwXCIgY3k9XCIxMFwiIHI9XCIxMFwiLz5cbjwvc3ZnPmBcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuYDxzdmcgY2xhc3M9XCJpbmZvXCJ2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIiB2aWV3Qm94PVwiMCAwIDMzMCAzMzBcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzMwIDMzMDtcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPjxnPjxwYXRoIGQ9XCJNMTY1LDBDNzQuMDE5LDAsMCw3NC4wMiwwLDE2NS4wMDFDMCwyNTUuOTgyLDc0LjAxOSwzMzAsMTY1LDMzMHMxNjUtNzQuMDE4LDE2NS0xNjQuOTk5QzMzMCw3NC4wMiwyNTUuOTgxLDAsMTY1LDB6IE0xNjUsMzAwYy03NC40NCwwLTEzNS02MC41Ni0xMzUtMTM0Ljk5OUMzMCw5MC41NjIsOTAuNTYsMzAsMTY1LDMwczEzNSw2MC41NjIsMTM1LDEzNS4wMDFDMzAwLDIzOS40NCwyMzkuNDM5LDMwMCwxNjUsMzAwelwiLz48cGF0aCBkPVwiTTE2NC45OTgsNzBjLTExLjAyNiwwLTE5Ljk5Niw4Ljk3Ni0xOS45OTYsMjAuMDA5YzAsMTEuMDIzLDguOTcsMTkuOTkxLDE5Ljk5NiwxOS45OTFjMTEuMDI2LDAsMTkuOTk2LTguOTY4LDE5Ljk5Ni0xOS45OTFDMTg0Ljk5NCw3OC45NzYsMTc2LjAyNCw3MCwxNjQuOTk4LDcwelwiLz48cGF0aCBkPVwiTTE2NSwxNDBjLTguMjg0LDAtMTUsNi43MTYtMTUsMTV2OTBjMCw4LjI4NCw2LjcxNiwxNSwxNSwxNWM4LjI4NCwwLDE1LTYuNzE2LDE1LTE1di05MEMxODAsMTQ2LjcxNiwxNzMuMjg0LDE0MCwxNjUsMTQwelwiLz48L2c+PC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFxuYDxzdmcgdmlld0JveD1cIjAgMCAyMCAyMFwiIGNsYXNzPVwibGluZVwiIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHgxPVwiNVwiIHkxPVwiMTBcIiB4Mj1cIjIwXCIgeTI9XCIxMFwiIHN0cm9rZT1cImJsYWNrXCIgc3Ryb2tlLXdpZHRoPVwiNVwiLz5cbjwvc3ZnPmBcbiIsIm1vZHVsZS5leHBvcnRzID0gYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHZpZXdCb3g9XCIwIDAgNTkxLjUyIDkxOS40MVwiPjxkZWZzPjxzdHlsZT4uY2xzLTEsLmNscy01e2ZpbGw6IzIzMWYyMDt9LmNscy0xLC5jbHMtMntmaWxsLXJ1bGU6ZXZlbm9kZDt9LmNscy0ye2ZpbGw6dXJsKCNOZXdfR3JhZGllbnQpO30uY2xzLTN7Zm9udC1zaXplOjI0NS41cHg7Zm9udC1mYW1pbHk6SW1wYWN0LCBJbXBhY3Q7fS5jbHMtMywuY2xzLTR7ZmlsbDojZmZmO30uY2xzLTV7Zm9udC1zaXplOjU0Ljg5cHg7Zm9udC1mYW1pbHk6QXZlbmlyTmV4dC1SZWd1bGFyLCBBdmVuaXIgTmV4dDtsZXR0ZXItc3BhY2luZzowLjRlbTt9LmNscy02e2xldHRlci1zcGFjaW5nOjAuMzhlbTt9LmNscy03e2xldHRlci1zcGFjaW5nOjAuNGVtO308L3N0eWxlPjxsaW5lYXJHcmFkaWVudCBpZD1cIk5ld19HcmFkaWVudFwiIHgxPVwiLTE5NC42NVwiIHkxPVwiOTk0Ljg4XCIgeDI9XCItMTk0LjY1XCIgeTI9XCIxMDYwLjkyXCIgZ3JhZGllbnRUcmFuc2Zvcm09XCJ0cmFuc2xhdGUoMTk0Mi4yNyAtODIxMC4xNCkgc2NhbGUoOC41KVwiIGdyYWRpZW50VW5pdHM9XCJ1c2VyU3BhY2VPblVzZVwiPjxzdG9wIG9mZnNldD1cIjAuMzFcIiBzdG9wLWNvbG9yPVwiIzI5ODZhNVwiLz48c3RvcCBvZmZzZXQ9XCIwLjY5XCIgc3RvcC1jb2xvcj1cIiMxYzcwOGNcIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHRpdGxlPkFzc2V0IDI8L3RpdGxlPjxnIGlkPVwiTGF5ZXJfMlwiIGRhdGEtbmFtZT1cIkxheWVyIDJcIj48ZyBpZD1cIkxheWVyXzEtMlwiIGRhdGEtbmFtZT1cIkxheWVyIDFcIj48cGF0aCBjbGFzcz1cImNscy0xXCIgZD1cIk00NzguNzgsMjQ1LjU1QzM1OC4xNiwyMDUuODMsMzYzLDUwLjEzLDE1Mi40MiwwYzEzLjgsNDkuMzYsMjIuNDksNzcuMTUsMjguODIsMTI4Ljc4bDUxLjUyLDUuNjhjLTI2LDYuNzYtNTEuNDEsOC40OS01NS42OCwzMi41NC0xMi4zNiw3MC4zOC01OC4xNyw1OS4zMS04MS45NCw4MS41MmExMjUuOSwxMjUuOSwwLDAsMCwyMC4yOCwxLjYyLDEyMS41MiwxMjEuNTIsMCwwLDAsMzYuODMtNS42NmwwLC4xQTEyMS41NiwxMjEuNTYsMCwwLDAsMTg1LjU2LDIyOGwxNS44NC0xMS4yMUwyMTcuMjUsMjI4YTEyMS40OCwxMjEuNDgsMCwwLDAsMzMuMjcsMTYuNTdsMC0uMWExMjMuNiwxMjMuNiwwLDAsMCw3My42NC4xdi0uMUExMjAuODMsMTIwLjgzLDAsMCwwLDM1Ny40OSwyMjhsMTUuODQtMTEuMjFMMzg5LjE4LDIyOGExMjEuMTgsMTIxLjE4LDAsMCwwLDMzLjI3LDE2LjU3bDAtLjFhMTIxLjQ2LDEyMS40NiwwLDAsMCwzNi44Miw1LjY2LDEyNC40NSwxMjQuNDUsMCwwLDAsMTcuNDgtMS4yNCw1LjEyLDUuMTIsMCwwLDAsMi0zLjM2WlwiLz48cGF0aCBjbGFzcz1cImNscy0yXCIgZD1cIk01NzMuOTMsMjY0LjU4VjgxMkgwVjI2OC4yYTE0Ny44LDE0Ny44LDAsMCwwLDMzLjQ0LTE3Ljc3LDE0OSwxNDksMCwwLDAsMTcxLjk0LDAsMTQ5LDE0OSwwLDAsMCwxNzEuOTMsMCwxNDksMTQ5LDAsMCwwLDE3MS45NSwwLDE0OS4xMSwxNDkuMTEsMCwwLDAsMjQuNjcsMTQuMTRaXCIvPjx0ZXh0IGNsYXNzPVwiY2xzLTNcIiB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoNDcuMjUgNzIyLjYyKSBzY2FsZSgwLjgzIDEpXCI+c2hhcms8L3RleHQ+PHBhdGggY2xhc3M9XCJjbHMtNFwiIGQ9XCJNMTkwLjkyLDM2OS44MmwtLjY5LDE0LjA2cTUuMzYtOC41MiwxMS44MS0xMi43M2EyNS4zMiwyNS4zMiwwLDAsMSwxNC4xLTQuMkEyMy40NywyMy40NywwLDAsMSwyMzIuMjcsMzczYTI1LjY5LDI1LjY5LDAsMCwxLDguNDksMTRxMS42OSw3LjkxLDEuNjksMjYuODV2NjdxMCwyMS43LTIuMTMsMzAuODdhMjYsMjYsMCwwLDEtOC43NCwxNC42MywyNC4yMiwyNC4yMiwwLDAsMS0xNS45NCw1LjQ1LDI0LjUyLDI0LjUyLDAsMCwxLTEzLjgtNC4yLDQwLjg3LDQwLjg3LDAsMCwxLTExLjYyLTEyLjQ5djM2LjQ3SDE1MC4xMVYzNjkuODJabTExLjQyLDQ2LjI3cTAtMTQuNzQtLjg5LTE3Ljg2dC01LTMuMTJhNC44NSw0Ljg1LDAsMCwwLTUuMTEsMy42cS0xLjE0LDMuNi0xLjE0LDE3LjM4VjQ4MnEwLDE0LjM4LDEuMTksMThhNC45Myw0LjkzLDAsMCwwLDUuMTYsMy42cTMuODcsMCw0LjgyLTMuM3QuOTQtMTZaXCIvPjxwYXRoIGNsYXNzPVwiY2xzLTRcIiBkPVwiTTI5Mi40OSw0MzEuNDNIMjU0Ljg2VjQyMC43NnEwLTE4LjQ2LDMuNTItMjguNDd0MTQuMTUtMTcuNjhxMTAuNjItNy42NywyNy42LTcuNjcsMjAuMzUsMCwzMC42OCw4LjY5QTM0LjU4LDM0LjU4LDAsMCwxLDM0My4yMywzOTdxMi4wOSwxMi42NSwyLjA4LDUyLjA4djc5Ljg0aC0zOVY1MTQuNzJxLTMuNjcsOC41My05LjQ4LDEyLjc5QTIyLjc4LDIyLjc4LDAsMCwxLDI4Myw1MzEuNzdhMzAsMzAsMCwwLDEtMTkuMzEtNy4xM3EtOC43OS03LjEzLTguNzktMzEuMjNWNDgwLjM0cTAtMTcuODYsNC42Ny0yNC4zM3QyMy4xMy0xNS4xcTE5Ljc2LTkuMzUsMjEuMTUtMTIuNTl0MS4zOS0xMy4xOXEwLTEyLjQ3LTEuNTQtMTYuMjR0LTUuMTEtMy43OHEtNC4wNywwLTUuMDYsMy4xOHQtMSwxNi40OFptMTIuNzEsMjEuODJxLTkuNjMsOC41MS0xMS4xNywxNC4yNnQtMS41NCwxNi41NHEwLDEyLjM1LDEuMzQsMTUuOTRhNS4xNyw1LjE3LDAsMCwwLDUuMzEsMy42cTMuNzcsMCw0LjkyLTIuODJUMzA1LjIsNDg2WlwiLz48cGF0aCBjbGFzcz1cImNscy00XCIgZD1cIk0zOTkuMjMsMzY5LjgybC0xLjU5LDIwLjkycTguNzQtMjIuNDcsMjUuMzItMjMuNzl2NTZxLTExLDAtMTYuMTgsMy42YTE1LjA2LDE1LjA2LDAsMCwwLTYuMzUsMTBxLTEuMTksNi40MS0xLjE5LDI5LjU1djYyLjgxSDM1OS4xMlYzNjkuODJaXCIvPjxwYXRoIGNsYXNzPVwiY2xzLTRcIiBkPVwiTTUxOC4yNywzNjkuODIsNTAyLDQzMy4xN2wyMS4xNSw5NS43Mkg0ODQuNTZsLTEyLjUxLTY5LjMzLDAsNjkuMzNINDMxLjg5VjMzNC44Mkg0NzJsMCw4MS40NywxMi41MS00Ni40N1pcIi8+PHRleHQgY2xhc3M9XCJjbHMtNVwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgwLjcxIDg5Ni44NSlcIj5zdG9wIGNpPHRzcGFuIGNsYXNzPVwiY2xzLTZcIiB4PVwiMzE4LjczXCIgeT1cIjBcIj5yPC90c3Bhbj48dHNwYW4gY2xhc3M9XCJjbHMtN1wiIHg9XCIzNTkuNDZcIiB5PVwiMFwiPmNsaW5nPC90c3Bhbj48L3RleHQ+PC9nPjwvZz48L3N2Zz5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGVyciA9PiB7IGNvbnNvbGUubG9nKCBlcnIuc3RhY2sgfHwgZXJyICkgfVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICBFcnJvcjogcmVxdWlyZSgnLi9NeUVycm9yJyksXG5cbiAgICBQOiAoIGZ1biwgYXJncz1bIF0sIHRoaXNBcmcgKSA9PlxuICAgICAgICBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiBSZWZsZWN0LmFwcGx5KCBmdW4sIHRoaXNBcmcgfHwgdGhpcywgYXJncy5jb25jYXQoICggZSwgLi4uY2FsbGJhY2sgKSA9PiBlID8gcmVqZWN0KGUpIDogcmVzb2x2ZShjYWxsYmFjaykgKSApICksXG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7IHJldHVybiB0aGlzIH1cbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgICBpZiAoaXNGdW5jdGlvbihldmxpc3RlbmVyKSlcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGV2bGlzdGVuZXIpXG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiJdfQ==
