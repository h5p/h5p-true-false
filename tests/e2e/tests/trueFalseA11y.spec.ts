import { expect, test } from '../../../../../tests/baseTest.ts';
import { TrueFalseFixtures } from '../trueFalseFixtureHelper.ts';
//import AxeBuilder from '@axe-core/playwright';

test.describe('H5P Library True or False - A11Y tests',
    { tag: ['@H5P.True-False', '@a11y'] }, () => {
        test.use({ storageState: { cookies: [], origins: [] } });

    let pom, helper;

    test.beforeEach(async({ page }) => {
        helper = await TrueFalseFixtures.helperForFixture(TrueFalseFixtures.a11yTest, page);
        pom = helper.pom;
        await pom.goto();
    });

    test.describe('Keyboard navigation', { }, () => {

		test('correct', { annotation: { type: 'AIO_ID', description: 'Fix me!?' } }, async() => {
			await pom.checkAnswerButton.waitFor();
			await pom.page.keyboard.press('Tab'); //Highlight True
			await pom.page.keyboard.press('Space'); //Select True
            await expect(pom.trueButton).toHaveAttribute('aria-checked', 'true');
		    await pom.page.keyboard.press('Tab'); //Highlight submit
		    await pom.page.keyboard.press('Space'); //submit it

			await expect(pom.iFrame.getByText('You got 1 out of 1 pointsstar1/')).toBeVisible();
			await expect(pom.iFrame.getByText('Yes, indeed.')).toBeVisible();

		});

		test('incorrect', { tag: '@a11y' }, async() => {
			await pom.checkAnswerButton.waitFor();
			await pom.page.keyboard.press('Tab'); //Highlight True
            await pom.page.keyboard.press('ArrowRight'); //Select False
            await expect(pom.falseButton).toHaveAttribute('aria-checked', 'true');
			await pom.page.keyboard.press('Tab'); //Highlight submit
			await pom.page.keyboard.press('Space'); //submit it

			await expect(pom.iFrame.getByText('Nope.').first()).toBeVisible();
			await expect(pom.iFrame.locator('div').filter({ hasText: /^You got 0 out of 1 points$/ }).first()).toBeVisible();

		});

		test('tab order', { tag: '@a11y' }, async() => {
            await pom.page.keyboard.press('Tab'); //Highlight True
			await expect(pom.trueButton).toBeFocused();
			await pom.page.keyboard.press('Tab'); //Highlight submit
			await expect(pom.checkAnswerButton).toBeFocused();

		});

		test('Keyboard accessibility retry and show solution buttons', { tag: '@a11y' }, async() => {
			await pom.checkAnswerButton.waitFor();
			await pom.page.keyboard.press('Tab'); //Highlight True
            await pom.page.keyboard.press('ArrowRight'); //Select False
			await expect(pom.falseButton).toHaveAttribute('aria-checked', 'true');
			await pom.page.keyboard.press('Tab'); //Highlight submit
			await pom.page.keyboard.press('Space'); //submit it

			await expect(pom.iFrame.getByText('Nope.').first()).toBeVisible();
			await expect(pom.iFrame.locator('div').filter({ hasText: /^You got 0 out of 1 points$/ }).first()).toBeVisible();

			await pom.page.keyboard.press('Space');//Select show solution
			await expect(pom.iFrame.getByRole('radio', { name: 'True .Correct answer' })).toBeVisible();
			await expect(pom.iFrame.getByRole('radio', { name: 'False .Wrong answer' })).toBeVisible();
			await pom.page.keyboard.press('Space');//Select Retry
		});

		test.fixme('focus visible', { tag: '@a11y' }, async() => {
		});

	});

});
