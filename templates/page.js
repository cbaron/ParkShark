module.exports = p => `
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="/static/css/main.css.gz">

        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
       
        ${ ( p.isDev )
            ? '<script src="/static/js/debug.js.gz"></script>'
            : '<script src="/static/js/bundle.js.gz"></script>'
        }
        <script async defer src="https://maps.googleapis.com/maps/api/js?key=${p.googleApiKey}&callback=initMap"></script>
        <title>${p.title}</title>
    </head>

    <body>
       <div id="content"></div>
    </body>

    ${p.isDev?`<script src="//${process.env.DOMAIN}:35729/livereload.js?snipver=1"/></script>`:''}

</html>
`
