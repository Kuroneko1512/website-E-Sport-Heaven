import { useState, useEffect } from "react";
import instanceAxios from "../../config/db";

const DealsOfTheMonth = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const response = await instanceAxios.get("/deals"); // API từ db.json
        const endTime = new Date(response.data.endTime).getTime();
        updateCountdown(endTime);
      } catch (error) {
        console.error("Error fetching time data:", error);
      }
    };

    const updateCountdown = (endTime) => {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = endTime - now;

        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
          return;
        }

        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }, 1000);
    };

    fetchTime();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl font-bold mb-4">Deals of the Month</h1>
          <p className="text-gray-600 mb-6">
            It is a long established fact that a reader will be distracted by the readable content.
          </p>
          <div className="flex justify-center lg:justify-start space-x-4 mb-6">
            {[{ label: "Days", value: timeLeft.days }, { label: "Hours", value: timeLeft.hours }, { label: "Mins", value: timeLeft.mins }, { label: "Secs", value: timeLeft.secs }].map((item, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
          <button className="bg-black text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-800 transition duration-300 flex items-center">
            View All Products
            <span className="ml-2">→</span>
          </button>
        </div>
        <div className="lg:w-1/2 mt-8 lg:mt-0">
          <img
            src="https://storage.googleapis.com/a1aa/image/WiGcjCEUwL5nPqYyQZFWhgRoq051xsCUJS6w8IKcpMA.jpg"
            alt="A woman wearing a stylish black hat"
            className="w-full rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
}

export default DealsOfTheMonth