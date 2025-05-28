import { axios } from '../utils/request';
import { INTERVIEW_MODULE } from "./_prefix";

// 开始新的面试会话
export type StartInterviewParams = {
    user_id: number;
    position: string;
    interview_name: string;
    cv: string;
    provider?: string;
}

export const startInterview = (params: StartInterviewParams) => {
    //console.log('startInterview params', params);
    return axios.post(`${INTERVIEW_MODULE}`, params, { headers: { 'Content-Type': 'application/json' } })
        .then(res => {
            //console.log('startInterview res', res);
            return res;
        });
};

// 提交回答并获取下一个问题
export type SubmitAnswerParams = {
    answer: string;
}

export const submitAnswer = (interviewId: number, params: SubmitAnswerParams) => {
    return axios.post(`${INTERVIEW_MODULE}/${interviewId}/answers`, params, { headers: { 'Content-Type': 'application/json' } })
        .then(res => {
            return res.data;
        });
};

// 结束面试会话
export const endInterview = (interviewId: number) => {
    return axios.post(`${INTERVIEW_MODULE}/${interviewId}`, null, { headers: { 'Content-Type': 'application/json' } })
        .then(res => {
            return res.data;
        });
};

// 获取用户的旧面试记录
export const getUserOldInterviews = (userId: number) => {
    return axios.get(`${INTERVIEW_MODULE}/${userId}`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => {
        return res.data;
    });
};

// 获取单个面试记录
export const getInterview = (interviewId: number) => {
    //console.log('getInterview interviewId', interviewId);
    return axios.get(`${INTERVIEW_MODULE}/single/${interviewId}`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => {
        return res.data;
    });
};

// 获取面试问题列表
export const getInterviewQuestions = (interviewId: number) => {
    return axios.get(`${INTERVIEW_MODULE}/${interviewId}/questions`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => {
        return res.data;
    });
};