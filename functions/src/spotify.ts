import { debug } from 'firebase-functions/logger';
import { Agent } from 'https';
import * as needle from 'needle';
import { addSeconds, differenceInMinutes } from 'date-fns';
import type { SearchResponse, SpotifyItemType } from './types/spotify';

const agent = new Agent({ keepAlive: true });
let cachedAccessToken: { accessToken: string; expiresAt: Date };

export const getAccessToken = async (clientId: string, clientSecret: string) => {
	const now = new Date();

	const requiresRefresh =
		!cachedAccessToken || differenceInMinutes(cachedAccessToken.expiresAt, now) < 10;

	debug(requiresRefresh ? 'Refreshing Spotify access token' : 'Using cached Spotify access token', {
		now,
		cachedTokenExpiresAt: cachedAccessToken?.expiresAt || null
	});

	if (requiresRefresh) {
		const accessTokenResponse = await performClientCredentialsExchange(clientId, clientSecret);

		cachedAccessToken = {
			accessToken: accessTokenResponse.access_token,
			expiresAt: addSeconds(now, accessTokenResponse.expires_in)
		};
	}

	return cachedAccessToken.accessToken;
};

const performClientCredentialsExchange = async (
	clientId: string,
	clientSecret: string
): Promise<{ access_token: string; expires_in: number }> => {
	const response = await needle(
		'post',
		'https://accounts.spotify.com/api/token',
		{
			grant_type: 'client_credentials'
		},
		{ agent, auth: 'basic', username: clientId, password: clientSecret }
	);

	if (response.statusCode !== 200) {
		throw new Error(
			`Unexpected ${response.statusCode} response from Spotify: ${JSON.stringify(response.body)}`
		);
	}

	return response.body;
};

export const search = async (searchQuery: string, accessToken: string): Promise<SearchResponse> => {
	const response = await needle(
		'get',
		`https://api.spotify.com/v1/search`,
		{
			q: searchQuery,
			type: 'album,artist,track,show,episode',
			market: 'GB'
		},
		{
			agent,
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		}
	);

	if (response.statusCode !== 200) {
		throw new Error(
			`Unexpected ${
				response.statusCode
			} response from Spotify for search ${searchQuery}: ${JSON.stringify(response.body)}`
		);
	}

	return response.body;
};

export const getItems = async (
	spotifyItemType: SpotifyItemType,
	itemIds: string[],
	accessToken: string
) => {
	const itemIdsCommaSeparated = itemIds.join(',');

	const response = await needle(
		'get',
		`https://api.spotify.com/v1/${spotifyItemType}`,
		{
			ids: itemIdsCommaSeparated,
			market: 'GB'
		},
		{
			agent,
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		}
	);

	if (response.statusCode !== 200) {
		throw new Error(
			`Unexpected ${
				response.statusCode
			} response from Spotify for ${spotifyItemType} lookup ${itemIdsCommaSeparated}: ${JSON.stringify(
				response.body
			)}`
		);
	}

	return response.body;
};
