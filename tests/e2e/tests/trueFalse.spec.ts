import { expect, test } from '../../../../../tests/baseTest.ts';
import { TrueFalseFixtures } from '../trueFalseFixtureHelper.ts';

test.describe('H5P Library True/False',
	{ tag: '@H5P.TrueFalse' }, () => {
		// These are public, don't have a session
		test.use({ storageState: { cookies: [], origins: [] } });

		let pom, helper;

		test.describe('Settings: With retry/show', {}, () => {
			test.beforeEach(async({ page }) => {
				helper = await TrueFalseFixtures.helperForFixture(TrueFalseFixtures.withRetryShow, page);
				pom = helper.pom;
				await pom.goto();
			});

			test('Correct feedback is shown', async() => {
				await pom.trueButton.click();
				await pom.checkAnswerButton.click();

				await expect(pom.iFrame.getByText('You got 1 out of 1 pointsstar1/')).toBeVisible();
				await expect(pom.iFrame.getByText('Yes, indeed.')).toBeVisible();
			});

			test('Incorrect feedback is shown', async() => {
				await pom.falseButton.click();
				await pom.checkAnswerButton.click();

				await expect(pom.iFrame.getByText('Nope.').first()).toBeVisible();
				await expect(pom.showSolutionButton).toBeVisible();
				await expect(pom.retryButton).toBeVisible();
				await expect(pom.iFrame.locator('div').filter({ hasText: /^You got 0 out of 1 points$/ }).first()).toBeVisible();
			});

			test('Retry button starts new attempt', async() => {

				await pom.falseButton.click();
				await pom.checkAnswerButton.click();

				await expect(pom.checkAnswerButton).toBeHidden();
				await expect(pom.retryButton).toBeVisible();

				await pom.retryButton.click();

				await expect(pom.checkAnswerButton).toBeVisible();
				await expect(pom.retryButton).toBeHidden();
			});

			test('Show solution button shows the solution', async() => {
				await pom.falseButton.click();
				await pom.checkAnswerButton.click();

				await expect(pom.checkAnswerButton).toBeHidden();
				await expect(pom.showSolutionButton).toBeVisible();

				await pom.showSolutionButton.click();

				await expect(pom.iFrame.getByRole('radio', { name: 'True .Correct answer' })).toBeVisible();
				await expect(pom.iFrame.getByRole('radio', { name: 'False .Wrong answer' })).toBeVisible();
			});


			test('can use keyboard',
				{ tag: '@a11y', annotation: { type: 'AIO_ID', description: 'TCM-TC-5126' } },
				async() => {
					await test.step('for True', async() => {
						await pom.checkAnswerButton.waitFor();
						await pom.focusIframe();
						await pom.page.keyboard.press('Tab'); // Highlight the True
						await pom.page.keyboard.press('Space'); // Select True
						await pom.page.keyboard.press('Tab'); // Highlight Check Answer
						await pom.page.keyboard.press('Space'); // Use button

						await expect(pom.iFrame.getByText('You got 1 out of 1 pointsstar1/')).toBeVisible();
						await expect(pom.iFrame.getByText('Yes, indeed.')).toBeVisible();
					});

					await test.step('for False', async() => {
						await pom.goto();
						await pom.checkAnswerButton.waitFor();
						await pom.focusIframe();
						await pom.page.keyboard.press('Tab'); // Highlight the True
						await pom.page.keyboard.press('ArrowRight'); // Highlight false
						await pom.page.keyboard.press('Space'); // Select false
						await pom.page.keyboard.press('Tab'); // Highlight Check Answer
						await pom.page.keyboard.press('Space'); // Use button

						await expect(pom.iFrame.getByText('You got 0 out of 1 pointsstar0/')).toBeVisible();
						await expect(pom.iFrame.getByText('Nope.').first()).toBeVisible();
					});

				});

		});

		test.describe('settings: disabled retry and show solution', {}, () => {
			test.beforeEach(async({ page }) => {
				helper = await TrueFalseFixtures.helperForFixture(TrueFalseFixtures.disableRetryShowSolution, page);
				pom = helper.pom;
				await pom.goto();
			});

			test('retry does not display', async() => {
				await pom.falseButton.click();
				await pom.checkAnswerButton.click();

				await expect(pom.retryButton).toBeHidden();
			});

			test('Show solution button does not display', async() => {
				await pom.falseButton.click();
				await pom.checkAnswerButton.click();

				await expect(pom.showSolutionButton).toBeHidden();
			});

		});

		test.describe('settings: show confirmation for check/retry', {}, () => {
			test.beforeEach(async({ page }) => {
				helper = await TrueFalseFixtures.helperForFixture(TrueFalseFixtures.confirmationDialog, page);
				pom = helper.pom;
				await pom.goto();
			});

			test('Check button - Dialog Finish', async() => {
				await pom.trueButton.click();
				await pom.checkAnswerButton.click();

				await expect(pom.finishText).toBeVisible();
				await expect(pom.areYouSureFinishText).toBeVisible();

				await pom.finishButton.click();
			});

			test('Check button - Dialog Cancel', async() => {
				await pom.trueButton.click();
				await pom.checkAnswerButton.click();

				await expect(pom.finishText).toBeVisible();
				await expect(pom.areYouSureFinishText).toBeVisible();

				await pom.cancelButton.click();
			});

			test('Check Button - Dialog Close', async() => {
				await pom.trueButton.click();
				await pom.checkAnswerButton.click();

				await expect(pom.finishText).toBeVisible();
				await expect(pom.areYouSureFinishText).toBeVisible();

				await pom.closeButton.click();
			});

			test('Retry Button - Dialog Confirm', async() => {
				await pom.falseButton.click();
				await pom.checkAnswerButton.click();

				await pom.finishButton.click();

				await expect(pom.retryButton).toBeVisible();
				await pom.retryButton.click();

				await expect(pom.retryText).toBeVisible();
				await expect(pom.areYouSureRetryText).toBeVisible();

				await expect(pom.retryButton).toBeHidden();

				await pom.confirmButton.click();

				await expect(pom.checkAnswerButton).toBeVisible();
			});

			test('retry button - Dialog Cancel', async() => {
				await pom.falseButton.click();
				await pom.checkAnswerButton.click();

				await pom.finishButton.click();

				await expect(pom.retryButton).toBeVisible();
				await pom.retryButton.click();
				await expect(pom.retryButton).toBeHidden();

				await expect(pom.retryText).toBeVisible();
				await expect(pom.areYouSureRetryText).toBeVisible();

				await pom.cancelButton.click();
				await expect(pom.retryButton).toBeVisible();
				await expect(pom.checkAnswerButton).toBeHidden();

			});

			test('retry button - Dialog Close', async() => {
				await pom.falseButton.click();
				await pom.checkAnswerButton.click();

				await pom.finishButton.click();

				await expect(pom.retryButton).toBeVisible();
				await pom.retryButton.click();
				await expect(pom.retryButton).toBeHidden();

				await expect(pom.retryText).toBeVisible();
				await expect(pom.areYouSureRetryText).toBeVisible();

				await pom.closeButton.click();
				await expect(pom.retryButton).toBeVisible();
				await expect(pom.checkAnswerButton).toBeHidden();

			});
		});

		test.describe('auto check with no retry', {}, () => {
			test.beforeEach(async({ page }) => {
				helper = await TrueFalseFixtures.helperForFixture(TrueFalseFixtures.automaticallyCheckAnswer, page);
				pom = helper.pom;
				await pom.goto();
			});

			test('Automatically check answer', async() => {
				await pom.trueButton.click();

				await expect(pom.iFrame.getByText('You got 1 out of 1 pointsstar1/')).toBeVisible();
				await expect(pom.iFrame.getByText('Yes, indeed.')).toBeVisible();
				await expect(pom.checkAnswerButton).toBeHidden();
			});

		});

	});
