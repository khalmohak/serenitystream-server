import axios from 'axios';
import { config } from '../config/config';

export class PayPalService {
  private clientId: string;
  private clientSecret: string;
  private baseURL: string;
  private accessToken: string | null = null;

  constructor() {
    this.clientId = config.PayPalConfig.clientId;
    this.clientSecret = config.PayPalConfig.clientSecret;
    this.baseURL = config.PayPalConfig.sandbox ? 
      'https://api-m.sandbox.paypal.com' : 
      'https://api-m.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await axios.post(
      `${this.baseURL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    this.accessToken = response.data.access_token;
    return this.accessToken;
  }

  async createOrder(data: { amount: number; currency: string; description: string }) {
    const accessToken = await this.getAccessToken();

    const response = await axios.post(
      `${this.baseURL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: data.currency,
            value: data.amount.toString()
          },
          description: data.description
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  async captureOrder(orderId: string) {
    const accessToken = await this.getAccessToken();

    try{
      const response = await axios.post(
        `${this.baseURL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    }catch(err){
      console.log(err.response);
    }
  }

  async refundPayment(captureId: string) {
    const accessToken = await this.getAccessToken();

    const response = await axios.post(
      `${this.baseURL}/v2/payments/captures/${captureId}/refund`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }
}