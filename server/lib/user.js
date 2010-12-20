var CouchClient = require('couch-client'),
  Users = CouchClient("http://localhost:5984/artist_users"),
  crypto = require('crypto');
  
function User(auth) {

  function create(req, callback){   
    var user_attributes = req.body;
    var key = auth.encryption_key;
    var iv = auth.iv;

    var encrypted_password = auth.encrypt(user_attributes.password);
    
    var user = {
      username: user_attributes.username,
      password: encrypted_password,
      email_address: user_attributes.email_address,
      agree_to_terms: user_attributes.agree_to_terms
    };
    
    Users.save(user, function (err, doc) {
      return callback(doc);
    });
    
  };
  
  function exists(id, callback){
    var user_exists = false;
    if(id){
      Users.view('/artist_users/'+id, {}, function(err, doc){
        console.log(doc);
        if(doc){
          user_exists = true;
        };      
        callback(user_exists);
      });          
    }else{
      callback(user_exists);
    }
  };  
  
  function login(req, callback){ 
    var username = req.body.username,
      password = req.body.password;
      
    Users.view('/artist_users/_design/login/_view/UserName', {key: username}, function(err, doc){
      var result_doc = doc.rows[0]; 
      if(result_doc){
        var encrypted_password = result_doc.value.password;
        var decrypted_password = auth.decrypt(encrypted_password);
        if(decrypted_password == password){
          callback(result_doc);
        }else{
          callback(false);
        }
      }else{
        callback(false);
      }
    });
  };
  
  // Exposes the API.
  return {
    create: create,
    exists: exists,
    login: login
  };
  
  
};

module.exports = User;