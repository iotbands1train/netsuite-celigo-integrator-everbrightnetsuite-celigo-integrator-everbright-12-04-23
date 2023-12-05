/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../libs/jsrsasign-all-min', './../Helpers', './../auth/Scope', './ResponseType', './../auth/BasePath', './../model/UserInfo', './OAuthToken'],
    function(jwtModule, helpersModule, scopeModule, responseTypeModule, basePathModule, userInfoModel, oAuthTokenModel){
    /**
     * @module OAuth
     * @version 0.0.1
     */

    var _exports = function(){
        this.clientId = undefined;
        this.scopes = [];
        this.privateKey = undefined;
        this.expiresIn = 3600;
        this.userId = undefined;
        this.oAuthToken = new oAuthTokenModel();
    };

    _exports.prototype.isExpired = function(){
        var _date = new Date();
        return typeof this.oAuthToken !== 'undefined' && this.oAuthToken.created instanceof Date && !isNaN(this.oAuthToken.expiresIn)
            && this.oAuthToken.created + (this.oAuthToken.expiresIn * 0.9) < _date;
    };

    _exports.prototype.getUniqueAuthKey = function(basePath){
        var _self = this;
        var _oAuthBasePath = _exports.deriveOAuthBasePathFromRestBasePath(basePath);
        var _parsedScopes = Array.isArray(this.scopes) ? this.scopes.join(' ') : this.scopes;
        var _payload = {
            iss: this.clientId,
            aud: _oAuthBasePath,
            scope: _parsedScopes
        };
        /** optional parameters  **/
        if(this.userId) {
            _payload.sub = this.userId;
        }
        return KJUR.crypto.Util.md5(JSON.stringify(_payload))
    };

    _exports.prototype.generateAndSignJWTAssertion = function(basePath) {
        if(typeof this.expiresIn !== 'number' || this.expiresIn < 0)
            throw new Error("Invalid expires in param detected");

        var _oAuthBasePath = _exports.deriveOAuthBasePathFromRestBasePath(basePath);
        var now = Math.floor(Date.now() / 1000),
            later = now + this.expiresIn,
            jwt = KJUR.jws.JWS,
            parsedScopes = Array.isArray(this.scopes) ? this.scopes.join(' ') : this.scopes;

        var _header = {
            alg: 'RS256',
            typ: 'JWT'
        };

        var _payload = {
            iss: this.clientId,
            aud: _oAuthBasePath,
            iat: now,
            exp: later,
            scope: parsedScopes
        };
        /** optional parameters  **/
        if(this.userId) {
            _payload.sub = this.userId;
        }

        var _privateKey = KEYUTIL.getKey(this.privateKey);
        var _headerString = JSON.stringify(_header);
        var _payloadString = JSON.stringify(_payload);

        return jwt.sign(_header.alg, _headerString, _payloadString, _privateKey);
    };

    _exports.prototype.buildAuthenticationRequest = function (basePath) {
        var _self = this;
        var _oAuthBasePath = _exports.deriveOAuthBasePathFromRestBasePath(basePath);
        return {
            method: 'POST',
            url: ['https://', _oAuthBasePath, '/oauth/token'].join(''),
            body: {
                'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion': _self.generateAndSignJWTAssertion(basePath)
            },
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
    };

    /**
     * Deserializes an HTTP response body.
     * @param {Object} response A SuperAgent response object.
     * @returns {OAuth} A value of the specified type.
     */
    _exports.prototype.deserialize = function (response) {
        if (response == null) {
            return null;
        }
        this.oAuthToken = new oAuthTokenModel();
        oAuthTokenModel.constructFromObject(response, this.oAuthToken);
        this.oAuthToken.created = new Date();
        return this;
    };

    _exports.deriveOAuthBasePathFromRestBasePath = function(basePath) {
        if (basePath == null || typeof basePath !== 'string') {
            return _exports.BasePath.PRODUCTION;
        }
        if (basePath.indexOf('https://stage') > -1) {
            return _exports.BasePath.STAGE;
        }
        if (basePath.indexOf('https://demo') > -1) {
            return _exports.BasePath.DEMO;
        }
        if (basePath.indexOf('https://docusign') > -1) {
            return _exports.BasePath.PRODUCTION;
        }
    };

    /**
     * Applies authentication headers to the request.
     * @param {Object} request The request object.
     */
    _exports.prototype.applyAuthToRequest = function(request){
        if (this.oAuthToken && this.oAuthToken.accessToken) {
            request.headers['Authorization'] = ['Bearer', this.oAuthToken.accessToken].join(' ');
        }
        return this;
    };

    /**
     * @param {String} privateKey Private SSL key string
     * @returns {module:OAuth}
     */
    _exports.prototype.setPrivateKey = function(privateKey){
        this.privateKey = privateKey;
        return this;
    };

    /**
     * @returns {String} Private SSL key string
     */
    _exports.prototype.getPrivateKey = function(){
        return this.privateKey;
    };

    /**
     * @param {String} clientId DocuSign Client ID string
     * @returns {module:OAuth}
     */
    _exports.prototype.setClientId = function(clientId){
        this.clientId = clientId;
        return this;
    };

    /**
     * @returns {String} DocuSign Client ID string
     */
    _exports.prototype.getClientId = function(){
        return this.clientId;
    };

    /**
     * @param {Array.<String>|String} scope Scopes used for authentication
     * @returns {module:OAuth}
     */
    _exports.prototype.setScope = function(scope){
        if(scope instanceof Array){
            this.scopes = scope;
        } else if(typeof scope === 'string'){
            if(!(this.scopes instanceof Array)){
                this.scopes = [];
            }
            this.scopes.push(scope);
        }
        return this;
    };

    /**
     * @param {Array.<String>|String} scope Scopes used for authentication
     * @returns {module:OAuth}
     */
    _exports.prototype.addScope = function(scope){
        if(!(this.scopes instanceof Array)){
            this.scopes = [];
        }
        if(scope instanceof Array){
            this.scopes = this.scopes.concat(scope);
        } else if(typeof scope === 'string'){
            this.scopes.push(scope);
        }
        return this;
    };

    /**
     * @returns {Array.<String>} Scopes used for authentication
     */
    _exports.prototype.getScope = function(){
        return this.scopes;
    };

    /**
     * @param {String} userId DocuSign user ID (not email, but user key)
     * @returns {module:OAuth}
     */
    _exports.prototype.setUserId = function(userId){
        this.userId = userId;
        return this;
    };

    /**
     * @returns {String} DocuSign user ID
     */
    _exports.prototype.getUserId = function(){
        return this.userId;
    };

    /**
     * Helper method to build the OAuth JWT grant uri (used once to get a user consent for impersonation)
     * @param clientId OAuth2 client ID
     * @param redirectURI OAuth2 redirect uri
     * @param oAuthBasePath DocuSign OAuth base path (account-d.docusign.com for the developer sandbox
     * 			  and account.docusign.com for the production platform)
     * @returns {string} the OAuth JWT grant uri as a String
     */
    _exports.prototype.getJWTUri = function(basePath, redirectUri) {
        var _oAuthBasePath = _exports.deriveOAuthBasePathFromRestBasePath(basePath);
        return "https://" + _oAuthBasePath + "/oauth/auth" + "?" +
            "response_type=code&" +
            "client_id=" + this.clientId + "&" +
            "scope=" + (Array.isArray(this.scopes) ? this.scopes.join('%20') : '') + "&" +
            "redirect_uri=" + (redirectUri || 'https://localhost');
    };

    /**
     * Get OAuth token
     * @returns {module:model/OAuthToken}
     */
    _exports.prototype.getToken = function(){
        return this.oAuthToken;
    };

    _exports.UserInfo = userInfoModel;

    _exports.Scope = {
        SIGNATURE: scopeModule.SIGNATURE,
        EXTENDED: scopeModule.EXTENDED,
        IMPERSONATION: scopeModule.IMPERSONATION
    };
    _exports.ResponseType = {
        CODE: responseTypeModule.CODE,
        TOKEN: responseTypeModule.TOKEN
    };
    _exports.BasePath = {
        PRODUCTION: basePathModule.PRODUCTION,
        STAGE: basePathModule.STAGE,
        DEMO: basePathModule.DEMO
    };

    Object.freeze(_exports.Scope);
    Object.freeze(_exports.ResponseType);
    Object.freeze(_exports.BasePath);

    return _exports;
});