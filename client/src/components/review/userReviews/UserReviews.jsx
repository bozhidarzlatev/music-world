import { useUserReview } from "../../../api/reviewApi";
import ShowReview from "../showReview/ShowReview";

export default function UserReviews() {
    const { reviews } = useUserReview()
    console.log(reviews);
    
    return (
        <div className="min-h-screen bg-gray-200 p-8 ">
            {!reviews
                ? <h1 className="text-3xl font-bold text-center mb-8">No reviews yet</h1>
                :
                <>
                    <h1 className="text-3xl font-bold text-center mb-8">Users reviews!</h1>
                    <ShowReview reviews={reviews} />
                </>
            }
        </div>
    )
}