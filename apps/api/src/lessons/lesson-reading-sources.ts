export type LessonReadingSource = {
  title: string;
  url: string;
  summary: string;
};

// Keyed by lesson number (1-24). Each summary is a paraphrase of a real, current
// article's key facts, written for the reading-passage generator — never the
// original article's wording, to stay clear of reproducing copyrighted text.
export const LESSON_READING_SOURCES: Record<number, LessonReadingSource> = {
  1: {
    title:
      "As part of her Citi turnaround, Jane Fraser cut management layers from 13 to 8. But the 'great flattening' doesn't always work as intended",
    url: 'https://fortune.com/2026/05/30/jane-fraser-citi-flat-management-leadership/',
    summary:
      "Citigroup CEO Jane Fraser cut the bank's management hierarchy from 13 layers down to 8 as part of a broader turnaround, aiming for faster decisions and better client service. The bank was reorganized into five divisions reporting directly to Fraser, eliminating several middle-management layers. An analyst noted this raised accountability, since underperforming managers now have fewer places to hide. The flattening coincided with strong results, including Citi's best quarterly revenue in a decade and its highest return on tangible equity since 2021. The piece frames this as part of a wider industry trend toward flatter organizations, cautioning that flattening only works when tied to real strategic goals, not just cost-cutting.",
  },
  2: {
    title: 'What is a LAN?',
    url: 'https://www.cloudflare.com/learning/network-layer/what-is-a-lan/',
    summary:
      "Cloudflare's explainer describes a LAN as a network linking devices within a small physical area (home, office, single building), typically via Ethernet cabling or Wi-Fi, with a router usually sitting at the center connecting it to the wider internet; larger LANs may also use switches to route traffic efficiently. It contrasts this with a WAN, which connects multiple LANs across much greater distances, often spanning cities or countries, usually over leased bandwidth from telecom providers or ISPs. Once a local network grows to cover multiple buildings, it's generally reclassified as a WAN or metropolitan area network rather than a LAN.",
  },
  3: {
    title: '5 Tips for Improving Your Negotiation Skills',
    url: 'https://www.pon.harvard.edu/daily/negotiation-skills-daily/5-tips-for-improving-your-negotiation-skills/',
    summary:
      "The article argues the single most valuable step toward better negotiating is thorough preparation — researching the other side, building checklists, and identifying one's BATNA (best alternative to a negotiated agreement) before talks start. It recommends actively relating training concepts to real personal situations rather than passively taking notes, and highlights role-play as useful precisely because it exposes flawed habits. Real skill improvement is said to come from repeated practice across many low-stakes situations rather than a single course, with a coach helping with preparation, rehearsal, and post-negotiation review.",
  },
  4: {
    title: 'Email Etiquette Rules to Know',
    url: 'https://www.grammarly.com/blog/emailing/email-etiquette-rules-to-know/',
    summary:
      "Grammarly's guide lays out around 18 rules for professional email, framed around the idea that clear, considerate messages shape how colleagues judge your competence. Recommendations include specific subject lines, appropriate greetings, and concise but sufficiently detailed messages that avoid follow-up questions. It advises matching tone to audience, using CC/BCC and reply-all thoughtfully, proofreading carefully, treating email as a permanent and shareable record, avoiding sending while emotional, and replying within about 24 hours or setting an auto-reply when unavailable.",
  },
  5: {
    title: 'Jones Knowles Ritchie: Innovation By Design 2025',
    url: 'https://www.fastcompany.com/91388886/jones-knowles-ritchie-innovation-by-design-2025',
    summary:
      "The article profiles branding agency Jones Knowles Ritchie (JKR), entrusted over the past year with redesigning the public identities of major established companies including Yahoo, Mozilla, and Walmart. Its approach challenges conventional branding norms, adding playfulness to give legacy brands renewed cultural relevance. One example is a revived exclamation-point mark for Yahoo meant to recapture its playful late-1990s personality while feeling current. The broader point: successful rebranding of an established company isn't about discarding everything built before, but finding a distinctive visual language that signals relevance without abandoning existing brand equity.",
  },
  6: {
    title: 'Nvidia unveils new GeForce RTX 5090, RTX 5080, RTX 5070 Ti, and RTX 5070 graphics cards at CES 2025',
    url: 'https://www.techradar.com/computing/gpu/nvidia-unveils-new-geforce-rtx-5090-rtx-5080-rtx-5070-ti-and-rtx-5070-graphics-cards-at-ces-2025',
    summary:
      "At CES 2025, Nvidia unveiled its new GeForce RTX 50-series graphics cards: the flagship RTX 5090 ($1,999), RTX 5080 ($999), RTX 5070 Ti ($749), and RTX 5070 ($549). The RTX 5090 was specified with 32GB of GDDR7 memory, over 21,000 processing cores, and roughly 1,792 GB/s of memory bandwidth, with Nvidia claiming nearly double the performance of its previous flagship. A live demo showed a popular game running at a much higher frame rate using Nvidia's newest AI upscaling technology. The top two cards launched in late January 2025, with the lower-tier cards following in February.",
  },
  7: {
    title: "What's Shaping Hiring in 2025?",
    url: 'https://www.teamtailor.com/en-us/resources/whats-shaping-hiring-in-2025',
    summary:
      "A recruitment-software vendor's survey-based piece reports that most HR decision-makers now use or plan to use AI in hiring, mainly to summarize resumes, draft job descriptions, and screen candidates initially. It argues 2025 hiring has shifted from chasing applicant volume toward prioritizing candidate quality, cultural fit, and retention. Customers reported faster time-to-hire and more qualified applicants reaching later stages after adopting these tools. It also notes growing investment in employer branding, since candidate experience is now seen as nearly as important as selection criteria.",
  },
  8: {
    title: 'Enterprise software 2025: Three big shifts to watch',
    url: 'https://www.constellationr.com/insights/news/enterprise-software-2025-three-big-shifts-watch',
    summary:
      'This analyst commentary identifies three forces reshaping enterprise software in 2025: cloud marketplaces becoming a common way to buy and consolidate software (while raising lock-in risk); AI agents increasingly coordinating tasks across multiple applications rather than users interacting with each app directly, raising questions about what vendors are actually being paid for; and vendors facing pressure from customers cutting staff, building tools in-house, and pushing for usage-based rather than flat subscription pricing.',
  },
  9: {
    title: 'The biggest enterprise technology M&A deals',
    url: 'https://www.cio.com/article/3531975/the-biggest-enterprise-technology-ma-deals.html',
    summary:
      "This roundup covers 2025's largest tech acquisitions, led by Palo Alto Networks' roughly $25 billion purchase of CyberArk and Google's roughly $32 billion acquisition of cloud-security firm Wiz (its largest deal ever, after an earlier rejected lower offer). AI infrastructure company CoreWeave acquired Core Scientific for about $9 billion for its power capacity. Several deals targeted AI-agent capability specifically (Workday-Sana, ServiceNow-Moveworks, OpenAI-Statsig). The broader point: most 2025 big-ticket deals aimed at expanding capabilities rather than just combining competitors, with cross-border deals facing growing AI-related regulatory scrutiny, especially in Europe.",
  },
  10: {
    title: 'Help Desk Troubleshooting: Step-by-step Guide',
    url: 'https://www.freshworks.com/helpdesk/software/troubleshooting/',
    summary:
      'This guide lays out a five-step troubleshooting method: identify the problem (gather details, check recent changes); form a hypothesis starting with the simplest explanation; test it via basic checks or remote diagnostics; implement and confirm a fix; and document the resolution in a shared knowledge base. It stresses communication matters as much as technical skill — listening, asking open questions, explaining in plain language — and recommends categorizing recurring issues (password resets, connectivity) for consistent resolution, plus ongoing staff training.',
  },
  11: {
    title: 'How AI Is Changing Corporate Finance in 2025',
    url: 'https://blog.workday.com/en-gb/how-ai-changing-corporate-finance-2025.html',
    summary:
      'This post outlines how AI is reshaping finance departments in 2025, citing that nearly all surveyed CEOs say AI already delivers tangible benefits, though under half of organizations feel fully ready to implement it. It describes AI automating routine work (invoice processing, reconciliation) and flagging unusual transactions that may indicate errors or fraud, plus predictive analytics for forecasting and scenario simulation. It also discusses "explainable AI" that shows the reasoning behind outputs like risk scores, building stakeholder trust, and notes growing cross-department data integration for planning.',
  },
  12: {
    title: 'Databases in 2025: New Architectures, Smarter AI, and Stronger Security',
    url: 'https://www.dbplus.tech/en/blog/databases-in-2025-new-architectures-smarter-ai-and-stronger-security',
    summary:
      'This post describes a shift away from centralized data warehouses toward a "data mesh" approach where teams own their own data pipelines under shared standards, plus growing coordination of workloads across multiple cloud providers to cut costs. It predicts natural-language database querying will become common for non-technical staff, LLMs will help spot and fix low-quality data, and vector databases (storing data as numerical representations for images/text) will move into mainstream use. It also argues database security is shifting toward "zero trust," continuously verifying users and devices rather than trusting anything inside the network perimeter.',
  },
  13: {
    title: '10 Global Compliance Concerns for 2026',
    url: 'https://www.thomsonreuters.com/en/institute/reports/10-global-compliance-concerns-for-2026',
    summary:
      'This report lists top compliance risks for 2026, noting US fraud losses climbed sharply (around $12.5 billion in 2024, a quarter more than the prior year) and warning that criminals now use generative AI to build fake identities and automate scams faster than older compliance systems can detect. It also flags growing need for crypto expertise as stablecoins gain regulatory footing, fragmenting privacy/ESG rules across US states and the EU, and new European supply-chain due-diligence obligations. Overall message: compliance must shift from manual, reactive checks toward automated, real-time monitoring with stronger governance and training.',
  },
  14: {
    title: 'The biggest UX design trends shaping the industry in 2025',
    url: 'https://www.uxdesigninstitute.com/blog/ux-design-trends-in-2025/',
    summary:
      "This piece argues 2025 marks a shift from excitement about AI tools toward more selective use for automating repetitive work and improving accessibility, while watching for bias. New European accessibility legislation is pushing teams to build accessibility in from the start. It also points to rising expectations around sustainability and ethical transparency, and a shift in the designer's role from crafting screens to acting as a strategic voice tied to research and business goals, with UX work spreading well beyond the tech sector.",
  },
  15: {
    title: 'Supply chain risk pulse 2025: Tariffs reshuffle global trade priorities',
    url: 'https://www.mckinsey.com/capabilities/operations/our-insights/supply-chain-risk-survey',
    summary:
      'This survey finds tariffs are the dominant 2025 concern for supply chain leaders, with most respondents saying new tariffs meaningfully affect their operations, leading to higher supplier/material costs and softer customer demand for many. Rather than prompting entirely new strategies, tariff pressure is mainly speeding up resilience efforts already underway, like supplier diversification and added flexibility. The broader theme: companies are moving from narrow contingency planning toward comprehensive anticipation, absorption, and recovery from trade and geopolitical shocks.',
  },
  16: {
    title: 'Six million Qantas customers hit in cyber attack, data breach',
    url: 'https://www.smartcompany.com.au/information-technology/six-million-qantas-customers-cyber-attack-data-breach/',
    summary:
      'A 2025 cyberattack on Qantas breached a third-party call-centre system, exposing records of more than six million customers, including names, emails, phone numbers, birth dates, and frequent flyer numbers — but not financial details, passport numbers, or passwords. After detecting unusual activity, Qantas said it contained the breach quickly, confirmed flight operations were never at risk, notified Australian authorities, and brought in an external cybersecurity firm plus a dedicated support line, with its CEO publicly apologizing.',
  },
  17: {
    title: 'The art of 21st-century leadership: From succession planning to building a leadership factory',
    url: 'https://www.mckinsey.com/capabilities/people-and-organization/our-insights/the-art-of-21st-century-leadership-from-succession-planning-to-building-a-leadership-factory',
    summary:
      'This article argues today\'s compounded disruption — geopolitical instability, generative AI, workforce demands for flexibility — makes old-style leadership development insufficient. It contends leadership development should be core business strategy, a continuous "leadership factory" rather than ad hoc succession planning. It identifies traits distinguishing effective leaders in this environment: sustained positive energy, humility, curiosity, resilience, and a sense of humor. The case: organizations that systematically develop leaders at every level adapt better to ongoing disruption.',
  },
  18: {
    title: "Q2 Cloud Market Nears $100 Billion Milestone – and it's Still Growing by 25% Year over Year",
    url: 'https://www.srgresearch.com/articles/q2-cloud-market-nears-100-billion-milestone-and-its-still-growing-by-25-year-over-year',
    summary:
      'Worldwide cloud infrastructure spending approached $99 billion in Q2 2025, up more than $20 billion year-over-year, marking a third straight quarter of roughly 24-25% growth. Amazon led with about 30% global share, followed by Microsoft Azure (~20%) and Google Cloud (~13%), with the top three controlling roughly two-thirds of the market; Microsoft and Google grew faster percentage-wise than Amazon. Much of the acceleration is attributed to generative-AI-related cloud demand (triple-digit growth), with smaller "tier two" providers like CoreWeave, Oracle, Databricks, and Huawei also expanding quickly.',
  },
  19: {
    title: "Hackers sent Marks & Spencer's CEO 'abusive' ransom demands",
    url: 'https://www.businessinsurance.com/hackers-sent-marks-spencers-ceo-abusive-ransom-demands/',
    summary:
      'In 2025, UK retailer Marks & Spencer suffered a ransomware attack by a group calling itself DragonForce, causing weeks of disruption to online orders at an estimated cost of around £300 million. The attackers claimed to have encrypted systems and stolen customer data, sending a hostile ransom message directly to CEO Stuart Machin\'s inbox by hijacking an employee account, referencing the firm\'s cyber-insurance policy and a dark-web negotiation link. M&S publicly confirmed the incident, brought in outside specialists, and notified authorities while restoring operations — becoming a widely cited example of a CEO becoming a direct target during a cyber crisis.',
  },
  20: {
    title: 'Why Companies Get Agile Right—or Wrong',
    url: 'https://www.bcg.com/publications/2024/why-companies-get-agile-right-wrong',
    summary:
      'A 2024 BCG study of over 125 companies found that although most had rolled out agile practices, only about half of those claiming success had produced measurable results, while nearly half were only superficially agile. Genuinely agile organizations saw lower delivery costs, two-to-four-times faster product delivery, and roughly double the shareholder returns versus peers; success rates varied strongly by industry (tech and financial services doing best). Companies adopting only surface-level agile rituals (squads, sprints, product owners) without realigning strategy, governance, and metrics tended to fall into an "illusion of agility."',
  },
  21: {
    title: 'Globalization Holding Steady Amid Trade Tensions, Notes DHL Report',
    url: 'https://www.logisticsmgmt.com/article/globalization_holding_steady_amid_trade_tensions_notes_dhl_report',
    summary:
      "The DHL Global Connectedness Report, produced with NYU Stern, found global economic integration unexpectedly resilient despite tariffs and decoupling fears. Based on over nine million data points across trade, investment, information, and travel in 180 countries, its connectedness index reached about 25% in 2025, matching the record set in 2022 — indicating cross-border trade, capital flows, and travel remain near all-time highs despite geopolitical uncertainty. DHL Express's CEO framed this resilience as evidence globalization still delivers real economic value despite political headwinds.",
  },
  22: {
    title: 'The Future of Jobs Report 2025',
    url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/',
    summary:
      'This WEF report surveyed over 1,000 employers (14+ million workers, 22 industries, 55 economies) on how AI and automation will reshape work through 2030. It projects roughly 170 million new jobs created against about 92 million displaced — a net gain of about 78 million — even as technological change disrupts nearly a quarter of today\'s jobs. The share of tasks performed mainly by humans is expected to fall from 47% to 33% by 2030, and 59% of the global workforce will need reskilling. AI/big-data and cybersecurity skills are the fastest-growing areas.',
  },
  23: {
    title: 'Most Innovative Companies 2025: In Disruptive Times, the Resilient Win',
    url: 'https://www.bcg.com/press/26june2025-winning-the-innovation-race',
    summary:
      "BCG's 19th annual innovation study (2005-2025 data) found long-term innovation leaders outperformed the broader stock market by about 2.4 points per year on average, especially during downturns like 2008 and the pandemic. Despite innovation ranking as a top priority for most firms, executive confidence in their own companies' innovation leadership fell 24 points between 2021 and 2024, with no consistent link found between R&D spending and shareholder returns. The geographic mix of leading innovators has shifted, with Chinese firms rising from none in 2005 to several top ranks by 2023 as North America's share declined; top innovators lean heavily into digital and AI-related innovation.",
  },
  24: {
    title: 'A Brief History of Scaling Netflix',
    url: 'https://blog.bytebytego.com/p/a-brief-history-of-scaling-netflix',
    summary:
      'This article traces Netflix\'s evolution from a single-database, monolithic application into a highly scalable system. A 2008 database failure that halted DVD shipments for three days pushed Netflix toward cloud infrastructure (AWS) and microservices built around statelessness, horizontal scaling, redundancy, and deliberately injected failures (via tools like Chaos Monkey) to test resilience. Netflix also built its own global content-delivery network, Open Connect, using custom storage appliances placed at ISPs, after earlier relying on in-house servers and third-party CDNs. These choices let engineering teams deploy independently and quickly while serving hundreds of millions of streaming members worldwide.',
  },
};
