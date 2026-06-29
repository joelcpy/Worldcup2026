// ============================================================
// World Cup 2026 — Teams & Fixtures data
//
// Elo ratings: eloratings.net snapshot, June 11 2026 (top teams
// confirmed via press reports; others are close estimates from the
// late-2025/early-2026 published tables).
// FIFA ranks: approximate April 2026 ranking.
// Form: last five competitive internationals (most recent last).
// ============================================================

const TEAMS = {
  // ---- Group A ----
  MEX: { name: "Mexico", flag: "🇲🇽", group: "A", elo: 1919, rank: 15, form: "WWWWW", star: "Santiago Giménez",
    note: "Co-host, and the only team with a perfect group: three wins from three (RSA 2-0, KOR 1-0, CZE 3-0), topping Group A without conceding until the dead rubber. Dangerous in transition with the Azteca behind them, but historically fragile once they meet elite opposition in the round of 16 (rating +19)." },
  RSA: { name: "South Africa", flag: "🇿🇦", group: "A", elo: 1693, rank: 56, form: "WLDLW", star: "Lyle Foster",
    note: "Through to the knockout rounds for the first time in their history. After a flat start they beat Korea 1-0 (Maseko, 63') to pip them for second in Group A — a round-of-32 tie with Canada awaits. Well-organised Bafana Bafana side built on the Mamelodi Sundowns core (rating +38)." },
  KOR: { name: "South Korea", flag: "🇰🇷", group: "A", elo: 1717, rank: 22, form: "WWDWL", star: "Son Heung-min",
    note: "A nervous wait. Son was controversially benched and Korea lost 1-0 to South Africa when a win would have sealed second — now they need results elsewhere to sneak through as one of the best third-placed teams. Attacking talent (Lee Kang-in, Hwang Hee-chan) never clicked here (rating −38)." },
  CZE: { name: "Czechia", flag: "🇨🇿", group: "A", elo: 1666, rank: 43, form: "LWDWL", star: "Patrik Schick",
    note: "Eliminated, bottom of Group A. Came through the UEFA playoffs but managed just two points and went down 3-0 to Mexico in the finale when only a win would do. Physical and strong at set pieces, but lacked the pace and cutting edge at this level (rating −19)." },

  // ---- Group B ----
  CAN: { name: "Canada", flag: "🇨🇦", group: "B", elo: 1765, rank: 27, form: "WWDWD", star: "Jonathan David",
    note: "Co-host, and through to the knockouts for the first time ever. Jesse Marsch's pressing side drew BiH 1-1, thrashed Qatar 6-0, then lost 2-1 to Switzerland to finish Group B runners-up (David on target). Built around David and a fit-again Alphonso Davies (rating −30)." },
  BIH: { name: "Bosnia & Herzegovina", flag: "🇧🇦", group: "B", elo: 1670, rank: 62, form: "DWLWL", star: "Ermedin Demirović",
    note: "First World Cup since 2014. Hard-running and competitive, but the squad lacks depth beyond its starting XI." },
  QAT: { name: "Qatar", flag: "🇶🇦", group: "B", elo: 1557, rank: 53, form: "LWDLW", star: "Akram Afif",
    note: "Better than the 2022 home flop, with Afif in the form of his life, yet still the weakest defensive profile in the group." },
  SUI: { name: "Switzerland", flag: "🇨🇭", group: "B", elo: 1878, rank: 17, form: "WWDWW", star: "Granit Xhaka",
    note: "The ultimate tournament grinders — compact block and knockout nous from four straight World Cups. Won Group B on seven points: drew Qatar 1-1, then beat BiH 4-1 and co-hosts Canada 2-1 (Vargas, Manzambi). Through as group winners (rating +30)." },

  // ---- Group C ----
  BRA: { name: "Brazil", flag: "🇧🇷", group: "C", elo: 2007, rank: 5, form: "LWWDL", star: "Vinícius Júnior",
    note: "Ancelotti has steadied a turbulent cycle. After opening 1-1 with Morocco they beat Haiti 3-0 and Scotland 3-0 to top Group C. The front line (Vinícius, Rodrygo, Raphinha, Estêvão) is as deep as any in the world; the ceiling remains title-level (rating +19)." },
  MAR: { name: "Morocco", flag: "🇲🇦", group: "C", elo: 1913, rank: 11, form: "WWWWW", star: "Achraf Hakimi",
    note: "2022 semi-finalists and 2025 AFCON champions on a long winning run. On the eve of the opener, though, FIFA confirmed Nayef Aguerd (their best centre-back) and Abde Ezzalzouli were replaced in the 26-man squad through injury — a tournament-long hit to the miserly defence that is Morocco's identity (rating nudged -20 from 1895)." },
  HAI: { name: "Haiti", flag: "🇭🇹", group: "C", elo: 1509, rank: 88, form: "WDLWD", star: "Duckens Nazon",
    note: "First World Cup since 1974, qualified amid enormous adversity. Energetic and fearless, but the thinnest squad in the tournament." },
  SCO: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", elo: 1712, rank: 36, form: "WWLWD", star: "Scott McTominay",
    note: "First World Cup since 1998, sealed with that dramatic night against Denmark. McTominay's late-arriving runs and set-piece menace are the chief weapons." },

  // ---- Group D ----
  USA: { name: "United States", flag: "🇺🇸", group: "D", elo: 1817, rank: 14, form: "WWWWL", star: "Christian Pulisic",
    note: "Co-host through as Group D winners despite a sloppy finish. Beat Paraguay 4-1 and Australia 2-0, then lost 3-2 to Türkiye on a stoppage-time goal with top spot already wrapped up. The talent pool (Pulisic, McKennie, Reyna, Balogun) is the deepest ever; composure under the lights remains the question (rating −44)." },
  PAR: { name: "Paraguay", flag: "🇵🇾", group: "D", elo: 1746, rank: 37, form: "DWWDL", star: "Julio Enciso",
    note: "Alfaro's Paraguay are nasty to play against: deep block, fouls in the right places, and Enciso's spark. Beat Brazil and Argentina at home in qualifying." },
  AUS: { name: "Australia", flag: "🇦🇺", group: "D", elo: 1742, rank: 25, form: "WDWLW", star: "Jackson Irvine",
    note: "Tony Popovic has made the Socceroos hard to beat, conceding almost nothing in the final AFC phase. Limited creativity is the recurring concern." },
  TUR: { name: "Türkiye", flag: "🇹🇷", group: "D", elo: 1780, rank: 26, form: "WDWLW", star: "Arda Güler",
    note: "The dark-horse pick that flattered to deceive — out despite a dramatic 3-2 win over the USA (Ayhan's last-gasp winner). Lost 2-0 to Australia and 1-0 to Paraguay first, leaving the comeback too late. Montella's golden generation (Güler, Yıldız, Çalhanoğlu) goes home early (rating +44)." },

  // ---- Group E ----
  GER: { name: "Germany", flag: "🇩🇪", group: "E", elo: 1929, rank: 9, form: "WWWLW", star: "Jamal Musiala",
    note: "Nagelsmann's rebuild clicked early — a 7-1 demolition of Curaçao, then a 2-1 win over Ivory Coast — but with top spot already secured they were stunned 2-1 by Ecuador in a much-changed side. Won Group E regardless. Still occasionally vulnerable to elite pace in behind (rating +13, +15, then −44)." },
  CUW: { name: "Curaçao", flag: "🇨🇼", group: "E", elo: 1543, rank: 80, form: "DWDWL", star: "Leandro Bacuna",
    note: "The smallest nation ever at a World Cup, steered there by veteran coach Dick Advocaat. Organised and proud, but a huge talent gap to this group — opened with a 1-7 loss to Germany, Comenencia with the consolation. (Rating -13.)" },
  ECU: { name: "Ecuador", flag: "🇪🇨", group: "E", elo: 1835, rank: 23, form: "LDWDW", star: "Moisés Caicedo",
    note: "Saved their best for last. After a 0-1 loss to Ivory Coast and a frustrating 0-0 with Curaçao, they stunned Germany 2-1 to finish strong — Caicedo and Páez running the show. Elite defensively; the scoring finally arrived when it mattered (rating −40, then +44)." },
  CIV: { name: "Ivory Coast", flag: "🇨🇮", group: "E", elo: 1778, rank: 40, form: "WLWW", star: "Amad Diallo",
    note: "2024 AFCON winners through to the knockouts as Group E runners-up. Beat Ecuador 1-0, lost 2-1 to Germany, then saw off Curaçao 2-0 to secure second. Real wing talent in Amad and Adingra over a powerful midfield (rating +40, −15, then +23)." },

  // ---- Group F ----
  NED: { name: "Netherlands", flag: "🇳🇱", group: "F", elo: 1981, rank: 7, form: "WWWDW", star: "Virgil van Dijk",
    note: "Won Group F despite a long injury list (Xavi Simons, Schouten, Timber all out; Depay and Verbruggen carrying knocks). After a 2-2 opening draw with Japan they hit form — 5-1 over Sweden, then 3-1 past Tunisia — to top the group on seven points. A genuine contender if the bodies hold up (rating −6, +41, then +11)." },
  JPN: { name: "Japan", flag: "🇯🇵", group: "F", elo: 1888, rank: 18, form: "WDWWW", star: "Takefusa Kubo",
    note: "The deepest, most European-based squad Asia has produced — Kubo, Mitoma, Kamada, Itakura. After a battling 2-2 with the Netherlands they dismantled Tunisia 4-0 (Ueda brace, Kamada's 4th-minute opener), becoming the first AFC side to score four in a World Cup match. Level with the Dutch atop Group F on four points (rating +6, then +26)." },
  SWE: { name: "Sweden", flag: "🇸🇪", group: "F", elo: 1800, rank: 45, form: "WLLWWL", star: "Viktor Gyökeres",
    note: "Came back to earth hard. After a stunning 5-1 demolition of Tunisia, Sweden were themselves blown away 5-1 by the Netherlands — Gyökeres and Isak smothered, the defence overrun. Group F is wide open again (rating +42, then -41)." },
  TUN: { name: "Tunisia", flag: "🇹🇳", group: "F", elo: 1621, rank: 41, form: "WWDWLL", star: "Hannibal Mejbri",
    note: "Eliminated. A side built on defensive solidity that simply fell apart — smashed 5-1 by Sweden, then 0-4 by Japan (Ueda brace), conceding nine across two games. Bottom of Group F and out with a match to spare." },

  // ---- Group G ----
  BEL: { name: "Belgium", flag: "🇧🇪", group: "G", elo: 1858, rank: 8, form: "DWWDD", star: "Jérémy Doku",
    note: "The post-golden-generation team is finally settled: Doku and Openda's speed, Tielemans running midfield. Held to a frustrating 1-1 by Egypt in the opener — Ashour put Egypt ahead, a Hany own goal rescued the point after Lukaku came on (rating −9)." },
  EGY: { name: "Egypt", flag: "🇪🇬", group: "G", elo: 1779, rank: 32, form: "WWDWD", star: "Mohamed Salah",
    note: "Salah's last World Cup shot, and it's going well. After a 1-1 with Belgium they came from behind to beat New Zealand 3-1 — Egypt's first-ever World Cup win — to sit top of Group G on four points. Defensively excellent and lethal on the break (rating +9, then +27)." },
  IRN: { name: "Iran", flag: "🇮🇷", group: "G", elo: 1756, rank: 20, form: "DWWLD", star: "Mehdi Taremi",
    note: "Perennially well-drilled with a veteran spine. Twice let New Zealand level in a sloppy 2-2 — Rezaeian and Mohebbi scored, but they couldn't hold a lead and dropped points they expected to win (rating −14)." },
  NZL: { name: "New Zealand", flag: "🇳🇿", group: "G", elo: 1557, rank: 83, form: "WLDWD", star: "Chris Wood",
    note: "Direct, physical and set-piece reliant. Elijah Just's brace earned a stunning 2-2 with Iran on debut-level grit — far more potent than expected (rating +14)." },

  // ---- Group H ----
  ESP: { name: "Spain", flag: "🇪🇸", group: "H", elo: 2146, rank: 1, form: "WWWWD", star: "Lamine Yamal",
    note: "World #1, Euro 2024 champions, and into the knockouts as Group H winners. After a 0-0 opener with Cape Verde they beat Saudi Arabia 4-0 and edged Uruguay 1-0 to top the group. Yamal and a generational midfield make them the strongest team in the field on paper (rating −28, +7, then +10)." },
  CPV: { name: "Cape Verde", flag: "🇨🇻", group: "H", elo: 1634, rank: 68, form: "DWLWD", star: "Ryan Mendes",
    note: "Historic first qualification — the smallest African nation ever to make it, and now the story of the group stage. Held Spain 0-0 (Vozinha heroic), then came from behind twice to draw 2-2 with Uruguay. Genuinely in contention to advance (rating +28, then +19)." },
  KSA: { name: "Saudi Arabia", flag: "🇸🇦", group: "H", elo: 1649, rank: 59, form: "DLWDD", star: "Salem Al-Dawsari",
    note: "The 2022 win over Argentina proves the upset ceiling. Led Uruguay through Al-Amri's header and were minutes from another famous result before Araújo's late equaliser — a hard-earned 1-1 (rating +18)." },
  URU: { name: "Uruguay", flag: "🇺🇾", group: "H", elo: 1838, rank: 16, form: "DWLWD", star: "Federico Valverde",
    note: "Bielsa's intense Uruguay flattered to deceive in the opener — fell behind to Saudi Arabia and needed a late Araújo strike to escape with a 1-1 draw. Streaky finishing again the issue (rating −18)." },

  // ---- Group I ----
  FRA: { name: "France", flag: "🇫🇷", group: "I", elo: 2113, rank: 3, form: "WWDWW", star: "Kylian Mbappé",
    note: "Won Group I with a perfect nine points — beat Senegal 3-1, Iraq 3-0, then Norway 4-1 behind a Dembélé first-half hat-trick. Mbappé at his peak over absurd depth (they could field two top-ten teams). Looking ominous; only complacency beats them early (rating +6, +6, then +29)." },
  IRQ: { name: "Iraq", flag: "🇮🇶", group: "I", elo: 1559, rank: 58, form: "WDWDL", star: "Aymen Hussein",
    note: "First World Cup since 1986, via the inter-confederation playoff. Passionate and physical, with Hussein's aerial threat the main outlet." },
  NOR: { name: "Norway", flag: "🇳🇴", group: "I", elo: 1886, rank: 29, form: "WWWWL", star: "Erling Haaland",
    note: "Through to the knockouts as Group I runners-up. Beat Iraq 2-1 and Senegal 3-2, then rested Haaland, Ødegaard and eight others in a dead-rubber 1-4 loss to France — the rating hit overstates it. Haaland and Ødegaard make them a side nobody wanted to draw (rating −29, mostly rotation noise)." },
  SEN: { name: "Senegal", flag: "🇸🇳", group: "I", elo: 1785, rank: 19, form: "WLLW", star: "Iliman Ndiaye",
    note: "Africa's most complete squad after Morocco — Ndiaye, Sarr brothers, Koulibaly, Mendy. Lost to France and Norway but thrashed 10-man Iraq 5-0 (Gueye double) to keep best-third qualification hopes alive. Underwhelmed for their talent, but dangerous if they sneak through (rating +35)." },

  // ---- Group J ----
  ARG: { name: "Argentina", flag: "🇦🇷", group: "J", elo: 2143, rank: 2, form: "LWDWW", star: "Lionel Messi",
    note: "Defending champions, now through to the last 16. Messi's brace in a 2-0 win over Austria took him past Klose as the all-time World Cup top scorer (18), after a 3-0 opening win over Algeria. No one-man team though: Mac Allister, Enzo, Julián Álvarez and the meanest defence in South America. Scaloni's management is the gold standard (rating +14)." },
  ALG: { name: "Algeria", flag: "🇩🇿", group: "J", elo: 1742, rank: 34, form: "WWDWW", star: "Riyad Mahrez",
    note: "Smashed CAF qualifying records on their return to the finals. Mahrez and Amoura lead a potent attack; the back line is the soft spot." },
  AUT: { name: "Austria", flag: "🇦🇹", group: "J", elo: 1805, rank: 24, form: "WWWDW", star: "Christoph Baumgartner",
    note: "Rangnick's relentless pressing machine topped its qualifying group. Tactically the most cohesive 'second-tier' side in Europe — a horrible matchup for possession teams." },
  JOR: { name: "Jordan", flag: "🇯🇴", group: "J", elo: 1580, rank: 64, form: "WDWLD", star: "Mousa Tamari",
    note: "First-ever World Cup, built on the run to the 2023 Asian Cup final. Quick on the break through Tamari, but defensively raw at this level." },

  // ---- Group K ----
  POR: { name: "Portugal", flag: "🇵🇹", group: "K", elo: 1997, rank: 6, form: "WWLWW", star: "Cristiano Ronaldo",
    note: "2025 Nations League champions. Ronaldo, 41, rolled back the years with his first two goals of the tournament in a 5-0 rout of Uzbekistan, after a 1-1 opening draw with DR Congo. Carried by Vitinha, Bruno Fernandes, Neves and Leão — the deepest midfield in Europe after Spain (rating +14)." },
  COL: { name: "Colombia", flag: "🇨🇴", group: "K", elo: 1976, rank: 13, form: "WWWDW", star: "Luis Díaz",
    note: "Copa América 2024 finalists with one of the longest unbeaten runs in world football under Lorenzo. Díaz is in career-best form and James has rolled back the years." },
  UZB: { name: "Uzbekistan", flag: "🇺🇿", group: "K", elo: 1581, rank: 50, form: "WDWDW", star: "Abbosbek Fayzullaev",
    note: "Historic first qualification, now coached by Fabio Cannavaro. Technically tidy with a golden generation core, but no experience at this altitude." },
  COD: { name: "DR Congo", flag: "🇨🇩", group: "K", elo: 1696, rank: 60, form: "WDWWD", star: "Yoane Wissa",
    note: "First World Cup since 1974 (as Zaire), won via a dramatic playoff run. Premier League quality up front in Wissa; chaotic but dangerous." },

  // ---- Group L ----
  ENG: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", elo: 2035, rank: 4, form: "WWWWW", star: "Jude Bellingham",
    note: "Won Group L unbeaten — a 4-2 over Croatia, a 0-0 with Ghana, then 2-0 past Panama (Bellingham scored and teed up Kane, now England's all-time World Cup top scorer). Tuchel's attacking pool (Kane, Bellingham, Saka, Palmer) is frightening; the eternal question is whether they finally finish the job (rating −24, then +9)." },
  CRO: { name: "Croatia", flag: "🇭🇷", group: "L", elo: 1877, rank: 10, form: "WWDWD", star: "Luka Modrić",
    note: "Through as Group L runners-up behind England. Modrić, 40, leads one last campaign and set up Vlašić's 83rd-minute winner to see off Ghana 2-1. Semi-finalists or better in two of the last three World Cups — the most battle-hardened knockout team alive, even as legs age (rating +16)." },
  GHA: { name: "Ghana", flag: "🇬🇭", group: "L", elo: 1687, rank: 73, form: "WLWDW", star: "Mohammed Kudus",
    note: "Kudus and the Williams brothers give the Black Stars real talent, but qualifying form was streaky and the defence leaks." },
  PAN: { name: "Panama", flag: "🇵🇦", group: "L", elo: 1640, rank: 30, form: "WDWWD", star: "Adalberto Carrasquilla",
    note: "CONCACAF's quiet overachievers — topped their qualifying group and pushed the US around in recent Gold Cups. Compact, streetwise, never an easy out." },
};

// 72 group-stage matches. h/a = team codes, d = date (2026), city,
// note = optional hand-written analyst angle, result = [hGoals, aGoals]
// for matches already played.
const MATCHES = [
  // -------- Matchday 1 --------
  { d: "Jun 11", et: "15:00", g: "A", h: "MEX", a: "RSA", city: "Mexico City", result: [2, 0],
    note: "The Azteca opener. Mexico have never lost a World Cup opening match on home soil, and it showed." },
  { d: "Jun 11", et: "22:00", g: "A", h: "KOR", a: "CZE", result: [2, 1], city: "Guadalajara" },
  { d: "Jun 12", et: "15:00", g: "B", h: "CAN", a: "BIH", result: [1, 1], city: "Toronto",
    note: "Canada's first home World Cup match ever. Toronto will be deafening." },
  { d: "Jun 12", et: "21:00", g: "D", h: "USA", a: "PAR", result: [4, 1], city: "Inglewood",
    note: "The hosts' opener in LA. Paraguay will sit deep and make it ugly — exactly the type of game that tripped up the US in recent Gold Cups." },
  { d: "Jun 13", et: "15:00", g: "B", h: "QAT", a: "SUI", result: [1, 1], city: "Santa Clara" },
  { d: "Jun 13", et: "18:00", g: "C", h: "BRA", a: "MAR", result: [1, 1], city: "East Rutherford",
    note: "The headline fixture of matchday one: Brazil's firepower against the best defence in Africa. Morocco beat Brazil 2-1 in their 2023 friendly — this is no mismatch." },
  { d: "Jun 13", et: "21:00", g: "C", h: "HAI", a: "SCO", result: [0, 1], city: "Foxborough",
    note: "Massive New England Haitian community makes this a de facto home game for Haiti — but Scotland's set-piece quality should tell." },
  { d: "Jun 13", et: "24:00", g: "D", h: "AUS", a: "TUR", result: [2, 0], city: "Vancouver" },
  { d: "Jun 14", et: "13:00", g: "E", h: "GER", a: "CUW", city: "Houston", result: [7, 1],
    note: "Largest Elo gap of the entire group stage. Germany's only risk is boredom." },
  { d: "Jun 14", et: "16:00", g: "F", h: "NED", a: "JPN", city: "Arlington", result: [2, 2],
    note: "The trickiest 'favourite vs second seed' tie of round one. Japan's pressing beat Germany and Spain in 2022; the Dutch build-up will be tested." },
  { d: "Jun 14", et: "19:00", g: "E", h: "CIV", a: "ECU", city: "Philadelphia", result: [1, 0] },
  { d: "Jun 14", et: "22:00", g: "F", h: "SWE", a: "TUN", city: "Guadalupe", result: [5, 1] },
  { d: "Jun 15", et: "13:00", g: "H", h: "ESP", a: "CPV", city: "Atlanta", result: [0, 0] },
  { d: "Jun 15", et: "18:00", g: "G", h: "BEL", a: "EGY", city: "Seattle", result: [1, 1],
    note: "Salah against Belgium's high line is the one genuine threat to the favourites here." },
  { d: "Jun 15", et: "18:00", g: "H", h: "KSA", a: "URU", city: "Miami", result: [1, 1] },
  { d: "Jun 15", et: "24:00", g: "G", h: "IRN", a: "NZL", city: "Inglewood", result: [2, 2] },
  { d: "Jun 16", et: "15:00", g: "I", h: "FRA", a: "SEN", city: "East Rutherford", result: [3, 1],
    note: "A rematch of the famous 2002 upset, and the hardest opener any favourite drew. Senegal are top-20 quality; France's depth should still decide it late." },
  { d: "Jun 16", et: "18:00", g: "I", h: "IRQ", a: "NOR", city: "Foxborough", result: [1, 2] },
  { d: "Jun 16", et: "21:00", g: "J", h: "ARG", a: "ALG", city: "Kansas City", result: [3, 0],
    note: "Echoes of Saudi Arabia 2022: a confident African champion against the holders. Argentina won't sleepwalk twice." },
  { d: "Jun 16", et: "24:00", g: "J", h: "AUT", a: "JOR", city: "Santa Clara", result: [3, 1] },
  { d: "Jun 17", et: "13:00", g: "K", h: "POR", a: "COD", city: "Houston", result: [1, 1] },
  { d: "Jun 17", et: "16:00", g: "L", h: "ENG", a: "CRO", city: "Arlington", result: [4, 2],
    note: "The biggest matchday-one clash on paper: a 2018 semi-final rematch. England's press against Modrić's tempo control — the group winner is probably decided here." },
  { d: "Jun 17", et: "19:00", g: "L", h: "GHA", a: "PAN", city: "Toronto", result: [1, 0] },
  { d: "Jun 17", et: "22:00", g: "K", h: "UZB", a: "COL", city: "Mexico City", result: [1, 3] },

  // -------- Matchday 2 --------
  { d: "Jun 18", et: "12:00", g: "A", h: "CZE", a: "RSA", city: "Atlanta", result: [1, 1] },
  { d: "Jun 18", et: "15:00", g: "B", h: "SUI", a: "BIH", city: "Inglewood", result: [4, 1] },
  { d: "Jun 18", et: "18:00", g: "B", h: "CAN", a: "QAT", city: "Vancouver", result: [6, 0] },
  { d: "Jun 18", et: "23:00", g: "A", h: "MEX", a: "KOR", city: "Guadalajara", result: [1, 0],
    note: "Son vs the Estadio Akron crowd. Mexico's wide overloads against Korea's counters — the likely group decider." },
  { d: "Jun 19", et: "15:00", g: "D", h: "USA", a: "AUS", city: "Seattle", result: [2, 0] },
  { d: "Jun 19", et: "18:00", g: "C", h: "SCO", a: "MAR", city: "Foxborough", result: [0, 1] },
  { d: "Jun 19", et: "21:00", g: "C", h: "BRA", a: "HAI", city: "Philadelphia", result: [3, 0] },
  { d: "Jun 19", et: "24:00", g: "D", h: "TUR", a: "PAR", city: "Santa Clara", result: [0, 1] },
  { d: "Jun 20", et: "13:00", g: "F", h: "NED", a: "SWE", city: "Houston", result: [5, 1] },
  { d: "Jun 20", et: "16:00", g: "E", h: "GER", a: "CIV", city: "Toronto", result: [2, 1] },
  { d: "Jun 20", et: "20:00", g: "E", h: "ECU", a: "CUW", city: "Kansas City", result: [0, 0] },
  { d: "Jun 20", et: "24:00", g: "F", h: "TUN", a: "JPN", city: "Guadalupe", result: [0, 4] },
  { d: "Jun 21", et: "12:00", g: "H", h: "ESP", a: "KSA", city: "Atlanta", result: [4, 0] },
  { d: "Jun 21", et: "15:00", g: "G", h: "BEL", a: "IRN", city: "Inglewood", result: [0, 0] },
  { d: "Jun 21", et: "18:00", g: "H", h: "URU", a: "CPV", city: "Miami", result: [2, 2] },
  { d: "Jun 21", et: "21:00", g: "G", h: "NZL", a: "EGY", city: "Vancouver", result: [1, 3] },
  { d: "Jun 22", et: "13:00", g: "J", h: "ARG", a: "AUT", city: "Arlington", result: [2, 0],
    note: "The matchday-two banana skin: Rangnick's press is built to disrupt teams that play out short, which is exactly how Argentina build. Closer than the rankings suggest." },
  { d: "Jun 22", et: "17:00", g: "I", h: "FRA", a: "IRQ", city: "Philadelphia", result: [3, 0] },
  { d: "Jun 22", et: "20:00", g: "I", h: "NOR", a: "SEN", city: "East Rutherford", result: [3, 2],
    note: "Effectively a playoff for second place behind France. Haaland against Koulibaly is worth the ticket alone." },
  { d: "Jun 22", et: "23:00", g: "J", h: "JOR", a: "ALG", city: "Santa Clara", result: [1, 2] },
  { d: "Jun 23", et: "13:00", g: "K", h: "POR", a: "UZB", city: "Houston", result: [5, 0] },
  { d: "Jun 23", et: "16:00", g: "L", h: "ENG", a: "GHA", city: "Foxborough", result: [0, 0] },
  { d: "Jun 23", et: "19:00", g: "L", h: "PAN", a: "CRO", city: "Toronto", result: [0, 1] },
  { d: "Jun 23", et: "22:00", g: "K", h: "COL", a: "COD", city: "Guadalajara", result: [1, 0] },

  // -------- Matchday 3 --------
  { d: "Jun 24", et: "15:00", g: "B", h: "SUI", a: "CAN", city: "Vancouver", result: [2, 1],
    note: "Likely winner-takes-the-group in Vancouver. Swiss structure against Canadian energy and a home crowd — the model makes it a near coin flip." },
  { d: "Jun 24", et: "15:00", g: "B", h: "BIH", a: "QAT", city: "Seattle", result: [3, 1] },
  { d: "Jun 24", et: "18:00", g: "C", h: "MAR", a: "HAI", city: "Atlanta", result: [4, 2] },
  { d: "Jun 24", et: "18:00", g: "C", h: "SCO", a: "BRA", city: "Miami", result: [0, 3],
    note: "If Scotland need a result here to advance, history is against them: played 3, lost 3 vs Brazil at World Cups." },
  { d: "Jun 24", et: "21:00", g: "A", h: "CZE", a: "MEX", city: "Mexico City", result: [0, 3] },
  { d: "Jun 24", et: "21:00", g: "A", h: "RSA", a: "KOR", city: "Monterrey", result: [1, 0] },
  { d: "Jun 25", et: "16:00", g: "E", h: "ECU", a: "GER", city: "East Rutherford", result: [2, 1],
    note: "Sneaky candidate for the best match of the group stage: Ecuador's elite defence and Caicedo's midfield control can genuinely frustrate Germany." },
  { d: "Jun 25", et: "16:00", g: "E", h: "CUW", a: "CIV", city: "Philadelphia", result: [0, 2] },
  { d: "Jun 25", et: "19:00", g: "F", h: "JPN", a: "SWE", city: "Arlington", result: [1, 1] },
  { d: "Jun 25", et: "19:00", g: "F", h: "TUN", a: "NED", city: "Kansas City", result: [1, 3] },
  { d: "Jun 25", et: "22:00", g: "D", h: "TUR", a: "USA", city: "Inglewood", result: [3, 2],
    note: "Probably for first place in Group D. Güler and Yıldız between the lines is the exact profile that has troubled the US midfield for years — but 70,000 in SoFi tilts it." },
  { d: "Jun 25", et: "22:00", g: "D", h: "PAR", a: "AUS", city: "Santa Clara", result: [0, 0] },
  { d: "Jun 26", et: "15:00", g: "I", h: "NOR", a: "FRA", city: "Foxborough", result: [1, 4],
    note: "Haaland and Mbappé share a World Cup pitch for the first time. France may already be through; Norway may need everything." },
  { d: "Jun 26", et: "15:00", g: "I", h: "SEN", a: "IRQ", city: "Toronto", result: [5, 0] },
  { d: "Jun 26", et: "20:00", g: "H", h: "CPV", a: "KSA", city: "Houston", result: [0, 0] },
  { d: "Jun 26", et: "20:00", g: "H", h: "URU", a: "ESP", city: "Guadalajara", result: [0, 1],
    note: "The group-stage heavyweight bout: world #1 against Bielsa's chaos machine. Uruguay's press is the most aggressive Spain will have faced all cycle." },
  { d: "Jun 26", et: "23:00", g: "G", h: "EGY", a: "IRN", city: "Seattle", result: [1, 1],
    note: "Almost certainly a straight shootout for second place. Salah against Iran's deep block — fine margins, set pieces decide it." },
  { d: "Jun 26", et: "23:00", g: "G", h: "NZL", a: "BEL", city: "Vancouver", result: [1, 5] },
  { d: "Jun 27", et: "22:00", g: "J", h: "JOR", a: "ARG", city: "Arlington", result: [1, 3] },
  { d: "Jun 27", et: "22:00", g: "J", h: "ALG", a: "AUT", city: "Kansas City", result: [3, 3] },
  { d: "Jun 27", et: "17:00", g: "L", h: "PAN", a: "ENG", city: "East Rutherford", result: [0, 2] },
  { d: "Jun 27", et: "17:00", g: "L", h: "CRO", a: "GHA", city: "Philadelphia", result: [2, 1] },
  { d: "Jun 27", et: "19:30", g: "K", h: "COL", a: "POR", city: "Miami", result: [0, 0],
    note: "The best matchday-three fixture: two top-six Elo sides, Díaz against Ronaldo, with the group title and a kinder bracket at stake." },
  { d: "Jun 27", et: "19:30", g: "K", h: "COD", a: "UZB", city: "Atlanta", result: [3, 1] },
];

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// Outright (tournament winner) decimal odds — market consensus across the
// major international books, 11 June 2026 (FOX Sports / ESPN / CBS / Yahoo
// odds round-ups). Singapore Pools' own outright prices typically run a
// touch shorter than this consensus because of its higher margin; check the
// live price in the SG Pools app and use the calculator below the table.
const MARKET_ODDS = [
  { code: "ESP", odds: 5.5 },
  { code: "FRA", odds: 6.0 },
  { code: "ENG", odds: 8.0 },
  { code: "BRA", odds: 9.5 },
  { code: "POR", odds: 9.5 },
  { code: "ARG", odds: 11.0 },
  { code: "GER", odds: 14.0 },
  { code: "NED", odds: 17.0 },
];
