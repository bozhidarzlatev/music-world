export default function ShowReview ({
    reviews
})  {

    console.log(`tova`, reviews);
    

    return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {reviews.map(rev => {
                    return (<div className="bg-white p-6 rounded-lg shadow-lg" key={rev._id}>
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-semibold text-gray-800">{rev.user}</h3>
                            <div className="flex space-x-1">
                                <span className="text-2xl cursor-pointer text-yellow-400">★</span>
                                <span className="text-2xl cursor-pointer text-yellow-400">★</span>
                                <span className="text-2xl cursor-pointer text-yellow-400">★</span>
                                <span className="text-2xl cursor-pointer text-yellow-400">★</span>
                                <span className="text-2xl cursor-pointer text-gray-300">★</span>
                            </div>
                        </div>
                    </div>
    
                    <p className="mt-4 text-gray-600">
                        {rev.review}
                    </p>
                </div>)

                })
            
            }



            </div>
      )
    };
    