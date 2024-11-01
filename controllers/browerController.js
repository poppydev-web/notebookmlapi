const puppeteer = require('puppeteer');
let page = null;
let flag = false;

exports.launchBrowser = async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'], // Required for restricted environments
    });
    page = await browser.newPage();
    page.setDefaultTimeout(600000);
    //  page = newPage;
    // page.push(newpage);
    // return page.length - 1;
}

exports.setNotebookName = async (audioId) => {
    await page.click('input.title-input');
    await new Promise(resolve => setTimeout(resolve, 200));
    // Clear any existing text in the input field
    await page.keyboard.down('Control'); // For macOS, use 'Meta' instead of 'Control'
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.press('A');
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.up('Control');
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.press('Backspace');
    await new Promise(resolve => setTimeout(resolve, 200));
    // Now type the new data
    await page.type('input.title-input', audioId);
    await new Promise(resolve => setTimeout(resolve, 1000));
}

const clickGoogleDocs = async () => {
    // Wait for the span elements to load
    await page.waitForFunction(() => {
        const elements = [...document.querySelectorAll('span')];
        return elements.some(el => el.textContent.includes("Google Docs"));
    });

    // Find the specific span with text "Google Docs" and click it
    const elements = await page.$$('span');
    for (const element of elements) {
        const text = await page.evaluate(el => el.textContent, element);
        if (text.includes("Google Docs")) {
            await element.click();
            break;
        }
    }
}

const clickText = async () => {
    console.log('inside clickText');
    await page.waitForFunction(() => {
        const elements = [...document.querySelectorAll('span')];
        return elements.some(el => el.textContent.includes("Copied text"));
    });
    const elements = await page.$$('span');
    for (const element of elements) {
        const text = await page.evaluate(el => el.textContent, element);
        if (text.includes("Copied text")) {
            await element.click();
            break;
        }
    }
}

exports.newNotebook = async () => {
    console.log('Navigating to dashboard...');
    await page.goto(process.env.NOTEBOOKML_TOKEN_URL);
    console.log('Clicking New Notebook button...');

    await page.waitForSelector('span.create-new-label', { visible: true });

    // Check if the text content matches "Create new" and click it
    const createNewButton = await page.$('span.create-new-label');
    const text = await page.evaluate(element => element.textContent, createNewButton);

    if (text.includes("Create new")) {
        await createNewButton.click();
    }
    console.log('Creation successful!');
}

exports.loginGoogle = async () => {

    console.log('navigating to signin');
    await page.goto('https://accounts.google.com/signin', { timeout: 600000 });

    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', process.env.NOTEBOOKML_EMAIL);
    await page.click('#identifierNext');
    // await page.waitForTimeout(1000); // adjust timing if needed
    await new Promise(resolve => setTimeout(resolve, 10000));

    await page.waitForSelector('div[jsname="YRMmle"]', { visible: true });
    console.log('password appeared');
    await page.type('input[jsname="YPqjbf"]', process.env.NOTEBOOKML_PASSWORD);
    await page.click('#passwordNext');

    // // Wait for login to complete and navigate to your page
    // await page.waitForNavigation();
    // await page.goto('https://www.example.com'); // Replace with your actual target URL

    // // Locate and click "Google Docs" button
    // const [button] = await page.$x("//span[contains(text(), 'Google Docs')]");
    // if (button) await button.click();
}

const clickResourceButton = async () => {
    console.log("inside clickResourcebutton");
    await page.waitForSelector('mat-icon.mat-icon.notranslate.icon.google-symbols.mat-icon-no-color', { visible: true });

    // Check if the text content matches "Create new" and click it
    await page.evaluate(() => {
        const matIcons = document.querySelectorAll('mat-icon');
        Array.from(matIcons).map(icon => {
            if (icon.textContent.trim() == 'add_box') {
                icon.click();
            }
        });
    });

}

const addGoogleDoc = async (googledoc_url) => {
    console.log("inside addGoogleDoc");
    await page.waitForFunction(() => {
        return Array.from(document.querySelectorAll('span')).some(el => el.textContent.trim() === 'Google Docs');
    });
    // Now evaluate to find and click the element
    await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('span'));
        const targetElement = elements.find(el => el.textContent.trim() === 'Google Docs');

        if (targetElement) {
            targetElement.click();
            console.log("Clicked on 'Google Docs' element.");
        } else {
            console.log("Element with text 'Google Docs' not found.");
        }
    });

    async function waitForFrame(page, urlPart) {
        let frame;
        while (!frame) {
            frame = page.frames().find(f => f.url().includes(urlPart));
            if (!frame) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return frame;
    }

    // Use the custom function to get the iframe when it's ready
    const frame = await waitForFrame(page, 'https://docs.google.com/picker/v2/home');

    console.log(frame);

    // Step 2: Ensure the iframe is fully loaded and locate the input within it
    const inputSelector = 'input.Ax4B8.ZAGvjd';
    await frame.waitForSelector(inputSelector, { visible: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Step 3: Type into the input element

    await frame.click('input.Ax4B8.ZAGvjd');
    await new Promise(resolve => setTimeout(resolve, 200));
    // Clear any existing text in the input field
    await page.keyboard.down('Control'); // For macOS, use 'Meta' instead of 'Control'
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.press('A');
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.up('Control');
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.press('Backspace');
    await new Promise(resolve => setTimeout(resolve, 200));
    // Now type the new data

    await frame.type(inputSelector, googledoc_url);

    // Wait for the parent <div> to be visible
    const parentSelector = 'div.I7ZCxe[jsname="KzBUhd"][tabindex="-1"]';
    await frame.waitForSelector(parentSelector, { visible: true });

    // Now look for the <svg> within the parent <div>
    const svgSelector = 'div.I7ZCxe[jsname="KzBUhd"][tabindex="-1"] > svg.xduR';
    const svgElement = await frame.$(svgSelector);

    // Check if the <svg> element is found and click it
    if (svgElement) {
        await svgElement.click(); // Click the <svg> element
        console.log('SVG element clicked.');

        // Wait for the specified <div> to appear
        const targetDivSelector = 'div.eizQhe-ObfsIf-mJRMzd-PFprWc-YbohUe-VtOx3e';
        await frame.waitForSelector(targetDivSelector, { visible: true });

        // Now double click the target <div>
        const targetDivElement = await frame.$(targetDivSelector);
        if (targetDivElement) {
            await targetDivElement.click({ clickCount: 2 }); // Double click the <div>
            console.log('Target <div> double clicked.');

            // Wait for the <span> with text "Sources" to appear on the page (not in the iframe)
        } else {
            console.log('Target <div> not found after click.');
        }
    } else {
        console.log('SVG element not found.');
    }
}

const addText = async (text) => {
    console.log("inside addText");
    await page.waitForSelector('textarea[formcontrolname="text"]', { visible: true });
    // Type some text into the <textarea>
    await page.type('textarea[formcontrolname="text"]', text);

    await page.waitForSelector('span.mdc-button__label', { visible: true });

    // Find and click the span with text "Insert"
    const isClicked = await page.evaluate(() => {
        const spans = document.querySelectorAll('span.mdc-button__label');
        for (const span of spans) {
            if (span.textContent.trim() === 'Insert') {
                span.click(); // Click the span element
                return true; // Indicate that the span was clicked
            }
        }
        return false; // Indicate that no span was clicked
    });

    if (isClicked) {
        console.log("Clicked on the 'Insert' button.");
    } else {
        console.log("'Insert' button not found.");
    }
}



exports.clickGenerate = async () => {
    await page.click('input.title-input');
    // Clear any existing text in the input field
    await page.keyboard.down('Control'); // For macOS, use 'Meta' instead of 'Control'
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    // Now type the new data
    await page.type('input.title-input', audioId);

    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("inside clickGenerate");
    await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('span.mdc-button__label'));
        const targetElement = elements.find(el => el.textContent.trim() === 'Generate');

        if (targetElement) {
            targetElement.click();
        }
    });

}

const waitForInputWithRetry = async (interval = 1000, timeout = 300000) => {
    const startTime = Date.now();
    const selector = 'input.mdc-slider__input'
    // Retry loop: check periodically if the input exists on the page
    while (Date.now() - startTime < timeout) {
        const inputExists = await page.evaluate((selector) => {
            return document.querySelector(selector) !== null;
        }, selector);

        if (inputExists) {
            console.log("Input element appeared on the page.");
            return true;
        }

        // Wait for the specified interval before checking again
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    console.log("Input element did not appear within the timeout period.");
    return false;
}

const clickCustomize = async () => {
    console.log("inside clickGenerate");
    await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('span.mdc-button__label'));
        const targetElement = elements.find(el => el.textContent.trim() === 'Customize');

        if (targetElement) {
            targetElement.click();
        }
    });
}
const page_nav_speed = 2000;

exports.clickSmallGenerateButton = async () => {
    const clicked = await page.evaluate(() => {
        // Get all elements with the "generate-button" class
        const buttons = Array.from(document.querySelectorAll('button.generate-button'));

        // Find the first button that does not have the "call-to-action-button-wide" class
        const targetButton = buttons.find(button => !button.classList.contains('call-to-action-button-wide'));

        // Click the button if it exists
        if (targetButton) {
            targetButton.click();
            return true; // Return true if clicked
        }
        return false; // Return false if no such button was found
    });

    if (clicked) {
        console.log("Clicked the second button.");
    } else {
        console.log("Second button not found.");
    }
}

exports.addGoogleDocs = async (google_docs) => {
    console.log("inside addGoogleDocs");
    for (const google_doc of google_docs) {
        if (flag) {
            await clickResourceButton();
            await new Promise(resolve => setTimeout(resolve, page_nav_speed));
        }
        await clickGoogleDocs();
        await new Promise(resolve => setTimeout(resolve, page_nav_speed));
        await addGoogleDoc(google_doc);
        await new Promise(resolve => setTimeout(resolve, page_nav_speed));
        flag = 1;
    }
}

exports.addTexts = async (texts) => {
    console.log("inside addTexts");
    for (const text of texts) {
        if (flag) {
            await clickResourceButton();
            await new Promise(resolve => setTimeout(resolve, page_nav_speed));
        }
        await clickText();
        await new Promise(resolve => setTimeout(resolve, page_nav_speed));
        await addText(text);
        await new Promise(resolve => setTimeout(resolve, page_nav_speed));
        flag = 1;
    }
}



exports.addPrompt = async (prompt) => {
    console.log("inside addPrompt");
    clickCustomize();
    await page.waitForSelector('textarea[formcontrolname="episodeFocus"]', { visible: true });
    // Type some text into the <textarea>
    await page.type('textarea[formcontrolname="episodeFocus"]', prompt);
    await new Promise(resolve => setTimeout(resolve, 1000));
}

exports.getSrc = async (audioId) => {
    await waitForInputWithRetry();
    await page.evaluate(() => {
        const matIcons = document.querySelectorAll('mat-icon');
        Array.from(matIcons).map(icon => {
            if (icon.textContent.trim() == 'more_vert') {
                icon.click();
            }
        });
    });

    await waitForInputWithRetry();
    console.log(audioId);

    await page.evaluate(() => {
        const matIcons = document.querySelectorAll('mat-icon');
        Array.from(matIcons).map(icon => {
            if (icon.textContent.trim() == 'download') {
                icon.click();
            }
        });
    });
}