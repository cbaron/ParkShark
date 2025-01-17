module.exports = Object.create( {

    Error: require('../../lib/MyError'),
    
    ViewFactory: require('./factory/View'),
    
    Views: require('./.ViewMap'),

    constructor() {
        this.contentContainer = document.querySelector('#content')

        window.onpopstate = this.handle.bind(this)

        this.handle()

        return this
    },

    handle() {
        this.handler( window.location.pathname.split('/').slice(1) )
    },

    handler( path ) {
        const name = path[0] ? path[0].charAt(0).toUpperCase() + path[0].slice(1) : '',
              view = this.Views[name] ? path[0] : 'home';

        ( ( view === this.currentView )
            ? Promise.resolve()
            : Promise.all( Object.keys( this.views ).map( view => this.views[ view ].hide() ) ) ) 
        .then( () => {

            this.currentView = view

            if( this.views[ view ] ) return this.views[ view ].navigate( path )

            return Promise.resolve(
                this.views[ view ] =
                    this.ViewFactory.create( view, {
                        insertion: { value: { el: this.contentContainer } },
                        path: { value: path, writable: true }
                    } )
            )
        } )
        .catch( this.Error )
    },

    navigate( location ) {
        history.pushState( {}, '', location )
        this.handle()
    }

}, { currentView: { value: '', writable: true }, views: { value: { } } } ).constructor()
