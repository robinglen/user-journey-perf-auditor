import puppeteer from 'puppeteer';

async function performanceAudit(journey) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  console.time('journey');
  // await page.on('request', request => console.log('>>' + request.url));
  // await page.on('response', response => console.log('<<' + response.status + ' ' + response.url));
  await page.goto(journey[0].url);

  journey[0].metrics = await page.metrics();
  const performance = await page.evaluate(() => {
    let entries = performance.getEntries();

    let firstPaint = entries.filter(entry => {
      if (entry.name === 'first-paint') {
        return entry;
      }
    });

    let firstContentfulPaint = entries.filter(entry => {
      if (entry.name === 'first-contentful-paint') {
        return entry;
      }
    });

    let domainAssets = entries.filter(entry => {
      const domain = window.location.hostname;
      if (entry.entryType === 'resource' && entry.name.includes(domain)) {
        return entry;
      }
    });

    let thirdPartyAssets = entries.filter(entry => {
      const domain = window.location.hostname;
      if (entry.entryType === 'resource' && !entry.name.includes(domain)) {
        return entry;
      }
    });

    const obj = {
      firstPaint,
      firstContentfulPaint,
      domainAssets,
      thirdPartyAssets
    };
    return JSON.stringify(obj);
  });
  journey[0].performance = JSON.parse(performance);

  console.timeEnd('journey');
  console.log(journey[0].performance);
  await browser.close();
}

performanceAudit([
  {
    journey: 'Net-a-porter',
    title: 'homepage',
    url: 'http://www.net-a-porter.com'
  }
]);
