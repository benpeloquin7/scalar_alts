/////////////
/////////////
///////////// L1 pragmatic listener scalar implicature studies
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

// Set current domain
var DOMAIN = "restaurant"; // Change this between expt's
var NUM_ITEMS = 21;
var NUM_TRAINING_TRIALS = 2;
var TOTAL_TRIALS = NUM_ITEMS + NUM_TRAINING_TRIALS;
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
	return "<b>" + target_scalar + "</b> the " + domain + ".";
}
function non_verb_sent(target_scalar, domain) {
	return "thought the " + domain + " was <b>" + target_scalar + "</b>.";
}
function training_sent(target_scalar, domain) {
	return "thought the " + domain + " deserved a <b>" + target_scalar + "</b> rating.";
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
var trials = training_stimuli.concat(verbs, non_verbs); // this is `all_stimuli` in L0 studies

// Show the instructions slide -- this is what we want subjects to see first.
showSlide("instructions");

// Experiment
var experiment = {
    data: {
		item: [], 			// scalar item (i.e. good or excellent)
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

		var judgment = $(".rating-stars").attr("style");
		judgment = parseInt(judgment.replace(/[^\d.]/g, ''));
		//console.log("judgment: ", judgment); for debuggging
		if (judgment == 0) {
			// Else respondent didn't make a response
		    $("#testMessage").html('<font color="red">' + 
					   'Please make a response!' + 
					   '</font>');
		    judgment = $(".rating-stars").attr("style");
		    judgment = parseInt(judgment.replace(/[^\d.]/g, ''));
		} else {
			// Log judgment
			judgment /= 20;
			experiment.data.judgment.push(judgment);
			nextButton.blur();
			experiment.next();
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
		    $("#prog").attr("style", "width:" +
				    String(100 * (1 - trials.length/TOTAL_TRIALS)) + "%");

		    // Shuffle after two training trials
		    if (trials.length == TOTAL_TRIALS - NUM_TRAINING_TRIALS) {
		    	console.log("shuffling!!!")
		    	trials = shuffle(trials);
		    }
		    current_scalar = trials.shift();
			sent_materials = create_sent(current_scalar, DOMAIN)
			
		    // Display trials
		    $("#sent_question").html("Someone said they "+
					     sent_materials);

		    $("#rating-stars").on("click", 
			    	function(event) {
						var selection = $("#rating-stars").val();
			});
		    
		   	// Log data
		    experiment.data.item.push(current_scalar);

		    showSlide("stage");

			// Clear stars
			$(".rating-stars").attr({"style":"width: 0%"});
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
