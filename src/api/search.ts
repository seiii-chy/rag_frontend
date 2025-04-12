import {axios} from '../utils/request'

interface SearchParams {
    query: string
    top_k?: number
    model?: string
}

export const searchWithAI = (params: SearchParams) => {
    return axios.post('/api/search', params).then(res => res.data)
}