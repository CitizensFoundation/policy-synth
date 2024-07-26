import ioredis from 'ioredis';
const redis = new ioredis(process.env.REDIS_AGENT_URL || 'redis://localhost:6379');
// Get project id from params
const projectId = process.argv[2];
const addCustomUrls = async () => {
    if (projectId) {
        const output = await redis.get(`st_mem:${projectId}:id`);
        const memory = JSON.parse(output);
        memory.subProblems[1].customSearchUrls = [
            "https://www.reuters.com/world/us/pro-trump-activists-swamp-election-officials-with-sprawling-records-requests-2022-08-03",
            "https://www.cnn.com/2022/09/21/politics/public-records-requests-trump-supporters/index.html",
            "https://www.washingtonpost.com/nation/2022/09/11/trump-election-deniers-voting/",
            "https://www.brookings.edu/blog/fixgov/2021/11/30/trumps-judicial-campaign-to-upend-the-2020-election-a-failure-but-not-a-wipe-out/",
            "https://georgialawreview.org/article/27938-in-defense-of-the-foundation-stone-deterring-post-election-abuse-of-the-legal-process",
            "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4190480",
            "https://www.theguardian.com/us-news/2020/nov/10/trumps-vote-claims-go-viral-on-social-media-despite-curbs",
            "https://www.bu.edu/pilj/files/2021/06/Williams.pdf",
            "https://abcnews.go.com/Politics/lawyers-pushing-trump-election-challenges-calls-sanctionsmount/story?id=74544823",
            "https://www.washingtonpost.com/opinions/2022/03/07/trump-lawyers-election-misconduct-initiative-to-discipline/",
        ];
        memory.subProblems[5].customSearchUrls = [
            "https://www.washingtonpost.com/national-security/2022/08/03/election-worker-threats-judiciary/",
            "https://www.medrxiv.org/content/10.1101/2022.07.15.22277693v1",
            "https://bridgingdivides.princeton.edu/THD",
            "https://www.americanprogress.org/article/protecting-election-workers-and-officials-from-threats-and-harassment-during-the-midterms/",
            "https://assets.joycefdn.org/content/uploads/PV-Project-Findings-Memo-National.pdf",
            "https://carnegieendowment.org/2022/03/31/rise-in-political-violence-in-united-states-and-damage-to-our-democracy-pub-87584",
            "https://www.propublica.org/article/facebook-hosted-surge-of-misinformation-and-insurrection-threats-in-months-leading-up-to-jan-6-attack-records-show",
            "https://www.tandfonline.com/doi/full/10.1080/00963402.2020.1728976",
            "https://www.frontiersin.org/articles/10.3389/fpubh.2021.676783/full",
            "https://blog.ucsusa.org/derrick-jackson/democracy-under-attack-confronting-mounting-threats-to-us-election-workers/"
        ];
        memory.subProblems[6].customSearchUrls = [
            "https://www.nytimes.com/2016/11/15/opinion/when-reportage-turns-to-cynicism.html",
            "https://www.politico.com/news/magazine/2020/09/23/trump-america-authoritarianism-420681",
            "https://www.politico.com/news/magazine/2020/09/23/trump-america-authoritarianism-420681",
            "https://www.washingtonpost.com/opinions/2023/01/30/newsrooms-news-reporting-objectivity-diversity/",
            "https://www.cjr.org/tow_center/community-centered-outlets-empower-and-inform-latinos.php",
            "https://www.cjr.org/the_media_today/ai_software_chatgpt_journalism.php",
            "https://www.washingtonpost.com/opinions/2023/03/08/fox-news-texts-tucker-carlson-dominion-lawsuit-media-history/",
            "https://www.washingtonpost.com/opinions/2022/07/08/how-to-fix-news-media/",
            "https://apnews.com/article/2022-midterm-elections-technology-voting-donald-trump-campaigns-46c9cf208687636b8eaa1864c35ab300",
            "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0276367#sec013",
        ];
        await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
        process.exit(0);
    }
    else {
        console.log('No project id provided - add custom search urls');
        process.exit(1);
    }
};
addCustomUrls().catch(console.error);
//# sourceMappingURL=addCustomSearchUrls.js.map