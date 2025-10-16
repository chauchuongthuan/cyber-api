export enum PaymentStatusEnum {
   PAID = 1,
   UNPAID = 2,
}

export function PaymentStatusTrans(status = 1): string {
   return (
      {
         1: 'PAID',
         2: 'UNPAID',
      }[status] || ''
   );
}

export enum PaymentTypeEnum {
   BITCOIN = 1,
   USDT_TRC20 = 2,
   USDT_BEP20 = 3,
   ETHER = 4,
   LITECOIN = 5,
   BCH = 6,
   USDT_ERC20 = 7,
}

export function PaymentTypeTrans(status = 1): string {
   return (
      {
         1: 'Bitcoin',
         2: 'USDT TRC20',
         3: 'USDT BEP20',
         4: 'Ether',
         5: 'Litecoin',
         6: 'Bitcoin Cash',
         7: 'USDT ERC20',
      }[status] || ''
   );
}
export function PaymentTypeCodeTrans(status = 1): string {
   return (
      {
         1: 'BTC',
         2: 'USDT',
         3: 'BEP20',
         4: 'ETH',
         5: 'LTC',
         6: 'BCH',
         7: 'ERC20',
      }[status] || ''
   );
}
