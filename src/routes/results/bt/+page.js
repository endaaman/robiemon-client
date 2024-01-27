export const load = ({ url }) => {
	return {
		sort: url.searchParams.get('sort') ?? 'ascending',
		mode: url.searchParams.get('mode') ?? 'card',
	};
};
