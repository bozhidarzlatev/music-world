export default function ShowReview ({
    reviews
})  {

    

    return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {reviews.map(({_id, rating, user, review, pending}) => {
return (
    <div
      className={`p-6 rounded-lg shadow-lg ${
        pending ? "bg-gray-300 animate-pulse" : "bg-white"
      }`}
      key={_id}
    >
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <h3
            className={`text-xl font-semibold ${
              pending ? "text-gray-400" : "text-gray-800"
            }`}
          >
            { user}
          </h3>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => (
              <span
                key={index}
                className={`text-2xl ${
                  pending
                    ? "text-gray-400"
                    : index < rating
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
  
      <p className={`mt-4 ${pending ? "text-gray-400" : "text-gray-600"}`}>
        {review}
      </p>
    </div>
  );
  

                })
            
            }



            </div>
      )
    };
    