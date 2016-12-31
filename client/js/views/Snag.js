module.exports = Object.assign( {}, require('./__proto__'), {

    data: [
        {
            distance: '200 ft away',
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
            image: 'trump.jpg'
        }
    ],

    postRender() {

        this.map = new google.maps.Map( this.els.map, {
          center: data[0].mapLocation
          zoom: 8
        } )

        return this
    }

} )
