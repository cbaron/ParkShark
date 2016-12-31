module.exports = p => {
    const pageUi = require('./
return `<div>
    <div data-js="map" class="map">
        <div data-js="menu" class="menu">
            <div>${require('./lib/info')</div> 
            <div>${require('./lib/cursor')</div> 
        </div>
        <div data-js="pageUi" class="page-ui"></div>
        <div data-js="weather" class="weather"></div>
    </div>
    <div data-js="info">
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
