module.exports = p => {
    const pageUi = require('./lib/dot')
    return `<div>
        <div data-js="mapWrap" class="map-wrap">
            <div data-js="map" class="map"></div>
            <div class="menu">
                <div class="menu-item">
                    <div>${require('./lib/info')}</div>
                </div>
                <div class="menu-item">
                    <div>${require('./lib/cursor')}</div>
                </div>
            </div>
        </div>
        <div class="info-main">
            <div data-js="pageUi" class="page-ui">
                ${Array.from(Array(p.length).keys()).map( () => pageUi ).join('')}
            </div>
            <div data-js="weather" class="weather">
                <span>${require('./lib/cloud')}</span>
                <span data-js="temp"></span>
            </div>
            <div class="snag-area">
                <div class="line-wrap">${require('./lib/line')}</div>
                <div class="button-row">
                    <button class="snag" data-js="snag">
                        <div>Snag This Spot</div>
                        <div data-js="distance"></div>
                    </button>
                </div>
            </div>
            <div class="spot-details">
                <div data-js="spotName"></div>
                <div class="context" data-js="spotContext"></div>
                <div class="context" data-js="detail"></div>
                <img data-js="image" />
            </div>
        </div>
    </div>`
}
