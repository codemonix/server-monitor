
export const setToken = (token) => {
    if (
        typeof token === 'string' &&
        token.trim() !== '' &&
        token !== 'undefined' &&
        token !== 'null'
    ) {
        localStorage.setItem('srm.token', token);
        return true;
    }
    console.warn("Invalid token, abort setting to local Storage")
    return false;
};

export const getToken = () => {
    return localStorage.getItem('srm.token');
};

export const clearTocken = () => {
    localStorage.removeItem('srm.token');
}