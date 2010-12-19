var CouchClient = require('couch-client'),
	Users = CouchClient("http://localhost:5984/artist_users"),
	crypto = require('crypto'),
	Authenticate = require('./authentication');
	
function User() {
   
	function create(auth, req, callback){
		
		var user_attributes = req.body;
		var key = auth.encryption_key;
		var iv = auth.iv;
		var auth = Authenticate(key, iv);

		var encrypted_password = auth.encrypt(user_attributes.password);
		
		var user = {
			username: user_attributes.username,
			password: encrypted_password,
			email_address: user_attributes.email_address,
			agree_to_terms: user_attributes.agree_to_terms
		};
		
		Users.save(user, function ( err, doc) {
			return callback(doc);
		});
		
	};
  
  // Exposes the API.
  return {
    create: create
  };
  
};

module.exports = User;