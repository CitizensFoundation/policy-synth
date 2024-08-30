import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { GoldPlatingResearchAgent } from "./goldPlatingResearchAgent.js";

export class GoldPlatingResearchQueue extends PolicySynthAgentQueue {
  declare memory: GoldPlatingMemoryData;

  get agentQueueName(): string {
    return "GOLDPLATING_RESEARCH";
  }

  get processors() {
    return [
      {
        processor: GoldPlatingResearchAgent,
        weight: 100,
      },
    ];
  }

  getTestResearchItem(): GoldplatingResearchItem {
    return {
      name: "Lög um persónuvernd og vinnslu persónuupplýsinga",
      nationalLaw: {
        law: {
          // https://www.althingi.is/lagas/nuna/2018090.html
          url: "https://raw.githubusercontent.com/althingi-net/lagasafn-xml/master/data/xml/2018.90.xml",
          fullText: "",
          articles: [],
        },
        supportArticleText: {
          url: "https://yrpri-eu-direct-assets.s3.eu-west-1.amazonaws.com/2407/umPersonGreinargerd2.html",
          fullText: "",
          articles: [],
        },
      },
      supportArticleTextArticleIdMapping: {
        1: 1,
      },
      lastLawArticleNumber: 53,
      nationalRegulation: [
        {
          url: "https://island.is/reglugerdir/nr/0606-2023",
          fullText: "",
          articles: [],
        }
      ],
      euDirective: {
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679",
        fullText: "",
      },
    };
  }

  getTestResearchItemThree(): GoldplatingResearchItem {
    return {
      name: "Lög um fjarskipti",
      nationalLaw: {
        law: {
          // https://www.althingi.is/lagas/nuna/2022070.html
          url: "https://raw.githubusercontent.com/althingi-net/lagasafn-xml/master/data/xml/2022.70.xml",
          fullText: "",
          articles: [],
        },
        supportArticleText: {
          url: "https://www.althingi.is/altext/152/s/0666.html",
          fullText: "",
          articles: [],
        },
      },
      supportArticleTextArticleIdMapping: {
        1: 1,
      },
      lastLawArticleNumber: 109,
      nationalRegulation: [
        {
          url: "https://island.is/reglugerdir/nr/1227-2019",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/0034-2020",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/0480-2021",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/0945-2023",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/0845-2022",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/1350-2022",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/1100-2022",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/1588-2022",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/1589-2022",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/0555-2023",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/0556-2023",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/0422-2023",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/0944-2019",
          fullText: "",
          articles: [],
        },
      ],
      euDirective: {
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018L1972",
        fullText: "",
      },
    };
  }

  getTestResearchItemTwo(): GoldplatingResearchItem {
    return {
      name: "Lög um öryggi net- og upplýsingakerfa mikilvægra innviða",
      nationalLaw: {
        law: {
          // https://www.althingi.is/lagas/nuna/2019078.html
          url: "https://raw.githubusercontent.com/althingi-net/lagasafn-xml/master/data/xml/2019.78.xml",
          fullText: "",
          articles: [],
        },
        supportArticleText: {
          url: "https://www.althingi.is/altext/149/s/0557.html",
          fullText: "",
          articles: [],
        },
      },
      supportArticleTextArticleIdMapping: {
        1: 1,
        //...
      },
      nationalRegulation: [
        {
          url: "https://island.is/reglugerdir/nr/0866-2020",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/1720-2023",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/1255-2020",
          fullText: "",
          articles: [],
        },
      ],
      euDirective: {
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016L1148",
        fullText: "",
      },
    };
  }

  forceMemoryRestart = false;

  async setupMemoryIfNeeded(): Promise<void> {
    if (!this.memory || !this.memory.researchItems) {
      this.logger.info(`Setting up memory for agent ${this.agent.id}`);
      this.memory = {
        agentId: this.agent.id,
        researchItems: [this.getTestResearchItem()],
      } as GoldPlatingMemoryData;
    } else {
      this.logger.info(`Memory already set up for agent ${this.agent.id}`);
      this.memory.researchItems[0].nationalLaw.supportArticleText.url = "https://www.althingi.is/altext/148/s/1029.html";
    }
  }
}
