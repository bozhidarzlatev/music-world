import CatalogCard from "../../catalog/CatalogCard";

export default function ShowReview({
  reviews
}) {
  // reviews.map(review => review._createdOn date= new Date(review._createdOn).toLocaleDateString())
  // console.log(reviews);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
      {reviews.map(({ _id, rating, user, review, pending, _createdOn, data }) => {
        const date = new Date(_createdOn).toLocaleDateString()
        return (
          <>
            <div className="flex-col space-y-5 ">
              {data && <CatalogCard categoriId={data.categoriId} item={data} />}
              <div
                className={`p-6 rounded-lg shadow-lg  ${pending ? "bg-gray-300 animate-pulse" : "bg-white"
                  }`}
                key={_id}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <h3
                      className={`text-xl font-semibold ${pending ? "text-gray-400" : "text-gray-800"
                        }`}
                    >
                      {user}
                    </h3>

                    <div className="flex justify-around items-center">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, index) => (
                          <span
                            key={index}
                            className="text-2xl text-yellow-400"
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-gray-500 text-sm ml-20">{date}</span>
                    </div>

                  </div>
                </div>

                <p className={`mt-4 ${pending ? "text-gray-400" : "text-gray-600"}`}>
                  {review}
                </p>
              </div>
            </div>
          </>
        );


      })

      }



    </div>
  )
};
