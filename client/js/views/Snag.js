module.exports = Object.assign( {}, require('./__proto__'), {

    garagePath: require('./lib/carPath'),

    bindSwipe() {
        this.swipeTime = 1000
        this.minX = 30
        this.maxY = 30

        this.els.container.addEventListener( 'mousedown',  e => this.onSwipeStart(e), false )
        this.els.container.addEventListener( 'touchstart', e => this.onSwipeStart(e), false )
        this.els.container.addEventListener( 'mousemove', e => this.onSwipeMove(e), false )
        this.els.container.addEventListener( 'touchmove', e => this.onSwipeMove(e), false )
        this.els.container.addEventListener( 'mouseup', e => this.onSwipeEnd(e), false )
        this.els.container.addEventListener( 'touchend', e => this.onSwipeEnd(e), false )
    },

    getTemplateOptions() { return this.data },

    data: [
        {
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
        },
        {
            id: 2,
            distance: '2 mi',
            mapLocation: { lat: 40.004, lng: -75.258 },
            spotLocation: { lat: 40.004, lng: -75.258 },
            name: 'Philly',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                '$3/hr',
                '4hr max',
                'open 24 hrs'
            ],
            image: 'trump.jpg',
            temp: 10
        },
        {
            id: 3,
            distance: '3 mi',
            mapLocation: { lat: 40, lng: -80 },
            spotLocation: { lat: 40, lng: -80 },
            name: 'Not Philly',
            context: [
                'Another Private Parking Structure',
                '100/240 spots'
            ],
            details: [
                '$4/hr',
                '4hr max',
                'open 24 hrs'
            ],
            image: 'sidekick-shed-xs.jpg',
            temp: 30
        }
    ],

    initMap() {
        this.map = new google.maps.Map( this.els.map, {
          center: this.data[ this.currentSpot ].mapLocation,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          zoom: 14
        } )

        this.icon = {            
            path: this.garagePath,
            strokeColor: '#d380d6',
            fillOpacity: 1,
            anchor: new google.maps.Point(0,0),
            strokeWeight: 1,
            scale: .050
        }

        this.renderIcons()

        this.update()

    },

    renderIcons() {
        this.data.forEach( datum =>
            this.markers[ datum.id ] = new google.maps.Marker( {
                position: datum.spotLocation,
                map: this.map,
                title: datum.name,
                icon: this.icon
            } )
        )
    },

    onSwipeStart( e ) {
        e = ('changedTouches' in e) ? e.changedTouches[0] : e
        this.touchStartCoords = { x: e.pageX, y :e.pageY }
        this.startTime = new Date().getTime()
    },
    
    onSwipeMove( e ) {
        //console.log( 'onSwipeMove' )
        e.preventDefault()
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

    onSwipeLeft() {
        this.currentSpot = this.data[ this.currentSpot + 1 ] ? this.currentSpot + 1 : 0

        this.update()
    },
    
    onSwipeRight() {
        console.log('right')
    },

    postRender() {
        this.currentSpot = 0
        this.markers = { }

        window.google
            ? this.initMap()
            : window.initMap = this.initMap

        this.bindSwipe()        
        
        return this
    },

    templates: {
        Dot: require('./templates/lib/dot')
    },

    update() {
        const data = this.data[ this.currentSpot ]

        this.map.setCenter( data.mapLocation )
        this.els.temp.textContent = data.temp
        this.els.spotName.textContent = data.name
        this.els.distance.textContent = data.distance
        this.els.spotContext.innerHTML = data.context.join( this.templates.Dot )
        this.els.detail.innerHTML = data.details.join( this.templates.Dot )
        this.els.image.src = `/static/img/${data.image}`
    }

} )
