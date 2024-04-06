const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const quizData = require("./data/questions.json");

const app = express();
const PORT = 3000;

// Serve static files (CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Body parser middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
// Serve the HTML form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API endpoint to get quiz questions
app.get("/api/questions", (req, res) => {
  res.json(quizData.questions);
});

// API endpoint to handle quiz submission and display results
app.post("/api/submit", (req, res) => {
  const answers = req.body;
  const questions = quizData.questions;
  let score = 0;
  const results = [];

  questions.forEach((question, index) => {
    const correctIndex = question.correctIndex;
    const userAnswer = parseInt(answers[`question${index}`]);

    if (userAnswer === correctIndex) {
      score++;
      results.push({ question: question.question, correct: true });
    } else {
      results.push({
        question: question.question,
        correct: false,
        correctAnswer: question.options[correctIndex],
      });
    }
  });

  // Render the results as HTML
  res.send(generateResultsHTML(score, results));
});

// Helper function to generate HTML for quiz results page
function generateResultsHTML(score, results) {
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quiz Results</title>
      <!-- Link to the CSS file -->
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <h1>Quiz Results</h1>
      <div id="quizResults">
        <h2>Your Score: ${score}/${results.length}</h2>
  `;

  results.forEach((result) => {
    if (result.correct) {
      html += `
        <div class="resultItem correct">
          <p>${result.question}</p>
          <p>Correct!</p>
        </div>
      `;
    } else {
      html += `
        <div class="resultItem incorrect">
          <p>${result.question}</p>
          <p>Incorrect. Correct answer: ${result.correctAnswer}</p>
        </div>
      `;
    }
  });

  html += `
      </div>
    </body>
    </html>
  `;

  return html;
}

// Error handling middleware for invalid routes
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error); // Pass the error to the next middleware
});

// Error handling middleware for unexpected errors
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    error: {
      status: err.status || 500,
      message: err.message || "Internal Server Error",
    },
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
