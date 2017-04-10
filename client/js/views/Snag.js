module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        snag: 'click'
    },

    onSnagClick() {
        const location = this.data[ this.currentSpot ].mapLocation

        window.location = `waze://?ll=${location.lat},${location.lng}&navigate=yes`
    },

    bindSwipe() {
        this.swipeTime = 1000
        this.minX = 30
        this.maxY = 30

        this.els.container.addEventListener( 'mousedown',  e => this.onSwipeStart(e), false )
        this.els.container.addEventListener( 'touchstart', e => this.onSwipeStart(e), false )
        this.els.container.addEventListener( 'mouseup', e => this.onSwipeEnd(e), false )
        this.els.container.addEventListener( 'touchend', e => this.onSwipeEnd(e), false )

        this.els.container.addEventListener( 'touchmove', e => e.stopImmediatePropagation(), { passive: false } )
        this.els.container.addEventListener( 'mousemove', e => e.stopImmediatePropagation(), { passive: false } )

        this.els.image.addEventListener( 'touchmove', e => e.preventDefault(), { passive: false } )
        this.els.image.addEventListener( 'mousemove', e => e.preventDefault(), { passive: false } )
    },

    getTemplateOptions() { return this.data },

    data: [
        {
            mapLocation: { lat: 39.9564950, lng: -75.1925837  },
            name: 'Drexel Lot C',
            context: [
                'Hourly/Private Lot',
                '5/60 spots'
            ],
            details: [
                '$3/hr 0-3 hours',
                '3-5hr max time is $14.00',
                'open 24 hrs'
            ],
            images: [ 'lot_c', 8, 9, 10, 11, 49 ],
            type: 'lot'
        },
        {
            mapLocation: { lat: 39.9593209, lng: -75.1920907 },
            name: 'Drexel Lot D',
            context: [
                'Private Lot',
                '1/60 spots'
            ],
            details: [
                'Permit Only'
            ],
            images: [ 'lot_d', 45 ],
            type: 'lot'
        },
        {
            mapLocation: { lat: 39.9599256, lng: -75.1889950 },
            name: 'Drexel Lot H',
            context: [
                'Private Lot',
                '3/10 spots'
            ],
            details: [
                'Permit Only'
            ],
            images: [ 'lot_h', 4, 15, 26 ],
            type: 'lot'
        },
        {
            mapLocation: { lat: 39.9583045, lng: -75.18882359 },
            name: 'Drexel Lot J',
            context: [
                'Private Lot',
                '4/11 spots'
            ],
            details: [
                'Permit Only'
            ],
            images: [ 'lot_j', 1, 2, 3, 4 ],
            type: 'lot'
        },
        {
            mapLocation: { lat: 39.9575587, lng: -75.1934095 },
            name: 'Drexel Lot K',
            context: [
                'Private Lot',
                '1/210 spots'
            ],
            details: [
                'Permit Only'
            ],
            images: [ 'lot_k', 115 ],
            type: 'lot'
        },
        {
            mapLocation: { lat: 39.9563293, lng: -75.1911949 },
            name: 'Drexel Lot P',
            context: [
                'Private Lot',
                '5/9 spots'
            ],
            details: [
                'Permit Only'
            ],
            images: [ 'lot_p', 1, 2, 3, 4, 5 ],
            type: 'lot'
        },
        {
            mapLocation: { lat: 39.9579902, lng: -75.1901658 },
            name: 'Drexel Lot R',
            context: [
                'Private Lot',
                '1/24 spots'
            ],
            details: [
                'Permit Only'
            ],
            images: [ 'lot_r', 20 ],
            type: 'lot'
        },
        {
            mapLocation: { lat: 39.9568154, lng: -75.1872669 },
            name: 'Drexel Lot S',
            context: [
                'Private Lot',
                '3/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            images: [ 'lot_s', 71, 72, 73 ],
            type: 'lot'
        },
        {
            mapLocation: { lat: 39.9578782, lng: -75.1882803 },
            name: 'Drexel Lot T',
            context: [
                'Private Lot',
                '2/19 spots'
            ],
            details: [
                'Permit Only'
            ],
            images: [ 'lot_t', 2, 4 ],
            type: 'lot'
        },
        {
            mapLocation: { lat: 39.9545688, lng: -75.1915902 },
            name: 'Drexel Parking Services',
            context: [
                'Public Parking Structure',
                '88/803 spots'
            ],
            details: [
                '$13/hour'
            ],
            images: [ 'offcampusstructure' ],
            type: 'garage'
        }
    ],

    initMap() {
        this.directionsService = new google.maps.DirectionsService()

        this.map = new google.maps.Map( this.els.map, {
            disableDefaultUI: true,
            disableDoubleClickZoom: true,
            draggable: false,
            navigationControl: false,
            scrollwheel: false,
            navigationControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scaleControl: false
            //zoom: 15
        } )

        this.origin = { lat: 39.956135, lng: -75.190693 }

        const marker = new google.maps.Marker( {
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
        } )

        this.data.forEach( datum => {
            datum.marker =
                new google.maps.Marker( {
                    position: datum.mapLocation,
                    title: datum.name,
                    scale: 1,
                    icon: window.location.origin + `/static/img/${datum.type}.png`
                } )
        } )

        this.els.pageUi.children[ 0 ].classList.add('selected')
        this.updating = true
        this.update()
        .then( () => Promise.resolve( this.updating = false ) )
        .catch( this.Error )

    },

    onSwipeStart( e ) {
        e = ('changedTouches' in e) ? e.changedTouches[0] : e
        this.touchStartCoords = { x: e.pageX, y :e.pageY }
        this.startTime = new Date().getTime()
    },
    
    onSwipeEnd( e ) {
        e = ('changedTouches' in e) ? e.changedTouches[0] : e
        this.touchEndCoords = { x: e.pageX - this.touchStartCoords.x, y :e.pageY - this.touchStartCoords.y }
        this.elapsedTime = new Date().getTime() - this.startTime

        if( this.elapsedTime <= this.swipeTime ) {
            if( Math.abs(this.touchEndCoords.x) >= this.minX && Math.abs(this.touchEndCoords.y) <= this.maxY ) {
                this.touchEndCoords.x < 0 ? this.onSwipeLeft() : this.onSwipeRight()
            }
        }
    },

    getOffsetTop( el ) {
        let top = 0
        do {
          if ( !isNaN( el.offsetTop ) ) { top += el.offsetTop }
        } while( el = el.offsetParent )
        return top
    },

    isExpanded() {
        return window.innerHeight + window.document.body.scrollTop > this.getOffsetTop( this.els.image )
    },

    swipeImage( direction ) {
        const datum = this.data[ this.currentSpot ]

        let image = new Image()

        image.onload = () => {
            this.els.image.src = image.src
            //this.els.image.classList.remove( 'hide' )
            //window.requestAnimationFrame( () =>  this.els.image.classList.add( `slide-in-${direction}` ) )
        }

        if( !datum.imageIndex ) datum.imageIndex = 0

        datum.imageIndex =
            direction === 'left'
                ? datum.images[ datum.imageIndex + 1 ]
                    ? datum.imageIndex + 1
                    : 0
                : datum.images[ datum.imageIndex - 1 ]
                    ? datum.imageIndex - 1
                    : datum.images.length - 1

        //this.els.image.classList.add('hide')
        //window.requestAnimationFrame( () => this.els.image.classList.remove( 'slide-in-left', 'slide-in-right' ) )

        image.src = this.getImageSrc( datum, datum.imageIndex )

    },

    onSwipeLeft() {
        if( this.isExpanded() ) { return this.swipeImage('right') }

        if( this.updating ) return false

        this.updating = true;

        this.removeOldMarkers()

        this.currentSpot = this.data[ this.currentSpot + 1 ] ? this.currentSpot + 1 : 0

        this.update('right')
        .then( () => Promise.resolve( this.updating = false ) )
        .catch( this.Error )
    },
    
    onSwipeRight() {
        if( this.isExpanded() ) { return this.swipeImage('left') }

        if( this.updating ) return false

        this.updating = true;

        this.removeOldMarkers()

        this.currentSpot = this.data[ this.currentSpot - 1 ] ? this.currentSpot - 1 : this.data.length - 1

        this.update('left')
        .then( () => Promise.resolve( this.updating = false ) )
        .catch( this.Error )
    },

    postRender() {
        this.currentSpot = 0

        this.els.mapWrap.style.height = `${window.innerHeight - 140}px`

        window.google
            ? this.initMap()
            : window.initMap = this.initMap

        this.bindSwipe()        
    
        this.Xhr( { method: 'get', url: `http://api.openweathermap.org/data/2.5/weather?zip=19104,us&APPID=d5e191da9e31b8f644037ca310628102` } )
        .then( response => this.els.temp.textContent = Math.round( ( response.main.temp * (9/5) ) - 459.67 ) )
        .catch( e => { console.log( e.stack || e ); this.els.temp.remove() } )

        return this
    },

    removeOldMarkers() {
        const datum = this.data[ this.currentSpot ]
        datum.marker.setMap(null)
        datum.directionsDisplay.setMap(null)
        this.els.pageUi.children[ this.currentSpot ].classList.remove('selected')
    },

    renderDirections( data ) {
        if( data.directionsDisplay ) {
            this.els.distance.textContent = data.distance
            return Promise.resolve( data.directionsDisplay.setMap( this.map ) )
        }

        data.directionsDisplay = new google.maps.DirectionsRenderer( { suppressMarkers: true } )
        data.directionsDisplay.setMap( this.map )

        return new Promise( ( resolve, reject ) => {
            this.directionsService.route( {
                origin: this.origin,
                destination: data.mapLocation,
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.IMPERIAL
            }, ( result, status ) => {
                if( status === 'OK' ) {
                    data.directionsDisplay.setDirections(result)
                    data.distance = `${result.routes[0].legs[0].distance.text} away`
                    this.els.distance.textContent = data.distance
                    return resolve()
                } else { return reject(status) }
            } )
        } )

    },

    templates: {
        Dot: require('./templates/lib/dot')
    },

    getImageSrc( datum, imageIndex ) {
        const path = typeof datum.images[ imageIndex ] === 'string'
            ? datum.images[ imageIndex ]
            : `${datum.images[0]}_spot_${datum.images[ imageIndex ]}`

        return `/static/img/spots/${path}.JPG`
    },

    update( swipe ) {
        const data = this.data[ this.currentSpot ];

        if( swipe ) {
            this.els.container.classList.add('hidden')
            this.els.container.classList.remove( 'slide-in-left', 'slide-in-right' )
        }

        data.marker.setMap( this.map )
        this.els.pageUi.children[ this.currentSpot ].classList.add('selected')
        this.els.spotName.textContent = data.name
        this.els.spotContext.innerHTML = data.context.join( this.templates.Dot )
        this.els.detail.innerHTML = data.details.join( this.templates.Dot )
        this.els.image.src = this.getImageSrc( data, data.index || 0 )
        return this.renderDirections( data )
        .then( () => {
            if( swipe ) {
                this.els.container.classList.remove( 'hidden' )
                window.requestAnimationFrame( () => this.els.container.classList.add( `slide-in-${swipe}` ) )
            }
            return Promise.resolve()
        } )
    }

} )
