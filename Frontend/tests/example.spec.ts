import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // S'attendre à ce que la page charge (ajustez le titre selon votre landing page)
  await expect(page).toHaveTitle(/EduShare|Connexion|Accueil/i);
});

test('login page contains authentication form', async ({ page }) => {
  await page.goto('/login');

  // Vérifier qu'il y a un champ email
  const emailInput = page.getByLabel(/adresse e-mail/i);
  await expect(emailInput).toBeVisible();

  // Vérifier qu'il y a un champ mot de passe
  const passwordInput = page.getByLabel(/mot de passe/i);
  await expect(passwordInput).toBeVisible();
});
