import { FooterContainer } from "./style";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <FooterContainer>
      <div className="footer-inner">
        <div className="left">
          <span className="brand">🜲 BlogX</span> © {year} — Tous droits réservés
        </div>

        <nav className="footer-nav">
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/confidentialite">Confidentialité</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </FooterContainer>
  );
}

/* ============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — src/components/Footer/index.tsx
-------------------------------------------------------------------------------

Objectif :
-----------
Créer un pied de page réutilisable et cohérent avec le thème sombre bleuté.

Points clés :
--------------
- Le footer reste **minimaliste et lisible**, sans surcharger l’interface.
- L’année s’actualise automatiquement avec `new Date().getFullYear()`.
- Les liens sont gérés via `react-router-dom` (`<Link>`), cohérent avec ton routing SPA.
- Le style repose entièrement sur `FooterContainer` défini dans `style.ts`.

Structure :
------------
<footer>
  <div className="footer-inner">
    <div className="left">Nom du site + année</div>
    <nav className="footer-nav">Liens secondaires</nav>
  </div>
</footer>
============================================================================ */
