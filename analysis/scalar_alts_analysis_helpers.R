## get_data_single_L0_file()
## -------------------------
## read in a single file from L0 or L1
##
get_data_single_file <- function(file, domain=NA, study_type="L0") {
  if (is.na(domain)) error("Must enter domain")
  if (is.na(study_type)) error("Please enter a study type of `L0` or `L1`")

  ## Answers data
  d_raw <- fromJSON(file=file)
  d_answers <- data.frame(d_raw$answers)
  pattern <- "data\\."
  colnames(d_answers) <- sub(pattern, "", colnames(d_answers))

  ## Literal listener data
  if (study_type == "L0") {
    d_answers <- d_answers %>%
      mutate(study="L0",
             language=as.character(language),
             domain=domain,
             item=as.character(item),
             age=as.numeric(as.character(age)),
             stars=as.numeric(as.character(stars))/20,
             judgment=as.numeric(judgment)-1,
             worker_id=d_raw$WorkerId)
    d_answers$word_type <- sapply(d_answers$item, map_word_type)
    d_answers <- d_answers %>%
      select(worker_id, study, domain, word_type, item, stars, judgment, age, gender, expt_aim, expt_gen, language)
  }
  ## Pragmatic listener data
  else if (study_type == "L1") {
    d_answers <- d_answers %>%
      mutate(study="L1",
             language=as.character(language),
             domain=domain,
             item=as.character(item),
             age=as.numeric(as.character(age)),
             judgment=as.numeric(judgment),
             worker_id=d_raw$WorkerId)
    d_answers$word_type <- sapply(d_answers$item, map_word_type)
    d_answers <- d_answers %>%
      select(worker_id, study, domain, word_type, item, judgment, age, gender, expt_aim, expt_gen, language)
  }
  else error("Incorrect study type")

  d_answers
}

## construct_dir_path()
## --------------------
## Construct path to data dir for literal listener or pragmatic listener judgments
## Used in  `create_domain_df()`
##
create_dir_path <- function(domain, study_type=NA) {
  if (is.na(study_type)) error("Please enter a study_type; either `L0` or `L1`")
  if (study_type == "L0") paste0("/Users/benpeloquin/Desktop/Projects/scalar_alts/data/L0_data/", domain, "/")
  else if (study_type == "L1") paste0("/Users/benpeloquin/Desktop/Projects/scalar_alts/data/L1_data/", domain, "/")
  else error("Bad `study_type` arg")
}

## create_domain_df()
## ------------------
## create a single domain level df
## Note:
##   * L0 df has additional 'stars' column for the randomly generated star-rating presented
##   * toggle 'filtering' if we'd like to run trial checks
##
create_domain_df <- function(domain=NA, dir_path=NA, study_type=NA, filter=TRUE, verbose=TRUE) {
  if (is.na(domain) | is.na(dir_path)) error("Need to pass `domain` and `dir_path` args")
  if (is.na(study_type)) error("Pass in study type; either `L0` or `L1`")

  ## L0
  if (study_type == "L0") {
    d <- data.frame(worker_id=c(),
                    study=c(),
                    domain=c(),
                    word_type=c(),
                    item=c(),
                    stars=c(),
                    judgment=c(),
                    age=c(),
                    gender=c(),
                    expt_aim=c(),
                    expt_gen=c(),
                    language=c())
  } ## L1
  else if (study_type == "L1") {
    d <- data.frame(worker_id=c(),
                    study=c(),
                    domain=c(),
                    word_type=c(),
                    item=c(),
                    judgment=c(),
                    age=c(),
                    gender=c(),
                    expt_aim=c(),
                    expt_gen=c(),
                    language=c())
  } ## Error
  else {
    error("Bad study_type; must be `L0` or `L1`")
  }

  ## Read in files
  dir_path <- paste0("/Users/benpeloquin/Desktop/Projects/scalar_alts/data/", study_type, "_data/", domain, "/")
  files <- list.files(dir_path)
  if (verbose) warning(paste0("Currently reading in files for ", domain, "..."))
  for (file in files) {
    d <- rbind(d, get_data_single_file(paste0(dir_path, file), domain, study_type=study_type))
  }

  ## filter
  if (filter) return_df <- filter_df(d, study_type=study_type, verbose=verbose)
  else return_df <- d

  return_df
}

## filter_df()
## -----------
## filter data frame
## L0 filters:
##   * must answers 'yes' to both training trials
##   * must be a native English speaker
## L1 filters
##   * must answer 4 or 5 when prompt is 'high'
##   * must answer 1 or 2 when prompt is 'low'
##   * myst be a native English speaker
##
filter_df <- function(d, study_type=NA, verbose=TRUE) {
  NUM_TRIALS <- 23

  if (is.na(study_type)) error("Please input valid study_type; `L0` or `L1`")

  ## L0
  if (study_type == "L0") {
    bad_ids_df <- d %>%
      filter(word_type == "training") %>%
      group_by(worker_id, language) %>%
      summarise(training_perf=sum(judgment)) %>%
      ## filter out anyone who doesn't pass both
      ## training trials or took the study mult times
      filter(training_perf != 2,
             # or not English as first language
             tolower(language) != "english" | tolower(language) != "en")

    bad_ids <- bad_ids_df$worker_id
  }
  ## L1
  else if (study_type == "L1") {
    ## Do more here
    bad_ids_df <- d %>%
      filter(word_type == "training") %>%
      group_by(worker_id, item) %>%
      filter(((item=="high" & judgment < 4) | (item=="low" & judgment > 2)),
             tolower(language) != "english")

    ## Filter workers who did hit multiple times
    duplicate_workers <- d %>%
      group_by(worker_id) %>%
      summarise(num_trials=n()) %>%
      filter(num_trials != NUM_TRIALS)

    bad_ids <- c(duplicate_workers$worker_id, bad_ids_df$worker_id)
  }
  ## Bad input
  else error("Incorrect study_type; should be `L0` or `L1`")

  ## Filtered data
  d_filtered <- d %>%
    filter(!(worker_id %in% bad_ids),
           word_type != "training")

  if (verbose) {
    num_participants <- 50
    warning(paste0(num_participants - length(unique(d_filtered$worker_id)),
                   " of ", num_participants, " filtered out."))
  }

  d_filtered
}
