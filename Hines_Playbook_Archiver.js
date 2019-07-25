/**
 *  @name Hines Playbook Archiver
 * 
 *  @description Web scraper to collect all of the content from the Hinezonia Playbook
 * 
 *  @version 1.0
 * 
 *  @author Mario Rodriguez
 * 
 *  @require puppeteer, fs, path, chalk, figlet
 */

//TODO List =========================================================================================================
  //DONE: Query Amazon Wiki to retrieve all Hines playbooks and load into a links array
  //DONE: Capture playbook html content and save to file
  //TODO: Capture all image content, save to file and connect to appropriate pages
  //TODO: Have internal document links within each playbook reference downloaded pages (library needs to be self contained)
  //ADD Diff check to check for only updated pages
  //ADD Welcome splash
  //ADD Progress Bar
// ==================================================================================================================

// Variable =========================================================================================================
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');
const inquire = require('inquire');
const log = console.log;
const rootSite = 'https://w.amazon.com';


// MAIN FUNCTION ====================================================================================================
//===================================================================================================================
(async () => {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const linksSelector = 'tbody.xwiki-livetable-display-body tr td.doc_title a';

  await page.goto('https://w.amazon.com/bin/view/GREF/Playbook/?viewer=children#|t=childrenIndex&p=1&l=500');

// Construct array of all playbook pages to traverse for archival ===============================================

  await page.waitForSelector(linksSelector, {timeout: 0 });//a bit of a delay to have our content loaded
  const links = await page.$$eval(linksSelector, anchors => { return anchors.map(anchor => anchor.getAttribute('href')).slice(0, 5) }); //slice is for testing, remove once script is runing or modify to include all available links
  log("");
  log(chalk.cyan('PAGES TO SAVE:'));
  log("");
  log(links);
  log("");

  await browser.close()

//==================================================================================================================

// Traverse the returned links array and capture the page content, convert links to relative
// links, and save the file

  for (let i = 0; i < links.length; i++) {

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    let site = rootSite + links[i];
    
    log(chalk.bold.yellow(`GOING TO: ${site}`));
    log("");

    await page.goto(rootSite + links[i]);

    const pageTitle = await page.evaluate(() => document.querySelector('#document-title h1').textContent);
    log(chalk.green.bold("Page title: " + pageTitle));
    log("");

    const htmlContent = await page.evaluate(() => document.querySelector('div.xcontent').innerHTML);
    const htmlContWithRelLinks = htmlContent.replace(/https:\/\/w\.amazon\.com\/bin\/view\/GREF\/Playbook\/?/g, "/");

    // console.log("HTML content: " + htmlContent);
    // console.log(htmlContWithRelLinks);
    // console.log("HTML content: " + htmlContWithRelLinks);

    log("");

    const imageLinks = await page.$$eval('img', anchors => { return anchors.map(anchor => anchor.getAttribute('src'))});
    log("Image links: ");
    log(imageLinks);
    log("");

    for(let i = 0; i < imageLinks.length; i++) {
      let imageName;
      imageURISplit = imageLinks[i].split("/");
      log(imageURISplit);
      log("");
      
      imageName = imageURISplit[imageURISplit.length - 1];
      log(imageName);
      log("");

      // downloadImage(imageLinks[i], imageName, function() {
      //   log("File Downloaded");
      // })
    }
    
    // fs.writeFile(pageTitle + ".html", htmlContWithRelLinks, (err) => {
    //   if (err) throw err;
    // });

    await browser.close();

  }

})();

