import { parserFactureUniverselle } from './receipt-parser';

const testReceipt = `L'IMAGINAIRE
ST-BRUNO
1 Boulevard des Promenades
Saint-Bruno-de-Montarville, J3V 5J5
450-286-5389
www.imaginaire.com
20 janvier 2025, 14:20:55
Client : VENTE COMPTANT
Facture # : 380009488
Employé/ée: 1733 - Nicholas
Caisse # : 38
DISNEY LORCANA - BOOSTER PACK
7.99$
4050368983466
DISNEY LORCANA - BOOSTER PACK
7.99$
4050368983466
MAGIC THE GATHERING - PAQUET
6.49$
0195166261775
MAGIC THE GATHERING - PAQUET
6.49$
0195166261775
SOUS-TOTAL
28.96$
TPS
0.00$
TVQ
2.89$
4 Article(s)
TOTAL
31.85$
INTERAC
31.85$`;

function testParserFacture() {
  console.log('=== DÉBUT DU TEST ===\n');
  
  const facture = parserFactureUniverselle(testReceipt);
  
  console.log('Vendeur :');
  console.log('- Nom attendu     :', "L'Imaginaire");
  console.log('- Nom obtenu      :', facture.vendeur.nom);
  console.log('- Adresse obtenue :', facture.vendeur.adresse);
  console.log('- Site web obtenu :', facture.vendeur.site_web);
  
  console.log('\nFacture :');
  console.log('- Numéro :', facture.numero);
  console.log('- Date   :', facture.date_emission);
  
  console.log('\nArticles :');
  facture.articles.forEach((article, index) => {
    console.log(`\nArticle ${index + 1}:`);
    console.log('- Description  :', article.description);
    console.log('- Prix unit.  :', article.prix_unitaire.toFixed(2) + '$');
    console.log('- Quantité    :', article.quantite);
    console.log('- Total       :', article.total.toFixed(2) + '$');
  });
  
  console.log('\nMontants :');
  console.log('- Sous-total attendu :', '28.96$');
  console.log('- Sous-total obtenu  :', facture.sous_total?.toFixed(2) + '$');
  console.log('- TPS attendue       :', '0.00$');
  console.log('- TPS obtenue        :', facture.taxes?.['TPS']?.toFixed(2) + '$');
  console.log('- TVQ attendue       :', '2.89$');
  console.log('- TVQ obtenue        :', facture.taxes?.['TVQ']?.toFixed(2) + '$');
  console.log('- Total attendu      :', '31.85$');
  console.log('- Total obtenu       :', facture.total_general?.toFixed(2) + '$');
  
  console.log('\nPaiement :');
  console.log('- Mode attendu   :', 'INTERAC');
  console.log('- Mode obtenu    :', facture.paiement?.mode);
  console.log('- Montant obtenu :', facture.paiement?.montant?.toFixed(2) + '$');
  
  if (facture.metadata?.warnings?.length) {
    console.log('\nAvertissements :', facture.metadata.warnings);
  }

  console.log('\nDonnées brutes :');
  console.log(JSON.stringify(facture, null, 2));
  
  console.log('\n=== FIN DU TEST ===');
}

// Exécuter le test
testParserFacture();

// Export par défaut vide pour éviter l'avertissement
export default {}; 