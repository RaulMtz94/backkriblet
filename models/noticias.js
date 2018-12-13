var mongoose =	require('mongoose');
var Schema =	mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

var noticiasSchema =	new Schema({
                titulo: {	type: String,	required: false	},
                link: {	type: String,	required: false	},
                likes : {type : Number , required : false},
                description: {	type: String,	required: false	},
                pubDate: {	type: Date,	required: false	},
                img : {type : String , required : false }

},	{	collection: 'noticias' });
noticiasSchema.plugin( uniqueValidator , {message : '{PATH} debe de ser unico'});
module.exports =	mongoose.model('noticias',	noticiasSchema);