export const itemTypes = ['album', 'artist', 'episode', 'podcast', 'track'] as const;

// See https://stackoverflow.com/a/62900613
type ItemType = typeof itemTypes[number];

export default ItemType;
