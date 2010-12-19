var crypto = require("./crypto");

function Authenticate(key, iv) {

	var encryption_key = key;
	var iv = iv;
	var cipher_type = "aes-256-cbc";
	
	// Encrypts a string
	function encrypt(string){
		var cipher = new crypto.Cipher();
		cipher.initiv(cipher_type, encryption_key, iv);	
		var ciph = cipher.update(string, 'utf8', 'hex');
		ciph += cipher.final('hex');
		return ciph;
	};
	
	// Decrypts a string
	function decrypt(ciphered_password){
		var decipher = new crypto.Decipher();
		decipher.initiv(cipher_type, encryption_key,iv);
		var txt = decipher.update(ciphered_password, 'hex', 'utf8');
		txt += decipher.final('utf8');
		return txt;
	};
	
	// Exposes the API.
  return {
    encrypt: encrypt,
		decrypt: decrypt
  };
  
}

module.exports = Authenticate;