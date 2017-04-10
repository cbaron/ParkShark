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

},{"../../lib/MyObject":20}],4:[function(require,module,exports){
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

},{"../../lib/MyError":19,"./.ViewMap":2,"./factory/View":4}],7:[function(require,module,exports){
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
                scale: 1,
                icon: window.location.origin + ('/static/img/' + datum.type + '.png')
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
            //this.els.container.classList.add('hidden')
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
                //this.els.container.classList.remove( 'hidden' )
                _this8.els.container.classList.add('slide-in-' + swipe);
            }
            return Promise.resolve();
        });
    }
});

},{"./__proto__":9,"./templates/lib/dot":15}],9:[function(require,module,exports){
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

},{"../../../lib/MyObject":20,"../Xhr":3,"./lib/OptimizedResize":10,"events":21}],10:[function(require,module,exports){
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

},{"./lib/logo":18}],12:[function(require,module,exports){
'use strict';

module.exports = function (p) {
    var pageUi = require('./lib/dot');
    return '<div>\n        <div data-js="mapWrap" class="map-wrap">\n            <div data-js="map" class="map"></div>\n            <div class="menu">\n                <div class="menu-item">\n                    <div>' + require('./lib/info') + '</div>\n                </div>\n                <div class="menu-item">\n                    <div>' + require('./lib/cursor') + '</div>\n                </div>\n            </div>\n        </div>\n        <div class="info-main">\n            <div data-js="pageUi" class="page-ui">\n                ' + Array.from(Array(p.length).keys()).map(function () {
        return pageUi;
    }).join('') + '\n            </div>\n            <div data-js="weather" class="weather">\n                <span>' + require('./lib/cloud') + '</span>\n                <span data-js="temp"></span>\n            </div>\n            <div class="snag-area">\n                <div class="line-wrap">' + require('./lib/line') + '</div>\n                <div class="button-row">\n                    <button class="snag" data-js="snag">\n                        <div>Snag This Spot</div>\n                        <div data-js="distance"></div>\n                    </button>\n                </div>\n            </div>\n            <div class="spot-details">\n                <div data-js="spotName"></div>\n                <div class="context" data-js="spotContext"></div>\n                <div class="context" data-js="detail"></div>\n                <img data-js="image" />\n            </div>\n        </div>\n    </div>';
};

},{"./lib/cloud":13,"./lib/cursor":14,"./lib/dot":15,"./lib/info":16,"./lib/line":17}],13:[function(require,module,exports){
"use strict";

module.exports = "<svg class=\"cloud\" version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 496 496\" style=\"enable-background:new 0 0 496 496;\" xml:space=\"preserve\">\n<g>\n\t<g>\n\t\t<path d=\"M413.968,233.096c-10.832-63.92-65.816-111.512-130.944-112.96C265.88,90.336,234.536,72,200,72\n\t\t\tc-40.936,0-77.168,26.096-90.52,64.288c-20.696-2.144-40.208,7.464-51.624,24.056C25.08,163.424,0,190.6,0,224\n\t\t\tc0,20.104,9.424,38.616,25.04,50.616C9.568,290.488,0,312.136,0,336c0,48.52,39.48,88,88,88h312c52.936,0,96-43.064,96-96\n\t\t\tC496,280.424,460.464,239.928,413.968,233.096z M16,224c0-26.144,20.496-47.192,46.648-47.928l4.472-0.128l2.232-3.872\n\t\t\tc8.648-14.984,25.728-23.24,43.864-18.96l7.56,1.792l2-7.512C132.104,112.424,163.848,88,200,88\n\t\t\tc25.88,0,49.584,12.416,64.496,32.984c-53.496,6.096-98.608,43.224-114.44,95.288C148.008,216.088,145.984,216,144,216\n\t\t\tc-24.032,0-46.56,12.184-59.856,32.08c-17.272,0.752-33.248,6.528-46.552,15.864C24.2,255.096,16,240.24,16,224z M400,408H88\n\t\t\tc-39.704,0-72-32.296-72-72c0-39.704,32.296-72,71.688-72.008l5.536,0.04l2.304-3.992C105.536,242.744,124.12,232,144,232\n\t\t\tc3.352,0,6.856,0.336,10.424,1.008l7.424,1.4l1.824-7.336C176.96,173.448,224.8,136,280,136\n\t\t\tc60.512,0,111.672,45.28,119.008,105.32l0.56,4.592C399.84,249.24,400,252.6,400,256c0,66.168-53.832,120-120,120v16\n\t\t\tc74.992,0,136-61.008,136-136c0-2.12-0.176-4.2-0.272-6.296C452.432,257.088,480,289.776,480,328C480,372.112,444.112,408,400,408\n\t\t\tz\"/>\n\t</g>\n</g>\n</svg>";

},{}],14:[function(require,module,exports){
"use strict";

module.exports = "<svg class=\"cursor\" version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 512 512\" style=\"enable-background:new 0 0 512 512;\" xml:space=\"preserve\"><g><path d=\"M503.842,8.333c-0.03-0.03-0.054-0.062-0.084-0.092s-0.062-0.054-0.092-0.082c-7.968-7.902-19.398-10.276-29.86-6.185 L17.789,180.281c-12.056,4.713-19.119,16.516-17.58,29.367c1.543,12.852,11.196,22.649,24.023,24.378l222.877,30.058 c0.417,0.057,0.751,0.389,0.808,0.809l30.058,222.875c1.729,12.827,11.526,22.482,24.378,24.023 c1.174,0.141,2.337,0.208,3.489,0.208c11.458,0,21.594-6.834,25.878-17.787L510.029,38.19 C514.118,27.73,511.745,16.302,503.842,8.333z M27.847,207.253c-0.5-0.068-0.725-0.097-0.812-0.821 c-0.086-0.724,0.126-0.808,0.593-0.989L454.282,38.616L254.727,238.173C253.426,237.796,27.847,207.253,27.847,207.253z M306.558,484.373c-0.182,0.467-0.255,0.682-0.989,0.592c-0.723-0.086-0.754-0.313-0.82-0.81c0,0-30.543-225.579-30.92-226.88\tL473.384,57.719L306.558,484.373z\"/>\t</g></svg>";

},{}],15:[function(require,module,exports){
"use strict";

module.exports = "<svg class=\"dot\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\">\n  <circle cx=\"10\" cy=\"10\" r=\"10\"/>\n</svg>";

},{}],16:[function(require,module,exports){
"use strict";

module.exports = "<svg class=\"info\"version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 330 330\" style=\"enable-background:new 0 0 330 330;\" xml:space=\"preserve\"><g><path d=\"M165,0C74.019,0,0,74.02,0,165.001C0,255.982,74.019,330,165,330s165-74.018,165-164.999C330,74.02,255.981,0,165,0z M165,300c-74.44,0-135-60.56-135-134.999C30,90.562,90.56,30,165,30s135,60.562,135,135.001C300,239.44,239.439,300,165,300z\"/><path d=\"M164.998,70c-11.026,0-19.996,8.976-19.996,20.009c0,11.023,8.97,19.991,19.996,19.991c11.026,0,19.996-8.968,19.996-19.991C184.994,78.976,176.024,70,164.998,70z\"/><path d=\"M165,140c-8.284,0-15,6.716-15,15v90c0,8.284,6.716,15,15,15c8.284,0,15-6.716,15-15v-90C180,146.716,173.284,140,165,140z\"/></g></svg>";

},{}],17:[function(require,module,exports){
"use strict";

module.exports = "<svg viewBox=\"0 0 20 20\" class=\"line\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n    <line stroke-linecap=\"round\" x1=\"5\" y1=\"10\" x2=\"20\" y2=\"10\" stroke=\"black\" stroke-width=\"5\"/>\n</svg>";

},{}],18:[function(require,module,exports){
"use strict";

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 591.52 919.41\"><defs><style>.cls-1,.cls-5{fill:#231f20;}.cls-1,.cls-2{fill-rule:evenodd;}.cls-2{fill:url(#New_Gradient);}.cls-3{font-size:245.5px;font-family:Impact, Impact;}.cls-3,.cls-4{fill:#fff;}.cls-5{font-size:54.89px;font-family:AvenirNext-Regular, Avenir Next;letter-spacing:0.4em;}.cls-6{letter-spacing:0.38em;}.cls-7{letter-spacing:0.4em;}</style><linearGradient id=\"New_Gradient\" x1=\"-194.65\" y1=\"994.88\" x2=\"-194.65\" y2=\"1060.92\" gradientTransform=\"translate(1942.27 -8210.14) scale(8.5)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.31\" stop-color=\"#2986a5\"/><stop offset=\"0.69\" stop-color=\"#1c708c\"/></linearGradient></defs><title>Asset 2</title><g id=\"Layer_2\" data-name=\"Layer 2\"><g id=\"Layer_1-2\" data-name=\"Layer 1\"><path class=\"cls-1\" d=\"M478.78,245.55C358.16,205.83,363,50.13,152.42,0c13.8,49.36,22.49,77.15,28.82,128.78l51.52,5.68c-26,6.76-51.41,8.49-55.68,32.54-12.36,70.38-58.17,59.31-81.94,81.52a125.9,125.9,0,0,0,20.28,1.62,121.52,121.52,0,0,0,36.83-5.66l0,.1A121.56,121.56,0,0,0,185.56,228l15.84-11.21L217.25,228a121.48,121.48,0,0,0,33.27,16.57l0-.1a123.6,123.6,0,0,0,73.64.1v-.1A120.83,120.83,0,0,0,357.49,228l15.84-11.21L389.18,228a121.18,121.18,0,0,0,33.27,16.57l0-.1a121.46,121.46,0,0,0,36.82,5.66,124.45,124.45,0,0,0,17.48-1.24,5.12,5.12,0,0,0,2-3.36Z\"/><path class=\"cls-2\" d=\"M573.93,264.58V812H0V268.2a147.8,147.8,0,0,0,33.44-17.77,149,149,0,0,0,171.94,0,149,149,0,0,0,171.93,0,149,149,0,0,0,171.95,0,149.11,149.11,0,0,0,24.67,14.14Z\"/><text class=\"cls-3\" transform=\"translate(47.25 722.62) scale(0.83 1)\">shark</text><path class=\"cls-4\" d=\"M190.92,369.82l-.69,14.06q5.36-8.52,11.81-12.73a25.32,25.32,0,0,1,14.1-4.2A23.47,23.47,0,0,1,232.27,373a25.69,25.69,0,0,1,8.49,14q1.69,7.91,1.69,26.85v67q0,21.7-2.13,30.87a26,26,0,0,1-8.74,14.63,24.22,24.22,0,0,1-15.94,5.45,24.52,24.52,0,0,1-13.8-4.2,40.87,40.87,0,0,1-11.62-12.49v36.47H150.11V369.82Zm11.42,46.27q0-14.74-.89-17.86t-5-3.12a4.85,4.85,0,0,0-5.11,3.6q-1.14,3.6-1.14,17.38V482q0,14.38,1.19,18a4.93,4.93,0,0,0,5.16,3.6q3.87,0,4.82-3.3t.94-16Z\"/><path class=\"cls-4\" d=\"M292.49,431.43H254.86V420.76q0-18.46,3.52-28.47t14.15-17.68q10.62-7.67,27.6-7.67,20.35,0,30.68,8.69A34.58,34.58,0,0,1,343.23,397q2.09,12.65,2.08,52.08v79.84h-39V514.72q-3.67,8.53-9.48,12.79A22.78,22.78,0,0,1,283,531.77a30,30,0,0,1-19.31-7.13q-8.79-7.13-8.79-31.23V480.34q0-17.86,4.67-24.33t23.13-15.1q19.76-9.35,21.15-12.59t1.39-13.19q0-12.47-1.54-16.24t-5.11-3.78q-4.07,0-5.06,3.18t-1,16.48Zm12.71,21.82q-9.63,8.51-11.17,14.26t-1.54,16.54q0,12.35,1.34,15.94a5.17,5.17,0,0,0,5.31,3.6q3.77,0,4.92-2.82T305.2,486Z\"/><path class=\"cls-4\" d=\"M399.23,369.82l-1.59,20.92q8.74-22.47,25.32-23.79v56q-11,0-16.18,3.6a15.06,15.06,0,0,0-6.35,10q-1.19,6.41-1.19,29.55v62.81H359.12V369.82Z\"/><path class=\"cls-4\" d=\"M518.27,369.82,502,433.17l21.15,95.72H484.56l-12.51-69.33,0,69.33H431.89V334.82H472l0,81.47,12.51-46.47Z\"/><text class=\"cls-5\" transform=\"translate(0.71 896.85)\">stop ci<tspan class=\"cls-6\" x=\"318.73\" y=\"0\">r</tspan><tspan class=\"cls-7\" x=\"359.46\" y=\"0\">cling</tspan></text></g></g></svg>";

},{}],19:[function(require,module,exports){
"use strict";

module.exports = function (err) {
  console.log(err.stack || err);
};

},{}],20:[function(require,module,exports){
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

},{"./MyError":19}],21:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzL1hoci5qcyIsImNsaWVudC9qcy9mYWN0b3J5L1ZpZXcuanMiLCJjbGllbnQvanMvbWFpbi5qcyIsImNsaWVudC9qcy9yb3V0ZXIuanMiLCJjbGllbnQvanMvdmlld3MvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy9TbmFnLmpzIiwiY2xpZW50L2pzL3ZpZXdzL19fcHJvdG9fXy5qcyIsImNsaWVudC9qcy92aWV3cy9saWIvT3B0aW1pemVkUmVzaXplLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9Ib21lLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9TbmFnLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvY2xvdWQuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9jdXJzb3IuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9kb3QuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9pbmZvLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvbGluZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvbGliL2xvZ28uanMiLCJsaWIvTXlFcnJvci5qcyIsImxpYi9NeU9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLE9BQU0sUUFBUSx3QkFBUixDQURRO0FBRWQsT0FBTSxRQUFRLHdCQUFSO0FBRlEsQ0FBZjs7Ozs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLE9BQU0sUUFBUSxjQUFSLENBRFE7QUFFZCxPQUFNLFFBQVEsY0FBUjtBQUZRLENBQWY7Ozs7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9Ib21lJyksXG5cdFNuYWc6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL1NuYWcnKVxufSIsIm1vZHVsZS5leHBvcnRzPXtcblx0SG9tZTogcmVxdWlyZSgnLi92aWV3cy9Ib21lJyksXG5cdFNuYWc6IHJlcXVpcmUoJy4vdmlld3MvU25hZycpXG59IiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi4vLi4vbGliL015T2JqZWN0JyksIHtcblxuICAgIFJlcXVlc3Q6IHtcblxuICAgICAgICBjb25zdHJ1Y3RvciggZGF0YSApIHtcbiAgICAgICAgICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG4gICAgICAgICAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBbIDUwMCwgNDA0LCA0MDEgXS5pbmNsdWRlcyggdGhpcy5zdGF0dXMgKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZWplY3QoIHRoaXMucmVzcG9uc2UgKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiByZXNvbHZlKCBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2UpIClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggZGF0YS5tZXRob2QgPT09IFwiZ2V0XCIgfHwgZGF0YS5tZXRob2QgPT09IFwib3B0aW9uc1wiICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcXMgPSBkYXRhLnFzID8gYD8ke2RhdGEucXN9YCA6ICcnIFxuICAgICAgICAgICAgICAgICAgICByZXEub3BlbiggZGF0YS5tZXRob2QsIGRhdGEudXJsIHx8IGAvJHtkYXRhLnJlc291cmNlfSR7cXN9YCApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SGVhZGVycyggcmVxLCBkYXRhLmhlYWRlcnMgKVxuICAgICAgICAgICAgICAgICAgICByZXEuc2VuZChudWxsKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5vcGVuKCBkYXRhLm1ldGhvZCwgYC8ke2RhdGEucmVzb3VyY2V9YCwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKCBkYXRhLmRhdGEgKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9LFxuXG4gICAgICAgIHBsYWluRXNjYXBlKCBzVGV4dCApIHtcbiAgICAgICAgICAgIC8qIGhvdyBzaG91bGQgSSB0cmVhdCBhIHRleHQvcGxhaW4gZm9ybSBlbmNvZGluZz8gd2hhdCBjaGFyYWN0ZXJzIGFyZSBub3QgYWxsb3dlZD8gdGhpcyBpcyB3aGF0IEkgc3VwcG9zZS4uLjogKi9cbiAgICAgICAgICAgIC8qIFwiNFxcM1xcNyAtIEVpbnN0ZWluIHNhaWQgRT1tYzJcIiAtLS0tPiBcIjRcXFxcM1xcXFw3XFwgLVxcIEVpbnN0ZWluXFwgc2FpZFxcIEVcXD1tYzJcIiAqL1xuICAgICAgICAgICAgcmV0dXJuIHNUZXh0LnJlcGxhY2UoL1tcXHNcXD1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRIZWFkZXJzKCByZXEsIGhlYWRlcnM9e30gKSB7XG4gICAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlciggXCJBY2NlcHRcIiwgaGVhZGVycy5hY2NlcHQgfHwgJ2FwcGxpY2F0aW9uL2pzb24nIClcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCBcIkNvbnRlbnQtVHlwZVwiLCBoZWFkZXJzLmNvbnRlbnRUeXBlIHx8ICd0ZXh0L3BsYWluJyApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2ZhY3RvcnkoIGRhdGEgKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKCB0aGlzLlJlcXVlc3QsIHsgfSApLmNvbnN0cnVjdG9yKCBkYXRhIClcbiAgICB9LFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgaWYoICFYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2VuZEFzQmluYXJ5ICkge1xuICAgICAgICAgIFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgPSBmdW5jdGlvbihzRGF0YSkge1xuICAgICAgICAgICAgdmFyIG5CeXRlcyA9IHNEYXRhLmxlbmd0aCwgdWk4RGF0YSA9IG5ldyBVaW50OEFycmF5KG5CeXRlcyk7XG4gICAgICAgICAgICBmb3IgKHZhciBuSWR4ID0gMDsgbklkeCA8IG5CeXRlczsgbklkeCsrKSB7XG4gICAgICAgICAgICAgIHVpOERhdGFbbklkeF0gPSBzRGF0YS5jaGFyQ29kZUF0KG5JZHgpICYgMHhmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VuZCh1aThEYXRhKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZhY3RvcnkuYmluZCh0aGlzKVxuICAgIH1cblxufSApLCB7IH0gKS5jb25zdHJ1Y3RvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGNyZWF0ZSggbmFtZSwgb3B0cyApIHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBuYW1lXG4gICAgICAgIG5hbWUgPSBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKVxuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShcbiAgICAgICAgICAgIHRoaXMuVmlld3NbIG5hbWUgXSxcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oIHtcbiAgICAgICAgICAgICAgICBuYW1lOiB7IHZhbHVlOiBuYW1lIH0sXG4gICAgICAgICAgICAgICAgZmFjdG9yeTogeyB2YWx1ZTogdGhpcyB9LFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB7IHZhbHVlOiB0aGlzLlRlbXBsYXRlc1sgbmFtZSBdIH0sXG4gICAgICAgICAgICAgICAgdXNlcjogeyB2YWx1ZTogdGhpcy5Vc2VyIH1cbiAgICAgICAgICAgICAgICB9LCBvcHRzIClcbiAgICAgICAgKS5jb25zdHJ1Y3RvcigpXG4gICAgICAgIC5vbiggJ25hdmlnYXRlJywgcm91dGUgPT4gcmVxdWlyZSgnLi4vcm91dGVyJykubmF2aWdhdGUoIHJvdXRlICkgKVxuICAgICAgICAub24oICdkZWxldGVkJywgKCkgPT4gZGVsZXRlIChyZXF1aXJlKCcuLi9yb3V0ZXInKSkudmlld3NbbmFtZV0gKVxuICAgIH0sXG5cbn0sIHtcbiAgICBUZW1wbGF0ZXM6IHsgdmFsdWU6IHJlcXVpcmUoJy4uLy5UZW1wbGF0ZU1hcCcpIH0sXG4gICAgVmlld3M6IHsgdmFsdWU6IHJlcXVpcmUoJy4uLy5WaWV3TWFwJykgfVxufSApXG4iLCJ3aW5kb3cuaW5pdE1hcCA9ICgpID0+IHRydWVcbndpbmRvdy5vbmxvYWQgPSAoKSA9PiByZXF1aXJlKCcuL3JvdXRlcicpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIEVycm9yOiByZXF1aXJlKCcuLi8uLi9saWIvTXlFcnJvcicpLFxuICAgIFxuICAgIFZpZXdGYWN0b3J5OiByZXF1aXJlKCcuL2ZhY3RvcnkvVmlldycpLFxuICAgIFxuICAgIFZpZXdzOiByZXF1aXJlKCcuLy5WaWV3TWFwJyksXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb250ZW50Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlbnQnKVxuXG4gICAgICAgIHdpbmRvdy5vbnBvcHN0YXRlID0gdGhpcy5oYW5kbGUuYmluZCh0aGlzKVxuXG4gICAgICAgIHRoaXMuaGFuZGxlKClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBoYW5kbGUoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlciggd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoMSkgKVxuICAgIH0sXG5cbiAgICBoYW5kbGVyKCBwYXRoICkge1xuICAgICAgICBjb25zdCBuYW1lID0gcGF0aFswXSA/IHBhdGhbMF0uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwYXRoWzBdLnNsaWNlKDEpIDogJycsXG4gICAgICAgICAgICAgIHZpZXcgPSB0aGlzLlZpZXdzW25hbWVdID8gcGF0aFswXSA6ICdob21lJztcblxuICAgICAgICAoICggdmlldyA9PT0gdGhpcy5jdXJyZW50VmlldyApXG4gICAgICAgICAgICA/IFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICA6IFByb21pc2UuYWxsKCBPYmplY3Qua2V5cyggdGhpcy52aWV3cyApLm1hcCggdmlldyA9PiB0aGlzLnZpZXdzWyB2aWV3IF0uaGlkZSgpICkgKSApIFxuICAgICAgICAudGhlbiggKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmlld1xuXG4gICAgICAgICAgICBpZiggdGhpcy52aWV3c1sgdmlldyBdICkgcmV0dXJuIHRoaXMudmlld3NbIHZpZXcgXS5uYXZpZ2F0ZSggcGF0aCApXG5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1sgdmlldyBdID1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5WaWV3RmFjdG9yeS5jcmVhdGUoIHZpZXcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5jb250ZW50Q29udGFpbmVyIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHsgdmFsdWU6IHBhdGgsIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICApXG4gICAgICAgIH0gKVxuICAgICAgICAuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgIH0sXG5cbiAgICBuYXZpZ2F0ZSggbG9jYXRpb24gKSB7XG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKCB7fSwgJycsIGxvY2F0aW9uIClcbiAgICAgICAgdGhpcy5oYW5kbGUoKVxuICAgIH1cblxufSwgeyBjdXJyZW50VmlldzogeyB2YWx1ZTogJycsIHdyaXRhYmxlOiB0cnVlIH0sIHZpZXdzOiB7IHZhbHVlOiB7IH0gfSB9ICkuY29uc3RydWN0b3IoKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgcG9zdFJlbmRlcigpIHtcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4gdGhpcy5oaWRlKCkudGhlbiggKCkgPT4gdGhpcy5lbWl0KCAnbmF2aWdhdGUnLCAnc25hZycgKSApLmNhdGNoKCB0aGlzLkVycm9yICksIDIwMDAgKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIHNuYWc6ICdjbGljaydcbiAgICB9LFxuXG4gICAgb25TbmFnQ2xpY2soKSB7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5kYXRhWyB0aGlzLmN1cnJlbnRTcG90IF0ubWFwTG9jYXRpb25cblxuICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBgd2F6ZTovLz9sbD0ke2xvY2F0aW9uLmxhdH0sJHtsb2NhdGlvbi5sbmd9Jm5hdmlnYXRlPXllc2BcbiAgICB9LFxuXG4gICAgYmluZFN3aXBlKCkge1xuICAgICAgICB0aGlzLnN3aXBlVGltZSA9IDEwMDBcbiAgICAgICAgdGhpcy5taW5YID0gMzBcbiAgICAgICAgdGhpcy5tYXhZID0gMzBcblxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsICBlID0+IHRoaXMub25Td2lwZVN0YXJ0KGUpLCBmYWxzZSApXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIGUgPT4gdGhpcy5vblN3aXBlU3RhcnQoZSksIGZhbHNlIClcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgZSA9PiB0aGlzLm9uU3dpcGVFbmQoZSksIGZhbHNlIClcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIGUgPT4gdGhpcy5vblN3aXBlRW5kKGUpLCBmYWxzZSApXG5cbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBlID0+IGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCksIHsgcGFzc2l2ZTogZmFsc2UgfSApXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgZSA9PiBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpLCB7IHBhc3NpdmU6IGZhbHNlIH0gKVxuXG4gICAgICAgIHRoaXMuZWxzLmltYWdlLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBlID0+IGUucHJldmVudERlZmF1bHQoKSwgeyBwYXNzaXZlOiBmYWxzZSB9IClcbiAgICAgICAgdGhpcy5lbHMuaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIGUgPT4gZS5wcmV2ZW50RGVmYXVsdCgpLCB7IHBhc3NpdmU6IGZhbHNlIH0gKVxuICAgIH0sXG5cbiAgICBnZXRUZW1wbGF0ZU9wdGlvbnMoKSB7IHJldHVybiB0aGlzLmRhdGEgfSxcblxuICAgIGRhdGE6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTY0OTUwLCBsbmc6IC03NS4xOTI1ODM3ICB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgQycsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ0hvdXJseS9Qcml2YXRlIExvdCcsXG4gICAgICAgICAgICAgICAgJzUvNjAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICckMy9ociAwLTMgaG91cnMnLFxuICAgICAgICAgICAgICAgICczLTVociBtYXggdGltZSBpcyAkMTQuMDAnLFxuICAgICAgICAgICAgICAgICdvcGVuIDI0IGhycydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZXM6IFsgJ2xvdF9jJywgOCwgOSwgMTAsIDExLCA0OSBdLFxuICAgICAgICAgICAgdHlwZTogJ2xvdCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTkzMjA5LCBsbmc6IC03NS4xOTIwOTA3IH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBEJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBMb3QnLFxuICAgICAgICAgICAgICAgICcxLzYwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdsb3RfZCcsIDQ1IF0sXG4gICAgICAgICAgICB0eXBlOiAnbG90J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1OTkyNTYsIGxuZzogLTc1LjE4ODk5NTAgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IEgnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIExvdCcsXG4gICAgICAgICAgICAgICAgJzMvMTAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZXM6IFsgJ2xvdF9oJywgNCwgMTUsIDI2IF0sXG4gICAgICAgICAgICB0eXBlOiAnbG90J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1ODMwNDUsIGxuZzogLTc1LjE4ODgyMzU5IH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBKJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBMb3QnLFxuICAgICAgICAgICAgICAgICc0LzExIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdsb3RfaicsIDEsIDIsIDMsIDQgXSxcbiAgICAgICAgICAgIHR5cGU6ICdsb3QnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU3NTU4NywgbG5nOiAtNzUuMTkzNDA5NSB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgSycsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgTG90JyxcbiAgICAgICAgICAgICAgICAnMS8yMTAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZXM6IFsgJ2xvdF9rJywgMTE1IF0sXG4gICAgICAgICAgICB0eXBlOiAnbG90J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NjMyOTMsIGxuZzogLTc1LjE5MTE5NDkgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IFAnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIExvdCcsXG4gICAgICAgICAgICAgICAgJzUvOSBzcG90cydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgICAgICAgJ1Blcm1pdCBPbmx5J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltYWdlczogWyAnbG90X3AnLCAxLCAyLCAzLCA0LCA1IF0sXG4gICAgICAgICAgICB0eXBlOiAnbG90J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1Nzk5MDIsIGxuZzogLTc1LjE5MDE2NTggfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IFInLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIExvdCcsXG4gICAgICAgICAgICAgICAgJzEvMjQgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZXM6IFsgJ2xvdF9yJywgMjAgXSxcbiAgICAgICAgICAgIHR5cGU6ICdsb3QnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU2ODE1NCwgbG5nOiAtNzUuMTg3MjY2OSB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgUycsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgTG90JyxcbiAgICAgICAgICAgICAgICAnMy8yNDAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZXM6IFsgJ2xvdF9zJywgNzEsIDcyLCA3MyBdLFxuICAgICAgICAgICAgdHlwZTogJ2xvdCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTc4NzgyLCBsbmc6IC03NS4xODgyODAzIH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBUJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBMb3QnLFxuICAgICAgICAgICAgICAgICcyLzE5IHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdsb3RfdCcsIDIsIDQgXSxcbiAgICAgICAgICAgIHR5cGU6ICdsb3QnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU0NTY4OCwgbG5nOiAtNzUuMTkxNTkwMiB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBQYXJraW5nIFNlcnZpY2VzJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHVibGljIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnODgvODAzIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnJDEzL2hvdXInXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdvZmZjYW1wdXNzdHJ1Y3R1cmUnIF0sXG4gICAgICAgICAgICB0eXBlOiAnZ2FyYWdlJ1xuICAgICAgICB9XG4gICAgXSxcblxuICAgIGluaXRNYXAoKSB7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uc1NlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1NlcnZpY2UoKVxuXG4gICAgICAgIHRoaXMubWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCggdGhpcy5lbHMubWFwLCB7XG4gICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxuICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcbiAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBuYXZpZ2F0aW9uQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXG4gICAgICAgICAgICBuYXZpZ2F0aW9uQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICBtYXBUeXBlQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxuICAgICAgICAgICAgc2NhbGVDb250cm9sOiBmYWxzZVxuICAgICAgICAgICAgLy96b29tOiAxNVxuICAgICAgICB9IClcblxuICAgICAgICB0aGlzLm9yaWdpbiA9IHsgbGF0OiAzOS45NTYxMzUsIGxuZzogLTc1LjE5MDY5MyB9XG5cbiAgICAgICAgY29uc3QgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigge1xuICAgICAgICAgICAgcG9zaXRpb246IHRoaXMub3JpZ2luLFxuICAgICAgICAgICAgaWNvbjoge1xuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJyMwMDdhZmYnLFxuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAxLFxuICAgICAgICAgICAgICAgIHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFLFxuICAgICAgICAgICAgICAgIHNjYWxlOiA3LFxuICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICAgIHN0cm9rZU9wYWNpdHk6IC44LFxuICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogM1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1hcDogdGhpcy5tYXBcbiAgICAgICAgfSApXG5cbiAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goIGRhdHVtID0+IHtcbiAgICAgICAgICAgIGRhdHVtLm1hcmtlciA9XG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogZGF0dW0ubWFwTG9jYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXR1bS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIGAvc3RhdGljL2ltZy8ke2RhdHVtLnR5cGV9LnBuZ2BcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgfSApXG5cbiAgICAgICAgdGhpcy5lbHMucGFnZVVpLmNoaWxkcmVuWyAwIF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICAgICAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZVxuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICAgIC50aGVuKCAoKSA9PiBQcm9taXNlLnJlc29sdmUoIHRoaXMudXBkYXRpbmcgPSBmYWxzZSApIClcbiAgICAgICAgLmNhdGNoKCB0aGlzLkVycm9yIClcblxuICAgIH0sXG5cbiAgICBvblN3aXBlU3RhcnQoIGUgKSB7XG4gICAgICAgIGUgPSAoJ2NoYW5nZWRUb3VjaGVzJyBpbiBlKSA/IGUuY2hhbmdlZFRvdWNoZXNbMF0gOiBlXG4gICAgICAgIHRoaXMudG91Y2hTdGFydENvb3JkcyA9IHsgeDogZS5wYWdlWCwgeSA6ZS5wYWdlWSB9XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICB9LFxuICAgIFxuICAgIG9uU3dpcGVFbmQoIGUgKSB7XG4gICAgICAgIGUgPSAoJ2NoYW5nZWRUb3VjaGVzJyBpbiBlKSA/IGUuY2hhbmdlZFRvdWNoZXNbMF0gOiBlXG4gICAgICAgIHRoaXMudG91Y2hFbmRDb29yZHMgPSB7IHg6IGUucGFnZVggLSB0aGlzLnRvdWNoU3RhcnRDb29yZHMueCwgeSA6ZS5wYWdlWSAtIHRoaXMudG91Y2hTdGFydENvb3Jkcy55IH1cbiAgICAgICAgdGhpcy5lbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGhpcy5zdGFydFRpbWVcblxuICAgICAgICBpZiggdGhpcy5lbGFwc2VkVGltZSA8PSB0aGlzLnN3aXBlVGltZSApIHtcbiAgICAgICAgICAgIGlmKCBNYXRoLmFicyh0aGlzLnRvdWNoRW5kQ29vcmRzLngpID49IHRoaXMubWluWCAmJiBNYXRoLmFicyh0aGlzLnRvdWNoRW5kQ29vcmRzLnkpIDw9IHRoaXMubWF4WSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvdWNoRW5kQ29vcmRzLnggPCAwID8gdGhpcy5vblN3aXBlTGVmdCgpIDogdGhpcy5vblN3aXBlUmlnaHQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldE9mZnNldFRvcCggZWwgKSB7XG4gICAgICAgIGxldCB0b3AgPSAwXG4gICAgICAgIGRvIHtcbiAgICAgICAgICBpZiAoICFpc05hTiggZWwub2Zmc2V0VG9wICkgKSB7IHRvcCArPSBlbC5vZmZzZXRUb3AgfVxuICAgICAgICB9IHdoaWxlKCBlbCA9IGVsLm9mZnNldFBhcmVudCApXG4gICAgICAgIHJldHVybiB0b3BcbiAgICB9LFxuXG4gICAgaXNFeHBhbmRlZCgpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodCArIHdpbmRvdy5kb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA+IHRoaXMuZ2V0T2Zmc2V0VG9wKCB0aGlzLmVscy5pbWFnZSApXG4gICAgfSxcblxuICAgIHN3aXBlSW1hZ2UoIGRpcmVjdGlvbiApIHtcbiAgICAgICAgY29uc3QgZGF0dW0gPSB0aGlzLmRhdGFbIHRoaXMuY3VycmVudFNwb3QgXVxuXG4gICAgICAgIGxldCBpbWFnZSA9IG5ldyBJbWFnZSgpXG5cbiAgICAgICAgaW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbHMuaW1hZ2Uuc3JjID0gaW1hZ2Uuc3JjXG4gICAgICAgICAgICAvL3RoaXMuZWxzLmltYWdlLmNsYXNzTGlzdC5yZW1vdmUoICdoaWRlJyApXG4gICAgICAgICAgICAvL3dpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+ICB0aGlzLmVscy5pbWFnZS5jbGFzc0xpc3QuYWRkKCBgc2xpZGUtaW4tJHtkaXJlY3Rpb259YCApIClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCAhZGF0dW0uaW1hZ2VJbmRleCApIGRhdHVtLmltYWdlSW5kZXggPSAwXG5cbiAgICAgICAgZGF0dW0uaW1hZ2VJbmRleCA9XG4gICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdsZWZ0J1xuICAgICAgICAgICAgICAgID8gZGF0dW0uaW1hZ2VzWyBkYXR1bS5pbWFnZUluZGV4ICsgMSBdXG4gICAgICAgICAgICAgICAgICAgID8gZGF0dW0uaW1hZ2VJbmRleCArIDFcbiAgICAgICAgICAgICAgICAgICAgOiAwXG4gICAgICAgICAgICAgICAgOiBkYXR1bS5pbWFnZXNbIGRhdHVtLmltYWdlSW5kZXggLSAxIF1cbiAgICAgICAgICAgICAgICAgICAgPyBkYXR1bS5pbWFnZUluZGV4IC0gMVxuICAgICAgICAgICAgICAgICAgICA6IGRhdHVtLmltYWdlcy5sZW5ndGggLSAxXG5cbiAgICAgICAgLy90aGlzLmVscy5pbWFnZS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcbiAgICAgICAgLy93aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB0aGlzLmVscy5pbWFnZS5jbGFzc0xpc3QucmVtb3ZlKCAnc2xpZGUtaW4tbGVmdCcsICdzbGlkZS1pbi1yaWdodCcgKSApXG5cbiAgICAgICAgaW1hZ2Uuc3JjID0gdGhpcy5nZXRJbWFnZVNyYyggZGF0dW0sIGRhdHVtLmltYWdlSW5kZXggKVxuXG4gICAgfSxcblxuICAgIG9uU3dpcGVMZWZ0KCkge1xuICAgICAgICBpZiggdGhpcy5pc0V4cGFuZGVkKCkgKSB7IHJldHVybiB0aGlzLnN3aXBlSW1hZ2UoJ3JpZ2h0JykgfVxuXG4gICAgICAgIGlmKCB0aGlzLnVwZGF0aW5nICkgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgdGhpcy51cGRhdGluZyA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5yZW1vdmVPbGRNYXJrZXJzKClcblxuICAgICAgICB0aGlzLmN1cnJlbnRTcG90ID0gdGhpcy5kYXRhWyB0aGlzLmN1cnJlbnRTcG90ICsgMSBdID8gdGhpcy5jdXJyZW50U3BvdCArIDEgOiAwXG5cbiAgICAgICAgdGhpcy51cGRhdGUoJ3JpZ2h0JylcbiAgICAgICAgLnRoZW4oICgpID0+IFByb21pc2UucmVzb2x2ZSggdGhpcy51cGRhdGluZyA9IGZhbHNlICkgKVxuICAgICAgICAuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgIH0sXG4gICAgXG4gICAgb25Td2lwZVJpZ2h0KCkge1xuICAgICAgICBpZiggdGhpcy5pc0V4cGFuZGVkKCkgKSB7IHJldHVybiB0aGlzLnN3aXBlSW1hZ2UoJ2xlZnQnKSB9XG5cbiAgICAgICAgaWYoIHRoaXMudXBkYXRpbmcgKSByZXR1cm4gZmFsc2VcblxuICAgICAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnJlbW92ZU9sZE1hcmtlcnMoKVxuXG4gICAgICAgIHRoaXMuY3VycmVudFNwb3QgPSB0aGlzLmRhdGFbIHRoaXMuY3VycmVudFNwb3QgLSAxIF0gPyB0aGlzLmN1cnJlbnRTcG90IC0gMSA6IHRoaXMuZGF0YS5sZW5ndGggLSAxXG5cbiAgICAgICAgdGhpcy51cGRhdGUoJ2xlZnQnKVxuICAgICAgICAudGhlbiggKCkgPT4gUHJvbWlzZS5yZXNvbHZlKCB0aGlzLnVwZGF0aW5nID0gZmFsc2UgKSApXG4gICAgICAgIC5jYXRjaCggdGhpcy5FcnJvciApXG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFNwb3QgPSAwXG5cbiAgICAgICAgdGhpcy5lbHMubWFwV3JhcC5zdHlsZS5oZWlnaHQgPSBgJHt3aW5kb3cuaW5uZXJIZWlnaHQgLSAxNDB9cHhgXG5cbiAgICAgICAgd2luZG93Lmdvb2dsZVxuICAgICAgICAgICAgPyB0aGlzLmluaXRNYXAoKVxuICAgICAgICAgICAgOiB3aW5kb3cuaW5pdE1hcCA9IHRoaXMuaW5pdE1hcFxuXG4gICAgICAgIHRoaXMuYmluZFN3aXBlKCkgICAgICAgIFxuICAgIFxuICAgICAgICB0aGlzLlhociggeyBtZXRob2Q6ICdnZXQnLCB1cmw6IGBodHRwOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS93ZWF0aGVyP3ppcD0xOTEwNCx1cyZBUFBJRD1kNWUxOTFkYTllMzFiOGY2NDQwMzdjYTMxMDYyODEwMmAgfSApXG4gICAgICAgIC50aGVuKCByZXNwb25zZSA9PiB0aGlzLmVscy50ZW1wLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZCggKCByZXNwb25zZS5tYWluLnRlbXAgKiAoOS81KSApIC0gNDU5LjY3ICkgKVxuICAgICAgICAuY2F0Y2goIGUgPT4geyBjb25zb2xlLmxvZyggZS5zdGFjayB8fCBlICk7IHRoaXMuZWxzLnRlbXAucmVtb3ZlKCkgfSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgcmVtb3ZlT2xkTWFya2VycygpIHtcbiAgICAgICAgY29uc3QgZGF0dW0gPSB0aGlzLmRhdGFbIHRoaXMuY3VycmVudFNwb3QgXVxuICAgICAgICBkYXR1bS5tYXJrZXIuc2V0TWFwKG51bGwpXG4gICAgICAgIGRhdHVtLmRpcmVjdGlvbnNEaXNwbGF5LnNldE1hcChudWxsKVxuICAgICAgICB0aGlzLmVscy5wYWdlVWkuY2hpbGRyZW5bIHRoaXMuY3VycmVudFNwb3QgXS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gICAgfSxcblxuICAgIHJlbmRlckRpcmVjdGlvbnMoIGRhdGEgKSB7XG4gICAgICAgIGlmKCBkYXRhLmRpcmVjdGlvbnNEaXNwbGF5ICkge1xuICAgICAgICAgICAgdGhpcy5lbHMuZGlzdGFuY2UudGV4dENvbnRlbnQgPSBkYXRhLmRpc3RhbmNlXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCBkYXRhLmRpcmVjdGlvbnNEaXNwbGF5LnNldE1hcCggdGhpcy5tYXAgKSApXG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLmRpcmVjdGlvbnNEaXNwbGF5ID0gbmV3IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNSZW5kZXJlciggeyBzdXBwcmVzc01hcmtlcnM6IHRydWUgfSApXG4gICAgICAgIGRhdGEuZGlyZWN0aW9uc0Rpc3BsYXkuc2V0TWFwKCB0aGlzLm1hcCApXG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uc1NlcnZpY2Uucm91dGUoIHtcbiAgICAgICAgICAgICAgICBvcmlnaW46IHRoaXMub3JpZ2luLFxuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uOiBkYXRhLm1hcExvY2F0aW9uLFxuICAgICAgICAgICAgICAgIHRyYXZlbE1vZGU6ICdEUklWSU5HJyxcbiAgICAgICAgICAgICAgICB1bml0U3lzdGVtOiBnb29nbGUubWFwcy5Vbml0U3lzdGVtLklNUEVSSUFMXG4gICAgICAgICAgICB9LCAoIHJlc3VsdCwgc3RhdHVzICkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCBzdGF0dXMgPT09ICdPSycgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZGlyZWN0aW9uc0Rpc3BsYXkuc2V0RGlyZWN0aW9ucyhyZXN1bHQpXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZGlzdGFuY2UgPSBgJHtyZXN1bHQucm91dGVzWzBdLmxlZ3NbMF0uZGlzdGFuY2UudGV4dH0gYXdheWBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbHMuZGlzdGFuY2UudGV4dENvbnRlbnQgPSBkYXRhLmRpc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyByZXR1cm4gcmVqZWN0KHN0YXR1cykgfVxuICAgICAgICAgICAgfSApXG4gICAgICAgIH0gKVxuXG4gICAgfSxcblxuICAgIHRlbXBsYXRlczoge1xuICAgICAgICBEb3Q6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xpYi9kb3QnKVxuICAgIH0sXG5cbiAgICBnZXRJbWFnZVNyYyggZGF0dW0sIGltYWdlSW5kZXggKSB7XG4gICAgICAgIGNvbnN0IHBhdGggPSB0eXBlb2YgZGF0dW0uaW1hZ2VzWyBpbWFnZUluZGV4IF0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgICA/IGRhdHVtLmltYWdlc1sgaW1hZ2VJbmRleCBdXG4gICAgICAgICAgICA6IGAke2RhdHVtLmltYWdlc1swXX1fc3BvdF8ke2RhdHVtLmltYWdlc1sgaW1hZ2VJbmRleCBdfWBcblxuICAgICAgICByZXR1cm4gYC9zdGF0aWMvaW1nL3Nwb3RzLyR7cGF0aH0uSlBHYFxuICAgIH0sXG5cbiAgICB1cGRhdGUoIHN3aXBlICkge1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5kYXRhWyB0aGlzLmN1cnJlbnRTcG90IF07XG5cbiAgICAgICAgaWYoIHN3aXBlICkge1xuICAgICAgICAgICAgLy90aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCAnc2xpZGUtaW4tbGVmdCcsICdzbGlkZS1pbi1yaWdodCcgKVxuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5tYXJrZXIuc2V0TWFwKCB0aGlzLm1hcCApXG4gICAgICAgIHRoaXMuZWxzLnBhZ2VVaS5jaGlsZHJlblsgdGhpcy5jdXJyZW50U3BvdCBdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgICAgICAgdGhpcy5lbHMuc3BvdE5hbWUudGV4dENvbnRlbnQgPSBkYXRhLm5hbWVcbiAgICAgICAgdGhpcy5lbHMuc3BvdENvbnRleHQuaW5uZXJIVE1MID0gZGF0YS5jb250ZXh0LmpvaW4oIHRoaXMudGVtcGxhdGVzLkRvdCApXG4gICAgICAgIHRoaXMuZWxzLmRldGFpbC5pbm5lckhUTUwgPSBkYXRhLmRldGFpbHMuam9pbiggdGhpcy50ZW1wbGF0ZXMuRG90IClcbiAgICAgICAgdGhpcy5lbHMuaW1hZ2Uuc3JjID0gdGhpcy5nZXRJbWFnZVNyYyggZGF0YSwgZGF0YS5pbmRleCB8fCAwIClcblxuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJEaXJlY3Rpb25zKCBkYXRhIClcbiAgICAgICAgLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgIGlmKCBzd2lwZSApIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCAnaGlkZGVuJyApXG4gICAgICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoIGBzbGlkZS1pbi0ke3N3aXBlfWAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgIH0gKVxuICAgIH1cblxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHsgfSwgcmVxdWlyZSgnLi4vLi4vLi4vbGliL015T2JqZWN0JyksIHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlci5wcm90b3R5cGUsIHtcblxuICAgIE9wdGltaXplZFJlc2l6ZTogcmVxdWlyZSgnLi9saWIvT3B0aW1pemVkUmVzaXplJyksXG4gICAgXG4gICAgWGhyOiByZXF1aXJlKCcuLi9YaHInKSxcblxuICAgIGJpbmRFdmVudCgga2V5LCBldmVudCApIHtcbiAgICAgICAgdmFyIGVscyA9IEFycmF5LmlzQXJyYXkoIHRoaXMuZWxzWyBrZXkgXSApID8gdGhpcy5lbHNbIGtleSBdIDogWyB0aGlzLmVsc1sga2V5IF0gXVxuICAgICAgICBlbHMuZm9yRWFjaCggZWwgPT4gZWwuYWRkRXZlbnRMaXN0ZW5lciggZXZlbnQgfHwgJ2NsaWNrJywgZSA9PiB0aGlzWyBgb24ke3RoaXMuY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGtleSl9JHt0aGlzLmNhcGl0YWxpemVGaXJzdExldHRlcihldmVudCl9YCBdKCBlICkgKSApXG4gICAgfSxcblxuICAgIGNhcGl0YWxpemVGaXJzdExldHRlcjogc3RyaW5nID0+IHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKSxcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB0aGlzLk9wdGltaXplZFJlc2l6ZS5hZGQoIHRoaXMuc2l6ZSApO1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKCB0aGlzLCB7IGVsczogeyB9LCBzbHVycDogeyBhdHRyOiAnZGF0YS1qcycsIHZpZXc6ICdkYXRhLXZpZXcnIH0sIHZpZXdzOiB7IH0gfSApLnJlbmRlcigpXG4gICAgfSxcblxuICAgIGRlbGVnYXRlRXZlbnRzKCBrZXksIGVsICkge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiB0aGlzLmV2ZW50c1trZXldXG5cbiAgICAgICAgaWYoIHR5cGUgPT09IFwic3RyaW5nXCIgKSB7IHRoaXMuYmluZEV2ZW50KCBrZXksIHRoaXMuZXZlbnRzW2tleV0gKSB9XG4gICAgICAgIGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuZXZlbnRzW2tleV0gKSApIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzWyBrZXkgXS5mb3JFYWNoKCBldmVudE9iaiA9PiB0aGlzLmJpbmRFdmVudCgga2V5LCBldmVudE9iai5ldmVudCApIClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50KCBrZXksIHRoaXMuZXZlbnRzW2tleV0uZXZlbnQgKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRlbGV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlkZSgpXG4gICAgICAgIC50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCggdGhpcy5lbHMuY29udGFpbmVyIClcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoIHRoaXMuZW1pdCgnZGVsZXRlZCcpIClcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIGV2ZW50czoge30sXG5cbiAgICBnZXREYXRhKCkge1xuICAgICAgICBpZiggIXRoaXMubW9kZWwgKSB0aGlzLm1vZGVsID0gT2JqZWN0LmNyZWF0ZSggdGhpcy5Nb2RlbCwgeyByZXNvdXJjZTogeyB2YWx1ZTogdGhpcy5uYW1lIH0gfSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZWwuZ2V0KClcbiAgICB9LFxuXG4gICAgZ2V0VGVtcGxhdGVPcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgKHRoaXMubW9kZWwpID8gdGhpcy5tb2RlbC5kYXRhIDoge30gLFxuICAgICAgICAgICAgeyB1c2VyOiAodGhpcy51c2VyKSA/IHRoaXMudXNlci5kYXRhIDoge30gfSxcbiAgICAgICAgICAgIHsgb3B0czogKHRoaXMudGVtcGxhdGVPcHRzKSA/IHRoaXMudGVtcGxhdGVPcHRzIDoge30gfVxuICAgICAgICApXG4gICAgfSxcblxuICAgIGhpZGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBpZiggIWRvY3VtZW50LmJvZHkuY29udGFpbnModGhpcy5lbHMuY29udGFpbmVyKSB8fCB0aGlzLmlzSGlkZGVuKCkgKSByZXR1cm4gcmVzb2x2ZSgpXG4gICAgICAgICAgICB0aGlzLm9uSGlkZGVuUHJveHkgPSBlID0+IHRoaXMub25IaWRkZW4ocmVzb2x2ZSlcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25IaWRkZW5Qcm94eSApXG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZScpXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBodG1sVG9GcmFnbWVudCggc3RyICkge1xuICAgICAgICBsZXQgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAvLyBtYWtlIHRoZSBwYXJlbnQgb2YgdGhlIGZpcnN0IGRpdiBpbiB0aGUgZG9jdW1lbnQgYmVjb21lcyB0aGUgY29udGV4dCBub2RlXG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJkaXZcIikuaXRlbSgwKSlcbiAgICAgICAgcmV0dXJuIHJhbmdlLmNyZWF0ZUNvbnRleHR1YWxGcmFnbWVudCggc3RyIClcbiAgICB9LFxuICAgIFxuICAgIGlzSGlkZGVuKCkgeyByZXR1cm4gdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5jb250YWlucygnaGlkZGVuJykgfSxcblxuICAgIG9uSGlkZGVuKCByZXNvbHZlICkge1xuICAgICAgICB0aGlzLmVscy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uSGlkZGVuUHJveHkgKVxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbiAgICAgICAgcmVzb2x2ZSggdGhpcy5lbWl0KCdoaWRkZW4nKSApXG4gICAgfSxcblxuICAgIG9uTG9naW4oKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oIHRoaXMsIHsgZWxzOiB7IH0sIHNsdXJwOiB7IGF0dHI6ICdkYXRhLWpzJywgdmlldzogJ2RhdGEtdmlldycgfSwgdmlld3M6IHsgfSB9ICkucmVuZGVyKClcbiAgICB9LFxuXG4gICAgb25TaG93biggcmVzb2x2ZSApIHtcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgdGhpcy5vblNob3duUHJveHkgKVxuICAgICAgICBpZiggdGhpcy5zaXplICkgdGhpcy5zaXplKClcbiAgICAgICAgcmVzb2x2ZSggdGhpcy5lbWl0KCdzaG93bicpIClcbiAgICB9LFxuXG4gICAgc2hvd05vQWNjZXNzKCkge1xuICAgICAgICBhbGVydChcIk5vIHByaXZpbGVnZXMsIHNvblwiKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBwb3N0UmVuZGVyKCkgeyByZXR1cm4gdGhpcyB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLnNsdXJwVGVtcGxhdGUoIHsgdGVtcGxhdGU6IHRoaXMudGVtcGxhdGUoIHRoaXMuZ2V0VGVtcGxhdGVPcHRpb25zKCkgKSwgaW5zZXJ0aW9uOiB0aGlzLmluc2VydGlvbiB9IClcblxuICAgICAgICBpZiggdGhpcy5zaXplICkgdGhpcy5zaXplKClcblxuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJTdWJ2aWV3cygpXG4gICAgICAgICAgICAgICAgICAgLnBvc3RSZW5kZXIoKVxuICAgIH0sXG5cbiAgICByZW5kZXJTdWJ2aWV3cygpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoIHRoaXMuVmlld3MgfHwgWyBdICkuZm9yRWFjaCgga2V5ID0+IHtcbiAgICAgICAgICAgIGlmKCB0aGlzLlZpZXdzWyBrZXkgXS5lbCApIHtcbiAgICAgICAgICAgICAgICBsZXQgb3B0cyA9IHRoaXMuVmlld3NbIGtleSBdLm9wdHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBvcHRzID0gKCBvcHRzIClcbiAgICAgICAgICAgICAgICAgICAgPyB0eXBlb2Ygb3B0cyA9PT0gXCJvYmplY3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPyBvcHRzXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG9wdHMoKVxuICAgICAgICAgICAgICAgICAgICA6IHt9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzWyBrZXkgXSA9IHRoaXMuZmFjdG9yeS5jcmVhdGUoIGtleSwgT2JqZWN0LmFzc2lnbiggeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuVmlld3NbIGtleSBdLmVsLCBtZXRob2Q6ICdpbnNlcnRCZWZvcmUnIH0gfSB9LCBvcHRzICkgKVxuICAgICAgICAgICAgICAgIHRoaXMuVmlld3NbIGtleSBdLmVsLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgdGhpcy5WaWV3c1sga2V5IF0uZWwgPSB1bmRlZmluZWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgc2hvdyggZHVyYXRpb24gKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uU2hvd25Qcm94eSA9IGUgPT4gdGhpcy5vblNob3duKHJlc29sdmUpXG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uU2hvd25Qcm94eSApXG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoICdoaWRkZW4nIClcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSggJ2hpZGUnICkgKVxuICAgICAgICAgICAgfSApXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBzbHVycEVsKCBlbCApIHtcbiAgICAgICAgdmFyIGtleSA9IGVsLmdldEF0dHJpYnV0ZSggdGhpcy5zbHVycC5hdHRyICkgfHwgJ2NvbnRhaW5lcidcblxuICAgICAgICBpZigga2V5ID09PSAnY29udGFpbmVyJyApIGVsLmNsYXNzTGlzdC5hZGQoIHRoaXMubmFtZSApXG5cbiAgICAgICAgdGhpcy5lbHNbIGtleSBdID0gQXJyYXkuaXNBcnJheSggdGhpcy5lbHNbIGtleSBdIClcbiAgICAgICAgICAgID8gdGhpcy5lbHNbIGtleSBdLnB1c2goIGVsIClcbiAgICAgICAgICAgIDogKCB0aGlzLmVsc1sga2V5IF0gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICAgICAgPyBbIHRoaXMuZWxzWyBrZXkgXSwgZWwgXVxuICAgICAgICAgICAgICAgIDogZWxcblxuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5zbHVycC5hdHRyKVxuXG4gICAgICAgIGlmKCB0aGlzLmV2ZW50c1sga2V5IF0gKSB0aGlzLmRlbGVnYXRlRXZlbnRzKCBrZXksIGVsIClcbiAgICB9LFxuXG4gICAgc2x1cnBUZW1wbGF0ZSggb3B0aW9ucyApIHtcbiAgICAgICAgdmFyIGZyYWdtZW50ID0gdGhpcy5odG1sVG9GcmFnbWVudCggb3B0aW9ucy50ZW1wbGF0ZSApLFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBgWyR7dGhpcy5zbHVycC5hdHRyfV1gLFxuICAgICAgICAgICAgdmlld1NlbGVjdG9yID0gYFske3RoaXMuc2x1cnAudmlld31dYFxuXG4gICAgICAgIHRoaXMuc2x1cnBFbCggZnJhZ21lbnQucXVlcnlTZWxlY3RvcignKicpIClcbiAgICAgICAgZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCggYCR7c2VsZWN0b3J9LCAke3ZpZXdTZWxlY3Rvcn1gICkuZm9yRWFjaCggZWwgPT5cbiAgICAgICAgICAgICggZWwuaGFzQXR0cmlidXRlKCB0aGlzLnNsdXJwLmF0dHIgKSApIFxuICAgICAgICAgICAgICAgID8gdGhpcy5zbHVycEVsKCBlbCApXG4gICAgICAgICAgICAgICAgOiB0aGlzLlZpZXdzWyBlbC5nZXRBdHRyaWJ1dGUodGhpcy5zbHVycC52aWV3KSBdLmVsID0gZWxcbiAgICAgICAgKVxuICAgICAgICAgIFxuICAgICAgICBvcHRpb25zLmluc2VydGlvbi5tZXRob2QgPT09ICdpbnNlcnRCZWZvcmUnXG4gICAgICAgICAgICA/IG9wdGlvbnMuaW5zZXJ0aW9uLmVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKCBmcmFnbWVudCwgb3B0aW9ucy5pbnNlcnRpb24uZWwgKVxuICAgICAgICAgICAgOiBvcHRpb25zLmluc2VydGlvbi5lbFsgb3B0aW9ucy5pbnNlcnRpb24ubWV0aG9kIHx8ICdhcHBlbmRDaGlsZCcgXSggZnJhZ21lbnQgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGFkZChjYWxsYmFjaykge1xuICAgICAgICBpZiggIXRoaXMuY2FsbGJhY2tzLmxlbmd0aCApIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplKVxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKVxuICAgIH0sXG5cbiAgICBvblJlc2l6ZSgpIHtcbiAgICAgICBpZiggdGhpcy5ydW5uaW5nICkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgPyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLnJ1bkNhbGxiYWNrcyApXG4gICAgICAgICAgICA6IHNldFRpbWVvdXQoIHRoaXMucnVuQ2FsbGJhY2tzLCA2NilcbiAgICB9LFxuXG4gICAgcnVuQ2FsbGJhY2tzKCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMuY2FsbGJhY2tzLmZpbHRlciggY2FsbGJhY2sgPT4gY2FsbGJhY2soKSApXG4gICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlIFxuICAgIH1cblxufSwgeyBjYWxsYmFja3M6IHsgdmFsdWU6IFtdIH0sIHJ1bm5pbmc6IHsgdmFsdWU6IGZhbHNlIH0gfSApLmFkZFxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+IGA8ZGl2PjxkaXY+JHtyZXF1aXJlKCcuL2xpYi9sb2dvJyl9PC9kaXY+PGRpdj5GaW5kaW5nIHRoZSBjbG9zZXN0IHBhcmtpbmcgc3BvdHMuLi5zaXQgdGlnaHQuPC9kaXY+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+IHtcbiAgICBjb25zdCBwYWdlVWkgPSByZXF1aXJlKCcuL2xpYi9kb3QnKVxuICAgIHJldHVybiBgPGRpdj5cbiAgICAgICAgPGRpdiBkYXRhLWpzPVwibWFwV3JhcFwiIGNsYXNzPVwibWFwLXdyYXBcIj5cbiAgICAgICAgICAgIDxkaXYgZGF0YS1qcz1cIm1hcFwiIGNsYXNzPVwibWFwXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVudVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZW51LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj4ke3JlcXVpcmUoJy4vbGliL2luZm8nKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVudS1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+JHtyZXF1aXJlKCcuL2xpYi9jdXJzb3InKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImluZm8tbWFpblwiPlxuICAgICAgICAgICAgPGRpdiBkYXRhLWpzPVwicGFnZVVpXCIgY2xhc3M9XCJwYWdlLXVpXCI+XG4gICAgICAgICAgICAgICAgJHtBcnJheS5mcm9tKEFycmF5KHAubGVuZ3RoKS5rZXlzKCkpLm1hcCggKCkgPT4gcGFnZVVpICkuam9pbignJyl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgZGF0YS1qcz1cIndlYXRoZXJcIiBjbGFzcz1cIndlYXRoZXJcIj5cbiAgICAgICAgICAgICAgICA8c3Bhbj4ke3JlcXVpcmUoJy4vbGliL2Nsb3VkJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtanM9XCJ0ZW1wXCI+PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic25hZy1hcmVhXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxpbmUtd3JhcFwiPiR7cmVxdWlyZSgnLi9saWIvbGluZScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidXR0b24tcm93XCI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJzbmFnXCIgZGF0YS1qcz1cInNuYWdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+U25hZyBUaGlzIFNwb3Q8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgZGF0YS1qcz1cImRpc3RhbmNlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BvdC1kZXRhaWxzXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBkYXRhLWpzPVwic3BvdE5hbWVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGV4dFwiIGRhdGEtanM9XCJzcG90Q29udGV4dFwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZXh0XCIgZGF0YS1qcz1cImRldGFpbFwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxpbWcgZGF0YS1qcz1cImltYWdlXCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5gXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFxyXG5gPHN2ZyBjbGFzcz1cImNsb3VkXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiTGF5ZXJfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHZpZXdCb3g9XCIwIDAgNDk2IDQ5NlwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0OTYgNDk2O1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XHJcbjxnPlxyXG5cdDxnPlxyXG5cdFx0PHBhdGggZD1cIk00MTMuOTY4LDIzMy4wOTZjLTEwLjgzMi02My45Mi02NS44MTYtMTExLjUxMi0xMzAuOTQ0LTExMi45NkMyNjUuODgsOTAuMzM2LDIzNC41MzYsNzIsMjAwLDcyXHJcblx0XHRcdGMtNDAuOTM2LDAtNzcuMTY4LDI2LjA5Ni05MC41Miw2NC4yODhjLTIwLjY5Ni0yLjE0NC00MC4yMDgsNy40NjQtNTEuNjI0LDI0LjA1NkMyNS4wOCwxNjMuNDI0LDAsMTkwLjYsMCwyMjRcclxuXHRcdFx0YzAsMjAuMTA0LDkuNDI0LDM4LjYxNiwyNS4wNCw1MC42MTZDOS41NjgsMjkwLjQ4OCwwLDMxMi4xMzYsMCwzMzZjMCw0OC41MiwzOS40OCw4OCw4OCw4OGgzMTJjNTIuOTM2LDAsOTYtNDMuMDY0LDk2LTk2XHJcblx0XHRcdEM0OTYsMjgwLjQyNCw0NjAuNDY0LDIzOS45MjgsNDEzLjk2OCwyMzMuMDk2eiBNMTYsMjI0YzAtMjYuMTQ0LDIwLjQ5Ni00Ny4xOTIsNDYuNjQ4LTQ3LjkyOGw0LjQ3Mi0wLjEyOGwyLjIzMi0zLjg3MlxyXG5cdFx0XHRjOC42NDgtMTQuOTg0LDI1LjcyOC0yMy4yNCw0My44NjQtMTguOTZsNy41NiwxLjc5MmwyLTcuNTEyQzEzMi4xMDQsMTEyLjQyNCwxNjMuODQ4LDg4LDIwMCw4OFxyXG5cdFx0XHRjMjUuODgsMCw0OS41ODQsMTIuNDE2LDY0LjQ5NiwzMi45ODRjLTUzLjQ5Niw2LjA5Ni05OC42MDgsNDMuMjI0LTExNC40NCw5NS4yODhDMTQ4LjAwOCwyMTYuMDg4LDE0NS45ODQsMjE2LDE0NCwyMTZcclxuXHRcdFx0Yy0yNC4wMzIsMC00Ni41NiwxMi4xODQtNTkuODU2LDMyLjA4Yy0xNy4yNzIsMC43NTItMzMuMjQ4LDYuNTI4LTQ2LjU1MiwxNS44NjRDMjQuMiwyNTUuMDk2LDE2LDI0MC4yNCwxNiwyMjR6IE00MDAsNDA4SDg4XHJcblx0XHRcdGMtMzkuNzA0LDAtNzItMzIuMjk2LTcyLTcyYzAtMzkuNzA0LDMyLjI5Ni03Miw3MS42ODgtNzIuMDA4bDUuNTM2LDAuMDRsMi4zMDQtMy45OTJDMTA1LjUzNiwyNDIuNzQ0LDEyNC4xMiwyMzIsMTQ0LDIzMlxyXG5cdFx0XHRjMy4zNTIsMCw2Ljg1NiwwLjMzNiwxMC40MjQsMS4wMDhsNy40MjQsMS40bDEuODI0LTcuMzM2QzE3Ni45NiwxNzMuNDQ4LDIyNC44LDEzNiwyODAsMTM2XHJcblx0XHRcdGM2MC41MTIsMCwxMTEuNjcyLDQ1LjI4LDExOS4wMDgsMTA1LjMybDAuNTYsNC41OTJDMzk5Ljg0LDI0OS4yNCw0MDAsMjUyLjYsNDAwLDI1NmMwLDY2LjE2OC01My44MzIsMTIwLTEyMCwxMjB2MTZcclxuXHRcdFx0Yzc0Ljk5MiwwLDEzNi02MS4wMDgsMTM2LTEzNmMwLTIuMTItMC4xNzYtNC4yLTAuMjcyLTYuMjk2QzQ1Mi40MzIsMjU3LjA4OCw0ODAsMjg5Ljc3Niw0ODAsMzI4QzQ4MCwzNzIuMTEyLDQ0NC4xMTIsNDA4LDQwMCw0MDhcclxuXHRcdFx0elwiLz5cclxuXHQ8L2c+XHJcbjwvZz5cclxuPC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbmA8c3ZnIGNsYXNzPVwiY3Vyc29yXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiTGF5ZXJfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHZpZXdCb3g9XCIwIDAgNTEyIDUxMlwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyO1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+PGc+PHBhdGggZD1cIk01MDMuODQyLDguMzMzYy0wLjAzLTAuMDMtMC4wNTQtMC4wNjItMC4wODQtMC4wOTJzLTAuMDYyLTAuMDU0LTAuMDkyLTAuMDgyYy03Ljk2OC03LjkwMi0xOS4zOTgtMTAuMjc2LTI5Ljg2LTYuMTg1IEwxNy43ODksMTgwLjI4MWMtMTIuMDU2LDQuNzEzLTE5LjExOSwxNi41MTYtMTcuNTgsMjkuMzY3YzEuNTQzLDEyLjg1MiwxMS4xOTYsMjIuNjQ5LDI0LjAyMywyNC4zNzhsMjIyLjg3NywzMC4wNTggYzAuNDE3LDAuMDU3LDAuNzUxLDAuMzg5LDAuODA4LDAuODA5bDMwLjA1OCwyMjIuODc1YzEuNzI5LDEyLjgyNywxMS41MjYsMjIuNDgyLDI0LjM3OCwyNC4wMjMgYzEuMTc0LDAuMTQxLDIuMzM3LDAuMjA4LDMuNDg5LDAuMjA4YzExLjQ1OCwwLDIxLjU5NC02LjgzNCwyNS44NzgtMTcuNzg3TDUxMC4wMjksMzguMTkgQzUxNC4xMTgsMjcuNzMsNTExLjc0NSwxNi4zMDIsNTAzLjg0Miw4LjMzM3ogTTI3Ljg0NywyMDcuMjUzYy0wLjUtMC4wNjgtMC43MjUtMC4wOTctMC44MTItMC44MjEgYy0wLjA4Ni0wLjcyNCwwLjEyNi0wLjgwOCwwLjU5My0wLjk4OUw0NTQuMjgyLDM4LjYxNkwyNTQuNzI3LDIzOC4xNzNDMjUzLjQyNiwyMzcuNzk2LDI3Ljg0NywyMDcuMjUzLDI3Ljg0NywyMDcuMjUzeiBNMzA2LjU1OCw0ODQuMzczYy0wLjE4MiwwLjQ2Ny0wLjI1NSwwLjY4Mi0wLjk4OSwwLjU5MmMtMC43MjMtMC4wODYtMC43NTQtMC4zMTMtMC44Mi0wLjgxYzAsMC0zMC41NDMtMjI1LjU3OS0zMC45Mi0yMjYuODhcdEw0NzMuMzg0LDU3LjcxOUwzMDYuNTU4LDQ4NC4zNzN6XCIvPlx0PC9nPjwvc3ZnPmBcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcbmA8c3ZnIGNsYXNzPVwiZG90XCIgdmlld0JveD1cIjAgMCAyMCAyMFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgPGNpcmNsZSBjeD1cIjEwXCIgY3k9XCIxMFwiIHI9XCIxMFwiLz5cbjwvc3ZnPmBcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuYDxzdmcgY2xhc3M9XCJpbmZvXCJ2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIiB2aWV3Qm94PVwiMCAwIDMzMCAzMzBcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzMwIDMzMDtcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPjxnPjxwYXRoIGQ9XCJNMTY1LDBDNzQuMDE5LDAsMCw3NC4wMiwwLDE2NS4wMDFDMCwyNTUuOTgyLDc0LjAxOSwzMzAsMTY1LDMzMHMxNjUtNzQuMDE4LDE2NS0xNjQuOTk5QzMzMCw3NC4wMiwyNTUuOTgxLDAsMTY1LDB6IE0xNjUsMzAwYy03NC40NCwwLTEzNS02MC41Ni0xMzUtMTM0Ljk5OUMzMCw5MC41NjIsOTAuNTYsMzAsMTY1LDMwczEzNSw2MC41NjIsMTM1LDEzNS4wMDFDMzAwLDIzOS40NCwyMzkuNDM5LDMwMCwxNjUsMzAwelwiLz48cGF0aCBkPVwiTTE2NC45OTgsNzBjLTExLjAyNiwwLTE5Ljk5Niw4Ljk3Ni0xOS45OTYsMjAuMDA5YzAsMTEuMDIzLDguOTcsMTkuOTkxLDE5Ljk5NiwxOS45OTFjMTEuMDI2LDAsMTkuOTk2LTguOTY4LDE5Ljk5Ni0xOS45OTFDMTg0Ljk5NCw3OC45NzYsMTc2LjAyNCw3MCwxNjQuOTk4LDcwelwiLz48cGF0aCBkPVwiTTE2NSwxNDBjLTguMjg0LDAtMTUsNi43MTYtMTUsMTV2OTBjMCw4LjI4NCw2LjcxNiwxNSwxNSwxNWM4LjI4NCwwLDE1LTYuNzE2LDE1LTE1di05MEMxODAsMTQ2LjcxNiwxNzMuMjg0LDE0MCwxNjUsMTQwelwiLz48L2c+PC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFxuYDxzdmcgdmlld0JveD1cIjAgMCAyMCAyMFwiIGNsYXNzPVwibGluZVwiIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHgxPVwiNVwiIHkxPVwiMTBcIiB4Mj1cIjIwXCIgeTI9XCIxMFwiIHN0cm9rZT1cImJsYWNrXCIgc3Ryb2tlLXdpZHRoPVwiNVwiLz5cbjwvc3ZnPmBcbiIsIm1vZHVsZS5leHBvcnRzID0gYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHZpZXdCb3g9XCIwIDAgNTkxLjUyIDkxOS40MVwiPjxkZWZzPjxzdHlsZT4uY2xzLTEsLmNscy01e2ZpbGw6IzIzMWYyMDt9LmNscy0xLC5jbHMtMntmaWxsLXJ1bGU6ZXZlbm9kZDt9LmNscy0ye2ZpbGw6dXJsKCNOZXdfR3JhZGllbnQpO30uY2xzLTN7Zm9udC1zaXplOjI0NS41cHg7Zm9udC1mYW1pbHk6SW1wYWN0LCBJbXBhY3Q7fS5jbHMtMywuY2xzLTR7ZmlsbDojZmZmO30uY2xzLTV7Zm9udC1zaXplOjU0Ljg5cHg7Zm9udC1mYW1pbHk6QXZlbmlyTmV4dC1SZWd1bGFyLCBBdmVuaXIgTmV4dDtsZXR0ZXItc3BhY2luZzowLjRlbTt9LmNscy02e2xldHRlci1zcGFjaW5nOjAuMzhlbTt9LmNscy03e2xldHRlci1zcGFjaW5nOjAuNGVtO308L3N0eWxlPjxsaW5lYXJHcmFkaWVudCBpZD1cIk5ld19HcmFkaWVudFwiIHgxPVwiLTE5NC42NVwiIHkxPVwiOTk0Ljg4XCIgeDI9XCItMTk0LjY1XCIgeTI9XCIxMDYwLjkyXCIgZ3JhZGllbnRUcmFuc2Zvcm09XCJ0cmFuc2xhdGUoMTk0Mi4yNyAtODIxMC4xNCkgc2NhbGUoOC41KVwiIGdyYWRpZW50VW5pdHM9XCJ1c2VyU3BhY2VPblVzZVwiPjxzdG9wIG9mZnNldD1cIjAuMzFcIiBzdG9wLWNvbG9yPVwiIzI5ODZhNVwiLz48c3RvcCBvZmZzZXQ9XCIwLjY5XCIgc3RvcC1jb2xvcj1cIiMxYzcwOGNcIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHRpdGxlPkFzc2V0IDI8L3RpdGxlPjxnIGlkPVwiTGF5ZXJfMlwiIGRhdGEtbmFtZT1cIkxheWVyIDJcIj48ZyBpZD1cIkxheWVyXzEtMlwiIGRhdGEtbmFtZT1cIkxheWVyIDFcIj48cGF0aCBjbGFzcz1cImNscy0xXCIgZD1cIk00NzguNzgsMjQ1LjU1QzM1OC4xNiwyMDUuODMsMzYzLDUwLjEzLDE1Mi40MiwwYzEzLjgsNDkuMzYsMjIuNDksNzcuMTUsMjguODIsMTI4Ljc4bDUxLjUyLDUuNjhjLTI2LDYuNzYtNTEuNDEsOC40OS01NS42OCwzMi41NC0xMi4zNiw3MC4zOC01OC4xNyw1OS4zMS04MS45NCw4MS41MmExMjUuOSwxMjUuOSwwLDAsMCwyMC4yOCwxLjYyLDEyMS41MiwxMjEuNTIsMCwwLDAsMzYuODMtNS42NmwwLC4xQTEyMS41NiwxMjEuNTYsMCwwLDAsMTg1LjU2LDIyOGwxNS44NC0xMS4yMUwyMTcuMjUsMjI4YTEyMS40OCwxMjEuNDgsMCwwLDAsMzMuMjcsMTYuNTdsMC0uMWExMjMuNiwxMjMuNiwwLDAsMCw3My42NC4xdi0uMUExMjAuODMsMTIwLjgzLDAsMCwwLDM1Ny40OSwyMjhsMTUuODQtMTEuMjFMMzg5LjE4LDIyOGExMjEuMTgsMTIxLjE4LDAsMCwwLDMzLjI3LDE2LjU3bDAtLjFhMTIxLjQ2LDEyMS40NiwwLDAsMCwzNi44Miw1LjY2LDEyNC40NSwxMjQuNDUsMCwwLDAsMTcuNDgtMS4yNCw1LjEyLDUuMTIsMCwwLDAsMi0zLjM2WlwiLz48cGF0aCBjbGFzcz1cImNscy0yXCIgZD1cIk01NzMuOTMsMjY0LjU4VjgxMkgwVjI2OC4yYTE0Ny44LDE0Ny44LDAsMCwwLDMzLjQ0LTE3Ljc3LDE0OSwxNDksMCwwLDAsMTcxLjk0LDAsMTQ5LDE0OSwwLDAsMCwxNzEuOTMsMCwxNDksMTQ5LDAsMCwwLDE3MS45NSwwLDE0OS4xMSwxNDkuMTEsMCwwLDAsMjQuNjcsMTQuMTRaXCIvPjx0ZXh0IGNsYXNzPVwiY2xzLTNcIiB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoNDcuMjUgNzIyLjYyKSBzY2FsZSgwLjgzIDEpXCI+c2hhcms8L3RleHQ+PHBhdGggY2xhc3M9XCJjbHMtNFwiIGQ9XCJNMTkwLjkyLDM2OS44MmwtLjY5LDE0LjA2cTUuMzYtOC41MiwxMS44MS0xMi43M2EyNS4zMiwyNS4zMiwwLDAsMSwxNC4xLTQuMkEyMy40NywyMy40NywwLDAsMSwyMzIuMjcsMzczYTI1LjY5LDI1LjY5LDAsMCwxLDguNDksMTRxMS42OSw3LjkxLDEuNjksMjYuODV2NjdxMCwyMS43LTIuMTMsMzAuODdhMjYsMjYsMCwwLDEtOC43NCwxNC42MywyNC4yMiwyNC4yMiwwLDAsMS0xNS45NCw1LjQ1LDI0LjUyLDI0LjUyLDAsMCwxLTEzLjgtNC4yLDQwLjg3LDQwLjg3LDAsMCwxLTExLjYyLTEyLjQ5djM2LjQ3SDE1MC4xMVYzNjkuODJabTExLjQyLDQ2LjI3cTAtMTQuNzQtLjg5LTE3Ljg2dC01LTMuMTJhNC44NSw0Ljg1LDAsMCwwLTUuMTEsMy42cS0xLjE0LDMuNi0xLjE0LDE3LjM4VjQ4MnEwLDE0LjM4LDEuMTksMThhNC45Myw0LjkzLDAsMCwwLDUuMTYsMy42cTMuODcsMCw0LjgyLTMuM3QuOTQtMTZaXCIvPjxwYXRoIGNsYXNzPVwiY2xzLTRcIiBkPVwiTTI5Mi40OSw0MzEuNDNIMjU0Ljg2VjQyMC43NnEwLTE4LjQ2LDMuNTItMjguNDd0MTQuMTUtMTcuNjhxMTAuNjItNy42NywyNy42LTcuNjcsMjAuMzUsMCwzMC42OCw4LjY5QTM0LjU4LDM0LjU4LDAsMCwxLDM0My4yMywzOTdxMi4wOSwxMi42NSwyLjA4LDUyLjA4djc5Ljg0aC0zOVY1MTQuNzJxLTMuNjcsOC41My05LjQ4LDEyLjc5QTIyLjc4LDIyLjc4LDAsMCwxLDI4Myw1MzEuNzdhMzAsMzAsMCwwLDEtMTkuMzEtNy4xM3EtOC43OS03LjEzLTguNzktMzEuMjNWNDgwLjM0cTAtMTcuODYsNC42Ny0yNC4zM3QyMy4xMy0xNS4xcTE5Ljc2LTkuMzUsMjEuMTUtMTIuNTl0MS4zOS0xMy4xOXEwLTEyLjQ3LTEuNTQtMTYuMjR0LTUuMTEtMy43OHEtNC4wNywwLTUuMDYsMy4xOHQtMSwxNi40OFptMTIuNzEsMjEuODJxLTkuNjMsOC41MS0xMS4xNywxNC4yNnQtMS41NCwxNi41NHEwLDEyLjM1LDEuMzQsMTUuOTRhNS4xNyw1LjE3LDAsMCwwLDUuMzEsMy42cTMuNzcsMCw0LjkyLTIuODJUMzA1LjIsNDg2WlwiLz48cGF0aCBjbGFzcz1cImNscy00XCIgZD1cIk0zOTkuMjMsMzY5LjgybC0xLjU5LDIwLjkycTguNzQtMjIuNDcsMjUuMzItMjMuNzl2NTZxLTExLDAtMTYuMTgsMy42YTE1LjA2LDE1LjA2LDAsMCwwLTYuMzUsMTBxLTEuMTksNi40MS0xLjE5LDI5LjU1djYyLjgxSDM1OS4xMlYzNjkuODJaXCIvPjxwYXRoIGNsYXNzPVwiY2xzLTRcIiBkPVwiTTUxOC4yNywzNjkuODIsNTAyLDQzMy4xN2wyMS4xNSw5NS43Mkg0ODQuNTZsLTEyLjUxLTY5LjMzLDAsNjkuMzNINDMxLjg5VjMzNC44Mkg0NzJsMCw4MS40NywxMi41MS00Ni40N1pcIi8+PHRleHQgY2xhc3M9XCJjbHMtNVwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgwLjcxIDg5Ni44NSlcIj5zdG9wIGNpPHRzcGFuIGNsYXNzPVwiY2xzLTZcIiB4PVwiMzE4LjczXCIgeT1cIjBcIj5yPC90c3Bhbj48dHNwYW4gY2xhc3M9XCJjbHMtN1wiIHg9XCIzNTkuNDZcIiB5PVwiMFwiPmNsaW5nPC90c3Bhbj48L3RleHQ+PC9nPjwvZz48L3N2Zz5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGVyciA9PiB7IGNvbnNvbGUubG9nKCBlcnIuc3RhY2sgfHwgZXJyICkgfVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICBFcnJvcjogcmVxdWlyZSgnLi9NeUVycm9yJyksXG5cbiAgICBQOiAoIGZ1biwgYXJncz1bIF0sIHRoaXNBcmcgKSA9PlxuICAgICAgICBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiBSZWZsZWN0LmFwcGx5KCBmdW4sIHRoaXNBcmcgfHwgdGhpcywgYXJncy5jb25jYXQoICggZSwgLi4uY2FsbGJhY2sgKSA9PiBlID8gcmVqZWN0KGUpIDogcmVzb2x2ZShjYWxsYmFjaykgKSApICksXG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7IHJldHVybiB0aGlzIH1cbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgICBpZiAoaXNGdW5jdGlvbihldmxpc3RlbmVyKSlcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGV2bGlzdGVuZXIpXG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiJdfQ==
