import {axios} from '../utils/request'

import {KNOWLEDGE_MODULE} from "./_prefix.ts";

export const fetchKnowledgeFiles = () => {
    return axios.get(`${KNOWLEDGE_MODULE}/files`)
        .then(res => res.data.files)
}

export const uploadKnowledgeFile = (file: any) => {
    const formData = new FormData()
    formData.append('file', file.raw)

    return axios.post(`${KNOWLEDGE_MODULE}/file`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}