import {launch} from 'puppeteer-core';

const TWITTER_USERNAME = '';
const LOGIN_EMAIL = '';
const LOGIN_PWD = '';

(async () => {
  const browser = await launch({executablePath: '/usr/bin/google-chrome-stable', headless: false});
  const page = await browser.newPage();

  await page.goto('https://twitter.com', {
    waitUntil: 'networkidle2'
  });

  await page.waitForSelector('.StaticLoggedOutHomePage-buttonLogin');
  await page.click('.StaticLoggedOutHomePage-buttonLogin');

  await page.waitForSelector('.js-username-field');
  await page.type('.js-username-field', LOGIN_EMAIL);
  await page.type('.js-password-field', LOGIN_PWD);
  await page.keyboard.press('Enter');
  await page.waitForNavigation({waitUntil: 'networkidle2'});

  console.log('done login');

  const profileButton = (await page.$x(`//a[@href='/${TWITTER_USERNAME}']`))[0];
  await profileButton.click();
  await page.waitFor(3000);
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
    window.scrollBy(0, window.innerHeight);
    window.scrollBy(0, window.innerHeight);
  });

  console.log('done nav 2 profile');

  let count = 0;

  do {
    // Find caret
    await page.$x("//div[@aria-label='More']")
      .then(carets => carets[0])
      .then(caret => caret.click())
      .then(() => page.waitFor(1000))

      .then(() => page.$x("//span[normalize-space()='Delete']"))
      .then(elements => elements[0])
      .then(btn => btn.click())
      .then(() => page.waitFor(1000))

      .then(() => page.waitForXPath("//div[@data-testid='confirmationSheetConfirm']"))
      .then(delButton => delButton.click())

      .catch(err => console.log(err));

    // Scroll page
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 2);
    })
    .catch(err => console.log(err));

    // assign counter
    count = await page.$x("//div[@aria-label='More']")
      .then(carets => carets.length)
      .catch(err => console.log(err));
    console.log(`found ${count} carets remaining`)

  } while (count > 0);

  console.log('done deleting');

  await browser.close();
})();

