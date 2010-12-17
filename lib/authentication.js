module.exports = function(options) {  
  console.log("We're in the exports");
  options= options || {};
  var that = {};
  var my = {}; 
  that.name  = options.name || "someName";
  console.log(that);
  console.log("------------");
  that.authenticate= function(request, response, callback) {
    console.log("We're in the authenticate method");
    this.success( {id:'1', name:'someUser'}, callback );
  };
  
  return that;  
};