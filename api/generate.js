import Anthropic from '@anthropic-ai/sdk';

export const config = {
  runtime: 'edge',
};

const STRUCTURE = `
Always produce a complete, ready-to-post structure in this exact order:

1. Header line: relevant emoji + subject name + year level + topic

2. Warm greeting (2–3 sentences welcoming parents and introducing the topic)

3. Clear, plain explanation of the topic (what children are learning and why it matters in everyday life)

4. 🎨 Visual Aid — create ONE clear visual using Unicode characters to help parents see the concept instantly. This is NOT optional. Make it bold and clear. Use the right visual for the subject:

   MATHS visuals (pick the most appropriate):
   • Bar model using blocks:
     |←────── 24 ──────→|
     |─── 12 ───|─── 12 ───|
   • Number line:
     0────5────10────15────20
                  ↑
   • Column method with clear working:
     ²³⁴
   + ¹⁵⁶
   ─────
     ³⁹⁰
   • Fraction diagram using blocks (█ = filled, ░ = empty):
     ¾ = █ █ █ ░  (3 out of 4 parts)
   • Times table array or factor pairs laid out clearly

   SCIENCE visuals (pick the most appropriate):
   • Process flow with arrows:
     ☁️ Cloud → 🌧️ Rain → 💧 Puddle → ☀️ Evaporation → ☁️ Cloud
   • Simple comparison table:
     | Solid    | Liquid   | Gas      |
     | Fixed ✓  | Fixed ✗  | Fixed ✗  |
     | shape    | flows    | spreads  |
   • Food chain:
     🌿 Grass → 🐛 Caterpillar → 🐦 Bird → 🦅 Eagle
   • Labeled diagram using text and arrows

   ENGLISH visuals (pick the most appropriate):
   • Word breakdown with syllables and phonetics:
     "because" → be · cause → /bɪˈkɒz/ → เบ-คอซ
   • Sentence structure diagram:
     [Subject] + [Verb] + [Object]
     [The cat ] + [sat  ] + [on the mat]
   • Before/after showing grammar rule:
     ✗ She go to school.
     ✓ She goes to school.  ← add 's' for he/she/it
   • Vocabulary table:
     Word → Meaning → Example sentence

5. Three real, fully worked examples — NOT placeholders. Write actual complete examples with real numbers, real words, or real sentences. Show all working steps clearly.

6. 🏠 Home activity — a simple, fun activity parents can do with their child using no special materials

7. ❓ Questions to ask your child — 2–3 questions parents can ask to check understanding

8. Friendly closing line + reminder that the worksheet PDF is available in the group

VISUAL QUALITY RULES:
- Every post MUST have a visual aid — never skip it
- Visuals must be relevant to the specific topic, not generic
- Use Unicode characters creatively: █ ░ ─ │ ← → ↑ ↓ ✓ ✗ • ·
- Align columns and rows neatly so they read clearly on a phone screen
- If a worksheet photo is provided, base the visual on what you actually see in the worksheet

Subject-specific rules:
- Maths: always show full step-by-step working, never just the answer
- Science: include one simple home observation or experiment using everyday household items
- English: always include Thai phonetic pronunciation for key English words

Keep it warm, practical, and visually engaging on a phone screen. Aim for around 500–650 words.

When worksheet photos are provided: look carefully at ALL content across ALL photos. IMPORTANT — address EVERY question on the worksheet, not just the first one. Work through each question systematically. If there are multiple photos (e.g. a story page and a questions page), treat them together as one complete assignment. Use the actual numbers, words, sentences and diagrams visible in the photos for all your examples. Do not use generic examples when you have the real worksheet in front of you.`;

function getSystemPrompt(language, curriculum) {
  const school = 'an international primary school in Thailand';

  const prompts = {
    thai: `You are แม่ปลา (Mae Pla), a warm and friendly Thai mum at ${school}. You write posts for the school's LINE OA group in THAI to help parents understand their children's homework.

Your writing style:
- Warm, conversational Thai — like a caring friend talking to another parent, not a teacher
- Use natural, everyday Thai expressions and ค่ะ/นะคะ throughout for warmth
- Always encouraging and positive — parents should feel supported, not overwhelmed
- Never stiff or formal

${STRUCTURE}`,

    english: `You are Mae Pla, a warm and friendly mum at ${school}. You write posts for the school's LINE OA group in ENGLISH to help parents understand their children's homework.

Your writing style:
- Warm, conversational English — like a caring friend talking to another parent, not a teacher
- Natural, friendly, encouraging expressions
- Always positive — parents should feel supported, not overwhelmed
- Never stiff or formal

${STRUCTURE}`,

    both: `You are แม่ปลา (Mae Pla), a warm and friendly mum at ${school}. You write BILINGUAL posts for the school's LINE OA group — in both Thai and English — because many families are mixed (e.g. Thai mum, English dad).

Format: write each section first in Thai, then immediately below it in English. Use a divider line (———) between the Thai and English versions of each section so it's easy to read.

Your writing style:
- Warm and conversational in both languages
- Thai: use ค่ะ/นะคะ naturally; English: friendly and encouraging
- Always positive and supportive

${STRUCTURE}`,

    enthai: `You are แม่ปลา (Mae Pla), a warm and friendly Thai mum at ${school}. You write posts for Thai-speaking parents whose children do homework in English. Many of these parents are fluent in Thai but find the English homework topics confusing.

Your job: show the parent exactly what English concept their child is studying, then explain everything warmly in Thai so they can actually help at home.

Format for every post:
- Start with: 📌 โจทย์ภาษาอังกฤษ (The English topic): [write the topic/concept in clear English exactly as it would appear on the worksheet]
- Then write everything else — explanation, examples, activity, questions — entirely in warm conversational Thai
- Where you use English terms (e.g. "fractions", "past tense"), write the Thai translation in brackets immediately after, e.g. fractions (เศษส่วน)
- Use ค่ะ/นะคะ throughout for warmth

Your writing style:
- Warm, friendly Thai — like a caring friend helping another mum understand her child's English homework
- Never make parents feel bad for not knowing the English term
- Always encouraging and positive

${STRUCTURE}`,
  };

  return prompts[language] || prompts.thai;
}

const OXFORD_CURRICULUM = {
  'คณิตศาสตร์': {
    'ป.1': `Oxford International Primary Maths Year 1: Number bonds to 10 and 20, counting and ordering to 100, addition and subtraction within 20, doubling and halving, recognising 2D and 3D shapes, measuring length and weight using non-standard units, telling time to the hour and half hour, simple pictograms. Oxford key vocabulary: number bond, more than, less than, double, half, partition, sort, pattern.`,
    'ป.2': `Oxford International Primary Maths Year 2: Place value to 100 (tens and ones), addition and subtraction to 100 using mental strategies and the column method, multiplication and division using arrays and the 2×, 5×, 10× tables, fractions (halves, quarters, thirds of shapes and quantities), money, measuring in cm/m, time to the quarter hour, block graphs and tally charts. Oxford key vocabulary: partition, regroup, column method, array, times table, equal groups, fraction, numerator, denominator.`,
    'ป.3': `Oxford International Primary Maths Year 3: Place value to 1000, addition and subtraction using formal column method with carrying and borrowing, multiplication tables to 10×10, short multiplication and division, unit fractions and equivalent fractions on a number line, measuring in mm/cm/m/km and g/kg/ml/l, calculating perimeter, telling time in 12-hour and 24-hour clock, bar charts and pictograms. Oxford key vocabulary: column method, exchange, inverse operation, equivalent fraction, perimeter, capacity, 24-hour clock.`,
    'ป.4': `Oxford International Primary Maths Year 4: Numbers to 10,000, Roman numerals, rounding, negative numbers, mental and written multiplication including 2-digit by 1-digit, short division, factors, multiples and primes, fractions (comparing, adding and subtracting with same denominator), decimals to 2 decimal places, area and perimeter of rectangles, acute/obtuse/right angles, coordinates in first quadrant, line graphs and frequency tables. Oxford key vocabulary: factor, multiple, prime number, common factor, decimal, tenth, hundredth, acute angle, obtuse angle, coordinates.`,
    'ป.5': `Oxford International Primary Maths Year 5: Numbers to 1,000,000, mental strategies for all four operations, long multiplication (2-digit by 2-digit), long division, factors and prime factorisation, fractions (mixed numbers, improper fractions, adding and subtracting fractions with different denominators), multiplying fractions, percentages of amounts, ratio, area of triangles and parallelograms, nets and properties of 3D shapes, converting metric units, mean average, pie charts. Oxford key vocabulary: long multiplication, long division, improper fraction, mixed number, common denominator, percentage, ratio, mean, net, prime factor.`,
    'ป.6': `Oxford International Primary Maths Year 6: Algebra (using letters for unknowns, simple formulae, sequences), all four operations with fractions, decimals and percentages interchangeably, ratio and proportion, geometry (angles in triangles and polygons, circles — radius, diameter, circumference), volume of cuboids, negative numbers in real contexts, probability (0 to 1 scale), interpreting and constructing complex graphs and statistics. Oxford key vocabulary: algebra, formula, variable, expression, percentage change, ratio, proportion, radius, diameter, circumference, volume, probability.`,
  },
  'วิทยาศาสตร์': {
    'ป.1': `Oxford International Primary Science Year 1: Living and non-living things (what living things need), parts of the human body, the five senses and sense organs, basic animal groups (mammals, birds, fish, reptiles, insects), everyday materials and their properties (hard/soft, rough/smooth, shiny/dull, stretchy), pushes and pulls as forces, observing seasonal changes. Oxford key vocabulary: living, non-living, sense organ, material, property, force, push, pull, season.`,
    'ป.2': `Oxford International Primary Science Year 2: Plants — parts of a plant (root, stem, leaf, flower) and what plants need to grow (water, light, warmth), animals and their young (life cycles), simple food chains (producer, consumer, predator, prey), materials and changes (melting, freezing, bending, twisting — reversible), light sources and darkness, how shadows are formed. Oxford key vocabulary: root, stem, leaf, flower, seed, germination, life cycle, food chain, predator, prey, transparent, opaque, shadow.`,
    'ป.3': `Oxford International Primary Science Year 3: Teeth types and functions (incisors, canines, molars), healthy eating and food groups (balanced diet, nutrients), plant reproduction and life cycles, rocks and soils (sedimentary, igneous, metamorphic, fossils, soil types), how light travels (reflection, mirrors, how we see objects), forces and magnets (magnetic and non-magnetic materials, poles, friction). Oxford key vocabulary: incisor, canine, molar, nutrients, balanced diet, sedimentary, igneous, metamorphic, fossil, reflection, magnetic pole, friction.`,
    'ป.4': `Oxford International Primary Science Year 4: Living things and their habitats (adaptation, food webs, environmental impact), the digestive system (mouth to intestines, organs involved), states of matter (solid, liquid, gas — particle theory, evaporation, condensation, water cycle), simple electrical circuits (components, symbols, conductors, insulators), sound (vibrations cause sound, pitch, volume, how sound travels). Oxford key vocabulary: adaptation, food web, habitat, digestion, oesophagus, stomach, evaporation, condensation, water cycle, circuit, conductor, insulator, vibration, pitch, volume.`,
    'ป.5': `Oxford International Primary Science Year 5: Human lifecycles and changes at puberty, plant reproduction (pollination — wind and insect, fertilisation, seed dispersal methods), properties and changes of materials (thermal/electrical conductors and insulators, reversible vs irreversible changes, dissolving, filtering, evaporating), Earth and space (solar system planets in order, day and night, seasons, the Moon), forces (gravity, friction, air resistance, water resistance, upthrust). Oxford key vocabulary: puberty, pollination, fertilisation, seed dispersal, reversible, irreversible, dissolving, filtration, solar system, orbit, gravity, air resistance, water resistance, upthrust.`,
    'ป.6': `Oxford International Primary Science Year 6: Microorganisms (bacteria, viruses, fungi — helpful and harmful examples), classification systems (Carl Linnaeus, kingdoms, vertebrates vs invertebrates), evolution and adaptation (Darwin, natural selection, inheritance), light (refraction, spectrum, the human eye, colour), electricity (series and parallel circuits, how voltage and resistance affect brightness, circuit diagrams), forces — balanced and unbalanced forces, pressure. Oxford key vocabulary: microorganism, bacteria, virus, fungi, classification, kingdom, vertebrate, invertebrate, evolution, natural selection, refraction, spectrum, series circuit, parallel circuit, voltage, resistance, balanced forces.`,
  },
  'ภาษาอังกฤษ': {
    'ป.1': `Oxford International Primary English Year 1: Phonics — letter sounds, blending CVC words, initial and final blends, high-frequency sight words (Oxford Word List), reading simple sentences, writing simple sentences using capital letters and full stops, forming letters correctly, listening to and retelling stories, vocabulary topics (colours, numbers, body parts, animals, family). Oxford key vocabulary: phonics, vowel, consonant, blend, sight word, sentence, capital letter, full stop.`,
    'ป.2': `Oxford International Primary English Year 2: Digraphs (ch, sh, th, ph) and vowel digraphs, reading and responding to simple books and poetry, punctuation (question marks, exclamation marks, commas in lists), nouns, verbs, and adjectives, expanded noun phrases, writing recounts (using time connectives: first, then, next, finally) and simple stories with a beginning, middle and end, basic dictionary skills, reading comprehension strategies (predicting, questioning, making connections). Oxford key vocabulary: digraph, noun, verb, adjective, noun phrase, recount, time connective, prediction.`,
    'ป.3': `Oxford International Primary English Year 3: Reading longer chapter books and non-fiction, writing in paragraphs, speech marks for direct speech, conjunctions to extend sentences (because, although, when, while, after), adverbs of manner and time, writing instructions (imperative verbs, numbered steps) and non-fiction reports, skimming and scanning for information, thesaurus and dictionary use. Oxford key vocabulary: conjunction, adverb, speech marks, paragraph, imperative verb, instruction text, report, skim, scan, synonym.`,
    'ป.4': `Oxford International Primary English Year 4: Reading and responding to a range of genres (adventure, mystery, poetry, playscripts), inference and deduction from texts, figurative language (similes using like/as, metaphors, personification), fronted adverbials with a comma, inverted commas for speech, possessive apostrophes (singular and plural), writing persuasive texts and non-chronological reports, planning and editing writing, note-taking strategies. Oxford key vocabulary: simile, metaphor, personification, inference, deduction, fronted adverbial, inverted commas, apostrophe, persuasion, non-chronological report.`,
    'ป.5': `Oxford International Primary English Year 5: Analysing novels and poetry (themes, characters, language choices, author's intent), relative clauses (who, which, that, where), modal verbs (might, should, could, must) to express possibility and certainty, formal vs informal register, subjunctive for possibility, writing balanced arguments, playscripts, summarising and paraphrasing, evaluating texts. Oxford key vocabulary: relative clause, modal verb, subjunctive, formal register, balanced argument, playscript, summarise, paraphrase, theme, perspective, first/third person narrative.`,
    'ป.6': `Oxford International Primary English Year 6: Literary analysis — themes, narrative structure, how writers use language for effect (irony, allegory, symbolism), active and passive voice, cohesive devices (pronouns, synonyms, conjunctions, adverbials) for text coherence, complex and compound-complex sentences, writing for different audiences and purposes with consistent style, evaluating the reliability and bias of non-fiction sources, précis writing, SATs-style comprehension skills. Oxford key vocabulary: passive voice, active voice, cohesive device, audience, purpose, literary device, irony, allegory, précis, bias, inference, deduction.`,
  },
  'ภาษาไทย': {
    'ป.1': `Thai Language Year 1 (Thai National Curriculum): Reading Thai consonants (พยัญชนะ 44 ตัว), vowels (สระ) and tonal marks (วรรณยุกต์); blending syllables (การแจกลูก); recognising high/mid/low class consonants; simple words and short sentences; writing consonants correctly; basic reading comprehension of short 2–3 sentence texts; listening and speaking in everyday contexts. Key vocabulary: พยัญชนะ, สระ, วรรณยุกต์, การแจกลูก, มาตราตัวสะกด, อักษรสูง, อักษรกลาง, อักษรต่ำ.`,
    'ป.2': `Thai Language Year 2 (Thai National Curriculum): Thai spelling rules — the 8 spelling patterns (มาตราตัวสะกด: แม่กก กด กน กม เกย เกอว กง กบ); reading words with all tonal marks correctly; silent letters (ตัวการันต์); reading short stories and simple poems; writing short paragraphs; understanding word meaning from context; homophones (คำพ้องเสียง) and synonyms (คำพ้องความหมาย). Key vocabulary: มาตราตัวสะกด, ตัวสะกด, ตัวการันต์, คำพ้องเสียง, คำพ้องความหมาย.`,
    'ป.3': `Thai Language Year 3 (Thai National Curriculum): Reading comprehension — identifying the main idea (จับใจความสำคัญ); parts of speech — nouns (คำนาม), verbs (คำกริยา), adjectives (คำวิเศษณ์), pronouns (คำสรรพนาม); writing structured paragraphs; Thai proverbs (สุภาษิต) and idioms (สำนวน); simple compound sentences; reading Thai folk tales and children's literature. Key vocabulary: จับใจความ, คำนาม, คำกริยา, คำวิเศษณ์, คำสรรพนาม, สำนวน, สุภาษิต, วรรณกรรม.`,
    'ป.4': `Thai Language Year 4 (Thai National Curriculum): Reading analysis and summarising (ย่อความ); types of words and their functions in sentences; compound and complex sentences; introduction to Thai classical literature (วรรณคดี) — simple poems and folk tales; formal vs informal language register; functional writing — letters, notices, invitations. Key vocabulary: ย่อความ, ประโยคซับซ้อน, วรรณคดี, ภาษาทางการ, ภาษาไม่ทางการ, จดหมาย, ประกาศ.`,
    'ป.5': `Thai Language Year 5 (Thai National Curriculum): Critical reading and evaluating texts; essay writing (เรียงความ); persuasive writing; Thai figures of speech and literary devices (โวหาร — บรรยายโวหาร พรรณนาโวหาร อุปมาโวหาร); royal vocabulary (คำราชาศัพท์); reading Thai classical literature and poetry. Key vocabulary: เรียงความ, โวหาร, คำราชาศัพท์, การโน้มน้าว, วรรณกรรม, อุปมา, อุปมัย.`,
    'ป.6': `Thai Language Year 6 (Thai National Curriculum): Literary analysis — themes, characters, and language in Thai classical works; writing formal reports (รายงาน) and academic texts; speech and presentation skills; evaluating texts for bias and perspective; Thai poetry forms (โคลง ฉันท์ กาพย์ กลอน); higher-order comprehension — inference, evaluation, and synthesis. Key vocabulary: รายงาน, โคลง, กลอน, ฉันท์, กาพย์, การวิเคราะห์วรรณกรรม, ทัศนะ, การนำเสนอ.`,
  },
  'สังคมศึกษา': {
    'ป.1': `Social Studies Year 1 (Thai National Curriculum): Family and community (ครอบครัวและชุมชน) — roles and responsibilities of family members; basic directions (ทิศ) and simple map reading; important Thai festivals and traditions (วันสำคัญและประเพณีไทย); introduction to Buddhism — the Buddha's life story and the Five Precepts (ศีล 5); caring for people around us. Key vocabulary: ครอบครัว, ชุมชน, ทิศ, ประเพณี, วันสำคัญ, ศีล 5, วัด.`,
    'ป.2': `Social Studies Year 2 (Thai National Curriculum): Community and society — local occupations (อาชีพในชุมชน) and how they serve each other; local natural resources (ทรัพยากรในท้องถิ่น); simple maps of school and neighbourhood; Thai calendar and important national dates; basic environmental care (การรักษาสิ่งแวดล้อม); saving and spending money. Key vocabulary: อาชีพ, ทรัพยากร, แผนที่, สิ่งแวดล้อม, ปฏิทิน, การออม.`,
    'ป.3': `Social Studies Year 3 (Thai National Curriculum): Province and region (จังหวัดและภูมิภาค) — Thailand's 6 regions; natural resources in Thailand; sufficiency economy philosophy (ปรัชญาเศรษฐกิจพอเพียง) of King Rama IX; local history and cultural heritage; Thai national symbols (ธงชาติ ตราแผ่นดิน เพลงชาติ). Key vocabulary: จังหวัด, ภูมิภาค, ทรัพยากรธรรมชาติ, เศรษฐกิจพอเพียง, สัญลักษณ์ประจำชาติ, มรดกทางวัฒนธรรม.`,
    'ป.4': `Social Studies Year 4 (Thai National Curriculum): Thailand and neighbouring ASEAN countries — geography, capitals, and culture; Thailand's physical geography (mountains, rivers, plains); production and consumption (การผลิตและการบริโภค) and supply/demand basics; Buddhism — the Triple Gem (พระรัตนตรัย), the Five Precepts, and important Buddhist figures; civic duties and rights of Thai citizens. Key vocabulary: ภูมิศาสตร์, การผลิต, การบริโภค, อุปสงค์, อุปทาน, พระรัตนตรัย, สิทธิ, หน้าที่พลเมือง, อาเซียน.`,
    'ป.5': `Social Studies Year 5 (Thai National Curriculum): Asia and the world — physical and human geography; natural resources, environment and sustainability; Thai history — the Sukhothai (สุโขทัย), Ayutthaya (อยุธยา) and early Rattanakosin (รัตนโกสินทร์) kingdoms; democracy and Thai government structure; global issues — climate change, poverty. Key vocabulary: ประวัติศาสตร์, สุโขทัย, อยุธยา, รัตนโกสินทร์, ประชาธิปไตย, รัฐสภา, การเปลี่ยนแปลงสภาพภูมิอากาศ, ความยั่งยืน.`,
    'ป.6': `Social Studies Year 6 (Thai National Curriculum): Thai and world history — key events and their impact; world geography and major biomes; global economy, trade and Thailand's role; international relations and organisations (UN, ASEAN); environmental sustainability and human responsibility; human rights and global citizenship; review of Thai civic values and constitutional monarchy. Key vocabulary: ประวัติศาสตร์โลก, เศรษฐกิจโลก, การค้าระหว่างประเทศ, ความสัมพันธ์ระหว่างประเทศ, สิทธิมนุษยชน, พลเมืองโลก, การพัฒนาอย่างยั่งยืน.`,
  },
};

const CAMBRIDGE_CURRICULUM = {
  'คณิตศาสตร์': {
    'ป.1': `Cambridge Primary Mathematics Stage 1: Counting, ordering and comparing numbers to 100, addition and subtraction within 20 using number lines and counting on/back, simple multiplication as repeated addition and sharing equally, halves and quarters of shapes and quantities, 2D and 3D shapes and their properties, measuring length and mass using non-standard units, time to the hour and half hour, sorting using Carroll diagrams. Cambridge key vocabulary: count on, count back, more than, less than, equal to, half, quarter, repeated addition, Carroll diagram, sort, property.`,
    'ป.2': `Cambridge Primary Mathematics Stage 2: Place value to 100 (tens and ones), addition and subtraction to 100 using mental strategies and informal written methods, multiplication and division using 2×, 3×, 5×, 10× tables and arrays, fractions (half, quarter, third, fifth, tenth of shapes and quantities), money using coins and notes, measuring in cm/m, g/kg, ml/l, time to 5 minutes, Venn diagrams and Carroll diagrams, block graphs. Cambridge key vocabulary: partition, recombine, array, equal groups, times table, fraction, numerator, denominator, Venn diagram, Carroll diagram.`,
    'ป.3': `Cambridge Primary Mathematics Stage 3: Three-digit numbers (place value, ordering, rounding to nearest 10 and 100), addition and subtraction using expanded and standard written methods, multiplication tables to 10×10, short multiplication and division by a single digit, equivalent fractions and comparing fractions, mixed numbers, calculating perimeter, telling time in 12-hour and 24-hour formats, frequency tables and bar charts. Cambridge key vocabulary: standard written method, expanded notation, equivalent fraction, mixed number, perimeter, 24-hour time, frequency table, rounding.`,
    'ป.4': `Cambridge Primary Mathematics Stage 4: Numbers to 10,000, negative numbers on a number line, all four operations using standard written methods, factors, multiples and prime numbers, decimals to 2 decimal places, fractions and decimals, area and perimeter of rectangles and compound shapes, measuring and classifying angles using a protractor (acute, obtuse, reflex), coordinates in all four quadrants, mode, median and range. Cambridge key vocabulary: standard written method, factor, multiple, prime number, decimal place, acute, obtuse, reflex, coordinates, four quadrants, mode, median, range.`,
    'ป.5': `Cambridge Primary Mathematics Stage 5: Numbers to 1,000,000, long multiplication and long division, fractions (adding, subtracting and multiplying fractions, percentages as fractions and decimals), ratio and proportion, algebra (sequences, function machines, simple linear equations), area of triangles and compound shapes, properties and nets of 3D shapes, converting between metric units, mean, median, mode and range, pie charts and line graphs. Cambridge key vocabulary: long multiplication, long division, percentage, ratio, proportion, algebra, function machine, equation, sequence, compound shape, net, mean, mode, median.`,
    'ป.6': `Cambridge Primary Mathematics Stage 6: Negative numbers in real contexts, order of operations (BIDMAS), complex fractions, decimals and percentages interchangeably, ratio and proportion, algebraic expressions and formulae with two variables, geometry (properties of circles — radius, diameter, circumference; angles in polygons; transformations — reflection, rotation, translation, enlargement), volume of cuboids and prisms, probability on a 0–1 scale, interpreting and constructing complex statistical charts. Cambridge key vocabulary: BIDMAS, order of operations, algebraic expression, formula, variable, radius, diameter, circumference, transformation, reflection, rotation, translation, volume, probability.`,
  },
  'วิทยาศาสตร์': {
    'ป.1': `Cambridge Primary Science Stage 1 (enquiry-based approach — observe, question, predict, test, record, conclude): Plants (parts of a plant, what plants need to grow), animals (groups and features — mammals, birds, fish, reptiles, insects), humans (body parts and the five senses), materials and their properties (hard/soft, rough/smooth, shiny/dull), pushes and pulls as forces, light and dark. Cambridge key vocabulary: observe, predict, investigate, record, conclusion, living, non-living, sense organ, material, property, push, pull.`,
    'ป.2': `Cambridge Primary Science Stage 2: Living things and their habitats (what living things need, local habitats), simple food chains (producer, consumer, predator, prey), plants (growth conditions, germination), materials and changes (heating and cooling — melting, freezing; dissolving; reversible changes), light (sources, shadows, reflections), forces (magnets and magnetic materials, floating and sinking). Cambridge key vocabulary: habitat, food chain, producer, consumer, predator, prey, germination, dissolve, reversible, magnetic, poles, float, sink.`,
    'ป.3': `Cambridge Primary Science Stage 3: Humans — skeleton (bones and joints), muscles, teeth types (incisors, canines, molars) and dental hygiene, nutrition and balanced diet (food groups and nutrients); plants — photosynthesis basics, pollination and seed dispersal; rocks and soils (rock types, fossil formation, soil composition); light (reflection, how we see objects, shadows); forces (friction — surfaces affect movement, effects of forces on objects). Cambridge key vocabulary: skeleton, joint, muscle, incisor, canine, molar, nutrient, balanced diet, photosynthesis, pollination, seed dispersal, reflection, friction, variable, fair test.`,
    'ป.4': `Cambridge Primary Science Stage 4: Animals — classification (vertebrates: mammals, birds, reptiles, amphibians, fish; invertebrates: insects, spiders, worms), adaptation to habitats; digestive system (organs and process from mouth to intestines); states of matter (solids, liquids, gases — particle theory, changes of state, the water cycle — evaporation, condensation, precipitation); simple electrical circuits (components, symbols, conductors and insulators); sound (vibrations cause sound, how sound travels, pitch and volume, musical instruments). Cambridge key vocabulary: vertebrate, invertebrate, adaptation, digestion, state of matter, particle, evaporation, condensation, water cycle, circuit, conductor, insulator, vibration, pitch, volume.`,
    'ป.5': `Cambridge Primary Science Stage 5: Life cycles of plants and animals (comparing life cycles — mammals, birds, insects, amphibians), human reproduction and puberty; mixtures and separation methods (filtering, evaporating, sieving, magnetic separation), reversible and irreversible changes; Earth and space (solar system — planets in order, Sun, Moon; day and night; seasons; the Moon's phases); forces (gravity — weight vs mass, friction, air resistance, water resistance, upthrust/buoyancy). Cambridge key vocabulary: life cycle, puberty, mixture, solution, filter, evaporate, sieve, reversible, irreversible, solar system, orbit, gravity, weight, mass, air resistance, upthrust.`,
    'ป.6': `Cambridge Primary Science Stage 6: Interdependence (food webs, impact of environmental change on ecosystems); microorganisms (bacteria, viruses, fungi — helpful examples: yeast, antibiotics; harmful: disease); classification systems (using classification keys, kingdoms); light (refraction — bending of light, spectrum and colour, the human eye); electricity (series and parallel circuits, effect of changing voltage and number of components, circuit diagrams using symbols); evolution and inheritance (Darwin, natural selection, adaptation over generations). Cambridge key vocabulary: interdependence, food web, ecosystem, microorganism, classification key, kingdom, refraction, spectrum, series circuit, parallel circuit, voltage, resistance, evolution, natural selection, inheritance, adaptation.`,
  },
  'ภาษาอังกฤษ': {
    'ป.1': `Cambridge Primary English Stage 1: Phonological awareness (rhyme, syllables, phoneme blending and segmenting), letter-sound correspondence (grapheme-phoneme correspondences), decoding simple CVC words, high-frequency sight words, reading aloud with simple expression, writing simple sentences with capital letters and full stops, forming letters correctly (ascenders and descenders), speaking clearly in sentences, listening and responding to stories, vocabulary building through themed topics. Cambridge key vocabulary: phoneme, grapheme, blend, segment, decode, sight word, syllable, capital letter, full stop.`,
    'ป.2': `Cambridge Primary English Stage 2: Reading simple books with expression and understanding, punctuation (question marks, exclamation marks, commas in lists), word classes — nouns, verbs, adjectives and their functions, expanded noun phrases to describe, simple and compound sentences using and/but/so, writing recounts using time connectives (first, next, then, after that, finally) and simple stories with beginning/middle/end, speaking and listening — taking turns, asking questions, Cambridge key vocabulary: noun, verb, adjective, expanded noun phrase, compound sentence, conjunction, recount, time connective, expression.`,
    'ป.3': `Cambridge Primary English Stage 3: Reading and responding to fiction (characters, plot, setting) and non-fiction (skimming and scanning, features of information texts), paragraphs to organise ideas, speech marks for direct speech, subordinating conjunctions (because, although, when, while, before, after), adverbs of manner, time and frequency, writing instructions (imperative verbs, numbered steps, subheadings) and non-chronological reports, inference and prediction strategies, dictionary and thesaurus skills. Cambridge key vocabulary: conjunction, subordinate clause, adverb, speech marks, paragraph, imperative, instruction text, non-chronological report, inference, prediction, skim, scan.`,
    'ป.4': `Cambridge Primary English Stage 4: Reading a range of genres (adventure, mystery, poetry, playscripts) and analysing language choices, inference and deduction from textual evidence, figurative language (similes, metaphors, personification, alliteration), verb tenses (simple, continuous, perfect), relative clauses (who, which, that), writing persuasive letters and non-chronological reports, planning, drafting and editing, note-making strategies. Cambridge key vocabulary: simile, metaphor, personification, alliteration, inference, deduction, tense, relative clause, persuasion, non-chronological report, draft, edit.`,
    'ป.5': `Cambridge Primary English Stage 5: Analysing novels and poetry (themes, characterisation, narrative viewpoint, author's language choices for effect), passive voice and why writers use it, conditional sentences (first and second conditional), reported speech, modal verbs (could, would, should, might, must) to express degrees of certainty, formal and informal register, writing balanced arguments and literary responses, summarising and paraphrasing, speaking for different purposes and audiences. Cambridge key vocabulary: passive voice, active voice, conditional sentence, reported speech, modal verb, formal register, informal register, balanced argument, literary response, summarise, paraphrase, narrative viewpoint.`,
    'ป.6': `Cambridge Primary English Stage 6: Critical reading — identifying author's perspective, bias and purpose; analysing how language and structure create meaning (irony, symbolism, allegory); complex grammar — subjunctive mood, participial phrases, cohesive devices (pronouns, synonyms, connectives, adverbials) for coherence across a text; writing for a wide range of purposes and audiences with consistent and appropriate style; evaluating, synthesising and comparing information from multiple sources; précis writing. Cambridge key vocabulary: perspective, bias, irony, symbolism, subjunctive, participial phrase, cohesive device, coherence, synthesise, précis, audience, purpose, style, evaluate.`,
  },
  'ภาษาไทย': {
    'ป.1': `Thai Language Year 1 (Thai National Curriculum): Reading Thai consonants (พยัญชนะ 44 ตัว), vowels (สระ) and tonal marks (วรรณยุกต์); blending syllables (การแจกลูก); recognising high/mid/low class consonants; simple words and short sentences; writing consonants correctly; basic reading comprehension of short 2–3 sentence texts; listening and speaking in everyday contexts. Key vocabulary: พยัญชนะ, สระ, วรรณยุกต์, การแจกลูก, มาตราตัวสะกด, อักษรสูง, อักษรกลาง, อักษรต่ำ.`,
    'ป.2': `Thai Language Year 2 (Thai National Curriculum): Thai spelling rules — the 8 spelling patterns (มาตราตัวสะกด: แม่กก กด กน กม เกย เกอว กง กบ); reading words with all tonal marks correctly; silent letters (ตัวการันต์); reading short stories and simple poems; writing short paragraphs; understanding word meaning from context; homophones (คำพ้องเสียง) and synonyms (คำพ้องความหมาย). Key vocabulary: มาตราตัวสะกด, ตัวสะกด, ตัวการันต์, คำพ้องเสียง, คำพ้องความหมาย.`,
    'ป.3': `Thai Language Year 3 (Thai National Curriculum): Reading comprehension — identifying the main idea (จับใจความสำคัญ); parts of speech — nouns (คำนาม), verbs (คำกริยา), adjectives (คำวิเศษณ์), pronouns (คำสรรพนาม); writing structured paragraphs; Thai proverbs (สุภาษิต) and idioms (สำนวน); simple compound sentences; reading Thai folk tales and children's literature. Key vocabulary: จับใจความ, คำนาม, คำกริยา, คำวิเศษณ์, คำสรรพนาม, สำนวน, สุภาษิต, วรรณกรรม.`,
    'ป.4': `Thai Language Year 4 (Thai National Curriculum): Reading analysis and summarising (ย่อความ); types of words and their functions in sentences; compound and complex sentences; introduction to Thai classical literature (วรรณคดี) — simple poems and folk tales; formal vs informal language register; functional writing — letters, notices, invitations. Key vocabulary: ย่อความ, ประโยคซับซ้อน, วรรณคดี, ภาษาทางการ, ภาษาไม่ทางการ, จดหมาย, ประกาศ.`,
    'ป.5': `Thai Language Year 5 (Thai National Curriculum): Critical reading and evaluating texts; essay writing (เรียงความ); persuasive writing; Thai figures of speech and literary devices (โวหาร — บรรยายโวหาร พรรณนาโวหาร อุปมาโวหาร); royal vocabulary (คำราชาศัพท์); reading Thai classical literature and poetry. Key vocabulary: เรียงความ, โวหาร, คำราชาศัพท์, การโน้มน้าว, วรรณกรรม, อุปมา, อุปมัย.`,
    'ป.6': `Thai Language Year 6 (Thai National Curriculum): Literary analysis — themes, characters, and language in Thai classical works; writing formal reports (รายงาน) and academic texts; speech and presentation skills; evaluating texts for bias and perspective; Thai poetry forms (โคลง ฉันท์ กาพย์ กลอน); higher-order comprehension — inference, evaluation, and synthesis. Key vocabulary: รายงาน, โคลง, กลอน, ฉันท์, กาพย์, การวิเคราะห์วรรณกรรม, ทัศนะ, การนำเสนอ.`,
  },
  'สังคมศึกษา': {
    'ป.1': `Social Studies Year 1 (Thai National Curriculum): Family and community (ครอบครัวและชุมชน) — roles and responsibilities of family members; basic directions (ทิศ) and simple map reading; important Thai festivals and traditions (วันสำคัญและประเพณีไทย); introduction to Buddhism — the Buddha's life story and the Five Precepts (ศีล 5); caring for people around us. Key vocabulary: ครอบครัว, ชุมชน, ทิศ, ประเพณี, วันสำคัญ, ศีล 5, วัด.`,
    'ป.2': `Social Studies Year 2 (Thai National Curriculum): Community and society — local occupations (อาชีพในชุมชน) and how they serve each other; local natural resources (ทรัพยากรในท้องถิ่น); simple maps of school and neighbourhood; Thai calendar and important national dates; basic environmental care (การรักษาสิ่งแวดล้อม); saving and spending money. Key vocabulary: อาชีพ, ทรัพยากร, แผนที่, สิ่งแวดล้อม, ปฏิทิน, การออม.`,
    'ป.3': `Social Studies Year 3 (Thai National Curriculum): Province and region (จังหวัดและภูมิภาค) — Thailand's 6 regions; natural resources in Thailand; sufficiency economy philosophy (ปรัชญาเศรษฐกิจพอเพียง) of King Rama IX; local history and cultural heritage; Thai national symbols (ธงชาติ ตราแผ่นดิน เพลงชาติ). Key vocabulary: จังหวัด, ภูมิภาค, ทรัพยากรธรรมชาติ, เศรษฐกิจพอเพียง, สัญลักษณ์ประจำชาติ, มรดกทางวัฒนธรรม.`,
    'ป.4': `Social Studies Year 4 (Thai National Curriculum): Thailand and neighbouring ASEAN countries — geography, capitals, and culture; Thailand's physical geography (mountains, rivers, plains); production and consumption (การผลิตและการบริโภค) and supply/demand basics; Buddhism — the Triple Gem (พระรัตนตรัย), the Five Precepts, and important Buddhist figures; civic duties and rights of Thai citizens. Key vocabulary: ภูมิศาสตร์, การผลิต, การบริโภค, พระรัตนตรัย, สิทธิ, หน้าที่พลเมือง, อาเซียน.`,
    'ป.5': `Social Studies Year 5 (Thai National Curriculum): Asia and the world — physical and human geography; natural resources, environment and sustainability; Thai history — the Sukhothai (สุโขทัย), Ayutthaya (อยุธยา) and early Rattanakosin (รัตนโกสินทร์) kingdoms; democracy and Thai government structure; global issues — climate change, poverty. Key vocabulary: ประวัติศาสตร์, สุโขทัย, อยุธยา, รัตนโกสินทร์, ประชาธิปไตย, รัฐสภา, การเปลี่ยนแปลงสภาพภูมิอากาศ.`,
    'ป.6': `Social Studies Year 6 (Thai National Curriculum): Thai and world history — key events and their impact; world geography and major biomes; global economy, trade and Thailand's role; international relations and organisations (UN, ASEAN); environmental sustainability and human responsibility; human rights and global citizenship; Thai civic values and constitutional monarchy. Key vocabulary: ประวัติศาสตร์โลก, เศรษฐกิจโลก, การค้าระหว่างประเทศ, สิทธิมนุษยชน, พลเมืองโลก, การพัฒนาอย่างยั่งยืน.`,
  },
};

function getCurriculumContext(subject, year, curriculum) {
  const data = curriculum === 'cambridge' ? CAMBRIDGE_CURRICULUM : OXFORD_CURRICULUM;
  return data[subject]?.[year] || '';
}

function buildUserMessage(subject, year, topic, context, imageCount, curriculum) {
  let msg = `วิชา: ${subject}\nชั้นปี: ${year}\nหัวข้อการบ้าน: ${topic}`;
  if (context) msg += `\nข้อมูลเพิ่มเติม: ${context}`;

  const curriculumName = curriculum === 'cambridge' ? 'Cambridge Primary' : 'Oxford International Primary';
  const curriculumCtx = getCurriculumContext(subject, year, curriculum);
  if (curriculumCtx) {
    msg += `\n\nCurriculum context (${curriculumName}) for this year and subject:\n${curriculumCtx}\nUse the correct ${curriculumName} terminology from above. Reference how this topic fits into what children this age are building on at ${curriculumName} level.`;
  }

  if (imageCount > 0) {
    msg += `\n\nI have attached ${imageCount} photo${imageCount > 1 ? 's' : ''} of the worksheet${imageCount > 1 ? 's' : ''}. IMPORTANT: Go through EVERY question visible across ALL photos — do not stop after the first question. Work through each one systematically using the actual content shown. Make your examples specific to what is on the page.`;
  }

  msg += `\n\nกรุณาเขียนโพสต์ LINE OA สำหรับผู้ปกครองค่ะ`;
  return msg;
}

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { subject, year, topic, context, language = 'thai', curriculum = 'oxford', images = [], shortMode = false, fullText = '', weeklyMode = false, weeklyTopics = [] } = body;

  if (weeklyMode) {
    const curricName = curriculum === 'cambridge' ? 'Cambridge Primary' : 'Oxford International Primary';
    const topicList = weeklyTopics.map(t => `• ${t.subject}: ${t.topic}`).join('\n');

    const weeklySystem = language === 'english'
      ? `You are Mae Pla, a warm and friendly mum at an international school in Thailand. Write a WEEKLY ROUNDUP post for the school's LINE OA group in ENGLISH to help parents understand what their children studied this week across multiple subjects. IMPORTANT: For each subject, reference the specific lesson name or story title provided — do not replace it with a generic description. For example if the topic says "The Birthday story – past tense", mention "The Birthday story" by name and explain what past tense means in that context. Structure: warm greeting, then cover each subject with a brief friendly explanation (2–3 sentences each), a simple home activity they can do together, and a warm closing. Aim for 350–450 words.`
      : language === 'both'
      ? `คุณคือแม่ปลา เขียน WEEKLY ROUNDUP สองภาษา (ไทยก่อน แล้วตามด้วยอังกฤษ) สรุปการเรียนรู้ประจำสัปดาห์ครอบคลุมทุกวิชา สำคัญมาก: ให้ระบุชื่อบทเรียน ชื่อเรื่อง หรือหัวข้อที่ให้มาโดยตรง ห้ามเปลี่ยนเป็นคำทั่วไป เช่น ถ้าหัวข้อคือ "นิทานวันเกิด – past tense" ให้พูดถึง "นิทานวันเกิด" โดยตรง อบอุ่น เป็นกันเอง ใช้ ค่ะ/นะคะ ประมาณ 400–500 คำต่อภาษา`
      : `คุณคือแม่ปลา (Mae Pla) คุณแม่ใจดีประจำโรงเรียน เขียนโพสต์ WEEKLY ROUNDUP สำหรับกลุ่ม LINE OA เป็นภาษาไทย สรุปการเรียนรู้ของลูกในสัปดาห์นี้ครอบคลุมทุกวิชาที่ได้เรียน สำคัญมาก: ให้ระบุชื่อบทเรียน ชื่อเรื่อง หรือหัวข้อที่ให้มาโดยตรงในแต่ละวิชา ห้ามเปลี่ยนเป็นคำทั่วๆ ไป เช่น ถ้าภาษาอังกฤษคือ "The Birthday story – past tense" ให้พูดถึง "The Birthday story" โดยตรง โครงสร้าง: ทักทายอบอุ่น → อธิบายแต่ละวิชาสั้นๆ อบอุ่น 2–3 ประโยค พร้อมชื่อบทเรียน → กิจกรรมง่ายๆ ที่ทำที่บ้านได้สัปดาห์นี้ → ปิดท้ายอบอุ่น ใช้ ค่ะ/นะคะ ตลอด ประมาณ 350–450 คำ`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = client.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 1200,
            system: weeklySystem,
            messages: [{
              role: 'user',
              content: `ชั้นปี: ${year}\nหลักสูตร: ${curricName}\n\nวิชาและหัวข้อสัปดาห์นี้:\n${topicList}\n\nกรุณาเขียน Weekly Roundup ค่ะ`,
            }],
          });
          for await (const event of messageStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' },
    });
  }

  if (!shortMode && (!topic || !topic.trim())) {
    return new Response(JSON.stringify({ error: 'กรุณาระบุหัวข้อการบ้าน' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (shortMode) {
    const shortSystem = language === 'english'
      ? `You are Mae Pla, a warm school communication assistant. Write a SHORT teaser post (3–4 lines maximum) summarising the homework topic for a LINE group message. It should be warm, friendly, end with an invitation to read the full post or check the worksheet. No bullet points, no sections — just a flowing friendly mini-message. Do not add any explanation or preamble, just the post itself.`
      : language === 'both'
      ? `คุณคือแม่ปลา เขียนโพสต์สั้น 3–4 บรรทัด สรุปการบ้านในสองภาษา (ไทยก่อน แล้วตามด้วยอังกฤษ) สำหรับกลุ่ม LINE อบอุ่น เป็นกันเอง ลงท้ายด้วยการเชิญชวนให้อ่านโพสต์เต็มค่ะ`
      : `คุณคือแม่ปลา เขียนโพสต์สั้นๆ 3–4 บรรทัด สำหรับกลุ่ม LINE สรุปการบ้านให้ผู้ปกครองทราบ อบอุ่น เป็นกันเอง ใช้ ค่ะ/นะคะ ลงท้ายด้วยการเชิญชวนให้อ่านโพสต์เต็มนะคะ ห้ามใช้หัวข้อย่อยหรือรายการ — เขียนเป็นย่อหน้าเดียวลื่นไหลค่ะ`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = client.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 200,
            system: shortSystem,
            messages: [{ role: 'user', content: `Here is the full post — please write the short version:\n\n${fullText}` }],
          });
          for await (const event of messageStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          system: getSystemPrompt(language, curriculum),
          messages: [
            {
              role: 'user',
              content: images.length > 0
                ? [
                    ...images.map(img => ({
                      type: 'image',
                      source: { type: 'base64', media_type: img.type || 'image/jpeg', data: img.base64 },
                    })),
                    {
                      type: 'text',
                      text: buildUserMessage(subject, year, topic, context, images.length, curriculum),
                    },
                  ]
                : buildUserMessage(subject, year, topic, context, 0, curriculum),
            },
          ],
        });

        for await (const event of messageStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const data = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        const errData = `data: ${JSON.stringify({ error: error.message })}\n\n`;
        controller.enqueue(encoder.encode(errData));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
