/////////////
/////////////
///////////// L0 literal listener scalar implicature studies
///////////// Authors: Ben Peloquin, Mike Frank
/////////////
/////////////


// Helpers
// -------

// Shows slides. We're using jQuery here - the **$** is the jQuery selector function,
// which takes as input either a DOM element or a CSS selector string.
function showSlide(id) {
	// Hide all slides
	$(".slide").hide();
	// Show just the slide we want to show
	$("#"+id).show();
}

// Get random integers.
// When called with no arguments, it returns either 0 or 1.
// When called with one argument, *a*, it returns a number in {*0, 1, ..., a-1*}.
// When called with two arguments, *a* and *b*, returns a random value in {*a*, *a + 1*, ... , *b*}.
function random(a,b) {
	if (typeof b == "undefined") {
		a = a || 2;
		return Math.floor(Math.random()*a);
	} else {
		return Math.floor(Math.random()*(b-a+1)) + a;
	}
}

// Add a random selection function to all arrays (e.g., <code>[4,8,7].random()</code>
// could return 4, 8, or 7). This is useful for condition randomization.
Array.prototype.random = function() {
  return this[random(this.length)];
}

// shuffle function - from stackoverflow?
// shuffle ordering of argument array -- are we missing a parenthesis?
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

// Experiment
// ----------
var DOMAIN = "movie"; // Change this between expt's
var NUM_ITEMS = 21;
var NUM_STARS = 5;
var NUM_TRAINING_TRIALS = 2;
var NUM_NON_TRAINING_TRIALS = NUM_ITEMS * NUM_STARS;
var TOTAL_TRIALS = NUM_TRAINING_TRIALS + NUM_NON_TRAINING_TRIALS;
var training_stimuli = ["high", "low"];
var verbs = 	[
				"loved",
				"liked",
				"tolerated",
				"disliked",
				"hated"
				];
var non_verbs = [
				"great",
				"good",
				"okay",
				"bad",
				"terrible",
				"excellent",
				"average",
				"unforgettable",
				"memorable",
				"ordinary",
				"boring",
				"forgettable",
				"special",
				"unique",
				"common",
				"different"
				];
function verb_sent(target_scalar, domain) {
	return "<b>" + target_scalar + "</b> the " + domain + "?";
}
function non_verb_sent(target_scalar, domain) {
	return "thought the " + domain + " was <b>" + target_scalar + "</b>?";
}
function training_sent(target_scalar, domain) {
	return "thought the " + domain + " deserved a <b>" + target_scalar + "</b> rating?";
}
function create_sent(target_scalar, domain) {
	// training trial
	if (training_stimuli.indexOf(target_scalar) != -1) {
		return training_sent(target_scalar, domain);
	}
	// verbs
	else if (verbs.indexOf(target_scalar) != -1) {
		return verb_sent(target_scalar, domain);
	}
	// non-verbs
	else {
		return non_verb_sent(target_scalar, domain);
	}
}

// All stimuli without random ordering
var all_stimuli = training_stimuli.concat(verbs, non_verbs);

// Trial params
// var TOTAL_TRIALS = all_stimuli.length;
var trials = [];
for(var i = TOTAL_TRIALS; i > 0; --i) {
	trials.push(i);
}
var star_amount = ["20", "40", "60", "80", "100"];

// Instructions slide
showSlide("instructions");

// Experiment
var experiment = {
    data: {
		item: [], 			// scalar item (i.e. good or excellent)
		stars: [],			// # of stars displayed (i.e. 1-5 stars)
		judgment: [],		// participant response (i.e. "yes" or "no")
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

    // Log response
    log_response: function() {
		var response_logged = false;
		//Array of radio buttons
		var radio = document.getElementsByName("judgment");
		
		// Loop through radio buttons
		for (i = 0; i < radio.length; i++) {
		    if (radio[i].checked) {
				experiment.data.judgment.push(radio[i].value); // log response
				response_logged = true;		    
		    }
		}
		
		if (response_logged) {
		    nextButton.blur();
		    
		    // Uncheck radio buttons
		    for (i = 0; i < radio.length; i++) {
				radio[i].checked = false
		    }
		    experiment.next(); //Move to next condition
		} else {
			// Else respondent didn't make a response
		    $("#testMessage").html('<font color="red">' + 
					   'Please make a response!' + 
					   '</font>');
		}
	},
    // Go to next trial
    next: function() {
    	// If no trials are left go to debriefing
		if (!trials.length) {
			return experiment.debriefing();
		}
		// Allow experiment to start if it's a turk worker OR if it's a test run
		if (window.self == window.top || turk.workerId.length > 0) {
		    // Clear the test message and adjust progress bar
		    $("#testMessage").html('');  
		    $("#prog").attr("style","width:" +
				    String(100 * ((TOTAL_TRIALS - trials.length)/TOTAL_TRIALS)) + "%");
		    
		    // Training trials
		    if(trials.length > TOTAL_TRIALS - NUM_TRAINING_TRIALS) {
		    	// First training trial
		    	if (trials.length == TOTAL_TRIALS) {
			    	current_trial_num = trials.shift();   	// "high"
			    	current_scalar = all_stimuli.shift(); 	// remove "high";
			    	current_star = "100";
			    } // Second training trial
			    else {
			    	current_trial_num = trials.shift();		// "low"
			    	current_scalar = all_stimuli.shift();	// remove "low"
			    	current_star = "20";
		    	} 
		    } 
		    // Actual trials
		    else if (trials.length == TOTAL_TRIALS - training_stimuli.length) {
		    	trials = shuffle(trials); // Randomize remaining trials here (only once)
		    	current_trial_num = trials.shift();
		    	current_scalar = all_stimuli[current_trial_num % NUM_ITEMS];
			    current_star = star_amount[current_trial_num % NUM_STARS];
		    } else {
		    	current_trial_num = trials.shift();
		    	current_scalar = all_stimuli[current_trial_num % NUM_ITEMS];
			    current_star = star_amount[current_trial_num % NUM_STARS];
		    }
			sent_materials = create_sent(current_scalar, DOMAIN)

		    // Display trials
		    $("#domain").html("When rating a " + DOMAIN + " someone gave this many stars: ");
			$(".rating-stars").attr("style", "width: " + current_star + "%");
		    $("#sent_question").html("Do you think the person " + sent_materials);

		    // Log data
		    experiment.data.item.push(current_scalar);
		    experiment.data.stars.push(current_star);
		    
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
