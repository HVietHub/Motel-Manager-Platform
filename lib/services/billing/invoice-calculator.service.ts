export interface InvoiceCalculationParams {
  roomPrice: number
  electricityUsage: number
  electricityPrice: number
  waterPrice: number
  serviceAmount?: number
  otherAmount?: number
}

export interface InvoiceCalculation {
  rentAmount: number
  electricityAmount: number
  waterAmount: number
  serviceAmount: number
  otherAmount: number
  totalAmount: number
}

export class InvoiceCalculatorService {
  /**
   * Calculate invoice amounts based on room price, electricity usage, and utility prices
   * 
   * Preconditions:
   * - All numeric inputs must be >= 0
   * 
   * Postconditions:
   * - Returns valid InvoiceCalculation object
   * - electricityAmount = electricityUsage × electricityPrice
   * - waterAmount = waterPrice
   * - totalAmount = sum of all amounts
   * - All amounts are non-negative numbers
   */
  calculateInvoiceAmount(params: InvoiceCalculationParams): InvoiceCalculation {
    // Validate inputs are non-negative
    if (params.roomPrice < 0) {
      throw new Error('Room price must be non-negative')
    }
    if (params.electricityUsage < 0) {
      throw new Error('Electricity usage must be non-negative')
    }
    if (params.electricityPrice < 0) {
      throw new Error('Electricity price must be non-negative')
    }
    if (params.waterPrice < 0) {
      throw new Error('Water price must be non-negative')
    }
    if (params.serviceAmount !== undefined && params.serviceAmount < 0) {
      throw new Error('Service amount must be non-negative')
    }
    if (params.otherAmount !== undefined && params.otherAmount < 0) {
      throw new Error('Other amount must be non-negative')
    }

    const rentAmount = params.roomPrice
    const electricityAmount = params.electricityUsage * params.electricityPrice
    const waterAmount = params.waterPrice
    const serviceAmount = params.serviceAmount || 0
    const otherAmount = params.otherAmount || 0

    const totalAmount = rentAmount + electricityAmount + waterAmount + serviceAmount + otherAmount

    return {
      rentAmount,
      electricityAmount,
      waterAmount,
      serviceAmount,
      otherAmount,
      totalAmount
    }
  }
}

export const invoiceCalculatorService = new InvoiceCalculatorService()
