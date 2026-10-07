import { test, expect, type Page } from '@playwright/test'

const STORY_URL = '/iframe.html?id=canvas--default&viewMode=story'

async function loadStory(page: Page) {
  await page.goto(STORY_URL)
  await page.waitForSelector('ds-ngx-studio', { state: 'attached' })
  await page.waitForSelector('.card', { state: 'visible' })
}

// Leaf cards don't contain a .card__body (only container cards do).
// Targeting a container's Configure button would match ALL nested buttons.
async function getLeafCard(page: Page) {
  return page
    .locator('.card')
    .filter({ hasNot: page.locator('.card__body') })
    .first()
}

async function openInspector(page: Page) {
  const card = await getLeafCard(page)
  await card.hover()
  const tuneBtn = card.getByLabel('Configure')
  await expect(tuneBtn).toBeVisible()
  await tuneBtn.click()
  await page.waitForSelector('.inspector', { state: 'visible' })
}

test.describe('Inspector panel', () => {
  test.beforeEach(async ({ page }) => {
    await loadStory(page)
  })

  test('canvas loads with component cards', async ({ page }) => {
    const cards = page.locator('.card')
    await expect(cards.first()).toBeVisible()
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('tune button appears on leaf card hover', async ({ page }) => {
    const card = await getLeafCard(page)
    await card.hover()
    await expect(card.getByLabel('Configure')).toBeVisible()
  })

  test('remove button appears on leaf card hover', async ({ page }) => {
    const card = await getLeafCard(page)
    await card.hover()
    await expect(card.getByLabel('Remove')).toBeVisible()
  })

  test('inspector opens on clicking Configure', async ({ page }) => {
    await openInspector(page)
    await expect(page.locator('[aria-label="Component settings"]')).toBeVisible()
  })

  test('inspector contains Appearance and Props sections', async ({ page }) => {
    await openInspector(page)
    const body = page.locator('.inspector__body')
    await expect(body.getByText('Appearance')).toBeVisible()
    await expect(body.getByText('Props')).toBeVisible()
  })

  test('inspector appears with motion (grid transition or slide-in)', async ({ page }) => {
    // Click Configure and immediately check that motion is active somewhere
    // (either grid-template-columns transition on the studio, or an
    // animation on the inspector itself depending on viewport width).
    const card = await getLeafCard(page)
    await card.hover()
    await card.getByLabel('Configure').click()

    await page.waitForSelector('.inspector', { state: 'attached' })
    const motion = await page.evaluate(() => {
      const wb = document.querySelector('ds-ngx-studio')!
      const insp = document.querySelector('.inspector')
      const wbAnims = wb.getAnimations({ subtree: false })
      const inspAnims = insp?.getAnimations() ?? []
      return { wbCount: wbAnims.length, inspCount: inspAnims.length }
    })
    expect(motion.wbCount + motion.inspCount).toBeGreaterThan(0)
  })

  test('inspector appears on the right side of the studio (wide viewport)', async ({ page }) => {
    // Playwright Desktop Chrome default: 1280×720 — triggers @media (min-width:1200px)
    await openInspector(page)
    const inspector = page.locator('.inspector')
    const studio = page.locator('ds-ngx-studio')

    // Wait for BOTH the inspector animations AND the studio's grid-template-
    // columns transition to finish before measuring final positions.
    await studio.evaluate(el => Promise.all(el.getAnimations({ subtree: false }).map(a => a.finished)))
    await inspector.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)))

    const inspectorBox = await inspector.boundingBox()
    const studioBox = await studio.boundingBox()

    expect(inspectorBox).not.toBeNull()
    expect(studioBox).not.toBeNull()

    if (inspectorBox && studioBox) {
      // Inspector right edge aligns with studio right edge.
      // 20px tolerance accounts for the Storybook shell border and sub-pixel rendering.
      const inspectorRight = inspectorBox.x + inspectorBox.width
      const studioRight = studioBox.x + studioBox.width
      expect(Math.abs(inspectorRight - studioRight)).toBeLessThan(20)

      // Inspector must NOT be at the bottom (top must be near studio top)
      expect(Math.abs(inspectorBox.y - studioBox.y)).toBeLessThan(4)
    }
  })

  test('close button dismisses the inspector', async ({ page }) => {
    await openInspector(page)
    await page.locator('.inspector').getByLabel('Close').click()
    await expect(page.locator('.inspector')).toHaveCount(0)
  })

  test('ESC key closes the inspector', async ({ page }) => {
    await openInspector(page)
    await page.keyboard.press('Escape')
    await expect(page.locator('.inspector')).toHaveCount(0)
  })

  test('inspector on narrow viewport: shows scrim and closes on scrim click', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 800, height: 600 } })
    const p = await ctx.newPage()
    try {
      await p.goto(STORY_URL)
      await p.waitForSelector('.card', { state: 'visible' })

      const card = p
        .locator('.card')
        .filter({ hasNot: p.locator('.card__body') })
        .first()
      await card.hover()
      await card.getByLabel('Configure').click()
      await p.waitForSelector('.inspector', { state: 'visible' })

      // Scrim must be visible in overlay mode (800 < 1200)
      await expect(p.locator('.scrim')).toBeVisible()

      // Clicking the scrim closes the inspector
      await p.locator('.scrim').click({ position: { x: 10, y: 10 } })
      await expect(p.locator('.inspector')).toHaveCount(0)
    } finally {
      await ctx.close()
    }
  })

  test('removing the inspected node closes the inspector', async ({ page }) => {
    await openInspector(page)
    const card = await getLeafCard(page)
    await card.hover()
    await card.getByLabel('Remove').click()
    await expect(page.locator('.inspector')).toHaveCount(0)
  })

  test('icon field updates the live preview immediately', async ({ page }) => {
    await openInspector(page)
    // The Icon input (mat-label="Icon") inside the inspector meta section
    const iconInput = page.locator('.inspector').getByRole('textbox', { name: 'Icon', exact: true })
    await iconInput.clear()
    await iconInput.fill('favorite')
    // Live preview mat-icon must reflect the new ligature
    await expect(page.locator('.meta__icon-preview mat-icon')).toHaveText('favorite')
  })

  test('props fields are rendered for TextInput component', async ({ page }) => {
    await openInspector(page)
    const propsSection = page.locator('.inspector__section').filter({ hasText: 'Props' })
    // Use exact match to avoid 'Label' matching 'Aria Label'
    await expect(propsSection.getByRole('textbox', { name: 'Label', exact: true })).toBeVisible()
    await expect(propsSection.getByRole('textbox', { name: 'Placeholder', exact: true })).toBeVisible()
    await expect(propsSection.getByRole('textbox', { name: 'Aria Label', exact: true })).toBeVisible()
  })
})
