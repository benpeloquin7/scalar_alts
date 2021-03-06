//////////////
//////////////
////////////// empirical_alts_template.js
////////////// 
//////////////



// =========================================================
// Helpers
// =========================================================


// showSlide()
//------------
// Shows slides
// We're using jQuery here - the **$** is the jQuery selector function,
// which takes as input either a DOM element or a CSS selector string.
//
function showSlide(id) {
	// Hide all slides
	$(".slide").hide();
	// Show just the slide we want to show
	$("#"+id).show();
}

// random()
// --------
// Get random integers.
// When called with no arguments, it returns either 0 or 1.
// When called with one argument, *a*, it returns a number in {*0, 1, ..., a-1*}.
// When called with two arguments, *a* and *b*,
// returns a random value in {*a*, *a + 1*, ... , *b*}.
//
function random(a,b) {
	if (typeof b == "undefined") {
		a = a || 2;
		return Math.floor(Math.random()*a);
	} else {
		return Math.floor(Math.random()*(b-a+1)) + a;
	}
}
// Add a random selection function to all arrays
// (e.g., <code>[4,8,7].random()</code> could return 4, 8, or 7).
// This is useful for condition randomization.
Array.prototype.random = function() {
  return this[random(this.length)];
}

// shuffle()
// ---------
// shuffle function - from stackoverflow?
// shuffle ordering of argument array -- are we missing a parenthesis?
//
function shuffle (a) { 
	var o = [];

	for (var i=0; i < a.length; i++) {
		o[i] = a[i];
	}

	for (var j, x, i = o.length;
	 i;
	 j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);	
	return o;
}

// =========================================================
// Current study
// =========================================================

var DOMAIN = "game"

// all domamains
// -------------
// book
// restaurant
// movie
// play
// album
// game

// Stimuli
// -------
var sents = {
    scale: {
		training: {
		    strong: "high",
		    weak: "low",
		    before: " thought the " + DOMAIN + " deserved a ",
		    after: " rating."
		},
		bad_terrible: {
		    strong: "terrible",
		    weak: "bad",
		    before: " thought the " + DOMAIN + " was ",
		    after: "."
		},
		disliked_hated: {		   
		    // strong: "<font color=\"blue\"><b>hated</b></font>",
		    // weak: "<font color=\"blue\"><b>disliked</b></font>",
		    strong: "hated",
		    weak: "disliked",
		    before: " ",
		    after: " the " + DOMAIN + "."
		},
		good_excellent: {
			strong: "excellent",
			weak: "good",
		    before: " thought the " + DOMAIN + " was ",
		    after: "."
		},
		liked_loved: {		   
		    strong: "loved",
		    weak: "liked",
		    before: " ",
		    after: " the " + DOMAIN + "."
		},
		memorable_unforgettable: {
			strong: "unforgettable",
			weak: "memorable",
		    before: " thought the " + DOMAIN + " was ",
		    after: "."
		},
		special_unique: {
			strong: "unique",
			weak: "special",
		    before: " thought the " + DOMAIN + " was ",
		    after: "."
		}
    },
};

// Trial data
// ----------
var TOTAL_TRIALS = (Object.keys(sents.scale).length - 1) * 2; 	// strong and weak items
															   	// for all pairs except training		
var TRAINING_ROUNDS = 2;									   	// 2 training rounds
var trials = [];
for(var i = 0; i < TOTAL_TRIALS; i++) {
	trials.push(i);
}
trials = shuffle(trials); 										// randomize trials
var scales = Object.keys(sents.scale);							// array of target scales
scales.shift(); 												// remove 'training1' trial from scales array
var scale_degrees = ["strong", "weak"];							// store degrees


// Show instruction slide
// ----------------------
// (this is what we want subjects to see first.)
showSlide("instructions");

// Main event
// ----------
var experiment = {
    
    // Data log
    data: {
    	domain: [],
		scale: [],
		degree: [],
		alt1: [],
		alt2: [],
		alt3: [],
		language: [],
		expt_aim: [],
		expt_gen: [],
		age: [],
		gender:[]
    },
    
    // End the experiment
    end: function() {
		showSlide("finished");
		setTimeout(function() {
		    turk.submit(experiment.data)
		}, 1500);
    },

    // Remove user entered text
    reset_form: function() {
    	document.getElementById("alt1").value = "";
		document.getElementById("alt2").value = "";
		document.getElementById("alt3").value = "";	
    },
 	
 	// returns True if entry in form
    check_all_filled: function() {
    	var box_1 = document.getElementById("alt1");
    	var box_2 = document.getElementById("alt2");
    	var box_3 = document.getElementById("alt3");
		return(box_1.value != "" && box_2.value != "" && box_3.value != "");
    },
    
    // checks that users have input only a single word
    check_correct_input: function() {
    	var box_1 = document.getElementById("alt1");
    	var box_2 = document.getElementById("alt2");
    	var box_3 = document.getElementById("alt3");

		return(experiment.single_word_response(box_1.value) &&
			experiment.single_word_response(box_2.value) &&
			experiment.single_word_response(box_3.value));
    },
    
    // Checks if array of strings contains more than one 
    // string. If so checks for mistaken white spaces
    single_word_response: function(str) {
    	console.log(str);
    	var num_words = 0;								// track number of word elements
    	var splt_str = str.split(" ");
    	str_len = splt_str.length
    	if (str_len > 1) {
    		for (var i = 0; i < str_len; i++) {
    			if (splt_str[i] != "") num_words += 1;	// track non empty string words
    		}
    	} else return true;
    	return (num_words == 1) ? true : false;
    },
    
    // Log response
    log_response: function() {
		var all_filled = experiment.check_all_filled();
		var correct_input = experiment.check_correct_input();
		if (!all_filled) {
			$("#testMessage").html('<br><font color="red">' + 
					   'Please make all three responses!' + 
					   '</font>');
		} else if (!correct_input) {
			$("#testMessage").html('<br><font color="red">' + 
					   'Please include only one word responses!' + 
					   '</font>');
		} else {
			var alt1 = document.getElementById("alt1").value;
			var alt2 = document.getElementById("alt2").value;
			var alt3 = document.getElementById("alt3").value;			
			experiment.data.alt1.push(alt1);
			experiment.data.alt2.push(alt2);
			experiment.data.alt3.push(alt3);

			nextButton.blur();
			experiment.next();
		}
		return;
	},
    
    // Run every trial
    next: function() {
    	experiment.reset_form();
    	
    	// If no trials are left go to debriefing
		if (!trials.length) {
			return experiment.debriefing();
		}
		
		// Allow experiment to start if it's a turk worker OR if it's a test run
		if (window.self == window.top || turk.workerId.length > 0) {
		    // Clear the test message and adjust progress bar
		    $("#testMessage").html("");  
		    $("#prog").attr("style","width:" +
				    String(100 * ((TOTAL_TRIALS - trials.length)/TOTAL_TRIALS)) + "%");
		    
		    // Current stimuli indices
		    if (TRAINING_ROUNDS == 2) {
		     	current_scale = "training";
		     	degree = "strong";
		     	TRAINING_ROUNDS--;
		    } else if (TRAINING_ROUNDS == 1) {
		    	current_scale = "training";
		     	degree = "weak";
		     	TRAINING_ROUNDS--;
		    } else {
			    current_trial = trials.shift();
			    current_scale = scales[Math.floor(current_trial / 2)];
			    degree = scale_degrees[current_trial % 2];	
		    }

		    // Compile sentence material
			sent_materials = sents.scale[current_scale]["before"] + 
							 sents.scale[current_scale][degree] +
							 sents.scale[current_scale]["after"];
		    
		    // Display trial information
		    // $("#sent_question").html("\"In a recent <b>restaurant review</b> someone said they " +
		    // 	sent_materials + "\"");
		    $("#sent_question").html("\"In a recent <b>" + DOMAIN + " review</b> someone said they " +
		    	sents.scale[current_scale]["before"] +
		    	"<font color=\"blue\"><b>" + 
		    	sents.scale[current_scale][degree] +
		    	"</b></font>" +
		    	sents.scale[current_scale]["after"] +
		    	"\"");
		    // Secondary wording we tried for n=10 soft launch
		    // ------------------------------------------------
		    // $("#target_word").html("What are some other things they could have said instead of " +
		    // 	"'" +
		    // 	sents.scale[current_scale][degree] +
		    // 	"'?");
			// Original wording
		    // ----------------
			$("#target_word").html("If the person had felt differently about the " + DOMAIN +
				", what other words could they have used instead of '" +
		    	sents.scale[current_scale][degree] +
		    	"'?");
		    $("#before").html(sents.scale[current_scale]["before"]);

		    // Log Data
		    experiment.data.scale.push(current_scale);
		    experiment.data.degree.push(degree);
		    
		    showSlide("stage");
		}
    }, 

    // Show debrief
    debriefing: function() {
    	showSlide("debriefing");
		
		// Get age
    	var select_age = '';
    	for (i = 18; i <= 100; i++) {
    		select_age += '<option val=' + i + '>' + i + '</option>';
    	}
    	$('#age').html(select_age);    	
    },

    // Log debrief data
    submit_comments: function() {
    	experiment.data.domain.push(DOMAIN);
		experiment.data.language.push(document.getElementById("homelang").value);		// language
		experiment.data.expt_aim.push(document.getElementById("expthoughts").value);	// thoughts
		experiment.data.expt_gen.push(document.getElementById("expcomments").value);	// comments
		experiment.data.age.push(document.getElementById("age").value);					// age
		if (document.getElementById("Male").checked) {
    		experiment.data.gender.push(document.getElementById("Male").value);			// gender
    	} else {
    		experiment.data.gender.push(document.getElementById("Female").value);
    	}
		experiment.end();
    }
};
