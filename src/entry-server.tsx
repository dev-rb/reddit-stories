import { createHandler, StartServer } from '@solidjs/start/server';

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
          />
          <meta name="description" content="Site and PWA for r/writingprompts" />
          <meta name="keywords" content="Reddit WritingPrompts Tavern Tales Stories Short" />

          <title>Tavern Tales</title>

          <link href="favicon.ico" rel="icon" type="image/png" sizes="32x32" />
          <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png"></link>

          <link rel="manifest" href="/manifest.json" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
