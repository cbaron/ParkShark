module.exports = p => {
    const pageUi = require('./lib/dot')
    return `<div>
        <div class="map-wrap">
            <div data-js="map" class="map"></div>
            <div class="menu">
                <div>${require('./lib/info')}</div> 
                <div>${require('./lib/cursor')}</div> 
            </div>
            <div data-js="pageUi" class="page-ui">
                ${Array.from(Array(p.length).keys()).map( () => pageUi ).join('')}
            </div>
            <div data-js="weather" class="weather">
                <span>${require('./lib/cloud')}</span>
                <span data-js="temp"></span>
            </div>
        </div>
        <div class="info">
            <div class="line-wrap">${require('./lib/line')}</div>
            <div class="button-row">
                <button class="snag" data-js="snag">
                    <span>Snag This Spot</span>
                    <span data-js="distance"></span>
                </button>
            </div>
            <div data-js="spotName"></div>
            <div data-js="spotContext"></div>
            <div data-js="detail"></div>
            <img data-js="image" />
        </div>
    </div>` }
