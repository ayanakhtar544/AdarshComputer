import { useState } from 'react';
import { useState } from 'react';
import nodemailer from 'nodemailer';
// Email sending function
async function sendPurchaseEmail(orderDetails) {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.NEXT_PUBLIC_EMAIL_USER,
    to: process.env.NEXT_PUBLIC_EMAIL_RECEIVER || process.env.NEXT_PUBLIC_EMAIL_USER,
    subject: 'New Purchase Notification',
    text: `New order placed!\n\nProduct: ${orderDetails.productName}\nPrice: ₹${orderDetails.price}\nCustomer: ${orderDetails.customerName}\nPhone: ${orderDetails.customerPhone}\nAddress: ${orderDetails.address}\nOrder ID: ${orderDetails.orderId}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Purchase email sent!');
  } catch (err) {
    console.error('Error sending email:', err);
  }
}
import { X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function CheckoutModal({ product, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Form handle karna
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Firebase me Order Save karna (Admin Panel ke liye)
      const orderRef = await addDoc(collection(db, "orders"), {
        customerName: formData.name,
        customerPhone: formData.phone,
        address: formData.address,
        productName: product.name,
        price: product.price,
        status: "Pending", // Order tracking ke liye
        timestamp: serverTimestamp(),
      });

        // 1.5 Send email notification
        await sendPurchaseEmail({
          productName: product.name,
          price: product.price,
          customerName: formData.name,
          customerPhone: formData.phone,
          address: formData.address,
          orderId: orderRef.id,
        });
      // 2. WhatsApp Message Banana
      // Apna number yahan dalo (Country code ke sath bina + ke, e.g., 919876543210)
      const adminPhone = "919999999999"; 
      
      const message = `*New Order: Lappy Dekhouter*%0A%0A` +
        `📦 *Product:* ${product.name}%0A` +
        `💰 *Price:* ₹${product.price}%0A` +
        `👤 *Customer:* ${formData.name}%0A` +
        `📞 *Phone:* ${formData.phone}%0A` +
        `🏠 *Address:* ${formData.address}%0A` +
        `🆔 *Order ID:* ${orderRef.id}`;

      const whatsappUrl = `https://wa.me/${adminPhone}?text=${message}`;

      // 3. Success & Redirect
      toast.success('Order Placed! Redirecting to WhatsApp...');
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        onClose(); // Modal band karo
      }, 1500);

    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4">Confirm Order</h2>
        
        {/* Product Summary */}
        <div className="bg-blue-50 p-3 rounded-md mb-6 flex gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded-md"></div> {/* Image placeholder */}
          <div>
             <p className="font-semibold">{product.name}</p>
             <p className="text-blue-600 font-bold">₹{product.price}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              required
              type="text" 
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 outline-none"
              placeholder="Enter your name"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input 
              required
              type="tel" 
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 outline-none"
              placeholder="Enter mobile number"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
            <textarea 
              required
              rows="3"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 outline-none"
              placeholder="Full address with pincode"
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition flex justify-center items-center gap-2"
          >
            {loading ? 'Processing...' : 'Place Order on WhatsApp'}
          </button>
        </form>

      </div>
    </div>
  );
}