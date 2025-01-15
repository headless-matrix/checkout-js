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

        // -------------mtx init --------------
        if (method.id == 'cod') {
          const checkoutState = checkoutService.getState();
          const checkoutId = checkoutState.data.getCheckout()?.id;
          const cartId = checkoutState.data.getCart()?.id || '';
          const consigment = checkoutState.data.getConsignments();
          const consigmentId: string = consigment && consigment.length > 0 ? consigment[0].id : '';
          //const consigmentAddress : any = consigment && consigment.length > 0 ? consigment[0].address : '';
          //const lineItems : any = checkoutState.data.getCart()?.lineItems;

          if (checkoutId) {
            const checkoutMTX = await getMtxCheckout(checkoutId);

            const shippingOptionId =
              checkoutMTX?.consignments?.[0]?.availableShippingOptions?.find(
                (ship: any) => ship?.description === 'Corriere Contrassegno',
              )?.id || null;

            if (shippingOptionId) {
              await updateConsignment(`/api/storefront/checkouts/`, cartId, consigmentId, {
                shippingOptionId: shippingOptionId,
              });
            }

            console.log('buildaaa aaaa!!!');
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

function updateConsignment(url: string, cartId: string, consignmentId: string, data: any) {
  return fetch(url + cartId + `/consignments/` + consignmentId, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json;',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

async function getMtxCheckout(checkoutId: string) {
  try {
    // Ottieni i dettagli del carrello
    const checkoutResponse = await fetch(
      `/api/storefront/checkouts/${checkoutId}?include=consignments.availableShippingOptions`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!checkoutResponse.ok) {
      throw new Error('Errore nel recupero del checkout');
    }

    const checkoutData = await checkoutResponse.json();

    return checkoutData;
  } catch (error) {
    console.error('Errore durante il recupero del checkout MTX:', error);
  }

  return null;
}
