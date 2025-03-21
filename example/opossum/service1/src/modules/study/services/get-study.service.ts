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

/**
 * hirarki -> s1 -> s2 -> s3 (fallback s2) -> fallback s3
 * service 1 call service 2
 * kalau sukses ya sukses aja
 * kalau gagal, jalanin fallback yaitu call service 3
 * kalau sukses yaudah sukses aja
 * kalau gagal jg, jalanin fallback yaitu return 200 dan message 'Fallback for Service 3'
 */
