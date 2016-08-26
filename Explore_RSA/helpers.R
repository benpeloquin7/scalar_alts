##############
############## helpers.R
############## Explore RSA shiny app
##############
##############
get_compare_indices <- function(d, model=NA) {
  
  if (model=="2") {
    indices <- which((d$scale=="bad_terrible" &
                        (d$word_type=="low1" |  d$word_type=="low2")) |
                       (d$scale!="bad_terrible" &
                          (d$word_type=="hi1" |  d$word_type=="hi2")))
  } else if (model=="3") {
    indices <- which((d$scale=="bad_terrible" &
                        (d$word_type=="low1" |  d$word_type=="low2" | d$word_type=="hi2")) |
                       (d$scale!="bad_terrible" &
                          (d$word_type=="hi1" |  d$word_type=="hi2" | d$word_type=="low2")))
  } else if (model=="4") {
    indices <- which((d$scale=="bad_terrible" &
                        (d$word_type=="low1" |  d$word_type=="low2" | d$word_type=="hi1" | d$word_type=="hi2")) |
                       (d$scale!="bad_terrible" &
                          (d$word_type=="hi1" |  d$word_type=="hi2" | d$word_type=="low1" | d$word_type=="low2")))
    
  } else if (model=="5") {
    indices <- seq(nrow(d))
  } else error("Please specify model; one of '2', '3', '4', or '5'")
  return(indices)
}