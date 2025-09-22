import createMollieClient, { type MollieClient } from '@mollie/api-client'

class MollieService {
  private static instance: MollieService
  private client: MollieClient

  private constructor() {
    const apiKey = process.env.MOLLIE_API_KEY || 'test_FGjSWxaWSDFpt5k5Dzg9F4JeWm5kW7'

    if (!apiKey) {
      throw new Error('MOLLIE_API_KEY environment variable is required')
    }

    this.client = createMollieClient({ apiKey })
  }

  public static getInstance(): MollieService {
    if (!MollieService.instance) {
      MollieService.instance = new MollieService()
    }
    return MollieService.instance
  }

  public getClient(): MollieClient {
    return this.client
  }
}

export const mollieClient = MollieService.getInstance().getClient()
