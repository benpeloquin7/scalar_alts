#
# This is the server logic of a Shiny web application. You can run the 
# application by clicking 'Run App' above.
#
# Find out more about building applications with Shiny here:
# 
#    http://shiny.rstudio.com/
#

library(shiny)
library(rrrsa)
library(ggplot2)
library(dplyr)
library(tidyr)
library(purrr)

shinyServer(function(input, output) {
   
  d <- read.csv("full_data.csv")
  overall_r <- 0
  
  output$pragmatics_plot <- renderPlot({
    curr_scale <- input$scale
    curr_domain <- unlist(input$domain)
    curr_alpha <- input$alpha
    curr_depth <- input$depth
    curr_model <- input$model
    
    d_processed <- d %>%
      filter(scale==curr_scale,
             (domain %in% curr_domain),
             model==curr_model) %>%
      mutate(domain=as.character(domain))
    
    print(is.factor(d_processed$domain))
    if (length(curr_domain) > 1) {
      d_prags <- d_processed %>%
        split(.$domain) %>%
        map_df(~rsa.runDf(data=.x,
                          quantityVarName="stars",
                          semanticsVarName="sems",
                          itemVarName="item",
                          alpha=curr_alpha,
                          depth=curr_depth))
    } else {
      d_prags <- rsa.runDf(d_processed,
                           quantityVarName="stars",
                           semanticsVarName="sems",
                           itemVarName="item",
                           alpha=curr_alpha,
                           depth=curr_depth)
    }
    d_res <- d_prags %>% filter(word_type %in% c("hi1", "hi2"))
    overall_r <<- cor(d_res$preds, d_res$prags) 
    
    d_prags %>%
      gather(type, value, c(preds, prags)) %>%
      filter(word_type %in% c("hi1", "hi2")) %>%
      ggplot(aes(x=stars, y=value, lty=type, col=item)) +
      geom_line() +
      ylim(0, 1) +
      xlab("Stars") +
      ylab("Model predictions/\nHuman judgments") +
      facet_wrap(~domain)
    
  })
  
  output$overall_r <- renderText({
    curr_scale <- input$scale
    curr_domain <- unlist(input$domain)
    curr_alpha <- input$alpha
    curr_depth <- input$depth
    curr_model <- input$model
    paste0("Overall r: ", overall_r)
  })
})
  
