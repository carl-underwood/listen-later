export type SearchResponse = {
	readonly albums: SearchResponseData<Album>;
	readonly artists: SearchResponseData<Artist>;
	readonly episodes: SearchResponseData<Episode>;
	readonly shows: SearchResponseData<Show>;
	readonly tracks: SearchResponseData<Track>;
};

type SearchResponseData<TItem> = {
	readonly items: TItem[];
};

type Album = {
	readonly artists: Artist[];
	readonly external_urls: ExternalUrls;
	readonly id: string;
	readonly images: Image[];
	readonly name: string;
};

export type Artist = {
	readonly external_urls: ExternalUrls;
	readonly id: string;
	readonly images: Image[];
	readonly name: string;
};

type Episode = {
	readonly external_urls: ExternalUrls;
	readonly id: string;
	readonly images: Image[];
	readonly name: string;
};

type ExternalUrls = {
	readonly spotify: string;
};

export type Image = {
	readonly height: number;
	readonly url: string;
};

type Show = {
	readonly external_urls: ExternalUrls;
	readonly id: string;
	readonly images: Image[];
	readonly name: string;
};

type Track = {
	readonly album: Album;
	readonly artists: Artist[];
	readonly external_urls: ExternalUrls;
	readonly id: string;
	readonly name: string;
};
