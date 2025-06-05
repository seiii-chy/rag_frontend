import { axios } from '../utils/request'
import { KNOWLEDGE_MODULE } from './_prefix.ts'

/**
 * 获取全部文件（不分类）
 */
export const fetchKnowledgeFiles = () => {
    return axios.get(`${KNOWLEDGE_MODULE}/list_files`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => res.data.files)
}

/**
 * 按标签上传文件
 * @param file 上传的文件
 * @param category 分类标签，如：面向对象、事务管理等
 */
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

/**
 * 按标签获取文件列表
 * @param category 分类标签
 */
export const fetchKnowledgeFilesByCategory = (category: string) => {
    return axios.get(`${KNOWLEDGE_MODULE}/get_file/${encodeURIComponent(category)}`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => res.data.files)
}
