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
  MEX: { name: "Mexico", flag: "🇲🇽", group: "A", elo: 1883, rank: 15, form: "WWDWW", star: "Santiago Giménez",
    note: "Co-host playing every group game on home soil, including the Azteca. Dangerous in transition with a raucous crowd behind them, but historically fragile once they meet elite opposition in the round of 16." },
  RSA: { name: "South Africa", flag: "🇿🇦", group: "A", elo: 1652, rank: 56, form: "WDWLL", star: "Lyle Foster",
    note: "Athletic, well-organised Bafana Bafana side built on the Mamelodi Sundowns core. Good AFCON pedigree recently, but limited cutting edge against deeper squads." },
  KOR: { name: "South Korea", flag: "🇰🇷", group: "A", elo: 1772, rank: 22, form: "WWWDW", star: "Son Heung-min",
    note: "Son's final World Cup. Strong attacking talent (Lee Kang-in, Hwang Hee-chan) and cruised through AFC qualifying, but the defence can be opened up by quick wingers." },
  CZE: { name: "Czechia", flag: "🇨🇿", group: "A", elo: 1688, rank: 43, form: "WLWWD", star: "Patrik Schick",
    note: "Came through the UEFA playoffs. Physical, direct and elite at set pieces with Schick and Hložek up top; lacks pace in the back line." },

  // ---- Group B ----
  CAN: { name: "Canada", flag: "🇨🇦", group: "B", elo: 1761, rank: 27, form: "WWDWD", star: "Jonathan David",
    note: "Co-host with all three group games in Toronto and Vancouver. Jesse Marsch has built an aggressive pressing side around David and a fit-again Alphonso Davies." },
  BIH: { name: "Bosnia & Herzegovina", flag: "🇧🇦", group: "B", elo: 1659, rank: 62, form: "DWLWL", star: "Ermedin Demirović",
    note: "First World Cup since 2014. Hard-running and competitive, but the squad lacks depth beyond its starting XI." },
  QAT: { name: "Qatar", flag: "🇶🇦", group: "B", elo: 1632, rank: 53, form: "LWDLW", star: "Akram Afif",
    note: "Better than the 2022 home flop, with Afif in the form of his life, yet still the weakest defensive profile in the group." },
  SUI: { name: "Switzerland", flag: "🇨🇭", group: "B", elo: 1818, rank: 17, form: "WWDWW", star: "Granit Xhaka",
    note: "The ultimate tournament grinders — compact block, brilliant qualifying campaign, and knockout experience from four straight World Cups." },

  // ---- Group C ----
  BRA: { name: "Brazil", flag: "🇧🇷", group: "C", elo: 1981, rank: 5, form: "LWWDL", star: "Vinícius Júnior",
    note: "Ancelotti has steadied a turbulent cycle. The front line (Vinícius, Rodrygo, Raphinha, Estêvão) is as deep as any in the world; form has been streaky but the ceiling remains title-level." },
  MAR: { name: "Morocco", flag: "🇲🇦", group: "C", elo: 1885, rank: 11, form: "WWWWW", star: "Achraf Hakimi",
    note: "2022 semi-finalists and 2025 AFCON champions on a long winning run. On the eve of the opener, though, FIFA confirmed Nayef Aguerd (their best centre-back) and Abde Ezzalzouli were replaced in the 26-man squad through injury — a tournament-long hit to the miserly defence that is Morocco's identity (rating nudged -20 from 1895)." },
  HAI: { name: "Haiti", flag: "🇭🇹", group: "C", elo: 1525, rank: 88, form: "WDLWD", star: "Duckens Nazon",
    note: "First World Cup since 1974, qualified amid enormous adversity. Energetic and fearless, but the thinnest squad in the tournament." },
  SCO: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", elo: 1750, rank: 36, form: "WWLWD", star: "Scott McTominay",
    note: "First World Cup since 1998, sealed with that dramatic night against Denmark. McTominay's late-arriving runs and set-piece menace are the chief weapons." },

  // ---- Group D ----
  USA: { name: "United States", flag: "🇺🇸", group: "D", elo: 1829, rank: 14, form: "WDWWL", star: "Christian Pulisic",
    note: "Co-host with the deepest US talent pool ever (Pulisic, McKennie, Reyna, Balogun). Pochettino has tightened the structure; the question is composure when the lights are brightest." },
  PAR: { name: "Paraguay", flag: "🇵🇾", group: "D", elo: 1711, rank: 37, form: "DWWDL", star: "Julio Enciso",
    note: "Alfaro's Paraguay are nasty to play against: deep block, fouls in the right places, and Enciso's spark. Beat Brazil and Argentina at home in qualifying." },
  AUS: { name: "Australia", flag: "🇦🇺", group: "D", elo: 1774, rank: 25, form: "WDWLW", star: "Jackson Irvine",
    note: "Tony Popovic has made the Socceroos hard to beat, conceding almost nothing in the final AFC phase. Limited creativity is the recurring concern." },
  TUR: { name: "Türkiye", flag: "🇹🇷", group: "D", elo: 1771, rank: 26, form: "WWWDW", star: "Arda Güler",
    note: "The dark horse pick. Montella's golden generation — Güler, Yıldız, Çalhanoğlu — plays brave, technical football and reached the playoff final routing its group." },

  // ---- Group E ----
  GER: { name: "Germany", flag: "🇩🇪", group: "E", elo: 1958, rank: 9, form: "WWWWD", star: "Jamal Musiala",
    note: "Nagelsmann's rebuild has clicked: ruthless qualifying finish, Musiala and Wirtz both fit, and Kimmich anchoring. Opened with a 7-1 demolition of Curaçao (Havertz brace). Still occasionally vulnerable to elite pace in behind. (Rating +13 after the win.)" },
  CUW: { name: "Curaçao", flag: "🇨🇼", group: "E", elo: 1547, rank: 80, form: "DWDWL", star: "Leandro Bacuna",
    note: "The smallest nation ever at a World Cup, steered there by veteran coach Dick Advocaat. Organised and proud, but a huge talent gap to this group — opened with a 1-7 loss to Germany, Comenencia with the consolation. (Rating -13.)" },
  ECU: { name: "Ecuador", flag: "🇪🇨", group: "E", elo: 1810, rank: 23, form: "DWDWL", star: "Moisés Caicedo",
    note: "Conceded fewer goals than anyone but Argentina in CONMEBOL qualifying. Caicedo and Páez give them control and class; scoring enough remains the worry — confirmed in a 0-1 opening loss to Ivory Coast, beaten by an Amad Diallo 90th-minute winner (rating -40)." },
  CIV: { name: "Ivory Coast", flag: "🇨🇮", group: "E", elo: 1770, rank: 40, form: "WDWLW", star: "Amad Diallo",
    note: "2024 AFCON winners with real wing talent (Amad, Adingra) and a powerful midfield. Inconsistent against top-30 opposition — but stunned Ecuador 1-0 in their opener, Amad Diallo striking at the death (rating +40)." },

  // ---- Group F ----
  NED: { name: "Netherlands", flag: "🇳🇱", group: "F", elo: 1929, rank: 7, form: "WWWDW", star: "Virgil van Dijk",
    note: "Koeman's side rolled through qualifying behind Van Dijk's top-five defence. June 2026 injuries bite, though: Xavi Simons (ACL) and Schouten are out for the tournament, Timber withdrew, keeper Verbruggen has a hip knock and Depay arrives carrying a hamstring — a meaningful dent to a genuine contender (rating nudged -30 from 1965). Opened with a frustrating 2-2 draw vs Japan, conceding an 89th-minute Kamada equaliser (rating -6)." },
  JPN: { name: "Japan", flag: "🇯🇵", group: "F", elo: 1871, rank: 18, form: "WWDWW", star: "Takefusa Kubo",
    note: "First team to qualify, dominating AFC qualifying. The deepest, most European-based squad Asia has produced — Kubo, Mitoma, Kamada, Itakura. Beat Germany and Spain in 2022; nobody wants this draw. Twice came from behind to draw 2-2 with the Netherlands, Kamada levelling at the death (rating +6)." },
  SWE: { name: "Sweden", flag: "🇸🇪", group: "F", elo: 1832, rank: 45, form: "WLLWWW", star: "Viktor Gyökeres",
    note: "Gyökeres and Isak delivered immediately — both scored in a stunning 5-1 demolition of Tunisia, Ayari adding a brace. One of the biggest opening-day wins in World Cup history (rating +42 to 1832)." },
  TUN: { name: "Tunisia", flag: "🇹🇳", group: "F", elo: 1658, rank: 41, form: "LWWDWD", star: "Hannibal Mejbri",
    note: "Defensively solid on paper but completely undone by Sweden's pace — conceded five including a 96th-minute Ayari howitzer. Already in a deep hole in Group F (rating −42 to 1658)." },

  // ---- Group G ----
  BEL: { name: "Belgium", flag: "🇧🇪", group: "G", elo: 1846, rank: 8, form: "DWWDD", star: "Jérémy Doku",
    note: "The post-golden-generation team is finally settled: Doku and Openda's speed, Tielemans running midfield. Held to a frustrating 1-1 by Egypt in the opener — Ashour put Egypt ahead, a Hany own goal rescued the point after Lukaku came on (rating −9)." },
  EGY: { name: "Egypt", flag: "🇪🇬", group: "G", elo: 1754, rank: 32, form: "WWDWD", star: "Mohamed Salah",
    note: "Salah's last World Cup shot. Defensively excellent and a real threat on the break — earned a deserved 1-1 with Belgium, Ashour scoring before conceding a late own goal (rating +9)." },
  IRN: { name: "Iran", flag: "🇮🇷", group: "G", elo: 1746, rank: 20, form: "DWWLD", star: "Mehdi Taremi",
    note: "Perennially well-drilled with a veteran spine. Twice let New Zealand level in a sloppy 2-2 — Rezaeian and Mohebbi scored, but they couldn't hold a lead and dropped points they expected to win (rating −14)." },
  NZL: { name: "New Zealand", flag: "🇳🇿", group: "G", elo: 1604, rank: 83, form: "WLDWD", star: "Chris Wood",
    note: "Direct, physical and set-piece reliant. Elijah Just's brace earned a stunning 2-2 with Iran on debut-level grit — far more potent than expected (rating +14)." },

  // ---- Group H ----
  ESP: { name: "Spain", flag: "🇪🇸", group: "H", elo: 2129, rank: 1, form: "WWWWD", star: "Lamine Yamal",
    note: "World #1 by a distance, Euro 2024 champions with a generational midfield. Stunned in the opener: 27 shots but no goals, held 0-0 by Cape Verde debutants and a 40-year-old goalkeeper, Vozinha, in inspired form (rating −28, still comfortably the strongest team in the field)." },
  CPV: { name: "Cape Verde", flag: "🇨🇻", group: "H", elo: 1613, rank: 68, form: "DWLWD", star: "Ryan Mendes",
    note: "Historic first qualification — the smallest African nation ever to make it. Produced one of the great World Cup defensive displays to hold Spain 0-0, goalkeeper Vozinha the hero (rating +28)." },
  KSA: { name: "Saudi Arabia", flag: "🇸🇦", group: "H", elo: 1658, rank: 59, form: "DLWDD", star: "Salem Al-Dawsari",
    note: "The 2022 win over Argentina proves the upset ceiling. Led Uruguay through Al-Amri's header and were minutes from another famous result before Araújo's late equaliser — a hard-earned 1-1 (rating +18)." },
  URU: { name: "Uruguay", flag: "🇺🇾", group: "H", elo: 1867, rank: 16, form: "DWLWD", star: "Federico Valverde",
    note: "Bielsa's intense Uruguay flattered to deceive in the opener — fell behind to Saudi Arabia and needed a late Araújo strike to escape with a 1-1 draw. Streaky finishing again the issue (rating −18)." },

  // ---- Group I ----
  FRA: { name: "France", flag: "🇫🇷", group: "I", elo: 2063, rank: 3, form: "WWDWW", star: "Kylian Mbappé",
    note: "Finalists in two straight World Cups, with Mbappé at his absolute peak and absurd depth — they could field two top-ten national teams. Only complacency beats them early." },
  IRQ: { name: "Iraq", flag: "🇮🇶", group: "I", elo: 1610, rank: 58, form: "WDWDL", star: "Aymen Hussein",
    note: "First World Cup since 1986, via the inter-confederation playoff. Passionate and physical, with Hussein's aerial threat the main outlet." },
  NOR: { name: "Norway", flag: "🇳🇴", group: "I", elo: 1885, rank: 29, form: "WWWWW", star: "Erling Haaland",
    note: "First World Cup since 1998, and they arrive on a perfect qualifying run. Haaland scored 16 in qualifying; Ødegaard dictates everything. A top seed nobody wanted to draw." },
  SEN: { name: "Senegal", flag: "🇸🇳", group: "I", elo: 1785, rank: 19, form: "WWWDW", star: "Iliman Ndiaye",
    note: "Africa's most complete squad after Morocco — Ndiaye, Sarr brothers, Koulibaly, Mendy. Long unbeaten run coming in; a genuinely live round-of-16 threat." },

  // ---- Group J ----
  ARG: { name: "Argentina", flag: "🇦🇷", group: "J", elo: 2115, rank: 2, form: "LWDWW", star: "Lionel Messi",
    note: "Defending champions. Messi, 39, gets one final dance, but this is no one-man team: Mac Allister, Enzo, Julián Álvarez and the meanest defence in South America. Scaloni's tournament management is the gold standard." },
  ALG: { name: "Algeria", flag: "🇩🇿", group: "J", elo: 1725, rank: 34, form: "WWDWW", star: "Riyad Mahrez",
    note: "Smashed CAF qualifying records on their return to the finals. Mahrez and Amoura lead a potent attack; the back line is the soft spot." },
  AUT: { name: "Austria", flag: "🇦🇹", group: "J", elo: 1800, rank: 24, form: "WWWDW", star: "Christoph Baumgartner",
    note: "Rangnick's relentless pressing machine topped its qualifying group. Tactically the most cohesive 'second-tier' side in Europe — a horrible matchup for possession teams." },
  JOR: { name: "Jordan", flag: "🇯🇴", group: "J", elo: 1630, rank: 64, form: "WDWLD", star: "Mousa Tamari",
    note: "First-ever World Cup, built on the run to the 2023 Asian Cup final. Quick on the break through Tamari, but defensively raw at this level." },

  // ---- Group K ----
  POR: { name: "Portugal", flag: "🇵🇹", group: "K", elo: 2009, rank: 6, form: "WWLWW", star: "Cristiano Ronaldo",
    note: "2025 Nations League champions. Ronaldo, 41, is now the finisher in a side carried by Vitinha, Bruno Fernandes, Neves and Leão. The deepest midfield in Europe after Spain." },
  COL: { name: "Colombia", flag: "🇨🇴", group: "K", elo: 1951, rank: 13, form: "WWWDW", star: "Luis Díaz",
    note: "Copa América 2024 finalists with one of the longest unbeaten runs in world football under Lorenzo. Díaz is in career-best form and James has rolled back the years." },
  UZB: { name: "Uzbekistan", flag: "🇺🇿", group: "K", elo: 1650, rank: 50, form: "WDWDW", star: "Abbosbek Fayzullaev",
    note: "Historic first qualification, now coached by Fabio Cannavaro. Technically tidy with a golden generation core, but no experience at this altitude." },
  COD: { name: "DR Congo", flag: "🇨🇩", group: "K", elo: 1640, rank: 60, form: "WDWWD", star: "Yoane Wissa",
    note: "First World Cup since 1974 (as Zaire), won via a dramatic playoff run. Premier League quality up front in Wissa; chaotic but dangerous." },

  // ---- Group L ----
  ENG: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", elo: 2024, rank: 4, form: "WWWWW", star: "Jude Bellingham",
    note: "Tuchel's England won every qualifier without conceding a goal. Kane, Bellingham, Saka, Palmer — the attacking pool is frightening. The eternal question is whether they finally finish the job." },
  CRO: { name: "Croatia", flag: "🇭🇷", group: "L", elo: 1870, rank: 10, form: "WWDWD", star: "Luka Modrić",
    note: "Modrić, 40, leads one last campaign. Semi-finalists or better in two of the last three World Cups — the most battle-hardened knockout team alive, even as legs age." },
  GHA: { name: "Ghana", flag: "🇬🇭", group: "L", elo: 1645, rank: 73, form: "WLWDW", star: "Mohammed Kudus",
    note: "Kudus and the Williams brothers give the Black Stars real talent, but qualifying form was streaky and the defence leaks." },
  PAN: { name: "Panama", flag: "🇵🇦", group: "L", elo: 1700, rank: 30, form: "WDWWD", star: "Adalberto Carrasquilla",
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
  { d: "Jun 16", et: "15:00", g: "I", h: "FRA", a: "SEN", city: "East Rutherford",
    note: "A rematch of the famous 2002 upset, and the hardest opener any favourite drew. Senegal are top-20 quality; France's depth should still decide it late." },
  { d: "Jun 16", et: "18:00", g: "I", h: "IRQ", a: "NOR", city: "Foxborough" },
  { d: "Jun 16", et: "21:00", g: "J", h: "ARG", a: "ALG", city: "Kansas City",
    note: "Echoes of Saudi Arabia 2022: a confident African champion against the holders. Argentina won't sleepwalk twice." },
  { d: "Jun 16", et: "24:00", g: "J", h: "AUT", a: "JOR", city: "Santa Clara" },
  { d: "Jun 17", et: "13:00", g: "K", h: "POR", a: "COD", city: "Houston" },
  { d: "Jun 17", et: "16:00", g: "L", h: "ENG", a: "CRO", city: "Arlington",
    note: "The biggest matchday-one clash on paper: a 2018 semi-final rematch. England's press against Modrić's tempo control — the group winner is probably decided here." },
  { d: "Jun 17", et: "19:00", g: "L", h: "GHA", a: "PAN", city: "Toronto" },
  { d: "Jun 17", et: "22:00", g: "K", h: "UZB", a: "COL", city: "Mexico City" },

  // -------- Matchday 2 --------
  { d: "Jun 18", et: "12:00", g: "A", h: "CZE", a: "RSA", city: "Atlanta" },
  { d: "Jun 18", et: "15:00", g: "B", h: "SUI", a: "BIH", city: "Inglewood" },
  { d: "Jun 18", et: "18:00", g: "B", h: "CAN", a: "QAT", city: "Vancouver" },
  { d: "Jun 18", et: "23:00", g: "A", h: "MEX", a: "KOR", city: "Guadalajara",
    note: "Son vs the Estadio Akron crowd. Mexico's wide overloads against Korea's counters — the likely group decider." },
  { d: "Jun 19", et: "15:00", g: "D", h: "USA", a: "AUS", city: "Seattle" },
  { d: "Jun 19", et: "18:00", g: "C", h: "SCO", a: "MAR", city: "Foxborough" },
  { d: "Jun 19", et: "21:00", g: "C", h: "BRA", a: "HAI", city: "Philadelphia" },
  { d: "Jun 19", et: "24:00", g: "D", h: "TUR", a: "PAR", city: "Santa Clara" },
  { d: "Jun 20", et: "13:00", g: "F", h: "NED", a: "SWE", city: "Houston" },
  { d: "Jun 20", et: "16:00", g: "E", h: "GER", a: "CIV", city: "Toronto" },
  { d: "Jun 20", et: "20:00", g: "E", h: "ECU", a: "CUW", city: "Kansas City" },
  { d: "Jun 20", et: "24:00", g: "F", h: "TUN", a: "JPN", city: "Guadalupe" },
  { d: "Jun 21", et: "12:00", g: "H", h: "ESP", a: "KSA", city: "Atlanta" },
  { d: "Jun 21", et: "15:00", g: "G", h: "BEL", a: "IRN", city: "Inglewood" },
  { d: "Jun 21", et: "18:00", g: "H", h: "URU", a: "CPV", city: "Miami" },
  { d: "Jun 21", et: "21:00", g: "G", h: "NZL", a: "EGY", city: "Vancouver" },
  { d: "Jun 22", et: "13:00", g: "J", h: "ARG", a: "AUT", city: "Arlington",
    note: "The matchday-two banana skin: Rangnick's press is built to disrupt teams that play out short, which is exactly how Argentina build. Closer than the rankings suggest." },
  { d: "Jun 22", et: "17:00", g: "I", h: "FRA", a: "IRQ", city: "Philadelphia" },
  { d: "Jun 22", et: "20:00", g: "I", h: "NOR", a: "SEN", city: "East Rutherford",
    note: "Effectively a playoff for second place behind France. Haaland against Koulibaly is worth the ticket alone." },
  { d: "Jun 22", et: "23:00", g: "J", h: "JOR", a: "ALG", city: "Santa Clara" },
  { d: "Jun 23", et: "13:00", g: "K", h: "POR", a: "UZB", city: "Houston" },
  { d: "Jun 23", et: "16:00", g: "L", h: "ENG", a: "GHA", city: "Foxborough" },
  { d: "Jun 23", et: "19:00", g: "L", h: "PAN", a: "CRO", city: "Toronto" },
  { d: "Jun 23", et: "22:00", g: "K", h: "COL", a: "COD", city: "Guadalajara" },

  // -------- Matchday 3 --------
  { d: "Jun 24", et: "15:00", g: "B", h: "SUI", a: "CAN", city: "Vancouver",
    note: "Likely winner-takes-the-group in Vancouver. Swiss structure against Canadian energy and a home crowd — the model makes it a near coin flip." },
  { d: "Jun 24", et: "15:00", g: "B", h: "BIH", a: "QAT", city: "Seattle" },
  { d: "Jun 24", et: "18:00", g: "C", h: "MAR", a: "HAI", city: "Atlanta" },
  { d: "Jun 24", et: "18:00", g: "C", h: "SCO", a: "BRA", city: "Miami",
    note: "If Scotland need a result here to advance, history is against them: played 3, lost 3 vs Brazil at World Cups." },
  { d: "Jun 24", et: "21:00", g: "A", h: "CZE", a: "MEX", city: "Mexico City" },
  { d: "Jun 24", et: "21:00", g: "A", h: "RSA", a: "KOR", city: "Monterrey" },
  { d: "Jun 25", et: "16:00", g: "E", h: "ECU", a: "GER", city: "East Rutherford",
    note: "Sneaky candidate for the best match of the group stage: Ecuador's elite defence and Caicedo's midfield control can genuinely frustrate Germany." },
  { d: "Jun 25", et: "16:00", g: "E", h: "CUW", a: "CIV", city: "Philadelphia" },
  { d: "Jun 25", et: "19:00", g: "F", h: "JPN", a: "SWE", city: "Arlington" },
  { d: "Jun 25", et: "19:00", g: "F", h: "TUN", a: "NED", city: "Kansas City" },
  { d: "Jun 25", et: "22:00", g: "D", h: "TUR", a: "USA", city: "Inglewood",
    note: "Probably for first place in Group D. Güler and Yıldız between the lines is the exact profile that has troubled the US midfield for years — but 70,000 in SoFi tilts it." },
  { d: "Jun 25", et: "22:00", g: "D", h: "PAR", a: "AUS", city: "Santa Clara" },
  { d: "Jun 26", et: "15:00", g: "I", h: "NOR", a: "FRA", city: "Foxborough",
    note: "Haaland and Mbappé share a World Cup pitch for the first time. France may already be through; Norway may need everything." },
  { d: "Jun 26", et: "15:00", g: "I", h: "SEN", a: "IRQ", city: "Toronto" },
  { d: "Jun 26", et: "20:00", g: "H", h: "CPV", a: "KSA", city: "Houston" },
  { d: "Jun 26", et: "20:00", g: "H", h: "URU", a: "ESP", city: "Guadalajara",
    note: "The group-stage heavyweight bout: world #1 against Bielsa's chaos machine. Uruguay's press is the most aggressive Spain will have faced all cycle." },
  { d: "Jun 26", et: "23:00", g: "G", h: "EGY", a: "IRN", city: "Seattle",
    note: "Almost certainly a straight shootout for second place. Salah against Iran's deep block — fine margins, set pieces decide it." },
  { d: "Jun 26", et: "23:00", g: "G", h: "NZL", a: "BEL", city: "Vancouver" },
  { d: "Jun 27", et: "22:00", g: "J", h: "JOR", a: "ARG", city: "Arlington" },
  { d: "Jun 27", et: "22:00", g: "J", h: "ALG", a: "AUT", city: "Kansas City" },
  { d: "Jun 27", et: "17:00", g: "L", h: "PAN", a: "ENG", city: "East Rutherford" },
  { d: "Jun 27", et: "17:00", g: "L", h: "CRO", a: "GHA", city: "Philadelphia" },
  { d: "Jun 27", et: "19:30", g: "K", h: "COL", a: "POR", city: "Miami",
    note: "The best matchday-three fixture: two top-six Elo sides, Díaz against Ronaldo, with the group title and a kinder bracket at stake." },
  { d: "Jun 27", et: "19:30", g: "K", h: "COD", a: "UZB", city: "Atlanta" },
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
