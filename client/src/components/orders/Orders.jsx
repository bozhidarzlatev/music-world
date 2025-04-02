import { useState } from 'react';
import { useUserOrders } from '../../api/orderApi';

export default function Orders() {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { orders } = useUserOrders();

  const calculateOrderTotal = (orderData) => {
    return orderData.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2);
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };


  return (
    <div className='min-h-dvh'>
    <div className="max-w-6xl  mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">Orders List</h2>

      {orders.length === 0  
      ? <p className="text-gray-500 text-center">Your don't have any orders yet!</p>
      :
  
      <div className="space-y-4">
        {orders.map((order) => {
          const orderTotal = calculateOrderTotal(order.orderData); 
          
          return (
            <div
              key={order._id}
              className="flex flex-col items-start justify-between p-4 bg-gray-50 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              onClick={() => toggleExpand(order._id)}
            >
              <div className="flex justify-between w-full items-center">
                <p className="text-lg font-medium">Order ID: {order._id}</p>
                <p className="text-sm text-gray-500">Date: {new Date(order._createdOn).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Items: {order.orderData.length}</p>
                <p className="text-xl font-bold text-green-600">{orderTotal} lv</p> {/* Total Price */}
              </div>

              {expandedOrder === order._id && (
                <div className="mt-4 w-full space-y-2">
                  {order.orderData.map((item, index) => (
                    <div key={index} className="flex justify-between bg-gray-100 p-2 rounded-md">
                      <p className="text-sm font-medium">{item.category}</p>
                    {item.artist 
                    ?<p className="text-gray-500 text-sm">{item.artist}</p>
                    :<p className="text-gray-500 text-sm">{item.manufacturer}</p>
                  }
                  <p className="text-sm font-medium">{item.title}</p>

                      {item.subCategory 
                      ? <p className="text-gray-500 text-sm">{item.subCategory}</p>
                      :<p className="text-gray-500 text-sm">{item.genre}</p>
                    }

                      <p className="text-sm">{Number(item.price).toFixed(2)} lv</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
          }
    </div>
    </div>
  );
}
