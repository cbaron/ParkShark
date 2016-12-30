module.exports = Object.assign( {}, require('./__proto__'), {

    postRender() {
        //setTimeout( () => this.hide().then( () => this.navigate( 'snag' ) ).catch( this.Error ), 2000 )
        
        return this
    }

} )
