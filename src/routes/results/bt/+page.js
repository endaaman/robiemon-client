export const load = ({ url }) => {
  return {
    sort: url.searchParams.get('sort') || 'descending',
    mode: url.searchParams.get('mode') || 'card',
  };
};
