export class RootCauseExamplePrompts {
    static render(categoryType) {
        switch (categoryType) {
            case "historicalRootCause":
                return RootCauseExamplePrompts.renderHistoricalRootCause();
            case "economicRootCause":
                return RootCauseExamplePrompts.renderEconomicRootCause();
            case "scientificRootCause":
                return RootCauseExamplePrompts.renderScientificRootCause();
            case "culturalRootCause":
                return RootCauseExamplePrompts.renderCulturalRootCause();
            case "socialRootCause":
                return RootCauseExamplePrompts.renderSocialRootCause();
            case "environmentalRootCause":
                return RootCauseExamplePrompts.renderEnvironmentalRootCause();
            case "legalRootCause":
                return RootCauseExamplePrompts.renderLegalRootCause();
            case "technologicalRootCause":
                return RootCauseExamplePrompts.renderTechnologicalRootCause();
            case "geopoliticalRootCause":
                return RootCauseExamplePrompts.renderGeopoliticalRootCause();
            case "ethicalRootCause":
                return RootCauseExamplePrompts.renderEthicalRootCause();
            case "caseStudies":
                return RootCauseExamplePrompts.renderCaseStudies();
            default:
                throw new Error("Unknown root cause type");
        }
    }
    static renderHistoricalRootCause() {
        return `
    Literacy By Any Means Necessary: The History of Anti-Literacy Laws in the U.S
    Written by Carliss Maddox
    January 12, 2022

    Imagine being one of those readers seeking knowledge that reflects on your own human experience
    and being withheld from doing so. Unfortunately, in the United States, there was a time when certain
    individuals were prohibited from learning to read or write based on the color of their skin. Historically,
    black people were not allowed to read, write, or even own a book because of anti-literacy laws. Anti-literacy
    laws made it illegal for enslaved and free people of color to read or write. Southern slave states enacted
    anti-literacy laws between 1740 and 1834, prohibiting anyone from teaching enslaved and free people of
    color to read or write. The purpose of this blog is to shed light on the history of anti-literacy laws
    that restricted black people’s access to literacy and to demonstrate the resilience of a people who used
    their emancipated minds to obtain literacy by any means necessary.

    Anti-Literacy Laws and Abolitionist Frederick Douglass

    Confederate states in the antebellum South that passed anti-literacy laws included South Carolina,
    North Carolina, Georgia, Louisiana, Mississippi, Virginia, and Alabama. Due to fear following the Stono
    Rebellion, the largest slave uprising in South Carolina in 1739, blacks were prohibited from learning
    to read. Plantation owners feared that literate slaves could write and use forged documents to gain their
    freedom. However, many of the enslaved used this method to obtain their freedom. Slave owner Hugh Auld
    describes this fear in this exchange with his wife, Sophia Auld, after he discovered her teaching a young
    Frederick Douglass how to read:

    He should know nothing but the will of his master and learn to obey it. As to himself, learning will do him
    no good, but a great deal of harm, making him disconsolate and unhappy. If you teach him how to read, he’ll
    want to know how to write, and this accomplished, he’ll be running away with himself. (Douglass, 2017, p. 14)

    Mr. Auld’s fear did not stop Douglass from learning how to read. In fact, it only inspired him to become even
    more fearlessly determined to learn to read and write. For Douglass, Auld’s reaction was a “North Star” moment
    that led to education as a pathway to freedom. In his book, Narrative of the Life of Frederick Douglass: An
    American Slave, Douglass spoke of this incident:

    Whilst I was saddened by the thought of losing the aid of my kind mistress, I was gladdened by the invaluable
    instruction which, by the merest accident, I had gained from my master. Though conscious of the difficulty of
    learning without a teacher, I set out with high hope, and a fixed purpose, at whatever cost of trouble, to learn
    how to read. (Douglass, 2017, p. 15)

    Even though his lessons with Mrs. Auld had ended, Douglass found creative ways to learn to read. I envision
    Douglass saying to himself, “If you don’t teach me to read directly, I will learn to read indirectly.” Douglass
    made friends with white children in the community that taught him to read in exchange for food. He learned how
    to write by watching ship carpenters write the names of ship parts on timbers in the shipyard. The poet Khalil
    Gibran beautifully describes this resilience when he says, “You may chain my hands, you may shackle my feet;
    you may even throw me into a dark prison; but you shall not enslave my thinking, because it is free!” Douglass,
    who became an abolitionist, outspoken orator, and author, made it his mission to obtain literacy by any means necessary.

    Knowledge acquired by a slave was like a death knell to a slave owner. In order to destroy any semblance of humanity,
    plantation owners kept enslaved black people in the dark. The majority of enslaved people didn’t even know the year
    they were born or their lineage. It was a purposeful removal of identity in an effort to perpetuate the slave
    mentality. Several confederate states jointly imposed literacy restrictions on the enslaved using legislation
    that went beyond the shackling of bodies and extended into the shackling of minds. In their attempts to shackle
    our intellect, they failed to factor in the resilience of a people who endured centuries of brutal dehumanization
    and forced assimilation. A paradigm shift occurs in the thinking processes of enslaved people who gain knowledge.
    Their thinking moves from a slave mentality to a mentality of liberation, thus making them “unfit to be slaves,” as
    Frederick Douglass stated.

    JSON Output:
    {
        "rootCauseRelevanceToProblemStatement": "The website demonstrates how anti-literacy laws in the United States, which prevented black people from learning to read or write, directly contributed to the disparities in literacy proficiency.",
        "allPossibleHistoricalRootCausesIdentifiedInTextContext: [
          "Historical anti-literacy laws in the United States",
          "Enslaved people were prohibited from learning to read or write",
          "Shackling of minds through legislation",
        ]
    }
  `;
    }
    static renderEconomicRootCause() {
        return `
    Low Literacy Levels Among U.S. Adults Could Be Costing The Economy $2.2 Trillion A Year
    Michael T. Nietzel
    Senior Contributor

    A new study by Gallup on behalf of the Barbara Bush Foundation for Family Literacy finds that low levels
    of adult literacy could be costing the U.S. as much $2.2 trillion a year. According to the U.S. Department of
    Education, 54% of U.S. adults 16-74 years old - about 130 million people - lack proficiency in literacy,
    reading below the equivalent of a sixth-grade level. That's a shocking number for several reasons, and its
    dollars and cents implications are enormous because literacy is correlated with several important outcomes
    such as personal income, employment levels, health, and overall economic growth.

    Key Findings:

    Income is strongly related to literacy. The average annual income of adults who are at the minimum proficiency
    level for literacy (Level 3) is nearly $63,000, significantly higher than the average of roughly $48,000
    earned by adults who are just below proficiency (Level 2) and much higher than those at the lowest levels
    of literacy (Levels 0 and 1), who earn just over $34,000 on average. Because individuals with varying levels of
    literacy different in several other ways, such as age, gender, urbanicity, race, ethnicity, and parental
    education, the authors controlled for those differences and found that while the large income differences
    between people with different literacy skills shrank, they were still quite large: the difference for people
    below literacy Level 1 and those at Level 3 was $23,979 the gap between people at Level 2 and those at Level 3
    was $13,193. Eradicating illiteracy would yield huge economic benefits. If all U.S. adults were able to move up
    to at least Level 3 of literacy proficiency, it would generate an additional $2.2 trillion in annual income for
    the country, equal to 10% of the gross domestic product. Areas with the lowest levels of literacy would see the
    largest gains. States that have a disproportionate share of adults with low levels of literacy would gain the most
    economically from increasing literacy skills. For example, in Alabama, an estimated 61% of adults fall below Level 3
    literacy on the PIACC. If they could be moved to Level 3, the gains would be 15.6% of Alabama's GDP. By contrast,
    gains from eradicating illiteracy would be relatively small - 5% of local GNP - in Washington, D.C., where 47% of
    the population is nonproficient. In North Dakota, where there're relatively high-paying opportunities for less
    educated workers, the individual gains from literacy are smaller. North Dakota also has low rates of nonproficiency
    (45%). These two factors in combination explain why North Dakota would see income gains of only 3.9% of its GDP.
    Big economic gains would be achieved in large metropolitan areas. The study also found that the nation's largest
    metropolitan areas - including New York City, Los Angeles, Chicago and Dallas - would all gain at or just above
    10% of their GDP by bringing all adults to a sixth grade reading level.

    “The U.S. confronts a long-standing challenge of high-income inequality, with strikingly large gaps in wealth
    and income between people of different races,” said lead author, Jonathan Rothwell. “On top of these long-term
    challenges, the Covid-19 pandemic has weakened the economy and overlapped with a robust movement addressing racial
    injustice. Eradicating illiteracy would not solve every problem, but it would help make substantial progress in
    reducing inequality in the long-term and give a much-needed boost to local and regional economies throughout the country.”

    “Eradicating illiteracy would be enormously valuable under any circumstances,” Rothwell continued. “Given the current
    economic and health challenges, there is even more at stake in ensuring that everyone can fully participate in society.”

    JSON Output:
    {
      "rootCauseRelevanceToProblemStatement": "Relevant to the problem statement as it highlights the economic implications of low literacy levels.",
      "allPossibleEconomicRootCausesIdentifiedInTextContext": [
        "Income levels are strongly related to literacy skills.",
        "Low literacy levels have a significant economic impact on the U.S. economy.",
        "The impact of low literacy varies by region, with some areas experiencing more significant gains from improving literacy skills."
      ]
    }
  `;
    }
    static renderScientificRootCause() {
        return `
    Cognitive Factors That Affect Reading Comprehension
    Education | K-12
    By Lucy Hart

    Reading comprehension is a cognitive process that requires myriad skills and strategies. Numerous
    programs are designed to improve reading comprehension: summer reading, read to succeed, student
    book clubs and battle of the books. However, according to the U.S. Department of Education, millions
    of students progress each year without the necessary reading skills. Reading comprehension involves
    various factors such as background knowledge, vocabulary and fluency, active reading skills and critical
    thinking that must work together.


    Background Knowledge
    Background knowledge plays an essential role in reading comprehension. In an effort to comprehend a text,
    students rely on their background knowledge to link what they already know to the text they are reading.
    Background knowledge includes both a reader’s real-world experiences and literary knowledge. Drawing parallels
    between background knowledge and texts helps students become active readers, improving their reading comprehension.

    Vocabulary
    Whether or not students have mastered vocabulary skills affects their reading comprehension. Students must be
    able to comprehend a familiar word and its relationship with other words within a text. Mastering vocabulary
    includes recognizing a word’s part of speech, definition, useful context clues, and how it functions in a
    sentence. These vocabulary strategies can help improve comprehension.


    Fluency
    Reading with fluency allows students to retain information with accuracy, expression and increased speed.
    The ability to read fluently develops through reading practice. As students become fluent readers, they
    will spend less time trying to decipher the meaning of words and more time considering the overall meaning
    of the sentences. Over time, fluent readers will develop the ability to insightfully respond to a text.

    Active Reading
    Beginning readers often rely on skilled readers to guide them through a text. However, as readers develop,
    they will be able to monitor their own reading comprehension. Students can actively guide their own reading
    by targeting comprehension problems as they occur. Students can troubleshoot comprehension problems by recalling
    what they read, asking themselves questions or evaluating the text.

    Critical Thinking
    Students can actively respond to a text more efficiently when they possess critical thinking skills. As students
    read, they can determine the main idea and supporting details, the sequence of events and the overall structure
    of the text. Students will also be able to identify literary devices and their effect on the text. Having critical
    thinking skills help to deepen a student’s comprehension of a text, resulting in a positive reading experience.


    JSON Output:
    {
        "rootCauseRelevanceToProblemStatement": "The website provides relevant information about factors that affect reading comprehension, which is crucial in addressing the literacy gap.",
        "allPossibleScientificRootCausesIdentifiedInTextContext": [
            "Ineffective assessment and feedback mechanisms",
            "Lack of focus on metacognition",
            "Inadequate teacher training",
        ]
    }
  `;
    }
    static renderCulturalRootCause() {
        return `
    Linguistic, social, and cultural factors influencing literacy development and academic achievement of Puerto Rican students in elementary school
    Aramina Vega Ferrer, Fordham University

    Abstract
    Throughout the United States and in New York City specifically, public school students of Puerto Rican
    origin/descent have exhibited an historical and consistent problem in English language literacy development
    and high academic achievement. The purpose of this study was to examine the interaction of linguistic, cultural,
    and social factors on the literacy development and academic achievement of Puerto Rican elementary school
    students. Linguistics for Puerto Rican students is influenced by language proficiency in the first and second
    language, degree of bilingualism, and students' own language perceptions. Cultural and social factors are
    influenced by the socioeconomic level of parents, their literacy levels, patterns of language usage at home, and
    parents' attitudes towards education. Participants in the study were 22 fifth-grade Puerto Rican students
    enrolled in an elementary public school in the Bronx, New York during the 2008–2009 school year, and their
    parents who volunteered to participate in the study. Academic achievement for participating students was measured
    by quantitative data from standardized test scores in English and Spanish reading, and student writing samples
    in English and Spanish, in concert with qualitative data from a researcher-developed student questionnaire, and
    parent questionnaire/interview. Parent interviews were scheduled at the school, audiotaped, and transcribed for
    analysis. Findings indicated that at the speaking level, participating fifth-grade Puerto Rican students
    demonstrated various levels of bilingual proficiency, while few demonstrated written language proficiency in
    Spanish. The Puerto Rican families predominantly engaged in code-switching between L1 and L2 in the home reinforcing
    the degree of bilingualism in the chiidren. Students reported that they planned to speak both languages with their
    chiidren in the future and demonstrated a positive attitude toward bilingualism. Participating Puerto Rican students
    significantly outperformed all fourth grade students at the school and in the district in English reading. All 20
    parents interviewed supported their children's education in the home through the use of computers, homework help,
    and school projects, along with exposure to age appropriate electronic media such as TV and radio. While half
    of the parents in the study were high school and college graduates, all parents articulated high academic and
    career expectations for their children.

    JSON Output:
    {
      "rootCauseRelevanceToProblemStatement": "TThe website is relevant to the problem statement as it addresses the literacy gap and its potential root causes, specifically focusing on cultural factors.",
      "allPossibleCulturalRootCausesIdentifiedInTextContext": [
        "Degree of bilingualism",
        "Patterns of language usage at home",
        "Parents' attitudes toward education",
      ]
    }
  `;
    }
    static renderSocialRootCause() {
        return `
    The Relationship between Socioeconomic Status and Literacy: How Literacy is Influenced by and Influences SES
    January 5, 2023 MJEResearch
    By Maren Blanchard

    ABSTRACT

    Literacy levels in children have strong implications for future employment opportunities and level of SES. In this
    research article, we evaluate literature regarding one’s level of literacy and socioeconomic status (SES) to find
    how literacy influences SES and how SES influences literacy. In this context, SES is measured by level of income.
    A strong positive correlation is found between literacy and SES, with higher income being linked to higher literacy.

    INTRODUCTION

    The cycle of poverty is widely acknowledged in the U.S. economic system and society at large; however, the deeply
    intertwined cycle of literacy is lesser known. The cycle of literacy and the cycle of poverty both describe how one’s
    circumstances at birth can influence their future life outcomes. Those born into a low SES often have fewer opportunities
    and experience more difficulty obtaining a higher SES. Similarly, those born to parents with low literacy will not have a
    strong foundation for literacy before entering school and are more likely to fall behind and have lower literacy levels.
    SES and literacy intersect in the educational and job markets, where higher-paying careers often require higher education,
    which in turn requires higher levels of literacy.

    In this context, the term “literacy level” does not merely represent one element of reading or writing, but rather a
    composite evaluation determined by factors such as phonological awareness, vocabulary, fluency, and many others. Literacy
    research is a deeply complex field of study with many intersections, one of these intersections being socioeconomic status.
    SES in this context is measured by level of income. In this research article, we will answer the question “how does
    socioeconomic status impact literacy, and how can literacy impact socioeconomic status?” and discuss the implications of
    this relationship from childhood (SES influencing literacy) to adulthood (literacy influencing SES).

    Just as those born into poverty have a stronger likelihood of remaining impoverished, those born into a family with low
    literacy levels are likely to have weak literacy skills themselves (Rea, 2020). This seems logical, as parents who are
    not comfortable with literature will interact with it less than parents with higher literacy levels. Similarly, as these
    parents are likely not confident in teaching their children how to read or write, these children will lack a strong
    home-literacy foundation, thus leading to a lower level of literacy.  A low literacy level may disadvantage someone
    searching for a higher-paying job, as many skilled positions require strong literacy. Many may argue that the child’s
    school district is solely responsible for developing literacy, but this assumes the child’s family is living in an area
    with a good school district. Being born into a low SES likely means one will attend a school with lower levels of funding,
    creating a learning environment that is not as strong as their middle or upper-class peers (Rea, 2020). Considering
    shortages of teachers and behavioral issues often present in poorly funded school districts, these schools may be unable
    to teach crucial aspects of literacy development, causing students to lack certain foundational skills and lag behind
    their peers who attend better-funded schools. We observe that literacy and socioeconomic status are intertwined in multiple
    ways.  Many people of lower socioeconomic statuses have lower literacy levels, this relationship resulting both from how
    SES can influence literacy and from how literacy can influence SES (Rea, 2020).

  JSON Output:
  {
    "rootCauseRelevanceToProblemStatement": "The text is highly relevant to the problem statement as it directly addresses the root causes of the literacy gap, which include differences in resources and opportunities available to students.",
    "allPossibleSocialRootCausesIdentifiedInTextContext": [
      "Socioeconomic status (SES) influences literacy levels",
      "Low SES leads to lower literacy skills in children",
      "Low literacy levels can disadvantage individuals in the job market",
    ]
  } `;
    }
    static renderEnvironmentalRootCause() {
        return `
    Environmental inequality and disparities in school readiness: The role of neurotoxic lead
    Jared N. Schachner, Geoffrey T. Wodtke
    First published: 12 June 2023

    Abstract
    Developmental science has increasingly scrutinized how environmental hazards influence child outcomes, but few studies
    examine how contaminants affect disparities in early skill formation. Linking research on environmental inequality and
    early childhood development, this study assessed whether differences in exposure to neurotoxic lead explain
    sociodemographic gaps in school readiness. Using panel data tracking a representative sample of 1266 Chicago children
    (50% female, 16% White, 30% Black, 49% Hispanic, μage = 5.2 months at baseline, collected 1994–2002), analyses quantified
    the contribution of lead contamination to class and racial disparities in vocabulary skills and attention problems at ages
    4 and 5. Results suggested that lead contamination explains 15%–25% and 33%–66% of the disparities in each outcome,
    respectively, although imprecise estimates preclude drawing firm inferences about attention problems.

    Contaminants in the physical environment, such as heavy metals, synthetic chemicals, and other forms of pollution, are
    widely held to exert a harmful influence on child development (Trentacosta et al., 2016; Trentacosta & Mulligan, 2020).
    Ecological systems theory and prior research in environmental epidemiology both indicate that exposure to such contaminants
    within the home, neighborhood, or broader community poses major risks to the health and development of young children
    (Aizer et al., 2018; Bronfenbrenner & Morris, 2006; Evens et al., 2015; Wodtke et al., 2022). It is also widely known that
    exposure to many of these hazards is sharply stratified by race and class, with minority groups and children of lower
    socioeconomic status disproportionately living in contaminated environments (Mohai et al., 2009; Muller et al., 2018).
    Because health hazards in the physical environment harm child development and are unequally distributed across sociodemographic
    groups, environmental inequalities likely engender developmental disparities, including class and racial gaps in academic
    skills, which are among the most debated and decried features of American society.

    Despite growing recognition that environmental contaminants may contribute to the etiology of disparities in child development,
    empirical research “integrating developmental science and the fields of environmental health and toxicology is rare”
    (Trentacosta et al., 2016: 229). Instead, a focus on the family, early childhood education, and primary schools still
    predominates in the large, interdisciplinary literature examining class and racial gaps in key developmental outcomes (Duncan
    & Magnuson, 2005, 2011; Jencks & Phillips, 1998; Reardon, 2016). Although differences in children's families, schools, and early
    educational environments are undoubtedly important, they do not appear to fully explain disparities in cognitive and
    socioemotional skills (Duncan & Magnuson, 2005; Sastry & Pebley, 2010).

    If environmental hazards account for these residual disparities, exposure during early childhood is likely pivotal. Skill
    formation occurs in a cumulative and highly nonlinear manner, with the steepest learning rates and greatest sensitivities
    to environmental inputs observed during children's earliest years of life (Heckman & Mosso, 2014; Shonkoff & Phillips, 2000).
    Relatedly, class and racial gaps in cognitive skills emerge between ages 2 and 5, and once formed, they change relatively
    little thereafter (Duncan & Magnuson, 2011; Heckman, 2006; von Hippel et al., 2018). Thus, the most important environmental
    determinants of sociodemographic gaps in development are likely to be found early during the course of childhood.

    In this study, we asked whether early life exposure to environmental contaminants contributes to class and racial differences
    in school readiness measured at ages 4 and 5. Among the many different hazards that disproportionately afflict poor and
    minority children, lead poisoning, in particular, may play an important explanatory role for several reasons. First,
    exposure to lead, even at very low levels, significantly impairs children's cognitive development, especially when it occurs
    during early childhood (Aizer et al., 2018; Lanphear et al., 2005). Second, owing to the strong and persistent link between
    neighborhood segregation and lead contamination, Black, Hispanic, and low-income children are at substantially greater risk of
    subclinical lead poisoning than are White and more affluent children (Egan et al., 2021; Teye et al., 2021; Wodtke et al., 2022).
    We therefore hypothesized that differences in exposure to lead-contaminated environments during early childhood can explain,
    at least in part, class and racial disparities in school readiness.

    JSON Output:
    {
      "rootCauseRelevanceToProblemStatement": "The text discusses the role of environmental factors, particularly neurotoxic lead exposure, in contributing to disparities in school readiness, which is directly related to the literacy gap.",
      "allPossibleEnvironmentalRootCausesIdentifiedInTextContext": [
        "Exposure to neurotoxic lead",
        "Environmental contaminants in the physical environment",
        "Neighborhood segregation leading to lead contamination",
      ]
    }

  `;
    }
    static renderLegalRootCause() {
        return `
    Anti-literacy laws in the United States

    Anti-literacy laws in many slave states before and during the American Civil War affected slaves, freedmen, and in some cases
    all people of color.[1][2] Some laws arose from concerns that literate slaves could forge the documents required to escape
    to a free state. According to William M. Banks, "Many slaves who learned to write did indeed achieve freedom by this method.
    The wanted posters for runaways often mentioned whether the escapee could write."[3] Anti-literacy laws also arose from fears
    of slave insurrection, particularly around the time of abolitionist David Walker's 1829 publication of Appeal to the Colored
    Citizens of the World, which openly advocated rebellion,[4] and Nat Turner's slave rebellion of 1831. The United States is the
    only country known to have had anti-literacy laws.[5]

    Between 1740 and 1834 Alabama, Georgia, Louisiana, Mississippi, North and South Carolina, and Virginia all passed anti-literacy
    laws.[6] South Carolina passed the first law which prohibited teaching slaves to read and write, punishable by a fine of 100
    pounds and six months in prison, via an amendment to its 1739 Negro Act.[7][8]

    Some slaveowners blamed abolitionists for the supposed need for anti-literacy laws. For example, South Carolina's James H.
    Hammond, an ardent pro-slavery ideologue, wrote in a letter written in 1845 to the British abolitionist Thomas Clarkson:
    "I can tell you. It was the abolition agitation. If the slave is not allowed to read his bible, the sin rests upon the
    abolitionists; for they stand prepared to furnish him with a key to it, which would make it, not a book of hope, and love,
    and peace, but of despair, hatred and blood; which would convert the reader, not into a Christian, but a demon. [...] Allow
    our slaves to read your writings, stimulating them to cut our throats! Can you believe us to be such unspeakable fools?"[9]

    Restrictions on the education of black students were not limited to the South.[15] While teaching blacks in the North was not
    illegal, many Northern states, counties, and cities barred black students from public schools.[16] Until 1869, only whites
    could attend public schools in Indiana and Illinois.[16] Ohio excluded black children from public schools until 1849, when
    it allowed separate schools for black students.[16] Public schools were also almost entirely segregated in Michigan, Minnesota,
    New Jersey, Pennsylvania, and New York.[16] Only Massachusetts had de-segregated public schools before the Civil War
    (it barred segregation in public schools in 1855).[15][16] An attempt in 1831 to open a college for black students in New
    Haven, Connecticut was met with such overwhelming local resistance that the project was almost immediately abandoned (see Simeon
    Jocelyn).[17] Private schools that attempted to educate black and white students together, often opened by abolitionists, were
    destroyed by mobs, as in the case of Noyes Academy in Canaan, New Hampshire[18] and the Quaker Prudence Crandall's Female
    Boarding School in Canterbury, Connecticut.[17] After the Civil War, most Northern states legally prohibited segregation in
    public schools, although it often continued in practice, pre-Brown v. Board of Education, including through racially
    gerrymandered boundaries of school districts.[16]

    JSON Output:
    {
      "rootCauseRelevanceToProblemStatement": "These anti-literacy laws historically hindered the access to education for people of color, contributing to the literacy gap.",
      "allPossibleLegalRootCausesIdentifiedInTextContext": [
        "Anti-literacy laws in slave states",
        "Slaveowners' fears and beliefs",
        "Education restrictions in Northern states"
      ]
    }

  `;
    }
    static renderTechnologicalRootCause() {
        return `
    The Effects of Digital Technology on Reading
    Does reading on a screen interfere with in-depth learning? Yes!
    Posted January 15, 2017

    1. Reading on a screen lacks a tactile experience.

    Reading is a multi-sensory experience. According to research, the brain’s act of reading uses not just sight, but also the
    act of touch. There is something about holding a physical page of material that makes it more absorbable. “The shift from
    paper to screen doesn’t just change the way we navigate a piece of writing. It also influences the degree of attention we
    devote to it and the depth of our immersion in it.” (Carr 2011).

    2. Reading on a screen makes it harder to navigate and orient oneself, especially with hypertexts.

    Hypertexts are one of the web’s most important tools. Indeed, hypertexts are the reason that the web is called “the web.”
    The user jumps from one spot to another with the click of the mouse, and then to another, and then to another—forming a web
    of jumps. Often, exactly where you are, and how you got there, may not be exactly clear. That’s fine if you are just trying
    to continually refine your search for specific information.

    However, hypertexts seem to be a major detractor when attempting to read a longer, cohesive text. “Research continues to show
    hat people who read linear text comprehend more, remember more, and learn more than those who read text peppered with links.”
    (Carr 2011) As just one of many research examples, 35 adults were given a short story to read in the usual linear text format
    and were compared to another 35 adults who were given the same story to read in a version with hypertexts such as would be
    found on a web page. Even though the hypertext readers took longer, 3 out of 4 reported problems following the text, compared
    to just 1 out of 10 readers who were given the linear text.

    In addition to hypertexts, there is another feature of reading on the screen that makes it harder to find where you are while
    reading. Given a screen’s ability to scroll, to alter the size of the text, to alter how many columns it presents, etc.
    (i.e. continually change what the reader sees), it is hard to form a reliable visualization of the material. You can’t just
    say to yourself, “It was at the bottom of the left side of the page towards the back of the book,” because the next time you
    access the material, it may not be in the same spot visually. Long articles are not broken down into pages, further confounding
    the reader’s sense of where she is in the piece. All of this matters, since “a good spatial mental representation of the physical
    layout of the text leads to better reading comprehension” (Greenfield 2015). The miniature screen on a smartphone only compounds
    the problem. Many people find it easier to flip through the pages of a book or printout than to relocate the spot on a screen.

    These negative effects of hypertext reading are not inevitable, though. Using a navigational support structure may be helpful.
    Certain reader characteristics, such as the ability to see the “big picture,” prior knowledge of the subject, and increased
    interest in the subject all help mitigate the confusion. (Loh 2015)

    3. Digital technology may lead to shallower comprehension.

    In traditional printed books, the author has (presumably) spent considerable time devising a logical story or line of reasoning.
    As the reader works his way through the book, he can stop and ponder the unfolding material. When he is finished thinking about
    what he just read, the book is still there—ready to lead the reader again along a lengthy, fully thought out trail of logic.
    Hypertexts are the death of an author-driven line of reasoning. They take you all over, from place to place, author to author,
    subject to subject—and rarely return you to your jumping-off point of that well thought out, comprehensive text that you started
    out with. Instead, the viewer finds himself skimming sites (i.e., shallow reading) as he jumps around looking for the next
    quick rewarding tidbit. Indeed, the average web page holds the reader for 18 seconds.

    Search engines are part of the problem as well. Don’t get me wrong, I love Google. I couldn’t function without it. Or PubMed
    for my medical research. Or Amazon’s book search feature. It’s just that they take us right to the direct hit, which for many
    of us is all we read. This, again, avoids the surrounding logic intended by the author, and we may also miss the context of that
    direct search hit. A review of university student reference citations in their research papers showed that 46% were to the first
    page of the source, and 77% were to the first three pages. College students doing research almost never get past the first three
    pages! (Baron 2015) This is yet another source of potential shallow reading.

    After conducting a survey of the research habits of 400 Canadian students, the study authors concluded students felt that online
    materials were fine for picking up specific elements of materials, but that for engaging in substantial work, print books were
    preferred. Print gave a sense of the whole (Baron 2015).

    There is concern that the reliance upon shallow reading may interfere with the development of deep reading skills such as
    thoughtful pondering, critical analysis, and inferential thinking. It is feared that neurological connections required for
    deep reading such as brain areas involved in visual processing and phonological processing may not be made in those people who
    learn primarily via shallow reading (Loh 2015).

    JSON Output:
    {
      "rootCauseRelevanceToProblemStatement": "This is relevant to the literacy gap as it discusses the potential impact of digital technology on reading, which could contribute to lower reading proficiency.",
      "allPossibleTechnologicalRootCausesIdentifiedInTextContext": [
        "Influence of digital screens on reading",
        "Negative effects of hypertexts on reading",
        "Shallower comprehension due to digital technology"
      ]
    }
  `;
    }
    static renderGeopoliticalRootCause() {
        return `
    GEOPOLITICAL ILLITERACY AND PUBLIC DIPLOMACY
    Mar 2, 2020 by Vivian S. Walker

    In an era of renewed ideological warfare, here’s a new strategic vulnerability to consider: geopolitical illiteracy.

    Experts have long recognized that promotion of media literacy—educating the information consumer to navigate the global media
    space—is essential to counter destabilizing information distraction and manipulation effects.

    But media literacy is not enough. We need to address an even more fundamental challenge—the absence of geopolitical literacy—or
    what every citizen needs to know about the strategic imperatives her country faces in the global context, and how these
    imperatives impact her, the members of her family, her community, her town, her region, her country. In this hyperconnected,
    hyper responsive world, we no longer have the luxury of information isolationism. National security begins at the level of
    individual knowledge about the global context.

    To address the phenomenon of geopolitical illiteracy, we need to understand what lies behind it, beginning with Joseph Nye’s
    identification of “paradox of plenty”—the near infinite supply of data in the global information space that produces scarcity
    of attention rather than greater understanding. Because there is so much data to choose from, people gravitate to information
    that either confirms their exiting biases, appeals to their prejudices or bolsters their convictions. Information absorption
    dictated by instinct or emotion precludes the broad, inclusive understanding necessary for effective engagement in the global
    information space.

    National security begins at the level of individual knowledge about the global context.

    The narrowing scope of understanding is further exacerbated by the disaggregation of information. Geopolitical illiteracy
    thrives when news and information become detached from original context or story lines. These discontinuous chunks of data
    elements are then redistributed along individual economic, political and social profiles. Whether generated by social media
    platform algorithms, consumer purchase patterns or ideological inclinations, the resultant narratives are far removed from
    their origins. Fractured information results in fractured understanding.

    Finally, in the digital age, the burden of source credibility assessment has shifted to individual information consumers and
    their immediate networks. To be geopolitically literate, information consumers must make an effort to identify sources, verify
    claims, and break out of fixed patterns of data consumption—something that is difficult to do in a disjointed information space.
    Credible interlocutors such as journalists and teachers also have a responsibility to place national policy decisions in a
    broader geostrategic context—to enable citizens to understand that global economic and security interdependencies impact
    domestic interests and priorities.

    JSON Output:
    {
      "rootCauseRelevanceToProblemStatement": "The website is relevant to the problem statement as it discusses the importance of geopolitical literacy and its potential impact on the literacy gap.",
      "allPossibleGeopoliticalRootCausesIdentifiedInTextContext": [
        "Lack of access to comprehensive and balanced geopolitical education",
        "Information isolationism and information consumption biases",
        "Discontinuity and fragmentation of information",
      ]
    }
  `;
    }
    static renderEthicalRootCause() {
        return `
    The Ignored Science That Could Help Close the Achievement Gap
    There’s a body of research on cognitive reading processes, so why isn’t it being utilized?
    By Hayley Glatter

    As of January 2014, about 76 percent of Americans over the age of 18 said they had read a book in the last year, according
    to Pew Research data. But surely the other 24 percent of the population read something over the course of those 365 days.
    They read Google Maps directions to get to the dentist, they read popcorn-cooking instructions so the kernels didn't burn,
    they read Wikipedia articles as they spiraled down conspiracy-theory rabbit holes. So even though book reading isn't exactly
    ubiquitous, the process of mentally converting letters on a page or screen into meaning is.

    Along with the divides that hamper many aspects of education, the nature of developing the basic intellectual skill of
    reading is also rife with contradictions. Educators and scientists alike seemingly have the same goal of helping children
    become high-functioning, engaged readers. And yet, according to Mark Seidenberg, a psychology professor at the University
    of Wisconsin-Madison whose research focuses on reading and language, the two groups are not exactly in sync right now.

    In his forthcoming book, Language at the Speed of Sight, Seidenberg seeks to unpack why a nation as developed as the United
    States is underachieving in reading ability. According to the most recent National Assessment for Education Progress Report
    Card, just about one third of American fourth- and eighth-graders were reading at or above a proficient level last year.
    And Seidenberg says this poor performance is indicative of the underutilization of reading science by educators. He criticizes
    the education establishment for failing to adequately address the reading gap—pointing out that, though education may not be
    the equalizer it’s dreamt to be, there are ways for schooling to help chip away at the effects of poverty.

    The problem is—and what the book is really about—if the science is so good, how come there are so many poor readers? And
    should we be able to make use of what’s been learned about reading and reading disability to improve literacy levels, which
    are not as high as they should be for a country with our resources? So the connection between what we know about how reading
    works and the fact that there are lots of kids who either don't read well, or can read but avoid it, was the thing that really
    motivated me to look more closely and then write the book.

    JSON Output:
    {
      "rootCauseRelevanceToProblemStatement": "The text directly addresses the root causes of the literacy gap, which is one of the main problems mentioned in the problem statement.",
      "allPossibleEthicalRootCausesIdentifiedInTextContext": [
        "Underutilization of reading science by educators",
        "Failure of the education establishment to address the reading gap effectively",
        "Lack of equitable access to resources and opportunities for students",
      ]
    }
    `;
    }
    static renderCaseStudies() {
        return `
    Narrowing the Achievement Gap: A Case Study of One Outperforming Urban School Making A Difference
    Garner, Dionne M.
    ProQuest LLC, Ed.D. Dissertation, University of Southern California

    Despite efforts to positively impact educational outcomes for underrepresented youth, the achievement gap persists in the
    United States. Underrepresented youth are students representing lower socioeconomic, racial, ethnic, or language minority
    populations that are underrepresented in higher educational attainment relative to their numbers in the general population.
    The persistent achievement gap has multiple implications for society. Lower educational outcomes are associated with lower
    future income levels, limited career opportunities, and other negative social outcomes. The achievement gap continues to exist
    in urban public schools. However, there are schools that have narrowed the achievement gap for historically underrepresented
    youth. The purpose of this qualitative case study was to identify school-wide practices that exist in one outperforming urban
    high school that is narrowing the achievement gap. This study focused on the manner in which resource allocation, existing
    programs, and processes for building staff capacity contributed to one high school's success. Data collection was conducted
    via surveys and interviews of school-site administrators and teachers, document analysis, and observations. Findings suggested
    that the case study high school narrowed the achievement gap through becoming a reflective organization, disrupting traditional
    structures, personalizing students' academic supports, and creating precise action plans focused on academic growth. By moving
    beyond merely implementing reflective practices and becoming a reflective organization, the case study school creatively
    implemented new solutions for personalizing supports for students. The urban high school also analyzed student data to create
    precise, growth-oriented action plans to positively impact student outcomes. This qualitative case study is presented as a
    blueprint for a school seeking to close the achievement gap.

    JSON Output:
    {
      "rootCauseRelevanceToProblemStatement": "The website is directly related to the problem statement, as it explores the practices and factors contributing to the narrowing of the achievement gap, which is a root cause of the literacy gap.",
      "allPossibleRootCausesCaseStudiesIdentifiedInTextContext": [
        "Resource allocation",
        "Processes for building staff capacity",
        "Personalizing students' academic supports",
      ]
    }
  `;
    }
}
//# sourceMappingURL=rootCauseExamplePrompts.js.map