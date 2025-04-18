import {axios} from '../utils/request'

interface SearchParams {
    query: string
    top_k?: number
    model?: string
}

export const baseSearch = (params: SearchParams) => {
    return axios.post('/search', params).then(res => res.data)
}

export const hybridSearch = (query: string, top_k = 5) => {
    return axios.post(`/hybrid_search`, { query, top_k }).then(res => res.data)
}

export const getDocumentUrl = (name: string) => {
    return axios.get(`/document/${name}`).then(res => res.data)
}