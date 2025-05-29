import { axios } from '../utils/request'
import { CONVERSATION_MODULE } from './_prefix.ts'

type MessageRole = 'user' | 'ai'

export type Conversation = {
    id: number,
    title?: string,
}

export type Message = {
    role: MessageRole,
    content: string,
    created_at?: string,
    references?: any[]
}

// 创建会话时发送的数据
export type CreateConversationData = {
    user_id: number,
    content: string,
}

// 添加消息时发送的数据
export type AddMessageData = {
    role: MessageRole,
    content: string,
}

// 获取会话列表
export const getConversations = () => {
    return axios.get(`${CONVERSATION_MODULE}/getConversations`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => res)
}

// 获取会话详情
export const getConversationDetail = (id: number) => {
    return axios.get(`${CONVERSATION_MODULE}/get/${id}`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => res)
}

// 创建会话
export const createConversation = (data: CreateConversationData) => {
    return axios.post(`${CONVERSATION_MODULE}/create`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => res)
}

// 添加消息
export const addMessageToConversation = (
    conversation_id: number,
    data: AddMessageData
) => {
    console.log(data)
    return axios.post(`${CONVERSATION_MODULE}/add_message/${conversation_id}`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => res)
}
