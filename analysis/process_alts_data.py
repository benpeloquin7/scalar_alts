#################
#################
################# process_alts_data.py
################# --------------------
################# Run script with data_path to begin processing
#################
#################
import sys
import enchant
import pdb
import os
import json
import collections
import copy
from nltk import edit_distance


def check_spelling(word, d):
	"""
	Check spelling using enchant object
	"""
	return d.check(word)

def get_replacement(prompt):
	"""
	Prompt users for correct spelling
	"""
	return raw_input(prompt)

def add_to_cache(mispelled_word, corrected_word, cache):
	"""
	Add a word to our cache file
	"""
	cache[mispelled_word] = corrected_word

def change_word(word, cache = ""):
	"""
	Change a mispelled word either referencing cache
	prompting user for input
	"""
	if word in cache:
		print "--------------------"
		print "====================="
		print word + " found in cache. Replacements is " + cache[word]
		return cache[word]
	else:
		print "--------------------"
		print "====================="
		prompt = "\t" + "'" + word + "'\n...not found in cache.\nPlease enter replacement: "
		corrected_word = get_replacement(prompt)
		print "Adding {" + word + ": " + corrected_word + "} to cache"
		add_to_cache(word, corrected_word, cache)
		return corrected_word

def process_word(word, d, cache, verbose = False):
	"""
	Process a word
	If word is mispelled check cache, then prompt user
	"""
	if not check_spelling(alt, d):
		new_alt = change_word(alt, cache)	
	else:
		if verbose: print alt + " is a correct word!"
		new_alt = alt
	return new_alt


def convertLower(lst):
	"""
	convert each item in lst to lower case
	"""
	lower_list = [x.strip().lower() for x in lst]
	return lower_list

def read_one_file(f, data_hold):
	"""
	Read in data from one file `f` to data_hold structure
	"""
	with open(f) as data_file:
		data = json.load(data_file)

		# Get data
		domain = data["answers"]["data"]["domain"][0]
		scales = data["answers"]["data"]["scale"]
		degree = data["answers"]["data"]["degree"]
		alt1 = convertLower(data["answers"]["data"]["alt1"])
		alt2 = convertLower(data["answers"]["data"]["alt2"])
		alt3 = convertLower(data["answers"]["data"]["alt3"])

		## Populate data hold
		for i in range(len(scales)):
			scale = scales[i]
			d = degree[i]
			a1 = alt1[i]
			a2 = alt2[i]
			a3 = alt3[i]
			data_hold[scalars[scale][d]].extend((a1, a2, a3))

def read_all_files(dir, data_hold):
	"""
	Read in data from all files in dir.
	Wrapper function for `read_one_file()`
	"""
	files = os.listdir(dir)
	for f in files:
		read_one_file(dir + f, data_hold)

## Stimuli groupings
scalars = {
	"bad_terrible"            : {"strong": "terrible", "weak": "bad"},
	"disliked_hated"          : {"strong": "hated", "weak": "disliked"},
	"good_excellent"          : {"strong": "excellent", "weak": "good"},
	"memorable_unforgettable" : {"strong": "unforgettable", "weak": "memorable"},
	"liked_loved"             : {"strong": "loved", "weak": "liked"},
	"special_unique"          : {"strong": "unique", "weak": "special"},
	"training"                : {"strong": "high", "weak": "low"}
}

## Alts data store
alts_data = {
	"bad"          :[],
	"terrible"     :[],
	"disliked"     :[],
	"hated"        :[],
	"good"         :[],
	"excellent"    :[],
	"memorable"    :[],
	"unforgettable":[],
	"liked"        :[],
	"loved"        :[],
	"special"      :[],
	"unique"       :[],
	"high"         :[],
	"low"          :[]
}

if __name__ == '__main__':
	args = sys.argv
	if len(args) != 3:
		print "Please re-run with dir file_path with alts data (for a particular domain)"
		exit(0)
	
	## Get directory / user inputed domain for checking
	current_dir, current_domain = args[1], args[2]

	## Read in raw alts data to `alts_data`
	read_all_files(current_dir, alts_data)

	## Open cache
	cache_path = "alternatives_cache.json"
	with open(cache_path) as cache_file:
		cache = json.load(cache_file)

	
	## Enchant english dict for spell checking
	d = enchant.Dict("en_US")
	edited_alts_data = copy.deepcopy(alts_data)

	## For each scalar item, get alternatives generated
	for scalar in alts_data.keys():
		current_alts_list = alts_data[scalar]
		edited_alts_list = []
		## Spell check each alternative 
		for alt in current_alts_list:
			new_alt = process_word(alt, d, cache, True)
			edited_alts_list.append(new_alt)

		## Check that we have all the words
		assert(len(edited_alts_list) == len(current_alts_list))
		
		## Update new dict
		edited_alts_data[scalar] = edited_alts_list
	
	## Write new cache file
	with open('alternatives_cache.json', 'w') as fp:
		json.dump(cache, fp)
	
	## Write current domain alternatives
	with open(current_domain + "_corrected.json", 'w') as fp:
		json.dump(edited_alts_data, fp)

	exit(0)
    