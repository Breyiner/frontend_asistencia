export const getCookie = (name) => {

    let stringCookies = document.cookie;

    let arrayCookies = stringCookies.split("; ");

    let cookie = null;
    
    arrayCookies.forEach((elemento) => {

        let [key, value] = elemento.split('=');
        
        if(key == name) cookie = value;

    });

    return decodeURIComponent(cookie);
}