/**
 * Responsible for handling all account page request and cookie related issues.
 *
 * @class account
 * @constructor
 */
module.exports = function() {

    /**
     * Constant integer that determines the maximum age in milliseconds of the account info cookie.
     * A value if 2592000000 for example would correspond to a lifetime of one month.
     *
     * @property _maxCookieAge
     * @type int
     * @final
     */
    const _maxCookieAge = 2592000000;
    /**
     * Constant string that determines the name of the account info cookie.
     *
     * @property _cookieName
     * @type string
     * @final
     */
    const _cookieName = 'wgToolAccountInfo';
    /**
     * Checks if the user is authenticated to access the requested page. First checks if there
     * are valid session parameters, if not it checks if there is a account info cookie which
     * contains valid login data. If that also isn't the case the user is shown the login page
     * instead of the requested page with the info that he must first login to see the page.
     *
     * @method isAuthenticated
     * @param {object} [req] Node req object.
     * @param {object} [res] Node response object.
     * @param (object) [next] Node next object.
     */
    module.isAuthenticated = function(req, res, next) {
        // save the requested url, so the user can be redirected to it later
        req.session.authUrl = req.url;
        // NOTE: Could this be a possible security issue? The content of  the session variable is
        // only accessible at the server side, with the client side only storing the session id.
        // The alternative is comparing the account info with the database every time a page is
        // accessed, which might be a little to much.
        if (req.session.loggedIn === true)
            return next();
        
        var accCookie = getCookie(req);
        if (accCookie === undefined) {
            renderLoginPage(req, res, 'info');
            return;
        }
        var accData = accountData.getUser(accCookie.username);
        if (accData === null || accCookie.password != accData.password) {
            renderLoginPage(req, res, 'failed');
            return;
        }
        req.session.username = accData.username;
        req.session.autologin = true;
        req.session.loggedIn = true;
        // reset the cookie and thus its expire date
        setCookie(res, accData.username, accData.password);
        // also set the loggedIn var in the local context, so the view can display the correct
        // page content
        res.locals.loggedIn = true;
        res.locals.username = accData.username;
    };
    /**
     * Displays the long page if the user is not already logged in. If the user is logged in he
     * is redirected to the root page.
     *
     * @method loginGet
     * @param {object} [req] Node req object.
     * @param {object} [res] Node response object.
     * @param (object) [next] Node next object.
     */
    module.loginGet = function(req, res, next) {
        if (req.session.loggedIn !== undefined && req.session.loggedIn === true) {
            res.redirect('/');
            return next();
        }
        req.session.authUrl = req.url;
        renderLoginPage(req, res, 'login');
    };
    /**
     * Handles the users post request if he tried to login via the login page.
     * Checks, if the users username and password were correct and shows an corresponding message 
     * if thats not the case. Otherwise the user is now logged in, the session parameters are set
     * accordingly and the account info cookie is saved, if the user checked the corresponding
     * checkbox. if the user was redirected to the login page while he wanted to access another
     * page he is now redirected to that page. Otherwise a simply success message is displayed.
     *
     * @method loginPost
     * @param {object} [req] Node req object.
     * @param {object} [res] Node response object.
     * @param (object) [next] Node next object.
     */
    module.loginPost = function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
        var autoLogin = false;
        if (req.body.autoLogin !== undefined && req.body.autoLogin === 'auto-login')
            autoLogin = true;
        
        var accData = accountData.getUser(username);
        if (accountData.isPasswordHashValid(password) === false) {
            renderLoginPage(req, res, 'invalid');
            return;
        }
        // if the username was wrong, no account data could be retrieved so show the error msg
        if (accData === null) {
            renderLoginPage(req, res, 'failed');
            return;
        }
        // if the password hashes don't match, show the error page
        if (password != accData.password) {
            renderLoginPage(req, res, 'failed');
            return;
        }
        req.session.username = accData.username;
        req.session.autologin = autoLogin;
        req.session.loggedIn = true;
        // if the user wants to stay logged in, set the corresponding cookie
        if (autoLogin)
            setCookie(res, accData.username, accData.password);
        // also set the loggedIn var in the local context, so the view can display the correct
        // page content
        res.locals.loggedIn = true;
        res.locals.username = accData.username;
        // if the user accessed the login page directly, simply show him a message, that the 
        // login was successful
        if (req.session.authUrl === undefined || req.session.authUrl === '/login') {
            renderLoginPage(req, res, 'success');
            return;
        }
        // if the user was redirected to the login page while accessing another page, the user
        // is redirected to the previously requested page
        res.redirect(req.session.authUrl);
    };
    /**
     * Logs the user out and redirects him to the login page if he currently is logged in. If not
     * the user is redirected to the root page.
     *
     * @method logoutGet
     * @param {object} [req] Node req object.
     * @param {object} [res] Node response object.
     * @param (object) [next] Node next object.
     */
    module.logoutGet = function(req, res, next) {
        // if the user is not logged in, he can't logout, so simply redirect him to the front page
        if (req.session.loggedIn !== true) {
            res.redirect('/');
            return;
        }
        // if the user wants to login automatically, set the corresponding cookie
        if (req.session.autoLogin == true)
            setCookie(res, req.session.username, req.session.password);
        // otherwise remove the existing cookie, that might be present
        else
            deleteCookie(res);
        req.session.destroy();
        res.redirect('/login');
    }
    /**
     * Displays the change password page.
     *
     * @method changePasswordGet
     * @param {object} [req] Node req object.
     * @param {object} [res] Node response object.
     * @param (object) [next] Node next object.
     */   
    module.changePasswordGet = function(req, res, next) {
        res.render('accounts/changePassword', { title: 'Change Password'});
    }
    /**
     * Checks if the old password of the user was correct and the new password
	 * and it's confirmation match. Creates a new salt for the account, hashes
	 * the password and stores it in the database. Also updates the session
	 * variables accordingly.
     *
     * @method changePasswordPost
     * @param {object} [req] Node req object.
     * @param {object} [res] Node response object.
     * @param (object) [next] Node next object.
     */
    module.changePasswordPost = function(req, res, next) {
		var username = req.session.username;
		var oldPassword = req.body.oldPassword;
		var password1 = req.body.newPassword;
		var password2 = req.body.confirmPassword;

        if (accountData.isPasswordHashValid(oldPassword) === false
                || accountData.isPasswordHashValid(password1) === false
                || accountData.isPasswordHashValid(password2) === false) {
            res.render('accounts/changePassword', { title: 'Change Password', state: 'invalid' });
			return;
        }
        
		if (password1 !== password2) {
			res.render('accounts/changePassword', { title: 'Change Password', state: 'confirmWrong'});
			return;
		}

		var accData = getAccountData(username);
        if (oldPassword != accData.password) {
            res.render('accounts/changePassword', { title: 'Change Password', state: 'wrongPassword'});
            return;
        }
        
        accData.password = password1;
        accountData.setUser(username, accData);
        res.render('accounts/changePassword', { title: 'Change Password', state: 'success'});
    }
    /**
     * Displays the create a new account page.
     *
     * @method createAccountGet
     * @param {object} [req] Node req object.
     * @param {object} [res] Node response object.
     * @param (object) [next] Node next object.
     */
    module.createAccountGet = function(req, res, next) {
        res.render('accounts/createAccount', { title: 'Create Account'});
    }
    /**
     * Handles the creation of new users.
     * Checks if the passwords the user has entered are valid and match and if a user with the same
     * name already exists. If not, the account is created and saved.
     *
     * @method createAccountPost
     * @param {object} [req] Node req object.
     * @param {object} [res] Node response object.
     * @param (object) [next] Node next object.
     */
    module.createAccountPost = function(req, res, next) {
        var username = req.body.username;
		var password1 = req.body.newPassword;
		var password2 = req.body.confirmPassword;
		
        if (accountData.isPasswordHashValid(password1) === false
                || accountData.isPasswordHashValid(password2) === false) {
            res.render('accounts/createAccount', { title: 'Create Account', state: 'invalid' });
			return;
        }
        
		if (password1 != password2) {
			res.render('accounts/createAccount', { title: 'Create Account', state: 'confirmWrong' });
			return;
		}
        var accData = accountData.getUser(username);
        if (accData !== null) {
            res.render('accounts/createAccount', { title: 'Create Account', state: 'usernameDuplicate' });
            return;
        }
        accData = { 'username': username, 'password': password1 };
        accountData.setUser(username, accData);
        res.render('accounts/createAccount', { title: 'Create Account', state: 'success'});
    }
    /**
     * Displays the delete account page.
     *
     * @method deleteAccountGet
     * @param {object} [req] Node req object.
     * @param {object} [res] Node response object.
     * @param (object) [next] Node next object.
     */
	module.deleteAccountGet = function(req, res, next) {
		res.render('accounts/deleteAccount', { title: 'Delete Account', state: 'confirm' });
	}
    /**
     * Removes the current user account from the database and redirects the user to the login page.
     *
     * @method deleteAccountPost
     * @param {object} [req] Node req object.
     * @param {object} [res] Node response object.
     * @param (object) [next] Node next object.
     */
	module.deleteAccountPost = function(req, res, next) {
		// if the account was any other than the admin account, and the user confirmed the removal,
		// the corresponding entry is deleted from the database
        accountData.deleteUser(req.session.username);
        deleteCookie(res);
        req.session.destroy();
        res.redirect('/login');
	}
    /**
     * Tries to read the account info cookie and return it's content. If the cookie couldn't be
     * read or doesn't exist, undefined is returned instead.
     *
     * @method getCookie
     * @param (object) [req] The node request object.
     * @return (object) The resulting account info object or undefined.
     */
    function getCookie(req) {
        var raw = req.cookies.get(_cookieName);
        if (raw === undefined)
            return undefined;
        // TODO: Decrypt raw data
        var acc = JSON.parse(raw);
        return acc;
    }
    /**
     * Saves the provided unsername and password into a new account info cookie. The password
     * should be a hash and not the plain-text password.
     *
     * @method setCookie
     * @param (object) [res] The node response object.
     * @param (string) [username] The username which should be saved in the cookie.
     * @param (string) [password] The password which should be saved in the cookie.
     */
    function setCookie(res, username, password) {
        var obj = { username: username, password: password };
        var raw = JSON.stringify(obj);
        // TODO: Encrypt raw data
        res.cookies.set(_cookieName, raw, { maxAge: _maxCookieAge });
    }
    /**
     * Removes the account info cookie.
     *
     * @method deleteCookie
     * @param (object) [res] The node response object.
     */
    function deleteCookie(res) {
        // setting the cookie without providing a value should delete that cookie, by setting an
        // appropriate expire date
        res.cookies.set(_cookieName);
    }
    /**
     * Helper function which displays the login page with the specified status.
     *
     * @method renderLoginPage
     * @param {object} [req] Node req object.
     * @param {object} [res] Node response object.
     * @param (string) [state] The with which the login page should be displayed.
     */
    function renderLoginPage(req, res, state) {
        res.render('accounts/login', { title: 'Login', state: state});
    };
    
    return module;
};
