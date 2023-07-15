const arrayChunks = <TArrayItem>(array: TArrayItem[], chunkSize: number) =>
	Array(Math.ceil(array.length / chunkSize))
		.fill(undefined)
		.map((_, index) => index * chunkSize)
		.map((begin) => array.slice(begin, begin + chunkSize));

export default arrayChunks;
