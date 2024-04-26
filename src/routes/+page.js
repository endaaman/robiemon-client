export const load = ({ url }) => {
	return {
		mode: url.searchParams.get('mode') ?? 'default'
	};
};
