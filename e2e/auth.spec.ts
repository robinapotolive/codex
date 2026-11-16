import { expect, test } from '@playwright/test';

test('registers, signs in, and redirects protected pages after sign-out', async ({ page }) => {
  const email = `codex-${Date.now()}@example.test`;
  const password = 'TestPassword123!';

  await page.goto('/register');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/login\?registered=true$/);
  await expect(page.getByRole('status')).toContainText('Account created.');

  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Your workspace is ready.' })).toBeVisible();
  await expect(page.locator('.account-email')).toHaveText(email);

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('validates registration and rejects incorrect credentials', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Email address').fill('codex-invalid@example.test');
  await page.getByLabel('Password', { exact: true }).fill('TestPassword123!');
  await page.getByLabel('Confirm password').fill('DifferentPassword123!');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page.getByText('Passwords do not match.')).toBeVisible();

  await page.getByRole('link', { name: 'Sign in' }).click();
  await page.getByLabel('Email address').fill('missing@example.test');
  await page.getByLabel('Password', { exact: true }).fill('TestPassword123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('alert')).toHaveText('Incorrect email or password.');
});
