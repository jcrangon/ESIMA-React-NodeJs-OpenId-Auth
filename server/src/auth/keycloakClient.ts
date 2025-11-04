// src/auth/keycloakOidc.ts
import * as oidc from "openid-client";

let configPromise: Promise<oidc.Configuration> | null = null;

export async function getKeycloakConfig(): Promise<oidc.Configuration> {
  if (!configPromise) {
    const issuerUrl = new URL(process.env.KEYCLOAK_ISSUER_URL!); // ex: http://localhost:8082/realms/demo-realm
    const clientId = process.env.KEYCLOAK_CLIENT_ID!;
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || undefined;

    // ✅ En dev (HTTP), on doit dire explicitement à openid-client
    //   d'accepter les requêtes non-HTTPS.
    const options =
      issuerUrl.protocol === "http:"
        ? { execute: [oidc.allowInsecureRequests] } // deprecié mais prévu pour le dev.
        : undefined;

    configPromise = oidc.discovery(
      issuerUrl,
      clientId,
      clientSecret,
      undefined, // clientAuthentication, on laisse par défaut
      options    // ⚠️ c'est ici qu'on met allowInsecureRequests
    );
  }
  return configPromise;
}

export async function createPkceAndState() {
  const code_verifier = oidc.randomPKCECodeVerifier();
  const code_challenge = await oidc.calculatePKCECodeChallenge(code_verifier);
  const state = oidc.randomState();

  return { code_verifier, code_challenge, state };
}
