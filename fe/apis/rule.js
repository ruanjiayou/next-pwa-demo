import shttp from 'fe/utils/shttp'

export function getRules(query) {
  return shttp.get('/rules', query)
}
export function createRule(data) {
  return shttp.post('/rules', data)
}
export function destroyRule(data) {
  return shttp.delete(`/rules/${data._id}`)
}
export function updateRule(_id, data) {
  return shttp.put(`/rules/${_id}`, data)
}
export function patchRule(_id, data) {
  return shttp.patch(`/rules/${_id}`, data)
}