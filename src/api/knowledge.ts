import { axios } from '../utils/request'
import { KNOWLEDGE_MODULE } from './_prefix.ts'

export const fetchKnowledgeFiles = () => {
    return axios.get(`${KNOWLEDGE_MODULE}/list_files`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => res.data.files)
}

export const uploadKnowledgeFile = (file: File, category: string) => {
    const formData = new FormData()
    formData.append('files', file, file.name)
    formData.append('category', category)
    formData.append('collection_name', 'java_doc_plus') // 可选，后端默认就是它

    return axios.post(`${KNOWLEDGE_MODULE}/upload_file`, formData, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    })
}

export const fetchKnowledgeFilesByCategory = (category: string) => {
    return axios.get(`${KNOWLEDGE_MODULE}/get_file/${encodeURIComponent(category)}`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => res.data.files)
}

export const deleteKnowledgeFile = (fileName: string) => {
    return axios.delete(`${KNOWLEDGE_MODULE}/delete_file/${encodeURIComponent(fileName)}`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    })
}

