##############
############## ui.R
############## Explore RSA shin app
##############
##############

library(shiny)

# Define UI for application that draws a histogram
shinyUI(fluidPage(
  
  ## Left header
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
                  min=2, max=5, value=1, step=1),  
      ## Comparison group (L1 vs L0)
      selectInput(inputId="comparison_group",
                  label="Comparison group:",
                  choices = c("literal semantics"="sems", "pragmatic judgments"="prags"),
                  selected="prags"),
      ## Show all the alternatives toggle
      checkboxInput(inputId="display_alternatives",
                  label="Display all alternatives?",
                  value=FALSE)
    ),
    ## Main
    mainPanel(
      h3(textOutput("overall_r"), align="center"),
      plotOutput("pragmatics_plot"),
      br(),
      fluidRow(
        column(4, 
               h4("RSA"),
               tableOutput("preds_table")),
        column(4, offset=1,
              h4(textOutput("comparison_group")),
              tableOutput("compare_table"))
        ))
)))
