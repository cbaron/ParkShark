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
            mapLocation: { lat: 39.9564950, lng: -75.1925837  },
            spotLocation: { lat: 39.9564950, lng: -75.1925837  },
            name: 'Drexel Lot C',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                '$3/hr',
                '5hr max',
                'open 24 hrs'
            ],
            image: 'spots/lot_c.JPG',
            temp: 57
        },
        {
            id: 2,
            distance: 'ft away',
            mapLocation: { lat: 39.9593209, lng: -75.1920907 },
            spotLocation: { lat: 39.9593209, lng: -75.1920907 },
            name: 'Drexel Lot D Spot 45',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_d_spot_45.JPG',
            temp: 57
        },
        {
            id: 3,
            distance: 'ft away',
            mapLocation: { lat: 39.9599256, lng: -75.1889950 },
            spotLocation: { lat: 39.9599256, lng: -75.1889950 },
            name: 'Drexel Lot H Spot 4',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_h_spot_4.JPG',
            temp: 57
        },
        {
            id: 4,
            distance: 'ft away',
            mapLocation: { lat: 39.9597497, lng: -75.1886260 },
            spotLocation: { lat: 39.9597497, lng: -75.1886260 },
            name: 'Drexel Lot H Spot 15',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_h_spot_15.JPG',
            temp: 57
        },
        {
            id: 5,
            distance: 'ft away',
            mapLocation: { lat: 39.9596049, lng: -75.1888546 },
            spotLocation: { lat: 39.9596049, lng: -75.1888546 },
            name: 'Drexel Lot H Spot 26',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_h_spot_26.JPG',
            temp: 57
        },
        {
            id: 6,
            distance: 'ft away',
            mapLocation: { lat: 39.9583045, lng: -75.18882359 },
            spotLocation: { lat: 39.9583045, lng: -75.18882359 },
            name: 'Drexel Lot J',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_j.JPG',
            temp: 57
        },
        {
            id: 7,
            distance: 'ft away',
            mapLocation: { lat: 39.9575587, lng: -75.1934095 },
            spotLocation: { lat: 39.9575587, lng: -75.1934095 },
            name: 'Drexel Lot K Spot 115',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_k_spot_115.JPG',
            temp: 57
        },
        {
            id: 8,
            distance: 'ft away',
            mapLocation: { lat: 39.9563293, lng: -75.1911949 },
            spotLocation: { lat: 39.9563293, lng: -75.1911949 },
            name: 'Drexel Lot P',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_p.JPG',
            temp: 57
        },
        {
            id: 9,
            distance: 'ft away',
            mapLocation: { lat: 39.9563185, lng: -75.1911229 },
            spotLocation: { lat: 39.9563185, lng: -75.1911229 },
            name: 'Drexel Lot P Spot 2',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_p_spot_2.JPG',
            temp: 57
        },
        {
            id: 10,
            distance: 'ft away',
            mapLocation: { lat: 39.9579902, lng: -75.1901658 },
            spotLocation: { lat: 39.9579902, lng: -75.1901658 },
            name: 'Drexel Lot R Spot 20',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_r_spot_20.JPG',
            temp: 57
        },
        {
            id: 11,
            distance: 'ft away',
            mapLocation: { lat: 39.9568154, lng: -75.1872669 },
            spotLocation: { lat: 39.9568154, lng: -75.1872669 },
            name: 'Drexel Lot S',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_s_signage.JPG',
            temp: 57
        },
        {
            id: 12,
            distance: 'ft away',
            mapLocation: { lat: 39.9578782, lng: -75.1882803 },
            spotLocation: { lat: 39.9578782, lng: -75.1882803 },
            name: 'Drexel Lot T Spot 2',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_t_spot_2.JPG',
            temp: 57
        },
        {
            id: 13,
            distance: 'ft away',
            mapLocation: { lat: 39.9576998, lng: -75.1881897 },
            spotLocation: { lat: 39.9576998, lng: -75.1881897 },
            name: 'Drexel Lot T Spot 4',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                'Permit Only'
            ],
            image: 'spots/lot_t_spot_4.JPG',
            temp: 57
        },
        {
            id: 14,
            distance: 'ft away',
            mapLocation: { lat: 39.9545688, lng: -75.1915902 },
            spotLocation: { lat: 39.9545688, lng: -75.1915902 },
            name: 'Off-Campus Structure',
            context: [
                'Private Parking Structure',
                '88/240 spots'
            ],
            details: [
                '$13/hour'
            ],
            image: 'spots/offcampusstructure.jpg',
            temp: 57
        }
    ],

    initMap() {
        this.map = new google.maps.Map( this.els.map, {
          center: { lat: 39.956135, lng: -75.190693 },//3333 Market St, Philadelphia, PA 19104
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          zoom: 15
        } )

        const marker = new google.maps.Marker( {
            position: this.map.getCenter(),
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                strokeColor: '#007aff'
            },
            draggable: true,
            map: this.map
        } )

        this.icon = {            
            path: this.garagePath,
            strokeColor: '#d380d6',
            fillOpacity: .1,
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
