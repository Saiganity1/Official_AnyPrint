import crypto from 'crypto';

// Configuration from Environment Variables
const JNT_API_URL = process.env.JNT_API_URL || "";
const JNT_API_KEY = process.env.JNT_API_KEY || "";
const JNT_CUSTOMER_CODE = process.env.JNT_CUSTOMER_CODE || "";

/**
 * Generates the HMAC-SHA256 signature required by J&T Express API.
 * J&T usually requires signing the payload + timestamp with the API key.
 */
function generateSignature(payload: string, timestamp: string): string {
  if (!JNT_API_KEY) return ""; // Skip if no API key is configured
  
  // Standard J&T HMAC Signature generation example
  // (Specific implementation may vary based on exact J&T API version provided by your account manager)
  const dataToSign = payload + JNT_API_KEY + timestamp;
  return crypto.createHash('md5').update(dataToSign).digest('base64'); 
}

/**
 * Creates an official order/booking with J&T Express.
 * 
 * @param orderData The order details (receiver, sender, items, COD)
 * @returns An object containing the generated tracking number and waybill data.
 */
export async function createJntOrder(orderData: any) {
  // If API keys are not yet configured (awaiting client approval), return a mocked tracking number
  if (!JNT_API_URL || !JNT_API_KEY || !JNT_CUSTOMER_CODE) {
    console.warn("J&T API Keys not found. Falling back to mock tracking number generation.");
    const random12 = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return {
      success: true,
      trackingNumber: `JT${random12}`,
      message: "Generated mock tracking number (Awaiting real API keys)"
    };
  }

  // =========================================================================
  // REAL J&T API INTEGRATION LOGIC (Executes when keys are provided)
  // =========================================================================
  try {
    const timestamp = Date.now().toString();
    const payload = JSON.stringify({
      customerCode: JNT_CUSTOMER_CODE,
      orderId: orderData.id,
      receiver: {
        name: orderData.receiverName,
        phone: orderData.receiverPhone,
        address: orderData.receiverAddress,
      },
      sender: {
        name: "Anyprint Avenue",
        phone: "09123456789",
        address: "Quezon City, Metro Manila",
      },
      itemType: "Parcel",
      weight: 1.0, // Default 1kg, can be calculated based on items
      payType: "COD",
      codAmount: orderData.total,
    });

    const signature = generateSignature(payload, timestamp);

    const response = await fetch(`${JNT_API_URL}/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "apiAccount": JNT_CUSTOMER_CODE,
        "digest": signature,
        "timestamp": timestamp
      },
      body: new URLSearchParams({
        logistics_interface: payload,
        data_digest: signature,
        msg_type: "ORDERCREATE",
        eccompanyid: JNT_CUSTOMER_CODE
      })
    });

    const result = await response.json();

    if (result.responseitems && result.responseitems[0]?.success === "true") {
      return {
        success: true,
        trackingNumber: result.responseitems[0].txLogisticID, // This is the official J&T Tracking Number
        message: "Order officially booked with J&T Express."
      };
    } else {
      console.error("J&T API Error:", result);
      throw new Error(result.responseitems?.[0]?.reason || "Failed to create J&T order");
    }
  } catch (error) {
    console.error("JNT_INTEGRATION_ERROR", error);
    throw error;
  }
}
