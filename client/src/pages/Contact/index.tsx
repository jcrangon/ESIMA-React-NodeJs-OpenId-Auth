import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageContainer,
  Card,
  Title,
  Subtitle,
  Form,
  Field,
  Label,
  Input,
  Textarea,
  Actions,
  SubmitButton,
  CancelButton,
  HelpText,
  Notice,
} from "./style";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function Contact(){
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [submitted, setSubmitted] = useState(false);

  function validate(current: FormState) {
    const e: typeof errors = {};
    if (!current.name.trim()) e.name = "Le nom est requis.";
    if (!current.email.trim()) e.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.email))
      e.email = "Format d'email invalide.";
    if (!current.subject.trim()) e.subject = "Le sujet est requis.";
    if (!current.message.trim() || current.message.trim().length < 10)
      e.message = "Le message doit contenir au moins 10 caractères.";
    return e;
  }

  const handleChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((s) => ({ ...s, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setSubmitted(false);
      return;
    }

    // NE PAS ENVOYER: simulation locale uniquement
    setSubmitted(true);
    // Optionnel : effacer le formulaire après "envoi"
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <PageContainer>
      <Card>
        <Title>Contact</Title>
        <Subtitle>Formulaire de contact (simulation — n'envoie rien)</Subtitle>

        <Form onSubmit={handleSubmit} noValidate>
          <Field>
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ton nom complet"
              value={form.name}
              onChange={handleChange("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "err-name" : undefined}
            />
            {errors.name ? <HelpText id="err-name">{errors.name}</HelpText> : null}
          </Field>

          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@exemple.com"
              value={form.email}
              onChange={handleChange("email")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "err-email" : undefined}
            />
            {errors.email ? <HelpText id="err-email">{errors.email}</HelpText> : null}
          </Field>

          <Field>
            <Label htmlFor="subject">Sujet</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Sujet du message"
              value={form.subject}
              onChange={handleChange("subject")}
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "err-subject" : undefined}
            />
            {errors.subject ? <HelpText id="err-subject">{errors.subject}</HelpText> : null}
          </Field>

          <Field>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              rows={6}
              placeholder="Écris ton message ici (au moins 10 caractères)"
              value={form.message}
              onChange={handleChange("message")}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "err-message" : undefined}
            />
            {errors.message ? <HelpText id="err-message">{errors.message}</HelpText> : null}
          </Field>

          <Actions>
            <SubmitButton type="submit">Simuler l'envoi</SubmitButton>
            <CancelButton type="button" onClick={() => navigate(-1)}>
              Annuler
            </CancelButton>
          </Actions>

          <Notice>
            <strong>Info :</strong> ce formulaire ne contacte aucun serveur — il
            effectue uniquement une validation côté client et affiche un état
            de confirmation local.
          </Notice>

          {submitted && (
            <Notice role="output" aria-live="polite">
              ✔ Message simulé avec succès — aucune donnée n'a été envoyée.
            </Notice>
          )}
        </Form>
      </Card>
    </PageContainer>
  );
}

/*
RÉSUMÉ PÉDAGOGIQUE
- Emplacement : `src/pages/Contact` (convention pages dans src/pages).
- Composants : fichiers séparés index.tsx (logique) + style.ts (styled-components).
- UX/Accessibilité :
  - Labels liés aux inputs via htmlFor / id.
  - Attributs aria-invalid, aria-describedby pour erreurs.
  - role="status" + aria-live pour annoncer la confirmation.
- Comportement :
  - Validation simple côté client (présence + format email + longueur message).
  - Aucune requête réseau : la soumission ne fait que simuler l'envoi (réinitialise le formulaire et affiche un message).
- Intégration : route possible `/contact` ; pas d'auth requise.
*/
