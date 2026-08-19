import { test, expect } from '@playwright/test'

const API = 'http://localhost:3002/api/v1'
const TS = Date.now()

test.describe('API smoke', () => {
  test('GET /health returns 200', async ({ request }) => {
    const res = await request.get(`${API}/health`)
    expect(res.status()).toBe(200)
  })

  test('POST /auth/register + login returns tokens and user', async ({ request }) => {
    const email = `smoke-${TS}@test.com`
    const password = 'Test1234!'

    const reg = await request.post(`${API}/auth/register`, {
      data: { email, password, firstName: 'Smoke', lastName: 'Test' },
    })
    expect(reg.status()).toBe(201)

    const login = await request.post(`${API}/auth/login`, {
      data: { email, password },
    })
    expect(login.status()).toBe(201)
    const body = await login.json()
    expect(body.access_token).toBeTruthy()
    expect(body.user).toBeTruthy()
    expect(body.user.email).toBe(email)
  })

  test('GET /auth/me returns user data when authenticated', async ({ request }) => {
    const email = `smoke-me-${TS}@test.com`
    const password = 'Test1234!'

    await request.post(`${API}/auth/register`, {
      data: { email, password, firstName: 'Smoke', lastName: 'Me' },
    })
    const login = await request.post(`${API}/auth/login`, {
      data: { email, password },
    })
    const { access_token } = await login.json()

    const me = await request.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    expect(me.ok()).toBeTruthy()
    const user = await me.json()
    expect(user.email).toBe(email)
  })
})

test.describe('Frontend smoke', () => {
  test('login page renders auth form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Iniciar sesión')
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('register page renders auth form', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('h1')).toContainText('Crear cuenta')
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('unauthenticated user is redirected to /login from protected route', async ({ page }) => {
    await page.goto('/cursos')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })
})
