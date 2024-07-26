import puppeteer from "puppeteer-extra";

import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { htmlToText } from "html-to-text";


import ioredis from "ioredis";
import { PdfReader } from "pdfreader";
import axios from "axios";
import { Page } from "puppeteer";

const redis = new ioredis(
  process.env.REDIS_AGENT_URL || "redis://localhost:6379"
);

async function getAndProcessPdf(
  subProblemIndex: number | undefined,
  url: string,
  browserPage: Page,
  type: PsWebPageTypes
) {
  return new Promise<void>(async (resolve, reject) => {
    console.log("getAndProcessPdf");

    try {
      let finalText=""
      let pdfBuffer;

      const redisKey = `pg_ca_v5p:${url}`;
      const cachedHtml = await redis.get(redisKey);

      if (cachedHtml) {
        pdfBuffer = Buffer.from(cachedHtml, 'base64');
      } else {
        const axiosResponse = await axios.get(url, {
          responseType: "arraybuffer",
        });

        pdfBuffer = axiosResponse.data;

        if (pdfBuffer) {
          //this.logger.debug(`Caching response`);
          const base64Pdf = Buffer.from(pdfBuffer).toString('base64');

          await redis.set(
            redisKey,
            base64Pdf,
            "EX",
            1000000
            //this.getPageCacheExpiration
          );
        }
      }

      if (pdfBuffer) {
        console.log(pdfBuffer);
        try {
          new PdfReader({}).parseBuffer(
            pdfBuffer,
            function (err:any, item:any) {
              if (err) {
                console.error("XXIJDIOSJDasiojdiasjdasjdsjods")
                console.error(err);
                //this.logger.error(err);
                resolve();
              }
              else if (!item) {
                finalText = finalText.replace(/(\r\n|\n|\r){3,}/gm, "\n\n");
                console.log(`Got final text: ${finalText}`);
                //await this.processPageText(text, subProblemIndex, url, type);
                resolve();
              }
              else if (item.text) {
                finalText += item.text+ " ";
              }
            }
          );
        } catch (e) {
          console.error(e);
          //this.logger.error(e);
          resolve();
        }
      } else {
        //this.logger.error(`No PDF buffer`);
        resolve();
      }
    } catch (e) {
      //this.logger.error(e);
      console.log(e);
      resolve();
    }
  });
}

async function getAndProcessHtml(
  subProblemIndex: number | undefined,
  url: string,
  browserPage: Page,
  type: PsWebPageTypes
) {
  try {
    let finalText, htmlText;

    const redisKey = `pg_ca_v2t:${url}`;
    const cachedHtml = await redis.get(redisKey);

    if (cachedHtml) {
      htmlText = cachedHtml;
    } else {
      const response = await browserPage.goto(url, {
        waitUntil: "networkidle0",
      });
      if (response) {
        htmlText = await response.text();
        if (htmlText) {
          await redis.set(
            redisKey,
            htmlText.toString(),
            "EX",
            1000000
            //this.getPageCacheExpiration
          );
        }
      }
    }

    if (htmlText) {
      //this.logger.debug(`Caching response`);
      finalText = htmlToText(htmlText, {
        wordwrap: false,
        selectors: [
          {
            selector: "a",
            format: "skip",
            options: {
              ignoreHref: true,
            },
          },
          {
            selector: "img",
            format: "skip",
          },
          {
            selector: "form",
            format: "skip",
          },
          {
            selector: "nav",
            format: "skip",
          },
        ],
      });

      finalText = finalText.replace(/(\r\n|\n|\r){3,}/gm, "\n\n");

      //this.logger.debug(`Got HTML text: ${text}`);
      console.log(`Got final text: ${finalText}`);
      //await this.processPageText(text, subProblemIndex, url, type);
    } else {
      //this.logger.error(`No HTML text found for ${url}`);
    }
  } catch (e) {
    //this.logger.error(e);
    console.log(e);
  }
}

//@ts-ignore
puppeteer.use(StealthPlugin());

let url = "https://edition.cnn.com/2023/07/09/politics/cluster-bombs-ukraine-reaction-cnntv/index.html";

puppeteer.launch({ headless: true }).then(async (browser) => {
  const page = await browser.newPage();

  if (url.includes("/pdf/") && url.includes("arxiv") && !url.endsWith(".pdf")) {
    url = `${url}.pdf`;
  }

  console.log(url);

  if (url.endsWith(".pdf")) {
    await getAndProcessPdf(1, url, page, "general");
  } else {
    await getAndProcessHtml(1, url, page, "general");
  }

  await browser.close();

  process.exit(0);
});
