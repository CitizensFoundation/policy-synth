export class EvidenceExamplePrompts {
    static render(evidenceType) {
        switch (evidenceType) {
            case "positiveEvidence":
                return EvidenceExamplePrompts.renderPositiveEvidence();
            case "negativeEvidence":
                return EvidenceExamplePrompts.renderNegativeEvidence();
            case "neutralEvidence":
                return EvidenceExamplePrompts.renderNeutralEvidence();
            case "economicEvidence":
                return EvidenceExamplePrompts.renderEconomicEvidence();
            case "scientificEvidence":
                return EvidenceExamplePrompts.renderScientificEvidence();
            case "culturalEvidence":
                return EvidenceExamplePrompts.renderCulturalEvidence();
            case "environmentalEvidence":
                return EvidenceExamplePrompts.renderEnvironmentalEvidence();
            case "legalEvidence":
                return EvidenceExamplePrompts.renderLegalEvidence();
            case "technologicalEvidence":
                return EvidenceExamplePrompts.renderTechnologicalEvidence();
            case "geopoliticalEvidence":
                return EvidenceExamplePrompts.renderGeopoliticalEvidence();
            case "caseStudies":
                return EvidenceExamplePrompts.renderCaseStudies();
            case "stakeholderOpinions":
                return EvidenceExamplePrompts.renderStakeholderOpinions();
            case "expertOpinions":
                return EvidenceExamplePrompts.renderExpertOpinions();
            case "publicOpinions":
                return EvidenceExamplePrompts.renderPublicOpinions();
            case "historicalContext":
                return EvidenceExamplePrompts.renderHistoricalContext();
            case "ethicalConsiderations":
                return EvidenceExamplePrompts.renderEthicalConsiderations();
            case "longTermImpact":
                return EvidenceExamplePrompts.renderLongTermImpact();
            case "shortTermImpact":
                return EvidenceExamplePrompts.renderShortTermImpact();
            case "localPerspective":
                return EvidenceExamplePrompts.renderLocalPerspective();
            case "globalPerspective":
                return EvidenceExamplePrompts.renderGlobalPerspective();
            case "costAnalysis":
                return EvidenceExamplePrompts.renderCostAnalysis();
            case "implementationFeasibility":
                return EvidenceExamplePrompts.renderImplementationFeasibility();
            default:
                throw new Error("Unknown evidence type");
        }
    }
    static renderPositiveEvidence() {
        return `
      Open data portals
      Open data portals facilitate access to and reuse of public sector information. They can help encourage cross-border use of reusable data in Europe.

          Laptop with a book behind it

      © iStock by Getty Images -940972538 Bet_Noire

      Open data portals are web-based interfaces designed to make it easier to find reusable information. Like library catalogues, they contain metadata records of datasets published for reuse, mostly relating to information in the form of raw, numerical data rather than textual documents.

      In combination with specific search functionalities, they facilitate finding datasets of interest. Application programming interfaces (APIs) are often available as well, offering direct and automated access to data for software applications.

      Open data portals are an important element of most open data initiatives and are mainly used by public administrations at European, national and local level in EU countries. Notable examples of Open Data portals maintained by public administrations in Europe are:

      opendata.paris.fr
      www.data.gouv.fr
      www.dati.piemonte.it
      www.dati.gov.it
      www.data.overheid.nl
      While supporting policy development by offering easy access to published data, open data portals can also work as a catalyst triggering the publication of more and better quality data. For administrations obliged or willing to disseminate their data, they offer the advantage of providing public access without the need to reply to individual requests for access to data. And, more and more companies are opening up some of their data for developers to reuse.

      The European Commission offers an open data portal for any type of information held by the Commission and other EU institutions and bodies. The European Union's Open Data Portal has been in operation since December 2012.

      The European Data Portal
      The European Commission has funded the European Data Portal through the Connecting Europe Facility programme. The portal is a pan-European repository of public sector information open for reuse in the EU. It offers a training centre on how to reuse open data and a database of success stories from European and international re-users.

      The principal function of the European Data Portal is to provide a single point of access in all 24 EU official languages for data published by public administrations at all levels of government in Europe (EU countries, countries of the European Economic Area and certain other European countries).

      In order to foster comparability of data published across borders, it presents metadata references in a common format (Data Catalog Vocabulary application profile for data portals in Europe), using resource description framework (RDF) technology.  It provides translations of metadata descriptions in all 24 languages using machine-translation technology.

      The portal complements national, regional and thematic open data portals, and the EU's Open Data Portal. Each of these portals target relevant user audiences, offering tailored content. This infrastructure will stimulate cross-border use of reusable information in Europe by improving the findability of data across countries and supporting the development of data applications and products including data from different countries.

      JSON Output:
        {
        "summary": "Open data portals are web-based platforms that make public sector information easily accessible and reusable, primarily in the form of raw, numerical data. These platforms support policy development, catalyze the publication of high-quality data, and offer public access without individual data access requests. The European Commission offers an open data portal which provides a single point of access for data from various European public administrations.",
          "mostRelevantParagraphs": [
              "Open data portals facilitate access to and reuse of public sector information. They can help encourage cross-border use of reusable data in Europe.",
              "Open data portals are web-based interfaces designed to make it easier to find reusable information. Like library catalogues, they contain metadata records of datasets published for reuse, mostly relating to information in the form of raw, numerical data rather than textual documents.",
              "While supporting policy development by offering easy access to published data, open data portals can also work as a catalyst triggering the publication of more and better quality data. For administrations obliged or willing to disseminate their data, they offer the advantage of providing public access without the need to reply to individual requests for access to data.",
              "The European Commission offers an open data portal for any type of information held by the Commission and other EU institutions and bodies.",
              "The principal function of the European Data Portal is to provide a single point of access in all 24 EU official languages for data published by public administrations at all levels of government in Europe (EU countries, countries of the European Economic Area and certain other European countries).",
              "This infrastructure will stimulate cross-border use of reusable information in Europe by improving the findability of data across countries and supporting the development of data applications and products including data from different countries."
          ]
      },
          "allPossiblePositiveEvidenceIdentifiedInTextContext": [
              "Open data portals facilitate access to and reuse of public sector information.",
              "Open data portals are web-based interfaces designed to make it easier to find reusable information.",
              "In combination with specific search functionalities, they facilitate finding datasets of interest.",
              "Open data portals are an important element of most open data initiatives and are mainly used by public administrations at European, national and local level in EU countries.",
              "While supporting policy development by offering easy access to published data, open data portals can also work as a catalyst triggering the publication of more and better quality data.",
              "For administrations obliged or willing to disseminate their data, they offer the advantage of providing public access without the need to reply to individual requests for access to data.",
              "The European Commission offers an open data portal for any type of information held by the Commission and other EU institutions and bodies.",
              "The European Data Portal is to provide a single point of access in all 24 EU official languages for data published by public administrations at all levels of government in Europe.",
              "In order to foster comparability of data published across borders, it presents metadata references in a common format.",
              "This infrastructure will stimulate cross-border use of reusable information in Europe by improving the findability of data across countries and supporting the development of data applications and products including data from different countries."
          ],
        "relevanceToPolicyProposal": "The text provides insights into the potential effectiveness and importance of open data portals as a tool to increase transparency and trust in democratic institutions. Open data portals can simplify the process of accessing public sector data and encourage cross-border usage, making government data comprehensible and accessible. As mentioned in the policy proposal, an intuitively navigable and comprehensive platform that renders government data comprehensible and accessible can foster transparency and enhance democratic trust, and the provided text supports this claim."
      }
    `;
    }
    static renderNegativeEvidence() {
        return `
      Optimal Obfuscation: Democracy and Trade Policy Transparency
      DANIEL Y. KONO University of California at Davis
      Agrowing body of research shows that democracies have more liberal trade policies than do
      autocracies. I argue, in contrast, that democracy has contradictory effects on different types of
      trade policies because electoral competition generates more information about some than about
      others. It generates considerable information about policies whose effects on consumer welfare are easy
      to explain to voters, but less information about policies whose effects are more complex. By increasing
      the transparency of some policies relative to others, democracy induces politicians to reduce transparent
      trade barriers but also to replace them with less transparent ones. I test this hypothesis by examining the
      impact of democracy on tariffs, “core” nontariff barriers (NTBs) such as quotas, and “quality” NTBs
      such as product standards in 75 countries in the 1990s. I find that democracy leads to lower tariffs, higher
      core NTBs, and even higher quality NTBs. I conclude that democracy promotes “optimal obfuscation”
      that allows politicians to protect their markets while maintaining a veneer of liberalization.
      Does democracy promote free trade? The global
      rise of democracy makes this question practically as well as theoretically important. If the
      answer is yes, then the spread of democracy will foster
      economic integration, which may in turn promote economic development (Frankel and Romer 1999) and
      reduce the likelihood of war (Polachek 1980). This
      was clearly the Clinton Administration’s hope when
      it claimed that that “Promoting democracy does more
      than foster our ideals. It advances our interests . ...
      Democracies create free markets that offer economic
      opportunity [and] make for more reliable trading partners” (The White House 1996, 2). Although such
      rhetoric is easy to dismiss, it is in this case backed
      by empirical research: studies show that democracies
      trade more than autocracies (Bliss and Russett 1998),
      have lower tariffs (Milner and Kubota 2005), and are
      more likely to conclude liberalizing trade agreements
      (Mansfield, Milner, and Rosendorff 2002). In fact, the
      finding that democracy promotes trade openness is
      among the most robust in the field of international
      political economy.
      There is good reason to expect this to be so. Votersas-consumers prefer liberal trade policies that lower
      prices and raise real incomes. Democratic politicians
      need votes to stay in power. Competition for votes
      should thus drive democratic leaders toward liberal
      policy positions. However, while this argument is intuitively appealing, it assumes that voters-as-principals
      have sufficient information to discipline politiciansas-agents. In reality, this may not be true, in which
      case democratic leaders have few incentives to liberalize trade. Moreover, politicians may be able to manipulate the flow of information by choosing policies,
      Daniel Y. Kono is Assistant Professor, Department of Political Science, University of California at Davis, One Shields Avenue, Davis,
      CA 95616-8682 (dykono@ucdavis.edu).
      I am especially grateful to Bob Jackman, Jeannette Money, and
      Gabriella Montinola for reading and commenting on multiple drafts
      of this paper. I also thank David Bearce, Christina Davis, Tim
      McKeown, Lee Sigelman, Bob Taylor, and three anonymous reviewers for the APSR for helpful comments, and Greg Love for research
      assistance. Any errors are, of course, my own.
      such as technical barriers to trade, whose effects on
      consumer welfare are harder to discern than those of
      tariffs. If electoral concerns lead politicians to practice
      such “optimal obfuscation” (Magee, Brock, and Young
      1989), then democracy may not affect the level of trade
      protection at all. Rather, it may simply alter its form,
      causing politicians to replace transparent trade barriers
      with less transparent ones.
      The practice of obfuscation would have important
      implications for several scholarly and policy debates.
      First, it would force us to rethink the relationship between democracy and trade openness. If democracies
      liberalize with one hand but protect, surreptitiously,
      with the other, then the net impact of democracy on
      trade policy is unclear. Second, obfuscation would cast
      doubt on the common assertion that democracy leads
      to efficient policies (Becker 1983; Wittman 1989). If
      obfuscation leads to complex policies, and if complex policies are inefficient—–as they often are—–then
      democracy might well produce policy inefficiency. Finally, the practice of obfuscation would challenge the
      conventional wisdom concerning democracy and policy transparency. Most scholars believe that democracies provide more policy transparency than autocracies (Bueno de Mesquita et al. 2003; Rosendorff and
      Vreeland 2004). If obfuscation is prevalent, however,
      then the spotlight of electoral competition may lead
      politicians to provide, not more information, but more
      creative efforts to cover their tracks.
      DEMOCRACY AND TRADE POLICY
      The claim that democracy promotes trade liberalization rests on three propositions. First, all governments
      face interest-group demands for protection and are responsive to these pressures in some degree. Second,
      mass publics prefer more liberal trade policies than
      would be produced by interest-group pressures alone.
      Third, democratic governments are more responsive
      than autocratic ones to popular pressures. All three
      propositions are reasonable. The salience of interestgroup demands across a wide variety of countries
      has been demonstrated by “demand-side” research

      JSON Output:
        {
        "summary": "The text discusses the relationship between democracy and trade policy transparency, suggesting that while democracy might promote trade liberalization, it can also lead to obfuscation, where transparent trade barriers are replaced with less transparent ones. The democratic process may not guarantee that politicians provide more information, but might motivate them to engage in more creative efforts to obscure their actions.",
        "mostRelevantParagraphs": [
          "Agrowing body of research shows that democracies have more liberal trade policies than do autocracies. I argue, in contrast, that democracy has contradictory effects on different types of trade policies because electoral competition generates more information about some than about others. It generates considerable information about policies whose effects on consumer welfare are easy to explain to voters, but less information about policies whose effects are more complex. By increasing the transparency of some policies relative to others, democracy induces politicians to reduce transparent trade barriers but also to replace them with less transparent ones. I test this hypothesis by examining the impact of democracy on tariffs, “core” nontariff barriers (NTBs) such as quotas, and “quality” NTBs such as product standards in 75 countries in the 1990s. I find that democracy leads to lower tariffs, higher core NTBs, and even higher quality NTBs. I conclude that democracy promotes “optimal obfuscation” that allows politicians to protect their markets while maintaining a veneer of liberalization.",
          "There is good reason to expect this to be so. Votersas-consumers prefer liberal trade policies that lower prices and raise real incomes. Democratic politicians need votes to stay in power. Competition for votes should thus drive democratic leaders toward liberal policy positions. However, while this argument is intuitively appealing, it assumes that voters-as-principals have sufficient information to discipline politiciansas-agents. In reality, this may not be true, in which case democratic leaders have few incentives to liberalize trade. Moreover, politicians may be able to manipulate the flow of information by choosing policies, such as technical barriers to trade, whose effects on consumer welfare are harder to discern than those of tariffs. If electoral concerns lead politicians to practice such “optimal obfuscation” (Magee, Brock, and Young 1989), then democracy may not affect the level of trade protection at all. Rather, it may simply alter its form, causing politicians to replace transparent trade barriers with less transparent ones.",
          "The practice of obfuscation would have important implications for several scholarly and policy debates. First, it would force us to rethink the relationship between democracy and trade openness. If democracies liberalize with one hand but protect, surreptitiously, with the other, then the net impact of democracy on trade policy is unclear. Second, obfuscation would cast doubt on the common assertion that democracy leads to efficient policies (Becker 1983; Wittman 1989). If obfuscation leads to complex policies, and if complex policies are inefficient—–as they often are—–then democracy might well produce policy inefficiency. Finally, the practice of obfuscation would challenge the conventional wisdom concerning democracy and policy transparency. Most scholars believe that democracies provide more policy transparency than autocracies (Bueno de Mesquita et al. 2003; Rosendorff and Vreeland 2004). If obfuscation is prevalent, however, then the spotlight of electoral competition may lead politicians to provide, not more information, but more creative efforts to cover their tracks."
        ],
      "allPossibleNegativeEvidenceIdentifiedInTextContext": [
          "democracy has contradictory effects on different types of trade policies because electoral competition generates more information about some than about others.",
          "By increasing the transparency of some policies relative to others, democracy induces politicians to reduce transparent trade barriers but also to replace them with less transparent ones.",
          "democracy promotes “optimal obfuscation” that allows politicians to protect their markets while maintaining a veneer of liberalization.",
          "However, while this argument is intuitively appealing, it assumes that voters-as-principals have sufficient information to discipline politiciansas-agents. In reality, this may not be true, in which case democratic leaders have few incentives to liberalize trade.",
          "politicians may be able to manipulate the flow of information by choosing policies, such as technical barriers to trade, whose effects on consumer welfare are harder to discern than those of tariffs.",
          "If electoral concerns lead politicians to practice such “optimal obfuscation”, then democracy may not affect the level of trade protection at all. Rather, it may simply alter its form, causing politicians to replace transparent trade barriers with less transparent ones.",
          "If obfuscation is prevalent, however, then the spotlight of electoral competition may lead politicians to provide, not more information, but more creative efforts to cover their tracks."
        ],
        "relevanceToPolicyProposal": "The evidence presented highlights challenges in the democratic process, particularly regarding policy transparency and the potential for obfuscation by politicians. While not directly about open data platforms, it emphasizes the importance of transparency, suggesting that the proposal for a Public-Friendly Open Data Platform might be a solution to the identified problems."

      }
    `;
    }
    static renderNeutralEvidence() {
        return `
      Open government data portals: Predictors of site engagement among early users of Health Data NY
      Author links open overlay panelGrace M. Begany a, Erika G. Martin b, Xiaojun (Jenny) Yuan c
      Show more
      OutlineAdd to Mendeley
      Share
      Cite
      https://doi.org/10.1016/j.giq.2021.101614
      Get rights and content
      Highlights
      •
      Google Analytics is a readily accessible data source to understand user engagement.

      •
      OGD managers can use web analytic data to better serve users.

      •
      Males, Technophiles, mobile device and younger users are more apt to engage OGD.


      Abstract
      A key premise of open government data (OGD) policies is enhanced engagement between government and the public. However, it is not well understood who the users of OGD are, how to tailor OGD content, and which communities to target for outreach. We examined users' engagement with Health Data NY, New York's health oriented OGD portal, to understand user characteristics associated with increased site engagement. We used Google Analytics data to classify four site engagement metrics into high versus low engagement and used logistic regression to test associations between higher site engagement and gender, age group, device type, and consumer interest. We found that being in a younger age bracket, male, a desktop user, and a Technophile are associated with higher engagement. The findings contribute to further understanding OGD initiatives and consumer health information behavior. More broadly, we demonstrate how OGD managers can leverage their web analytics data to understand which users are most engaged, thereby enabling them to better target their content.

      Previous articleNext article
      Keywords
      Open government dataHuman information behaviorOnline health informationUser engagementWeb analytics
      1. Introduction
      Globally, government agencies are developing online open government data (OGD) portals to spur economic growth, innovation, creativity, and government transparency (Gurin, 2014; Shueh, 2016; Zuiderwijk, Janssen, & Davis, 2014). OGD are downloadable in open formats that are “platform independent, machine readable, and made available to the public without restrictions that would impede the reuse of that information” (Orszag, 2009). Federal, state, and local government agencies' investment in OGD is increasing, with 80% of U.S. agencies saying their future spending on OGD initiatives will be consistent or increase (Socrata and EMC Research, 20141). Catalyzed by federal and state OGD directives (Cuomo, 2013; Heaton, 2015; Hoffman, 2012; Horrigan, Rainie, Perrin, Duggan, & Page, 2015; Obama, 2013), OGD has been used in journalism, software application development, and research (Begany & Martin, 2017; Charalabidis, Alexopoulos, & Loukis, 2016; Dwicaksono, Brissette, Birkhead, Bozlak, & Martin, 2017; Fretwell, 2014; Horrigan et al., 2015; Jaakola, Kekkonen, Lahti, & Manninen, 2015; Kassen, 2013; Martin & Begany, 2017).

      Given high public investment in OGD, it is imperative to understand how these resources are used to effectively support and promote OGD to realize their value. A key challenge faced by OGD managers is understanding how these resources are used and by whom; and users' needs, motivations, and preferences (Begany & Martin, 2017; Susha, Grönlund, & Janssen, 2015; Zuiderwijk, Janssen, & Dwivedi, 2015). These insights would enable OGD managers to tailor their dataset offerings and related content, develop appropriate OGD trainings, and more effectively outreach to potential new users (Begany & Martin, 2017). Unfortunately, empirical information about users' engagement with and use of OGD resources is limited (Harrison, Pardo, & Cook, 2012; Hossain, Dwivedi, & Rana, 2016; Ruijer & Martinius, 2017; Safarov, Meijer, & Grimmelikhuijsen, 2017; Susha et al., 2015). Analyzing web analytic data, which are readily available to OGD managers, is a promising approach for understanding OGD engagement.

      JSON Output:
      {
      "summary": "The provided text context emphasizes the importance of understanding user engagement with open government data (OGD) portals. The study specifically evaluates Health Data NY, a health-oriented OGD portal in New York, to identify characteristics associated with increased user engagement. Key findings indicate that younger age, being male, desktop usage, and being technologically adept correlate with higher engagement. The broader implication is that understanding these metrics can help OGD managers better target their content and outreach strategies.",
          "relevanceToPolicyProposal": "The study's insights about the engagement patterns and preferences of OGD users can directly inform the creation and optimization of a public-friendly open data platform. By understanding which demographics are most engaged and the factors that contribute to this engagement, developers can design a platform that fosters transparency and, in turn, enhances democratic trust.",
        "mostRelevantParagraphs": [
              "A key premise of open government data (OGD) policies is enhanced engagement between government and the public. However, it is not well understood who the users of OGD are, how to tailor OGD content, and which communities to target for outreach. We examined users' engagement with Health Data NY, New York's health oriented OGD portal, to understand user characteristics associated with increased site engagement.",
              "Globally, government agencies are developing online open government data (OGD) portals to spur economic growth, innovation, creativity, and government transparency (Gurin, 2014; Shueh, 2016; Zuiderwijk, Janssen, & Davis, 2014). OGD are downloadable in open formats that are “platform independent, machine readable, and made available to the public without restrictions that would impede the reuse of that information”. Federal, state, and local government agencies' investment in OGD is increasing, with 80% of U.S. agencies saying their future spending on OGD initiatives will be consistent or increase.",
              "Given high public investment in OGD, it is imperative to understand how these resources are used to effectively support and promote OGD to realize their value. A key challenge faced by OGD managers is understanding how these resources are used and by whom; and users' needs, motivations, and preferences (Begany & Martin, 2017; Susha, Grönlund, & Janssen, 2015; Zuiderwijk, Janssen, & Dwivedi, 2015). These insights would enable OGD managers to tailor their dataset offerings and related content, develop appropriate OGD trainings, and more effectively outreach to potential new users (Begany & Martin, 2017)."
          ],
          "allPossibleNeutralEvidenceIdentifiedInTextContext": [
              "A key premise of open government data (OGD) policies is enhanced engagement between government and the public.",
              "We examined users' engagement with Health Data NY, New York's health oriented OGD portal, to understand user characteristics associated with increased site engagement.",
              "We used Google Analytics data to classify four site engagement metrics into high versus low engagement and used logistic regression to test associations between higher site engagement and gender, age group, device type, and consumer interest.",
              "Globally, government agencies are developing online open government data (OGD) portals to spur economic growth, innovation, creativity, and government transparency.",
              "OGD are downloadable in open formats that are “platform independent, machine readable, and made available to the public without restrictions that would impede the reuse of that information”.",
              "Federal, state, and local government agencies' investment in OGD is increasing, with 80% of U.S. agencies saying their future spending on OGD initiatives will be consistent or increase.",
              "Given high public investment in OGD, it is imperative to understand how these resources are used to effectively support and promote OGD to realize their value.",
              "A key challenge faced by OGD managers is understanding how these resources are used and by whom; and users' needs, motivations, and preferences.",
              "Analyzing web analytic data, which are readily available to OGD managers, is a promising approach for understanding OGD engagement."
          ]

      }
    `;
    }
    static renderEconomicEvidence() {
        return `
      II. Access to Information (A2I)
      Public access to information (A2I) is an essential driver of sustainable development. Accurate facts
      and figures are needed to ensure education for all, to foster inclusive economic progress, and to
      better protect the environment (UNESCO 2019). Access to information refers to information held
      by public organisations, and it is disclosed to the public that fosters government transparency
      and accountability and facilitates participatory decision making.
      Any thriving society is built on well-informed, critical, and resilient citizens. Their ability to participate
      in, advocate for, and monitor peaceful and justly governed societies is facilitated by A2I. Without
      information, a better future for all is impossible. Hence, provision of access to information (A2I) to
      citizens is considered one of the essential components of a democratic country. In fact, access to
      information is perceived as a fundamental human right by the United Nations, and it assumes that
      every citizen has the right to request, seek and access information from public organisations.3
      Access to information is also one of the key pillars to facilitating the building of an inclusive
      knowledge society and better governance. Availability of public information allows citizens
      to be aware of how public money is spent, and what agreements the government enters and
      with whom, as well as other information on government decisions which affect their lives, to be
      informed, make their own decisions, and take appropriate action.
      A first step in establishing the right to information is the adoption of laws enabling an open
      government, that have been enacted by a large majority of countries across the world. Proper
      implementation of such laws can create a conducive environment for all participating parties.
      However, even though A2I laws have been adopted, their implementation remains a hurdle
      that is hard to surmount.4
      This is mainly due to a persistent knowledge gap, where the right to
      information is unknown to both the broader public as well as the public institutions themselves.
      Even though A2I is a fundamental freedom of the wider public, it is often perceived as a right or
      tool specifically for journalists and media. In addition, this knowledge gap also manifests itself in
      a lack of data about A2I implementation.
      Greater openness benefits both citizens and governments. Open access to information can
      prompt better data management, helping governments make more informed decisions and
      provide more efficient public services. It is also considered a safeguard against mismanagement
      and corruption tendencies. Promoting transparency in the management of public finances or the
      decision-making process in parliamentary proceedings are useful tools to prevent excesses and
      reduce corrupt practices. Thus, increased access to public information can also increase trust in
      government by the public, as well as provide more possibilities for citizens to convey their needs
      and to be heard in general.
      Progress in A2I is monitored by the SDG Indicator 16.10.2, that also tracks progress on A2I
      implementation.5 By 2019, 125 countries had enacted access to information legal instruments.
      This, however, does not assume actual implementation of the legal provisions, as it is observed
      that in many countries the potential for access to information is not fully discovered and therefore,
      not utilised. There are several reasons for this: (1) a knowledge gap exists for both parties,
      3 Against this backdrop, UNESCO serves as the United Nations custodian agency for Sustainable
      Development Goal (SDG) Indicator 16.10.2, on the number of countries that adopt and implement
      constitutional, statutory and/or policy guarantees for public access to information. The Organisation
      contributes to this target to ensure public access to information and protect fundamental freedoms, in
      accordance with national legislation and international agreements.
      4
      See also appendix 2.
      5 As part of Sustainable Development Goal (SDG) 16, SDG Target 16.10 aims to “

      JSON Output:
      {
      "summary": "Access to information (A2I) fosters sustainable development and facilitates inclusive economic progress. Public information enables citizens to oversee government spending and decisions, fostering transparency and accountability. Greater transparency benefits both citizens and governments, aiding in better decision-making, increasing efficiency in public services, and reducing corruption. By 2019, 125 countries adopted legal instruments for A2I, though full implementation remains a challenge.",
        "relevanceToPolicyProposal": "The text emphasizes the economic and governance benefits of public access to information, aligning with the policy proposal of creating a platform to render government data accessible to the general public. Such a platform would enhance transparency, efficiency, and trust, directly addressing the problem of the ineffectiveness of democratic institutions."
      },
        "mostRelevantParagraphs": [
          "Public access to information (A2I) is an essential driver of sustainable development. Accurate facts and figures are needed to ensure education for all, to foster inclusive economic progress, and to better protect the environment (UNESCO 2019). Access to information refers to information held by public organisations, and it is disclosed to the public that fosters government transparency and accountability and facilitates participatory decision making.",
          "Access to information is also one of the key pillars to facilitating the building of an inclusive knowledge society and better governance. Availability of public information allows citizens to be aware of how public money is spent, and what agreements the government enters and with whom, as well as other information on government decisions which affect their lives, to be informed, make their own decisions, and take appropriate action.",
          "Greater openness benefits both citizens and governments. Open access to information can prompt better data management, helping governments make more informed decisions and provide more efficient public services. It is also considered a safeguard against mismanagement and corruption tendencies. Promoting transparency in the management of public finances or the decision-making process in parliamentary proceedings are useful tools to prevent excesses and reduce corrupt practices. Thus, increased access to public information can also increase trust in government by the public, as well as provide more possibilities for citizens to convey their needs and to be heard in general."
        ],
        "allPossibleEconomicEvidenceIdentifiedInTextContext": [
          "Accurate facts and figures are needed to ensure education for all, to foster inclusive economic progress, and to better protect the environment.",
          "Availability of public information allows citizens to be aware of how public money is spent, and what agreements the government enters and with whom, as well as other information on government decisions which affect their lives, to be informed, make their own decisions, and take appropriate action.",
          "Greater openness benefits both citizens and governments. Open access to information can prompt better data management, helping governments make more informed decisions and provide more efficient public services.",
          "Promoting transparency in the management of public finances or the decision-making process in parliamentary proceedings are useful tools to prevent excesses and reduce corrupt practices.",
          "Progress in A2I is monitored by the SDG Indicator 16.10.2, that also tracks progress on A2I implementation. By 2019, 125 countries had enacted access to information legal instruments."
        ]
        }
    `;
    }
    static renderScientificEvidence() {
        return `
      Executive summary
      This report is the first in a series of four that aims to establish a standard methodology for open data
      impact assessments that can be used across Europe. This exercise is key because a consistent
      definition of the impact of open data does not exist. The lack of a robust, conceptual foundation has
      made it more difficult for data portals to demonstrate their value through empirical evidence. It also
      challenges the EU’s ability to understand and compare performance across Member States.
      Most academic articles that look to explore the impact of data refer to existing open data frameworks,
      with the open data maturity (ODM) and open data barometer (ODB) ones most frequently
      represented. These two frameworks distinguish between different kinds of impact, and both mention
      social, political and economic impacts in particular. The ODM also includes the environmental impact
      in its framework.
      Sometimes, these frameworks diverge from the European Commission’s own recommendations of
      how best to measure impact, as explained in specific sections of the better regulation guidelines and
      the better regulation toolbox. They help to answer a critical question for policymakers: do the benefits
      provided outweigh the costs of assembling and distributing (open) data? Future reports in this series
      will further explore how to better align existing frameworks, such as the ODM, with these critically
      important guidelines.
      The example set by national data portals
      While the overall framework for measuring impact continues to improve, national portals have
      provided fertile ground to explore how open data is being used. The methods that they have used to
      explore their own performance and impact include:
      • describing and analysing good-practice applications;
      • soliciting feedback through forms;
      • publishing use and user statistics on a dedicated dashboard on metrics such as dataset
      popularity, thematic distribution of downloads and thematic distribution of reuse cases; and
      • measuring the range and update frequency of datasets.
      Local and regional portals are similar to national portals in their ways of measuring impact, but often
      have less information about open data use available online.
      The impact of data intermediaries
      Open data intermediaries serve as a bridge between the data portal or the data provider and the data
      reuser. The primary output of an open data intermediary is thus data and not data products.
      Data intermediaries create impact by leveraging various types of capital to both carve out niches in
      data value chains by collecting or enriching existing niche datasets, and by compensating for deficits
      in both producer and user capacities. Moreover, they have a valuable role as lobbyists, by convincing
      the government to make more government data freely available and informing the government which
      datasets would be most valuable for reusers.
      Currently, few robust analyses exist of the role intermediaries play in open data value chains. These
      analyses are further complicated by the lack of a consistent definition in the literature. At times, the
      Rethinking the impact of open data
      9
      group of intermediaries also include infomediaries, who are called ‘data reusers’ in this report. Another
      barrier for the impact analyses is that the actual market size of open data intermediaries is still
      unknown. The impact of intermediaries can be assessed in a similar way to that of open data portals,
      with use case repositories and user statistics. However, it remains unclear whether the impact is
      created because of the open data intermediary or whether the reusers would have found the dataset
      regardless.
      To enable automated measurements, data publishers (such as open data portals) should continue to
      provide basic metadata related to the number of views and downloads associated to each dataset.
      Furthermore, they could also provide application programming interfaces (APIs) access to their data,
      together with metrics related to data usage. The demand side of open data (by intermediaries and
      reusers) could start to implement tools such as web crawlers to check data usage in academic
      literature. Additionally, data portals and open data intermediaries should publish the number of
      downloads and visits for each dataset, the aggregated number of downloads and visits for each dataset
      on the different portals where it is published, the availability of datasets in other general-purpose or
      community-specific services, and a range of other variables that could be used for automated
      assessments.
      The main challenges for open-data impact assessment
      Two main challenges remain for the creation of an open data impact assessment. First, there is a
      disconnect between the ways in which open data impact is often defined and how the European
      Commission strives to do impact analyses. In the better regulation guidelines for impact assessments
      the European Commission defines social, economic and environmental impact, excluding the political
      impact dimension that is referred to in open data literature.
      Second, impact indicators of open data portals and proposed indicators for open data intermediaries
      largely rely on proxies for impact measurement. The presence of a use case repository or the
      availability of user statistics is insufficient to measure the overall impact of open data. The main
      challenge ahead is to find ways to connect these data points to actual impact domains in order to
      obtain genuine insights about the impact of open data.

      JSON Output:
      {
          "summary": "The report highlights the lack of a consistent methodology to assess the impact of open data across Europe. There's a recognized need to make data comprehensible and transparent. National portals have been instrumental in exploring open data usage, and data intermediaries bridge the gap between data providers and reusers. Challenges remain in assessing the real impact of open data.",
          "relevanceToPolicyProposal": "The report provides evidence on the importance of standardizing open data methodologies, and the role of national data portals and intermediaries in enhancing data transparency. These findings support the policy proposal for creating an accessible data platform.",
          "mostRelevantParagraphs": [
              "This report is the first in a series of four that aims to establish a standard methodology for open data impact assessments that can be used across Europe. This exercise is key because a consistent definition of the impact of open data does not exist.",
              "The example set by national data portals. While the overall framework for measuring impact continues to improve, national portals have provided fertile ground to explore how open data is being used.",
              "The impact of data intermediaries. Open data intermediaries serve as a bridge between the data portal or the data provider and the data reuser.",
              "To enable automated measurements, data publishers (such as open data portals) should continue to provide basic metadata related to the number of views and downloads associated to each dataset."
          ],
          "allPossibleScientificEvidenceIdentifiedInTextContext": [
              "The lack of a robust, conceptual foundation has made it more difficult for data portals to demonstrate their value through empirical evidence.",
              "These two frameworks distinguish between different kinds of impact, and both mention social, political and economic impacts in particular.",
              "Sometimes, these frameworks diverge from the European Commission’s own recommendations of how best to measure impact, as explained in specific sections of the better regulation guidelines and the better regulation toolbox.",
              "The methods that they have used to explore their own performance and impact include: describing and analysing good-practice applications; soliciting feedback through forms; publishing use and user statistics on a dedicated dashboard on metrics such as dataset popularity, thematic distribution of downloads and thematic distribution of reuse cases; and measuring the range and update frequency of datasets.",
              "Data intermediaries create impact by leveraging various types of capital to both carve out niches in data value chains by collecting or enriching existing niche datasets, and by compensating for deficits in both producer and user capacities.",
              "At times, the group of intermediaries also include infomediaries, who are called ‘data reusers’ in this report.",
              "Furthermore, they could also provide application programming interfaces (APIs) access to their data, together with metrics related to data usage."
          ]
      }

    `;
    }
    static renderCulturalEvidence() {
        return `
      Americans’ Views on Open Government Data
      BY JOHN B. HORRIGAN AND LEE RAINIE
      Government reformers and advocates believe that two contemporary phenomena hold the potential to change how people engage with governments at all levels. The first is data. There is more of it than ever before and there are more effective tools for sharing it. This creates new service-delivery possibilities for government through use of data that government agencies themselves collect and generate. The second is public desire to make government more responsive, transparent and effective in serving citizens — an impulse driven by tight budgets and declining citizens’ trust in government.

      The upshot has been the appearance of a variety of “open data” and “open government” initiatives throughout the United States that try to use data as a lever to improve government performance and encourage warmer citizens’ attitudes toward government.

      This report is based on the first national survey that seeks to benchmark public sentiment about the government initiatives that use data to cultivate the public square. The survey, conducted by Pew Research Center in association with the John S. and James L. Knight Foundation, captures public views at the emergent moment when new technology tools and techniques are being used to disseminate and capitalize on government data and specifically looks at:

      People’s level of awareness of government efforts to share data
      Whether these efforts translate into people using data to track government performance
      If people think government data initiatives have made, or have the potential to make, government perform better or improve accountability
      The more routine kinds of government-citizen online interactions, such as renewing licenses or searching for the hours of public facilities.
      The results cover all three levels of government in America — federal, state and local — and show that government data initiatives are in their early stages in the minds of most Americans. Generally, people are optimistic that these initiatives can make government more accountable; even though many are less sure open data will improve government performance. And government does touch people online, as evidenced by high levels of use of the internet for routine information applications. But most Americans have yet to delve too deeply into government data and its possibilities to closely monitor government performance.

      Among the survey’s main findings:

      As open data and open government initiatives get underway, most Americans are still largely engaged in “e-Gov 1.0” online activities, with far fewer attuned to “Data-Gov 2.0” initiatives that involve agencies sharing data online for public use.
      65% of Americans in the prior 12 months have used the internet to find data or information pertaining to government.
      In this early phase of the drive for open government and open data, people’s activities tend to be simple. Their connection to open data could be as routine as finding out the hours of a local park; or it could be transactional, such as paying a fine or renewing a license.

      Internet Use to Find Data or Information Pertaining to the Government
      Minorities of Americans say they pay a lot of attention to how governments share data with the public and relatively few say they are aware of examples where government has done a good (or bad) job sharing data. Less than one quarter use government data to monitor how government performs in several different domains.
      Few Americans think governments are very effective in sharing data they collect with the public:

      Just 5% say the federal government does this very effectively, with another 39% saying the federal government does this somewhat effectively.
      5% say state governments share data very effectively, with another 44% saying somewhat effectively.
      7% say local governments share data very effectively, with another 45% responding somewhat effectively.
      Somewhat larger numbers could think of examples in which their local government either did or did not do a good job providing information to the public:

      19% of all Americans could think of an example where the local government did a good job providing information to the public about data it collects.
      19% could think of an example where local government did not provide enough useful information about data and information to the public.
      Relatively few Americans reported using government data sources for monitoring what is going on:

      20% have used government sources to find information about student or teacher performance.
      17% have used government sources to look for information on the performance of hospitals or health care providers.
      7% have used government sources to find out about contracts between government agencies and outside firms.

      JSON Output:
      {
        "summary": "The report from Pew Research Center, in association with the John S. and James L. Knight Foundation, examines the public's perception of open government data initiatives in the U.S. The results indicate optimism that these initiatives can make government more accountable but skepticism about improving government performance. The majority of Americans engage in basic online government activities, while few delve deeply into monitoring government performance via open data.",
        "relevanceToPolicyProposal": "The findings highlight the potential and current limitations of open data platforms. The results underscore the need for a more user-friendly platform that makes government data comprehensible and accessible, aligning with the policy proposal for an intuitive platform to enhance democratic trust.",
        "mostRelevantParagraphs": [
          "Government reformers and advocates believe that two contemporary phenomena hold the potential to change how people engage with governments at all levels. The first is data. There is more of it than ever before and there are more effective tools for sharing it. This creates new service-delivery possibilities for government through use of data that government agencies themselves collect and generate. The second is public desire to make government more responsive, transparent and effective in serving citizens — an impulse driven by tight budgets and declining citizens’ trust in government.",
          "The upshot has been the appearance of a variety of “open data” and “open government” initiatives throughout the United States that try to use data as a lever to improve government performance and encourage warmer citizens’ attitudes toward government.",
          "The results cover all three levels of government in America — federal, state and local — and show that government data initiatives are in their early stages in the minds of most Americans. Generally, people are optimistic that these initiatives can make government more accountable; even though many are less sure open data will improve government performance.",
          "Few Americans think governments are very effective in sharing data they collect with the public:",
          "Somewhat larger numbers could think of examples in which their local government either did or did not do a good job providing information to the public:"
        ],
        "allPossibleCulturalEvidenceIdentifiedInTextContext": [
          "tight budgets and declining citizens’ trust in government",
          "appearance of a variety of “open data” and “open government” initiatives throughout the United States",
          "government data initiatives are in their early stages in the minds of most Americans",
          "most Americans are still largely engaged in “e-Gov 1.0” online activities",
          "65% of Americans in the prior 12 months have used the internet to find data or information pertaining to government",
          "Just 5% say the federal government does this very effectively",
          "19% of all Americans could think of an example where the local government did a good job providing information to the public about data it collects"
        ]
      }
    `;
    }
    static renderEnvironmentalEvidence() {
        return `
      Key points
      Data and information underpinning environmental knowledge is recognised as a form of power.
      Vast quantities of environmental data are available online through many dedicated local, regional, and international data portals. This reflects long-established norms and practices of data-sharing within the environmental research community.
      Emphasis must be placed on increasing the volume and geographic coverage of open water and air quality data.
      Making connections between datasets across borders and thematic silos is essential to support greater understanding of a changing climate, to address air quality, to manage water resources, and to sustain biodiversity. However, there is often a disconnect between academic and official data initiatives and open-source, grassroots/citizen-science open data projects.
      Context-aware open data approaches and well-resourced data infrastructures are crucial to avoid loss of data, missed opportunities, and duplication of effort.
      As the amount of environmental data from sensor networks increases, there will be major inequalities in global data coverage to address with developing countries often being more poorly represented.
      TABLE OF CONTENTSchevron_right
      expand_more
      expand_more
      expand_more
      expand_more
      Selwyn Willoughby

      Selwyn Willoughby is an international information strategist with over 20 years of experience in the environment and conservation sector. He is the Director of the data advisory company, Information by Design, and a Fellow of the South African National Biodiversity Institute (SANBI).

      ícone link ícone Twitter
      Introduction
      Since the early 1960s, we have seen an increasingly vocal response to unmitigated anthropogenic impacts on the environment.1 Although there were earlier activists and movements, the 1960s marked the period when disparate voices started to coalesce. Environmental activists started conceptualising environmental problems as political matters, and, in doing so, using scientific knowledge as part of their armament. This led to a significant change in policy-making with regard to the use of scientific outputs and knowledge as supporting evidence. Data and information have become forms of power that are used to drive or change political discourse on issues affecting the environment. Knowledge derived from science, coupled with activism, played a major role in getting governments to endorse the Declaration of the United Nations Conference on the Human Environment in Stockholm in June 1972.2 It was at this conference that governments accepted that anthropogenic impacts on the environment were a reality and that more research was needed to understand the causes, impacts, and mitigation measures. Since that time, we have had subsequent international environmental engagements that rely on scientific knowledge to guide activism, decision-making, and policy development.

      The 1990s brought the digital revolution. Data generation and exchange became easier, and, by 1996, the internet had become mainstream, allowing for easy digitisation and the dissemination of data. Environmental data became easier to acquire and to share. Although access to environmental data, information, and knowledge is not a recent phenomenon, over time the emphasis for open access has shifted from information and knowledge as products to include the underlying elements: the data that comprises these products.

      Environmental concerns are all-encompassing, ranging from microbial research through to large planetary weather systems research. Open data provides an opportunity to promote review, transparency, accountability, participation, and the identification of knowledge gaps. The growth in environmental open data portals to support research, advocacy, decision-making, and communication indicates the importance of sharing data on a range of environmental issues.

      Earth, air, and water
      The following sections present an overview of the progress on open data in relation to four key environmental domains: climate change, air quality, biodiversity, and water resources.

      Open data and climate change
      Known research into climate change can be traced back to 1824, when Joseph Fourier3 noted the warming of the Earth. In the 1890s, Swedish scientist Svante Arrhenius4 made the connection between carbon dioxide and rising temperatures, the “greenhouse effect”. It took another century of research, publications, and advocacy before the issue secured global attention.

      The Intergovernmental Panel on Climate Change (IPCC) has achieved great success in putting climate change on the international political agenda and ensuring that almost every national government is paying attention to the issue. The data underpinning IPCC research comes from various open sources, and there are robust processes in place to ensure data integrity. The transformation of statistical climate data into easily digestible visuals through data visualisation, such as maps, also helped convey the importance of the issue to the general public (see Figure 1). The IPCC Fourth Assessment Report provided credible evidence to gain the necessary political traction;5 however, the identification of “major errors” in the main report had some sceptics questioning its veracity. The greatest error related to the incorrect referencing of 2035 as the date by which the Himalayan glaciers will have melted; however, a correction was made after a review of the source data, and the date estimate was changed to 2350.6 Other perceived “errors” were not actual errors, but rather questions regarding the validity of including content

      JSON Output:
      {
        "summary": "The text context emphasizes the power of environmental data and its historical role in shaping environmental awareness, activism, and policy-making. With the advancement in technology and the internet, access to environmental data has become easier. The importance of sharing data on various environmental issues is highlighted through the rise of open data portals. The text also touches on the progress of open data in areas such as climate change, air quality, biodiversity, and water resources. Additionally, it mentions the challenges and discrepancies in data that can sometimes cause controversies, as exemplified with the IPCC report.",

        "relevanceToPolicyProposal": "The text indicates that open environmental data can foster transparency, accountability, and participation, aligning with the aim of the policy proposal to create an open data platform for democratic trust and transparency. There's also a mention of the effectiveness of data visualizations in conveying complex data to the general public.",

        "mostRelevantParagraphs": [
          "Data and information underpinning environmental knowledge is recognised as a form of power.",
          "Making connections between datasets across borders and thematic silos is essential to support greater understanding of a changing climate, to address air quality, to manage water resources, and to sustain biodiversity. However, there is often a disconnect between academic and official data initiatives and open-source, grassroots/citizen-science open data projects.",
          "Since the early 1960s, we have seen an increasingly vocal response to unmitigated anthropogenic impacts on the environment.1 Although there were earlier activists and movements, the 1960s marked the period when disparate voices started to coalesce. Environmental activists started conceptualising environmental problems as political matters, and, in doing so, using scientific knowledge as part of their armament.",
          "The 1990s brought the digital revolution. Data generation and exchange became easier, and, by 1996, the internet had become mainstream, allowing for easy digitisation and the dissemination of data. Environmental data became easier to acquire and to share.",
          "The Intergovernmental Panel on Climate Change (IPCC) has achieved great success in putting climate change on the international political agenda and ensuring that almost every national government is paying attention to the issue."
        ],

        "allPossibleEnvironmentalEvidenceIdentifiedInTextContext": [
          "Vast quantities of environmental data are available online through many dedicated local, regional, and international data portals.",
          "Emphasis must be placed on increasing the volume and geographic coverage of open water and air quality data.",
          "Context-aware open data approaches and well-resourced data infrastructures are crucial to avoid loss of data, missed opportunities, and duplication of effort.",
          "Environmental activists started conceptualising environmental problems as political matters, using scientific knowledge as part of their armament.",
          "The 1990s brought the digital revolution allowing for easy digitisation and the dissemination of environmental data.",
          "Environmental concerns range from microbial research to large planetary weather systems research.",
          "Open data provides an opportunity to promote review, transparency, accountability, participation, and the identification of knowledge gaps.",
          "Known research into climate change can be traced back to 1824.",
          "The Intergovernmental Panel on Climate Change (IPCC) uses data from various open sources and has robust processes in place to ensure data integrity.",
          "The transformation of statistical climate data into easily digestible visuals helped convey the importance of climate change to the general public."
        ]
      }

    `;
    }
    static renderLegalEvidence() {
        return `
      Open government data from a legal perspective: An AI-driven systematic literature review
      Author links open overlay panelShirley Kempeneer a 1, Ali Pirannejad b 2, Johan Wolswinkel a 3
      Show more
      OutlineAdd to Mendeley
      Share
      Cite
      https://doi.org/10.1016/j.giq.2023.101823
      Get rights and content
      Under a Creative Commons license
      open access
      Highlights
      •
      The OGD legal framework is a mix of many continuously changing legal documents.

      •
      The impact of OGD law on OGD in practice is rarely studied.

      •
      An AI-driven systematic literature review was conducted.

      •
      The impact of OGD law on OGD in practice is distinguished.

      •
      Trade-offs are discussed between various factors such as level of detail.


      Abstract
      While the applicable legal framework is often identified as one of the key factors in the success or failure of open government data (OGD), the concrete impact of ‘OGD law’ on actual practices of OGD is often overlooked or hardly addressed in-depth. This contribution therefore aims to disentangle this legal impact based on an AI-driven systematic literature review combining legal and public administration (PA) publications. First, the review shows that OGD law has many faces and cannot be reduced to one single piece of ‘OGD legislation’. Instead, OGD law covers a wide range of topics, dealing with access to information, re-use of information, and conflicting interests (e.g. privacy or copyright). Secondly, the article identifies three main dimensions that structure the assessment of the impact of OGD law on OGD practices: topics of OGD law, sources of OGD law, and levels of OGD law. Finally, the review shows that there is no clear and univocal evidence to answer the question of what regulatory constellation is successful in fostering OGD practices and what is not, partly due to a lack of available empirical research. At the same time, the literature reveals some promising avenues for future research on OGD law in action.

      Previous articleNext article
      Keywords
      Open government dataFreedom of informationAccess to informationRe-use of informationTransparencyLegal frameworkAI-driven systematic review
      1. Introduction
      In 2016, both the 250th anniversary of the Swedish Freedom of Information Act (1766) and the 50th anniversary of the United States Freedom of Information Act (1966) were celebrated (Kassen, 2017b; Samahon, 2018). Many countries have followed Sweden and the United States ever since. A legislative wave has even been witnessed in the last two decades with more than eighty countries enacting freedom of information (FOI) legislation (Peled, 2012; Mabillard, Kakpovi, & Cottier, 2018; Berliner, Ingrams, & Piotrowski, 2018;). As a result, more than hundred countries worldwide have some form of FOI legislation now (Shepherd, 2015) and its enactment in other countries is still further promoted (United Nations, 2021).

      Apart from this exponential growth in the adoption of FOI legislation, ‘modern’ FOI legislation goes hand in hand with a ‘paradigm shift’: where ‘passive’ disclosure of government information at individual request used to be the cornerstone of traditional FOI legislation, more emphasis is put nowadays on legislation promoting affirmative (proactive) disclosure at the initiative of governments themselves and on Open Government Data (OGD), stressing the need for machine-readable government information to foster its re-use (Moon, 2020; Pozen, 2017). For example, 17 of the 50 states in the United States have laws that formally require executive agencies to make information available in open data formats (NCSL, 2021). In the European Union (EU), the Council of Europe Convention on Access to Official Documents (also known as the Convention of Tromsø), which entered into force in 2020, promotes affirmative disclosure explicitly. The new EU Directive on open data and the re-use of public sector information (2019/1024) even recognizes the importance of ‘open data’ explicitly.

      All in all, there seems to be a widespread belief across the world that legislation is essential in guaranteeing access to and re-use of government information. This belief is strengthened by several international indexes and projects valuing the existence of such legislation, such as Open Government Partnership, WJP open government index, OECD open government report, and Open Data Charta. At the same time, the actual impact of such legislation on open government data practices is far from clear.

      Most of the literature so far discusses a wide variety of drivers and barriers to OGD in practice, such as (the lack of) an administrative culture (Fenster, 2012b; Ingrams, 2017; Khurshid et al., 2020; Shepherd et al., 2019; Wasike, 2020; Worthy, 2013; Zuiderwijk & Janssen, 2014), socio-political influences and economic stimuli (Ingrams, 2017; Khurshid et al., 2020; Krah & Mertens, 2020; Zuiderwijk & Janssen, 2014), informational and technical requirements (Araújo & Reis, 2016; Khurshid et al., 2020; Shepherd et al., 2019) and environmental factors (Shao & Saxena, 2018). Admittedly, several authors in PA literature have also identified the ‘legal framework’ as one of these determinants for OGD practices (Dias, 2020; M. Janssen, Charalabidis, & Zuiderwijk, 2012; Khurshid et al., 2020; Safarov, 2018; Zuiderwijk & Janssen, 2014) and some have even argued that the legal framework is possibly the most important determinant (Shkabatur, 2012; Zuiderwijk & Janssen, 2014). However, as Hossain, Dwivedi, and Rana (2016) already observed, many studies have noted the importance of the legal framework in opening up government data, but have not identified the components of such a legal framework. We refer to ‘OGD law’ to capture all those different components of the legal framework applicable to OGD. The lack of attention for the actual impact of this ‘OGD law’ on practices of OGD can be considered a crucial gap at the crossroads of legal and PA literature, especially since ‘OGD law’ is not a monolith and the impact of the legal framework on OGD practices is not one-directional, as it can act both as a barrier and as a driver to OGD practices.

      The aim of this contribution is therefore to review existing literature on ‘OGD law in action’: what is the reported impact of OGD law on practices of OGD? Since the available literature that contains building blocks to answer this question, seems rather scattered and limited, we have undertaken a systematic, AI-driven literature review combining both legal and PA literature on OGD (section 2). After discussing the descriptive statistics of the results of the review (section 3), we take a two-stage approach to answering our research question substantively. First, we unpack the notion of ‘OGD law’ (4.1) and identify three relevant dimensions of OGD law (topics, sources, levels). Next, on the basis thereof, we assess the reported impact of this OGD law on OGD practices (4.2). In our concluding discussion (section 5), we embed our findings by highlighting several contributions to literature and practice and by formulating future research directions.

      JSON Output:
      {
        "summary": "The article titled 'Open government data from a legal perspective: An AI-driven systematic literature review' critically examines the legal frameworks surrounding open government data (OGD) and their impacts on OGD practices. The article underscores that while OGD laws have proliferated across countries, the relationship between the legal framework and actual OGD practices remains ambiguous. The research highlights the multi-faceted nature of OGD law, touching on access to information, reuse of data, and various conflicts like privacy and copyright. There remains no definitive evidence on which regulatory structures best promote OGD practices.",

        "relevanceToPolicyProposal": "The text context directly discusses the role of legal frameworks in the context of open government data (OGD), emphasizing the need for clearer legislation and understanding its impacts on OGD practices. This aligns with the policy proposal to create a transparent open data platform. A clearer legal framework could potentially boost the success of such a platform by defining the rules of access, re-use, and resolution of conflicts such as privacy and copyright issues.",

        "mostRelevantParagraphs": [
          "While the applicable legal framework is often identified as one of the key factors in the success or failure of open government data (OGD), the concrete impact of ‘OGD law’ on actual practices of OGD is often overlooked or hardly addressed in-depth.",
          "All in all, there seems to be a widespread belief across the world that legislation is essential in guaranteeing access to and re-use of government information. This belief is strengthened by several international indexes and projects valuing the existence of such legislation, such as Open Government Partnership, WJP open government index, OECD open government report, and Open Data Charta. At the same time, the actual impact of such legislation on open government data practices is far from clear.",
          "The aim of this contribution is therefore to review existing literature on ‘OGD law in action’: what is the reported impact of OGD law on practices of OGD?"
        ],

        "allPossibleLegalEvidenceIdentifiedInTextContext": ["The 250th anniversary of the Swedish Freedom of Information Act celebrated in 2016 showcases a longstanding tradition of countries promoting transparency and access to information. This tradition supports the policy's aim to enhance democratic trust through accessible data.",  "The 50th anniversary of the United States Freedom of Information Act celebrated in 2016 emphasizes the Western world's commitment to transparent governance. This milestone offers historical context to the value of open information, supporting the policy proposal's goal of transparent data presentation.",  "The European Union's introduction of a Directive in 2019 on open data and the reuse of public sector information underscores the importance of accessible and reusable government data. This directive aligns directly with the policy's objectives, emphasizing the need for public and other sectors to use data effectively.",  "The Council of Europe's introduction of the Convention of Tromsø in 2020, promoting affirmative disclosure, advocates for proactive transparency. This means governments release information voluntarily without waiting for a request, mirroring the policy's proactive nature to provide data comprehensively and intuitively.",  "With 17 out of 50 states in the US enacting laws by 2021 that mandate executive agencies to present information in open data formats, there's a clear move towards machine-readable and standardized data formats. This trend directly enhances data accessibility and usability, fundamental aspects of the proposed policy, and illustrates tangible steps towards the policy's goals."]
      }

    `;
    }
    static renderTechnologicalEvidence() {
        return `
      How Do I Implement a Data Platform?
      Nick Hauschild
      November 12, 2021
      We recently wrote a detailed post describing the characteristics of a best-in-class data platform but we didn’t describe how to implement such a platform. In this blog, we’ll explore the process and technology behind implementing a successful data platform.

      Before we dig into the process of implementing a data platform, let’s take a step back and establish some clarifying context.

      Many organizations today are going through some form of digital transformation, which is essentially a modernization process that aims to integrate digital technology into all areas of a business. A significant part of any digital transformation is developing a data strategy that the business will utilize, more specifically, how data is collected, secured, governed, and (most importantly) used to enhance business performance.

      In short, the data strategy is the plan and the data platform is typically part of the manifestation of that plan.

      It is important to call out that implementing a data platform is not a simple process in itself, but it is something that will be more easily achieved with a solid data strategy. Much of this post will assume some level of data strategy has been considered and/or defined.

      For more details on building a data strategy, check out our comprehensive guide, “How to Build an Actionable Data Strategy.”

      GET THE GUIDE
      Download Snowflake Guide
      The goal of this post isn’t to provide a detailed step-by-step guide on building a data platform, but rather to arm you with an approach that can be followed to achieve a successful implementation.

      What is a Data Platform?
      A data platform is the set of technologies that provide the capabilities necessary to deliver on the overall business requirements of the data strategy. There is no requirement that technology only fulfills a single capability, rather, some technologies might fill many capabilities.

      The technologies might be Software-as-a-Service (SaaS), requiring an account and little else, or they could be installed software that you place in a public cloud infrastructure (or even on-premise). The data platform consists of all of these technology components, their configurations, their integration, and the plethora of supporting tooling.

      A flow chart titled, "Data Platform" that shows the capabilities of a successful data platform.
      How Do I Implement a Data Platform?
      Now that it is clear what a data platform is, what is the best way to go about implementing it?

      Establish Trust
      This isn’t so much a step in the process as it is a reminder. At every point of implementation, it will be important to establish trust with the stakeholders of the data platform. A trusted data platform is much more likely to be successful than an untrusted one.

      Define the Platform Architecture
      The platform architecture is the combination of two things:

      The full set of capabilities needed to fulfill all analytical and intelligence use cases of a future state of the data platform.
      The expectation of how the organization will work with the data platform. This is in regards to building the data platform, operating the data platform, developing data pipelines on the data platform, and consuming from the data platform.
      Regarding the set of capabilities, some are more clear, like being able to transform data and making it available for business intelligence tools. Others are less clear, like orchestrating workflows and securely sharing data with customers. Some might even be just an enigma, like building an effective machine learning practice.

      An often overlooked part of building a data platform is understanding how it will be operated, built on, and consumed. Does the workforce currently exist for these functions? Are they skilled in the right disciplines? Will gaps be filled with up-skilling, new hires, or contractors?

      It should be clear that a lot of this is going to be unknown upfront, and that is ok. The platform architecture is a vision, and as the journey moves forward, the unknowns will become more coherent. Because of the unknown, surrounding technology is more or less excluded from the architecture, save for the technology needed to fulfill the foundational capabilities of data storage and data retrieval.

      The best way to establish trust here is to demonstrate to stakeholders an understanding of what they need from a data platform (capabilities) and an understanding of who is expected to use it and how.

      {
        "summary": "The text discusses the importance and process of implementing a data platform as part of a digital transformation strategy for organizations. The data platform is an essential component that serves the overall business requirements of a data strategy. Trust with stakeholders and a defined platform architecture are crucial in this process.",
        "relevanceToPolicyProposal": "The article describes the importance and process of implementing a data platform, which directly aligns with the policy proposal of creating a Public-Friendly Open Data Platform. It provides technological insights into what a data platform is and how it can be successfully implemented, which can serve as a foundational understanding for realizing the policy proposal.",
        "mostRelevantParagraphs": [
          "A data platform is the set of technologies that provide the capabilities necessary to deliver on the overall business requirements of the data strategy. There is no requirement that technology only fulfills a single capability, rather, some technologies might fill many capabilities.",
          "Now that it is clear what a data platform is, what is the best way to go about implementing it?",
          "Establish Trust\nThis isn’t so much a step in the process as it is a reminder. At every point of implementation, it will be important to establish trust with the stakeholders of the data platform. A trusted data platform is much more likely to be successful than an untrusted one.",
          "Define the Platform Architecture\nThe platform architecture is the combination of two things:\n\nThe full set of capabilities needed to fulfill all analytical and intelligence use cases of a future state of the data platform.\nThe expectation of how the organization will work with the data platform. This is in regards to building the data platform, operating the data platform, developing data pipelines on the data platform, and consuming from the data platform."
        ],
        "allPossibleTechnologicalEvidenceIdentifiedInTextContext": [
          "Using Software-as-a-Service (SaaS) as part of the data platform could streamline the setup, making it more user-friendly for the general public.",
          "Utilizing public cloud infrastructures for the open data platform ensures scalability and can adjust to varying data demands of the public.",
          "Developing data pipelines is crucial for consolidating government data from various sources, ensuring that the public gets comprehensive information.",
          "Integrating business intelligence tools would allow the general public to transform raw government data into easily understandable visual insights.",
          "Workflow orchestration is essential for ensuring efficient data updates and management on the platform, ensuring timely information for the public.",
          "Secure data sharing practices would uphold public trust, a cornerstone for a successful democratic institution.",
          "Embedding machine learning can auto-suggest insights or predict trends based on government data, adding more depth to public understanding.",
          "Prioritizing data storage techniques that ensure security and efficiency is key for housing sensitive government data.",
          "Ensuring quick data retrieval capabilities can provide a seamless user experience, keeping the platform user-friendly for the public."
        ]
      }
    `;
    }
    static renderGeopoliticalEvidence() {
        return `
      1
      Context
      The Web Foundation believes that:

      1Open data must be for everyone — a right for all;
      2Open data must be the data people need; and
      3Open data must be data people can easily use.
      The findings from the fourth edition of the Open Data Barometer show that while some governments are advancing towards these aims, open data remains the exception, not the rule.

      Why does this matter? Everyone should be able to access and use open data on an open web to allow them to participate fully in civic life. Without good data, it is impossible to hold governments to account for the decisions that they make, the policies they pass, and the money they budget and spend.

      In its fourth edition, the Open Data Barometer covers 115 countries and jurisdictions, a 25 percent increase on coverage from the last edition. The leaders for each region in our study are Canada, Israel, Kenya, Korea, Mexico, and the UK. Overall, these findings reveal that the regional champions have been improving steadily since the last edition.

      Regional Rank
      East Asia & Pacific
      Global Rank
      Score (/100)
      Europe & Central Asia
      Global Rank
      Score (/100)
      Latin America & Caribbean
      Global Rank
      Score (/100)
      Middle East & North Africa
      Global Rank
      Score (/100)
      North America
      Global Rank
      Score (/100)
      Sub-Saharan Africa
      Global Rank
      Score (/100)
      1
      Flag
      Korea
      5th
      81
      Flag
      UK
      1st
      100
      Flag
      Mexico
      11th
      73
      Flag
      Israel
      28th
      46
      Flag
      Canada
      2nd
      90
      Flag
      Kenya
      35th
      40
      2
      Flag
      Australia
      5th
      81
      Flag
      France
      3rd
      85
      Flag
      Uruguay
      17th
      61
      Flag
      Tunisia
      50th
      32
      Flag
      USA
      4th
      82
      Flag
      South Africa
      46th
      34
      3
      Flag
      New Zealand
      7th
      79
      Flag
      Netherlands
      8th
      75
      Flag
      Brazil
      18th
      59
      Flag
      UAE
      60th
      26
      Flag
      Mauritius
      59th
      26
      4
      Flag
      Japan
      8th
      75
      Flag
      Norway
      3rd
      74
      Flag
      Colombia
      24th
      52
      Flag
      Kazakhstan
      59th
      26
      Flag
      Ghana
      59th
      26
      5
      Flag
      Philippines
      22nd
      55
      Flag
      Spain
      11th
      73
      Flag
      Chile
      26th
      47
      Flag
      Qatar
      74th
      19
      Flag
      Tanzania
      67th
      22
      Table 1: Barometer’s fourth edition regional champions with their respective overall rankings and scores.

      [Full rankings are available at our online data explorer]

      To deliver real change, open data must meet the principles set out in the Open Data Charter — adopted by more than 15 national and 25 local governments to date.

      The Open Data Charter Principles
      The 4th edition of the Barometer shows how all 115 governments in the study are doing against the principles of the Open Data Charter. The Charter is a framework to embed the culture and practice of openness in the government in a way that is resilient to political change and driven by user demand. The Open Data Charter can also help provide guidance on how to open up more data. In order to achieve these goals, the Charter proposes six principles for the release of data:

      Open by default: The Barometer analyses the existence and quality of 15 key datasets (such as land registries or government budgets) across all 115 countries. These datasets are collected in some form in 97% of countries. However, 29% of those datasets are still not even published online, and only 7% are truly open.
      Timely & comprehensive: According to our findings, 74% of the data we analysed is up-to-date, which is promising, but means that one quarter of all data surveyed has very limited value.
      Accessible & usable: 73% of the datasets were relatively easy to find. 10% of all datasets we surveyed were not available free of charge. Only a quarter of the datasets we analysed were available under an open licence — meaning licensing remains a big barrier for data use.
      Comparable & interoperable: Slightly over half of the data (53%) is available in a machine readable and reusable format, but of the data available in a machine readable format, only 24% can be accessed and downloaded in bulk.
      For improved governance & citizen engagement: The impact of open data on increasing government efficiency and effectiveness is still very low, with an average score of only 1.20 out of 10 for all governments in the study. Similarly, the extent to which government is engaging with civil society regarding open data remains also limited with an average score of 4.23.
      For inclusive development & innovation: If we look at the impact open data is having on the inclusion of marginalised groups in policymaking or on their access to public services, the Barometer finds that only 6% of governments are having some relevant impact in this area. When it comes to the availability of data essential for innovation (such as map data or public transport timetables), just 8% of relevant datasets are truly open.

      JSON Output:
      {
        "summary": "The Web Foundation's Open Data Barometer's fourth edition emphasizes the importance of open data for civic participation and government accountability. It studies 115 countries and jurisdictions to determine their commitment to open data, revealing regional champions like Canada, Israel, Kenya, Korea, Mexico, and the UK. The Barometer also evaluates how these governments fare against the Open Data Charter's principles, noting areas of progress and concern.",

        "relevanceToPolicyProposal": "The Open Data Barometer and the Open Data Charter's principles underline the need for open data to be easily accessible and comprehensible for the general public. This aligns with the policy proposal's objective of creating a platform that makes government data accessible to foster transparency and enhance trust.",

        "mostRelevantParagraphs": [
          "Why does this matter? Everyone should be able to access and use open data on an open web to allow them to participate fully in civic life. Without good data, it is impossible to hold governments to account for the decisions that they make, the policies they pass, and the money they budget and spend.",
          "In its fourth edition, the Open Data Barometer covers 115 countries and jurisdictions, a 25 percent increase on coverage from the last edition. The leaders for each region in our study are Canada, Israel, Kenya, Korea, Mexico, and the UK. Overall, these findings reveal that the regional champions have been improving steadily since the last edition.",
          "To deliver real change, open data must meet the principles set out in the Open Data Charter — adopted by more than 15 national and 25 local governments to date.",
          "The 4th edition of the Barometer shows how all 115 governments in the study are doing against the principles of the Open Data Charter. The Charter is a framework to embed the culture and practice of openness in the government in a way that is resilient to political change and driven by user demand."
        ],

        "allPossibleGeopoliticalEvidenceIdentifiedInTextContext": [
          "The Open Data Barometer's fourth edition covers 115 countries and jurisdictions.",
          "Regional champions: Canada, Israel, Kenya, Korea, Mexico, and the UK.",
          "Open Data Charter adoption by more than 15 national and 25 local governments.",
          "Barometer analysis of the existence and quality of 15 key datasets across 115 countries.",
          "Only 6% of governments impact the inclusion of marginalized groups in policymaking or their access to public services."
        ]
      }

    `;
    }
    static renderCaseStudies() {
        return `
      1.1 Case Study: NL DIGITAAL: Data Agenda Government
      1.1.1 Introduction
      The Netherlands is a country in north-western Europe counting over 17 million inhabitants.
      It finds itself among the top ten best performing EU countries when it comes to digital
      government. It is one of the best European countries in both the widespread of online
      services (penetration) and the digitisation level of back- and front-office (digitisation).2
      When looking at the availability, accessibility and government support for reuse of open
      data, the Netherlands finds itself above OECD average.3
      By publishing a new digital government agenda in 2018, NL DIGIbeter. Digital Government
      Agenda the government of the Netherlands demonstrates the ambition to hold on to its
      top performing standard. Regarding the future of digital government in the Netherlands,
      the responsible Minister Raymond Knops emphasizes that change is a structural thing and
      that this requires continuous adaptation by the government.4 He also iterates that the only
      way forward is that of more digitalisation, and that this has to be accompanied by
      safeguards for basic rights such as privacy and security. Digital inclusion is another key
      theme. The theme of data forms a red thread throughout the digital government agenda,
      with a total mentioning of 92 times.5 The creation of a national government data agenda
      is announced under the heading of protecting fundamental rights and public values,
      pointing to the importance of this theme for the way in which the Dutch government
      envisions data to be managed and used in the public sector.
      1.1.2 Policy context
      1.1.2.1 First whole-of-government data agenda
      The NL DIGITAAL: Data Agenda Government6 was published in February 2019 and
      presented to parliament the next month. The data agenda can be characterised as a white
      paper making explicit the government’s policy assumptions on how to better manage
      personal data, open data and big data rather than having a prescriptive function. It
      describes how data can be leveraged for policymaking and solving social challenges. It is
      not a policy, but “lays the foundation for the government’s data policy for the coming
      years”.7 According to the OECD, in developing its data agenda, the Netherlands manifests
      itself as one of the frontrunner countries when it comes to better managing, protecting
      and sharing data within the public sector.8
      The data agenda involves the whole of government, ranging from state departments,
      provinces, municipalities to water boards and provides a shared vision and concrete
      actions to be taken to support all public stakeholders involved. Executive agencies are not
      yet well represented in the agenda. Here lies a chance for more cooperation, as much of
      the public action happens in executive agencies (e.g. the Tax Agency). Even though the
      agenda has a clear government focus, it is acknowledged that the government doesn’t
      work in isolation and that B2G data sharing may be useful for public policy development
      and service provision.
      “The government must — in consultation with society and the business
      community — determine where the boundaries are for using data.”9
      2 European Commission: 2018.
      3 OECD: 2019a.
      4 https://www.digitaleoverheid.nl/dossiers/wet-digitale-overheid/dossier-berichten/raymond-knopsdigitalisering-kent-geen-eindfase/ (accessed on 24 January 2020).
      5 In comparison: “Digital”: 170 mentions; “Information”: 33; “Technology”: 16; “ICT”: 3.
      6 In Dutch: NL DIGITAAL: Data Agenda Overheid.
      7 BZK:2019.
      8 OECD, 2019b.
      9 BZK:2019
      9
      The agenda covers a period of three years, from 2019 to 2021. The period of three years
      for this agenda is quite long compared to what’s usually the case for coordinating
      functions. Often, plans are only made for one year. The advantage of having a three-year
      period for this agenda is that it provides continuity, stability and security for the parties
      involved instead of a fear that plans may be cancelled due to other priorities. There’s also
      an efficiency gain, because organisations don’t lose time in reassessing every year whether
      they want to continue data-driven activities, but can actually focus on developing the
      activities themselves. For example, the Data-Driven Approach Learning and Expertise
      Centre (LED) may set different priorities each year. However, its existence is undisputed,
      as this multi-annual effort was agreed upon in the data agenda government.
      The agenda is not set in stone, but should be considered an evolving document which is
      updated on an annual basis. For the purpose of the 2020 update, working sessions have
      taken place in the steering board and sounding board group. The updated version should
      be published in April 2020. This is going to be a supplement to the existing document,
      rather than a revision in its entirety. It will be focused more strongly on the impact of data
      usage on major political issues, such as climate, organised crime and citizen involvement
      in government.
      The data agenda is a policy document providing both an overview of ongoing activities and
      at the same time putting on the agenda the importance of what is being done with data,
      thereby fulfilling several functions:
      • Means of communication to show what’s happening in the area of data-driven
      government. Stakeholders expressed the need to know what’s happening where
      and to bring this information together.
      • Policy document presented to parliament in March 2019 gathering political
      attention. It presents both actions that already took place and ones that still need
      to take place, up to 2021.
      • Create unity and consistency between all layers of government, focusing on shared
      social challenges that can be solved by data rather than working in siloes.
      • Concrete guidance as to which aspects are relevant when starting to work in a
      data-driven way (technical, people etc.);

      JSON Data:
      {
        "summary": "The Netherlands, known for its digital government efficiency, released the NL DIGITAAL: Data Agenda Government in 2018. This ambitious plan aims to continue the Netherlands' leadership in digital governance by emphasizing the structural nature of digitalization while safeguarding fundamental rights such as privacy and security. The agenda provides a blueprint for managing personal, open, and big data and focuses on utilizing data for policy-making and tackling societal challenges. The initiative plans to span three years, from 2019 to 2021, providing continuity and stability for involved parties. It is characterized as a dynamic document, updated annually, and by 2020 would include focus areas such as climate, organized crime, and citizen participation.",

        "relevanceToPolicyProposal": "The case study of the Netherlands' Data Agenda Government showcases a successful example of a nation implementing a comprehensive data strategy to enhance transparency, public involvement, and efficiency in government operations. This aligns closely with the policy proposal of creating a public-friendly open data platform.",

        "mostRelevantParagraphs": [
          "By publishing a new digital government agenda in 2018, NL DIGIbeter. Digital Government Agenda the government of the Netherlands demonstrates the ambition to hold on to its top performing standard. Regarding the future of digital government in the Netherlands, the responsible Minister Raymond Knops emphasizes that change is a structural thing and that this requires continuous adaptation by the government. He also iterates that the only way forward is that of more digitalisation, and that this has to be accompanied by safeguards for basic rights such as privacy and security.",
          "The NL DIGITAAL: Data Agenda Government6 was published in February 2019 and presented to parliament the next month. The data agenda can be characterised as a white paper making explicit the government’s policy assumptions on how to better manage personal data, open data and big data rather than having a prescriptive function.",
          "The agenda covers a period of three years, from 2019 to 2021. The period of three years for this agenda is quite long compared to what’s usually the case for coordinating functions. Often, plans are only made for one year. The advantage of having a three-year period for this agenda is that it provides continuity, stability and security for the parties involved instead of a fear that plans may be cancelled due to other priorities.",
          "The data agenda is a policy document providing both an overview of ongoing activities and at the same time putting on the agenda the importance of what is being done with data, thereby fulfilling several functions"
        ],
      "allPossibleCaseStudiesIdentifiedInTextContext": [
          "NL DIGITAAL: Data Agenda Government - A strategic agenda by the Dutch government aimed at leveraging data for policy-making, addressing societal challenges, and enhancing digital governance, while ensuring the protection of fundamental rights."
        ]
      }

    `;
    }
    static renderStakeholderOpinions() {
        return `
      HOW GOVERNMENT
      CAN PROMOTE
      OPEN DATA AND HELP
      UNLEASH OVER
      $3 TRILLION IN
      ECONOMIC VALUE
      Open data has the potential to unleash innovation and transform every sector of the economy. Government can
      play a critical role in ensuring that stakeholders capture the full value of this information.
      open data/it
      Michael chui is a partner at the McKinsey
      Global Institute, and Diana Farrell is a director in
      McKinsey’s Washington, DC, office, where
      Kate Jackson is a consultant.
      1 Additional information about the methodology and
      approach to size the economic impact of open
      data can be found in the McKinsey report released
      in October 2013, Open data: Unlocking innovation and performance with liquid information. This
      report is a joint effort of the McKinsey Global
      Institute, the McKinsey Center for Government,
      and McKinsey’s Business Technology Office.
      It provides analysis of the seven domains, including important levers for unlocking open data’s
      value, examples of how the value is being realized
      today, discussion of how the major stakeholders
      might become involved in open-data initiatives,
      and considerations of both the barriers and enablers
      to unlock economic value.
      open data, such as census demographics,
      crop reports, and information on product
      recalls, can create value in public- and
      private-sector organizations, in consumer and
      business-to-business markets, and in
      products and services.
      This report expands on an important topic
      in the earlier report: the critical role of
      government in unlocking the economic value
      of open data, managing risks, and engaging
      stakeholders (Exhibit 1). As a provider, catalyst, user, and policy maker, government
      is in a unique position to define an agenda for
      open data that improves decision making;
      fosters the growth of innovative businesses,
      products, and services; and enhances
      accountability. Government is also well positioned to encourage private companies and
      other stakeholders to share their data—one of
      the best strategies for creating value.
      In this report, we first explore what open
      data is and why the trend is taking hold.
      Government Designed for New Times 5
      We evaluate the primary levers that generate
      value from open data and government’s
      role in enabling them. The report then turns
      to the risks of open-data programs; these
      are top of mind for many citizens, businesses,
      and policy makers but can be mitigated
      through approaches we outline. We also
      describe the needs of stakeholders and
      opportunities for them to actively create,
      promote, and participate in open-data
      strategies and applications. To conclude, we
      present a discussion of how public-sector
      leaders can launch, assess, and scale up their
      open-data programs.
      We hope this report helps stakeholders—
      both inside and outside government—
      to design, build, and participate in effective
      open-data programs. For elected officials
      and civil servants, it can serve as a guide for
      understanding, evaluating, and promoting
      open-data initiatives. We include examples of
      how various governments shape their agenMcKinsey Center for Government 2014
      Open data government value
      Exhibit 1 of 7
      Exhibit 1
      Government plays a critical role to help enable value creation,
      manage risks, and engage stakeholders in open data.
      Enable value creation
      • Promoting better decision making
      • Stimulating development of new
      products and services
      • Increasing transparency and
      improving accountability
      Manage risks
      • Protecting the privacy, security, and
      personal safety of individuals
      • Helping organizations manage risks
      related to confidentiality, liability, and
      intellectual property
      Engage stakeholders

      JSON Output:
      {
        "summary": "The text emphasizes the potential of open data in revolutionizing various sectors of the economy. It elaborates on the role of government in amplifying the impact of open data, by acting as a provider, catalyst, user, and policy maker. The report further discusses the risks associated with open data programs and how they can be mitigated, and it also highlights the role of stakeholders in enhancing open data strategies and applications.",
        "relevanceToPolicyProposal": "The text strongly supports the idea of a Public-Friendly Open Data Platform. It argues for the critical role of the government in utilizing open data to its fullest potential, improving decision-making, stimulating innovation, and enhancing accountability, all of which align with the aims of the proposed policy.",
        "mostRelevantParagraphs": [
          "open data, such as census demographics, crop reports, and information on product recalls, can create value in public- and private-sector organizations, in consumer and business-to-business markets, and in products and services.",
          "This report expands on an important topic in the earlier report: the critical role of government in unlocking the economic value of open data, managing risks, and engaging stakeholders (Exhibit 1). As a provider, catalyst, user, and policy maker, government is in a unique position to define an agenda for open data that improves decision making; fosters the growth of innovative businesses, products, and services; and enhances accountability. Government is also well positioned to encourage private companies and other stakeholders to share their data—one of the best strategies for creating value.",
          "We hope this report helps stakeholders— both inside and outside government— to design, build, and participate in effective open-data programs. For elected officials and civil servants, it can serve as a guide for understanding, evaluating, and promoting open-data initiatives."
        ],
        "allPossibleStakeholderOpinionsIdentifiedInTextContext": [
          "Government can play a critical role in ensuring that stakeholders capture the full value of open data.",
          "Government is in a unique position to define an agenda for open data that improves decision making; fosters the growth of innovative businesses, products, and services; and enhances accountability.",
          "Government is also well positioned to encourage private companies and other stakeholders to share their data—one of the best strategies for creating value.",
          "Risks of open-data programs are top of mind for many citizens, businesses, and policy makers but can be mitigated.",
          "Stakeholders, both inside and outside government, should actively create, promote, and participate in open-data strategies and applications."
        ]
      }
    `;
    }
    static renderExpertOpinions() {
        return `
      Citizen engagement with open government data: Lessons learned from Indonesia’s presidential election
      January 2020Transforming Government People Process and Policy ahead-of-print(ahead-of-print)
      DOI:10.1108/TG-06-2019-0051
      Authors:
      Arie Purwanto
      Badan Pemeriksa Keuangan
      Anneke Zuiderwijk
      Delft University of Technology
      Marijn Janssen
      Delft University of Technology

      Download full-text PDF
      Read full-text
      Download full-text PDF
      Read full-text
      Download citation
      Copy link
      Citations (53)
      References (63)
      Figures (6)

      Abstract and Figures
      Purpose Citizen engagement is key to the success of many Open Government Data (OGD) initiatives. However, not much is known regarding how this type of engagement emerges. This study aims to investigate the necessary conditions for the emergence of citizen-led engagement with OGD and to identify which factors stimulate this type of engagement. Design/methodology/approach First, the authors created a systematic overview of the literature to develop a conceptual model of conditions and factors of OGD citizen engagement at the societal, organizational and individual level. Second, the authors used the conceptual model to systematically study citizens’ engagement in the case of a particular OGD initiative, namely, the digitization of presidential election results data in Indonesia in 2014. The authors used multiple information sources, including interviews and documents, to explore the conditions and factors of OGD citizen-led engagement in this case. Findings From the literature the authors identified five conditions for the emergence of OGD citizen-led engagement as follows: the availability of a legal and political framework that grants a mandate to open up government data, sufficient budgetary resources allocated for OGD provision, the availability of OGD feedback mechanisms, citizens’ perceived ease of engagement and motivated citizens. In the literature, the authors found six factors contributing to OGD engagement as follows: democratic culture, the availability of supporting institutional arrangements, the technical factors of OGD provision, the availability of citizens’ resources, the influence of social relationships and citizens’ perceived data quality. Some of these conditions and factors were found to be less important in the studied case, namely, citizens’ perceived ease of engagement and citizens’ perceived data quality. Moreover, the authors found several new conditions that were not mentioned in the studied literature, namely, citizens’ sense of urgency, competition among citizen-led OGD engagement initiatives, the diversity of citizens’ skills and capabilities and the intensive use of social media. The difference between the conditions and factors that played an important role in the case and those derived from the literature review might be because of the type of OGD engagement that the authors studied, namely, citizen-led engagement, without any government involvement. Research limitations/implications The findings are derived using a single case study approach. Future research can investigate multiple cases and compare the conditions and factors for citizen-led engagement with OGD in different contexts. Practical implications The conditions and factors for citizen-led engagement with OGD have been evaluated in practice and discussed with public managers and practitioners through interviews. Governmental organizations should prioritize and stimulate those conditions and factors that enhance OGD citizen engagement to create more value with OGD. Originality/value While some research on government-led engagement with OGD exists, there is hardly any research on citizen-led engagement with OGD. This study is the first to develop a conceptual model of necessary conditions and factors for citizen engagement with OGD. Furthermore, the authors applied the developed multilevel conceptual model to a case study and gathered empirical evidence of OGD engagement and its contributions to solving societal problems, rather than staying at the conceptual level. This research can be used to investigate citizen engagement with OGD in other cases and offers possibilities for systematic cross-case lesson-drawing.

      JSON Output:
      {
          "summary": "The research examines the conditions and factors necessary for citizen-led engagement with Open Government Data (OGD). The study developed a conceptual model from existing literature and applied it to a case study involving the digitization of presidential election results data in Indonesia in 2014. Conditions for effective OGD citizen-led engagement include a supportive legal and political framework, sufficient budget, feedback mechanisms, and motivated citizens. Factors that contribute include democratic culture, technical provisions for OGD, availability of citizens’ resources, and influence of social relationships. There were differences found in the studied case, with new conditions like the importance of social media and a sense of urgency among citizens.",
          "relevanceToPolicyProposal": "The research is directly relevant to the policy proposal of creating a public-friendly open data platform. Conditions and factors identified can guide the design and implementation of the proposed platform, ensuring effective citizen engagement and enhancing democratic trust.",
          "mostRelevantParagraphs": [
              "Purpose Citizen engagement is key to the success of many Open Government Data (OGD) initiatives. However, not much is known regarding how this type of engagement emerges. This study aims to investigate the necessary conditions for the emergence of citizen-led engagement with OGD and to identify which factors stimulate this type of engagement.",
              "Findings From the literature the authors identified five conditions for the emergence of OGD citizen-led engagement as follows: the availability of a legal and political framework that grants a mandate to open up government data, sufficient budgetary resources allocated for OGD provision, the availability of OGD feedback mechanisms, citizens’ perceived ease of engagement and motivated citizens. In the literature, the authors found six factors contributing to OGD engagement as follows: democratic culture, the availability of supporting institutional arrangements, the technical factors of OGD provision, the availability of citizens’ resources, the influence of social relationships and citizens’ perceived data quality. Some of these conditions and factors were found to be less important in the studied case, namely, citizens’ perceived ease of engagement and citizens’ perceived data quality. Moreover, the authors found several new conditions that were not mentioned in the studied literature, namely, citizens’ sense of urgency, competition among citizen-led OGD engagement initiatives, the diversity of citizens’ skills and capabilities and the intensive use of social media.",
              "Practical implications The conditions and factors for citizen-led engagement with OGD have been evaluated in practice and discussed with public managers and practitioners through interviews. Governmental organizations should prioritize and stimulate those conditions and factors that enhance OGD citizen engagement to create more value with OGD.",
              "Originality/value While some research on government-led engagement with OGD exists, there is hardly any research on citizen-led engagement with OGD. This study is the first to develop a conceptual model of necessary conditions and factors for citizen engagement with OGD. Furthermore, the authors applied the developed multilevel conceptual model to a case study and gathered empirical evidence of OGD engagement and its contributions to solving societal problems, rather than staying at the conceptual level. This research can be used to investigate citizen engagement with OGD in other cases and offers possibilities for systematic cross-case lesson-drawing."
          ],
          "allPossibleExpertOpinionsIdentifiedInTextContext": [
              "Citizen engagement is key to the success of many Open Government Data (OGD) initiatives.",
              "The authors identified five conditions for the emergence of OGD citizen-led engagement including the availability of a legal and political framework, sufficient budgetary resources, feedback mechanisms, and motivated citizens.",
              "Factors contributing to OGD engagement include democratic culture, technical provisions for OGD, availability of citizens’ resources, and influence of social relationships.",
              "New conditions identified in the case study include citizens’ sense of urgency, competition among initiatives, diversity of citizens’ skills, and intensive use of social media.",
              "Governmental organizations should prioritize conditions and factors that enhance OGD citizen engagement.",
              "This research offers a unique perspective on citizen-led engagement with OGD and its contributions to societal problems."
          ]
      }
    `;
    }
    static renderPublicOpinions() {
        return `
      Details
      The first of its kind, the CDEI’s tracker survey will monitor how public attitudes towards the use of data and data-driven technologies change over time, as well as assess the drivers of trust in data use. The first wave of the survey was conducted in December 2021. It was sent digitally to a nationally representative sample of 4,000 individuals, as well as to 200 individuals without access to the internet via telephone interview, to capture a wide range of views from citizens across the UK. The CDEI will run the survey on a biannual basis going forward. To delve deeper into the drivers of trust in data use and go beyond top-level statistics, the tracker survey incorporates advanced analytics, including a conjoint experiment and segmentation analysis.

      Key findings
      People are comfortable with personal data being used for a variety of purposes, particularly when the societal benefit is clear. Most people (81%) are comfortable providing personal data about themselves to the NHS to develop new healthcare treatments, and to government to deliver public services (62%).

      People report feelings of uncertainty about current data practices. Over half of the population (52%) report that they know only a little or nothing about how data about them is used and collected in their day-to-day lives. Respondents also reported feelings of concern about data security. The safety and security of personal data was identified as the largest perceived risk of data use amongst the public.

      Concerns about data use are strongly impacted by the extent to which individuals trust the organisations using data about them, and the degree of data governance in place.

      Respondents reported feeling concerned that the benefits of data and AI use will not be felt equally across society. Whilst 31% thought the benefits of data use would be shared equally, 31% of the population disagreed with this statement. More people believe that AI will have a positive impact on large businesses (48%), compared to smaller businesses (39%) and minority groups (26%).


      JSON Output:
      {
          "summary": "The CDEI's tracker survey monitors public attitudes towards data use and its technologies. The survey reveals that while many are comfortable with data use for societal benefits, there is a significant lack of knowledge and trust regarding current data practices. Concerns also exist about data security and equal distribution of its benefits.",
          "relevanceToPolicyProposal": "The survey findings highlight the public's need for transparency and understanding of data practices. A Public-Friendly Open Data Platform could address these concerns, potentially fostering greater trust and reducing uncertainty surrounding data use.",
          "mostRelevantParagraphs": [
              "People report feelings of uncertainty about current data practices. Over half of the population (52%) report that they know only a little or nothing about how data about them is used and collected in their day-to-day lives. Respondents also reported feelings of concern about data security. The safety and security of personal data was identified as the largest perceived risk of data use amongst the public.",
              "Concerns about data use are strongly impacted by the extent to which individuals trust the organisations using data about them, and the degree of data governance in place.",
              "Respondents reported feeling concerned that the benefits of data and AI use will not be felt equally across society. Whilst 31% thought the benefits of data use would be shared equally, 31% of the population disagreed with this statement. More people believe that AI will have a positive impact on large businesses (48%), compared to smaller businesses (39%) and minority groups (26%)."
          ],
          "allPossiblePublicOpinionsIdentifiedInTextContext": [
              "People are comfortable with personal data being used for societal benefits.",
              "Most people are comfortable providing personal data to NHS and government for certain purposes.",
              "Over half of the population are uncertain about current data practices.",
              "There is a significant concern about data security among the public.",
              "Trust in organizations impacts concerns about data use.",
              "There is skepticism about the equal distribution of data and AI benefits.",
              "More people believe AI benefits larger businesses more than smaller ones or minority groups."
          ]
      }

    `;
    }
    static renderHistoricalContext() {
        return `
      History of the open data movement
      The open data movement has its roots in the open-source, open science, and government transparency and accountability movements. The first use of the term open data comes from On the Full and Open Exchange of Scientific Data [47], which called for making environmental data available to the public so that scientists could study the global environment that transcends borders. The Berlin Declaration on Open Access to Knowledge in the Sciences and Humanities called for “a free, irrevocable, worldwide, perpetual right of access to, and a license to copy, use, distribute, transmit and display the work publicly and to make and distribute derivative works, in any digital medium for any responsible purpose” [39].

      The Fundamental Principles of Official Statistics (FPOS) set out the professional and scientific standards for NSOs and provides the foundation for the open data for official statistics movement. The United Nations Statistical Commission in 1994 adopted the FPOS, which had been adopted by the European Conference of Statisticians in 1992. The first of the ten principles anchors the need for statistical information in democratic governance and recognizes the citizens’ entitlement to public information:

      Official statistics provide an indispensable element in the information system of a democratic society, serving the government, the economy and the public with data about the economic, demographic, social and environmental situation. To this end, official statistics that meet the test of practical utility are to be compiled and made available on an impartial basis by official statistical agencies to honor citizens’ entitlement to public information [99].

      The commentary on the first principle anticipates the subsequent discussion of open data as requiring dissemination of data in usable formats and with suitable metadata:

      [M]aking information available on an impartial basis requires dissemination activities, which provide information in the form useful for the users, and release policies, which provide equal opportunity of access. Sound statistical principles need to be followed when presenting statistics so that they are easy to understand and impartially reported [102].

      Open data was also discussed in the open-source and computer science communities, which saw benefits to sharing code and data for reuse. In December of 2007, two prominent thinkers on computer science and the internet, Lawrence Lessig and Tim O’Reilly, organized a meeting in Sebastopol, California, to make the case for open government data. The preamble to the meeting’s list of eight principles articulated a fundamental claim about open data: “Information becomes more valuable as it is shared, less valuable as it is hoarded. Open data promotes increased civil discourse, improved public welfare, and a more efficient use of public resources…

      By embracing the eight principles, governments of the world can become more effective, transparent, and relevant to our lives” [83]. The need for data to better understand and solve global problems has become a common theme in support of open data. Trevor Manuel, then Minister of Finance of South Africa, noting the need for good data to guide development policies, quoted Peter Drucker: “What can’t be measured can’t be managed” [38].

      In 2009 the United States adopted open data as official government policy [49], creating a new repository for United States government data of all types. A year later the United Kingdom followed suit, announcing a “One-stop shop for Government data” [100]. In 2013 the United Kingdom Cabinet Office published a policy paper proposing an “open data charter” for the G8 group of nations [97] that was adopted in June of that year.

      With national governments working to implement open data, there was renewed pressure on international organizations to do the same. One of the first movers was the World Bank, which announced open access to their statistical databases in April of 2010 in advance of a new access to information policy taking effect that July [110, 111]. The World Bank’s adoption of open data was spurred by a hero of the open data movement, Hans Rosling, whose advocacy and work to make data applicable, interesting, and useful to policy makers and citizens alike, provided a huge service to the community [33]. Opening the World Bank’s database, particularly the World Development Indicators, which contained data from many of the United Nations’ specialized agencies, would help to normalize open data in the international realm.

      The G8 Open Data Charter provided the model for the seven principles of the International Open Data Charter [57]. Open data was included as a central part of the Cape Town Action Plan for the Sustainable Development Goals in 2017, which further cemented open data’s role in international governance [22]. To enshrine the concepts of open data for official statistics, a working group was established to add open data concepts to the Fundamental Principles of Official Statistics at the 50thmeeting of the United Nations Statistical commission [101]. That work is ongoing.

      JSON Output:
      {
          "summary": "The open data movement originated from the open-source, open science, and government transparency movements. It emphasizes making environmental, scientific, and official data accessible to the public. Key milestones include the adoption of open data policies by the United States and the United Kingn “open data charter” for the G8 group of nations in 2013 by the United Kingdom Cabinet Office.",
              "The World Bank’s announcement of open access to their statistical databases in April of 2010.",
              "The G8 Open Data Charter.",
              "Inclusion of open data as a central part of the Cape Town Action Plan for the Sustainable Development Goals in 2017.",
              "Establishment of a working group to add open data concepts to the Fundamental Principles of Official Statistics at the 50th meeting of the United Nations Statistical commission."
          ]
      }

    `;
    }
    static renderEthicalConsiderations() {
        return `
    What	is	responsible	data	re-use?
    The	Responsible	Data	Forum	describes	responsible	data	as	a	duty	to	ensure	people's	rights	to
    consent,	 privacy,	 security	 and	 ownership around	 the	 information	 processes	 of	 collection,
    analysis,	 storage,	 presentation	 and	 re-use,	while	also	 respecting	 the	values	of	transparency
    and	openness.
    This	definition	will	dictate	the	structure	and	logical	framework	of	this	report.	We	will	break	the
    definition	down	and	will	briefly	describe	each	of	the	components with	suggestions	on	further
    read	and	resources.
                                                                                                                             5 Can	be	found	here:	https://wiki.responsibledata.io/Messaging_Matrix
    ePSIplatform Topic Report No. 2015 / 02 , February 2015
    8
    ETHICAL	AND	RESPONSIBLE	RE-USE	OF	OPEN	GOVERNMENT	DATA
    Transparency	&	Accountability	vs.	Do	No	Harm	Principle
    It	is	important	to	start by	understanding	the	spirit	and	underlying	principles of	responsible	and
    ethical	data	re-use.	First	of	all,	 the	concepts	of	privacy,	security,	commercial or	state	secrecy
    can	 arguably	 be	 pulled	 under	 one	 umbrella	 (in	 terms	 of	 data	 re-users’	 behaviour	 judgment)
    that	is	 “do	 not	 harm”	 principle (although	 the	 definition	is	 silent	 on	 “do	 no	 harm”	explicitly).
    Although	the	principle	originated	in	the	context	of	humanitarian	assistance	and	development,
    it	can	be	applied	in	a	broader	sense	and	can	mean,	that	data	re-users	must	do	all	within	their
    powers	to	not	cause	any	harm	to	any	of	the	stakeholders	that	can	rise	as	a	direct	or	indirect
    result	of	open	data	re-use.
    Many	 conversations	 are	 shaped	 around	 confrontation	 between	 “do	 not	 harm”	 principle	 and
    concepts	of	transparency,	accountability.	Although	it	may	appear	that	these	are	two	opposites,
    effectively,	the	“do	no	harm”	principle	is	merely	a	limitation	to	promotion	of	transparency	and
    accountability.	This	means,	that	protection	of	promotion	of	transparency	and	accountability	is
    the	 basic	 principle	 of	 modern	 democracies	 which	 is	 not	 questioned,	 but	 that	 has	 certain
    limitations	linked	to	a	“do	no	harm”	principle	encompassing	concepts	of	privacy	and	security.
    There	are	no	hard	rules	on	how	to	balance	these	two	principles	and	the	conversation	around
    them	will	continue	developing	as our	societal	norms	change.	However,	one	of	the	criteria that
    may	guide	judgment	of	organizations	is	a	suggestion	by	authors	of	 the	book	called	“Ways	 to
    practise	 responsible	 development	 data” 6 is	 that	 the	 “do	 no	 harm”	 is	 for	 powerless	 and
                                                                                                                             6 Can be found here: https://responsibledata.io/wp-content/uploads/2014/10/responsible-development-data-book.pdf
    ePSIplatform Topic Report No. 2015 / 02 , February 2015
    9
    ETHICAL	AND	RESPONSIBLE	RE-USE	OF	OPEN	GOVERNMENT	DATA
    transparency	and	accountability	is	for	powerful.	As	the	book	puts	it:
    When	discussing	specifics,	it's	rare	to	find	a	case	where	thoughtful,	dedicated	and	informed
    people	 won't	 agree	 on	 what	 is	 permissible	 and	 what	 isn't	 permissible	 when	 promoting
    transparency	and	accountability.	There	is	a	key	difference	between	personal	data	and	data
    that	 should	 be	made	 'open';	 as	 a	 broad	 rule,	 we	 believe	 that	 the	 right	 to	 privacy	 is	 for
    those	without	power,	and	transparency	is	for	those	with	power.

    JSON Output:
    {
      "summary": "The text discusses the ethical and responsible re-use of open government data. It stresses the importance of transparency and accountability while ensuring that data re-users adhere to the 'do no harm' principle. This principle, although not explicitly defined within the context of data re-use, emphasizes the importance of not causing harm to stakeholders either directly or indirectly due to data re-use. The discussion also touches on the balance between transparency and the 'do no harm' principle, emphasizing that transparency and accountability are essential for the powerful while 'do no harm' primarily protects the powerless.",
      "relevanceToPolicyProposal": "The text provides insights into ethical data re-use, which is directly relevant to the policy proposal of creating a public-friendly open data platform. This platform will need to ensure responsible and ethical data usage, balancing transparency and accountability with the 'do no harm' principle.",
      "mostRelevantParagraphs": [
        "It is important to start by understanding the spirit and underlying principles of responsible and ethical data re-use. First of all, the concepts of privacy, security, commercial or state secrecy can arguably be pulled under one umbrella (in terms of data re-users’ behaviour judgment) that is “do not harm” principle (although the definition is silent on “do no harm” explicitly). Although the principle originated in the context of humanitarian assistance and development, it can be applied in a broader sense and can mean, that data re-users must do all within their powers to not cause any harm to any of the stakeholders that can rise as a direct or indirect result of open data re-use.",
        "Many conversations are shaped around confrontation between “do not harm” principle and concepts of transparency, accountability. Although it may appear that these are two opposites, effectively, the “do no harm” principle is merely a limitation to promotion of transparency and accountability. This means, that protection of promotion of transparency and accountability is the basic principle of modern democracies which is not questioned, but that has certain limitations linked to a “do no harm” principle encompassing concepts of privacy and security.",
        "When discussing specifics, it's rare to find a case where thoughtful, dedicated and informed people won't agree on what is permissible and what isn't permissible when promoting transparency and accountability. There is a key difference between personal data and data that should be made 'open'; as a broad rule, we believe that the right to privacy is for those without power, and transparency is for those with power."
      ],
      "allPossibleEthicalConsiderationsIdentifiedInTextContext": [
        "Ensuring people's rights to consent, privacy, security, and ownership around data processes.",
        "Balancing values of transparency and openness with responsible data use.",
        "Understanding and applying the 'do no harm' principle in the context of data re-use.",
        "Protecting stakeholders from direct or indirect harm resulting from open data re-use.",
        "Balancing transparency and accountability with concepts of privacy and security.",
        "Distinguishing between the right to privacy for the powerless and the right to transparency for the powerful."
      ]
    }   `;
    }
    static renderLongTermImpact() {
        return `
    As part of its work on measuring what drives trust in democratic government, the OECD is exploring the various ways governments can strengthen trust - an especially important task as countries emerge from the global pandemic and face new global challenges.

    Public trust leads to greater compliance with a wide range of public policies, such as public health responses, regulations and the tax system. It also nurtures political participation, strengthens social cohesion, and builds institutional legitimacy. In the longer term, trust is needed to help governments tackle long-term societal challenges such as climate change, ageing populations, and changing labour markets.

    What drives public trust in government?
    OECD work has identified five main public governance drivers of trust in government institutions. They capture the degree to which institutions are responsive and reliable in delivering policies and services, and act in line with the values of openness, integrity and fairness.

    Recent revisions to the Famework - intended to guide public efforts to recover trust in government during and after crises - identify two additional dimensions that play a role in generating public trust. These are:

    cultural, socioeconomic and political drivers, and;
    government’s capacity to address global and intergenerational issues
    These various drivers interact with each other to influence people’s trust in public institutions.

     OECD Trust Survey Report

    Building Trust to Reinforce Democracy: Key Findings from the 2021 OECD Survey on Drivers of Trust in Public Institutions
    This report presents the main findings of the first OECD cross-national survey of trust in government and public institutions, representing over 50,000 responses across 22 OECD countries.

    Participating countries were: Australia, Austria, Belgium, Canada, Colombia, Denmark, Estonia, Finland, France, Iceland, Ireland, Japan, Korea, Latvia, Luxembourg, Mexico, The Netherlands, New Zealand, Norway, Portugal, Sweden and the United Kingdom.

    See also: Survey design and technical documentation


    JSON Output:
    {
      "summary": "The OECD has identified ways in which governments can strengthen trust in democratic institutions, which is crucial as countries deal with the aftermath of the global pandemic and face new global challenges. Trust in public institutions is driven by their responsiveness, reliability, and adherence to values of openness, integrity, and fairness. Additional factors influencing trust include cultural, socioeconomic, and political drivers, and the government’s ability to tackle global and intergenerational issues.",
      "relevanceToPolicyProposal": "The discussion on trust in democratic institutions and its long-term impacts, such as enhanced political participation and tackling societal challenges, is directly relevant to the policy proposal of creating a Public-Friendly Open Data Platform. Enhancing transparency through an open data platform aligns with the values of openness and integrity mentioned in the text context as drivers of trust.",
      "mostRelevantParagraphs": [
        "Public trust leads to greater compliance with a wide range of public policies, such as public health responses, regulations and the tax system. It also nurtures political participation, strengthens social cohesion, and builds institutional legitimacy. In the longer term, trust is needed to help governments tackle long-term societal challenges such as climate change, ageing populations, and changing labour markets.",
        "OECD work has identified five main public governance drivers of trust in government institutions. They capture the degree to which institutions are responsive and reliable in delivering policies and services, and act in line with the values of openness, integrity and fairness."
      ],
      "allPossibleLongTermImpactIdentifiedInTextContext": [
        "greater compliance with public policies",
        "nurtures political participation",
        "strengthens social cohesion",
        "builds institutional legitimacy",
        "helps governments tackle long-term societal challenges like climate change",
        "addressing ageing populations",
        "adapting to changing labour markets"
      ]
    }

    `;
    }
    static renderShortTermImpact() {
        return `
      Where mechanisms exist for communication between open government data providers (e.g. public
        administrations) and intermediaries, intermediaries may also use their cultural capital to lobby for
        further opening of data and improvements to existing open datasets. Crusoe and Melin (2018) note in
        their literature review of barriers to the use of open government data that increasing the cultural
        capital of open data may also increase public demand for continued publishing. The potential
        downside, however, is that data providers may become dependent on the services provided by open
        data intermediaries and consequently feel no motivation to open data in such a way that it may be
        directly processed by users (
        110). Studies of intermediary activity found that most intermediaries were
        private-sector companies. We can assume that these intermediaries act to maximise profits and to
        ensure their ability to continue to operate in the data sector (
        111). As a result, intermediaries may not
        be likely to lobby for the removal of barriers to immediate use. In developing countries, a significant
        majority of studied intermediaries (72 %) were non-profit organisations reliant on donor funding, so
        this issue may be more relevant in developed countries with larger private intermediary sectors (
        112).
        In their study of network relations in open government data ecosystems, Reggi and Dawes (2022, p. 5)
        found that connections between intermediaries and governments are more likely to develop and to
        persist when these actors are operating in geographic proximity. This impact was particularly strong
        at the municipal level. This can likely be attributed to a combination of practical feasibility and cultural
        capital. Through repeated interactions, intermediaries may also forge closer relationships with
        administrations. Van Schalkwyk et al. (2015, p. 14.) cited the example of an intermediary in South
        Africa that is able to consistently facilitate access to open data on public higher education due to its
        (
        106) Loshin, 2013, p. 289.
        (
        107) Johnson and Greene, 2017, p. 14.
        (
        108) Gao and Janssen, 2022, p. 8.
        (
        109) Janssen and Zuiderwijk, 2014, p. 698.
        (
        110) Janssen and Zuiderwijk, 2014, p. 706.
        (
        111) Johnson and Greene, 2017, p. 11.
        (
        112) Van Schalkwyk et al., 2015, p. 18.
        73
        ‘long-standing’ relationship with personnel in the government department that aggregates this data.
        Finally, in cases where data is partially open (e.g. when right-to-information legislation mandates that
        government data be released upon request, but data cannot be downloaded from an easily accessible
        portal), intermediaries may deploy their cultural capital

        JSON Output:
        {
          "summary": "The text discusses the role of intermediaries in the open government data sector. While intermediaries can help in enhancing the cultural capital of open data and increasing its public demand, there's a potential downside of data providers becoming overly reliant on them. This could result in a lack of motivation to make data easily accessible to direct users. The nature of these intermediaries varies with private-sector companies dominating in developed countries and non-profit organizations being prevalent in developing countries. Geographic proximity and the establishment of 'long-standing' relationships play crucial roles in the effectiveness of intermediaries.",
          "relevanceToPolicyProposal": "The text emphasizes the importance of having direct and efficient channels of communication between open data providers and users. It suggests that a dependence on intermediaries might limit the direct engagement of the public, which is an essential aspect of the proposed 'Public-Friendly Open Data Platform'. Thus, while intermediaries play a role, it is essential for the policy to ensure that the public has direct access to open data.",
          "mostRelevantParagraphs": [
            "Where mechanisms exist for communication between open government data providers (e.g. public administrations) and intermediaries, intermediaries may also use their cultural capital to lobby for further opening of data and improvements to existing open datasets. Crusoe and Melin (2018) note in their literature review of barriers to the use of open government data that increasing the cultural capital of open data may also increase public demand for continued publishing. The potential downside, however, is that data providers may become dependent on the services provided by open data intermediaries and consequently feel no motivation to open data in such a way that it may be directly processed by users.",
            "In developing countries, a significant majority of studied intermediaries (72 %) were non-profit organisations reliant on donor funding, so this issue may be more relevant in developed countries with larger private intermediary sectors.",
            "In their study of network relations in open government data ecosystems, Reggi and Dawes (2022, p. 5) found that connections between intermediaries and governments are more likely to develop and to persist when these actors are operating in geographic proximity. This impact was particularly strong at the municipal level. This can likely be attributed to a combination of practical feasibility and cultural capital. Through repeated interactions, intermediaries may also forge closer relationships with administrations. Van Schalkwyk et al. (2015, p. 14.) cited the example of an intermediary in South Africa that is able to consistently facilitate access to open data on public higher education due to its ‘long-standing’ relationship with personnel in the government department that aggregates this data.",
            "Finally, in cases where data is partially open (e.g. when right-to-information legislation mandates that government data be released upon request, but data cannot be downloaded from an easily accessible portal), intermediaries may deploy their cultural capital."
          ],
          "allPossibleShortTermImpactIdentifiedInTextContext": [
            "Intermediaries might lobby for further opening of data and improvements to existing datasets.",
            "Increased cultural capital of open data can boost public demand for ongoing publishing.",
            "Potential dependency of data providers on intermediaries leading to a lack of motivation to make data directly accessible.",
            "Private-sector companies dominate as intermediaries in developed countries, which may act mainly to maximize profits.",
            "Non-profit organizations play a significant role as intermediaries in developing countries.",
            "Geographic proximity between intermediaries and governments can enhance their collaboration.",
            "Intermediaries can forge long-term relationships with government departments, enhancing data accessibility.",
            "Intermediaries might use their cultural capital in cases of partially open data."
          ]
        }
    `;
    }
    static renderLocalPerspective() {
        return `
      Challenges and Benefits in an Open Data
      Initiative – Local Government Case
      Study of Myths and Realities
      Ulf MELINa,1
      aLinköping University, Department of Management and Engineering, Sweden
      Abstract. This paper investigates the myths and realities of open data at local
      government (a focused municipality) level. There are many expectations related to
      open government data (OGD) covering e.g. public transportation, car parks, public
      committee minutes and air quality measurements and the effects of more open public
      agencies and commercial possibilities, together with citizen benefits. Expectations
      are often uncritical and expressed in terms of rationalized myths. The purpose of
      this paper is to investigate myths and realities in a case study and to present lessons
      learned from focusing such dimensions in an ongoing and emerging local
      government OGD initiative. This study confirms previous research on open data
      myths, challenges and benefits from a local government perspective. The
      conclusions also illustrate three important findings directed to the existing body of
      research regarding the importance of alliances of stakeholders in OGD initiatives,
      aspects of heterogeneous organizations launching open data and reflections on the
      division of labour between public and private actors when handling different
      communication channels. Implications for research and practice are also outlined
      together with limitations and further research.
      Keywords. open data, open government, myths, challenges, benefits, local
      government, municipality.
      1. Introduction
      Open government data (OGD) includes various data sets that are made available by the
      public sector in order to stimulate third-party (commercial and non-profit organizations)
      development of new information technology (e.g. apps for mobile devices) and services
      for a wider audience. Users may be citizens or companies. There are many contemporary
      efforts launching open data internationally also with the intention to create an open
      government (increased transparency and democracy in the form of involvement and
      participation) [15, 26]. The accessibility and openness that OGD is expected to achieve
      is expressed in several national digital agendas and policies, including the EU and
      Sweden. Nearly 40 billion EUR each year is expected to be the result of making the open
      data available from public administration. There are many expectations related to OGD
      applications [e.g. 12] in different areas covering e.g. public transportation, car parks and
      air quality measurements and the effects of more open government agencies and
      commercial possibilities, together with citizen benefits as expressed above. According

      1
      Corresponding Author: Ulf Melin, Linköping University, Department of Management and Engineering,
      Information Systems, SE.-581 83 Linköping, Sweden. E-mail: ulf.melin@liu.se.
      A
      Electronic Government and Electronic Participation
      H.J. Scholl et al. (Eds.)
      © 2016 The authors and IOS Press.
      This article is published online with Open Access by IOS Press and distributed under the terms
      of the Creative Commons Attribution Non-Commercial License 4.0 (CC BY-NC 4.0).
      doi:10.3233/978-1-61499-670-5-111
      111
      to contemporary e-government research on open data, expectations are not seldom rather
      uncritical and expressed in terms of rationalized myths [6, 20, 23]). The visions,
      expectations and rhetoric about the usefulness of OGD can be mirrored in in early egovernment and public e-service research of hopes and glory, not meetings expectations
      and benefits as planned [17, 21, 22, 27].
      Efforts including OGD contains several important strategic and day-to-day choices
      about what data sets that should be published, commercial or democratic viable
      initiatives and for which user groups. Working with OGD is also a question of a division
      of labour between the actors from public and private sectors; what data sets public
      organization should be responsible, what kind of e-services based on those data sets, and
      for which can we rely on external actors to develop? Studying such work to examine the
      myths and realization of the OGD is relevant from a theoretical and practical perspective.
      Myths about the publication of the OGD, without restrictions, automatically creating
      benefits everyone can and have the ability to use are wide-spread [23]. Myths in general,
      and in an OGD setting, can be described as: “[…] myths are formulated to reflect on the
      gap between the promises and barriers of OGD. A myth is a traditional or legendary story
      without a determinable basis of fact or evidence. The essence of a myth is that its
      existence is fictional or unproven.” [23, p. 263]. In this setting it also seems to be taken
      for granted that there is an interest in the reuse and utilization of open data [6, 20]; for
      example to reduce the digital divide. However, myths also have an important role in
      policy-making [7, 28], so they are not only obstacles or fraudulent lies; myths can be
      generative in development work. But not without risks. Risks or challenges with OGD
      has been described as the dark side of open data by e.g. Zuiderwijk and Janssen [40]
      violating privacy, misuse and misinterpretation of data.
      Based on that we can see that a more critical strand of OGD research is evolving [20,
      31, 40]. In recent open data research the one-way traffic or street in focusing on the
      publishing open data (the supply side) – and not the demand or the whole ecosystem –
      have been questioned and discussed [12, 31]. This paper acknowledge a critical stance
      towards OGD, and investigates challenges and benefits when working with open data at
      a local government level. The local level has received less attention in OGD research,
      and is therefore relevant to study.
      There have been several other calls for more research on open data (e.g. [23]) and
      challenges are put forward as one area to investigate more [31]. Following this route
      there is also a need to: “[…] demystify data and its importance in sharing to influence
      development”. [31, p. 427]. This paper is one attempt to demystify OGD and to
      contribute to the ongoing research on OGD in this strand.
      This paper investigates an emerging OGD initiative in a Swedish local government
      organization. Few studies are focusing a Swedish context and a local government level
      [20] and there is a need to generate more knowledge in this domain. The purpose of the
      paper is to critically analyze the emergence of an OGD initiative focusing the role of
      myths, challenges and benefits in the process of triggers for the initiative, choosing data
      sets and publish local government open data. Research questions asked are: what is the
      role of myths in OGD initiatives? What lessons can be learned from this situated local
      government case study vs. the emergent body of literature covering OGD myths,
      challenges and benefits? The contributions of this paper has implications for future
      research on OGD as well as practice and is expressed in terms of lessons learned.
      The remainder of this paper is organized in the following way: In Section Two
      previous research on open data are introduced and discussed. The research approach is
      described in Section Three.

      JSON Output:
      {
          "summary": "The paper investigates the myths and realities associated with open government data (OGD) at the local government level, specifically a municipality in Sweden. The study seeks to examine the promises, expectations, challenges, and benefits of OGD while reflecting on the role of myths, which can both aid and impede the development of such initiatives. The research is critical of the unverified beliefs surrounding OGD, emphasizing the need for a more realistic understanding of its impact and potential.",
          "relevanceToPolicyProposal": "The 'Text Context' provides insights into the challenges and benefits of open data in a local government setting, specifically in relation to myths and realities. It aligns with the policy proposal by discussing the potential for OGD to foster transparency and democratic trust, while also pointing out the risks and challenges involved.",
          "mostRelevantParagraphs": [
              "This paper investigates the myths and realities of open data at local government (a focused municipality) level. There are many expectations related to open government data (OGD) covering e.g. public transportation, car parks, public committee minutes and air quality measurements and the effects of more open public agencies and commercial possibilities, together with citizen benefits. Expectations are often uncritical and expressed in terms of rationalized myths.",
              "Myths about the publication of the OGD, without restrictions, automatically creating benefits everyone can and have the ability to use are wide-spread [23]. Myths in general, and in an OGD setting, can be described as: “[…] myths are formulated to reflect on the gap between the promises and barriers of OGD. A myth is a traditional or legendary story without a determinable basis of fact or evidence.",
              "Risks or challenges with OGD has been described as the dark side of open data by e.g. Zuiderwijk and Janssen [40] violating privacy, misuse and misinterpretation of data.",
              "This paper investigates an emerging OGD initiative in a Swedish local government organization. Few studies are focusing a Swedish context and a local government level [20] and there is a need to generate more knowledge in this domain."
          ],
          "allPossibleLocalPerspectiveIdentifiedInTextContext": [
              "Expectations are often uncritical and expressed in terms of rationalized myths.",
              "The study confirms previous research on open data myths, challenges and benefits from a local government perspective.",
              "The local level has received less attention in OGD research, and is therefore relevant to study.",
              "This paper investigates an emerging OGD initiative in a Swedish local government organization."
          ]
      }

    `;
    }
    static renderGlobalPerspective() {
        return `
      Trends in open data around the world
      Share
      Fecha de la noticia: 30-11-2021

      In view of the series of current and future trends around the future of open data indicated in our report, we wanted to check to what extent these - or similar - trends are already present in the global open data community. To this end, we have verified the current activities and future plans of several countries through documentation available from various sources such as thel Open Government Partnership, the OECD, the Latin American Open Data Initiative, the International Open Data Charter, the African Open Data Network (AODN), the Open Data Policy Lab and the official national open data initiatives themselves. You can access the open data platforms of the portals analysed through the following infographic.


      Access the accessible version

      What we have found confirms the report's observations and also includes other associated trends such as the redesign of open data platforms; the increasing availability of open data on natural resources and climate change; the new and relevant role of data in health crises; the growing use of open data in the fight against corruption; the promotion of open science; the publication of data of particular social relevance; the increased sensitivity to the need for disaggregated and gender-sensitive data; or the growth of open data at the regional and local level. Below, we will review some of the examples of each of these trends that we have found around the world:

      America
      Canada: The government is currently working on improving its open.canada.ca open data portal to make it more user-friendly, facilitate searches, and encourage interaction and collaboration among community members - for example, through new data use stories. In addition, the government is also making a firm commitment to open science, including among other measures the creation of a new open science data portal that is expected to be improved and expanded over time.
      Mexico: after a long history as a leader in open data in the region, its efforts have recently focused on improving access to information with two main objectives: to make life easier for its citizens and to increase the level of public scrutiny. To this end, Mexico is developing programs to improve access to data and information related to key issues such as education, public spending on social development, anti-corruption, natural resource management or corporate beneficiary records.
      Brazil: having completed its new data openness reference model and the control panel for monitoring data openness, current efforts are mainly focused on fostering an active ecosystem around data to promote the effective use of data - as this has been the main barrier identified in achieving a higher level of reuse and innovation. However, there are also other initiatives underway to improve data availability in some key areas such as property registration or transportation.
      United States: the country has recently implemented a new federal data strategy whose main objectives include improving the capabilities and knowledge of data in the administration in order to be able to use this input regularly as a decision-making tool. Thus, its most recent action plan focuses on the development of communities of practice and shared solutions. Other measures include the incorporation of a Chief Data Officer (CDO) in a total of 24 agencies and departments; the creation of a federal council in which all of them participate; or the strengthening of the publication of health data with the aim of responding to the most pressing public health challenges of today, including the pandemic or the crisis surrounding the indiscriminate use of opioids.
      Colombia: its most recent commitment to purposeful open data is clearly focused on data to fight corruption: of the 93 datasets listed in its roadmap, one third are related to the Inter-American PIDA Program for the fight against corruption. The other current focus within the strategy is on promoting open data at the sub-national level, with simultaneous actions in Palmira, Yumbo, Cali, Boyacá and Valle del Cauca.
      Uruguay: perhaps the most outstanding recent action may be its pilot experience in the implementation of the openness guide for action against climate change in collaboration with the International Open Data Charter. However, the country also currently has an ambitious open data agenda that includes actions as varied as the complete renovation of its data portal, improvements in the availability of cadastral data and budget transparency or increasing the visibility of data on gender violence. It is therefore not surprising that the country leads the latest edition of the Regional Open Data Barometer.
      Argentina: at the technical and data governance level, it is worth highlighting the progress made in the implementation of its data as a service policy, designed to achieve a high level of quality and interoperability of data published by design. Regarding improvements in data availability, efforts are lately focused on areas such as transparency in public spending, procurement and extractive industries (through the implementation of GIFT, OCDS and EITI standards respectively).
      Asia and Oceania
      South Korea: its current open data agenda is focused on increasing the use cases of data by working more closely with companies and research centers. This will be guided by its new data release strategy (part of the Korean New Deal) which focuses on the release of certain data of high value and interest to industry, such as autonomous driving, smart cities and healthcare.
      Japan: in response to the apparent low level of digital preparedness for events such as the current pandemic, the government recently decided to create the Digital Agency, a cross-cutting agency that is now in charge of the also new national data strategy. This strategy is distinguished by its particular citizen-centric and trust-centric vision, whereby data is seen as the basis for all social and industrial activities and the government functions as a platform to serve them.

      JSON Output:
      {
        "summary": "The text discusses global trends in open data, highlighting different strategies and advancements by countries in the Americas and Asia. It underscores the importance of open data in various domains such as health, climate change, corruption, science, and gender. Countries are improving their platforms to make data more accessible, foster transparency, and address specific societal issues.",
        "relevanceToPolicyProposal": "The text supports the policy proposal by showcasing the worldwide trend towards enhancing open data platforms for transparency, engagement, and effective decision-making. Several countries' initiatives resonate with the proposed Public-Friendly Open Data Platform, indicating its potential relevance and effectiveness.",
        "mostRelevantParagraphs": [
          "What we have found confirms the report's observations and also includes other associated trends such as the redesign of open data platforms; the increasing availability of open data on natural resources and climate change; the new and relevant role of data in health crises; the growing use of open data in the fight against corruption; the promotion of open science; the publication of data of particular social relevance; the increased sensitivity to the need for disaggregated and gender-sensitive data; or the growth of open data at the regional and local level.",
          "Canada: The government is currently working on improving its open.canada.ca open data portal to make it more user-friendly, facilitate searches, and encourage interaction and collaboration among community members - for example, through new data use stories.",
          "Mexico: after a long history as a leader in open data in the region, its efforts have recently focused on improving access to information with two main objectives: to make life easier for its citizens and to increase the level of public scrutiny.",
          "United States: the country has recently implemented a new federal data strategy whose main objectives include improving the capabilities and knowledge of data in the administration in order to be able to use this input regularly as a decision-making tool.",
          "Uruguay: perhaps the most outstanding recent action may be its pilot experience in the implementation of the openness guide for action against climate change in collaboration with the International Open Data Charter.",
          "South Korea: its current open data agenda is focused on increasing the use cases of data by working more closely with companies and research centers.",
          "Japan: in response to the apparent low level of digital preparedness for events such as the current pandemic, the government recently decided to create the Digital Agency, a cross-cutting agency that is now in charge of the also new national data strategy."
        ],
        "allPossibleGlobalPerspectiveIdentifiedInTextContext": [
          "Redesign of open data platforms across the world",
          "Global increasing availability of open data on natural resources and climate change",
          "Growing international significance of data in health crises",
          "International efforts to utilize open data in combating corruption",
          "Global promotion of open science",
          "Worldwide growth of open data at regional and local levels"
        ]
      }
    `;
    }
    static renderCostAnalysis() {
        return `
      Open Data - How Much Does It Cost?
      (Note: originally published in 2016, and prices may have changed.)
      Everyone wants to know the costs and benefits of their actions. This is especially important for
      local governments, which often face resource constraints. And it certainly applies to open data.
      Open data advocates, practitioners, and providers are quick to point out its benefits: that it
      promotes transparency, improves efficiency and effectiveness of government services, fosters
      innovation, creates new business opportunities, etc. But when asked, “how much does it cost?”
      the answers may be “no information is available,” “nobody can tell,” or “it depends.” This post is
      intended to highlight some of the common cost elements and how much cities are investing in
      open data initiatives.
      What Are the Common Cost Elements of Opening Data?
      One of the important first steps in undertaking any program involving significant cash expense
      is cost estimation. Because of the perennial reality of limited resources, cost estimates for
      projects must be accurate, transparent, and reliable. Across all levels of governments, open data
      is becoming a key innovative tool for delivering results to residents. The amount cities are
      paying for developing open data programs depends on several factors, including but not limited
      to the type of portal functionality, data publishing services, available datasets, city size, type of
      datasets, add-on requirements, and city objectives. But what does this amount to? The Open
      Data Institute highlighted the following common costs elements for consideration when
      developing open data program:
      Set Up and Technical Cost
      ● Open data portal development costs
      ● Cost of storage including cloud storage
      ● Cost of creating APIs
      ● Hardware and other overhead costs
      Administration/Governance
      ● Getting legislation or policy written and approved
      ● Maintaining and enforcing the policy or legal requirements
      ● Legal costs to comply with open data legislation
      ● Managing requests or questions from the ecosystem
      ● Digitization of paper records or upgrading of data systems
      ● Cost of changing the way data is collected
      ● Creating a coordination unit within government
      Page 1
      Skills Development and Community Engagement
      ● Capacity building of developers
      ● Awareness raising activities to promote use
      ● Capacity building for the use of data within government
      ● Coordination unit human resource costs
      Sustainability Cost
      ● System maintenance cost
      ● Data inventorying and publishing
      ● Person hours for updating and administering the portal
      ● Liability costs in case of publication of nonpublic information
      ● Impact and analytics cost
      ● Staff compensation and training costs
      ● Portal contract renewal
      ● Cost of expanding portal functionalities and capabilities such as add-ons
      How Much Are Local Governments Paying for Opening Data?
      The desire of city leaders to use data and evidence to deliver results to their residents is
      growing rapidly. Though demand for public data continues to increase, only a few cities have
      the resources and structures to regularly release data. A recent report published by the
      Bloomberg Philanthropies’ What Works Cities Initiative found that city leaders nationwide are
      eager to address the challenges facing their residents by using data but are constrained by
      limited resources and expertise. The study revealed that of the 70% of cities whose leadership
      one way or the other have shown dedication to publishing data only 18% have established
      processes for releasing data publicly. Although, inadequate resources present a barrier to
      opening data, the lack of cost information poses potential threats to quenching the energies
      that have characterized open initiatives.
      Typically, it should not be difficult to get costs information by consulting available price lists
      from providers. Interestingly, open initiatives are supposed to increase transparency, but
      vendors tend to apply different transparency rules when it comes to pricing of their services.
      Not only do they shy away from being transparent about their pricing, they also require clients
      not to disclose cost information through non-disclosure and confidentiality agreements. Open
      data portals vary widely across cities. An analysis of contracts by the KPCC data team from
      selected cities with few miles apart from one another mostly within the state of California
      revealed interesting cost disparities. For instance; Pasadena, Anaheim, and Santa Clarita
      maintain open data portals with Junar, an open data service platform vendor but Pasadena’s
      annual contract is in excess of $20,666.67. On average, contracts with Socrata are relatively
      higher at least for the few selected contracts from cities that are available. Of the contracts
      examined, Chattanooga’s contract amount of $49,578 appears to be the highest. Figure 1. is a
      “Open Data - How Much Does It Cost?” Page 2
      summary of the annual cost for the selected cities from three different vendors; Junar, Opengov,
      and Socrata.
      Figure 1. Annual Cost of Contracts
      According to some service providers, pricing of data portals takes into account a city’s size, but
      there is little evidence to support that assertion. Figure 2. represents the cost of contracts by
      city with their corresponding population. The city of Los Angeles has a population of 3.88
      million and maintains a lower contract price than a number of the cities with fewer thousands of
      population.
      Figure 2. Contract and Population
      “Open Data - How Much Does It Cost?” Page 3
      So What Determines the Cost?
      Open data is garnering considerable momentum and significance in today’s governance
      practices. Thanks to a number of open data advocacy organizations, standards have been
      developed to advance open data practices, unleashing all of its benefits to society. However,
      pricing standards have lacked adequate attention necessary to measure the value or
      cost-effectiveness of government data portals. Besides setup and the technical and
      administrative costs of opening data, city leaders are always eager to know what other details
      determine the eventual cost. As it turns out, there is little information to satisfy such genuine
      curiosity. However, Socrata’s pricing structure in this spreadsheet (link downloads .xlsx) could
      be useful to understand some of the key cost determinants. The price list is primarily
      determined by the number of datasets, views and visualizations capabilities, desired number of
      users, storage, bandwidth, and APIs

      JSON Context:
      {
        "summary": "The text emphasizes the importance of understanding the costs associated with open data, detailing both the potential benefits and the challenges of obtaining clear cost estimates. It underscores the significance of cost estimation when introducing any significant expenditure, particularly for local governments with limited resources. The text highlights common cost elements cities should consider when developing open data programs and provides specific examples of what cities are investing in such initiatives. Additionally, it stresses that despite the transparency aims of open data initiatives, service providers often lack transparency regarding their pricing. Concrete costs from select cities are mentioned, emphasizing that pricing can vary widely even for cities in close proximity.",
        "relevanceToPolicyProposal": "The policy proposal aims to establish a comprehensive platform for government data to increase transparency. The 'Text Context' provides a detailed breakdown of the potential costs associated with setting up, administering, maintaining, and expanding such a platform, aligning closely with the policy proposal's objectives.",
        "mostRelevantParagraphs": [
          "One of the important first steps in undertaking any program involving significant cash expense is cost estimation. Because of the perennial reality of limited resources, cost estimates for projects must be accurate, transparent, and reliable. Across all levels of governments, open data is becoming a key innovative tool for delivering results to residents. The amount cities are paying for developing open data programs depends on several factors, including but not limited to the type of portal functionality, data publishing services, available datasets, city size, type of datasets, add-on requirements, and city objectives. But what does this amount to?",
          "Set Up and Technical Cost: Open data portal development costs, Cost of storage including cloud storage, Cost of creating APIs, Hardware and other overhead costs. Administration/Governance: Getting legislation or policy written and approved, Maintaining and enforcing the policy or legal requirements, Legal costs to comply with open data legislation, Managing requests or questions from the ecosystem, Digitization of paper records or upgrading of data systems, Cost of changing the way data is collected, Creating a coordination unit within government. Skills Development and Community Engagement: Capacity building of developers, Awareness raising activities to promote use, Capacity building for the use of data within government, Coordination unit human resource costs. Sustainability Cost: System maintenance cost, Data inventorying and publishing, Person hours for updating and administering the portal, Liability costs in case of publication of nonpublic information, Impact and analytics cost, Staff compensation and training costs, Portal contract renewal, Cost of expanding portal functionalities and capabilities such as add-ons.",
          "Open data portals vary widely across cities. An analysis of contracts by the KPCC data team from selected cities with few miles apart from one another mostly within the state of California revealed interesting cost disparities. For instance; Pasadena, Anaheim, and Santa Clarita maintain open data portals with Junar, an open data service platform vendor but Pasadena’s annual contract is in excess of $20,666.67. On average, contracts with Socrata are relatively higher at least for the few selected contracts from cities that are available. Of the contracts examined, Chattanooga’s contract amount of $49,578 appears to be the highest."
        ],
        "allPossibleCostAnalysisIdentifiedInTextContext": [
          "Open data portal development costs",
          "Cost of storage including cloud storage",
          "Cost of creating APIs",
          "Hardware and other overhead costs",
          "Getting legislation or policy written and approved",
          "Maintaining and enforcing the policy or legal requirements",
          "Legal costs to comply with open data legislation",
          "Managing requests or questions from the ecosystem",
          "Digitization of paper records or upgrading of data systems",
          "Cost of changing the way data is collected",
          "Creating a coordination unit within government",
          "Capacity building of developers",
          "Awareness raising activities to promote use",
          "Capacity building for the use of data within government",
          "Coordination unit human resource costs",
          "System maintenance cost",
          "Data inventorying and publishing",
          "Person hours for updating and administering the portal",
          "Liability costs in case of publication of nonpublic information",
          "Impact and analytics cost",
          "Staff compensation and training costs",
          "Portal contract renewal",
          "Cost of expanding portal functionalities and capabilities",
          "Pasadena’s annual contract is in excess of $20,666.67",
          "Chattanooga’s contract amount of $49,578"
        ]
      }
    `;
    }
    static renderImplementationFeasibility() {
        return `
      Open Government Data Feasibility Studies
      Spread the word
      Twitter
      Facebook
      Linkedin
      HomeOur WorkOpen Government Data Feasibility Studies
      Summary
      Project: Open Government Data Feasibility Studies
      Summary: Conduct feasibility studies in Chile, Ghana, and Indonesia to assess their readiness for adopting an open government data program, and then develop  a strategy and plan for implementing and sustaining such a program.
      Partners: Web Foundation, with the support of Fundacion CTIC, and the cooperation of many organizations within each country.
      Status: July 2010 through May 2011, with the possibility of adding more in the future.
      Funding: The project originated in response to a call for proposals from the Transparency and Accountability Initiative: a donor collaborative that includes the Ford Foundation, Hivos, the International Budget Partnership, the Omidyar Network, the Open Society Institute, the Revenue Watch Institute, and the William and Flora Hewlett Foundation. The funding for this project originates from the Omidyar Network and the Open Society Institute.
      Open Government and Open Data
      Over the past few years, a paradigm shift has been emerging around how governments work, and their use the Web and ICT to deliver better services to their constituencies.  The new approach is known as Open Government. It means rethinking how to govern, and rethinking how the administrations should adapt their procedures to meet the demands and necessities of the citizens. Open Government means a cultural, organizational, procedural and attitude change in public servants and the relation with the citizens.

      It is a new form of understanding political policies which are more legitimate and collaborative:

      Open Government = Transparency + Efficiency + Participation + Accountability

      Open Government Data (OGD) is a pillar of an Open Government strategy. OGD is when ministries and state agencies put their raw data on the Web in readable formats (preferrably, machine readable, open standard formats).  The public can review and download the data, and even create new applications around the data.  The governments of the United States and and and United Kingdom are so far the most prominent practitioners of this new approach, and have established portals (data.gov and data.gov.uk) to data catalogs.  These data are usable and freely exploitable by NGOs, activists, developers, IT companies, etc. to build and deliver services to people and organizations. See examples ofapplications in UK and in the US.

      The Web Foundation has been deeply involved in the OGD domain from the beginning, particularly through founder Sir Tim Berners-Lee and director Nigel Shadbolt, who continue to advise the UK government on the realization of data.gov.uk.  This paradigm shift is taking hold in other countries, regions and cities, but mainly, so far in the developed world.

      Next Frontier: Low and Middle Income Countries
      Given the benefits of Open Government Data programs, it is sensible to consider the development of similar programs all over the world, and particularly in low and middle-income countries. This project is a first step to assess this promising possibility. A first study,Open Data Study by Becky Hogge (2010), identified potential challenges and opportunities in low and middle income countries in a general sense. Our objectives is to take the next step by assess the feasibility of implementing Open Government Data programs the three countries specifically, in three different regions.  Based on the experience and contacts of the Web Foundation and our funders, we focused on Ghana and Chile.

      Approach
      Develop a methodology and a set of composite indicators that will enable the definition of OGD Readiness of a given country. These indicators will cover different levels, including the political willingness, the public administration readiness, and the civil society interest and readiness
      Conduct research (via the Web and phone/email interviews) to provide quantitative and qualitative data about the different countries and prepare for visits
      Visit each country to meet the people and organizations key to any future success, and to refine the assessment of OGD readiness for each country individually
      Expected Outcomes
      The expected outcome of these studies is a report answering two major questions:

      Is the country ready to engage in and maintain an OGD program? If yes, how?
      If not, why not? .. and what must be done before they are ready?

      JSON Output:
      {
          "summary": "The 'Open Government Data Feasibility Studies' project assesses the feasibility of countries like Chile, Ghana, and Indonesia in adopting an open government data program. The studies aim to evaluate each country's readiness, develop strategies, and create a sustainable plan. The Web Foundation partners with various organizations and is funded by notable entities such as the Omidyar Network and the Open Society Institute. Open Government Data (OGD) is pivotal in an Open Government strategy, making government data accessible and usable by the public. While countries like the US and UK have already adopted this approach, the next frontier is introducing it in low and middle-income countries.",

          "relevanceToPolicyProposal": "The text context provides a detailed study of the feasibility of implementing an Open Government Data program in different countries, which aligns with the policy proposal of creating a Public-Friendly Open Data Platform. It underscores the importance of transparency, efficiency, and participation in democratic institutions.",

          "mostRelevantParagraphs": [
              "Project: Open Government Data Feasibility Studies\nSummary: Conduct feasibility studies in Chile, Ghana, and Indonesia to assess their readiness for adopting an open government data program, and then develop  a strategy and plan for implementing and sustaining such a program.",
              "Open Government and Open Data\nOver the past few years, a paradigm shift has been emerging around how governments work, and their use the Web and ICT to deliver better services to their constituencies. The new approach is known as Open Government. It means rethinking how to govern, and rethinking how the administrations should adapt their procedures to meet the demands and necessities of the citizens.",
              "Open Government Data (OGD) is a pillar of an Open Government strategy. OGD is when ministries and state agencies put their raw data on the Web in readable formats (preferrably, machine readable, open standard formats). The public can review and download the data, and even create new applications around the data.",
              "Next Frontier: Low and Middle Income Countries\nGiven the benefits of Open Government Data programs, it is sensible to consider the development of similar programs all over the world, and particularly in low and middle-income countries. This project is a first step to assess this promising possibility."
          ],

          "allPossibleImplementationFeasibilityIdentifiedInTextContext": [
              "Conduct feasibility studies in specific countries to assess their readiness for adopting an open government data program.",
              "Development of strategy and plan for implementing and sustaining the open government data program.",
              "Funding from reputable organizations such as the Omidyar Network and the Open Society Institute.",
              "OGD makes government data accessible and usable by the public, allowing them to review, download, and create new applications.",
              "Considering the expansion of Open Government Data programs to low and middle-income countries.",
              "Development of a methodology and indicators to assess OGD readiness of a country, including factors like political willingness, public administration readiness, and civil society interest."
          ]
      }
    `;
    }
}
//# sourceMappingURL=evidenceExamplePrompts.js.map