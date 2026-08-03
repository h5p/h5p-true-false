import { FrameLocator, Locator, Page } from '@playwright/test';

export class TrueFalse {

    readonly fixtureUrl: string;

    readonly page: Page;
    readonly iFrame: FrameLocator;

    readonly checkAnswerButton: Locator;
    readonly retryButton: Locator;
    readonly showSolutionButton: Locator;

    readonly trueButton: Locator;
    readonly falseButton: Locator;
    readonly finishButton: Locator;
    readonly confirmButton: Locator;
    readonly cancelButton: Locator;
    readonly closeButton: Locator;
    readonly finishText: Locator;
    readonly areYouSureFinishText: Locator;
    readonly retryText: Locator;
    readonly areYouSureRetryText: Locator;

    //Revisit this to move some of this to mixin

    constructor(page: Page, fixtureUrl = null) {
        this.page = page;
        this.fixtureUrl = fixtureUrl;

        this.iFrame = page.locator('iframe').contentFrame();
        this.checkAnswerButton = this.iFrame.getByRole('button', { name: 'Check the answers.' });
        this.retryButton = this.iFrame.getByRole('button', { name: 'Retry the task' });
        this.showSolutionButton = this.iFrame.getByRole('button', { name: 'Show the solution' });
        this.trueButton = this.iFrame.getByRole('radio', { name: 'True' });
        this.falseButton = this.iFrame.getByRole('radio', { name: 'False' });
        this.finishButton = this.iFrame.getByRole('button', { name: 'Finish' });
        this.confirmButton = this.iFrame.getByRole('button', { name: 'Confirm' });
        this.cancelButton = this.iFrame.getByRole('button', { name: 'Cancel' }).filter({ hasText: 'Cancel' });
        this.closeButton = this.iFrame.getByLabel('Close');
        this.finishText = this.iFrame.getByText('Finish ?', { exact: true });
        this.areYouSureFinishText = this.iFrame.getByText('Are you sure you wish to finish ?');
        this.retryText = this.iFrame.getByText('Retry ?', { exact: true });
        this.areYouSureRetryText = this.iFrame.getByText('Are you sure you wish to retry ?');
    }

    async goto() {
        if (!this.fixtureUrl) {
            throw ('No fixture URL');
        }
        ;

        await this.page.goto(this.fixtureUrl);
    }

    async focusIframe() {
        await this.iFrame.locator('body').click();
    }

}
