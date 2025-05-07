import {axios} from '../utils/request'

type LoginInfo = {
    username: string,   // 改成 username
    password: string
}

type RegisterInfo = {
    username: string,
    email: string,
    password: string,
    user_type: string,
}

export const userLogin = (loginInfo: LoginInfo) => {
    return axios.post(`/login`, null, {params: loginInfo})
        .then(res => {
            return res
        })
}

export const userRegister = (registerInfo: RegisterInfo) => {
    return axios.post(`/register`, registerInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

export const userInfo = () => {
    return axios.get(`/user_info`, {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
    })
}
