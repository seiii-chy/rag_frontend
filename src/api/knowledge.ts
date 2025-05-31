import {axios} from '../utils/request'

import {KNOWLEDGE_MODULE} from "./_prefix.ts";

export const fetchKnowledgeFiles = () => {
    return axios.get(`${KNOWLEDGE_MODULE}/list_files`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    })
        .then(res => res.data.files)
}

export const fetchUserKnowledgeFiles = () => { // TODO
    return axios.get(`${KNOWLEDGE_MODULE}/list_files`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    })
        .then(res => res.data.files)
}

export const deleteKnowledgeFile = () => { // TODO
    return axios.get(`${KNOWLEDGE_MODULE}/delete_file`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => {
        return res
    })
}

export const uploadKnowledgeFile = (file: any) => {
    const formData = new FormData()
    formData.append('files', file, file.name)

    return axios.post(`${KNOWLEDGE_MODULE}/upload_file`, formData, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => {
        return res
    })
}