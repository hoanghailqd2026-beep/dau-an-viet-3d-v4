export interface QuizQuestionTranslation {
  siteName: string;
  question: string;
  options: [string, string, string, string];
  explanation: string;
  sourceRef: string;
}

export const QUIZ_TRANSLATIONS_EN: Record<number, QuizQuestionTranslation> = {
  1: {
    siteName: 'Independence Palace',
    question:
      'Which architect designed the Independence Palace (built between 1962 and 1966) in Ho Chi Minh City?',
    options: [
      'Architect Ngo Viet Thu',
      'Architect Ernest Hebrard',
      'Architect Alfred Foulhoux',
      'Architect Nguyen Cao Luyen',
    ],
    explanation:
      'Independence Palace was designed by architect Ngo Viet Thu after the former Norodom Palace was damaged in 1962. He was the first Vietnamese architect to win the Grand Prix de Rome in 1955.',
    sourceRef: 'Special National Monument Dossier of Independence Palace (2009)',
  },
  2: {
    siteName: 'Independence Palace',
    question:
      'What pivotal historical event took place at Independence Palace at 11:30 AM on April 30, 1975?',
    options: [
      'Inauguration of the new Independence Palace after four years of construction',
      'Liberation Army tanks entered the palace and the revolutionary flag was raised on the roof, concluding the Ho Chi Minh Campaign',
      'Signing of the Paris Peace Accords on ending the war and restoring peace in Vietnam',
      'Opening of the Political Consultative Conference on national reunification',
    ],
    explanation:
      'At 11:30 AM on April 30, 1975, tanks No. 390 and No. 843 of the 203rd Armored Brigade entered Independence Palace and the flag of the National Liberation Front flew over the roof, marking complete victory in the Ho Chi Minh Campaign.',
    sourceRef: 'History of Vietnam Vol. 13 - Institute of History of Vietnam',
  },
  3: {
    siteName: 'Independence Palace',
    question:
      'What dual tropical-architecture function does the stylized bamboo-node precast concrete brise-soleil curtain across the facade of Independence Palace serve?',
    options: [
      'Solely supporting the weight of the rooftop helipad',
      'Blocking all natural daylight and replacing the primary load-bearing walls',
      'Shading harsh southeastern sunlight and enabling natural cross-ventilation while projecting an Eastern aesthetic',
      'Serving as a frame for urban advertising panels and street lighting',
    ],
    explanation:
      'Inspired by traditional Vietnamese bamboo screens, the stone-flower lattice curtain cuts direct solar heat gain along the corridors while allowing air circulation and soft diffused daylight.',
    sourceRef: 'Modern Architecture Archives of Southern Vietnam (1954-1975)',
  },
  4: {
    siteName: 'Independence Palace',
    question:
      'Which auspicious Chinese characters did architect Ngo Viet Thu embed into the overall floor plan and architectural massing of Independence Palace?',
    options: [
      'The characters Fu (福) and Shou (壽)',
      'The characters Wang (王) and Tian (田)',
      'The characters Shan (山) and Shui (水)',
      'The character Ji/Cat (吉, auspicious) combined with Kou (口), Zhong (忠), San (三), and Xing (興)',
    ],
    explanation:
      'The palace plan forms the character Cat (good fortune) while integrating philosophical motifs of Khau (honoring education and open dialogue), Trung (steadfast loyalty), Tam (humanity, wisdom, and valor), and Hung (prosperity).',
    sourceRef: 'Management Board of Independence Palace Historical Monument',
  },
  5: {
    siteName: 'Independence Palace',
    question:
      'From the standpoint of architectural theory and urban planning, why is Independence Palace regarded as a benchmark of Tropical Modernism in Southeast Asia?',
    options: [
      'It systematically resolves the hot-humid climate using sun-breakers, courtyards, and water basins while fusing Eastern philosophy into modernist geometry',
      'It uses traditional ironwood exclusively instead of reinforced concrete',
      'It replicates Greco-Roman classical column proportions with glass domes verbatim',
      'It adopts a Chicago-school long-span structural steel skyscraper frame',
    ],
    explanation:
      'Ngo Viet Thu moved beyond Western imitation to harmonize modern functionality and concrete-glass engineering with tropical microclimate control and East Asian spatial philosophy.',
    sourceRef: 'Vietnam Association of Architects - Studies on Modern Vietnamese Architecture',
  },
  6: {
    siteName: 'Saigon Opera House (Municipal Theatre)',
    question:
      'When was the Ho Chi Minh City Municipal Theatre built and officially inaugurated?',
    options: [
      'Construction began in 1862 and inaugurated in 1865',
      'Construction began in 1898 and inaugurated on January 1, 1900',
      'Construction began in 1912 and inaugurated in 1914',
      'Construction began in 1927 and inaugurated in 1929',
    ],
    explanation:
      'Construction began in 1898 and the Municipal Theatre officially opened on New Year Day, January 1, 1900, for symphonic music, drama, and opera performances.',
    sourceRef: 'Ho Chi Minh City Heritage Conservation Center',
  },
  7: {
    siteName: 'Saigon Opera House (Municipal Theatre)',
    question:
      'The dominant architectural style of the Ho Chi Minh City Municipal Theatre clearly draws inspiration from which two famous French landmarks?',
    options: [
      'Notre-Dame de Paris and the Arc de Triomphe',
      'Palace of Versailles and the Eiffel Tower',
      'The Petit Palais Museum and the Palais Garnier Opera House',
      'The Louvre Museum and Pont Alexandre III',
    ],
    explanation:
      'The grand arched portal and sculpted female reliefs supporting the canopy reflect the Beaux-Arts and Flamboyant style of the Petit Palais and Opera Garnier in Paris.',
    sourceRef: 'HCMC Department of Culture and Sports - National Monument Dossier (2012)',
  },
  8: {
    siteName: 'Saigon Opera House (Municipal Theatre)',
    question:
      'During the 1955-1975 period, what function was the Municipal Theatre converted to serve?',
    options: [
      'Seat of the Saigon Supreme Court',
      'Headquarters of the National Bank of Vietnam',
      'Cochinchina International Trade Exhibition Hall',
      'House of Representatives (National Assembly) of the Saigon administration',
    ],
    explanation:
      'From 1955 until April 1975, the interior was altered and exterior ornaments removed to house the National Assembly (later Lower House) of the Republic of Vietnam before its artistic performance role was restored after 1975.',
    sourceRef: 'Cultural Gazetteer of Ho Chi Minh City - HCMC General Publishing House',
  },
  9: {
    siteName: 'Saigon Opera House (Municipal Theatre)',
    question:
      'Which engineering solution gave the Municipal Theatre auditorium effective acoustic isolation despite standing at the busy Dong Khoi - Le Loi intersection?',
    options: [
      'Raising the auditorium floor 2 meters above street level paired with double heavy timber acoustic doors',
      'Installing triple-glazed vacuum-sealed tempered glass walls in 1900',
      'Excavating the entire auditorium 10 meters underground',
      'Enclosing the exterior in windowless thick concrete walls',
    ],
    explanation:
      'Architects elevated the floor 2 meters above street grade and placed double-layered thick doors between the foyer and the oval auditorium to block traffic noise and optimize internal acoustics.',
    sourceRef: 'Urban Architectural Heritage Archives of Ho Chi Minh City',
  },
  10: {
    siteName: 'Saigon Opera House (Municipal Theatre)',
    question:
      'During the major 1998 restoration marking the 300th anniversary of Saigon - HCMC, which heritage conservation principle was successfully applied at the Municipal Theatre?',
    options: [
      'Demolishing the old facade to expand seating to 2,500 modern seats',
      'Restoring the 1900 facade reliefs and Caryatids from archival photographs while discreetly upgrading interior acoustics and lighting',
      'Leaving the Lower House modifications untouched to minimize cost',
      'Replacing all brick walls with prefabricated steel frames clad in granite',
    ],
    explanation:
      'The 1998 restoration exemplifies restoring the historic exterior from archival documentation while modernizing concealed interior technical systems, reviving sculptures removed in 1956.',
    sourceRef: 'HCMC Institute for Development Studies - Urban Heritage Conservation Report',
  },
  11: {
    siteName: 'Saigon Central Post Office',
    question: 'During which period was the Saigon Central Post Office constructed?',
    options: [
      'From 1860 to 1865',
      'From 1910 to 1915',
      'From 1886 to 1891',
      'From 1930 to 1935',
    ],
    explanation:
      'Built between 1886 and 1891 opposite Notre-Dame Cathedral, the Central Post Office anchors the historic civic ensemble of District 1.',
    sourceRef: 'Ho Chi Minh City Post - Historical Archives of Postal Services',
  },
  12: {
    siteName: 'Saigon Central Post Office',
    question:
      'What do the two prized historical murals painted directly on the walls beside the main entrance inside the Central Post Office depict?',
    options: [
      'The North-South railway diagram and central Vietnamese seaports',
      'Maritime shipping lanes from Europe through the Suez Canal to Indochina',
      'Administrative map of Dai Nam under Emperor Gia Long',
      'Map of Saigon and its environs (1892) and the telegraph lines of Southern Vietnam and Cambodia',
    ],
    explanation:
      'The symmetrical hall murals show "Saigon et ses environs 1892" and "Lignes telegraphiques du Sud Vietnam et du Cambodge", reflecting Saigon as a late-19th-century communications hub.',
    sourceRef: 'Exhibition Archives at Saigon Central Post Office',
  },
  13: {
    siteName: 'Saigon Central Post Office',
    question:
      'Plaques along the facade of the Saigon Central Post Office bear names such as Volta, Ampere, Morse, Faraday, and Ohm. What do these figures share in common?',
    options: [
      'They were pioneering scientists in electricity and the invention of telegraphy',
      'They were architects who drafted Saigon urban plans',
      'They were French governors-general of Cochinchina',
      'They were merchants who financed the building construction',
    ],
    explanation:
      'The figures honored on the facade (Volta, Ampere, Morse, Faraday, Ohm, Franklin, etc.) laid the scientific foundations of electricity and telegraphy, symbolizing the building telecommunications mission.',
    sourceRef: 'HCMC Architectural Heritage Inventory Dossier',
  },
  14: {
    siteName: 'Saigon Central Post Office',
    question:
      'Which statement accurately identifies the chief architect of the Saigon Central Post Office according to current archival research?',
    options: [
      'The entire building from facade to interior was independently designed by Gustave Eiffel',
      'Chief architect Alfred Foulhoux of the Cochinchina Public Works Department led the design, utilizing late-19th-century French iron-and-steel vault engineering',
      'Architect Ngo Viet Thu designed it on commission from the French government',
      'Hue imperial court artisans built it in traditional timber rường style',
    ],
    explanation:
      'National archival records confirm that architect Alfred Foulhoux (assisted by Henri Vildieu) officially designed the Central Post Office, correcting the popular myth attributing the whole building to Gustave Eiffel.',
    sourceRef: 'National Archives Center II - Colonial Architecture of Saigon',
  },
  15: {
    siteName: 'Saigon Central Post Office',
    question:
      'In Living Heritage conservation studies, what is the foremost distinguishing value of the Saigon Central Post Office compared with many contemporary monuments?',
    options: [
      'It is completely sealed to preserve artifacts in vacuum conditions',
      'It was dismantled and relocated intact without structural damage',
      'It has maintained continuous original postal operations for over 130 years, linking tangible heritage with everyday civic life',
      'It remained the tallest building in Ho Chi Minh City throughout the 20th century',
    ],
    explanation:
      'Unlike static museum monuments, the Saigon Central Post Office is a rare living heritage landmark that preserves its original postal service alongside cultural tourism.',
    sourceRef: 'UNESCO Asia-Pacific Heritage Conservation Guidelines - Living Heritage Reference',
  },
  16: {
    siteName: 'Ben Thanh Market',
    question:
      'To what historical geographical feature of old Saigon does the name "Ben Thanh" trace its origin?',
    options: [
      'A market specializing in ceramics branded Thanh Do',
      'A market named after a merchant called Thanh who built a pier',
      'A market located at the end of Le Thanh Ton Street',
      'A market beside a river landing near the Gia Dinh Citadel (Quy / Phung Citadel) serving boats and travelers entering the citadel',
    ],
    explanation:
      'The original Ben Thanh Market stood along the Ben Nghe River near the boat landing leading to the Gia Dinh Citadel, leading locals to call the riverside market "Ben Thanh" (Citadel Landing).',
    sourceRef: 'Old Saigon (Sai Gon nam xua) - Scholar Vuong Hong Sen',
  },
  17: {
    siteName: 'Ben Thanh Market',
    question:
      'When was the new Ben Thanh Market at its current District 1 location constructed and inaugurated?',
    options: [
      'From 1912 to March 1914',
      'From 1875 to 1880',
      'From 1945 to 1950',
      'From 1960 to 1965',
    ],
    explanation:
      'As the old riverside market deteriorated and grew cramped, municipal authorities drained the Boresse marsh and commissioned Brossard et Mopin to build the new Ben Thanh Market from 1912 to late March 1914.',
    sourceRef: 'Cultural Gazetteer of Ho Chi Minh City',
  },
  18: {
    siteName: 'Ben Thanh Market',
    question:
      'Which iconic architectural elements define the South Gate of Ben Thanh Market?',
    options: [
      'A Gothic bell tower and two black bronze lions',
      'A three-faced clock tower rising above the "Cho Ben Thanh" sign together with Bien Hoa ceramic reliefs over the four main gates',
      'A triple-arched Tam Quan gate roofed with Hue imperial glazed tiles',
      'A 40-meter hemispherical glass dome with no side entrances',
    ],
    explanation:
      'The South Gate clock tower is one of Ho Chi Minh City best-known symbols; during the 1952 renovation, artisans from the Bien Hoa School of Applied Arts led by Le Van Mau installed ceramic reliefs depicting Southern produce and livestock above the four main gates.',
    sourceRef: 'HCMC Heritage Conservation Center - Ben Thanh Market Architectural Files',
  },
  19: {
    siteName: 'Ben Thanh Market',
    question:
      'What practical climatic challenge does the multi-tiered louvered roof design of Ben Thanh Market address?',
    options: [
      'Adding extra attic storage space for bulk goods',
      'Harvesting rainwater for all market vendors',
      'Driving natural thermal convection (exhausting hot air upward while drawing cool breezes through 4 main and 12 side gates) plus natural daylighting',
      'Reducing import tariffs on European roof tiles',
    ],
    explanation:
      'Spanning over 13,000 square meters for thousands of daily shoppers, the stepped high roof with continuous louvers creates a natural stack-ventilation effect without mechanical air conditioning.',
    sourceRef: 'Tropical Climate Architecture Textbook - HCMC University of Architecture',
  },
  20: {
    siteName: 'Ben Thanh Market',
    question:
      'In the urban planning history of Saigon - HCMC from the early 20th to early 21st century, what spatial evolution does Ben Thanh Market location illustrate?',
    options: [
      'Shrinking market footprints over time to restore farmland',
      'Isolating traditional commerce far outside the civic center',
      'Converting commercial markets into defensive military fortifications',
      'Shifting the commercial hub from riverine transport to radial road/rail junctions and now integrating with the central underground station of Metro Line 1',
    ],
    explanation:
      'Moving from the riverside landing to the radial road hub near the former Saigon railway terminal and today linking directly to Ben Thanh Central Metro Station illustrates how urban markets co-evolve with transit infrastructure.',
    sourceRef: 'Urban Planning Studies of Ho Chi Minh City - Institute of Construction Planning',
  },
  21: {
    siteName: 'Nha Rong Wharf (Dragon House Wharf)',
    question:
      'On June 5, 1911, which vessel did young Nguyen Tat Thanh board at Nha Rong Wharf to depart in search of a path to national salvation?',
    options: [
      'SS Amiral Latouche-Treville',
      'RMS Titanic',
      'SS Catinat',
      'SS Le Tonkin',
    ],
    explanation:
      'On June 5, 1911, young patriot Nguyen Tat Thanh (under the name Van Ba) boarded the French merchant steamer Amiral Latouche-Treville as a galley helper, beginning a 30-year journey abroad.',
    sourceRef: 'Ho Chi Minh Museum - Ho Chi Minh City Branch',
  },
  22: {
    siteName: 'Nha Rong Wharf (Dragon House Wharf)',
    question:
      'Why did local residents call the 1862-1863 headquarters of the Messageries Maritimes shipping line at the Saigon River confluence "Nha Rong" (Dragon House)?',
    options: [
      'The exterior walls were painted bright golden dragon-scale yellow',
      'Its roof ridge was crowned with a pair of green-glazed terracotta dragons crafted in traditional East Asian style',
      'The shipping company carried only dragon-carved timber',
      'The pier stood in Long Thanh district',
    ],
    explanation:
      'Although built for a French shipping firm, the roof featured twin green-glazed ceramic dragons flanking a central moon/sun motif, prompting locals to name the building Nha Rong.',
    sourceRef: 'Ho Chi Minh Museum - Ho Chi Minh City Branch',
  },
  23: {
    siteName: 'Nha Rong Wharf (Dragon House Wharf)',
    question:
      'What was the original function of the Nha Rong building upon its completion in 1863?',
    options: [
      'Palace of the Governor-General of Indochina',
      'Academy for training ocean-going navigators',
      'Representative headquarters and residence of the Chief Director of the French shipping company Messageries Maritimes at Saigon Port',
      'Nguyen dynasty customs house inspecting import duties',
    ],
    explanation:
      'Nha Rong was among the earliest Western masonry buildings in Saigon (1862-1863), serving as the administrative office and residence for the Messageries Maritimes directorate right beside Saigon Port.',
    sourceRef: 'Cultural Gazetteer of Ho Chi Minh City',
  },
  24: {
    siteName: 'Nha Rong Wharf (Dragon House Wharf)',
    question:
      'What climatic adaptation of early colonial architecture is demonstrated by the continuous arched galleries wrapping both floors of Nha Rong?',
    options: [
      'A sealed cold-storage warehouse for export produce',
      'A defensive bastion pierced with cannon embrasures',
      'A European temperate-zone heat-retaining conservatory',
      'A wraparound veranda buffer shading interior walls from direct sun and rain while capturing breezes from the Saigon River and Tau Hu Canal',
    ],
    explanation:
      'Wide arched verandas encircling the core structure are a hallmark of 19th-century tropical colonial design, shielding masonry rooms from harsh afternoon sun and monsoon rain while maximizing river ventilation.',
    sourceRef: 'French Colonial Architecture in Saigon - Architectural Research Archives',
  },
  25: {
    siteName: 'Nha Rong Wharf (Dragon House Wharf)',
    question:
      'What strategic shift in patriotic thought is symbolized by Nguyen Tat Thanh departing from Nha Rong Wharf toward the West in 1911 rather than going East like earlier scholars?',
    options: [
      'Heading directly to Western capitalist metropoles to examine colonialism at its source and seek a new path beyond feudal or old bourgeois frameworks',
      'Strictly continuing the Dong Du movement reliance on Japanese aid',
      'Pursuing a purely commercial shipbuilding trade in Marseille',
      'Joining an official student exchange treaty between the Hue court and France',
    ],
    explanation:
      'Departing Nha Rong for Europe aboard a French vessel demonstrated an independent vision to investigate Western societies firsthand, ultimately leading to Marxism-Leninism and the proletarian national liberation path.',
    sourceRef: 'History of the Communist Party of Vietnam - Ministry of Education and Training',
  },
  26: {
    siteName: 'Ho Chi Minh City Museum of History',
    question:
      'When it opened on January 1, 1929, what was the original name of the Ho Chi Minh City Museum of History?',
    options: [
      'Louis Finot Museum',
      'Blanchard de la Brosse Museum',
      'Henri Parmentier Museum',
      'Paul Doumer Museum',
    ],
    explanation:
      'Begun in 1927 and inaugurated on January 1, 1929, the building opened as the Blanchard de la Brosse Museum (named after the Governor of Cochinchina), becoming the first museum in Southern Vietnam.',
    sourceRef: 'Ho Chi Minh City Museum of History - Founding Chronicle',
  },
  27: {
    siteName: 'Ho Chi Minh City Museum of History',
    question:
      'The Ho Chi Minh City Museum of History is especially renowned for housing a rich collection from which ancient civilization of the Mekong Delta?',
    options: [
      'Hoa Binh Culture',
      'Dong Son Culture',
      'Oc Eo Culture (Kingdom of Funan)',
      'Bac Son Culture',
    ],
    explanation:
      'Alongside Vietnam historical progression through 1945, the museum holds one of the nation largest collections of Oc Eo - Funan stone sculptures, wooden Buddha statues, gold ornaments, and archaeological finds.',
    sourceRef: 'Permanent Exhibition Guide - HCMC Museum of History',
  },
  28: {
    siteName: 'Ho Chi Minh City Museum of History',
    question:
      'Which signature 1920s architectural movement does the Ho Chi Minh City Museum of History, designed by architect Auguste Delaval, represent?',
    options: [
      'Brutalism (raw exposed concrete)',
      'Gothic Revival',
      'Postmodernism',
      'Indochinese Style (Style Indochinois)',
    ],
    explanation:
      'The museum is an exemplar of Style Indochinois, pairing modern reinforced concrete framing with tiered glazed-tile roofs, upturned eaves, and an octagonal central pavilion inspired by East Asian architecture.',
    sourceRef: 'Studies on Indochinese Architecture in Vietnam',
  },
  29: {
    siteName: 'Ho Chi Minh City Museum of History',
    question:
      'What architectural and functional role does the central octagonal pavilion play inside the Ho Chi Minh City Museum of History?',
    options: [
      'Creating an East Asian ceremonial focal point while bringing natural daylight and ventilation into the central lobby',
      'Serving as an anti-aircraft watchtower for central Saigon',
      'Housing backup diesel generators for the Botanical Gardens',
      'Acting purely as an exterior ornament with a sealed ceiling inside',
    ],
    explanation:
      'The central octagonal tower with double-tiered clerestory roofs evokes Vietnamese-Chinese pavilion proportions while functioning as a luminous lantern well ventilating and lighting the main rotunda.',
    sourceRef: 'Architectural Heritage Dossier of HCMC Museum of History',
  },
  30: {
    siteName: 'Ho Chi Minh City Museum of History',
    question:
      'In Vietnamese museology, what conservation principle is demonstrated by the 1970 rear exhibition wing addition designed by architect Nguyen Ba Lang?',
    options: [
      'Constructing a reflective glass annex sharply contrasting with the 1929 wing',
      'Harmoniously continuing the tiled roof profiles, elevation proportions, and East Asian ornamentation of the 1929 structure to preserve ensemble integrity',
      'Demolishing the 1929 octagonal pavilion for parking expansion',
      'Moving all ancient artifacts into outdoor open-air shelters',
    ],
    explanation:
      'Nguyen Ba Lang U-shaped 1970 extension strictly respected the roof pitches, datum lines, and decorative vocabulary of the 1929 building, achieving unified expansion without visual disruption.',
    sourceRef: 'HCMC Museum of History - 90th Anniversary Monograph',
  },
  31: {
    siteName: 'Ho Chi Minh City Museum of Fine Arts',
    question:
      'Before 1975, the main building of the Ho Chi Minh City Museum of Fine Arts (97A Pho Duc Chinh, District 1) was the mansion of which prominent mercantile family?',
    options: [
      'The Le Van Muu family',
      'The Tran Cong Vang family',
      'The Hui Bon Hoa (Chu Hoa) family',
      'The Truong Vinh Ky family',
    ],
    explanation:
      'Built between 1929 and 1934, the mansion served as the private residence and business offices of the prominent Chinese-Vietnamese tycoon Hui Bon Hoa (widely known as Chu Hoa).',
    sourceRef: 'Ho Chi Minh City Museum of Fine Arts - Monument Introduction',
  },
  32: {
    siteName: 'Ho Chi Minh City Museum of Fine Arts',
    question:
      'Which celebrated National Treasure by master painter Nguyen Gia Tri is permanently exhibited at the Ho Chi Minh City Museum of Fine Arts?',
    options: [
      'Young Woman with Lilies',
      'Party Admission at Dien Bien Phu',
      'Little Thuy',
      'The monumental lacquer painting "Spring Garden of Central, South and North Vietnam"',
    ],
    explanation:
      'Nguyen Gia Tri monumental multi-panel lacquer masterpiece "Spring Garden of Central, South and North Vietnam" (created 1969-1989) was recognized as a National Treasure in 2013 and anchors the museum collection.',
    sourceRef: 'National Treasures Registry - Department of Cultural Heritage of Vietnam',
  },
  33: {
    siteName: 'Ho Chi Minh City Museum of Fine Arts',
    question:
      'Which two stylistic traditions are fused in the Ho Chi Minh City Museum of Fine Arts designed by French architect Rivera?',
    options: [
      'Early-20th-century French Neoclassical / Art Deco architecture combined with an open courtyard well (thien tinh), yin-yang tiled roofs, and Sino-Vietnamese motifs',
      'Spanish Baroque combined with Central Highlands stilt houses',
      'Hue imperial wood-frame halls combined with Eiffel iron trusses',
      'Middle Eastern Islamic architecture combined with Cham ceramics',
    ],
    explanation:
      'While its massing, arched windows, stained glass, and encaustic floor tiles embody French Art Deco, the courtyard atrium plan and glazed yin-yang tile roofs reflect traditional feng-shui and East Asian aesthetics.',
    sourceRef: 'Municipal Architectural Heritage Dossier - HCMC Museum of Fine Arts',
  },
  34: {
    siteName: 'Ho Chi Minh City Museum of Fine Arts',
    question:
      'Which rare early-20th-century technological amenity installed inside the Chu Hoa mansion remains preserved today?',
    options: [
      'A solar-powered central air conditioning plant',
      'A finely carved timber-cage elevator fitted with collapsible iron lattice gates',
      'An indoor four-season tempered-glass rooftop pool',
      'A private underground subway tunnel connecting to Saigon Port',
    ],
    explanation:
      'The mansion was among the earliest private residences in 1930s Saigon equipped with a mechanical elevator featuring an intricately carved wooden cabin, highlighting advanced domestic engineering of the era.',
    sourceRef: 'Architectural Archives of HCMC Museum of Fine Arts',
  },
  35: {
    siteName: 'Ho Chi Minh City Museum of Fine Arts',
    question:
      'Converting the Hui Bon Hoa mansion into the Ho Chi Minh City Museum of Fine Arts (established 1987, opened 1991) exemplifies which contemporary urban conservation strategy?',
    options: [
      'Frozen preservation closed permanently to public entry',
      'Complete demolition and modern reconstruction on the historic lot',
      'Adaptive Reuse - repurposing an aesthetically significant private heritage mansion into a public cultural institution',
      'Relocating the villa to an open-air suburban museum park',
    ],
    explanation:
      'Transforming the ornate 1934 villa into an art museum is a model case of Adaptive Reuse, protecting the authentic architectural fabric while opening it to public cultural enjoyment.',
    sourceRef: 'Studies on Adaptive Reuse of Urban Heritage in Vietnam',
  },
  36: {
    siteName: 'Giong Ca Vo Archaeological Site',
    question:
      'In which locality of Ho Chi Minh City is the Giong Ca Vo Archaeological Site situated?',
    options: [
      'Tan Kien Commune, Binh Chanh District',
      'Nhuan Duc Commune, Cu Chi District',
      'Long Binh Ward, Thu Duc City',
      'Long Hoa Commune, Can Gio District',
    ],
    explanation:
      'The national archaeological monument of Giong Ca Vo lies on an ancient sand ridge in Long Hoa Commune, Can Gio District, in the coastal mangrove zone southeast of Ho Chi Minh City.',
    sourceRef: 'Ho Chi Minh City Heritage Conservation Center',
  },
  37: {
    siteName: 'Giong Ca Vo Archaeological Site',
    question:
      'What is the most characteristic burial type discovered in the hundreds at the Giong Ca Vo Archaeological Site?',
    options: [
      'Ceramic jar burials accompanied by rich grave goods and ornaments',
      'Dugout wooden boat coffins carved from ancient tree trunks',
      'Brick-vaulted chamber tombs',
      'Megalithic tombs stacked from massive granite slabs',
    ],
    explanation:
      'Archaeological excavations at Giong Ca Vo uncovered hundreds of ceramic jar burials (over 300 across excavations, including 186 jar burials and 12 pit graves in the display zone) dating back 2,000-2,500 years.',
    sourceRef: 'Institute of Archaeology & HCMC Museum of History - Giong Ca Vo Excavation Report',
  },
  38: {
    siteName: 'Giong Ca Vo Archaeological Site',
    question:
      'To which chronological period of Southern Vietnamese prehistory does the Giong Ca Vo Archaeological Site belong?',
    options: [
      'Paleolithic Era, roughly 20,000 years ago',
      'Early Iron Age (Protohistoric transition), roughly 2,000 to 2,500 years ago',
      '17th-century Southern agricultural reclamation era',
      'Early Bronze Age, roughly 5,000 years ago',
    ],
    explanation:
      'Dating to roughly 2,000-2,500 BP (around the 5th-2nd centuries BCE), Giong Ca Vo belongs to the Early Iron Age, marking a crucial bridge toward protohistory and Oc Eo culture in Southern Vietnam.',
    sourceRef: 'Southern Vietnamese Archaeology - Southern Institute of Social Sciences',
  },
  39: {
    siteName: 'Giong Ca Vo Archaeological Site',
    question:
      'Which distinctive jewelry artifacts unearthed at Giong Ca Vo demonstrate early maritime cultural and trade links with Sa Huynh culture (Central Vietnam) and Southeast Asia?',
    options: [
      'Large Dong Son bronze drums depicting war canoes',
      'Cast bronze coins from the Ly and Tran dynasties',
      'Bicephalous (two-headed animal) earrings and three-pronged lingling-o nephrite jade pendants alongside glass and carnelian beads',
      'Han bronze mirrors inscribed in seal script',
    ],
    explanation:
      'Discovering two-headed animal ear ornaments and three-pointed lingling-o jade, agate, and glass beads confirms that ancient Can Gio communities participated in far-reaching Iron Age maritime exchange.',
    sourceRef: 'Nguyen Thi Hau - Archaeology of Saigon - Ho Chi Minh City',
  },
  40: {
    siteName: 'Giong Ca Vo Archaeological Site',
    question:
      'In planning an on-site museum (Site Museum) at Giong Ca Vo, what geo-archaeological engineering hazard have researchers warned most strongly against?',
    options: [
      'Volcanic rockslides from peaks exceeding 500 meters',
      'A complete lack of original excavated artifacts to display',
      'Winter frost cracking ancient earthenware',
      'Ground vibration from driven concrete foundation piles combined with saline coastal sand that could fracture exposed jar burial pits',
    ],
    explanation:
      'The ancient coastal sand ridge in Can Gio is highly vulnerable to mechanical pile-driving vibrations and saline moisture, requiring low-vibration foundation designs and urgent in-situ conservation.',
    sourceRef: 'HCMC Heritage Conservation Center & HTV Documentary Report (2024)',
  },
  41: {
    siteName: 'Giac Lam Pagoda',
    question:
      'When was Giac Lam Pagoda (Tan Binh District) founded, and what is its standing among historic temples in Ho Chi Minh City?',
    options: [
      'Founded in 1744; it is one of the oldest ancestral pagodas preserving its authentic traditional architecture in HCMC',
      'Founded in 1920 as the first reinforced-concrete pagoda in Saigon',
      'Founded in 1898 alongside the Municipal Theatre',
      'Founded in 1953 to enshrine Buddha relics from Sri Lanka',
    ],
    explanation:
      'Founded in the spring of 1744 by layman Ly Thuy Long on Cam Son mound during the reign of Lord Nguyen Phuc Khoat, Giac Lam is the oldest surviving ancestral pagoda in Ho Chi Minh City.',
    sourceRef: 'National Architectural-Artistic Monument Dossier of Giac Lam Pagoda (1988)',
  },
  42: {
    siteName: 'Giac Lam Pagoda',
    question:
      'Which traditional Chinese-character plan layout organizes the main architectural complex of Giac Lam Pagoda?',
    options: [
      'The character Yi (一), consisting of a single hall',
      'The character San/Tam (三), comprising three parallel horizontal halls: Main Sanctuary, Dharma Hall, and Refectory/Ancestral Hall',
      'The character Gong (工) enclosed by glass corridors',
      'The character Mi (米) radiating in eight directions',
    ],
    explanation:
      'Giac Lam Pagoda exemplifies the classic Southern Vietnamese "Tam" (three-hall) timber temple plan linking three wide halls with open light wells and continuous tiled roofs.',
    sourceRef: 'Ancient Pagoda Architecture of Southern Vietnam - HCMC General Publishing House',
  },
  43: {
    siteName: 'Giac Lam Pagoda',
    question:
      'What rare handcrafted material covers the walls, stupa roofs, and facade gables of Giac Lam Pagoda?',
    options: [
      'Industrial cast-iron reliefs',
      'Stained-glass panels imported from European cathedrals',
      'Thousands of antique ceramic plates (Southern Vietnamese, Lai Thieu, and Chinese wares) embedded directly into the plaster walls and roofs',
      'White marble plaques engraved in Latin',
    ],
    explanation:
      'Beginning with the 1900 restoration, over 7,000 antique porcelain plates were inlaid across the walls and stupa roofs of Giac Lam, combining folk artistic splendor with moisture protection in the tropical climate.',
    sourceRef: 'HCMC Heritage Conservation Center - Giac Lam Pagoda Archives',
  },
  44: {
    siteName: 'Giac Lam Pagoda',
    question:
      'How does the interior timber frame of Giac Lam Pagoda exemplify Southern Vietnamese traditional craftsmanship?',
    options: [
      'A long-span steel arch truss with no interior columns',
      'One-meter-thick load-bearing brick walls with no timber rafters',
      'Bamboo stilt framing thatched with nipa palm leaves',
      'A four-pillar hardwood "nha ruong" frame featuring nearly 100 carved, gilded columns and over 100 antique wooden statues',
    ],
    explanation:
      'The sanctuary holds 98 hardwood columns (cam xe, sao, go) supporting a classic timber frame alongside more than 110 historic statues (Eighteen Arhats, Ten Kings of Hell, Amitabha) from the 18th-19th centuries.',
    sourceRef: 'Buddhist Artistic Heritage of Southern Vietnam - Institute of Buddhist Studies',
  },
  45: {
    siteName: 'Giac Lam Pagoda',
    question:
      'Studying the statuary and patriarchal ancestral tablets at Giac Lam Pagoda illuminates which 18th-19th century cultural process in Southern Vietnam?',
    options: [
      'The southward transmission of Linji (Lam Te) Chuc Thanh - Gia Pho Zen Buddhism from Central Vietnam to Gia Dinh and its localization with Southern folk beliefs',
      'The complete dominance of Hindu temple architecture in Saigon',
      'Total Westernization of traditional woodcarving as early as 1744',
      'Complete separation between Dang Trong Buddhism and wet-rice agrarian culture',
    ],
    explanation:
      'Stele inscriptions, tablets of founding patriarchs such as Zen Master Vien Quang, and the synthesis of Buddha worship with ancestor and pioneer veneration document the southward spread and indigenization of Linji Zen in Gia Dinh.',
    sourceRef: 'Nguyen Hien Duc - History of Buddhism in Dang Trong',
  },
  46: {
    siteName: 'Lang Ong Ba Chieu (Tomb of Le Van Duyet)',
    question:
      'Which historical figure is entombed and venerated at Lang Ong Ba Chieu in Binh Thanh District, HCMC?',
    options: [
      'Marquis Le Thanh Hau Nguyen Huu Canh',
      'Left Marshal (Ta quan) Le Van Duyet',
      'General Nguyen Tri Phuong',
      'Commander Truong Dinh',
    ],
    explanation:
      'Lang Ong Ba Chieu is the tomb and temple of Ta quan Le Van Duyet (1764-1832), who twice served as Viceroy of Gia Dinh Citadel and is revered across Southern Vietnam as Duc Ong.',
    sourceRef: 'National Historical-Cultural Monument Dossier of Le Van Duyet Tomb (1988)',
  },
  47: {
    siteName: 'Lang Ong Ba Chieu (Tomb of Le Van Duyet)',
    question:
      'What is the name of the major New Year festival held on the 7th day of the first lunar month at Lang Ong Ba Chieu, inscribed as National Intangible Cultural Heritage in 2022?',
    options: [
      'Nghinh Ong Whale Festival of Can Gio',
      'Cho Lon Lantern Festival',
      'Khai Ha - Cau An (Lowering the Neu Pole & Praying for Peace) Festival',
      'Via Ba Chua Xu Festival',
    ],
    explanation:
      'Observed on the 7th lunar day of the New Year with pole-lowering, seal-opening, peace prayers, and Hat Boi opera, the Khai Ha - Cau An Festival at Lang Ong Ba Chieu received National Intangible Cultural Heritage status in 2022.',
    sourceRef: 'Ministry of Culture, Sports and Tourism - 2022 Heritage Inscription Decision',
  },
  48: {
    siteName: 'Lang Ong Ba Chieu (Tomb of Le Van Duyet)',
    question:
      'In what traditional form are the twin tombs of Marshal Le Van Duyet and his wife Do Thi Phan constructed within the Lang Ong precinct?',
    options: [
      'Seven-story bell pagoda towers',
      'Arch roofs clad in imperial glazed tiles',
      'Four-sided granite pyramids',
      'Twin hemispherical / tortoise-shell (quy boi) mounds built of durable traditional lime-molasses "o duoc" mortar',
    ],
    explanation:
      'The side-by-side tombs rest on a rectangular terrace and are sculpted in tortoise-shell shape from traditional o duoc composite mortar, characteristic of high-ranking Nguyen dynasty tombs symbolizing longevity.',
    sourceRef: 'Management Board of Le Van Duyet Historical-Cultural Monument',
  },
  49: {
    siteName: 'Lang Ong Ba Chieu (Tomb of Le Van Duyet)',
    question:
      'Which traditional decorative craft produces the vivid, weather-resistant dragon, phoenix, and Four Seasons reliefs along the roof ridges and Tam Quan gate of Lang Ong Ba Chieu?',
    options: [
      'Ceramic mosaic inlay (kham sanh su - fitting hand-cut polychrome porcelain shards onto lime mortar cores)',
      'Wet-plaster oil fresco painting',
      'Galvanized solid-bronze casting',
      'Italian colored marble tessellation',
    ],
    explanation:
      'Polychrome porcelain-shard mosaic (shared with Hue imperial architecture and grand Southern communal temples) keeps auspicious motifs vibrant for centuries under harsh tropical sun and rain.',
    sourceRef: 'Nguyen Dynasty Architectural Ornamentation in Southern Vietnam',
  },
  50: {
    siteName: 'Lang Ong Ba Chieu (Tomb of Le Van Duyet)',
    question:
      'When teaching early-19th-century Southern Vietnamese history around Lang Ong Ba Chieu, which socio-economic achievement of Marshal Le Van Duyet should be highlighted?',
    options: [
      'Enforcing absolute maritime isolation and banning all foreign merchant ships from Gia Dinh',
      'Maintaining stability, expanding trade, accommodating diverse communities, and directing major hydraulic works such as the Vinh Te Canal that fostered Southern prosperity',
      'Directly supervising construction of the trans-Vietnam railway',
      'Abolishing classical Chinese script and mandating Quoc Ngu romanized script in 1820',
    ],
    explanation:
      'Across two terms as Viceroy of Gia Dinh (1812-1815 and 1820-1832), Le Van Duyet pursued pragmatic governance, encouraged land reclamation, grew maritime commerce, and oversaw the Vinh Te Canal, earning enduring public gratitude despite later court conflicts with Emperor Minh Mang.',
    sourceRef: 'Dai Nam Thuc Luc & Phan Khoang - History of Dang Trong',
  },
  51: {
    siteName: 'Nghia An Assembly Hall (Chua Ong)',
    question:
      'By what popular local name is Nghia An Assembly Hall (Nguyen Trai Street, District 5, HCMC) commonly known, and which deity occupies its main altar?',
    options: [
      'Chua Ba - venerating Thien Hau (Mazu)',
      'Jade Emperor Pagoda - venerating the Jade Emperor',
      'Chua Ong - venerating Guan Yu (Quan Thanh De Quan)',
      'Minh Huong Communal House - venerating pioneer ancestors',
    ],
    explanation:
      'Built by the Teochew Chinese community, Nghia An Assembly Hall is widely known as Chua Ong (District 5), dedicated to Guan Yu as an emblem of loyalty, righteousness, and commercial trustworthiness.',
    sourceRef: 'National Architectural-Artistic Monument Dossier of Nghia An Assembly Hall (1993)',
  },
  52: {
    siteName: 'Nghia An Assembly Hall (Chua Ong)',
    question:
      'Which Chinese dialect community built and maintained Nghia An Assembly Hall as their civic center from the late 18th to early 19th century?',
    options: [
      'The Cantonese (Guangdong) community',
      'The Hainanese community',
      'The Hokkien (Fujian) community',
      'The Teochew (Chaozhou) community (along with Hakka members)',
    ],
    explanation:
      'Nghia An Assembly Hall served as the religious and communal heart of the Teochew (and Hakka) Chinese community in Cho Lon, hosting mutual aid, assembly meetings, and cultural preservation.',
    sourceRef: 'Board of Trustees of Nghia An Assembly Hall - Monument Archives',
  },
  53: {
    siteName: 'Nghia An Assembly Hall (Chua Ong)',
    question:
      'The vibrant polychrome glazed-ceramic figurine tableaux adorning the green tubular-tile roof ridges of Nghia An Assembly Hall represent which renowned old Saigon ceramic tradition?',
    options: [
      'Cay Mai ceramics (late-19th to early-20th-century Cho Lon - Saigon kilns)',
      'Chu Dau ceramics (Hai Duong)',
      'Bat Trang ceramics (Hanoi)',
      'Phuoc Tich ceramics (Thua Thien Hue)',
    ],
    explanation:
      'The roof-ridge theatrical scenes depicting Investiture of the Gods, Romance of the Three Kingdoms, and the Eight Immortals are masterpieces of Saigon famed Cay Mai kilns (such as Buu Nguyen and Dong Hoa).',
    sourceRef: 'HCMC Museum of History - Monograph on Cay Mai Ceramics of Saigon',
  },
  54: {
    siteName: 'Nghia An Assembly Hall (Chua Ong)',
    question:
      'What architectural and microclimatic function does the unroofed central courtyard (thien tinh / sky well) inside Nghia An Assembly Hall perform?',
    options: [
      'Serving as an outdoor martial arts arena for thousands of spectators',
      'Acting as a light well for natural illumination, cross-ventilation, and venting thick incense smoke from the sanctuary',
      'Serving as a motorized vehicle parking lot',
      'Functioning as a fish pond for festival banquets',
    ],
    explanation:
      'Within an enclosed urban shophouse layout shaped like the character Kou (口), the central sky well ingeniously brings in daylight, reduces humidity, and vents heavy incense smoke during major festivals.',
    sourceRef: 'Architecture of Chinese Assembly Halls in Ho Chi Minh City - Ethnic Culture Publishing House',
  },
  55: {
    siteName: 'Nghia An Assembly Hall (Chua Ong)',
    question:
      'From the perspectives of urban anthropology and economic history, what civic roles did Cho Lon assembly halls like Nghia An fulfill beyond religious worship?',
    options: [
      'Strictly storing military armaments for secret societies',
      'Operating as official administrative offices of the Qing court in Saigon',
      'Acting as self-governing chambers of commerce and welfare institutions offering credit, trade arbitration, schools, hospitals, and regional commercial networks',
      'Holding an exclusive monopoly on agricultural land taxes across the Mekong Delta',
    ],
    explanation:
      'Port-city assembly halls like Nghia An were multifunctional civic institutions: venerating Guan Yu forged commercial trust while funding schools, hospitals, and mutual-aid relief for new immigrants.',
    sourceRef: 'Tran Hong Lien - The Chinese Community in HCMC and Assembly Hall Heritage',
  },
  56: {
    siteName: 'Cu Chi Tunnels',
    question:
      'During which historical period did the Cu Chi tunnel network originate, and roughly what total length did it reach during the resistance against the US?',
    options: [
      'Excavated starting in 1968 during the Tet Offensive, reaching 30 km',
      'Excavated starting in 1973 after the Paris Accords, reaching 10 km',
      'Excavated under the Nguyen dynasty in 1859, reaching 50 km',
      'Initiated in 1946-1948 during the anti-French resistance and expanded to roughly 250 km during the resistance against the US',
    ],
    explanation:
      'The earliest tunnel segments in Cu Chi were dug by villagers and fighters in Tan Phu Trung and Phuoc Vinh An in 1946-1948 against French forces, later expanding into an interconnected ~250 km underground network.',
    sourceRef: 'Management Board of Cu Chi Tunnels Historical Relic Site',
  },
  57: {
    siteName: 'Cu Chi Tunnels',
    question:
      'Which ingenious cooking innovation allowed fighters and villagers in Cu Chi to prepare hot meals underground without revealing smoke columns to enemy reconnaissance aircraft?',
    options: [
      'The Hoang Cam stove, using underground smoke-cooling channels to disperse thin vapor close to the ground',
      'Induction cookers powered by hydroelectric generators',
      'Industrial compressed-gas stoves inside sealed chambers',
      'Solar cookers mounted atop tall tree canopies',
    ],
    explanation:
      'The Hoang Cam stove routed smoke through damp leaf-covered soil trenches that cooled the exhaust and filtered soot, releasing only wispy ground-hugging mist at dawn invisible to aerial scouts.',
    sourceRef: 'Vietnam Military History Museum - Cu Chi Tunnels Archives',
  },
  58: {
    siteName: 'Cu Chi Tunnels',
    question:
      'Which topographical and soil characteristics of Cu Chi enabled digging a three-level underground tunnel system without year-round flooding?',
    options: [
      'Loose coastal sand lying below Saigon River high-tide levels',
      'Elevated ancient alluvial terraces rich in cohesive laterite clay with good drainage above the wet-season water table',
      'Limestone karst mountains filled with natural caverns',
      'Perennially inundated acid-sulfate mangrove swamps',
    ],
    explanation:
      'Cu Chi rests on an elevated ancient alluvial terrace of lateritic clay—soft enough to dig with hand tools yet hardening firmly upon air exposure, while sitting above seasonal groundwater flooding.',
    sourceRef: 'Special National Monument Dossier of Cu Chi Tunnels (2015)',
  },
  59: {
    siteName: 'Cu Chi Tunnels',
    question:
      'Which structural design features enabled the Cu Chi Tunnels to counter poison gas pumping, flooding, and US "tunnel rat" incursions?',
    options: [
      'Excavating straight, wide 3-meter corridors for motor vehicles',
      'Lining all passages with imported stainless-steel pipes',
      'Building zigzagging multi-depth tiers (3m - 6m - 10m) fitted with trapdoors, gas/water seals, and termite-mound camouflaged air vents',
      'Pouring 2-meter-thick reinforced concrete walls sealing every entrance',
    ],
    explanation:
      'Zigzag bends damped blast shockwaves, while U-bends, trapdoors, and camouflaged ventilation shafts isolated gas or water to short segments, turning the subsoil into an impenetrable labyrinth.',
    sourceRef: 'History of Vietnamese Military Art - People Army Publishing House',
  },
  60: {
    siteName: 'Cu Chi Tunnels',
    question:
      'From a military-geography perspective, why did Cu Chi ("Land of Steel and Bronze Rampart") carry decisive strategic importance across the 1965-1975 Southern theater?',
    options: [
      'It was the sole deep-water seaport receiving military cargo from the North',
      'It lay completely outside enemy air and artillery strike range',
      'It held all major iron-ore mines and steelworks in Southern Vietnam',
      'Positioned right on Saigon northwest gateway linking War Zone D/Duong Minh Chau and Ben Cat corridors, it served as a direct staging base for the 1968 Tet Offensive and 1975 Ho Chi Minh Campaign',
    ],
    explanation:
      'Situated only 30-70 km northwest of central Saigon, Cu Chi formed an underground dagger poised beside enemy command headquarters, sustaining logistics, command posts, and assault springboards into the city.',
    sourceRef: 'Vietnam Institute of Military History - Summary of the Anti-US Resistance in the South',
  },
  61: {
    siteName: 'Iron Triangle Tunnels - Southwest Ben Cat',
    question:
      'Which three former communes of Southwest Ben Cat (Binh Duong Province) encompass the Iron Triangle Tunnels historical area?',
    options: [
      'An Dien, An Tay, and Phu An',
      'Phu Cuong, Chanh Nghia, and Hiep Thanh',
      'Lai Thieu, An Thanh, and Binh Nham',
      'Tan Uyen, Uyen Hung, and Bach Dang',
    ],
    explanation:
      'The Iron Triangle spanned An Dien, An Tay, and Phu An communes in Southwest Ben Cat (Binh Duong), forming a strategic triangular stronghold flanked by two rivers.',
    sourceRef: 'National Historical Monument Dossier of Southwest Ben Cat Tunnels (1996)',
  },
  62: {
    siteName: 'Iron Triangle Tunnels - Southwest Ben Cat',
    question:
      'Between which two important Southeast Vietnamese rivers is the "Iron Triangle" terrain wedged?',
    options: [
      'The Dong Nai River and Be River',
      'The Saigon River and Thi Tinh River',
      'The Vam Co Dong and Vam Co Tay Rivers',
      'The Tien and Hau Rivers',
    ],
    explanation:
      'Two natural waterways—the Saigon River on the west and the Thi Tinh River on the east—enclosed the three communes, creating formidable natural defense while linking directly across to Cu Chi.',
    sourceRef: 'Gazetteer of Binh Duong Province - National Political Publishing House',
  },
  63: {
    siteName: 'Iron Triangle Tunnels - Southwest Ben Cat',
    question:
      'In which year was the Iron Triangle - Southwest Ben Cat Tunnel System designated a National Historical Monument by the Ministry of Culture and Information?',
    options: ['1979', '1985', '1996', '2010'],
    explanation:
      'On March 18, 1996, the Ministry of Culture and Information officially classified the Southwest Ben Cat (Iron Triangle) Tunnels as a National Historical Monument.',
    sourceRef: 'Binh Duong Provincial Museum - National Monuments Registry',
  },
  64: {
    siteName: 'Iron Triangle Tunnels - Southwest Ben Cat',
    question:
      'In January 1967, what massive US military operation—deploying around 30,000 troops, tanks, B-52 bombers, and Rome plow bulldozers—targeted the Iron Triangle base?',
    options: [
      'Autumn-Winter Border Campaign',
      'Operation Linebacker II (Dien Bien Phu in the Air)',
      'Operation Lam Son 719',
      'Operation Cedar Falls',
    ],
    explanation:
      'Operation Cedar Falls (January 8-26, 1967) was one of the largest US search-and-destroy operations aimed at obliterating the Iron Triangle villages and tunnels, yet local revolutionary structures soon returned and endured.',
    sourceRef: 'History of Binh Duong Provincial Party Committee & Operation Cedar Falls Records (1967)',
  },
  65: {
    siteName: 'Iron Triangle Tunnels - Southwest Ben Cat',
    question:
      'When were the Iron Triangle Tunnels first dug, and how did they coordinate operationally with the Cu Chi Tunnels?',
    options: [
      'Begun around 1948 during the anti-French war, greatly expanded during the anti-US war, and coordinated across the Saigon River as an integrated stronghold with Cu Chi',
      'Dug in 1974 in total isolation without liaison to adjacent zones',
      'Built by French troops to guard Ben Cat rubber plantations',
      'Consisting solely of surface trenches with no underground shelters',
    ],
    explanation:
      'Like Cu Chi, Southwest Ben Cat tunnels originated around 1948 against French forces and later linked closely across the Saigon River with Cu Chi to form a twin fortified gateway north-northwest of Saigon.',
    sourceRef: 'History of the Armed Forces of Song Be - Binh Duong Province',
  },
  66: {
    siteName: 'Iron Triangle Tunnels - Southwest Ben Cat',
    question:
      'Which primary functional facilities comprised the underground architecture of the Iron Triangle Tunnels?',
    options: [
      'Isolated single-person foxholes with no connecting passages',
      'A winding spinal tunnel linking command bunkers, meeting halls, field hospitals, grain/ammunition depots, water wells, and concealed fighting positions',
      'Iron overpasses spanning the Thi Tinh River',
      'Open-air heavy mechanical workshops on the ground surface',
    ],
    explanation:
      'Southwest Ben Cat operated as a complete subterranean base with an inter-commune spine connecting supply caches, medical aid stations, command rooms, and surface communication trenches.',
    sourceRef: 'Management Board of Iron Triangle Tunnels Relic Site - Binh Duong',
  },
  67: {
    siteName: 'Iron Triangle Tunnels - Southwest Ben Cat',
    question:
      'Why did the US military command label the three Southwest Ben Cat communes the "Iron Triangle"?',
    options: [
      'Because the area held the largest commercial iron-ore reserves in Southeast Vietnam',
      'Because US forces built three steel airbases at its corners',
      'Because its triangular geography anchored an exceptionally resilient tunnel network and resistance base that repeatedly repelled large-scale assaults',
      'Because it was a 19th-century iron tool manufacturing hub',
    ],
    explanation:
      'The name "Iron Triangle" reflected US military acknowledgment of the unbreakable tenacity of people warfare entrenched across the An Dien - An Tay - Phu An triangle right outside Saigon.',
    sourceRef: 'Vietnamese Military Encyclopedia & Vietnam War Military Archives',
  },
  68: {
    siteName: 'Iron Triangle Tunnels - Southwest Ben Cat',
    question:
      'What scientific conclusion emerges from comparing the geo-ecological foundation of the Iron Triangle Tunnels (Binh Duong) and the Cu Chi Tunnels (HCMC)?',
    options: [
      'Both were dug in soft coastal mud requiring continuous dewatering pumps',
      'Both lie over 1,000 meters above sea level',
      'Both repurposed abandoned 19th-century coal mines',
      'Both share the elevated ancient alluvial belt of cohesive laterite clay along the Saigon River basin, enabling durable hand-dug tunnel engineering',
    ],
    explanation:
      'The Cu Chi - Ben Cat tunnel cluster demonstrates how Vietnamese military engineering leveraged regional geology—firm lateritic clay on elevated midland alluvial terraces—using simple hand tools.',
    sourceRef: 'Geology and Military Heritage Studies of Southeast Vietnam',
  },
  69: {
    siteName: 'Long Phuoc Tunnels',
    question:
      'In which locality of Ba Ria - Vung Tau Province is the Long Phuoc Tunnels revolutionary monument located?',
    options: [
      'Long Phuoc Commune, Ba Ria City',
      'Long Son Commune, Vung Tau City',
      'Con Dao District',
      'Phuoc Buu Town, Xuyen Moc District',
    ],
    explanation:
      'Long Phuoc Tunnels are located in Long Phuoc Commune, Ba Ria City, approximately 7 km northeast of central Ba Ria.',
    sourceRef: 'Ba Ria - Vung Tau Provincial Museum',
  },
  70: {
    siteName: 'Long Phuoc Tunnels',
    question:
      'In what year did local soldiers and villagers begin digging the Long Phuoc Tunnels?',
    options: ['1965', '1948', '1972', '1930'],
    explanation:
      'Long Phuoc Tunnels began in 1948 during the anti-French resistance and were continuously reinforced and extended through both wars until 1975.',
    sourceRef: 'National Monument Dossier of Long Phuoc Tunnels (1990)',
  },
  71: {
    siteName: 'Long Phuoc Tunnels',
    question:
      'When was Long Phuoc Tunnels officially recognized as a National Revolutionary Historical Monument?',
    options: [
      'September 2, 1985',
      'April 30, 1975',
      'January 9, 1990',
      'May 19, 2005',
    ],
    explanation:
      'On January 9, 1990, the Ministry of Culture and Information issued the decision recognizing Long Phuoc Tunnels as a National Revolutionary Historical Monument.',
    sourceRef: 'National Monument Classification Decision - Ministry of Culture and Information (1990)',
  },
  72: {
    siteName: 'Long Phuoc Tunnels',
    question:
      'What distinctive structural feature closely bound "people hearts warfare" with underground tunnels at Long Phuoc?',
    options: [
      'Digging tunnels beneath Ganh Rai Bay out to Long Son Island',
      'Excavating only a single bunker atop Dinh Mountain disconnected from villages',
      'Building above-ground laterite walls 2 meters tall',
      'Concealed secret cellars dug directly inside family homes (under beds and partitions) linking straight into a spinal tunnel connecting all 5 hamlets',
    ],
    explanation:
      'In Long Phuoc, families dug secret shelters right beneath beds inside residential homes that connected to the main inter-hamlet spine across 5 hamlets (Bac, Nam, Dong, Tay, Phuoc Huu), allowing guerrillas to maneuver inside the community.',
    sourceRef: 'BRTgo Documentary Feature - Ba Ria City Preserves Long Phuoc Tunnels (2023)',
  },
  73: {
    siteName: 'Long Phuoc Tunnels',
    question:
      'Which reconstructed educational features were built during the major Long Phuoc Tunnels restoration launched in 2019?',
    options: [
      'Over 700 meters of spinal tunnel, a traditional exhibition hall, administrative house, and 4 wartime civilian houses demonstrating secret under-bed tunnel entrances',
      'A modern waterpark and five-star hotel',
      'Three 50-meter steel observation towers',
      'A cable-car line linking Long Phuoc to Vung Tau Back Beach',
    ],
    explanation:
      'The 2019-2023 conservation project restored over 700 meters of clay-clad concrete spinal tunnel, an exhibition hall, and four wartime homes illustrating authentic secret domestic tunnel links.',
    sourceRef: 'Ba Ria - Vung Tau Radio & Television (BRTgo, 2023)',
  },
  74: {
    siteName: 'Long Phuoc Tunnels',
    question:
      'Which famous local defense battle of Long Phuoc is depicted by an interactive diorama inside the site museum?',
    options: [
      'Battle of Rach Gam - Xoai Mut (1785)',
      'The anti-sweep defense battle from March 5 to April 11, 1963',
      'The Binh Gia Campaign of late 1964 in Chau Duc',
      'The 1964 attack on USNS Card at Saigon Port',
    ],
    explanation:
      'The exhibition hall displays a scale diorama reconstructing the protracted anti-sweep battle fought fiercely across Long Phuoc Commune from March 5 to April 11, 1963.',
    sourceRef: 'Long Phuoc Tunnels Historical Site - Diorama Exhibition Notes',
  },
  75: {
    siteName: 'Long Phuoc Tunnels',
    question:
      'Placing Long Phuoc Tunnels alongside Cu Chi and the Iron Triangle within the Eastern Nam Bo resistance network, what was Long Phuoc strategic role?',
    options: [
      'Serving as the Central Office for South Vietnam headquarters for all 20 years',
      'Acting as the sole border outpost guarding the Cambodian frontier',
      'Directly threatening the strategic corridor linking Ba Ria provincial town and Vung Tau port with the Minh Dam base and Ba Ria - Long Khanh theater',
      'Operating as a peaceful rear zone untouched by military conflict',
    ],
    explanation:
      'Positioned close to the Ba Ria administrative-military hub, Long Phuoc functioned as a forward spearhead overlooking routes to Vung Tau and linking supply corridors down to the Minh Dam and Dat Do bases.',
    sourceRef: 'History of the Ba Ria - Vung Tau Provincial Party Committee',
  },
  76: {
    siteName: 'Long Phuoc Tunnels',
    question:
      'When designing an Experiential Learning lesson for Local Education at Long Phuoc Tunnels, which pedagogical approach best develops historical inquiry?',
    options: [
      'Requiring students only to memorize restoration budget figures without spatial observation',
      'Showing generic World War photos instead of local artifacts',
      'Detaching the tunnels completely from the broader national resistance context',
      'Combining study of the 1963 battle diorama, walking the restored tunnel segment, comparing 3D cross-sections of domestic secret cellars, and analyzing people warfare logistics',
    ],
    explanation:
      'Integrating on-site spatial experience, 3D structural visualization of home-linked shelters, and local archival evidence helps learners grasp how underground people warfare functioned operationally.',
    sourceRef: '2018 General Education Curriculum - Local Education Guidelines',
  },
  77: {
    siteName: 'Tran Cong Vang Ancient House',
    question:
      'In which locality of Binh Duong Province is the Tran Cong Vang Ancient House situated?',
    options: [
      'Phu Cuong Ward, Thu Dau Mot City',
      'Lai Thieu Ward, Thuan An City',
      'Di An Ward, Di An City',
      'An Tay Commune, Ben Cat City',
    ],
    explanation:
      'The Tran Cong Vang Ancient House stands on Ngo Tung Chau Street in Phu Cuong Ward, central Thu Dau Mot City, Binh Duong Province.',
    sourceRef: 'Binh Duong Provincial Museum - National Monument Dossier (1993)',
  },
  78: {
    siteName: 'Tran Cong Vang Ancient House',
    question: 'During which years was the Tran Cong Vang Ancient House constructed?',
    options: [
      'From 1744 to 1750 (mid-18th century)',
      'From 1889 to 1892 (late 19th century)',
      'From 1935 to 1940 (mid-20th century)',
      'From 1962 to 1966',
    ],
    explanation:
      'Commissioned by wealthy Thu Dau Mot landowner Tran Cong Vang, construction began in 1889 and finished after three years in 1892.',
    sourceRef: 'National Architectural-Artistic Monument Dossier of Tran Cong Vang Ancient House',
  },
  79: {
    siteName: 'Tran Cong Vang Ancient House',
    question:
      'How many main precious hardwood columns compose the interior structural frame of the Tran Cong Vang Ancient House?',
    options: ['12 columns', '24 columns', '48 columns', '98 columns'],
    explanation:
      'The house is celebrated for its grand timber post-and-beam frame comprising 48 precious wood columns resting on stone plinths and joined by traditional mortise-and-tenon joinery.',
    sourceRef: 'Binh Duong Department of Culture, Sports and Tourism',
  },
  80: {
    siteName: 'Tran Cong Vang Ancient House',
    question:
      'What rare floor-plan configuration distinguishes the Tran Cong Vang Ancient House among Southern Vietnamese timber heritage homes?',
    options: [
      'A narrow linear "Yi" tube plan with no side aisles',
      'A closed four-sided "Kou" courtyard plan',
      'A two-story French "Gong" plan',
      'An inverted "Ding" (chu Dinh nghich) plan',
    ],
    explanation:
      'Unlike conventional Dinh-shaped houses (transverse hall in front, longitudinal wing behind), the Tran Cong Vang house follows a rare inverted Ding plan unique in 19th-century Southern vernacular architecture.',
    sourceRef: 'Ancient House Architecture of Binh Duong - Binh Duong Provincial Museum',
  },
  81: {
    siteName: 'Tran Cong Vang Ancient House',
    question:
      'How does the timber joinery of columns, rafters, and tie-beams in the Tran Cong Vang Ancient House reflect master carpentry?',
    options: [
      'Using precision mortise-and-tenon wooden pegs without iron nails, with column bases seated on stone plinths to prevent termite damage and dampness',
      'Welding steel gusset plates and industrial bolts throughout',
      'Encasing column bases 3 meters deep in poured concrete',
      'Lashing rafters together with forest rattan cords',
    ],
    explanation:
      'Nail-free mortise-and-tenon joinery gives the frame natural resilience and allows numbered disassembly during restoration (as in 2005-2007), while carved stone bases isolate hardwood from ground moisture.',
    sourceRef: 'Restoration Archives of Tran Cong Vang Ancient House (2005-2007)',
  },
  82: {
    siteName: 'Tran Cong Vang Ancient House',
    question:
      'With which famous traditional craft guilds of the Thu Dau Mot region is the interior ornamentation (valances, horizontal plaques, couplets, and altar cabinets) associated?',
    options: [
      'Silk weaving and indigo dyeing',
      'Fine woodcarving and mother-of-pearl inlay craftsmanship of Thu Dau Mot - Lai Thieu',
      'Bronze weapons casting',
      'European stained-glass blowing',
    ],
    explanation:
      'Thu Dau Mot was renowned across Cochinchina for woodcarving, mother-of-pearl inlay, and lacquerware; the house interior showcases master artisans carving Four Sacred Beasts, Four Seasons, and inlaid parallel couplets.',
    sourceRef: 'Gazetteer of Binh Duong Province - Traditional Craft Villages',
  },
  83: {
    siteName: 'Tran Cong Vang Ancient House',
    question:
      'During the major 2005-2007 conservation project at the Tran Cong Vang Ancient House, which scientific principle safeguarded Authenticity under international heritage charters?',
    options: [
      'Replacing the entire timber frame with faux-wood concrete for permanence',
      'Adding a reinforced-concrete upper story above the yin-yang tile roof',
      'Controlled dismantling with numbered components, anti-termite treatment, maximum reuse of original timber carvings, and localized replacement using matching wood species and traditional joinery',
      'Coating all carved surfaces in opaque white industrial paint',
    ],
    explanation:
      'Controlled anastylosis—numbering every structural piece, treating original timber, and matching historic species/joinery for decayed parts—aligns with the 1994 Nara Document on Authenticity.',
    sourceRef: 'Department of Cultural Heritage - Standards for Timber Monument Conservation',
  },
  84: {
    siteName: 'Tran Cong Vang Ancient House',
    question:
      'What does the spatial hierarchy of living and ancestral-worship areas inside the Tran Cong Vang Ancient House reveal about late-19th-century Southern landed gentry culture?',
    options: [
      'Complete abandonment of ancestor veneration in favor of Western lifestyles',
      'A collective agrarian commune without private property',
      'A nomadic lifestyle with no permanent dwellings',
      'Strong Confucian family order (central bay dedicated to ancestral altars and moral couplets) balanced with open hospitality for regional economic and cultural exchange in Thu Dau Mot',
    ],
    explanation:
      'The axial division—honoring ancestors and receiving guests in the central hall while reserving wings and rear quarters for family life—reflects filial piety and the social standing of Southern landowners.',
    sourceRef: 'Studies on Family Culture and Ancient Houses in Southern Vietnam - Institute of Social Sciences',
  },
  85: {
    siteName: 'Bach Dinh (Villa Blanche)',
    question:
      'When was Bach Dinh (Villa Blanche) in Vung Tau City built, and on which mountain slope does it stand?',
    options: [
      'Built between 1898 and 1902 on the slope of Big Mountain (Nui Lon)',
      'Built between 1920 and 1925 atop Small Mountain (Nui Nho)',
      'Built between 1860 and 1865 on Long Son Island',
      'Built between 1955 and 1958 along Back Beach',
    ],
    explanation:
      'Commissioned by Governor-General Paul Doumer, Bach Dinh was built from 1898 to 1902 on the southern slope of Nui Lon overlooking Front Beach (Bai Truoc) in Vung Tau.',
    sourceRef: 'Ba Ria - Vung Tau Provincial Museum - Bach Dinh Monument Dossier',
  },
  86: {
    siteName: 'Bach Dinh (Villa Blanche)',
    question:
      'Which patriotic Nguyen dynasty emperor was placed under house arrest at Bach Dinh for nearly a decade (1907-1916) before exile to Reunion Island?',
    options: [
      'Emperor Ham Nghi',
      'Emperor Thanh Thai',
      'Emperor Duy Tan',
      'Emperor Tu Duc',
    ],
    explanation:
      'After deposing Emperor Thanh Thai for his anti-colonial defiance, French authorities confined him at Bach Dinh from 1907 to 1916 before exiling him alongside his son Emperor Duy Tan to Reunion Island.',
    sourceRef: 'Modern History of Vietnam - Vietnam Education Publishing House',
  },
  87: {
    siteName: 'Bach Dinh (Villa Blanche)',
    question:
      'After whom did Governor-General Paul Doumer name the villa "Villa Blanche"?',
    options: [
      'The first steamship to dock at Vung Tau Front Beach',
      'A 17th-century French queen',
      'His daughter, Blanche Richel Doumer',
      'A white wildflower growing on Nui Lon',
    ],
    explanation:
      'Paul Doumer named the summer retreat Villa Blanche after his daughter Blanche Richel Doumer; Vietnamese locals called it Bach Dinh (White Palace) for its bright lime-washed walls nestled in teak forest.',
    sourceRef: 'Ba Ria - Vung Tau Provincial Museum',
  },
  88: {
    siteName: 'Bach Dinh (Villa Blanche)',
    question:
      'Before the French constructed Bach Dinh in 1898, what Nguyen dynasty coastal defense installation occupied this Nui Lon hillside site?',
    options: [
      'Bat Quai (Eight-Trigram) Citadel of Gia Dinh',
      'Thay Rampart in Quang Binh',
      'Ky Hoa Fort',
      'Phuoc Thang Fortress (built in 1839 under Emperor Minh Mang)',
    ],
    explanation:
      'In 1839, Emperor Minh Mang constructed Phuoc Thang Fortress on Nui Lon guarding the maritime approach to Gia Dinh; in 1898 French engineers leveled its battery platform to erect Villa Blanche.',
    sourceRef: 'Dai Nam Nhat Thong Chi & Ba Ria - Vung Tau Provincial Museum',
  },
  89: {
    siteName: 'Bach Dinh (Villa Blanche)',
    question:
      'What is the origin of the most celebrated antique collection exhibited today inside Bach Dinh?',
    options: [
      'Kangxi-era blue-and-white porcelain (17th-18th century) salvaged from an ancient shipwreck off Hon Cau (Con Dao)',
      'Medieval European knight armor',
      'Terracotta warriors from the Qin dynasty',
      'Ancient Roman gold coins',
    ],
    explanation:
      'Bach Dinh showcases numerous antiquities, highlighted by Kangxi-period blue-and-white Qing ceramics recovered in 1990-1992 from a sunken merchant vessel off Hon Cau Island (Con Dao).',
    sourceRef: 'Ba Ria - Vung Tau Provincial Museum - Hon Cau Shipwreck Collection',
  },
  90: {
    siteName: 'Bach Dinh (Villa Blanche)',
    question:
      'What intriguing East-West artistic synthesis appears on the late-19th-century European facade of Bach Dinh?',
    options: [
      'Gothic cathedral spires paired with wooden Eighteen Arhats',
      'Eight Greco-Roman style classical busts paired with glazed ceramic relief panels depicting peacocks and carps transforming into dragons',
      'A porcelain-inlaid Tam Quan gate paired with a mechanical clock tower',
      'Plain modern green ceramic tiles with zero reliefs',
    ],
    explanation:
      'While Bach Dinh exterior follows French neoclassical villa conventions with eight classical portrait busts, it integrates glazed ceramic medallions of peacocks and mythical carp-dragons reflecting East Asian artistry.',
    sourceRef: 'National Historical-Cultural Monument Dossier of Bach Dinh (1992)',
  },
  91: {
    siteName: 'Bach Dinh (Villa Blanche)',
    question:
      'What geo-historical principle is illustrated by the succession of uses at Bach Dinh (Phuoc Thang Fortress 1839 -> Villa Blanche 1898 -> royal detention 1907 -> heritage museum today)?',
    options: [
      'A random hillside location with no strategic or economic significance',
      'Complete historical rupture erasing all pre-1975 traces',
      'The palimpsest nature of coastal heritage: a single strategic headland overlooking the sea lanes transformed across feudal defense, colonial rule, and modern public education',
      'A trend relocating all museums far inland',
    ],
    explanation:
      'In urban history and heritage studies, Bach Dinh acts as a cultural palimpsest showing how successive political eras repurposed the same commanding maritime headland for defense, colonial prestige, and cultural memory.',
    sourceRef: 'Coastal Architectural Heritage Studies of Ba Ria - Vung Tau',
  },
  92: {
    siteName: 'Bach Dinh (Villa Blanche)',
    question:
      'What key scientific evidence does the Hon Cau shipwreck Kangxi porcelain collection at Bach Dinh provide for Vietnamese maritime history?',
    options: [
      'Proving Kangxi porcelain was manufactured atop Nui Lon',
      'Proving 18th-century Vietnamese ports had zero contact with foreign merchants',
      'Proving ancient ships sailed only along the Gulf of Tonkin and bypassed Southeast Vietnam',
      'Proving the Con Dao - Vung Tau waters lay squarely along the vibrant Maritime Silk Road connecting East Asia, Southeast Asia, and Europe in the 17th-18th centuries',
    ],
    explanation:
      'Wrecks laden with tens of thousands of export ceramics at Hon Cau (Con Dao) offer hard underwater archaeological proof of the Vung Tau - Con Dao corridor centrality in early modern global maritime trade.',
    sourceRef: 'Underwater Archaeology of Vietnam - Institute of Archaeology',
  },
  93: {
    siteName: 'Long Son Big House (Nha Lon Long Son)',
    question:
      'Who led the reclamation of Long Son Island and directed the construction of the Long Son Big House complex (1910-1929)?',
    options: [
      'Le Van Muu (revered locally as Ong Tran)',
      'Nguyen Huu Canh',
      'Tran Cong Vang',
      'Le Van Duyet',
    ],
    explanation:
      'Originally from Giang Thanh (Kien Giang), Le Van Muu (1855-1935, known as Ong Tran) led settlers to clear Long Son Island and oversaw construction of Nha Lon Long Son from 1910 to 1929.',
    sourceRef: 'National Historical-Cultural Monument Dossier of Nha Lon Long Son (1991)',
  },
  94: {
    siteName: 'Long Son Big House (Nha Lon Long Son)',
    question:
      'Roughly how large is the Long Son Big House architectural complex, and in what year was it designated a National Monument?',
    options: [
      'About 50 hectares, designated in 2015',
      'About 2 hectares, designated a National Monument in 1991',
      'About 0.2 hectares, designated in 1979',
      'About 10 hectares, designated in 2005',
    ],
    explanation:
      'Spanning roughly 2 hectares, the complex encompasses shrines and communal timber-and-tile buildings recognized as a National Historical-Cultural Monument in 1991.',
    sourceRef: 'Ba Ria - Vung Tau Department of Culture and Sports',
  },
  95: {
    siteName: 'Long Son Big House (Nha Lon Long Son)',
    question:
      'What traditional attire and appearance distinguish adherents of the Ong Tran faith at Long Son Big House?',
    options: [
      'Dragon-embroidered silk robes and winged mandarin caps',
      'Saffron monastic robes and shaved heads',
      'Simple black ba ba garments, long hair tied in a topknot, and bare feet',
      'White Western suits with red corsages',
    ],
    explanation:
      'Honoring Ong Tran humble pioneer lifestyle, followers wear plain black ba ba clothing, keep long hair coiled in a bun, and walk barefoot during rituals.',
    sourceRef: 'Folk Culture Archives of Ba Ria - Vung Tau',
  },
  96: {
    siteName: 'Long Son Big House (Nha Lon Long Son)',
    question:
      'Which quartet of notable pavilions inside the Sanctuary Zone (Nha Thanh) of Long Son Big House are linked by wooden bridges around the central courtyard?',
    options: [
      'Relic Stupa, Dharma Hall, and Refectory',
      'Upper Hall, Middle Hall, Front Hall, and Stele House',
      'Five Phoenix Pavilion, Thai Hoa Palace, and The Mieu',
      'Pavilion of Saints (Lau Thanh), Pavilion of Immortals (Lau Tien), Pavilion of Buddha (Lau Phat), and Pavilion of Heaven (Lau Troi)',
    ],
    explanation:
      'The sanctuary ensemble features Lau Thanh, Lau Tien, Lau Phat, and Lau Troi joined by timber walkways facing a central courtyard symbolizing communal unity.',
    sourceRef: 'Architectural Survey of Long Son Big House',
  },
  97: {
    siteName: 'Long Son Big House (Nha Lon Long Son)',
    question:
      'Beyond the temple halls, what civic welfare facilities did Le Van Muu build inside the Long Son Big House complex to support migrant settlers?',
    options: [
      'Guest houses (temporary lodging for poor newcomers), a school, market, granary/community bank, and nursery',
      'Steam-powered iron shipyards',
      'A colonial stadium and horse-racing track',
      'Commercial office skyscrapers for rent',
    ],
    explanation:
      'Nha Lon Long Son functioned as a self-reliant mutual-aid settlement combining worship with free temporary housing for impoverished settlers alongside a school, market, and communal granary.',
    sourceRef: 'Gazetteer of Ba Ria - Vung Tau - Social Sciences Publishing House',
  },
  98: {
    siteName: 'Long Son Big House (Nha Lon Long Son)',
    question:
      'Which adage encapsulates the egalitarian ethics and funeral custom of the Ong Tran community?',
    options: [
      '"Wealth breeds elaborate rites" - holding lavish month-long funerals',
      '"In life sharing one heart and floor; in death sharing one coffin cover" - using a single communal pall and simple unmarked egalitarian graves without social distinction',
      '"When in Rome" - building marble mausoleums ranked by official title',
      '"One character makes a teacher" - venerating only imperial examination laureates',
    ],
    explanation:
      'The Ong Tran ethos upholds the Five Constant Virtues and strict equality: neighbors labor together in life and use the same communal coffin cover in burial with modest, uniform graves.',
    sourceRef: 'Studies on Ong Tran Beliefs at Long Son - Institute of Religious Studies',
  },
  99: {
    siteName: 'Long Son Big House (Nha Lon Long Son)',
    question:
      'Within the history of endogenous Southern Vietnamese religious movements of the late 19th - early 20th century, to which ideological lineage is the Ong Tran faith closely connected?',
    options: [
      'Strict northern imperial court ceremonies',
      'Reformed Protestant denominations from Northern Europe',
      'The Buu Son Ky Huong - Tu An Hieu Nghia (Four Gratitudes) patriotic peasant tradition fused with the Unity of Three Teachings (Confucianism - Buddhism - Daoism)',
      'Pure scientific materialism eliminating all ancestor veneration',
    ],
    explanation:
      'Hailing from Ha Tien - Kien Giang and aligned with Mekong Delta peasant patriotism, Le Van Muu carried the "Four Gratitudes" ethic and Three Teachings synthesis to establish an autonomous community on Long Son Island.',
    sourceRef: 'Nguyen Van Sam & Huynh Ngoc Trang - Southern Vietnamese Folk Beliefs',
  },
  100: {
    siteName: 'Long Son Big House (Nha Lon Long Son)',
    question:
      'From the standpoint of community architecture and heritage sociology, what sustainable preservation model does the Long Son Big House complex demonstrate?',
    options: [
      'A closed museum model completely detached from local livelihoods',
      'A wholesale copy of European industrial town planning',
      'Commercializing every shrine space for amusement ticket sales',
      'An "Integrated Community Institution" uniting spirituality, education, mutual aid, temporary shelter, and egalitarian festivals, ensuring voluntary local stewardship for over a century',
    ],
    explanation:
      'Nha Lon Long Son has thrived for over 100 years because the heritage remains woven into community welfare, ethics, and collective memory—exemplified by providing free meals to pilgrims during major annual festivals.',
    sourceRef: 'Cultural Heritage Journal - Community-Based Conservation Research (Long Son)',
  },
};
