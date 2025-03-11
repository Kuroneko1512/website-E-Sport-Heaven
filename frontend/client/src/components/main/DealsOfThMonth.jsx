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
    <div className="container mx-auto px-4 py-12 bg-gray-50 dark:bg-gray-800">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Deals of the Month
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            It is a long established fact that a reader will be distracted by the readable content.
          </p>
          <div className="flex justify-center lg:justify-start space-x-4 mb-6">
            {["Days", "Hours", "Mins", "Secs"].map((label, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 rounded-lg p-4 w-16 h-16 flex flex-col items-center"
              >
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Object.values(timeLeft)[index]}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <button className="bg-black dark:bg-gray-700 text-white dark:text-gray-300 px-6 py-3 rounded-lg shadow-md hover:bg-gray-800 dark:hover:bg-gray-600 transition duration-300">
            View All Products →
          </button>
        </div>
        <div className="lg:w-1/2">
          <img
            src="https://storage.googleapis.com/a1aa/image/WiGcjCEUwL5nPqYyQZFWhgRoq051xsCUJS6w8IKcpMA.jpg"
            alt="Fashion Model"
            className="w-full rounded-lg shadow-md dark:shadow-gray-700"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export default DealsOfTheMonth;
