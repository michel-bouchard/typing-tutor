const fs = require('fs');

const enSubjects = ["The player", "My friend", "A noob", "The pro", "Our squad", "A hacker", "The builder", "My avatar", "The brave knight", "A wild animal", "The team leader", "A sneaky ninja"];
const enVerbs = ["found", "built", "jumped over", "ran away from", "collected", "destroyed", "hid behind", "explored", "discovered", "unlocked", "defended", "upgraded"];
const enObjects = ["the loot llama.", "a huge castle.", "the shiny coins.", "a rare pet.", "the storm.", "a secret base.", "the tilted towers.", "ninety nine nights in the forest.", "the boss monster.", "a legendary chest.", "the magical potion.", "the high score."];

const frSubjects = ["Le joueur", "Mon ami", "Un noob", "Le pro", "Notre équipe", "Un hackeur", "Le constructeur", "Mon avatar", "Le brave chevalier", "Un animal sauvage", "Le chef d'équipe", "Un ninja furtif"];
const frVerbs = ["a trouvé", "a construit", "a sauté par-dessus", "a fui", "a collecté", "a détruit", "s'est caché derrière", "a exploré", "a découvert", "a débloqué", "a défendu", "a amélioré"];
const frObjects = ["le lama de butin.", "un immense château.", "les pièces brillantes.", "un familier rare.", "la tempête.", "une base secrète.", "les tours inclinées.", "quatre-vingt-dix-neuf nuits dans la forêt.", "le monstre boss.", "un coffre légendaire.", "la potion magique.", "le meilleur score."];

const esSubjects = ["El jugador", "Mi amigo", "Un novato", "El pro", "Nuestro equipo", "Un hacker", "El constructor", "Mi avatar", "El caballero valiente", "Un animal salvaje", "El líder del equipo", "Un ninja sigiloso"];
const esVerbs = ["encontró", "construyó", "saltó sobre", "huyó de", "recogió", "destruyó", "se escondió detrás de", "exploró", "descubrió", "desbloqueó", "defendió", "mejoró"];
const esObjects = ["la llama de botín.", "un castillo enorme.", "las monedas brillantes.", "una mascota rara.", "la tormenta.", "una base secreta.", "las torres inclinadas.", "noventa y nueve noches en el bosque.", "el monstruo jefe.", "un cofre legendario.", "la poción mágica.", "la mejor puntuación."];

const itSubjects = ["Il giocatore", "Il mio amico", "Un principiante", "Il professionista", "La nostra squadra", "Un hacker", "Il costruttore", "Il mio avatar", "Il cavaliere coraggioso", "Un animale selvaggio", "Il leader della squadra", "Un ninja furtivo"];
const itVerbs = ["ha trovato", "ha costruito", "ha saltato", "è fuggito da", "ha raccolto", "ha distrutto", "si è nascosto dietro", "ha esplorato", "ha scoperto", "ha sbloccato", "ha difeso", "ha potenziato"];
const itObjects = ["il lama del bottino.", "un enorme castello.", "le monete scintillanti.", "un animale domestico raro.", "la tempesta.", "una base segreta.", "le torri inclinate.", "novantanove notti nella foresta.", "il mostro boss.", "uno scrigno leggendario.", "la pozione magica.", "il punteggio massimo."];

function generate(subs, verbs, objs, count) {
  const result = new Set();
  while(result.size < count) {
    const s = subs[Math.floor(Math.random() * subs.length)];
    const v = verbs[Math.floor(Math.random() * verbs.length)];
    const o = objs[Math.floor(Math.random() * objs.length)];
    result.add(`${s} ${v} ${o}`);
  }
  return Array.from(result);
}

const enNew = generate(enSubjects, enVerbs, enObjects, 250);
const frNew = generate(frSubjects, frVerbs, frObjects, 250);
const esNew = generate(esSubjects, esVerbs, esObjects, 250);
const itNew = generate(itSubjects, itVerbs, itObjects, 250);

const fileContent = `export const sentences = {
  en: [
    "I love to play Roblox with my friends.",
    "Can we drop at Tilted Towers in Fortnite?",
    "I survived 99 nights in the forest.",
    "My avatar has a really cool pet dragon.",
    "Watch out for the storm circle closing in!",
    "We need to gather more wood and brick.",
    "I traded my legendary sword for a potion.",
    "Let's build a huge fort to stay safe.",
    ${enNew.map(s => `"${s}"`).join(',\n    ')}
  ],
  fr: [
    "J'adore jouer à Roblox avec mes amis.",
    "Pouvons-nous atterrir à Tilted Towers dans Fortnite ?",
    "J'ai survécu 99 nuits dans la forêt.",
    "Mon avatar a un dragon de compagnie vraiment cool.",
    "Attention au cercle de la tempête qui se referme !",
    "Nous devons rassembler plus de bois et de briques.",
    "J'ai échangé mon épée légendaire contre une potion.",
    "Construisons un immense fort pour rester en sécurité.",
    ${frNew.map(s => `"${s}"`).join(',\n    ')}
  ],
  es: [
    "Me encanta jugar a Roblox con mis amigos.",
    "¿Podemos caer en Pisos Picados en Fortnite?",
    "Sobreviví 99 noches en el bosque.",
    "Mi avatar tiene un dragón mascota muy genial.",
    "¡Cuidado con el círculo de la tormenta que se acerca!",
    "Necesitamos recolectar más madera y ladrillos.",
    "Cambié mi espada legendaria por una poción.",
    "Construyamos un fuerte enorme para mantenernos a salvo.",
    ${esNew.map(s => `"${s}"`).join(',\n    ')}
  ],
  it: [
    "Adoro giocare a Roblox con i miei amici.",
    "Possiamo atterrare a Pinnacoli Pendenti su Fortnite?",
    "Sono sopravvissuto 99 notti nella foresta.",
    "Il mio avatar ha un drago domestico davvero fantastico.",
    "Attenzione al cerchio della tempesta che si chiude!",
    "Dobbiamo raccogliere più legno e mattoni.",
    "Ho scambiato la mia spada leggendaria per una pozione.",
    "Costruiamo un enorme forte per stare al sicuro.",
    ${itNew.map(s => `"${s}"`).join(',\n    ')}
  ]
};
`;

fs.writeFileSync('src/data/sentences.ts', fileContent);
console.log('Successfully generated 1000 new sentences for EN, FR, ES, and IT!');
