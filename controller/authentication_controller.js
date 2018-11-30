/**
 * @author Nguyễn Thế Sơn
 * Cập nhật chức năng đăng nhập admin
 */
let fs = require('fs');
let AmazonCognitoIdentity = require('amazon-cognito-identity-js');
let CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
let jwk = require('../jwk.json');
let jose = require('node-jose');

//Thông tin về Pool Cognito
const cognitoConfig = {
    //Vào Pool Cognito của mình tạo --> General setting --> Tìm phần Pool Id
    UserPoolId: 'us-west-2_s08A4vVxz',
    //Vào Pool Cognito của mình tạo --> General setting --> App clients --> Tìm phần App clients id
    // Lưu ý: Khi tạo App client thì bỏ tick phần Generate client secret
    ClientId: '7kg7ksnpekn5q63dbdqfbqfkcn',
}

let poolData = {
    UserPoolId : cognitoConfig.UserPoolId, // Your user pool id here
    ClientId : cognitoConfig.ClientId // Your client id here
};

exports.check_session_auth = (req, res)=>{
    let sess = req.session;
    let token = sess.token;
    let boo = false;
    
    if(token == undefined){
        console.log('TempToken is null');
        res.redirect('/admin/login')
        return false;
    }
    
    var sections = token.split('.');
    // get the kid from the headers prior to verification
    var header = jose.util.base64url.decode(sections[0]);
    header = JSON.parse(header);
    var kid = header.kid;
    // console.log("Kid is:",kid);
    
    var keys = jwk['keys'];
    // search for the kid in the downloaded public keys
    var key_index = -1;
    for (var i=0; i < keys.length; i++) {
            if (kid == keys[i].kid) {
                key_index = i;
                break;
            }
    }
    if (key_index == -1) {
        console.log('Public key not found in jwks.json');
        // callback('Public key not found in jwks.json');

        res.redirect('/admin/login')
        return false;
    } else {
        // console.log('Find key at pos:',key_index);
    }
    // construct the public key
    jose.JWK.asKey(keys[key_index]).
    then(function(result) {
        // verify the signature
        jose.JWS.createVerify(result).
        verify(token).
        then(function(result) {
            // console.log('From inside asKey Func');
            // now we can use the claims
            var claims = JSON.parse(result.payload);
            // console.log('Claims is:',claims);
            // additionally we can verify the token expiration
            current_ts = Math.floor(new Date() / 1000);
            // console.log('Current_ts is',current_ts);
            if (current_ts > claims.exp) {
                console.log('Token is expired');
                // callback('Token is expired');
                res.redirect('/admin/login')
                boo = false;
            }
            // and the Audience (use claims.client_id if verifying an access token)

            if (claims.client_id != cognitoConfig.ClientId) {
                console.log('Token was not issued for this audience');
                // callback('Token was not issued for this audience');
                res.redirect('/admin/login')
                boo = false;
            }
            
            boo = true;
            // callback('Gídf');
            console.log("Validate Successfully!", boo);
        }).
        catch(function() {
            console.log('Signature verification failed');
            // callback('Signature verification failed');
            res.redirect('/admin/login')
            boo = false;
        });
    }).then(function(){
        console.log('Form then I created');
    });
    // let temp = await jose_func;
    console.log("Result is:", boo);
    return boo;
}

exports.login_authentication = (req, res) =>{
    let username = req.body.username;
    let password = req.body.password;
    let sess = req.session;

    console.log("Login for:"+username+" and pass:"+password);

    var authenticationData = {
        Username : username,
        Password : password,
    };
    // console.log("AuthenticationData",authenticationData);
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    // console.log("AuthenticationDetails",authenticationDetails);
    
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username : username,
        Pool : userPool
    };
    
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log("Login success!");
            try {
                var accessToken = result.getAccessToken().getJwtToken();
                
                // res.send(result);
                tempToken = accessToken;
                // console.log(result || JSON.stringify(err));
                
                sess.token = accessToken;
                // res.end(accessToken);
                res.redirect('/admin/product');
            } catch (error) {
                // console.log(error);
                sess.error_msg = "Đã có lỗi xảy ra! Vui lòng thử lại sau ít phút!";
                res.redirect('/admin/login')
            }
        },

        onFailure: function(err) {
            console.log("Fail to login!");
            console.log(err.message || JSON.stringify(err));
            let error_msg = sess.error_msg = "Sai tên đăng nhập hoặc mật khẩu!";
            res.render("../views/admin/page/login.ejs",{
                msg : error_msg
            });
        },

    });
}
/**
 * @author N.T.Sơn
 * Hàm có chức năng create User trong Cognito. Lưu ý là không tạo User trên Console của AWS do sẽ bị trạng thái 
 * FORCE_CHANGE_PASSWORD thì rất là rườm rà để kích hoạt nó!
 * Sau khi tạo User bằng /createUser thì vào Console AWS -> User Pool -> User and Group 
 *  -> Tìm Username mới tạo và click vào xem -> Enable
 */
exports.create_user = (req, res)=>{

    // Điền thông tin User cần tạo tại đây
    // SĐT có đấu + trước nó
    let user = {
        username: 'username',
        phone: '+01111111',
        email: '2222@gmail.com',
        password: '123456789'
    }

    var userPool = new CognitoUserPool(poolData);

    console.debug(userPool);

    var attributeList = [];

    var dataEmail = {
        Name : 'email',
        Value : user.email
    };

    var dataPhoneNumber = {
        Name : 'phone_number',
        Value : user.phone
    };
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);

    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);
    console.log("Register for "+user.username+ " password: "+user.password);

    userPool.signUp(user.username, user.password, attributeList, null, function(err, result){
        if (err) {
            res.end(err.message || JSON.stringify(err));
            return;
        } else {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            res.end("Register "+ cognitoUser.getUsername+ " completed! Please go to AWS console to enable this user!");
        }
        
    });
}
