import React from 'react'

const TopFooter = () => {
  return (
    <div>
        <div className="flex flex-col md:flex-row justify-around items-center py-10 bg-white">
            <div className="flex flex-col items-center text-center p-4">
                <i className="fas fa-box fa-2x mb-2"></i>
                <h3 className="font-semibold text-lg">Free Shipping</h3>
                <p className="text-gray-600">Free shipping for order above $150</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
                <i className="fas fa-dollar-sign fa-2x mb-2"></i>
                <h3 className="font-semibold text-lg">Money Guarantee</h3>
                <p className="text-gray-600">Within 30 days for an exchange</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
                <i className="fas fa-headset fa-2x mb-2"></i>
                <h3 className="font-semibold text-lg">Online Support</h3>
                <p className="text-gray-600">24 hours a day, 7 days a week</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
                <i className="fas fa-credit-card fa-2x mb-2"></i>
                <h3 className="font-semibold text-lg">Flexible Payment</h3>
                <p className="text-gray-600">Pay with multiple credit cards</p>
            </div>
        </div>
    </div>
  )
}

export default TopFooter