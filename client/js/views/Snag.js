module.exports = Object.assign( {}, require('./__proto__'), {

    garagePath: require('./lib/carPath'),

    bindSwipe() {
        this.swipeTime = 1000
        this.minX = 30
        this.maxY = 30

        this.els.container.addEventListener( 'mousedown',  e => this.onSwipeStart(e), false )
        this.els.container.addEventListener( 'touchstart', e => this.onSwipeStart(e), false )
        this.els.container.addEventListener( 'mouseup', e => this.onSwipeEnd(e), false )
        this.els.container.addEventListener( 'touchend', e => this.onSwipeEnd(e), false )
    },

    getTemplateOptions() { return this.data },

    data: [
        {
            mapLocation: { lat: 39.9564950, lng: -75.1925837  },
            name: 'Drexel Lot C',
            context: [
                'Hourly/Private Parking Structure',
                '5/60 spots'
            ],
            details: [
                '$3/hr 0-3 hours',
                '3-5hr max time is $14.00',
                'open 24 hrs'
            ],
            image: 'spots/lot_c.JPG',
            spots: [ 8, 9, 10, 11, 49 ]
        },
        {
            mapLocation: { lat: 39.9593209, lng: -75.1920907 },
            name: 'Drexel Lot D',
            context: [
                'Private Parking Structure',
                '1/60 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_d.JPG',
            spots: [ 45 ]
        },
        {
            mapLocation: { lat: 39.9599256, lng: -75.1889950 },
            name: 'Drexel Lot H Spot 4',
            context: [
                'Private Parking Structure',
                '3/10 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_h.JPG',
            spots: [ 4, 15, 26 ]
        },
        {
            mapLocation: { lat: 39.9583045, lng: -75.18882359 },
            name: 'Drexel Lot J',
            context: [
                'Private Parking Structure',
                '4/11 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_j.JPG',
            spots: [ 1, 2, 3, 4 ]
        },
        {
            mapLocation: { lat: 39.9575587, lng: -75.1934095 },
            name: 'Drexel Lot K',
            context: [
                'Private Parking Structure',
                '1/210 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_k.JPG',
            spots: [ 115 ]
        },
        {
            mapLocation: { lat: 39.9563293, lng: -75.1911949 },
            name: 'Drexel Lot P',
            context: [
                'Private Parking Structure',
                '5/9 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_p.JPG',
            spots: [ 1, 2, 3, 4, 5 ]
        },
        {
            mapLocation: { lat: 39.9579902, lng: -75.1901658 },
            name: 'Drexel Lot R',
            context: [
                'Private Parking Structure',
                '1/24 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_r_signage.JPG',
            spots: [ 20 ]
        },
        {
            mapLocation: { lat: 39.9568154, lng: -75.1872669 },
            name: 'Drexel Lot S',
            context: [
                'Private Parking Structure',
                '3/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_s_signage.JPG',
            spots: [ 71, 72, 73 ]
        },
        {
            mapLocation: { lat: 39.9578782, lng: -75.1882803 },
            name: 'Drexel Lot T',
            context: [
                'Private Parking Structure',
                '2/19 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_t_signage.JPG',
            spots: [ 2, 4 ]
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
            image: 'spots/offcampusstructure.jpg',
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
                    icon: window.location.origin + `/static/img/garage.png`
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
        return this.els.container.clientHeight + window.document.body.scrollTop > this.getOffsetTop( this.els.image )
    },

    onSwipeLeft() {
        if( this.isExpanded() ) { return this.swipeImage('left') }

        if( this.updating ) return false

        this.updating = true;

        this.removeOldMarkers()

        this.currentSpot = this.data[ this.currentSpot + 1 ] ? this.currentSpot + 1 : 0

        this.update('right')
        .then( () => Promise.resolve( this.updating = false ) )
        .catch( this.Error )
    },
    
    onSwipeRight() {
        if( this.isExpanded() ) { return this.swipeImage('right') }

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
        this.els.image.src = `/static/img/${data.image}`

        return this.renderDirections( data )
        .then( () => {
            if( swipe ) {
                this.els.container.classList.remove( 'hidden' )
                this.els.container.classList.add( `slide-in-${swipe}` )
            }
            return Promise.resolve()
        } )
    }

} )
