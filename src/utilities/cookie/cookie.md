The Cookie JavaScript Utility is used by the Alert Banner component to create
a [web cookie](https://en.wikipedia.org/wiki/HTTP_cookie). The Cookie utility is
used to also read from the cookie created to check if the alert banner has been
closed in order to no longer show it in the page, thus improving the user
experience.

The Cookie JavaScript Utility is composed of the following methods that are used
in the Alert Banner component:

| Method                          | Description                               |
| ------------------------------- |-------------------------------------------|
| readCookie()                    | Reads a cookie and returns the value.     |
| dataset(elem, attr)             | Function to get value of a data attribute.|   
| readCookie(cookieName, cookie)  | Reads a cookie and returns the value.     |    
| getDomain(url, root)            | Returns the domain from a URL.            |

#### Cherry-picked Module Import

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script. The methods and configurations described above will work with the dedicated module.

    // ES6
    import Cookie from 'src/utilities/cookie/cookie';

    // CommonJS
    import Cookie from 'dist/utilities/cookie/cookie.common';

    <!-- IFFE -->
    <script src="dist/utilities/cookie/cookie.iffe.js"></script>

    new Cookie();

####  Storing cookie in data- attribute