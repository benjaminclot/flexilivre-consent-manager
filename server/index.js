import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Bot Detection
const botPatterns = {
  crawlers: /googlebot|adsbot|feedfetcher|mediapartners|bingbot|bingpreview|slurp|linkedinbot|msnbot|teoma|alexabot|exabot|facebot|facebook|twitter|yandex|baidu|duckduckbot|qwantify|qwantbot|archive|applebot|addthis|slackbot|reddit|whatsapp|pinterest|moatbot|google-xrawler|crawler|spider|crawling|oncrawl|NETVIGIE|PetalBot|PhantomJS|NativeAIBot|Cocolyzebot|SMTBot|EchoboxBot|Quora-Bot|scraper|BLP_bbot|MAZBot|ScooperBot|BublupBot|Cincraw|HeadlessChrome|diffbot|Google Web Preview|Doximity-Diffbot|Rely Bot|pingbot|cXensebot|PingdomTMS|AhrefsBot|robot|semrush|seenaptic|netvibes|taboolabot|SimplePie|APIs-Google|Google-Read-Aloud|googleweblight|DuplexWeb-Google|Google Favicon|Storebot-Google|TagInspector|Rigor|Bazaarvoice|KlarnaBot|pageburst|naver|iplabel/i,
  performance: /Chrome-Lighthouse|gtmetrix|speedcurve|DareBoost|PTST|StatusCake_Pagespeed_Indev/i,
};

app.use((req, res, next) => {
  const userAgent = req.get('User-Agent');

  if (userAgent && Object.values(botPatterns).some(pattern => pattern.test(userAgent))) {
    console.log(`Bot detected: ${userAgent}. Blocking access.`);

    if (req.path.match(/\/consent(\.min)?\.js/)) {
      res.set('Content-Type', 'application/javascript');
      return res.send('// Bot detected, no consent needed');
    }
  }

  next();
});

// Serve static files from dist and public
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../public')));

// Start build watcher
function startBuildWatcher() {
  console.log('Starting build watcher...');
  const buildProcess = spawn('node', ['scripts/build.js', '--watch'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });

  buildProcess.on('error', (err) => {
    console.error('Failed to start build watcher:', err);
  });

  return buildProcess;
}

// Start server
app.listen(PORT, () => {
  console.log(`\nConsent Manager Dev Server running at http://localhost:${PORT}`);
  console.log('Serving static files from /dist and /public\n');
  startBuildWatcher();
});
