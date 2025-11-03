import { useNavigate } from "react-router-dom";
import {
  PageContainer,
  Card,
  Title,
  Subtitle,
  SectionTitle,
  Text,
  BulletList,
  BulletItem,
  SmallText,
  BackButton,
} from "./style";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Card>
        <Title>Politique de Confidentialité</Title>
        <Subtitle>
          Version fictive – Projet démo Blog (exemple RGPD simplifié)
        </Subtitle>

        <Text>
          Cette page explique comment vos données personnelles seraient traitées
          si ce site était en production. Comme il s’agit d’un projet
          pédagogique, aucune donnée réelle n’est exploitée à des fins
          commerciales.
        </Text>

        {/* 1. Responsable du traitement */}
        <SectionTitle>1. Responsable du traitement</SectionTitle>
        <Text>
          Responsable : <strong>ACME Démo SARL</strong>
          <br />
          Adresse : 10 rue de l’Exemple, 75000 Paris
          <br />
          Contact : privacy@acme-demo.example
        </Text>

        {/* 2. Données collectées */}
        <SectionTitle>2. Données personnelles collectées</SectionTitle>
        <Text>
          Dans un contexte réel, nous pourrions collecter différents types de
          données personnelles, par exemple :
        </Text>

        <BulletList>
          <BulletItem>
            <strong>Identité :</strong> nom, prénom, pseudo.
          </BulletItem>
          <BulletItem>
            <strong>Contact :</strong> email, éventuellement numéro de
            téléphone.
          </BulletItem>
          <BulletItem>
            <strong>Compte :</strong> identifiant utilisateur, mot de passe
            (haché), rôles/autorisations.
          </BulletItem>
          <BulletItem>
            <strong>Usage :</strong> articles publiés, commentaires,
            préférences d’affichage.
          </BulletItem>
          <BulletItem>
            <strong>Données techniques :</strong> adresse IP, agent
            utilisateur, logs de connexion (sécurité anti-abus).
          </BulletItem>
        </BulletList>

        <Text>
          Dans le projet actuel, certaines de ces informations peuvent exister
          dans la base (users, posts), mais elles ne sont utilisées ici qu’à
          des fins de test/développement.
        </Text>

        {/* 3. Finalités */}
        <SectionTitle>3. Finalités du traitement</SectionTitle>
        <Text>Les données, en production, serviraient à :</Text>

        <BulletList>
          <BulletItem>
            <strong>Créer et gérer un compte utilisateur,</strong> permettre la
            connexion, la modification du profil, la publication de contenu.
          </BulletItem>
          <BulletItem>
            <strong>Assurer la sécurité,</strong> par exemple détecter les
            connexions suspectes, prévenir le spam et l’abus.
          </BulletItem>
          <BulletItem>
            <strong>Améliorer le service,</strong> en comprenant quelles pages
            sont utilisées, quelles fonctionnalités sont utiles, etc.
          </BulletItem>
          <BulletItem>
            <strong>Respecter les obligations légales,</strong> comme répondre
            à une demande d’autorité judiciaire en cas de contenu illicite.
          </BulletItem>
        </BulletList>

        {/* 4. Base légale */}
        <SectionTitle>4. Base légale (RGPD)</SectionTitle>
        <Text>
          Selon le Règlement Général sur la Protection des Données (RGPD), le
          traitement de vos données doit reposer sur une base légale claire.
          Typiquement :
        </Text>

        <BulletList>
          <BulletItem>
            <strong>Exécution du contrat :</strong> création et gestion de votre
            compte.
          </BulletItem>
          <BulletItem>
            <strong>Intérêt légitime :</strong> sécurité du service, lutte
            anti-fraude.
          </BulletItem>
          <BulletItem>
            <strong>Obligation légale :</strong> conservation de certaines
            traces techniques en cas d’enquête.
          </BulletItem>
          <BulletItem>
            <strong>Consentement :</strong> newsletters, cookies non essentiels,
            suivi marketing.
          </BulletItem>
        </BulletList>

        {/* 5. Cookies */}
        <SectionTitle>5. Cookies et traqueurs</SectionTitle>
        <Text>
          Le site peut utiliser des cookies techniques (connexion, session,
          panier, préférences d’interface) et, si vous l’acceptez, des cookies
          de mesure d’audience.
        </Text>
        <Text>
          En production, une bannière de consentement doit vous permettre de{" "}
          <strong>refuser les cookies non essentiels</strong> avant leur dépôt.
        </Text>

        {/* 6. Durée de conservation */}
        <SectionTitle>6. Durée de conservation des données</SectionTitle>
        <Text>
          Les données personnelles ne sont pas conservées indéfiniment.
          Exemple :
        </Text>

        <BulletList>
          <BulletItem>
            Données de compte : tant que le compte est actif + durée légale.
          </BulletItem>
          <BulletItem>
            Logs techniques de sécurité : quelques semaines à quelques mois,
            selon la politique interne.
          </BulletItem>
          <BulletItem>
            Données marketing : jusqu’au retrait du consentement.
          </BulletItem>
        </BulletList>

        <Text>
          Dans le cadre de ce projet démo, les données peuvent être réinitialisées
          à tout moment (reset BDD de dev, suppression des volumes Docker, etc.).
        </Text>

        {/* 7. Droits des utilisateurs */}
        <SectionTitle>7. Vos droits</SectionTitle>
        <Text>
          Conformément au RGPD, vous disposez notamment des droits suivants :
        </Text>

        <BulletList>
          <BulletItem>
            <strong>Droit d’accès :</strong> savoir quelles données nous avons
            sur vous.
          </BulletItem>
          <BulletItem>
            <strong>Droit de rectification :</strong> corriger des informations
            inexactes ou incomplètes.
          </BulletItem>
          <BulletItem>
            <strong>Droit à l’effacement :</strong> suppression du compte /
            retrait des contenus, sous conditions légales.
          </BulletItem>
          <BulletItem>
            <strong>Droit d’opposition :</strong> refus de certains usages
            (ex. prospection commerciale).
          </BulletItem>
          <BulletItem>
            <strong>Droit à la portabilité :</strong> récupération de vos
            données dans un format lisible.
          </BulletItem>
        </BulletList>

        <Text>
          Pour exercer ces droits dans un contexte réel : envoyez un email à{" "}
          <strong>privacy@acme-demo.example</strong> en joignant une preuve
          d’identité pour éviter l’usurpation.
        </Text>

        {/* 8. Sécurité */}
        <SectionTitle>8. Sécurité et stockage</SectionTitle>
        <Text>
          Nous mettons en place des mesures raisonnables de sécurité telles que
          le hachage des mots de passe, le chiffrement TLS, la restriction
          d’accès aux bases de données, la journalisation des accès admin, et
          l’isolation des environnements (dev / staging / prod).
        </Text>

        <Text>
          Attention : en environnement de développement, certaines
          sécurités peuvent être moins strictes (ex : logs verbeux, accès
          admin large). En production, ça doit être verrouillé.
        </Text>

        {/* 9. Contact DPO */}
        <SectionTitle>9. Délégué à la protection des données (DPO)</SectionTitle>
        <Text>
          Toute question relative à la protection des données peut être
          adressée à : dpo@acme-demo.example
        </Text>

        {/* 10. Mises à jour */}
        <SectionTitle>10. Mise à jour de cette politique</SectionTitle>
        <Text>
          Cette politique peut évoluer si nous ajoutons de nouvelles
          fonctionnalités (ex : messagerie privée, upload d’images, analytics).
          La version la plus récente sera toujours publiée sur cette page.
        </Text>

        <SmallText>
          Dernière mise à jour : 01/11/2025 (document fictif)
        </SmallText>

        <BackButton onClick={() => navigate(-1)}>← Retour</BackButton>
      </Card>
    </PageContainer>
  );
}

/*
RÉSUMÉ PÉDAGOGIQUE
- Cette page correspond à la future route /confidentialite ou /privacy-policy.
- On explique le traitement des données façon RGPD :
  responsable, finalités, conservation, droits utilisateur.
- IMPORTANT pour un vrai site :
  - il faut décrire précisément les cookies tiers, l’outil d’analytics utilisé,
    où sont hébergées les données (UE ? hors UE ?), et si tu as un DPO.
  - il faut décrire comment l'utilisateur peut exercer ses droits
    (adresse email ou formulaire dédié).
- Ici tout est fictif parce que ton app est un bac à sable pédagogique.
- Techniquement : même modèle que MentionsLegalesPage, on réutilise useNavigate()
  pour faire un bouton retour cohérent UX.
- Style : import "./style" exactement comme toutes les autres pages de ton projet.
*/
