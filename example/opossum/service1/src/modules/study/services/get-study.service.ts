// import { Injectable } from '@nestjs/common';
// import { CircuitBreakerGenerator } from '../../../common/libs/services/circuitBreakerGenerator.service';
// import axios from 'axios';

// @Injectable()
// export class GetStudyService {
//   private serviceA: any;
//   private serviceB: any;

//   constructor(
//     private readonly circuitBreakerGenerator: CircuitBreakerGenerator,
//   ) {
//     this.serviceA = this.circuitBreakerGenerator.createCircuitBreaker(
//       this.getStudyFromService2.bind(this), // ✅ Fix `this` binding
//       this.fetchService3Data.bind(this),
//     );

//     this.serviceB = this.circuitBreakerGenerator.createCircuitBreaker(
//       this.getStudyFromService3.bind(this),
//       () => {
//         console.warn('Fallback for Service 3 triggered.');
//         return { message: 'Fallback for Service 3' };
//       },
//     );
//   }

//   async getStudy() {
//     return await this.fetchService2Data();
//   }

//   async getStudyFromService2() {
//     const response = await axios.get('http://localhost:3001/data');
//     return response.data;
//   }

//   async fetchService2Data() {
//     return this.serviceA.fire().then(console.log).catch(console.error);
//   }

//   async getStudyFromService3() {
//     const response = await axios.get('http://localhost:3002/data');
//     return response.data;
//   }

//   async fetchService3Data() {
//     return this.serviceB.fire().then(console.log).catch(console.error);
//   }
// }

import { Injectable } from '@nestjs/common';
import { CircuitBreakerGenerator } from '../../../common/libs/services/circuitBreakerGenerator.service';
import axios from 'axios';

@Injectable()
export class GetStudyService {
  private serviceA: any;
  private serviceB: any;

  constructor(
    private readonly circuitBreakerGenerator: CircuitBreakerGenerator,
  ) {
    this.serviceA = this.circuitBreakerGenerator.createCircuitBreaker(
      this.getStudyFromService2,
      this.fetchService3Data,
      'Service 2',
    );

    this.serviceB = this.circuitBreakerGenerator.createCircuitBreaker(
      this.getStudyFromService3,
      () => {
        console.warn('Fallback for Service 3 triggered.');
        return { code: 200, message: 'Fallback for Service 3' };
      },
      'Service 3',
    );
  }

  async getStudy() {
    return await this.fetchService2Data();
  }

  getStudyFromService2 = async () => {
    const response = await axios.get('http://localhost:3001/data');
    return response.data;
  };

  fetchService2Data = async () => {
    return this.serviceA.fire();
  };

  getStudyFromService3 = async () => {
    const response = await axios.get('http://localhost:3002/data');
    return response.data;
  };

  fetchService3Data = async () => {
    return this.serviceB.fire();
  };
}
