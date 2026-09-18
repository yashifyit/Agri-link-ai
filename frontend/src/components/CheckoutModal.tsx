import React, { useState } from 'react';
import { X, ShieldCheck, Truck, CreditCard, CheckCircle2, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { LotItem } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: LotItem;
  initialQuantityKg?: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, lot, initialQuantityKg = 200 }) => {
  const { createOrderDirect, verifyPaymentOrder } = useApp();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState<number>(Math.min(initialQuantityKg, lot.available_qty_kg || lot.quantity_kg || 800));
  const [deliveryAddress, setDeliveryAddress] = useState<string>('FreshHarvest Processing Center, Industrial Area, Lucknow');
  const [vehicleType, setVehicleType] = useState<string>('Mini Truck 1.5T');
  const [isColdChain, setIsColdChain] = useState<boolean>(false);
  
  // Checkout flow states: 'REVIEW' | 'PAYMENT' | 'SUCCESS'
  const [checkoutStep, setCheckoutStep] = useState<'REVIEW' | 'PAYMENT' | 'SUCCESS'>('REVIEW');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [createdOrderDetails, setCreatedOrderDetails] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const pricePerKg = lot.expected_price_per_kg || 32;
  const cropValue = quantity * pricePerKg;
  const transportCost = isColdChain ? 2400.0 : 1600.0;
  const platformFee = Math.round(cropValue * 0.01);
  const totalAmount = cropValue + transportCost + platformFee;
  const farmerNetPayout = cropValue - platformFee;

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || quantity > (lot.available_qty_kg || lot.quantity_kg)) {
      alert(`Invalid quantity. Maximum available: ${lot.available_qty_kg || lot.quantity_kg} kg`);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    try {
      // 1. Create order on backend (atomically reserves inventory)
      const orderRes = await createOrderDirect(lot.id, quantity, deliveryAddress);
      setCreatedOrderDetails(orderRes.order);
      setCheckoutStep('PAYMENT');
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateRazorpayPayment = async () => {
    if (!createdOrderDetails) return;
    setIsProcessing(true);
    setPaymentError(null);
    try {
      // Create and verify payment with backend
      const rzpOrderId = `order_rzp_${createdOrderDetails.id.toLowerCase()}_${Date.now()}`;
      const rzpPaymentId = `pay_rzp_${Date.now()}`;
      const signature = `sandbox_sig_${Date.now()}`;

      const verified = await verifyPaymentOrder(
        createdOrderDetails.id,
        rzpOrderId,
        rzpPaymentId,
        signature
      );

      if (verified) {
        setCheckoutStep('SUCCESS');
      } else {
        setPaymentError('Payment verification failed on server. Please try again.');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment execution failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-agriBorder overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-5 border-b border-agriBorder flex items-center justify-between bg-cream">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-forest block">KisanLink Secure Checkout</span>
            <h3 className="text-lg font-black text-charcoal flex items-center gap-2">
              Procure {lot.crop} ({lot.quality_grade})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-charcoal-muted hover:text-charcoal p-1.5 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-5">
          {paymentError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          {checkoutStep === 'REVIEW' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* LOT SUMMARY CARD */}
              <div className="p-4 rounded-2xl bg-cream border border-agriBorder flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-forest">Producer: {lot.farmer_name}</span>
                  <p className="text-xs text-charcoal-muted">{lot.location} • Harvested {lot.harvest_date}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-charcoal-muted">Available Stock</span>
                  <p className="text-sm font-black text-agriGreen">{lot.available_qty_kg || lot.quantity_kg} kg</p>
                </div>
              </div>

              {/* QUANTITY ADJUSTMENT */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-charcoal">Procurement Quantity (kg)</label>
                  <span className="text-[11px] text-charcoal-muted">Rate: ₹{pricePerKg}/kg</span>
                </div>
                <input
                  type="number"
                  min="50"
                  max={lot.available_qty_kg || lot.quantity_kg}
                  step="50"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-3 text-sm font-black text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                />
              </div>

              {/* DELIVERY LOCATION */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Destination / Delivery Address</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-3 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                />
              </div>

              {/* LOGISTICS PREFERENCES */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Logistics Vehicle</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-semibold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  >
                    <option value="Mini Truck 1.5T">Mini Truck (1.5 Ton)</option>
                    <option value="E-Pickup 1.0T">E-Pickup (1.0 Ton)</option>
                    <option value="Reefer Cold Chain 2.5T">Reefer Container (2.5T)</option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-charcoal">
                    <input
                      type="checkbox"
                      checked={isColdChain}
                      onChange={(e) => setIsColdChain(e.target.checked)}
                      className="w-4 h-4 rounded text-forest focus:ring-forest"
                    />
                    <span>Reefer Cold-Chain (+₹800)</span>
                  </label>
                </div>
              </div>

              {/* FINANCIAL BREAKDOWN */}
              <div className="p-4 rounded-2xl bg-forest/5 border border-forest/15 space-y-2 text-xs">
                <div className="flex justify-between text-charcoal">
                  <span>Crop Value ({quantity} kg × ₹{pricePerKg})</span>
                  <span className="font-bold">₹{cropValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-charcoal">
                  <span>Farmgate Transport ({vehicleType})</span>
                  <span className="font-bold">₹{transportCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-charcoal">
                  <span>Platform Fee (1% Escrow & Quality Assurance)</span>
                  <span className="font-bold">₹{platformFee.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-forest/15 flex justify-between text-sm font-black text-charcoal">
                  <span>Total Payable</span>
                  <span className="text-forest text-base">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-charcoal-muted pt-0.5">
                  Farmer will receive ₹{farmerNetPayout.toLocaleString()} upon confirmed farmgate delivery.
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-forest hover:bg-forest-hover text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Reserving Inventory...
                  </>
                ) : (
                  <>
                    Lock Inventory & Continue to Payment <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {checkoutStep === 'PAYMENT' && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-black text-charcoal">KisanLink Escrow Payment Gateway</h4>
                <p className="text-xs text-charcoal-muted mt-1">
                  Order ID: <span className="font-mono font-bold text-charcoal">{createdOrderDetails?.id}</span>
                </p>
              </div>

              <div className="p-4 bg-cream rounded-2xl border border-agriBorder text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Payable to Escrow:</span>
                  <span className="font-black text-forest text-base">₹{createdOrderDetails?.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Payment Mode:</span>
                  <span className="font-semibold text-charcoal">Razorpay Sandbox (UPI / NetBanking / Cards)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Escrow Protection:</span>
                  <span className="text-emerald-700 font-bold">100% Guaranteed Release on Delivery</span>
                </div>
              </div>

              <button
                onClick={handleSimulateRazorpayPayment}
                disabled={isProcessing}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Cryptographic Signature...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Pay ₹{createdOrderDetails?.total_amount?.toLocaleString()} & Lock Escrow
                  </>
                )}
              </button>
            </div>
          )}

          {checkoutStep === 'SUCCESS' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-black text-charcoal">Order & Payment Confirmed!</h4>
                <p className="text-xs text-charcoal-muted mt-1">
                  Order <span className="font-mono font-bold text-charcoal">{createdOrderDetails?.id}</span> is paid and locked in escrow.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1.5 text-left">
                <div className="flex items-center gap-2 font-bold">
                  <Truck className="w-4 h-4 text-emerald-700" /> Logistics Workflow Dispatched
                </div>
                <p className="text-[11px] text-emerald-700">
                  Farmer {lot.farmer_name} has received a real-time notification. KisanLink Logistics is scheduled for farmgate pickup within 24 hours.
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 bg-forest hover:bg-forest-hover text-white text-xs font-extrabold rounded-xl transition-all"
              >
                Go to Active Orders & Live Tracking
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
