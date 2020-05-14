var sc_wardrobe = {};

class Img_repository {
	constructor() {
		this.repository = {};
	}
	get_img (id) {
		return this.repository[id];
	}
	set_img (id, blob) {
		this.repository[id] = blob;
	}
	to_selection (filter) {
		var json = {};
		for (const id in filter) {
			json[filter[id]] = this.repository[filter[id]];
		}
		return json;
	}
	load_json (stored) {
		for (const id in stored) {
			this.repository[id] = stored[id];
		}
		return this;
	}
}

class Wearing {
	constructor() {
			for (const layer in Clothes.WEARING_LAYER) {
				this[layer] = {};
				for (const n_area in Clothes.BODY_AREAS) {
					var area = Clothes.BODY_AREAS[n_area];
					this[layer][area] = [];
				}
			}
  }
	
	get_layer_key(item) {
		var layer = item.wearing_layer;
		switch (layer) {
			case Clothes.WEARING_LAYER.underwear:
				return "underwear";
			case Clothes.WEARING_LAYER.wear:
				return "wear";
			case Clothes.WEARING_LAYER.coat:
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
		for (const layer in Clothes.WEARING_LAYER) {
			for (const n_area in Clothes.BODY_AREAS) {
				var area = Clothes.BODY_AREAS[n_area];
				this[layer][area].length = 0; 
			}
		}
		return this;
	}
	
	get_clothes() {
		var all_clothes = [];
		for (const layer in Clothes.WEARING_LAYER) {
			for (const n_area in Clothes.BODY_AREAS) {
				var area = Clothes.BODY_AREAS[n_area];
				for (const item in this[layer][area]) {
					all_clothes.push(this[layer][area][item]);
				}
			}
		}
		return all_clothes;
	}
	
	is_wearing (item) {
		for (const layer in Clothes.WEARING_LAYER) {
			for (const n_area in Clothes.BODY_AREAS) {
				var area = Clothes.BODY_AREAS[n_area];
				if (this[layer][area].includes(item) => 0)
					return true;
			}
		}
		return false;
	}
}

class Clothes {
	static BODY_AREAS = ["feet","legs","bottom","chest","neck","head"];
	static WEARING_LAYER = {"underwear":1 ,"wear":2, "coat":3};
	static LAUDRY_FREQUENCIES = { "delicate":14, "iron":7, "no_iron":2};
	static img_repo = new Img_repository();

  constructor(name, size, body_area, wearing_layer, laundry_frequence) {
    this.name = name;
		this.size = Number(size);
		this.body_area = body_area;
		this.wearing_layer = wearing_layer;
		this.laundry_frequence = laundry_frequence;
		this.id = "" + new Date().getTime() + this.size + this.body_area + this.wearing_layer + this.laundry_frequence;
	  	this.folded_img = "folded_" + this.id;
	  	this.wearing_img = "wearing_" + this.id;
  }
	prototype_clone() {
		var item= new Clothes(
			this.name,
			this.size,
			this.body_area,
			this.wearing_layer,
			this.laundry_frequence);
		item.folded_img = this.folded_img;
		item.wearing_img = this.wearing_img;
		return item;
	}
	
	get_name() {
		return this.name;
	}
	get_wearing_img () {
		return Clothes.img_repo.get_img(this.wearing_img);
	}
	get_folded_img () {
		return Clothes.img_repo.get_img(this.folded_img);
	}
	set_wearing_img_blob (blob) {
		this.wearing_img = "wearing_" + this.id;
		Clothes.img_repo.set_img(this.wearing_img, blob);
		return this;
	}
	set_folded_img_blob (blob) {
		this.folded_img = "folded_" + this.id;
		Clothes.img_repo.set_img(this.folded_img, blob);
		return this;
	}
	get_info() {
		var info = this.body_area;
		info += " (" + this.size +" wsp)"; //wardrobe store points
		switch (this.wearing_layer){
			case Clothes.WEARING_LAYER.underwear:
				info += ", underwear";
				break;
			case Clothes.WEARING_LAYER.coat:
				info += ", coat";
				break
		}
		switch (this.laundry_frequence){
			case Clothes.LAUDRY_FREQUENCIES.delicate:
				info += ", delicate";
				break;
			case Clothes.LAUDRY_FREQUENCIES.no_iron:
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
				section.size -= Number(item.size);
				section.size = Math.max(section.size, 0);
				return true;
    }
		return false;
	}

	store_in(section_id, item) {
		var section = this.sections[section_id];
		var index = item.id;
		if (section.max_size >= section.size + Number(item.size) && !section.clothes.hasOwnProperty(index)) {
			this.draw(item);
			section.clothes[index] = item;
			section.size += Number(item.size);
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
	static WEATHER = {
		"INDOOR": "Indoor",
		"HOT": "Hot",
		"COLD": "Cold",
		"RAINY": "Rainy",
		"MIRROR": "Mirror"
	};
	static FORMALITY = {
		"OFFICE": "Office",
		"TARINING": "Training",
		"CASUAL": "Casual",
		"FORMAL": "Formal",
		"SMART": "Smart",
		"NAUGTHY":"Naugthy"
	};
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

class Repository {
	constructor() {
		this.clothes = {};
		this.occassions = {};
		this.challenges = {};
		this.initialize_occasssions();
		this.initialize_challenges();
		this.initialize_clothes();
	}
	initialize_occasssions(){
		this.occassions = {
			"office": new Occassion("office", "indoor"),
			"gym": new Occassion("gym", "indoor"),
			"party": new Occassion("party", "indoor"),
			"mall": new Occassion("mall", "indoor"),
			"dinner": new Occassion("dinner", "indoor"),
			"ball": new Occassion("ball", "indoor"),
			"mall": new Occassion("beach", "indoor"),
			"mall": new Occassion("park", "indoor"),
			"mall": new Occassion("pool", "indoor")};
		return this;
	}
	
	initialize_challenges(){
		this.challenges = {
			"working week": new Challenge("working week"),
			"weekend": new Challenge("weekend")
		};

		this.challenges["working week"]
			.add_occassion(this.occassions.office)
			.add_occassion(this.occassions.office)
			.add_occassion(this.occassions.office)
			.add_occassion(this.occassions.office)
			.add_occassion(this.occassions.office);

		this.challenges["weekend"]
			.add_occassion(this.occassions.gym)
			.add_occassion(this.occassions.mall)
			.add_occassion(this.occassions.party)
			.add_occassion(this.occassions.beach)
			.add_occassion(this.occassions.dinner);
		return this;
	}
	initialize_clothes(){
		var basic_clothes = {};
		basic_clothes[Clothes.WEARING_LAYER.underwear] = {
								"feet": ["socks", "tights", "stockings", "Hold-ups"],
								"bottom": ["brief", "thong"],
								"chest": ["bra", "bikini-bra", "swimsuit","bralette"]
							};
		basic_clothes[Clothes.WEARING_LAYER.wear] = {
								"feet": ["boots","shoes","wedges","heels","trainers"],
								"bottom": ["leggings","jeans","skirt","shorts"],
								"chest": ["tank-top","dress","shirt"]
							};
		basic_clothes[Clothes.WEARING_LAYER.coat] = {
								"chest": ["Jacket","coat"],
								"neck": ["scarf"],
								"head": ["hat"]
							};

		for (const iwl in Clothes.WEARING_LAYER) {
				for (const iba in Clothes.BODY_AREAS) {
					var wl = Clothes.WEARING_LAYER[iwl];
					var ba = Clothes.BODY_AREAS[iba];
					for (const basic in basic_clothes[wl][ba]) {
						var basic_name = basic_clothes[wl][ba][basic];
						this.clothes[basic_name] =  new Clothes(basic_name, 1, ba, wl, Clothes.LAUDRY_FREQUENCIES.iron);
					}
				}	
		}
		return this;
	}
	static export_to_file (json_object, name) {
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json_object));
		var downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute("href",     dataStr);
		downloadAnchorNode.setAttribute("download", name + ".json");
		document.body.appendChild(downloadAnchorNode); // required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}
	
	get_clothes_images () {
		const filter = [];
		for (const idx in this.clothes) {
			if(filter.indexOf(this.clothes[idx].wearing_img) === -1) {
				filter.push(this.clothes[idx].wearing_img);
			}
			if(filter.indexOf(this.clothes[idx].folded_img) === -1) {
				filter.push(this.clothes[idx].folded_img);
			}
		}
		return Clothes.img_repo.to_selection (filter);
	}
	
	export_clothes () {
		Repository.export_to_file({"clothes": this.clothes, "images": this.get_clothes_images()}, "collection");
		return this;
	};

	import_clothes (stored) {
		Clothes.img_repo.load_json(stored.images);
		for (const idx in stored.clothes) {
			var item = stored.clothes[idx];
			this.clothes[item.name] = new Clothes(item.name, item.size, item.body_area, item.wearing_layer, item.laundry_frequence);
			this.clothes[item.name].id = item.id;
			this.clothes[item.name].wearing_img = item.wearing_img;
			this.clothes[item.name].folded_img = item.folded_img;
		}
		return this.clothes;
	};
}

//
// Proxies
// Twine has problems accessing directly to the Classes, hence we provide an proxy interface embeded in sc_wardrobe
//
sc_wardrobe.prototypes = new Repository();

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

//
// Backwards compability
//
sc_wardrobe.BODY_AREAS = Clothes.BODY_AREAS;
sc_wardrobe.WEARING_LAYER = Clothes.WEARING_LAYER;
sc_wardrobe.LAUDRY_FREQUENCIES = Clothes.LAUDRY_FREQUENCIES;
sc_wardrobe.WEATHER = Occassion.WEATHER;
sc_wardrobe.FORMALITY = Occassion.FORMALITY;



