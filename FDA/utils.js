// adds delay before requesting API
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId){
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};