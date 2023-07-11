import { debug } from 'firebase-functions/logger';
import { Agent } from 'https';
import * as needle from 'needle';
import { addSeconds, differenceInMinutes } from 'date-fns';
import type { SearchResponse } from './types/spotify';

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

export const getEpisodes = async (episodeIds: string[], accessToken: string) => {
	const episodeIdsCommaSeparated = episodeIds.join(',');

	const response = await needle(
		'get',
		`https://api.spotify.com/v1/episodes`,
		{
			ids: episodeIdsCommaSeparated,
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
			} response from Spotify for episodes lookup ${episodeIdsCommaSeparated}: ${JSON.stringify(
				response.body
			)}`
		);
	}

	return response.body;
};
