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
      name: "Lög um fjarskipti",
      nationalLaw: {
        law: {
          url: "https://www.althingi.is/lagas/nuna/2022070.html",
          fullText: "",
          articles: [],
        },
        supportArticleText: {
          url: "https://www.althingi.is/altext/154/s/1573.html",
          fullText: "",
          articles: [],
        },
      },
      supportArticleTextArticleIdMapping: {
        1: 1,
      },
      nationalRegulation: [
        {
          url: "https://files.reglugerd.is/pdf/1227-2019/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/0034-2020/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/0480-2021/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/0945-2023/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/0845-2022/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/1350-2022/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/1100-2022/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/1588-2022/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/1589-2022/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/0555-2023/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/0556-2023/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://island.is/reglugerdir/nr/0422-2023",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/0944-2019/current",
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
          url: "https://www.althingi.is/lagas/nuna/2019078.html",
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
      },
      nationalRegulation: [
        {
          url: "https://files.reglugerd.is/pdf/0866-2020/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/1720-2023/current",
          fullText: "",
          articles: [],
        },
        {
          url: "https://files.reglugerd.is/pdf/1255-2020/current",
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

  forceMemoryRestart = true;

  async setupMemoryIfNeeded(): Promise<void> {
    if (this.forceMemoryRestart || !this.memory) {
      this.memory = {
        agentId: this.agent.id, // Add this line
        researchItems: [this.getTestResearchItemTwo()],
      } as GoldPlatingMemoryData;
    }
  }
}
