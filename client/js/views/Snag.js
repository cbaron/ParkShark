module.exports = Object.assign( {}, require('./__proto__'), {

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
            distance: '300 ft away',
            mapLocation: { lat: -34.397, lng: 150.644 },
            spotLocation: { lat: -34.397, lng: 150.644 },
            name: 'LAZParking',
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
            temp: 57
        },
        {
            distance: '2 mi',
            mapLocation: { lat: 40.004, lng: -75.258 },
            spotLocation: { lat: 39.9388, lng: -751.1832 },
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
            distance: '2 mi',
            mapLocation: { lat: 40.004, lng: -75.258 },
            spotLocation: { lat: 39.9388, lng: -751.1832 },
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
        }
    ],

    initMap() {

        this.map = new google.maps.Map( this.els.map, {
          center: this.data[ this.currentSpot ].mapLocation,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          zoom: 14
        } )

        this.update()
        this.els.temp.textContent = this.data[0].temp
        this.els.spotName.textContent = this.data[0].name
        this.els.spotContext.innerHTML = this.data[0].context.join( this.templates.Dot )
        this.els.detail.innerHTML = this.data[0].details.join( this.templates.Dot )
        this.els.image.src = `/static/img/${this.data[0].image}`
    },

    onSwipeStart( e ) {
      e = ('changedTouches' in e) ? e.changedTouches[0] : e
      this.touchStartCoords = { x: e.pageX, y :e.pageY }
      this.startTime = new Date().getTime()
    },
    
    onSwipeMove( e ) {
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
        console.log('left')
    },
    
    onSwipeRight() {
        console.log('right')
    },

    postRender() {
        this.currentSpot = 0

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
        this.els.spotContext.innerHTML = data.context.join( this.templates.Dot )
        this.els.detail.innerHTML = data.details.join( this.templates.Dot )
        this.els.image.src = `/static/img/${data.image}`
    }

} )
