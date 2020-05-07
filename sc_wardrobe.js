var sc_wardrobe = {}
sc_wardrobe.BODY_AREAS = ["feet","legs","bottom","chest","neck","head"];
sc_wardrobe.WEARING_LAYER = {"underwear":1 ,"wear":2, "coat":3};
sc_wardrobe.LAUDRY_FREQUENCIES = { "delicate":14, "iron":7, "no_iron":2};
sc_wardrobe.WEATHER = {
	"INDOOR": "Indoor",
	"HOT": "Hot",
	"COLD": "Cold",
	"RAINY": "Rainy",
	"MIRROR": "Mirror"
};
sc_wardrobe.FORMALITY = {
	"OFFICE": "Office",
	"TARINING": "Training",
	"CASUAL": "Casual",
	"FORMAL": "Formal",
	"SMART": "Smart",
	"NAUGTHY":"Naugthy"
};

class Wearing {
  constructor() {
			for (const layer in sc_wardrobe.WEARING_LAYER) {
				this[layer] = {};
				for (const n_area in sc_wardrobe.BODY_AREAS) {
					var area = sc_wardrobe.BODY_AREAS[n_area];
					this[layer][area] = [];
				}
			}
  }
	
	get_layer_key(item) {
		var layer = item.wearing_layer;
		switch (layer) {
			case sc_wardrobe.WEARING_LAYER.underwear:
				return "underwear";
			case sc_wardrobe.WEARING_LAYER.wear:
				return "wear";
			case sc_wardrobe.WEARING_LAYER.coat:
				return "coat";
		}
		return "";
	}
	
	dressup(item) {
		var area = item.body_area;
		var layer = this.get_layer_key(item);
		this.strip(item);
		this[layer][area].push(item);
		return this;
	}
	
	strip(item) {
		var area = item.body_area;
		var layer = this.get_layer_key(item);
		for (const idx in this[layer][area]) {
			if (this[layer][area][idx].id === item.id) {
				this[layer][area].splice(idx, 1);
				return this;
			}
		}
		return this;
	}
	
	replace (item) {
		var area = item.body_area;
		var layer = this.get_layer_key(item);
		this[layer][area].length = 0; 
		this[layer][area].push(item);
		return this;
	}
	
	strip_off() {
		for (const layer in sc_wardrobe.WEARING_LAYER) {
			for (const n_area in sc_wardrobe.BODY_AREAS) {
				var area = sc_wardrobe.BODY_AREAS[n_area];
				this[layer][area].length = 0; 
			}
		}
		return this;
	}
	
	get_clothes() {
		var all_clothes = [];
		for (const layer in sc_wardrobe.WEARING_LAYER) {
			for (const n_area in sc_wardrobe.BODY_AREAS) {
				var area = sc_wardrobe.BODY_AREAS[n_area];
				for (const item in this[layer][area]) {
					all_clothes.push(this[layer][area][item]);
				}
			}
		}
		return all_clothes;
	}
}

class Clothes {
  constructor(name, size, body_area, wearing_layer, laundry_frequence) {
    this.name = name;
		this.size = size;
		this.body_area = body_area;
		this.wearing_layer = wearing_layer;
		this.laundry_frequence = laundry_frequence;
		this.id = "" + new Date().getTime() + this.size + this.body_area + this.wearing_layer + this.laundry_frequence;
  }
	clone() {
		return new Clothes(
			this.name,
			this.size,
			this.body_area,
			this.wearing_layer,
			this.laundry_frequence);
	}
	
	get_name() {
		return this.name;
	}
	get_info() {
		var info = this.body_area;
		info += " (" + this.size +" wsp)"; //wardrobe store points
		switch (this.wearing_layer){
			case sc_wardrobe.WEARING_LAYER.underwear:
				info += ", underwear";
				break;
			case sc_wardrobe.WEARING_LAYER.coat:
				info += ", coat";
				break
		}
		switch (this.laundry_frequence){
			case sc_wardrobe.LAUDRY_FREQUENCIES.delicate:
				info += ", delicate";
				break;
			case sc_wardrobe.LAUDRY_FREQUENCIES.no_iron:
				info += ", no-iron";
				break
		}
		return info;
	}
	
	get_z() {
		nbody_area = 0;
		switch(this.body_area){
			case "feet":
			case "bottom":
			case "neck":
				nbody_area = 2;
				break;
			case "legs":
				nbody_area = 1;
				break;
			case "chest":
				nbody_area = 3;
				break;
			case "head":
				nbody_area = 4;
				break;
		}
		return (this.wearing_layer*10) + nbody_area;
	}
}

class Storage {
  constructor() {
    this.sections = {};
  }
  add_section(id, name, size) {
		var section = {
			"max_size": size,
			"size": 0,
			"name": name,
			"clothes":{}
		};
		this.sections[id] = section;
    return this;
  }
	get_items(section_id) {
		return Object.values(this.sections[section_id].clothes);
	}
	
	draw_from(section_id, item) {
		var section = this.sections[section_id];
		var index = item.id;
		if (section.clothes.hasOwnProperty(index)) {
				delete section.clothes[index];
				section.size -= item.size;
				section.size = Math.max(section.size, 0);
				return true;
    }
		return false;
	}

	store_in(section_id, item) {
		var section = this.sections[section_id];
		var index = item.id;
		if (section.max_size >= section.size + item.size && !section.clothes.hasOwnProperty(index)) {
			this.draw(item);
			section.clothes[index] = item;
			section.size += item.size;
			return true
		}
		return false;
	}
	store(item) {
		for (const section_id in this.sections) {
			if (this.store_in(section_id, item)) {
				return true;
			}
		}
		return false;
	}
	draw(item) {
		for (const section_id in this.sections) {
			if (this.draw_from(section_id, item)) {
				  return true;
			}
		}
		return false;
	}
}

class Challenge {
  constructor(name) {
    this.occassions = [];
		this.restricted = {};
		this.submissions = [];
		this.name = name;
  }
	add_occassion(occassion) {
		this.occassions.push(occassion);
		return this;
	}
	is_not_laundry(item) {
		if (this.restricted.hasOwnProperty(item.id)) {
			return this.restricted[item.id] <= 0;
		}
		return true;
	}

	is_completed(){
		return this.occassions.length <= 0
	}
	
	submit(clothes) {
		// laundry
		for (const idx in this.restricted) {
			this.restricted[idx] -= 1;
			if (this.restricted[idx]) {
				delete this.restricted[idx]; 
			}
		}
		// new laundry
		for (const idx in clothes) {
			this.restricted[clothes[idx].id] = clothes[idx].laundry_frequence;
		}
		// submission
		var occassion = this.occassions.shift();
		this.submissions.push({"occassion":occassion,"model":clothes});
		
		return this.is_completed();
	}
	
}

class Occassion {
  constructor(name, weather) {
    this.name = name;
		this.weather = weather;
		this.formality = {};
  }
	add_formality (formality_type, strenght) {
		this.formality[formality_type] = strenght;
	}
	get_name() {
		return this.name;
	}
	toFeatures() {
		var features = Object.assign({}, this.formality);
		features.weather = this.weather;
		return features;
	}
	evaluate(clothes) {
		console.log("function evaluate not implemented");
	}
}

sc_wardrobe.generate_wardrobe = function (account){
	account.wardrobe = new Storage();
	return account;
};

sc_wardrobe.generate_storage = function (account){
	account.external_storage = new Storage();
	return account;
};

sc_wardrobe.generate_dressing = function (account){
	account.dressing = new Wearing();
	return account;
};

sc_wardrobe.generate_clothes_mockup = function (name, size, body_area, wearing_layer, laundry_frequence, mockup_img_dir, colour){
	var clothes = new Clothes(colour + " " + name, size, body_area, wearing_layer, laundry_frequence);
	/* pose array = generate_poses(mockup_img_dir, hue, saturation, light) */
	return clothes;
};

sc_wardrobe.generate_challenge = function (){
	var challenge = new Challenge();
	return challenge;
};

sc_wardrobe.generate_occassion = function (name, weather){
  var occassion = new Occassion(name, weather);
	return occassion;
};


// Prototypes and repository
sc_wardrobe.prototypes = {"clothes":{}, "occassions": {}, "challenges":{}};

sc_wardrobe.prototypes.occassions = {
	"office": new Occassion("office", "indoor"),
	"gym": new Occassion("gym", "indoor"),
	"party": new Occassion("party", "indoor"),
	"mall": new Occassion("mall", "indoor"),
	"dinner": new Occassion("dinner", "indoor"),
	"ball": new Occassion("ball", "indoor"),
	"mall": new Occassion("beach", "indoor"),
	"mall": new Occassion("park", "indoor"),
	"mall": new Occassion("pool", "indoor")
};

sc_wardrobe.prototypes.challenges = {
	"working week": new Challenge("working week"),
	"weekend": new Challenge("weekend")
};

sc_wardrobe.prototypes.challenges["working week"]
	.add_occassion(sc_wardrobe.prototypes.occassions.office)
	.add_occassion(sc_wardrobe.prototypes.occassions.office)
	.add_occassion(sc_wardrobe.prototypes.occassions.office)
	.add_occassion(sc_wardrobe.prototypes.occassions.office)
	.add_occassion(sc_wardrobe.prototypes.occassions.office);

sc_wardrobe.prototypes.challenges["weekend"]
	.add_occassion(sc_wardrobe.prototypes.occassions.gym)
	.add_occassion(sc_wardrobe.prototypes.occassions.mall)
	.add_occassion(sc_wardrobe.prototypes.occassions.party)
	.add_occassion(sc_wardrobe.prototypes.occassions.beach)
	.add_occassion(sc_wardrobe.prototypes.occassions.dinner);

var basic_clothes = {};
basic_clothes[sc_wardrobe.WEARING_LAYER.underwear] = {
						"feet": ["socks", "tights", "stockings", "Hold-ups"],
						"bottom": ["brief", "thong"],
						"chest": ["bra", "bikini-bra", "swimsuit","bralette"]
					};
basic_clothes[sc_wardrobe.WEARING_LAYER.wear] = {
						"feet": ["boots","shoes","wedges","heels","trainers"],
						"bottom": ["leggings","jeans","skirt","shorts"],
						"chest": ["tank-top","dress","shirt"]
					};
basic_clothes[sc_wardrobe.WEARING_LAYER.coat] = {
						"chest": ["Jacket","coat"],
						"neck": ["scarf"],
						"head": ["hat"]
					};

for (const iwl in sc_wardrobe.WEARING_LAYER) {
		for (const iba in sc_wardrobe.BODY_AREAS) {
			var wl = sc_wardrobe.WEARING_LAYER[iwl];
			var ba = sc_wardrobe.BODY_AREAS[iba];
			for (const basic in basic_clothes[wl][ba]) {
				var basic_name = basic_clothes[wl][ba][basic];
				sc_wardrobe.prototypes.clothes[basic_name] =  new Clothes(basic_name, 1, ba, wl, sc_wardrobe.LAUDRY_FREQUENCIES.iron);
			}
		}	
}
