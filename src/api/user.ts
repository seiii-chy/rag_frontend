import {axios} from '../utils/request'
import {USER_MODULE} from "./_prefix.ts";

type LoginInfo = {
    username: string,
    password: string
}

type RegisterInfo = {
    username: string,
    password: string,
    email: string,
    user_type: string,
}

export const userLogin = (loginInfo: LoginInfo) => {
    return axios.post(`${USER_MODULE}/login`, loginInfo, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

export const userRegister = (registerInfo: RegisterInfo) => {
    return axios.post(`${USER_MODULE}/register`, registerInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

export const userInfo = () => {
    return axios.get(`${USER_MODULE}/info`, {
        headers: {
            'Authorization': sessionStorage.getItem('token') || ''
        }
    }).then(res => {
        return res
    })
}
