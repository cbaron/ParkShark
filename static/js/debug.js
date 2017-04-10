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

        //this.els.container.addEventListener( 'mousedown',  e => this.onSwipeStart(e), false )
        this.els.container.addEventListener('touchstart', function (e) {
            return _this.onSwipeStart(e);
        }, false);
        //this.els.container.addEventListener( 'mouseup', e => this.onSwipeEnd(e), false )
        this.els.container.addEventListener('touchend', function (e) {
            return _this.onSwipeEnd(e);
        }, false);

        //this.els.container.addEventListener( 'touchmove', e => e.stopImmediatePropagation(), { passive: false } )
        //this.els.container.addEventListener( 'mousemove', e => e.stopImmediatePropagation(), { passive: false } )

        //this.els.image.addEventListener( 'touchmove', e => e.preventDefault(), { passive: false } )
        //this.els.image.addEventListener( 'mousemove', e => e.preventDefault(), { passive: false } )
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

            datum.directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });

            datum.directions = new Promise(function (resolve) {
                _this2.directionsService.route({
                    origin: _this2.origin,
                    destination: datum.mapLocation,
                    travelMode: 'DRIVING',
                    unitSystem: google.maps.UnitSystem.IMPERIAL
                }, function (result, status) {
                    if (status === 'OK') {
                        datum.directionsDisplay.setDirections(result);
                        datum.distance = result.routes[0].legs[0].distance.text + ' away';
                        resolve();
                    } else {
                        console.log(status);
                    }
                });
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

        return data.directions.then(function () {
            _this7.els.distance.textContent = data.distance;
            return Promise.resolve(data.directionsDisplay.setMap(_this7.map));
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
            window.requestAnimationFrame(function () {
                return _this8.els.container.classList.remove('slide-in-left', 'slide-in-right');
            });
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
                window.requestAnimationFrame(function () {
                    return _this8.els.container.classList.add('slide-in-' + swipe);
                });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzL1hoci5qcyIsImNsaWVudC9qcy9mYWN0b3J5L1ZpZXcuanMiLCJjbGllbnQvanMvbWFpbi5qcyIsImNsaWVudC9qcy9yb3V0ZXIuanMiLCJjbGllbnQvanMvdmlld3MvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy9TbmFnLmpzIiwiY2xpZW50L2pzL3ZpZXdzL19fcHJvdG9fXy5qcyIsImNsaWVudC9qcy92aWV3cy9saWIvT3B0aW1pemVkUmVzaXplLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9Ib21lLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9TbmFnLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvY2xvdWQuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9jdXJzb3IuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9kb3QuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9pbmZvLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvbGluZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvbGliL2xvZ28uanMiLCJsaWIvTXlFcnJvci5qcyIsImxpYi9NeU9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLE9BQU0sUUFBUSx3QkFBUixDQURRO0FBRWQsT0FBTSxRQUFRLHdCQUFSO0FBRlEsQ0FBZjs7Ozs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLE9BQU0sUUFBUSxjQUFSLENBRFE7QUFFZCxPQUFNLFFBQVEsY0FBUjtBQUZRLENBQWY7Ozs7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9Ib21lJyksXG5cdFNuYWc6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL1NuYWcnKVxufSIsIm1vZHVsZS5leHBvcnRzPXtcblx0SG9tZTogcmVxdWlyZSgnLi92aWV3cy9Ib21lJyksXG5cdFNuYWc6IHJlcXVpcmUoJy4vdmlld3MvU25hZycpXG59IiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi4vLi4vbGliL015T2JqZWN0JyksIHtcblxuICAgIFJlcXVlc3Q6IHtcblxuICAgICAgICBjb25zdHJ1Y3RvciggZGF0YSApIHtcbiAgICAgICAgICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG4gICAgICAgICAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBbIDUwMCwgNDA0LCA0MDEgXS5pbmNsdWRlcyggdGhpcy5zdGF0dXMgKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZWplY3QoIHRoaXMucmVzcG9uc2UgKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiByZXNvbHZlKCBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2UpIClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggZGF0YS5tZXRob2QgPT09IFwiZ2V0XCIgfHwgZGF0YS5tZXRob2QgPT09IFwib3B0aW9uc1wiICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcXMgPSBkYXRhLnFzID8gYD8ke2RhdGEucXN9YCA6ICcnIFxuICAgICAgICAgICAgICAgICAgICByZXEub3BlbiggZGF0YS5tZXRob2QsIGRhdGEudXJsIHx8IGAvJHtkYXRhLnJlc291cmNlfSR7cXN9YCApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SGVhZGVycyggcmVxLCBkYXRhLmhlYWRlcnMgKVxuICAgICAgICAgICAgICAgICAgICByZXEuc2VuZChudWxsKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5vcGVuKCBkYXRhLm1ldGhvZCwgYC8ke2RhdGEucmVzb3VyY2V9YCwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKCBkYXRhLmRhdGEgKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9LFxuXG4gICAgICAgIHBsYWluRXNjYXBlKCBzVGV4dCApIHtcbiAgICAgICAgICAgIC8qIGhvdyBzaG91bGQgSSB0cmVhdCBhIHRleHQvcGxhaW4gZm9ybSBlbmNvZGluZz8gd2hhdCBjaGFyYWN0ZXJzIGFyZSBub3QgYWxsb3dlZD8gdGhpcyBpcyB3aGF0IEkgc3VwcG9zZS4uLjogKi9cbiAgICAgICAgICAgIC8qIFwiNFxcM1xcNyAtIEVpbnN0ZWluIHNhaWQgRT1tYzJcIiAtLS0tPiBcIjRcXFxcM1xcXFw3XFwgLVxcIEVpbnN0ZWluXFwgc2FpZFxcIEVcXD1tYzJcIiAqL1xuICAgICAgICAgICAgcmV0dXJuIHNUZXh0LnJlcGxhY2UoL1tcXHNcXD1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRIZWFkZXJzKCByZXEsIGhlYWRlcnM9e30gKSB7XG4gICAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlciggXCJBY2NlcHRcIiwgaGVhZGVycy5hY2NlcHQgfHwgJ2FwcGxpY2F0aW9uL2pzb24nIClcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCBcIkNvbnRlbnQtVHlwZVwiLCBoZWFkZXJzLmNvbnRlbnRUeXBlIHx8ICd0ZXh0L3BsYWluJyApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2ZhY3RvcnkoIGRhdGEgKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKCB0aGlzLlJlcXVlc3QsIHsgfSApLmNvbnN0cnVjdG9yKCBkYXRhIClcbiAgICB9LFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgaWYoICFYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2VuZEFzQmluYXJ5ICkge1xuICAgICAgICAgIFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgPSBmdW5jdGlvbihzRGF0YSkge1xuICAgICAgICAgICAgdmFyIG5CeXRlcyA9IHNEYXRhLmxlbmd0aCwgdWk4RGF0YSA9IG5ldyBVaW50OEFycmF5KG5CeXRlcyk7XG4gICAgICAgICAgICBmb3IgKHZhciBuSWR4ID0gMDsgbklkeCA8IG5CeXRlczsgbklkeCsrKSB7XG4gICAgICAgICAgICAgIHVpOERhdGFbbklkeF0gPSBzRGF0YS5jaGFyQ29kZUF0KG5JZHgpICYgMHhmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VuZCh1aThEYXRhKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZhY3RvcnkuYmluZCh0aGlzKVxuICAgIH1cblxufSApLCB7IH0gKS5jb25zdHJ1Y3RvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGNyZWF0ZSggbmFtZSwgb3B0cyApIHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBuYW1lXG4gICAgICAgIG5hbWUgPSBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKVxuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShcbiAgICAgICAgICAgIHRoaXMuVmlld3NbIG5hbWUgXSxcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oIHtcbiAgICAgICAgICAgICAgICBuYW1lOiB7IHZhbHVlOiBuYW1lIH0sXG4gICAgICAgICAgICAgICAgZmFjdG9yeTogeyB2YWx1ZTogdGhpcyB9LFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB7IHZhbHVlOiB0aGlzLlRlbXBsYXRlc1sgbmFtZSBdIH0sXG4gICAgICAgICAgICAgICAgdXNlcjogeyB2YWx1ZTogdGhpcy5Vc2VyIH1cbiAgICAgICAgICAgICAgICB9LCBvcHRzIClcbiAgICAgICAgKS5jb25zdHJ1Y3RvcigpXG4gICAgICAgIC5vbiggJ25hdmlnYXRlJywgcm91dGUgPT4gcmVxdWlyZSgnLi4vcm91dGVyJykubmF2aWdhdGUoIHJvdXRlICkgKVxuICAgICAgICAub24oICdkZWxldGVkJywgKCkgPT4gZGVsZXRlIChyZXF1aXJlKCcuLi9yb3V0ZXInKSkudmlld3NbbmFtZV0gKVxuICAgIH0sXG5cbn0sIHtcbiAgICBUZW1wbGF0ZXM6IHsgdmFsdWU6IHJlcXVpcmUoJy4uLy5UZW1wbGF0ZU1hcCcpIH0sXG4gICAgVmlld3M6IHsgdmFsdWU6IHJlcXVpcmUoJy4uLy5WaWV3TWFwJykgfVxufSApXG4iLCJ3aW5kb3cuaW5pdE1hcCA9ICgpID0+IHRydWVcbndpbmRvdy5vbmxvYWQgPSAoKSA9PiByZXF1aXJlKCcuL3JvdXRlcicpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIEVycm9yOiByZXF1aXJlKCcuLi8uLi9saWIvTXlFcnJvcicpLFxuICAgIFxuICAgIFZpZXdGYWN0b3J5OiByZXF1aXJlKCcuL2ZhY3RvcnkvVmlldycpLFxuICAgIFxuICAgIFZpZXdzOiByZXF1aXJlKCcuLy5WaWV3TWFwJyksXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb250ZW50Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlbnQnKVxuXG4gICAgICAgIHdpbmRvdy5vbnBvcHN0YXRlID0gdGhpcy5oYW5kbGUuYmluZCh0aGlzKVxuXG4gICAgICAgIHRoaXMuaGFuZGxlKClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBoYW5kbGUoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlciggd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoMSkgKVxuICAgIH0sXG5cbiAgICBoYW5kbGVyKCBwYXRoICkge1xuICAgICAgICBjb25zdCBuYW1lID0gcGF0aFswXSA/IHBhdGhbMF0uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwYXRoWzBdLnNsaWNlKDEpIDogJycsXG4gICAgICAgICAgICAgIHZpZXcgPSB0aGlzLlZpZXdzW25hbWVdID8gcGF0aFswXSA6ICdob21lJztcblxuICAgICAgICAoICggdmlldyA9PT0gdGhpcy5jdXJyZW50VmlldyApXG4gICAgICAgICAgICA/IFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICA6IFByb21pc2UuYWxsKCBPYmplY3Qua2V5cyggdGhpcy52aWV3cyApLm1hcCggdmlldyA9PiB0aGlzLnZpZXdzWyB2aWV3IF0uaGlkZSgpICkgKSApIFxuICAgICAgICAudGhlbiggKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmlld1xuXG4gICAgICAgICAgICBpZiggdGhpcy52aWV3c1sgdmlldyBdICkgcmV0dXJuIHRoaXMudmlld3NbIHZpZXcgXS5uYXZpZ2F0ZSggcGF0aCApXG5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1sgdmlldyBdID1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5WaWV3RmFjdG9yeS5jcmVhdGUoIHZpZXcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5jb250ZW50Q29udGFpbmVyIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHsgdmFsdWU6IHBhdGgsIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICApXG4gICAgICAgIH0gKVxuICAgICAgICAuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgIH0sXG5cbiAgICBuYXZpZ2F0ZSggbG9jYXRpb24gKSB7XG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKCB7fSwgJycsIGxvY2F0aW9uIClcbiAgICAgICAgdGhpcy5oYW5kbGUoKVxuICAgIH1cblxufSwgeyBjdXJyZW50VmlldzogeyB2YWx1ZTogJycsIHdyaXRhYmxlOiB0cnVlIH0sIHZpZXdzOiB7IHZhbHVlOiB7IH0gfSB9ICkuY29uc3RydWN0b3IoKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgcG9zdFJlbmRlcigpIHtcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4gdGhpcy5oaWRlKCkudGhlbiggKCkgPT4gdGhpcy5lbWl0KCAnbmF2aWdhdGUnLCAnc25hZycgKSApLmNhdGNoKCB0aGlzLkVycm9yICksIDIwMDAgKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIHNuYWc6ICdjbGljaydcbiAgICB9LFxuXG4gICAgb25TbmFnQ2xpY2soKSB7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5kYXRhWyB0aGlzLmN1cnJlbnRTcG90IF0ubWFwTG9jYXRpb25cblxuICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBgd2F6ZTovLz9sbD0ke2xvY2F0aW9uLmxhdH0sJHtsb2NhdGlvbi5sbmd9Jm5hdmlnYXRlPXllc2BcbiAgICB9LFxuXG4gICAgYmluZFN3aXBlKCkge1xuICAgICAgICB0aGlzLnN3aXBlVGltZSA9IDEwMDBcbiAgICAgICAgdGhpcy5taW5YID0gMzBcbiAgICAgICAgdGhpcy5tYXhZID0gMzBcblxuICAgICAgICAvL3RoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgIGUgPT4gdGhpcy5vblN3aXBlU3RhcnQoZSksIGZhbHNlIClcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgZSA9PiB0aGlzLm9uU3dpcGVTdGFydChlKSwgZmFsc2UgKVxuICAgICAgICAvL3RoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIGUgPT4gdGhpcy5vblN3aXBlRW5kKGUpLCBmYWxzZSApXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBlID0+IHRoaXMub25Td2lwZUVuZChlKSwgZmFsc2UgKVxuXG4gICAgICAgIC8vdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBlID0+IGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCksIHsgcGFzc2l2ZTogZmFsc2UgfSApXG4gICAgICAgIC8vdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBlID0+IGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCksIHsgcGFzc2l2ZTogZmFsc2UgfSApXG5cbiAgICAgICAgLy90aGlzLmVscy5pbWFnZS5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgZSA9PiBlLnByZXZlbnREZWZhdWx0KCksIHsgcGFzc2l2ZTogZmFsc2UgfSApXG4gICAgICAgIC8vdGhpcy5lbHMuaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIGUgPT4gZS5wcmV2ZW50RGVmYXVsdCgpLCB7IHBhc3NpdmU6IGZhbHNlIH0gKVxuICAgIH0sXG5cbiAgICBnZXRUZW1wbGF0ZU9wdGlvbnMoKSB7IHJldHVybiB0aGlzLmRhdGEgfSxcblxuICAgIGRhdGE6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTY0OTUwLCBsbmc6IC03NS4xOTI1ODM3ICB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgQycsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ0hvdXJseS9Qcml2YXRlIExvdCcsXG4gICAgICAgICAgICAgICAgJzUvNjAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICckMy9ociAwLTMgaG91cnMnLFxuICAgICAgICAgICAgICAgICczLTVociBtYXggdGltZSBpcyAkMTQuMDAnLFxuICAgICAgICAgICAgICAgICdvcGVuIDI0IGhycydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZXM6IFsgJ2xvdF9jJywgOCwgOSwgMTAsIDExLCA0OSBdLFxuICAgICAgICAgICAgdHlwZTogJ2xvdCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTkzMjA5LCBsbmc6IC03NS4xOTIwOTA3IH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBEJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBMb3QnLFxuICAgICAgICAgICAgICAgICcxLzYwIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdsb3RfZCcsIDQ1IF0sXG4gICAgICAgICAgICB0eXBlOiAnbG90J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1OTkyNTYsIGxuZzogLTc1LjE4ODk5NTAgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IEgnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIExvdCcsXG4gICAgICAgICAgICAgICAgJzMvMTAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZXM6IFsgJ2xvdF9oJywgNCwgMTUsIDI2IF0sXG4gICAgICAgICAgICB0eXBlOiAnbG90J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1ODMwNDUsIGxuZzogLTc1LjE4ODgyMzU5IH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBKJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBMb3QnLFxuICAgICAgICAgICAgICAgICc0LzExIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdsb3RfaicsIDEsIDIsIDMsIDQgXSxcbiAgICAgICAgICAgIHR5cGU6ICdsb3QnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU3NTU4NywgbG5nOiAtNzUuMTkzNDA5NSB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgSycsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgTG90JyxcbiAgICAgICAgICAgICAgICAnMS8yMTAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZXM6IFsgJ2xvdF9rJywgMTE1IF0sXG4gICAgICAgICAgICB0eXBlOiAnbG90J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1NjMyOTMsIGxuZzogLTc1LjE5MTE5NDkgfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IFAnLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIExvdCcsXG4gICAgICAgICAgICAgICAgJzUvOSBzcG90cydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgICAgICAgJ1Blcm1pdCBPbmx5J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltYWdlczogWyAnbG90X3AnLCAxLCAyLCAzLCA0LCA1IF0sXG4gICAgICAgICAgICB0eXBlOiAnbG90J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2NhdGlvbjogeyBsYXQ6IDM5Ljk1Nzk5MDIsIGxuZzogLTc1LjE5MDE2NTggfSxcbiAgICAgICAgICAgIG5hbWU6ICdEcmV4ZWwgTG90IFInLFxuICAgICAgICAgICAgY29udGV4dDogW1xuICAgICAgICAgICAgICAgICdQcml2YXRlIExvdCcsXG4gICAgICAgICAgICAgICAgJzEvMjQgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZXM6IFsgJ2xvdF9yJywgMjAgXSxcbiAgICAgICAgICAgIHR5cGU6ICdsb3QnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU2ODE1NCwgbG5nOiAtNzUuMTg3MjY2OSB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBMb3QgUycsXG4gICAgICAgICAgICBjb250ZXh0OiBbXG4gICAgICAgICAgICAgICAgJ1ByaXZhdGUgTG90JyxcbiAgICAgICAgICAgICAgICAnMy8yNDAgc3BvdHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGV0YWlsczogW1xuICAgICAgICAgICAgICAgICdQZXJtaXQgT25seSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZXM6IFsgJ2xvdF9zJywgNzEsIDcyLCA3MyBdLFxuICAgICAgICAgICAgdHlwZTogJ2xvdCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWFwTG9jYXRpb246IHsgbGF0OiAzOS45NTc4NzgyLCBsbmc6IC03NS4xODgyODAzIH0sXG4gICAgICAgICAgICBuYW1lOiAnRHJleGVsIExvdCBUJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHJpdmF0ZSBMb3QnLFxuICAgICAgICAgICAgICAgICcyLzE5IHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnUGVybWl0IE9ubHknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdsb3RfdCcsIDIsIDQgXSxcbiAgICAgICAgICAgIHR5cGU6ICdsb3QnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1hcExvY2F0aW9uOiB7IGxhdDogMzkuOTU0NTY4OCwgbG5nOiAtNzUuMTkxNTkwMiB9LFxuICAgICAgICAgICAgbmFtZTogJ0RyZXhlbCBQYXJraW5nIFNlcnZpY2VzJyxcbiAgICAgICAgICAgIGNvbnRleHQ6IFtcbiAgICAgICAgICAgICAgICAnUHVibGljIFBhcmtpbmcgU3RydWN0dXJlJyxcbiAgICAgICAgICAgICAgICAnODgvODAzIHNwb3RzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgICAgICAgICAnJDEzL2hvdXInXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW1hZ2VzOiBbICdvZmZjYW1wdXNzdHJ1Y3R1cmUnIF0sXG4gICAgICAgICAgICB0eXBlOiAnZ2FyYWdlJ1xuICAgICAgICB9XG4gICAgXSxcblxuICAgIGluaXRNYXAoKSB7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uc1NlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1NlcnZpY2UoKVxuXG4gICAgICAgIHRoaXMubWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCggdGhpcy5lbHMubWFwLCB7XG4gICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxuICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcbiAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBuYXZpZ2F0aW9uQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXG4gICAgICAgICAgICBuYXZpZ2F0aW9uQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICBtYXBUeXBlQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxuICAgICAgICAgICAgc2NhbGVDb250cm9sOiBmYWxzZVxuICAgICAgICAgICAgLy96b29tOiAxNVxuICAgICAgICB9IClcblxuICAgICAgICB0aGlzLm9yaWdpbiA9IHsgbGF0OiAzOS45NTYxMzUsIGxuZzogLTc1LjE5MDY5MyB9XG5cbiAgICAgICAgY29uc3QgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigge1xuICAgICAgICAgICAgcG9zaXRpb246IHRoaXMub3JpZ2luLFxuICAgICAgICAgICAgaWNvbjoge1xuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJyMwMDdhZmYnLFxuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAxLFxuICAgICAgICAgICAgICAgIHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFLFxuICAgICAgICAgICAgICAgIHNjYWxlOiA3LFxuICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICAgIHN0cm9rZU9wYWNpdHk6IC44LFxuICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogM1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1hcDogdGhpcy5tYXBcbiAgICAgICAgfSApXG5cbiAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goIGRhdHVtID0+IHtcbiAgICAgICAgICAgIGRhdHVtLm1hcmtlciA9XG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogZGF0dW0ubWFwTG9jYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXR1bS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIGAvc3RhdGljL2ltZy8ke2RhdHVtLnR5cGV9LnBuZ2BcbiAgICAgICAgICAgICAgICB9IClcblxuICAgICAgICAgICAgZGF0dW0uZGlyZWN0aW9uc0Rpc3BsYXkgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1JlbmRlcmVyKCB7IHN1cHByZXNzTWFya2VyczogdHJ1ZSB9IClcblxuICAgICAgICAgICAgZGF0dW0uZGlyZWN0aW9ucyA9IG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvbnNTZXJ2aWNlLnJvdXRlKCB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbjogdGhpcy5vcmlnaW4sXG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uOiBkYXR1bS5tYXBMb2NhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgdHJhdmVsTW9kZTogJ0RSSVZJTkcnLFxuICAgICAgICAgICAgICAgICAgICB1bml0U3lzdGVtOiBnb29nbGUubWFwcy5Vbml0U3lzdGVtLklNUEVSSUFMXG4gICAgICAgICAgICAgICAgfSwgKCByZXN1bHQsIHN0YXR1cyApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIHN0YXR1cyA9PT0gJ09LJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdHVtLmRpcmVjdGlvbnNEaXNwbGF5LnNldERpcmVjdGlvbnMocmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0dW0uZGlzdGFuY2UgPSBgJHtyZXN1bHQucm91dGVzWzBdLmxlZ3NbMF0uZGlzdGFuY2UudGV4dH0gYXdheWBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgeyBjb25zb2xlLmxvZyggc3RhdHVzICkgfVxuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgfSApXG4gICAgICAgIH0gKVxuXG4gICAgICAgIHRoaXMuZWxzLnBhZ2VVaS5jaGlsZHJlblsgMCBdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgICAgICAgdGhpcy51cGRhdGluZyA9IHRydWVcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgICAudGhlbiggKCkgPT4gUHJvbWlzZS5yZXNvbHZlKCB0aGlzLnVwZGF0aW5nID0gZmFsc2UgKSApXG4gICAgICAgIC5jYXRjaCggdGhpcy5FcnJvciApXG5cbiAgICB9LFxuXG4gICAgb25Td2lwZVN0YXJ0KCBlICkge1xuICAgICAgICBlID0gKCdjaGFuZ2VkVG91Y2hlcycgaW4gZSkgPyBlLmNoYW5nZWRUb3VjaGVzWzBdIDogZVxuICAgICAgICB0aGlzLnRvdWNoU3RhcnRDb29yZHMgPSB7IHg6IGUucGFnZVgsIHkgOmUucGFnZVkgfVxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgfSxcbiAgICBcbiAgICBvblN3aXBlRW5kKCBlICkge1xuICAgICAgICBlID0gKCdjaGFuZ2VkVG91Y2hlcycgaW4gZSkgPyBlLmNoYW5nZWRUb3VjaGVzWzBdIDogZVxuICAgICAgICB0aGlzLnRvdWNoRW5kQ29vcmRzID0geyB4OiBlLnBhZ2VYIC0gdGhpcy50b3VjaFN0YXJ0Q29vcmRzLngsIHkgOmUucGFnZVkgLSB0aGlzLnRvdWNoU3RhcnRDb29yZHMueSB9XG4gICAgICAgIHRoaXMuZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRoaXMuc3RhcnRUaW1lXG5cbiAgICAgICAgaWYoIHRoaXMuZWxhcHNlZFRpbWUgPD0gdGhpcy5zd2lwZVRpbWUgKSB7XG4gICAgICAgICAgICBpZiggTWF0aC5hYnModGhpcy50b3VjaEVuZENvb3Jkcy54KSA+PSB0aGlzLm1pblggJiYgTWF0aC5hYnModGhpcy50b3VjaEVuZENvb3Jkcy55KSA8PSB0aGlzLm1heFkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b3VjaEVuZENvb3Jkcy54IDwgMCA/IHRoaXMub25Td2lwZUxlZnQoKSA6IHRoaXMub25Td2lwZVJpZ2h0KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRPZmZzZXRUb3AoIGVsICkge1xuICAgICAgICBsZXQgdG9wID0gMFxuICAgICAgICBkbyB7XG4gICAgICAgICAgaWYgKCAhaXNOYU4oIGVsLm9mZnNldFRvcCApICkgeyB0b3AgKz0gZWwub2Zmc2V0VG9wIH1cbiAgICAgICAgfSB3aGlsZSggZWwgPSBlbC5vZmZzZXRQYXJlbnQgKVxuICAgICAgICByZXR1cm4gdG9wXG4gICAgfSxcblxuICAgIGlzRXhwYW5kZWQoKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW5uZXJIZWlnaHQgKyB3aW5kb3cuZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgPiB0aGlzLmdldE9mZnNldFRvcCggdGhpcy5lbHMuaW1hZ2UgKVxuICAgIH0sXG5cbiAgICBzd2lwZUltYWdlKCBkaXJlY3Rpb24gKSB7XG4gICAgICAgIGNvbnN0IGRhdHVtID0gdGhpcy5kYXRhWyB0aGlzLmN1cnJlbnRTcG90IF1cblxuICAgICAgICBsZXQgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxuXG4gICAgICAgIGltYWdlLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxzLmltYWdlLnNyYyA9IGltYWdlLnNyY1xuICAgICAgICAgICAgLy90aGlzLmVscy5pbWFnZS5jbGFzc0xpc3QucmVtb3ZlKCAnaGlkZScgKVxuICAgICAgICAgICAgLy93aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiAgdGhpcy5lbHMuaW1hZ2UuY2xhc3NMaXN0LmFkZCggYHNsaWRlLWluLSR7ZGlyZWN0aW9ufWAgKSApXG4gICAgICAgIH1cblxuICAgICAgICBpZiggIWRhdHVtLmltYWdlSW5kZXggKSBkYXR1bS5pbWFnZUluZGV4ID0gMFxuXG4gICAgICAgIGRhdHVtLmltYWdlSW5kZXggPVxuICAgICAgICAgICAgZGlyZWN0aW9uID09PSAnbGVmdCdcbiAgICAgICAgICAgICAgICA/IGRhdHVtLmltYWdlc1sgZGF0dW0uaW1hZ2VJbmRleCArIDEgXVxuICAgICAgICAgICAgICAgICAgICA/IGRhdHVtLmltYWdlSW5kZXggKyAxXG4gICAgICAgICAgICAgICAgICAgIDogMFxuICAgICAgICAgICAgICAgIDogZGF0dW0uaW1hZ2VzWyBkYXR1bS5pbWFnZUluZGV4IC0gMSBdXG4gICAgICAgICAgICAgICAgICAgID8gZGF0dW0uaW1hZ2VJbmRleCAtIDFcbiAgICAgICAgICAgICAgICAgICAgOiBkYXR1bS5pbWFnZXMubGVuZ3RoIC0gMVxuXG4gICAgICAgIC8vdGhpcy5lbHMuaW1hZ2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpXG4gICAgICAgIC8vd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gdGhpcy5lbHMuaW1hZ2UuY2xhc3NMaXN0LnJlbW92ZSggJ3NsaWRlLWluLWxlZnQnLCAnc2xpZGUtaW4tcmlnaHQnICkgKVxuXG4gICAgICAgIGltYWdlLnNyYyA9IHRoaXMuZ2V0SW1hZ2VTcmMoIGRhdHVtLCBkYXR1bS5pbWFnZUluZGV4IClcblxuICAgIH0sXG5cbiAgICBvblN3aXBlTGVmdCgpIHtcbiAgICAgICAgaWYoIHRoaXMuaXNFeHBhbmRlZCgpICkgeyByZXR1cm4gdGhpcy5zd2lwZUltYWdlKCdyaWdodCcpIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0aGlzLnVwZGF0aW5nICkgcmV0dXJuIGZhbHNlXG4gICAgICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlT2xkTWFya2VycygpXG5cbiAgICAgICAgdGhpcy5jdXJyZW50U3BvdCA9IHRoaXMuZGF0YVsgdGhpcy5jdXJyZW50U3BvdCArIDEgXSA/IHRoaXMuY3VycmVudFNwb3QgKyAxIDogMFxuXG4gICAgICAgIHRoaXMudXBkYXRlKCdyaWdodCcpXG4gICAgICAgIC50aGVuKCAoKSA9PiBQcm9taXNlLnJlc29sdmUoIHRoaXMudXBkYXRpbmcgPSBmYWxzZSApIClcbiAgICAgICAgLmNhdGNoKCB0aGlzLkVycm9yIClcbiAgICB9LFxuICAgIFxuICAgIG9uU3dpcGVSaWdodCgpIHtcbiAgICAgICAgaWYoIHRoaXMuaXNFeHBhbmRlZCgpICkgeyByZXR1cm4gdGhpcy5zd2lwZUltYWdlKCdsZWZ0JykgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHRoaXMudXBkYXRpbmcgKSByZXR1cm4gZmFsc2VcbiAgICAgICAgdGhpcy51cGRhdGluZyA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5yZW1vdmVPbGRNYXJrZXJzKClcblxuICAgICAgICB0aGlzLmN1cnJlbnRTcG90ID0gdGhpcy5kYXRhWyB0aGlzLmN1cnJlbnRTcG90IC0gMSBdID8gdGhpcy5jdXJyZW50U3BvdCAtIDEgOiB0aGlzLmRhdGEubGVuZ3RoIC0gMVxuXG4gICAgICAgIHRoaXMudXBkYXRlKCdsZWZ0JylcbiAgICAgICAgLnRoZW4oICgpID0+IFByb21pc2UucmVzb2x2ZSggdGhpcy51cGRhdGluZyA9IGZhbHNlICkgKVxuICAgICAgICAuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgIH0sXG5cbiAgICBwb3N0UmVuZGVyKCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRTcG90ID0gMFxuXG4gICAgICAgIHRoaXMuZWxzLm1hcFdyYXAuc3R5bGUuaGVpZ2h0ID0gYCR7d2luZG93LmlubmVySGVpZ2h0IC0gMTQwfXB4YFxuXG4gICAgICAgIHdpbmRvdy5nb29nbGVcbiAgICAgICAgICAgID8gdGhpcy5pbml0TWFwKClcbiAgICAgICAgICAgIDogd2luZG93LmluaXRNYXAgPSB0aGlzLmluaXRNYXBcblxuICAgICAgICB0aGlzLmJpbmRTd2lwZSgpICAgICAgICBcbiAgICBcbiAgICAgICAgdGhpcy5YaHIoIHsgbWV0aG9kOiAnZ2V0JywgdXJsOiBgaHR0cDovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvd2VhdGhlcj96aXA9MTkxMDQsdXMmQVBQSUQ9ZDVlMTkxZGE5ZTMxYjhmNjQ0MDM3Y2EzMTA2MjgxMDJgIH0gKVxuICAgICAgICAudGhlbiggcmVzcG9uc2UgPT4gdGhpcy5lbHMudGVtcC50ZXh0Q29udGVudCA9IE1hdGgucm91bmQoICggcmVzcG9uc2UubWFpbi50ZW1wICogKDkvNSkgKSAtIDQ1OS42NyApIClcbiAgICAgICAgLmNhdGNoKCBlID0+IHsgY29uc29sZS5sb2coIGUuc3RhY2sgfHwgZSApOyB0aGlzLmVscy50ZW1wLnJlbW92ZSgpIH0gKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHJlbW92ZU9sZE1hcmtlcnMoKSB7XG4gICAgICAgIGNvbnN0IGRhdHVtID0gdGhpcy5kYXRhWyB0aGlzLmN1cnJlbnRTcG90IF1cbiAgICAgICAgZGF0dW0ubWFya2VyLnNldE1hcChudWxsKVxuICAgICAgICBkYXR1bS5kaXJlY3Rpb25zRGlzcGxheS5zZXRNYXAobnVsbClcbiAgICAgICAgdGhpcy5lbHMucGFnZVVpLmNoaWxkcmVuWyB0aGlzLmN1cnJlbnRTcG90IF0uY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKVxuICAgIH0sXG5cbiAgICByZW5kZXJEaXJlY3Rpb25zKCBkYXRhICkge1xuICAgICAgICBpZiggZGF0YS5kaXJlY3Rpb25zRGlzcGxheSApIHtcbiAgICAgICAgICAgIHRoaXMuZWxzLmRpc3RhbmNlLnRleHRDb250ZW50ID0gZGF0YS5kaXN0YW5jZVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggZGF0YS5kaXJlY3Rpb25zRGlzcGxheS5zZXRNYXAoIHRoaXMubWFwICkgKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRhdGEuZGlyZWN0aW9ucy50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVscy5kaXN0YW5jZS50ZXh0Q29udGVudCA9IGRhdGEuZGlzdGFuY2VcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoIGRhdGEuZGlyZWN0aW9uc0Rpc3BsYXkuc2V0TWFwKCB0aGlzLm1hcCApIClcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIHRlbXBsYXRlczoge1xuICAgICAgICBEb3Q6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xpYi9kb3QnKVxuICAgIH0sXG5cbiAgICBnZXRJbWFnZVNyYyggZGF0dW0sIGltYWdlSW5kZXggKSB7XG4gICAgICAgIGNvbnN0IHBhdGggPSB0eXBlb2YgZGF0dW0uaW1hZ2VzWyBpbWFnZUluZGV4IF0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgICA/IGRhdHVtLmltYWdlc1sgaW1hZ2VJbmRleCBdXG4gICAgICAgICAgICA6IGAke2RhdHVtLmltYWdlc1swXX1fc3BvdF8ke2RhdHVtLmltYWdlc1sgaW1hZ2VJbmRleCBdfWBcblxuICAgICAgICByZXR1cm4gYC9zdGF0aWMvaW1nL3Nwb3RzLyR7cGF0aH0uSlBHYFxuICAgIH0sXG5cbiAgICB1cGRhdGUoIHN3aXBlICkge1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5kYXRhWyB0aGlzLmN1cnJlbnRTcG90IF07XG5cbiAgICAgICAgaWYoIHN3aXBlICkge1xuICAgICAgICAgICAgLy90aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCAnc2xpZGUtaW4tbGVmdCcsICdzbGlkZS1pbi1yaWdodCcgKSApXG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLm1hcmtlci5zZXRNYXAoIHRoaXMubWFwIClcbiAgICAgICAgdGhpcy5lbHMucGFnZVVpLmNoaWxkcmVuWyB0aGlzLmN1cnJlbnRTcG90IF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICAgICAgICB0aGlzLmVscy5zcG90TmFtZS50ZXh0Q29udGVudCA9IGRhdGEubmFtZVxuICAgICAgICB0aGlzLmVscy5zcG90Q29udGV4dC5pbm5lckhUTUwgPSBkYXRhLmNvbnRleHQuam9pbiggdGhpcy50ZW1wbGF0ZXMuRG90IClcbiAgICAgICAgdGhpcy5lbHMuZGV0YWlsLmlubmVySFRNTCA9IGRhdGEuZGV0YWlscy5qb2luKCB0aGlzLnRlbXBsYXRlcy5Eb3QgKVxuICAgICAgICB0aGlzLmVscy5pbWFnZS5zcmMgPSB0aGlzLmdldEltYWdlU3JjKCBkYXRhLCBkYXRhLmluZGV4IHx8IDAgKVxuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJEaXJlY3Rpb25zKCBkYXRhIClcbiAgICAgICAgLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgIGlmKCBzd2lwZSApIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCAnaGlkZGVuJyApXG4gICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoIGBzbGlkZS1pbi0ke3N3aXBlfWAgKSApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgfSApXG4gICAgfVxuXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiggeyB9LCByZXF1aXJlKCcuLi8uLi8uLi9saWIvTXlPYmplY3QnKSwgcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwge1xuXG4gICAgT3B0aW1pemVkUmVzaXplOiByZXF1aXJlKCcuL2xpYi9PcHRpbWl6ZWRSZXNpemUnKSxcbiAgICBcbiAgICBYaHI6IHJlcXVpcmUoJy4uL1hocicpLFxuXG4gICAgYmluZEV2ZW50KCBrZXksIGV2ZW50ICkge1xuICAgICAgICB2YXIgZWxzID0gQXJyYXkuaXNBcnJheSggdGhpcy5lbHNbIGtleSBdICkgPyB0aGlzLmVsc1sga2V5IF0gOiBbIHRoaXMuZWxzWyBrZXkgXSBdXG4gICAgICAgIGVscy5mb3JFYWNoKCBlbCA9PiBlbC5hZGRFdmVudExpc3RlbmVyKCBldmVudCB8fCAnY2xpY2snLCBlID0+IHRoaXNbIGBvbiR7dGhpcy5jYXBpdGFsaXplRmlyc3RMZXR0ZXIoa2V5KX0ke3RoaXMuY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGV2ZW50KX1gIF0oIGUgKSApIClcbiAgICB9LFxuXG4gICAgY2FwaXRhbGl6ZUZpcnN0TGV0dGVyOiBzdHJpbmcgPT4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpLFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgaWYoIHRoaXMuc2l6ZSApIHRoaXMuT3B0aW1pemVkUmVzaXplLmFkZCggdGhpcy5zaXplICk7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIHRoaXMsIHsgZWxzOiB7IH0sIHNsdXJwOiB7IGF0dHI6ICdkYXRhLWpzJywgdmlldzogJ2RhdGEtdmlldycgfSwgdmlld3M6IHsgfSB9ICkucmVuZGVyKClcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVFdmVudHMoIGtleSwgZWwgKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHRoaXMuZXZlbnRzW2tleV1cblxuICAgICAgICBpZiggdHlwZSA9PT0gXCJzdHJpbmdcIiApIHsgdGhpcy5iaW5kRXZlbnQoIGtleSwgdGhpcy5ldmVudHNba2V5XSApIH1cbiAgICAgICAgZWxzZSBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5ldmVudHNba2V5XSApICkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbIGtleSBdLmZvckVhY2goIGV2ZW50T2JqID0+IHRoaXMuYmluZEV2ZW50KCBrZXksIGV2ZW50T2JqLmV2ZW50ICkgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnQoIGtleSwgdGhpcy5ldmVudHNba2V5XS5ldmVudCApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVsZXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oaWRlKClcbiAgICAgICAgLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKCB0aGlzLmVscy5jb250YWluZXIgKVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggdGhpcy5lbWl0KCdkZWxldGVkJykgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgZXZlbnRzOiB7fSxcblxuICAgIGdldERhdGEoKSB7XG4gICAgICAgIGlmKCAhdGhpcy5tb2RlbCApIHRoaXMubW9kZWwgPSBPYmplY3QuY3JlYXRlKCB0aGlzLk1vZGVsLCB7IHJlc291cmNlOiB7IHZhbHVlOiB0aGlzLm5hbWUgfSB9IClcblxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlbC5nZXQoKVxuICAgIH0sXG5cbiAgICBnZXRUZW1wbGF0ZU9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICAodGhpcy5tb2RlbCkgPyB0aGlzLm1vZGVsLmRhdGEgOiB7fSAsXG4gICAgICAgICAgICB7IHVzZXI6ICh0aGlzLnVzZXIpID8gdGhpcy51c2VyLmRhdGEgOiB7fSB9LFxuICAgICAgICAgICAgeyBvcHRzOiAodGhpcy50ZW1wbGF0ZU9wdHMpID8gdGhpcy50ZW1wbGF0ZU9wdHMgOiB7fSB9XG4gICAgICAgIClcbiAgICB9LFxuXG4gICAgaGlkZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGlmKCAhZG9jdW1lbnQuYm9keS5jb250YWlucyh0aGlzLmVscy5jb250YWluZXIpIHx8IHRoaXMuaXNIaWRkZW4oKSApIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgICAgIHRoaXMub25IaWRkZW5Qcm94eSA9IGUgPT4gdGhpcy5vbkhpZGRlbihyZXNvbHZlKVxuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgdGhpcy5vbkhpZGRlblByb3h5IClcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRlJylcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIGh0bWxUb0ZyYWdtZW50KCBzdHIgKSB7XG4gICAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIC8vIG1ha2UgdGhlIHBhcmVudCBvZiB0aGUgZmlyc3QgZGl2IGluIHRoZSBkb2N1bWVudCBiZWNvbWVzIHRoZSBjb250ZXh0IG5vZGVcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImRpdlwiKS5pdGVtKDApKVxuICAgICAgICByZXR1cm4gcmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KCBzdHIgKVxuICAgIH0sXG4gICAgXG4gICAgaXNIaWRkZW4oKSB7IHJldHVybiB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKSB9LFxuXG4gICAgb25IaWRkZW4oIHJlc29sdmUgKSB7XG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25IaWRkZW5Qcm94eSApXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxuICAgICAgICByZXNvbHZlKCB0aGlzLmVtaXQoJ2hpZGRlbicpIClcbiAgICB9LFxuXG4gICAgb25Mb2dpbigpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbiggdGhpcywgeyBlbHM6IHsgfSwgc2x1cnA6IHsgYXR0cjogJ2RhdGEtanMnLCB2aWV3OiAnZGF0YS12aWV3JyB9LCB2aWV3czogeyB9IH0gKS5yZW5kZXIoKVxuICAgIH0sXG5cbiAgICBvblNob3duKCByZXNvbHZlICkge1xuICAgICAgICB0aGlzLmVscy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uU2hvd25Qcm94eSApXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB0aGlzLnNpemUoKVxuICAgICAgICByZXNvbHZlKCB0aGlzLmVtaXQoJ3Nob3duJykgKVxuICAgIH0sXG5cbiAgICBzaG93Tm9BY2Nlc3MoKSB7XG4gICAgICAgIGFsZXJ0KFwiTm8gcHJpdmlsZWdlcywgc29uXCIpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7IHJldHVybiB0aGlzIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuc2x1cnBUZW1wbGF0ZSggeyB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXRUZW1wbGF0ZU9wdGlvbnMoKSApLCBpbnNlcnRpb246IHRoaXMuaW5zZXJ0aW9uIH0gKVxuXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB0aGlzLnNpemUoKVxuXG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlclN1YnZpZXdzKClcbiAgICAgICAgICAgICAgICAgICAucG9zdFJlbmRlcigpXG4gICAgfSxcblxuICAgIHJlbmRlclN1YnZpZXdzKCkge1xuICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5WaWV3cyB8fCBbIF0gKS5mb3JFYWNoKCBrZXkgPT4ge1xuICAgICAgICAgICAgaWYoIHRoaXMuVmlld3NbIGtleSBdLmVsICkge1xuICAgICAgICAgICAgICAgIGxldCBvcHRzID0gdGhpcy5WaWV3c1sga2V5IF0ub3B0c1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9wdHMgPSAoIG9wdHMgKVxuICAgICAgICAgICAgICAgICAgICA/IHR5cGVvZiBvcHRzID09PSBcIm9iamVjdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG9wdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIDogb3B0cygpXG4gICAgICAgICAgICAgICAgICAgIDoge31cblxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbIGtleSBdID0gdGhpcy5mYWN0b3J5LmNyZWF0ZSgga2V5LCBPYmplY3QuYXNzaWduKCB7IGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5WaWV3c1sga2V5IF0uZWwsIG1ldGhvZDogJ2luc2VydEJlZm9yZScgfSB9IH0sIG9wdHMgKSApXG4gICAgICAgICAgICAgICAgdGhpcy5WaWV3c1sga2V5IF0uZWwucmVtb3ZlKClcbiAgICAgICAgICAgICAgICB0aGlzLlZpZXdzWyBrZXkgXS5lbCA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBzaG93KCBkdXJhdGlvbiApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMub25TaG93blByb3h5ID0gZSA9PiB0aGlzLm9uU2hvd24ocmVzb2x2ZSlcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25TaG93blByb3h5IClcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSggJ2hpZGRlbicgKVxuICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCAnaGlkZScgKSApXG4gICAgICAgICAgICB9IClcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIHNsdXJwRWwoIGVsICkge1xuICAgICAgICB2YXIga2V5ID0gZWwuZ2V0QXR0cmlidXRlKCB0aGlzLnNsdXJwLmF0dHIgKSB8fCAnY29udGFpbmVyJ1xuXG4gICAgICAgIGlmKCBrZXkgPT09ICdjb250YWluZXInICkgZWwuY2xhc3NMaXN0LmFkZCggdGhpcy5uYW1lIClcblxuICAgICAgICB0aGlzLmVsc1sga2V5IF0gPSBBcnJheS5pc0FycmF5KCB0aGlzLmVsc1sga2V5IF0gKVxuICAgICAgICAgICAgPyB0aGlzLmVsc1sga2V5IF0ucHVzaCggZWwgKVxuICAgICAgICAgICAgOiAoIHRoaXMuZWxzWyBrZXkgXSAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgICAgICA/IFsgdGhpcy5lbHNbIGtleSBdLCBlbCBdXG4gICAgICAgICAgICAgICAgOiBlbFxuXG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLnNsdXJwLmF0dHIpXG5cbiAgICAgICAgaWYoIHRoaXMuZXZlbnRzWyBrZXkgXSApIHRoaXMuZGVsZWdhdGVFdmVudHMoIGtleSwgZWwgKVxuICAgIH0sXG5cbiAgICBzbHVycFRlbXBsYXRlKCBvcHRpb25zICkge1xuICAgICAgICB2YXIgZnJhZ21lbnQgPSB0aGlzLmh0bWxUb0ZyYWdtZW50KCBvcHRpb25zLnRlbXBsYXRlICksXG4gICAgICAgICAgICBzZWxlY3RvciA9IGBbJHt0aGlzLnNsdXJwLmF0dHJ9XWAsXG4gICAgICAgICAgICB2aWV3U2VsZWN0b3IgPSBgWyR7dGhpcy5zbHVycC52aWV3fV1gXG5cbiAgICAgICAgdGhpcy5zbHVycEVsKCBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKCcqJykgKVxuICAgICAgICBmcmFnbWVudC5xdWVyeVNlbGVjdG9yQWxsKCBgJHtzZWxlY3Rvcn0sICR7dmlld1NlbGVjdG9yfWAgKS5mb3JFYWNoKCBlbCA9PlxuICAgICAgICAgICAgKCBlbC5oYXNBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApICkgXG4gICAgICAgICAgICAgICAgPyB0aGlzLnNsdXJwRWwoIGVsIClcbiAgICAgICAgICAgICAgICA6IHRoaXMuVmlld3NbIGVsLmdldEF0dHJpYnV0ZSh0aGlzLnNsdXJwLnZpZXcpIF0uZWwgPSBlbFxuICAgICAgICApXG4gICAgICAgICAgXG4gICAgICAgIG9wdGlvbnMuaW5zZXJ0aW9uLm1ldGhvZCA9PT0gJ2luc2VydEJlZm9yZSdcbiAgICAgICAgICAgID8gb3B0aW9ucy5pbnNlcnRpb24uZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIGZyYWdtZW50LCBvcHRpb25zLmluc2VydGlvbi5lbCApXG4gICAgICAgICAgICA6IG9wdGlvbnMuaW5zZXJ0aW9uLmVsWyBvcHRpb25zLmluc2VydGlvbi5tZXRob2QgfHwgJ2FwcGVuZENoaWxkJyBdKCBmcmFnbWVudCApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgYWRkKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmKCAhdGhpcy5jYWxsYmFja3MubGVuZ3RoICkgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemUpXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spXG4gICAgfSxcblxuICAgIG9uUmVzaXplKCkge1xuICAgICAgIGlmKCB0aGlzLnJ1bm5pbmcgKSByZXR1cm5cblxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICA/IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMucnVuQ2FsbGJhY2tzIClcbiAgICAgICAgICAgIDogc2V0VGltZW91dCggdGhpcy5ydW5DYWxsYmFja3MsIDY2KVxuICAgIH0sXG5cbiAgICBydW5DYWxsYmFja3MoKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0gdGhpcy5jYWxsYmFja3MuZmlsdGVyKCBjYWxsYmFjayA9PiBjYWxsYmFjaygpIClcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2UgXG4gICAgfVxuXG59LCB7IGNhbGxiYWNrczogeyB2YWx1ZTogW10gfSwgcnVubmluZzogeyB2YWx1ZTogZmFsc2UgfSB9ICkuYWRkXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gYDxkaXY+PGRpdj4ke3JlcXVpcmUoJy4vbGliL2xvZ28nKX08L2Rpdj48ZGl2PkZpbmRpbmcgdGhlIGNsb3Nlc3QgcGFya2luZyBzcG90cy4uLnNpdCB0aWdodC48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4ge1xuICAgIGNvbnN0IHBhZ2VVaSA9IHJlcXVpcmUoJy4vbGliL2RvdCcpXG4gICAgcmV0dXJuIGA8ZGl2PlxuICAgICAgICA8ZGl2IGRhdGEtanM9XCJtYXBXcmFwXCIgY2xhc3M9XCJtYXAtd3JhcFwiPlxuICAgICAgICAgICAgPGRpdiBkYXRhLWpzPVwibWFwXCIgY2xhc3M9XCJtYXBcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZW51XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PiR7cmVxdWlyZSgnLi9saWIvaW5mbycpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZW51LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj4ke3JlcXVpcmUoJy4vbGliL2N1cnNvcicpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5mby1tYWluXCI+XG4gICAgICAgICAgICA8ZGl2IGRhdGEtanM9XCJwYWdlVWlcIiBjbGFzcz1cInBhZ2UtdWlcIj5cbiAgICAgICAgICAgICAgICAke0FycmF5LmZyb20oQXJyYXkocC5sZW5ndGgpLmtleXMoKSkubWFwKCAoKSA9PiBwYWdlVWkgKS5qb2luKCcnKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBkYXRhLWpzPVwid2VhdGhlclwiIGNsYXNzPVwid2VhdGhlclwiPlxuICAgICAgICAgICAgICAgIDxzcGFuPiR7cmVxdWlyZSgnLi9saWIvY2xvdWQnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gZGF0YS1qcz1cInRlbXBcIj48L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzbmFnLWFyZWFcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGluZS13cmFwXCI+JHtyZXF1aXJlKCcuL2xpYi9saW5lJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbi1yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInNuYWdcIiBkYXRhLWpzPVwic25hZ1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5TbmFnIFRoaXMgU3BvdDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBkYXRhLWpzPVwiZGlzdGFuY2VcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcG90LWRldGFpbHNcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtanM9XCJzcG90TmFtZVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZXh0XCIgZGF0YS1qcz1cInNwb3RDb250ZXh0XCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRleHRcIiBkYXRhLWpzPVwiZGV0YWlsXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGltZyBkYXRhLWpzPVwiaW1hZ2VcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2PmBcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gXHJcbmA8c3ZnIGNsYXNzPVwiY2xvdWRcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJMYXllcl8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCIgdmlld0JveD1cIjAgMCA0OTYgNDk2XCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ5NiA0OTY7XCIgeG1sOnNwYWNlPVwicHJlc2VydmVcIj5cclxuPGc+XHJcblx0PGc+XHJcblx0XHQ8cGF0aCBkPVwiTTQxMy45NjgsMjMzLjA5NmMtMTAuODMyLTYzLjkyLTY1LjgxNi0xMTEuNTEyLTEzMC45NDQtMTEyLjk2QzI2NS44OCw5MC4zMzYsMjM0LjUzNiw3MiwyMDAsNzJcclxuXHRcdFx0Yy00MC45MzYsMC03Ny4xNjgsMjYuMDk2LTkwLjUyLDY0LjI4OGMtMjAuNjk2LTIuMTQ0LTQwLjIwOCw3LjQ2NC01MS42MjQsMjQuMDU2QzI1LjA4LDE2My40MjQsMCwxOTAuNiwwLDIyNFxyXG5cdFx0XHRjMCwyMC4xMDQsOS40MjQsMzguNjE2LDI1LjA0LDUwLjYxNkM5LjU2OCwyOTAuNDg4LDAsMzEyLjEzNiwwLDMzNmMwLDQ4LjUyLDM5LjQ4LDg4LDg4LDg4aDMxMmM1Mi45MzYsMCw5Ni00My4wNjQsOTYtOTZcclxuXHRcdFx0QzQ5NiwyODAuNDI0LDQ2MC40NjQsMjM5LjkyOCw0MTMuOTY4LDIzMy4wOTZ6IE0xNiwyMjRjMC0yNi4xNDQsMjAuNDk2LTQ3LjE5Miw0Ni42NDgtNDcuOTI4bDQuNDcyLTAuMTI4bDIuMjMyLTMuODcyXHJcblx0XHRcdGM4LjY0OC0xNC45ODQsMjUuNzI4LTIzLjI0LDQzLjg2NC0xOC45Nmw3LjU2LDEuNzkybDItNy41MTJDMTMyLjEwNCwxMTIuNDI0LDE2My44NDgsODgsMjAwLDg4XHJcblx0XHRcdGMyNS44OCwwLDQ5LjU4NCwxMi40MTYsNjQuNDk2LDMyLjk4NGMtNTMuNDk2LDYuMDk2LTk4LjYwOCw0My4yMjQtMTE0LjQ0LDk1LjI4OEMxNDguMDA4LDIxNi4wODgsMTQ1Ljk4NCwyMTYsMTQ0LDIxNlxyXG5cdFx0XHRjLTI0LjAzMiwwLTQ2LjU2LDEyLjE4NC01OS44NTYsMzIuMDhjLTE3LjI3MiwwLjc1Mi0zMy4yNDgsNi41MjgtNDYuNTUyLDE1Ljg2NEMyNC4yLDI1NS4wOTYsMTYsMjQwLjI0LDE2LDIyNHogTTQwMCw0MDhIODhcclxuXHRcdFx0Yy0zOS43MDQsMC03Mi0zMi4yOTYtNzItNzJjMC0zOS43MDQsMzIuMjk2LTcyLDcxLjY4OC03Mi4wMDhsNS41MzYsMC4wNGwyLjMwNC0zLjk5MkMxMDUuNTM2LDI0Mi43NDQsMTI0LjEyLDIzMiwxNDQsMjMyXHJcblx0XHRcdGMzLjM1MiwwLDYuODU2LDAuMzM2LDEwLjQyNCwxLjAwOGw3LjQyNCwxLjRsMS44MjQtNy4zMzZDMTc2Ljk2LDE3My40NDgsMjI0LjgsMTM2LDI4MCwxMzZcclxuXHRcdFx0YzYwLjUxMiwwLDExMS42NzIsNDUuMjgsMTE5LjAwOCwxMDUuMzJsMC41Niw0LjU5MkMzOTkuODQsMjQ5LjI0LDQwMCwyNTIuNiw0MDAsMjU2YzAsNjYuMTY4LTUzLjgzMiwxMjAtMTIwLDEyMHYxNlxyXG5cdFx0XHRjNzQuOTkyLDAsMTM2LTYxLjAwOCwxMzYtMTM2YzAtMi4xMi0wLjE3Ni00LjItMC4yNzItNi4yOTZDNDUyLjQzMiwyNTcuMDg4LDQ4MCwyODkuNzc2LDQ4MCwzMjhDNDgwLDM3Mi4xMTIsNDQ0LjExMiw0MDgsNDAwLDQwOFxyXG5cdFx0XHR6XCIvPlxyXG5cdDwvZz5cclxuPC9nPlxyXG48L3N2Zz5gXHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuYDxzdmcgY2xhc3M9XCJjdXJzb3JcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJMYXllcl8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCIgdmlld0JveD1cIjAgMCA1MTIgNTEyXCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7XCIgeG1sOnNwYWNlPVwicHJlc2VydmVcIj48Zz48cGF0aCBkPVwiTTUwMy44NDIsOC4zMzNjLTAuMDMtMC4wMy0wLjA1NC0wLjA2Mi0wLjA4NC0wLjA5MnMtMC4wNjItMC4wNTQtMC4wOTItMC4wODJjLTcuOTY4LTcuOTAyLTE5LjM5OC0xMC4yNzYtMjkuODYtNi4xODUgTDE3Ljc4OSwxODAuMjgxYy0xMi4wNTYsNC43MTMtMTkuMTE5LDE2LjUxNi0xNy41OCwyOS4zNjdjMS41NDMsMTIuODUyLDExLjE5NiwyMi42NDksMjQuMDIzLDI0LjM3OGwyMjIuODc3LDMwLjA1OCBjMC40MTcsMC4wNTcsMC43NTEsMC4zODksMC44MDgsMC44MDlsMzAuMDU4LDIyMi44NzVjMS43MjksMTIuODI3LDExLjUyNiwyMi40ODIsMjQuMzc4LDI0LjAyMyBjMS4xNzQsMC4xNDEsMi4zMzcsMC4yMDgsMy40ODksMC4yMDhjMTEuNDU4LDAsMjEuNTk0LTYuODM0LDI1Ljg3OC0xNy43ODdMNTEwLjAyOSwzOC4xOSBDNTE0LjExOCwyNy43Myw1MTEuNzQ1LDE2LjMwMiw1MDMuODQyLDguMzMzeiBNMjcuODQ3LDIwNy4yNTNjLTAuNS0wLjA2OC0wLjcyNS0wLjA5Ny0wLjgxMi0wLjgyMSBjLTAuMDg2LTAuNzI0LDAuMTI2LTAuODA4LDAuNTkzLTAuOTg5TDQ1NC4yODIsMzguNjE2TDI1NC43MjcsMjM4LjE3M0MyNTMuNDI2LDIzNy43OTYsMjcuODQ3LDIwNy4yNTMsMjcuODQ3LDIwNy4yNTN6IE0zMDYuNTU4LDQ4NC4zNzNjLTAuMTgyLDAuNDY3LTAuMjU1LDAuNjgyLTAuOTg5LDAuNTkyYy0wLjcyMy0wLjA4Ni0wLjc1NC0wLjMxMy0wLjgyLTAuODFjMCwwLTMwLjU0My0yMjUuNTc5LTMwLjkyLTIyNi44OFx0TDQ3My4zODQsNTcuNzE5TDMwNi41NTgsNDg0LjM3M3pcIi8+XHQ8L2c+PC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFxuYDxzdmcgY2xhc3M9XCJkb3RcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuICA8Y2lyY2xlIGN4PVwiMTBcIiBjeT1cIjEwXCIgcj1cIjEwXCIvPlxuPC9zdmc+YFxuIiwibW9kdWxlLmV4cG9ydHMgPVxyXG5gPHN2ZyBjbGFzcz1cImluZm9cInZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHZpZXdCb3g9XCIwIDAgMzMwIDMzMFwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzMzAgMzMwO1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+PGc+PHBhdGggZD1cIk0xNjUsMEM3NC4wMTksMCwwLDc0LjAyLDAsMTY1LjAwMUMwLDI1NS45ODIsNzQuMDE5LDMzMCwxNjUsMzMwczE2NS03NC4wMTgsMTY1LTE2NC45OTlDMzMwLDc0LjAyLDI1NS45ODEsMCwxNjUsMHogTTE2NSwzMDBjLTc0LjQ0LDAtMTM1LTYwLjU2LTEzNS0xMzQuOTk5QzMwLDkwLjU2Miw5MC41NiwzMCwxNjUsMzBzMTM1LDYwLjU2MiwxMzUsMTM1LjAwMUMzMDAsMjM5LjQ0LDIzOS40MzksMzAwLDE2NSwzMDB6XCIvPjxwYXRoIGQ9XCJNMTY0Ljk5OCw3MGMtMTEuMDI2LDAtMTkuOTk2LDguOTc2LTE5Ljk5NiwyMC4wMDljMCwxMS4wMjMsOC45NywxOS45OTEsMTkuOTk2LDE5Ljk5MWMxMS4wMjYsMCwxOS45OTYtOC45NjgsMTkuOTk2LTE5Ljk5MUMxODQuOTk0LDc4Ljk3NiwxNzYuMDI0LDcwLDE2NC45OTgsNzB6XCIvPjxwYXRoIGQ9XCJNMTY1LDE0MGMtOC4yODQsMC0xNSw2LjcxNi0xNSwxNXY5MGMwLDguMjg0LDYuNzE2LDE1LDE1LDE1YzguMjg0LDAsMTUtNi43MTYsMTUtMTV2LTkwQzE4MCwxNDYuNzE2LDE3My4yODQsMTQwLDE2NSwxNDB6XCIvPjwvZz48L3N2Zz5gXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gXG5gPHN2ZyB2aWV3Qm94PVwiMCAwIDIwIDIwXCIgY2xhc3M9XCJsaW5lXCIgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgICA8bGluZSBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgeDE9XCI1XCIgeTE9XCIxMFwiIHgyPVwiMjBcIiB5Mj1cIjEwXCIgc3Ryb2tlPVwiYmxhY2tcIiBzdHJva2Utd2lkdGg9XCI1XCIvPlxuPC9zdmc+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgdmlld0JveD1cIjAgMCA1OTEuNTIgOTE5LjQxXCI+PGRlZnM+PHN0eWxlPi5jbHMtMSwuY2xzLTV7ZmlsbDojMjMxZjIwO30uY2xzLTEsLmNscy0ye2ZpbGwtcnVsZTpldmVub2RkO30uY2xzLTJ7ZmlsbDp1cmwoI05ld19HcmFkaWVudCk7fS5jbHMtM3tmb250LXNpemU6MjQ1LjVweDtmb250LWZhbWlseTpJbXBhY3QsIEltcGFjdDt9LmNscy0zLC5jbHMtNHtmaWxsOiNmZmY7fS5jbHMtNXtmb250LXNpemU6NTQuODlweDtmb250LWZhbWlseTpBdmVuaXJOZXh0LVJlZ3VsYXIsIEF2ZW5pciBOZXh0O2xldHRlci1zcGFjaW5nOjAuNGVtO30uY2xzLTZ7bGV0dGVyLXNwYWNpbmc6MC4zOGVtO30uY2xzLTd7bGV0dGVyLXNwYWNpbmc6MC40ZW07fTwvc3R5bGU+PGxpbmVhckdyYWRpZW50IGlkPVwiTmV3X0dyYWRpZW50XCIgeDE9XCItMTk0LjY1XCIgeTE9XCI5OTQuODhcIiB4Mj1cIi0xOTQuNjVcIiB5Mj1cIjEwNjAuOTJcIiBncmFkaWVudFRyYW5zZm9ybT1cInRyYW5zbGF0ZSgxOTQyLjI3IC04MjEwLjE0KSBzY2FsZSg4LjUpXCIgZ3JhZGllbnRVbml0cz1cInVzZXJTcGFjZU9uVXNlXCI+PHN0b3Agb2Zmc2V0PVwiMC4zMVwiIHN0b3AtY29sb3I9XCIjMjk4NmE1XCIvPjxzdG9wIG9mZnNldD1cIjAuNjlcIiBzdG9wLWNvbG9yPVwiIzFjNzA4Y1wiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48dGl0bGU+QXNzZXQgMjwvdGl0bGU+PGcgaWQ9XCJMYXllcl8yXCIgZGF0YS1uYW1lPVwiTGF5ZXIgMlwiPjxnIGlkPVwiTGF5ZXJfMS0yXCIgZGF0YS1uYW1lPVwiTGF5ZXIgMVwiPjxwYXRoIGNsYXNzPVwiY2xzLTFcIiBkPVwiTTQ3OC43OCwyNDUuNTVDMzU4LjE2LDIwNS44MywzNjMsNTAuMTMsMTUyLjQyLDBjMTMuOCw0OS4zNiwyMi40OSw3Ny4xNSwyOC44MiwxMjguNzhsNTEuNTIsNS42OGMtMjYsNi43Ni01MS40MSw4LjQ5LTU1LjY4LDMyLjU0LTEyLjM2LDcwLjM4LTU4LjE3LDU5LjMxLTgxLjk0LDgxLjUyYTEyNS45LDEyNS45LDAsMCwwLDIwLjI4LDEuNjIsMTIxLjUyLDEyMS41MiwwLDAsMCwzNi44My01LjY2bDAsLjFBMTIxLjU2LDEyMS41NiwwLDAsMCwxODUuNTYsMjI4bDE1Ljg0LTExLjIxTDIxNy4yNSwyMjhhMTIxLjQ4LDEyMS40OCwwLDAsMCwzMy4yNywxNi41N2wwLS4xYTEyMy42LDEyMy42LDAsMCwwLDczLjY0LjF2LS4xQTEyMC44MywxMjAuODMsMCwwLDAsMzU3LjQ5LDIyOGwxNS44NC0xMS4yMUwzODkuMTgsMjI4YTEyMS4xOCwxMjEuMTgsMCwwLDAsMzMuMjcsMTYuNTdsMC0uMWExMjEuNDYsMTIxLjQ2LDAsMCwwLDM2LjgyLDUuNjYsMTI0LjQ1LDEyNC40NSwwLDAsMCwxNy40OC0xLjI0LDUuMTIsNS4xMiwwLDAsMCwyLTMuMzZaXCIvPjxwYXRoIGNsYXNzPVwiY2xzLTJcIiBkPVwiTTU3My45MywyNjQuNThWODEySDBWMjY4LjJhMTQ3LjgsMTQ3LjgsMCwwLDAsMzMuNDQtMTcuNzcsMTQ5LDE0OSwwLDAsMCwxNzEuOTQsMCwxNDksMTQ5LDAsMCwwLDE3MS45MywwLDE0OSwxNDksMCwwLDAsMTcxLjk1LDAsMTQ5LjExLDE0OS4xMSwwLDAsMCwyNC42NywxNC4xNFpcIi8+PHRleHQgY2xhc3M9XCJjbHMtM1wiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSg0Ny4yNSA3MjIuNjIpIHNjYWxlKDAuODMgMSlcIj5zaGFyazwvdGV4dD48cGF0aCBjbGFzcz1cImNscy00XCIgZD1cIk0xOTAuOTIsMzY5LjgybC0uNjksMTQuMDZxNS4zNi04LjUyLDExLjgxLTEyLjczYTI1LjMyLDI1LjMyLDAsMCwxLDE0LjEtNC4yQTIzLjQ3LDIzLjQ3LDAsMCwxLDIzMi4yNywzNzNhMjUuNjksMjUuNjksMCwwLDEsOC40OSwxNHExLjY5LDcuOTEsMS42OSwyNi44NXY2N3EwLDIxLjctMi4xMywzMC44N2EyNiwyNiwwLDAsMS04Ljc0LDE0LjYzLDI0LjIyLDI0LjIyLDAsMCwxLTE1Ljk0LDUuNDUsMjQuNTIsMjQuNTIsMCwwLDEtMTMuOC00LjIsNDAuODcsNDAuODcsMCwwLDEtMTEuNjItMTIuNDl2MzYuNDdIMTUwLjExVjM2OS44MlptMTEuNDIsNDYuMjdxMC0xNC43NC0uODktMTcuODZ0LTUtMy4xMmE0Ljg1LDQuODUsMCwwLDAtNS4xMSwzLjZxLTEuMTQsMy42LTEuMTQsMTcuMzhWNDgycTAsMTQuMzgsMS4xOSwxOGE0LjkzLDQuOTMsMCwwLDAsNS4xNiwzLjZxMy44NywwLDQuODItMy4zdC45NC0xNlpcIi8+PHBhdGggY2xhc3M9XCJjbHMtNFwiIGQ9XCJNMjkyLjQ5LDQzMS40M0gyNTQuODZWNDIwLjc2cTAtMTguNDYsMy41Mi0yOC40N3QxNC4xNS0xNy42OHExMC42Mi03LjY3LDI3LjYtNy42NywyMC4zNSwwLDMwLjY4LDguNjlBMzQuNTgsMzQuNTgsMCwwLDEsMzQzLjIzLDM5N3EyLjA5LDEyLjY1LDIuMDgsNTIuMDh2NzkuODRoLTM5VjUxNC43MnEtMy42Nyw4LjUzLTkuNDgsMTIuNzlBMjIuNzgsMjIuNzgsMCwwLDEsMjgzLDUzMS43N2EzMCwzMCwwLDAsMS0xOS4zMS03LjEzcS04Ljc5LTcuMTMtOC43OS0zMS4yM1Y0ODAuMzRxMC0xNy44Niw0LjY3LTI0LjMzdDIzLjEzLTE1LjFxMTkuNzYtOS4zNSwyMS4xNS0xMi41OXQxLjM5LTEzLjE5cTAtMTIuNDctMS41NC0xNi4yNHQtNS4xMS0zLjc4cS00LjA3LDAtNS4wNiwzLjE4dC0xLDE2LjQ4Wm0xMi43MSwyMS44MnEtOS42Myw4LjUxLTExLjE3LDE0LjI2dC0xLjU0LDE2LjU0cTAsMTIuMzUsMS4zNCwxNS45NGE1LjE3LDUuMTcsMCwwLDAsNS4zMSwzLjZxMy43NywwLDQuOTItMi44MlQzMDUuMiw0ODZaXCIvPjxwYXRoIGNsYXNzPVwiY2xzLTRcIiBkPVwiTTM5OS4yMywzNjkuODJsLTEuNTksMjAuOTJxOC43NC0yMi40NywyNS4zMi0yMy43OXY1NnEtMTEsMC0xNi4xOCwzLjZhMTUuMDYsMTUuMDYsMCwwLDAtNi4zNSwxMHEtMS4xOSw2LjQxLTEuMTksMjkuNTV2NjIuODFIMzU5LjEyVjM2OS44MlpcIi8+PHBhdGggY2xhc3M9XCJjbHMtNFwiIGQ9XCJNNTE4LjI3LDM2OS44Miw1MDIsNDMzLjE3bDIxLjE1LDk1LjcySDQ4NC41NmwtMTIuNTEtNjkuMzMsMCw2OS4zM0g0MzEuODlWMzM0LjgySDQ3MmwwLDgxLjQ3LDEyLjUxLTQ2LjQ3WlwiLz48dGV4dCBjbGFzcz1cImNscy01XCIgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDAuNzEgODk2Ljg1KVwiPnN0b3AgY2k8dHNwYW4gY2xhc3M9XCJjbHMtNlwiIHg9XCIzMTguNzNcIiB5PVwiMFwiPnI8L3RzcGFuPjx0c3BhbiBjbGFzcz1cImNscy03XCIgeD1cIjM1OS40NlwiIHk9XCIwXCI+Y2xpbmc8L3RzcGFuPjwvdGV4dD48L2c+PC9nPjwvc3ZnPmBcbiIsIm1vZHVsZS5leHBvcnRzID0gZXJyID0+IHsgY29uc29sZS5sb2coIGVyci5zdGFjayB8fCBlcnIgKSB9XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIEVycm9yOiByZXF1aXJlKCcuL015RXJyb3InKSxcblxuICAgIFA6ICggZnVuLCBhcmdzPVsgXSwgdGhpc0FyZyApID0+XG4gICAgICAgIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IFJlZmxlY3QuYXBwbHkoIGZ1biwgdGhpc0FyZyB8fCB0aGlzLCBhcmdzLmNvbmNhdCggKCBlLCAuLi5jYWxsYmFjayApID0+IGUgPyByZWplY3QoZSkgOiByZXNvbHZlKGNhbGxiYWNrKSApICkgKSxcbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpIHsgcmV0dXJuIHRoaXMgfVxufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4gKCcgKyBlciArICcpJyk7XG4gICAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGV2bGlzdGVuZXIpKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoZXZsaXN0ZW5lcilcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gMDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIl19
