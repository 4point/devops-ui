import request from '@/utils/request'

export function getParameterType() {
  return request({
    url: `/parameter_types`,
    method: 'get'
  })
}

export function getParameterByIssue(issue_id) {
  return request({
    url: `/parameters_by_issue/${issue_id}`,
    method: 'get'
  })
}

export function addParameterByIssue(issue_id, data) {
  return request({
    url: `/parameters_by_issue/${issue_id}`,
    method: 'post',
    data
  })
}

export function deleteParameter(parameter_id) {
  return request({
    url: `/parameters/${parameter_id}`,
    method: 'delete'
  })
}