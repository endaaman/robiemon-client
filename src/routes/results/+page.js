export const load = ({ url }) => {
  return {
    sort: url.searchParams.get('sort') || 'descending',
  }
}
