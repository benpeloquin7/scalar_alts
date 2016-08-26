#
# This is the user-interface definition of a Shiny web application. You can
# run the application by clicking 'Run App' above.
#
# Find out more about building applications with Shiny here:
# 
#    http://shiny.rstudio.com/
#

library(shiny)

# Define UI for application that draws a histogram
shinyUI(fluidPage(
  
  titlePanel("Exploring RSA"),
  
  ## Sidebar for parameter tuning
  sidebarLayout(
    sidebarPanel(
      ## Domain
      selectInput("domain", "Choose domain(s):",
                  choices=c("album"="album",
                            "book"="book",
                            "game"="game",
                            "movie"="movie",
                            "play"="play",
                            "restaurant"="restaurant"),
                  selected="restaurant",
                  multiple=TRUE), 
      ## Scale
      selectInput("scale", "Choose scale(s):",
                  choices=c("bad terrible"="bad_terrible",
                            "good excellent"="good_excellent",
                            "liked loved"="liked_loved",
                            "memorable unforgettable"="memorable_unforgettable",
                            "special unique"="special_unique"),
                  selected="good_excellent"),
      ## Depth
      sliderInput("depth", "Recursive reasoning depth",
                  min=0, max=6, value=1, step=1),
      ## Alpha
      sliderInput("alpha", "Alpha degree of rationality",
                  min=0, max=10, value=1, step=0.1),
      
      ## Number of alternatives
      sliderInput("model", "Number of alternatives",
                  min=2, max=5, value=1, step=1)  
    ),
    ## Main
    mainPanel(
      plotOutput("pragmatics_plot"),
      textOutput("overall_r"))
  )
))
