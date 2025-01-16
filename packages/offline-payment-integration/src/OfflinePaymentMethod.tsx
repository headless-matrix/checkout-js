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
      //console.log('Inizialize', method.id);

      try {
        
        await checkoutService.initializePayment({
          gatewayId: method.gateway,
          methodId: method.id,
        });

        // Carica i metodi di pagamento disponibili
        // -------------mtx init --------------
        if (method.id == 'cod') {
          //selectCarrier(checkoutService, "Corriere Contrassegno");
        }else{
          //selectCarrier(checkoutService, "Corriere  Standard");
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

        if (method.id == 'cod') {          
          //selectCarrier(checkoutService, "Corriere  Standard");
        }
      
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

async function selectCarrier( checkoutService : any, carrierDescription : string ) {
  const checkoutState = checkoutService.getState();
  const checkoutId = checkoutState.data.getCheckout()?.id;
  if (checkoutId) {
    const shippingState = await checkoutService.loadShippingOptions();

    const shippingOptionId =
      shippingState.data
        .getShippingOptions()
        ?.find((ship: any) => ship?.description === carrierDescription)?.id || null;

    console.log("shippingOptionId", shippingOptionId, carrierDescription, shippingState.data
      .getShippingOptions());

    if (shippingOptionId) {
      await checkoutService.selectShippingOption(shippingOptionId).finally(() => {
        // UX
      });
    }
  }
}
