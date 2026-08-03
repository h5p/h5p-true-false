import { ContentTypeUploader } from '../../../../lib/model/h5pcli/contentTypeUploader.ts';
import { TrueFalse } from './poms/trueFalse.pom.ts';
import { Browser, Page } from '@playwright/test';

export class TrueFalseFixtureHelper {
	readonly pom: TrueFalse;
	readonly page: Page;

	constructor(pom: TrueFalse) {
		this.pom = pom;
		this.page = pom.page;
	}
}

export class TrueFalseFixtures {


	static withRetryShow = {
		file: 'tf_w_retry_show.h5p',
		url: 'https://playwright.staging.h5p.com/content/1292562802996321976',
		helper: TrueFalseFixtureHelper
	};
	static confirmationDialog = {
		file: 'tf_confrim_check_retry.h5p',
		url: 'https://playwright.staging.h5p.com/content/1292637061532116666',
		helper: TrueFalseFixtureHelper
	};
	static disableRetryShowSolution = {
		file: 'tf_no_retry_show.h5p',
		url: 'https://playwright.staging.h5p.com/content/1292642824876615286',
		helper: TrueFalseFixtureHelper
	};
	static automaticallyCheckAnswer = {
		file: 'tf_auto_check_no_retry_show.h5p',
		url: 'https://playwright.staging.h5p.com/content/1292642823072516446',
		helper: TrueFalseFixtureHelper
	};
	static a11yTest = {
		file: 'tf_a11ytest.h5p',
		url: 'https://fabletest.echo.h5p.com/content/1292736940614175936',
		helper: TrueFalseFixtureHelper
	};


	static helperForFixture(fixtureObject: object, page: Page) {
		const pom = this.pomForFixtureUrl(fixtureObject['url'], page);
		const helper = new fixtureObject['helper'](pom);
		return helper;
	}

	static pomForFixtureUrl(fixtureUrl:string, page:Page) {
		return new TrueFalse(page, fixtureUrl);
	}

	static async pomForFixtureFile(fileName:string, page:Page, browser:Browser, baseURL:string) {
		const uploadName = await ContentTypeUploader.upload(browser, baseURL, fileName);
		const fixtureUrl = new URL(uploadName, new URL('/view/h5p-true-false/', baseURL).href).href;
		return this.pomForFixtureUrl(fixtureUrl, page);
	}
}
