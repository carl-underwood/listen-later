import type { APIRequestContext } from '@playwright/test';

// See https://firebase.google.com/docs/reference/rest/auth#section-auth-emulator-oob
const retreiveMostRecentOobCode = async (email: string, request: APIRequestContext) => {
	const oobCodesApiResponse = await request.get(
		`http://localhost:9099/emulator/v1/projects/listen-later-cloud/oobCodes`
	);

	const oobCodesApiResponseBody = (await oobCodesApiResponse.json()) as {
		oobCodes: { email: string; oobLink: string }[];
	};

	const oobCode = oobCodesApiResponseBody.oobCodes.findLast((oobCode) => oobCode.email === email);

	if (!oobCode) {
		throw Error(`Expected to find out-of-band authentication code for email ${email}`);
	}

	return oobCode;
};

export default retreiveMostRecentOobCode;
