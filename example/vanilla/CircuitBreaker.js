const express = require("express");
const app = express();
const port = 3000;

// Configuration constants for the Circuit Breaker
const CIRCUIT_BREAKER_CONFIG = {
  maxFailed: 5, // Maximum failed attempts before opening the circuit
  // halfClosedTimeout: 5 * 60 * 1000, // Half-closed state timeout (5 minutes)
  halfClosedTimeout: 10000, // Half-closed state timeout (5 minutes)
  checkInterval: 1000, // Interval to check the state (1 second)
  retryInterval: 1000, // Interval for retries when in half-closed state (1 second)
  // resetFailureTimeout: 24 * 60 * 60 * 1000, // Timeout to reset failure count (24 hours)
  resetFailureTimeout: 5000,
};

class CircuitBreaker {
  constructor(config = CIRCUIT_BREAKER_CONFIG) {
    this.maxFailed = config.maxFailed;
    this.halfClosedTimeout = config.halfClosedTimeout;
    this.checkInterval = config.checkInterval;
    this.retryInterval = config.retryInterval;
    this.resetFailureTimeout = config.resetFailureTimeout;

    // Initial state of the circuit
    this.state = "CLOSED"; // Possible states: CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTimestamp = 0;
    this.halfClosedStartTimestamp = 0;
    this.lastResetTimestamp = Date.now();
  }

  // Helper method to reset failure count and transition to CLOSED state
  reset() {
    this.state = "CLOSED";
    this.failures = 0;
    this.lastFailureTimestamp = 0;
    this.halfClosedStartTimestamp = 0;
    this.lastResetTimestamp = Date.now();
  }

  // Helper method to reset failures if it's been too long since the last failure
  resetFailuresIfNeeded() {
    if (Date.now() - this.lastResetTimestamp >= this.resetFailureTimeout) {
      this.failures = 0; // Reset the failure count if the timeout has passed
      this.lastResetTimestamp = Date.now();
    }
  }

  // Helper method to handle the state transitions
  transitionState() {
    console.log(
      "xxx",
      this.state,
      Date.now() - this.lastFailureTimestamp,
      this.halfClosedTimeout,
      this.state === "OPEN" &&
        Date.now() - this.lastFailureTimestamp >= this.halfClosedTimeout
    );
    if (
      this.state === "OPEN" &&
      Date.now() - this.lastFailureTimestamp >= this.halfClosedTimeout
    ) {
      this.state = "HALF_OPEN"; // Switch to HALF_OPEN state after timeout
      this.halfClosedStartTimestamp = Date.now();
    } else if (
      this.state === "HALF_OPEN" &&
      Date.now() - this.halfClosedStartTimestamp >= this.retryInterval
    ) {
      this.state = "CLOSED"; // After retry interval, the circuit goes back to CLOSED if it succeeds
      this.failures = 0; // Reset failure count after success
      this.isNeedToResetFailures = true;
    }
  }

  // Function to execute the callable with circuit breaker protection
  async execute(callable) {
    console.log("failure count:", this.failures);
    console.log("state:", this.state);
    console.log(
      "lastFailureTimestamp:",
      Date.now() - this.lastFailureTimestamp
    );
    console.log("halfClosedTimeout:", this.halfClosedTimeout);
    // Reset failures if the timeout has passed
    this.resetFailuresIfNeeded();

    // Transition state based on failure count or timeout
    this.transitionState();

    // If the circuit is OPEN, reject the operation
    if (this.state === "OPEN") {
      console.log("disini");
      throw new Error("Circuit is open. Can't execute.");
    }

    try {
      const result = await callable();
      if (this.state === "HALF_OPEN") {
        this.state = "CLOSED"; // Success in half-open state, reset circuit to CLOSED
        this.failures = 0; // Reset failure count
      }
      return result;
    } catch (error) {
      // Failure occurred, handle failure logic
      if (this.state !== "OPEN") {
        this.failures += 1;
        this.lastFailureTimestamp = Date.now();
      }

      if (this.failures >= this.maxFailed) {
        this.state = "OPEN"; // Open the circuit after max failures
        this.isNeedToResetFailures = false;
      }
      throw error; // Re-throw the error after handling the failure
    }
  }
}

// Instantiate the CircuitBreaker class
const circuitBreaker = new CircuitBreaker();

// Simulate an API call or any callable function
const apiCall = async () => {
  // Simulate random success or failure
  const isSuccess = Math.random() > 0.5;
  if (isSuccess) {
    console.log("API call succeeded");
    return "Success";
  } else {
    console.log("API call failed");
    throw new Error("API call failed");
  }
};

// Express endpoint to demonstrate the circuit breaker in action
app.get("/api-call", async (req, res) => {
  try {
    const response = await circuitBreaker.execute(apiCall);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
