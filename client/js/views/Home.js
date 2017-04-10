module.exports = Object.assign( {}, require('./__proto__'), {

    postRender() {
        this.els.logoWrap.style.height = `${window.innerHeight / 2}px`

        setTimeout( () => this.hide().then( () => this.emit( 'navigate', 'snag' ) ).catch( this.Error ), 2000 )
        
        return this
    }

} )
