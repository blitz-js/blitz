import type { MyLocale } from "."

export const table: MyLocale = {
  locale: "Français",
  home: {
    logout: "Deconnexion",
    userId: "Id",
    userRole: "Role",
    signUp: "Créez un compte",
    login: "Connexion",
    welcome: {
      part1: "Bravo!",
      part2:
        " Votre application est prête, incluant la création de compte utilisateurs et la connexion.",
    },
    paragraph: {
      line1: "Pour rajouter un modèle à votre application,",
      line2: "exécutez ce qui suit dans votre terminal:",
    },
    code: "blitz generate all project name:string",
    parenthesis: '(Et sélectionnez "Yes to run prisma migrate")',
    restart: {
      part1: "Ensuite ",
      part2: "redémarrez le serveur",
    },
    goto: "et allez sur",
    project: "/projects",
    documentationLink: "Documentation",
    githubLink: "Github",
    discordLink: "Communauté Discord",
    footer: "Crée avec Blitz.js",
  },
  loginPage: {
    login: "Connexion",
    credentialError: "Désolé, l'identifiant et le mot de passe sont invalide.",
    unexpectedError: "Désolé, erreur inatendue. Essayez à nouveau. - {{message}}",
    forgotPassword: "Vous avez oublié votre mot de passe?",
    signUp: "Enregistrez-vous",
    email: "Courriel",
    password: "Mot de passe",
    or: "Ou",
  },
}
