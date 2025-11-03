// prisma/seed.cjs
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const pwdAdmin = await bcrypt.hash("Admin1234", 10);
  const pwdUser = await bcrypt.hash("User1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: pwdAdmin,
      role: "ROLE_ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Alice Example",
      password: pwdUser,
      role: "ROLE_USER",
    },
  });

  await prisma.post.createMany({
    data: [
      {
        title: "Bienvenue sur le blog",
        content: "Ceci est un premier post créé par l'admin.",
        coverUrl: null,
        authorId: admin.id,
      },
      {
        title: "Mon premier article",
        content: "Hello world, je suis Alice et j'adore écrire.",
        coverUrl: null,
        authorId: user.id,
      },
      {
        title: "Un post avec une image",
        content: "Regardez ma cover stylée.",
        coverUrl: "https://example.com/cover.jpg",
        authorId: user.id,
      },
    ],
  });

  console.log("✅ Seed terminé.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — seed.cjs (version JS)
===============================================================================

Pourquoi on passe en .cjs (CommonJS pur) ?
- Parce que `node prisma/seed.cjs` marche partout, même sous Windows/nvm.
- Plus besoin de `tsx`, plus besoin de ts-node, plus besoin de tsconfig dédié.

Pourquoi c'est fiable ?
- Prisma va juste lancer `node prisma/seed.cjs`.
- Il n'y a plus d'arguments `--project`, donc plus d'erreurs "bad option".
- On ne dépend plus de la résolution de binaire `.cmd` sous Windows.

Est-ce qu'on perd du typage ?
- Uniquement dans ce script de seed.
- Le reste de ton projet backend reste 100% TypeScript typé.
- C'est un trade-off classique en prod: le seeding peut être en JS buildé.

Comment on le maintient ?
- Quand tu modifies ton modèle Prisma (User/Post...), tu répercuteras les champs ici aussi.
============================================================================= */
