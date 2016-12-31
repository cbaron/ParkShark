module.exports = Object.assign( {}, require('./__proto__'), {

    postRender() {
        setTimeout( () => this.hide().then( () => this.emit( 'navigate', 'snag' ) ).catch( this.Error ), 2000 )
        
        return this
    }

} )
