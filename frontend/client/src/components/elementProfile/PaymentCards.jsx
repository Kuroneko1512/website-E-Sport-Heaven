const cards = [
    {
      id: 1,
      type: "MasterCard",
      number: "1234 XX56 7890 55X5",
      logo: "https://storage.googleapis.com/a1aa/image/suLH1JLMYyp8CilN_jY7epab36Hzo-Se2ICAmgFcZG0.jpg",
    },
    {
      id: 2,
      type: "Visa Card",
      number: "1234 XX56 7890 55X5",
      logo: "https://storage.googleapis.com/a1aa/image/9APQfucXUy4C10jtyugjxE3xu0bRakw7XSP60_8lSYo.jpg",
    },
  ];
  
  const PaymentCards = () => {
    return (
      <>
        <button className="bg-black text-white px-6 py-2 rounded-lg mb-6">
          + Add New Card
        </button>
        <div className="space-y-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center">
                <img
                  src={card.logo}
                  alt={`${card.type} logo`}
                  className="mr-4"
                  height="40"
                  width="40"
                />
                <div>
                  <p className="font-bold">{card.type}</p>
                  <p className="text-sm">{card.number}</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg mt-2 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 dark:border-gray-500">
                <i className="fas fa-trash-alt mr-2"></i>
                Delete
              </button>
            </div>
          ))}
        </div>
      </>
    );
  };
  
  export default PaymentCards;  