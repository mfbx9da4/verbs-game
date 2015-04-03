// you formal and plural
// weighting for more common
// progress page is also reference page
exports.verbs = {
	go: {
			present: {
				i: 		{en: ['i go'], 		pt: ['eu vou', 'vou']},
				you: 	{en: ['you go'], 	pt: ['voce vai', 'vai']},
				he: 	{en: ['he goes'], 	pt: ['ele vai', 'vai']},
				she: 	{en: ['she goes'], 	pt: ['ela vai', 'vai']},
				we: 	{en: ['we go'], 	pt: ['nós vamos', 'vamos', 'a gente vai']},
				they: 	{en: ['they go'], 	pt: ['eles vam', 'vam']}
			},
		},
	be: {
		present : {
				i: 		{en: ['i am'], 		pt: ['eu estou', 'estou'], mes: 'Use estar'},
				you: 	{en: ['you are'], 	pt: ['voce eres', 'eres']},
				he: 	{en: ['he is'], 	pt: ['é', 'ele é']},
				she: 	{en: ['she is'], 	pt: ['é', 'ela é']},
				we: 	{en: ['we are'], 	pt: ['nós somos', 'somos']},
				they: 	{en: ['they are'], 	pt: ['eles são', 'são']}
		},
		conditional : {
				i: 		{en: ['i was'], 		pt: ['eu estava', 'estava']},
				you: 	{en: ['you were'], 		pt: ['voce estava', 'estava']},
				he: 	{en: ['he was'], 		pt: ['estava', 'ele estava']},
				she: 	{en: ['she was'], 		pt: ['estava', 'ela estava']},
				we: 	{en: ['we were'], 		pt: ['nós estavamos', 'estavamos']},
				they: 	{en: ['they were'], 	pt: ['eles estavam', 'estavam']}
		}
	},
	come: {
		past: {
				i: 		{en: ['i came'],	pt: ['eu vim', 'vim']},
				you: 	{en: ['you came'], 	pt: ['voce veio', 'veio']},
				he: 	{en: ['he came'], 	pt: ['veio', 'ele veio']},
				she: 	{en: ['she came'], 	pt: ['veio', 'ela veio']},
				we: 	{en: ['we came'], 	pt: ['viemos', 'nós viemos']},
				they: 	{en: ['they came'], pt: ['vieram', 'eles vieram']}	
		},
	have: {
		past: {
				i: 		{en: ['i had'],		pt: ['eu tinha', 'tinha']},
				you: 	{en: ['you had'], 	pt: ['voce tinha', 'tinha']},
				he: 	{en: ['he had'], 	pt: ['tinha', 'ele tinha']},
				she: 	{en: ['she had'], 	pt: ['tinha', 'ela tinha']},
				we: 	{en: ['we had'], 	pt: ['tinhamos', 'nós tinhamos']},
				they: 	{en: ['they had'], 	pt: ['tinham', 'eles tinham']}	

		}
	}
	}
};

exports.max_id = 0;

exports.assign_ids = function () {
	var exports = this;
	var id = 0;
	for (var i in exports.verbs) {
		var word = exports.verbs[i];
		for (var j in word) {
			var tense = word[j];
			for (var k in tense) {
				var person = tense[k];
				person.id = id;
				id ++;
			}
		}
	}
	return exports.verbs;
};

exports.get_id_map = function() {
	var exports = this;
	exports.id_map = {};
	for (var i in exports.verbs) {
		var word = exports.verbs[i];
		for (var j in word) {
			var tense = word[j];
			for (var k in tense) {
				var person = tense[k];
				var id = person.id;
				exports.id_map[id] = person;
				exports.max_id = id;
			}
		}
	}
	return exports.id_map;
};

exports.init = function () {
	var exports = this;
	exports.assign_ids();
	exports.get_id_map();
	return exports;
}