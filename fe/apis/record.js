import shttp from 'fe/utils/shttp'

export function getRecords(query) {
  return shttp.get('/records', query)
}