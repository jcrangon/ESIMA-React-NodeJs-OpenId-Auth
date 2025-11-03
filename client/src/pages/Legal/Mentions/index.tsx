import { useNavigate } from "react-router-dom";
import {
  PageContainer,
  Card,
  Title,
  SectionTitle,
  Subtitle,
  Text,
  SmallText,
  BackButton,
} from "./style";

export default function MentionsLegalesPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Card>
        <Title>Mentions légales</Title>
        <Subtitle>Contenu fictif - Projet démo Blog</Subtitle>

        <Text>
          Le présent site (le "Site") est un projet pédagogique / démonstration
          front + API. Les informations affichées ci-dessous sont factices et ne
          constituent pas un conseil juridique.
        </Text>

        <SectionTitle>Éditeur du site</SectionTitle>
        <Text>
          Société : <strong>ACME Démo SARL</strong>
          <br />
          Siège social : 10 rue de l’Exemple, 75000 Paris
          <br />
          SIRET : 000 000 000 00000
          <br />
          Contact : contact@acme-demo.example
        </Text>

        <SectionTitle>Directeur de la publication</SectionTitle>
        <Text>
          Jean Dupont <br />
          Email : direction@acme-demo.example
        </Text>

        <SectionTitle>Hébergement</SectionTitle>
        <Text>
          Hébergeur : ExempleHost
          <br />
          Adresse : 1 Cloud Lane, 75001 Paris
          <br />
          Téléphone : +33 1 23 45 67 89
        </Text>

        <SectionTitle>Propriété intellectuelle</SectionTitle>
        <Text>
          L’ensemble des éléments visuels et textuels présents sur le Site
          (images, textes, logos, mise en page) est protégé par le droit de la
          propriété intellectuelle. Toute reproduction, même partielle, est
          interdite sans autorisation écrite préalable.
        </Text>

        <SectionTitle>Données personnelles</SectionTitle>
        <Text>
          Dans ce projet de démonstration, aucune donnée personnelle réelle
          n’est exploitée à des fins commerciales. En situation réelle, le
          responsable du traitement doit respecter le RGPD : base légale,
          finalité claire, durée de conservation limitée, chiffrement,
          journalisation des accès, etc.
        </Text>

        <SectionTitle>Cookies</SectionTitle>
        <Text>
          Le Site peut utiliser des cookies techniques (nécessaires au
          fonctionnement) et des cookies d’analyse (mesure d’audience). En
          production, l’utilisateur doit pouvoir refuser les cookies non
          essentiels avant leur dépôt.
        </Text>

        <SectionTitle>Limitation de responsabilité</SectionTitle>
        <Text>
          Le Site est fourni “tel quel”, sans garantie de disponibilité ni
          d’exactitude. L’éditeur ne pourra être tenu responsable des dommages
          directs ou indirects résultant de l’usage du Site.
        </Text>

        <SectionTitle>Mises à jour</SectionTitle>
        <Text>
          Le contenu de cette page peut être modifié à tout moment sans
          préavis. En production, toujours afficher la date de dernière mise à
          jour.
        </Text>

        <SmallText>Dernière mise à jour : 01/11/2025 (fictif)</SmallText>

        <BackButton onClick={() => navigate(-1)}>← Retour</BackButton>
      </Card>
    </PageContainer>
  );
}

/*
RÉSUMÉ PÉDAGOGIQUE
- Cette page correspond à la route /mentions-legales.
- Elle n'appelle pas l'API, pas besoin d'auth.
- On utilise useNavigate() pour offrir un bouton "Retour" cohérent UX.
- Tous les blocs (Éditeur / Hébergement / etc.) sont là pour ressembler
  à des vraies mentions légales françaises (éditeur, hébergeur, RGPD).
- Le contenu est volontairement FAUX (tu peux mettre tes vraies infos après).
- Le style vient du fichier style.ts, selon ta convention: chaque page a un dossier
  avec index.tsx + style.ts, thème sombre bleu.
*/
