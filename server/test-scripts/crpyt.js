// var crypto = require('crypto');

var crypto = require("../lib/crypto");

var encryption_key = "BjKS9*Dk@ksd0)2-123+Qaz/ldK%A2dv";
var iv = 'Tu*2ls;SB(2[P}sD';
var cipher_type = "aes-256-cbc";

function encrypt(string){
	var cipher = new crypto.Cipher();
	cipher.initiv(cipher_type, encryption_key, iv);
	var ciph = cipher.update(string, 'utf8', 'hex');
	ciph += cipher.final('hex');
	return ciph;
};

function decrypt(ciphered_password){
	var decipher = new crypto.Decipher();
	decipher.initiv(cipher_type, encryption_key,iv);
	var txt = decipher.update(ciphered_password, 'hex', 'utf8');
	txt += decipher.final('utf8');
	return txt;
};

var cipher = encrypt("thisIsMyPassword");
console.log("Cipher is: " + cipher);  // => 3e9d9d2795cfe9be289b60cee4718df7828c745a6cfdc048cb669cf53227f4ca


var decryptCipher = decrypt(cipher);
console.log("Decrypted is: " + decryptCipher); // => thisIsMyPassword