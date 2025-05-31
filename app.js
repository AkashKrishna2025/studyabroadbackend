require('./config/index');
require('./models/db');
const imageUploadRouter = require('./helpers/imageUpload');
const prerender = require('prerender-node');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const device = require('express-device');

const app = express();

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'development') {
    app.use(
      prerender
        .set('prerenderToken', process.env.PRERENDER_TOKEN || 'bdcxNXW3ALsR6Z96yZZw')
        .set('protocol', 'https')
        .set('host', 'edulley.com')
        .set('prerenderServiceUrl', 'https://service.prerender.io/')
        .set('forwardHeaders', true)
        .set('blacklisted', [
          '^/api/',
          '^/admin/',
          '^/login',
          '^/dashboard',
          '^/profile'
        ])
        .set('whitelisted', [
          '^/$',
          '^/courses',
          '^/institutions',
          '^/scholarship',
          '^/blog',
          '^/career-path',
          '^/course-details/'
        ])
        .set('crawlerUserAgents', [
          'googlebot',
          'bingbot',
          'yandex',
          'baiduspider',
          'facebookexternalhit',
          'twitterbot',
          'rogerbot',
          'linkedinbot',
          'embedly',
          'bufferbot',
          'quora link preview',
          'showyoubot',
          'outbrain',
          'pinterest/0.',
          'developers.google.com/+/web/snippet',
          'www.google.com/webmasters/tools/richsnippets',
          'slackbot',
          'vkShare',
          'W3C_Validator',
          'redditbot',
          'Applebot',
          'WhatsApp',
          'flipboard',
          'tumblr',
          'bitlybot',
          'SkypeUriPreview',
          'nuzzel',
          'Discordbot',
          'Google Page Speed',
          'Qwantify',
          'Prerender'
        ])
        .set('cacheTTL', 86400000)
        .set('followRedirects', true)
        .set('waitAfterLastRequest', 500)
    );
}

const whitelistOrigin = process.env.WHITELIST_ORIGINS?.split(',')
app.use(cors({
    credentials: true,
    origin: whitelistOrigin,
    allowedHeaders: ["X-Access-User", "X-Access-Token", "Device-Type", "Accept", "Accept-Datetime", "Accept-Encoding", "Accept-Language", "Accept-Params", "Accept-Ranges", "Access-Control-Allow-Credentials", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods", "Access-Control-Allow-Origin", "Access-Control-Max-Age", "Access-Control-Request-Headers", "Access-Control-Request-Method", "Access-Control-Allow-Headers", "Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-User", "X-Access-Token", "Authorization", "Age", "Allow", "Alternates", "Authentication-Info", "Authorization", "Cache-Control", "Compliance", "Connection", "Content-Base", "Content-Disposition", "Content-Encoding", "Content-ID", "Content-Language", "Content-Length", "Content-Location", "Content-MD5", "Content-Range", "Content-Script-Type", "Content-Security-Policy", "Content-Style-Type", "Content-Transfer-Encoding", "Content-Type", "Content-Version", "Cookie", "DELETE", "Date", "ETag", "Expect", "Expires", "From", "GET", "GetProfile", "HEAD", "Host", "IM", "If", "If-Match", "If-Modified-Since", "If-None-Match", "If-Range", "If-Unmodified-Since", "Keep-Alive", "OPTION", "OPTIONS", "Optional", "Origin", "Overwrite", "POST", "PUT", "Public", "Referer", "Refresh", "Set-Cookie", "Set-Cookie2", "URI", "User-Agent", "X-Powered-By", "X-Requested-With", "_xser"]
}))

app.use(express.static('views/assets/images'));
app.use(express.static('public'));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

if (process.env.NODE_ENV == 'STAGING') {
    const { rateLimit } = require('express-rate-limit');
    const limiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        limit: 35,
    })
    app.use(limiter)
    app.set('trust proxy', 1);
}

app.use(cookieParser());
app.use(device.capture());
app.use('/api', imageUploadRouter);
const formatRequest = require('./middlewares/formatRequest');
app.use(formatRequest);

const v1Routes = require('./routes');
app.use('/v1', v1Routes);

app.use('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /

Sitemap: https://edulley.com/sitemap.xml
Sitemap: https://edulley.com/sitemap.txt

Disallow: /api/
Disallow: /admin/
Disallow: /login
Disallow: /dashboard
`);
});

app.use('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/prerender-check', (req, res) => {
  res.send('Prerender is correctly configured!');
});

app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.send({
        success: false,
        message: res.locals.message,
        error: res.locals.error
    });
});

module.exports = app;