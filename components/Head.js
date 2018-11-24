import NextHead from 'next/head';

const defaultTitle = 'Mina recept';
const defaultDescription = 'En webbapp med utvalda recept.';

const defaultIcon = '/static/img/icon512.png';
const defaultOGURL = 'https://minarecept.now.sh';
const defaultOGImage = '/static/img/OGimage.png';

const defaultThemeColor = '#f2eee9';

const Head = props => (
  <NextHead>
    <meta charSet="UTF-8" key="charSet" />
    <title key="title">{props.title || defaultTitle}</title>
    <link rel="manifest" href="/static/manifest.json" key="manifest" />
    <meta
      name="description"
      content={props.description || defaultDescription}
      key="description"
    />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
      key="viewport"
    />
    <link rel="icon" href={props.icon || defaultIcon} key="icon" />
    <meta property="og:url" content={props.url || defaultOGURL} key="ogUrl" />
    <meta
      property="og:title"
      content={props.title || defaultTitle}
      key="ogTitle"
    />
    <meta
      property="og:description"
      content={props.description || defaultDescription}
      key="ogDescription"
    />
    <meta
      name="theme-color"
      content={props.themeColor || defaultThemeColor}
      key="themeColor"
    />
    <meta
      name="apple-mobile-web-app-status-bar-style"
      content="default"
      key="statusbar"
    />
    <link
      rel="apple-touch-icon"
      href={props.icon || defaultIcon}
      key="appletouchicon"
    />
    <link
      rel="apple-touch-startup-image"
      href={props.icon || defaultIcon}
      key="appletouchstartupimage"
    />
    <meta
      name="apple-mobile-web-app-status-bar-style"
      content="default"
      key="applemobilewebappstatusbarstyle"
    />
    <meta
      name="apple-mobile-web-app-capable"
      content="yes"
      key="applemobilewebappcapable"
    />
    <meta
      property="og:image"
      content={props.ogImage || defaultOGImage}
      key="ogImage"
    />
    <meta property="og:image:width" content="1200" key="ogImageWidth" />
    <meta property="og:image:height" content="630" key="ogImageHeight" />

    <script
      dangerouslySetInnerHTML={{
        __html: `
        UPLOADCARE_LOCALE = 'sv';
        UPLOADCARE_PUBLIC_KEY = '99f58d578341d2880ae3';
    `,
      }}
    />
  </NextHead>
);

export default Head;
