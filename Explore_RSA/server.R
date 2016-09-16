##############
############## server.R
############## Explore RSA shiny app
##############
##############

library(shiny)
library(rrrsa)
library(ggplot2)
library(dplyr)
library(tidyr)
library(purrr)
source("helpers.R")

## Get data
d <- read.csv("full_data.csv")
overall_r <- 0
d_prags <- c()

shinyServer(
  function(input, output) {

    input_values <- reactive({
      list("data"=
             data.frame("curr_scale"=input$scale,
                       "curr_alpha"=input$alpha,
                       "curr_depth"=input$depth,
                       "curr_model"=input$model,
                       "curr_comparison_type"=input$comparison_group,
                       "all_alts"=input$display_alternatives,
                       stringsAsFactors=FALSE),
           "domains"=unlist(input$domain))
    })

    ## Main plotting and calculations
    output$pragmatics_plot <- renderPlot({
      all_input <- input_values()
      curr_domain <- all_input$domains
      values <- all_input$data
      curr_scale <- values$curr_scale
      curr_alpha <- values$curr_alpha
      curr_depth <- values$curr_depth
      curr_model <- values$curr_model
      curr_comparison_type <- values$curr_comparison_type
      all_alts <- values$all_alts
      # curr_scale <- input$scale
      # curr_domain <- unlist(input$domain)
      # curr_alpha <- input$alpha
      # curr_depth <- input$depth
      # curr_model <- input$model
      # curr_comparison_type <- input$comparison_group
      # all_alts <- input$display_alternatives

      d_processed <- d %>%
        filter(scale==curr_scale,
               (domain %in% curr_domain),
               model==curr_model) %>%
        mutate(domain=as.character(domain))

      ## Multiple domains
      if (length(curr_domain) > 1) {
        d_prags <<- d_processed %>%
          split(.$domain) %>%
          map_df(~rsa.runDf(data=.x,
                            quantityVarName="stars",
                            semanticsVarName="sems",
                            itemVarName="item",
                            alpha=curr_alpha,
                            depth=curr_depth))
      }
      ## One domain
      else {
        d_prags <<- rsa.runDf(d_processed,
                             quantityVarName="stars",
                             semanticsVarName="sems",
                             itemVarName="item",
                             alpha=curr_alpha,
                             depth=curr_depth)
      }

      ## Get indices for comparison (ifelse not working???)
      if (all_alts) {
        target_indices <- get_compare_indices(d_prags, model=curr_model)
      } else {
        target_indices <- get_compare_indices(d_prags, model="2")
      }

      ## Check for literal L0 vs L1 for background plot
      if (curr_comparison_type == "sems") {
        main_plot <- d_prags[target_indices,] %>%
          ggplot(aes(x=stars, y=sems, col=item))
        overall_r <<- cor(d_prags[target_indices, ]$preds, d_prags[target_indices, ]$sems)
      } else {
        main_plot <- d_prags[target_indices,] %>%
          ggplot(aes(x=stars, y=prags, col=item))
        overall_r <<- cor(d_prags[target_indices, ]$preds, d_prags[target_indices, ]$prags)
      }

      ## Primary plot
      main_plot +
        geom_line(lty="dashed", size=1, alpha=1) +
        geom_line(aes(x=stars, y=preds, col=item), alpha=0.6, lty="solid", size=3) +
        ylim(0, 1) +
        xlab("Stars") +
        ylab("Model predictions/\nHuman judgments") +
        facet_wrap(~domain) +
        theme_bw() +
        theme(strip.text.x=element_text(size=12),
              axis.title=element_text(size=16))
    })

    ## Show correlation
    output$overall_r <- renderText({
      all_input <- input_values()
      # curr_scale <- input$scale
      # curr_domain <- unlist(input$domain)
      # curr_alpha <- input$alpha
      # curr_depth <- input$depth
      # curr_model <- input$model
      # curr_comparison_type <- input$comparison_group
      # curr_alternative_set <- input$display_alternatives
      paste0("Overall r: ", round(overall_r, 4))
    })

    ## Output title for data table of L1 predictions
    output$RSA_title <- renderText({
      curr_domain <- input_values()$domains
      if (length(curr_domain) == 1) "RSA"
      else return()
    })

    ## Output data table of L1 predictions
    output$preds_table <- renderTable({
      all_input <- input_values()
      curr_domain <- all_input$domains
      curr_model <- all_input$data$curr_model

      ## Only output table if we're examining one scale...
      if (length(curr_domain) == 1) {
        d_prags %>%
          select(item, preds, stars)  %>%
          spread(item, preds)
      } else {
        return()
      }
    })

    ## Output comparison group title
    output$comparison_group <- renderText({
      all_input <- input_values()
      curr_domain <- all_input$domains
      curr_comparison_type <- all_input$data$curr_comparison_type
      if (length(curr_domain) == 1) {
        if (curr_comparison_type == "prags") "Empirical pragmatics"
        else "Empirical Semantics"
      } else return()
    })

    ## Output L0 data table
    output$compare_table <- renderTable({
      all_input <- input_values()
      curr_domain <- all_input$domains
      curr_model <- all_input$data$curr_model
      curr_comparison_type <- all_input$data$curr_comparison_type

      # curr_scale <- input$scale
      # curr_domain <- unlist(input$domain)
      # # curr_alpha <- input$alpha
      # # curr_depth <- input$depth
      # curr_model <- input$model
      # curr_comparison_type <- input$comparison_group
      # curr_alternative_set <- input$display_alternatives


      ## Only output table if we're examining one scale...
      if (length(curr_domain) == 1) {
        if (curr_comparison_type == "sems") {
          d_prags %>%
            select(item, sems, stars)  %>%
            spread(item, sems)
        } else {
          d_prags %>%
            select(item, prags, stars)  %>%
            spread(item, prags)
        }
      } else {
        return()
      }
  })
})

