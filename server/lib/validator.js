/*
  Validator.

  Useage:
  var validator = require('validator');

  validator.config = {
    username: ['validates_presence_of', 'validates_uniqueness_of',
               {func: 'validates_format_of', rule:'single_word'},
               {func:'validates_max_length',rule:20},
               {func: 'validates_min_length',rule:3}],
    email_address: [{func:'validates_format_of', rule:'email_address'}],
    password: [{func:'validates_equality_of',rule:user_attributes.confirm_password}],
    agree_to_terms:[{func:'validates_equality_of',rule:'true'}]
  };

  validator.validate(user);
  if (validator.hasErrors()) {
    // errors are present... You can get the errors by doing validator.messages
  }else{
    // all data is clean... proceed
  }

*/



_ = require('underscore');

var validator = {
  types: {},
  messages: {},
  config: {},

  validate: function(data){
    var i, msg, type, checker, result_ok;
    this.messages = [];
    for(i in data){
      if(data.hasOwnProperty(i)){
        types = this.config[i]; // Get the types of validation to apply to

        for (var j=0; j < types.length; j++) {
          if(_.isString(types[j])){
            var validation_method = types[j];

            // Holds the attribute data (i.e user.email_address, user.login, etc...)
            var user_attribute_data = data[i];

            // checker is the actual function to call
            checker = this.types[validation_method];

            if (!checker) { // uh-oh
              throw {
                name: "ValidationError",
                message: "No handler to validate type " + checker
              };
            };

            // Call the validation method. result_ok will either be true or false
            result_ok = checker.validate(user_attribute_data);

            if(!result_ok){
              msg = {attribute: i, message: checker.instructions};
              this.messages.push(msg);
            }

          }else{  // Meaning the validation method argument is a hash and has an argument
            var func = _.values(types[j])[0]; // the function to call (i.e validates_max_length)
            var arg = _.values(types[j])[1];  // the argument of the function (i.e 30)

            var validation_method = func;

            // Holds the attribute data (i.e user.email_address, user.login, etc...)
            var user_attribute_data = data[i];

            // checker is the actual function to call
            checker = this.types[func];

            if (!checker) { // uh-oh
              throw {
                name: "ValidationError",
                message: "No handler to validate type " + checker
              };
            };

            // Call the validation method. result_ok will either be true or false
            result_ok = checker.validate(user_attribute_data,arg);

            if(!result_ok){
              msg = {attribute: i, message: checker.instructions};
              this.messages.push(msg);
            }
          }
        };
      }
    }
    return this.hasErrors();
  },

  hasErrors: function(){
    return this.messages.length !== 0;
  }
};

validator.types.validates_presence_of = {
  validate: function(value){
    var is_valid_string = value.length > 0;
    return is_valid_string;
  },
  instructions: "The value must be present"
};

validator.types.validates_max_length = {
  validate: function(value, max_length){
    var is_valid_string = value.length <= max_length;
    return is_valid_string;
  },
  instructions: "Exceeds the maximum length"
};

validator.types.validates_min_length = {
  validate: function(value, min_length){
    var is_valid_string = value.length >= min_length;
    return is_valid_string;
  },
  instructions: "Is too short"
};

validator.types.validates_format_of = {
  validate: function(value, rule){
    if(rule == "single_word"){
      return value.match(/\b\w*\b/) == value;
    }else if(rule == "email_address"){
      return value.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/) == value;
    }
  },
  instructions: "Is improperly formatted"
};

validator.types.validates_equality_of = {
  validate: function(value, equal_to){
    return value == equal_to;
  },
  instructions: "Is not equal"
};

validator.types.validates_uniqueness_of = {
  validate: function(value){
    return true;
  },
  instructions: "Must be unique"
};

module.exports = validator;