import { FunctionComponent, useEffect } from 'react';

import {
  PaymentMethodProps,
  toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const OfflinePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
  method,
  checkoutService,
  onUnhandledError,
}) => {
  useEffect(() => {
    const initializePayment = async () => {
      try {
        
        await checkoutService.initializePayment({
          gatewayId: method.gateway,
          methodId: method.id,
        });

        // Carica i metodi di pagamento disponibili
        const state = await checkoutService.loadPaymentMethods();
        const paymentMethods = state.data.getPaymentMethods();
        console.log("paymentMethods", paymentMethods)

        // -------------mtx init --------------
        if (method.id == 'cod') {
          const checkoutState = checkoutService.getState();
          const checkoutId = checkoutState.data.getCheckout()?.id;
          //const cartId = checkoutState.data.getCart()?.id || '';
          //const consigment = checkoutState.data.getConsignments();
          //const consigmentId: string = consigment && consigment.length > 0 ? consigment[0].id : '';
          //const consigmentAddress : any = consigment && consigment.length > 0 ? consigment[0].address : '';
          //const lineItems : any = checkoutState.data.getCart()?.lineItems;

          if (checkoutId) {
            const shippingState = await checkoutService.loadShippingOptions();
            
            const shippingOptionId =
            shippingState.data.getShippingOptions()?.find((ship: any) => ship?.description === 'Corriere Contrassegno')
                ?.id || null;

            if (shippingOptionId) {                                      
              await checkoutService.selectShippingOption(shippingOptionId).finally(() => {
                // UX
                
              });
                           
              console.log("stampa di controllo....")
            }      
          }
        }
        // -------------mtx end --------------
      } catch (error) {
        if (error instanceof Error) {
          onUnhandledError(error);
        }
      }
    };

    void initializePayment();

    return () => {
      const deinitializePayment = async () => {
        try {
          await checkoutService.deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
          });
        } catch (error) {
          if (error instanceof Error) {
            onUnhandledError(error);
          }
        }
      };

      void deinitializePayment();
    };
  }, [checkoutService, method.gateway, method.id, onUnhandledError]);

  return null;
};

export default toResolvableComponent(OfflinePaymentMethod, [
  {
    type: 'PAYMENT_TYPE_OFFLINE',
  },
]);
