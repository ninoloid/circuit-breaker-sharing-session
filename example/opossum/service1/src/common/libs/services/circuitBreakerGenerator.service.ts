// import { Injectable } from '@nestjs/common';
// import CircuitBreaker from 'opossum';
// import axios from 'axios';

// @Injectable()
// export class CircuitBreakerGenerator {
//   /**
//    * Generates a circuit breaker for an external service.
//    * @param serviceUrl The URL of the external service.
//    * @param fallback A fallback function for the circuit breaker.
//    * @param options Additional options for the circuit breaker.
//    */
//   createCircuitBreaker(
//     serviceUrl: string,
//     fallback: () => any,
//     options = {},
//   ): CircuitBreaker {
//     // Define the primary service call
//     const callService = async () => {
//       const response = await axios.get(serviceUrl);
//       return response.data;
//     };

//     // Create the circuit breaker
//     const circuitBreaker = new CircuitBreaker(callService, {
//       timeout: 5000,
//       errorThresholdPercentage: 50,
//       resetTimeout: 10000,
//       ...options,
//     });

//     // Set the fallback for the circuit breaker
//     circuitBreaker.fallback(fallback);

//     // Register events for monitoring
//     circuitBreaker.on('open', () =>
//       console.warn(`Circuit for ${serviceUrl} is OPEN`),
//     );
//     circuitBreaker.on('close', () =>
//       console.info(`Circuit for ${serviceUrl} is CLOSED`),
//     );
//     circuitBreaker.on('halfOpen', () =>
//       console.info(`Circuit for ${serviceUrl} is HALF-OPEN`),
//     );

//     return circuitBreaker;
//   }
// }

import { Injectable } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerGenerator {
  /**
   * Generates a circuit breaker for an external service.
   * @param serviceUrl The URL of the external service.
   * @param fallback A fallback function for the circuit breaker.
   * @param options Additional options for the circuit breaker.
   */
  createCircuitBreaker<T>(
    mainFunction: (...args: any[]) => Promise<T>,
    fallbackFunction: (...args: any[]) => Promise<T> | T,
    name: string,
    options = {},
  ): CircuitBreaker {
    const circuitBreaker = new CircuitBreaker(mainFunction, {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 10000,
      ...options,
    });

    // Set the fallback for the circuit breaker

    circuitBreaker.fallback(fallbackFunction);

    // Register events for monitoring
    circuitBreaker.on('open', () => console.warn(`Circuit ${name} is OPEN`));
    circuitBreaker.on('close', () => console.info(`Circuit ${name} is CLOSED`));
    circuitBreaker.on('halfOpen', () =>
      console.info(`Circuit ${name} is HALF-OPEN`),
    );
    // circuitBreaker.on('fallback', (result) =>
    //   console.info(`fallback: ${result}`),
    // );

    return circuitBreaker;
  }
}
