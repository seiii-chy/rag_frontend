import {axios} from '../utils/request'

export const fetchKnowledgeFiles = () => {
    return axios.get('/files')
        .then(res => res.data.files)
}

export const uploadKnowledgeFile = (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return axios.post('/file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}